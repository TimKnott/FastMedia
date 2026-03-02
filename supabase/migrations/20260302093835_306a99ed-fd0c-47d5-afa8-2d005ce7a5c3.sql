-- Drop the old permissive INSERT policy that doesn't have file type validation
-- The new "Only allow image file types" policy already includes the super_admin check
DROP POLICY IF EXISTS "Super admins can upload site images" ON storage.objects;