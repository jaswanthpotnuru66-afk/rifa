-- Add new columns to profiles
alter table public.profiles add column if not exists mobile_number text;
alter table public.profiles add column if not exists location text;

-- Update the trigger function to include new metadata fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, mobile_number, location)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'mobile_number',
    new.raw_user_meta_data->>'location'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Function for a user to delete their own account
-- Note: 'security definer' allows the function to bypass the normal restriction 
-- that a user cannot delete themselves via the client SDK.
create or replace function public.delete_user()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
