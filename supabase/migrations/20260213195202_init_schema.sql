-- =====================================================
-- Single clean migration for users, bookmarks, triggers, and RLS
-- =====================================================

-- ------------------------------
-- Users table
-- ------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  google_id text unique,
  created_at timestamp with time zone default now()
);

-- ------------------------------
-- Bookmarks table
-- ------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  title text,
  created_at timestamp with time zone default now()
);

-- Index on bookmarks.user_id
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);

-- ------------------------------
-- Trigger: insert into users on new auth user
-- ------------------------------
-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create or replace function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id, email, name, google_id, created_at
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'sub',
    now()
  );
  return new;
end;
$$;

-- Create trigger
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ------------------------------
-- Enable RLS
-- ------------------------------
alter table public.users enable row level security;
alter table public.bookmarks enable row level security;

-- ------------------------------
-- Users RLS Policies
-- ------------------------------
drop policy if exists "Users can read own profile" on public.users;

create policy "Users can read own profile"
on public.users
for select
using (auth.uid() = id);

-- ------------------------------
-- Bookmarks RLS Policies
-- ------------------------------
drop policy if exists "Users can read own bookmarks" on public.bookmarks;
create policy "Users can read own bookmarks"
on public.bookmarks
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own bookmarks" on public.bookmarks;
create policy "Users can insert own bookmarks"
on public.bookmarks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookmarks" on public.bookmarks;
create policy "Users can update own bookmarks"
on public.bookmarks
for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own bookmarks" on public.bookmarks;
create policy "Users can delete own bookmarks"
on public.bookmarks
for delete
using (auth.uid() = user_id);
