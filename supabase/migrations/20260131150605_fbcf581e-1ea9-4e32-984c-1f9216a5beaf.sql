-- Improve handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  sanitized_name text;
BEGIN
  -- Sanitize and validate full_name: limit length to 100 chars, trim whitespace
  sanitized_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- If name is empty or too long, use email prefix as fallback
  IF length(sanitized_name) > 100 OR length(trim(sanitized_name)) = 0 THEN
    sanitized_name := split_part(NEW.email, '@', 1);
  ELSE
    sanitized_name := trim(sanitized_name);
  END IF;
  
  -- Additional safety: ensure we have a valid name
  IF length(sanitized_name) = 0 THEN
    sanitized_name := NEW.email;
  END IF;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    substring(sanitized_name, 1, 100)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user registration
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;