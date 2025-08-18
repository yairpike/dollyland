-- Update user registration system to assign roles based on invites

-- Create function to handle new user registration with role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_with_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invite_record RECORD;
    creator_role app_role;
BEGIN
    -- Check if user signed up with an invite code (stored in user metadata)
    IF NEW.raw_user_meta_data ? 'invite_used' THEN
        -- Find the invite that was used
        SELECT * INTO invite_record
        FROM public.invites
        WHERE email = NEW.email
        AND used_by = NEW.id;
        
        IF FOUND THEN
            -- Get the role of the person who created the invite
            SELECT public.get_user_role(invite_record.created_by) INTO creator_role;
            
            -- Assign role based on who created the invite
            IF creator_role = 'god' THEN
                -- God's invites get gods_friends role
                INSERT INTO public.user_roles (user_id, role, assigned_by)
                VALUES (NEW.id, 'gods_friends', invite_record.created_by);
            ELSE
                -- Other invites get user role
                INSERT INTO public.user_roles (user_id, role, assigned_by)
                VALUES (NEW.id, 'user', invite_record.created_by);
            END IF;
        ELSE
            -- No invite found, assign default user role
            INSERT INTO public.user_roles (user_id, role)
            VALUES (NEW.id, 'user');
        END IF;
    ELSE
        -- No invite metadata, assign default user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_with_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_with_roles
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_with_roles();

-- Update the use_invite function to mark invite as used and store metadata
CREATE OR REPLACE FUNCTION public.use_invite(p_email text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.invites
    SET 
        used_by = p_user_id,
        used_at = now(),
        updated_at = now()
    WHERE email = lower(p_email)
        AND used_at IS NULL;
END $$;