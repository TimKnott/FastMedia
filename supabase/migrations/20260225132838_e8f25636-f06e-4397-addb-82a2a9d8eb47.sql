-- Reset admin password
UPDATE auth.users
SET encrypted_password = crypt('Admin2025!', gen_salt('bf'))
WHERE email = 'admin@fastmedia.pro';