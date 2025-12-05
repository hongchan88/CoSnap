-- Update profile creation trigger to match current schema
-- This trigger fires when new user is inserted into auth.users

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_profile();

-- Create function to handle profile creation with all current schema fields
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    profile_id,
    username,
    role,
    focus_score,
    focus_tier,
    cocredit_balance,
    camera_gear,
    styles,
    languages,
    bio,
    avatar_url,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'free',
    0,
    'Blurry',
    0,
    NULL, -- camera_gear
    ARRAY[]::TEXT[], -- styles (empty array)
    ARRAY[]::TEXT[], -- languages (empty array)
    NULL, -- bio
    NULL, -- avatar_url
    false, -- is_verified
    NOW(), -- created_at
    NOW() -- updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user is created
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_profile();

-- Comment: This ensures every new auth user gets a corresponding profile record
-- with all required fields populated according to current schema.ts