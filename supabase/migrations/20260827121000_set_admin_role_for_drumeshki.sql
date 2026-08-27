UPDATE public.profiles
SET role = 'admin'
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'drumeshki@gmail.com'
);