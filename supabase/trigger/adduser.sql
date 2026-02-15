-- Create function that runs when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (
    id,
    email,
    name,
    google_id,
    created_at
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

-- Attach trigger to auth.users table
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
