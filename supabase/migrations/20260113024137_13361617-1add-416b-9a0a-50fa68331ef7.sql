-- Fix the handle_new_user trigger to properly create profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_owner boolean;
BEGIN
  -- Check if this is the platform owner
  is_owner := (NEW.email = 'tania@virtualopsassist.com');
  
  INSERT INTO public.profiles (
    user_id, 
    email, 
    display_name, 
    role,
    tier_selected,
    selected_tier,
    subscription_confirmed,
    subscription_tier
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_owner THEN 'owner' ELSE 'user' END,
    is_owner, -- owner has tier_selected = true
    CASE WHEN is_owner THEN 'owner' ELSE NULL END,
    is_owner, -- owner has subscription_confirmed = true
    CASE WHEN is_owner THEN 'owner' ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name);
  
  -- If owner, also add to user_roles
  IF is_owner THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;