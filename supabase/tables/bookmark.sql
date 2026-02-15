create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  url text not null,
  title text,

  created_at timestamp with time zone default now()
);

create index bookmarks_user_id_idx
on public.bookmarks(user_id);
