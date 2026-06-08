-- ============================================================
-- MIGRATION: accept_proposal — RPC transacional com lock exclusivo
-- Acesso restrito a service_role apenas (chamada server-side)
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Adiciona closed_at em service_requests
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- 2. Função RPC transacional
CREATE OR REPLACE FUNCTION accept_proposal(
  p_proposal_id UUID,
  p_request_id  UUID,
  p_buyer_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request         RECORD;
  v_proposal_status TEXT;
BEGIN

  -- Lock exclusivo na linha do pedido.
  -- Segunda chamada simultânea bloqueia aqui até a primeira fazer
  -- commit ou rollback. Quando desbloqueada, lê o status já atualizado.
  SELECT id, status, buyer_id
    INTO v_request
    FROM service_requests
   WHERE id = p_request_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Pedido não encontrado'
    );
  END IF;

  -- Validação de propriedade no banco (segunda camada após API route)
  IF v_request.buyer_id IS DISTINCT FROM p_buyer_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado'
    );
  END IF;

  -- Pedido deve estar exatamente em 'open'
  -- Bloqueia: closed, reviewing, cancelled ou qualquer outro status
  IF v_request.status != 'open' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Pedido não está aberto (status atual: ' || v_request.status || ')'
    );
  END IF;

  -- Valida proposta
  SELECT status
    INTO v_proposal_status
    FROM proposals
   WHERE id = p_proposal_id
     AND request_id = p_request_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposta não encontrada ou não pertence a este pedido'
    );
  END IF;

  IF v_proposal_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposta não está pendente (status atual: ' || v_proposal_status || ')'
    );
  END IF;

  -- ── Operações atômicas ─────────────────────────────────────
  -- Se qualquer UPDATE falhar, PostgreSQL faz rollback de todos.

  UPDATE proposals
     SET status      = 'accepted',
         accepted_at = NOW()
   WHERE id = p_proposal_id;

  UPDATE proposals
     SET status = 'rejected'
   WHERE request_id = p_request_id
     AND id != p_proposal_id;

  UPDATE service_requests
     SET status    = 'closed',
         closed_at = NOW()
   WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success',   true,
    'closed_at', NOW()::TEXT
  );

END;
$$;

-- 3. Permissões: apenas service_role pode executar
--    Usuários anon e authenticated não têm acesso direto à função.
--    Toda chamada passa obrigatoriamente pela API route server-side.
REVOKE EXECUTE ON FUNCTION accept_proposal(UUID, UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION accept_proposal(UUID, UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION accept_proposal(UUID, UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION accept_proposal(UUID, UUID, UUID) TO service_role;
