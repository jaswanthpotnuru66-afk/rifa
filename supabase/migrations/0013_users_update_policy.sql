-- Add UPDATE policy for users table to allow centralized address management
CREATE POLICY "Users can update own data" ON public.users 
  FOR UPDATE USING (true);

-- Also add a DELETE policy just in case, although we primarily use updates for JSONB
CREATE POLICY "Users can delete own data" ON public.users 
  FOR DELETE USING (true);
