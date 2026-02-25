-- Create editor user via auth admin and assign role
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'editor@fastmedia.pro',
    crypt('Editor2025!', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '', '', '', ''
  )
  RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    'editor@fastmedia.pro',
    jsonb_build_object('sub', new_user_id::text, 'email', 'editor@fastmedia.pro'),
    'email',
    now(),
    now(),
    now()
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'editor');
END $$;