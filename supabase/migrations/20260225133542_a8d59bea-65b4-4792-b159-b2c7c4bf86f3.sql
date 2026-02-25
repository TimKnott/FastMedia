UPDATE auth.users
SET encrypted_password = crypt('Admin2026!Secure', gen_salt('bf'))
WHERE email = 'admin@fastmedia.pro';