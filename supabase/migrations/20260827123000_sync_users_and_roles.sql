-- Ensure role column exists and supports only registered/admin.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'registered';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('registered', 'admin'));
  END IF;
END
$$;

-- Backfill missing profiles from auth.users.
INSERT INTO public.profiles (user_id, role)
SELECT
  u.id,
  CASE
    WHEN lower(COALESCE(u.email, '')) = 'drumeshki@gmail.com' THEN 'admin'
    WHEN lower(COALESCE(u.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin'
    ELSE 'registered'
  END AS role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Sync existing profiles role with auth.users (email/app_metadata based rule).
UPDATE public.profiles p
SET
  role = CASE
    WHEN lower(COALESCE(u.email, '')) = 'drumeshki@gmail.com' THEN 'admin'
    WHEN lower(COALESCE(u.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin'
    ELSE 'registered'
  END,
  updated_at = now()
FROM auth.users u
WHERE u.id = p.user_id
  AND p.role IS DISTINCT FROM CASE
    WHEN lower(COALESCE(u.email, '')) = 'drumeshki@gmail.com' THEN 'admin'
    WHEN lower(COALESCE(u.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin'
    ELSE 'registered'
  END;

-- Keep profiles synchronized when auth.users changes.
CREATE OR REPLACE FUNCTION public.sync_profile_role_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (
    NEW.id,
    CASE
      WHEN lower(COALESCE(NEW.email, '')) = 'drumeshki@gmail.com' THEN 'admin'
      WHEN lower(COALESCE(NEW.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin'
      ELSE 'registered'
    END
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_role_from_auth_user_on_insert ON auth.users;
CREATE TRIGGER sync_profile_role_from_auth_user_on_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_from_auth_user();

DROP TRIGGER IF EXISTS sync_profile_role_from_auth_user_on_update ON auth.users;
CREATE TRIGGER sync_profile_role_from_auth_user_on_update
AFTER UPDATE OF email, raw_app_meta_data ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_from_auth_user();