-- Piloto: WhatsApp e contato pós-aceite
-- Execute no Supabase SQL Editor

ALTER TABLE supplier_profiles
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- E-mail em profiles (notificações)
UPDATE profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
