-- Drop the trigger on auth.users that references the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function that created profiles
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the legacy profiles table (this automatically drops its associated RLS policies)
DROP TABLE IF EXISTS public.profiles;
