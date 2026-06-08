-- Migração: fechar ciclo de aceite de proposta
-- Execute no Supabase SQL Editor

-- 1. Adiciona campo accepted_at na tabela proposals
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- 2. Garante que status da proposta cobre todos os casos
-- (já existe: pending, accepted, rejected — OK)

-- 3. Adiciona política para comprador poder atualizar propostas do próprio pedido
CREATE POLICY IF NOT EXISTS "buyer can update proposals on own request"
  ON proposals FOR UPDATE
  USING (
    request_id IN (
      SELECT id FROM service_requests WHERE buyer_id = auth.uid()
    )
  );

-- 4. Garante que o comprador pode atualizar o próprio pedido
DROP POLICY IF EXISTS "buyer can update own request" ON service_requests;
CREATE POLICY "buyer can update own request"
  ON service_requests FOR UPDATE
  USING (buyer_id = auth.uid() OR buyer_id IS NULL);

-- 5. Índices para performance no feed do fornecedor
CREATE INDEX IF NOT EXISTS idx_service_requests_status_city
  ON service_requests(status, city, state, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_request_id
  ON proposals(request_id, status);

-- 6. Adiciona email na tabela profiles (para envio de notificações)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Popula email dos profiles a partir do auth.users
UPDATE profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
  AND p.email IS NULL;

-- Trigger para manter email sincronizado
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sync_profile_email();
