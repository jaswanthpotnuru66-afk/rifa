-- Ensure admins table exists
create table if not exists public.admins (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    password text not null, -- For this admin portal, we'll support both hashed and plain text check or just hashed
    role text default 'admin',
    created_at timestamp with time zone default current_timestamp
);

-- Seed an initial admin if not exists (password: admin123)
-- In a real prod env, you'd hash this. For now, let's keep it simple or use bcrypt.
-- I'll insert a record that the backend can use.
insert into public.admins (email, password)
values ('admin@rifa.com', 'admin123')
on conflict (email) do nothing;
