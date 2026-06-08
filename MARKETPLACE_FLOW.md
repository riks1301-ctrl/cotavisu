# MARKETPLACE_FLOW.md
## Fluxo Completo de Transação — CotaVisu

---

## 1. PEDIDO CRIADO

**Quem faz:** Comprador (autenticado ou anônimo)  
**Onde:** `POST /pedidos/novo` → botão "Publicar pedido"

### O que acontece no banco

| Tabela | Operação | Campos alterados |
|---|---|---|
| `service_requests` | **INSERT** | `id`, `buyer_id`, `service_type`, `category`, `width_m`, `height_m`, `quantity`, `city`, `state`, `deadline_days`, `description`, `status = 'open'`, `expires_at = now() + 7 days`, `created_at` |

### Notificação disparada (fire-and-forget)

```
POST /api/notify-proposal { type: "new_request", requestId }
  → Busca fornecedores ativos (supplier_profiles.is_active = true)
  → Busca e-mails em profiles.email
  → Envia até 50 e-mails em lotes de 10 via Resend
```

**Nenhum banco é alterado nesta etapa de notificação.**

---

## 2. FORNECEDOR RECEBE O PEDIDO

**Quem faz:** Sistema (e-mail) + Fornecedor (feed)  
**Onde:** `/pedidos` (feed) ou e-mail recebido

### O que acontece no banco

| Tabela | Operação | Campos alterados |
|---|---|---|
| Nenhuma | — | Feed é uma leitura: `SELECT * FROM service_requests WHERE status = 'open'` |

### Lógica de priorização geográfica

```
Ordenação client-side:
  pedidos onde req.state === userProfile.state → aparecem primeiro
  badge "Sua região" exibido visualmente
```

---

## 3. FORNECEDOR ENVIA PROPOSTA

**Quem faz:** Fornecedor (autenticado, role = 'supplier')  
**Onde:** `/pedidos/[id]` → formulário `PropostaForm`

### Pré-condições verificadas

- Usuário autenticado
- `supplier_profiles` existente ou criado automaticamente
- `UNIQUE(request_id, supplier_id)` impede duplicata

### O que acontece no banco

| Tabela | Operação | Campos alterados |
|---|---|---|
| `supplier_profiles` | **UPSERT** (se não existir) | `user_id`, `company_name`, `is_active = true` |
| `proposals` | **INSERT** | `id`, `request_id`, `supplier_id`, `price_total`, `delivery_days`, `payment_terms`, `notes`, `status = 'pending'`, `created_at` |

### Notificação disparada (fire-and-forget)

```
POST /api/notify-proposal { type: "new_proposal", proposalId, requestId }
  → Busca buyer_id do pedido
  → Busca profiles.email do comprador
  → Envia 1 e-mail via Resend
```

---

## 4. COMPRADOR RECEBE NOTIFICAÇÃO

**Quem recebe:** Comprador (e-mail)  
**Conteúdo:** Nome do fornecedor, preço, prazo, link para o pedido

### O que acontece no banco

| Tabela | Operação | Campos alterados |
|---|---|---|
| Nenhuma | — | Notificação não grava nada no banco |

> **Nota MVP:** não há tabela de notificações registradas. Em escala futura,
> criar `notifications` para rastrear entrega e leitura.

---

## 5. COMPRADOR ACEITA PROPOSTA

**Quem faz:** Comprador (autenticado, dono do pedido)  
**Onde:** `/pedidos/[id]` → botão "Aceitar" na tabela comparativa  
**Backend:** `POST /api/accept-proposal { proposalId, requestId }`

### Sequência de operações (em ordem)

```
1. SELECT service_requests WHERE id = requestId
   → Verifica status != 'closed'  (guard contra race condition)

2. SELECT proposals WHERE id = proposalId AND request_id = requestId
   → Verifica status != 'accepted'  (guard contra duplo clique)

3. UPDATE proposals SET status = 'accepted', accepted_at = now()
   WHERE id = proposalId

4. UPDATE proposals SET status = 'rejected'
   WHERE request_id = requestId AND id != proposalId

5. UPDATE service_requests SET status = 'closed'
   WHERE id = requestId

6. SELECT profiles WHERE id = supplier.user_id → busca e-mail
7. sendProposalAcceptedEmail() via Resend
```

### O que muda no banco

| Tabela | Operação | Campos alterados |
|---|---|---|
| `proposals` | **UPDATE** (proposta aceita) | `status = 'accepted'`, `accepted_at = timestamp` |
| `proposals` | **UPDATE** (demais propostas) | `status = 'rejected'` |
| `service_requests` | **UPDATE** | `status = 'closed'` |

### Resultado visual para o comprador

```
✓ Banner verde: "Pedido fechado com sucesso!"
✓ Tabela: proposta aceita com badge verde "✓ Aceita"
✓ Demais propostas com badge "Não selecionada" (opacidade reduzida)
✓ Formulário de nova proposta desaparece
✓ Status do pedido muda de "Aberto" para "Fechado"
```

---

## 6. FORNECEDOR É AVISADO

**Quem recebe:** Fornecedor (e-mail)  
**Conteúdo:** Serviço, valor, nome do comprador, link para o pedido

### O que acontece no banco

| Tabela | Operação | Campos alterados |
|---|---|---|
| Nenhuma | — | Apenas leitura para montar o e-mail |

---

## DIAGRAMA COMPLETO

```
COMPRADOR                    SISTEMA                      FORNECEDOR
─────────                    ───────                      ──────────

[Cria pedido]
     │
     ▼
INSERT service_requests
  status = 'open'
     │
     ▼
POST /api/notify-proposal    ──────────────────────────► [Recebe e-mail]
  type: new_request                                            │
                                                              ▼
                                                    GET /pedidos (feed)
                                                    [Vê pedido no feed]
                                                              │
                                                              ▼
                                                    [Envia proposta]
                                                              │
                                                              ▼
                             INSERT proposals ◄──────────────┘
                               status = 'pending'
                                     │
                                     ▼
                             POST /api/notify-proposal
                               type: new_proposal
                                     │
[Recebe e-mail] ◄────────────────────┘
     │
     ▼
[Acessa /pedidos/[id]]
[Vê tabela comparativa]
[Clica "Aceitar"]
     │
     ▼
POST /api/accept-proposal
     │
     ├─► UPDATE proposals (aceita)   status = 'accepted', accepted_at = now
     ├─► UPDATE proposals (demais)   status = 'rejected'
     └─► UPDATE service_requests     status = 'closed'
                                           │
                                           ▼
                             sendProposalAcceptedEmail()
                                           │
                             [Recebe e-mail] ◄──────────────── FORNECEDOR
```

---

## ESTADO FINAL DO BANCO APÓS TRANSAÇÃO COMPLETA

```sql
-- Pedido
SELECT status FROM service_requests WHERE id = :id;
-- → 'closed'

-- Proposta aceita
SELECT status, accepted_at FROM proposals WHERE id = :accepted_id;
-- → status: 'accepted', accepted_at: '2026-06-08T...'

-- Propostas recusadas
SELECT status FROM proposals WHERE request_id = :id AND id != :accepted_id;
-- → status: 'rejected' (todas)
```

---

## ANÁLISE DE SEGURANÇA

### Como evita duas propostas aceitas simultaneamente

O sistema usa **verificação em série** (não transação atômica):

```
Step 1: SELECT status do pedido
  → Se 'closed': retorna 409 imediatamente

Step 2: SELECT status da proposta
  → Se 'accepted': retorna 409 imediatamente

Step 3: UPDATE proposta para 'accepted'
Step 4: UPDATE pedido para 'closed'
```

**Limitação real:** em cenário de duas requisições simultâneas (race condition),
ambas podem passar pelo Step 1 e Step 2 antes de qualquer UPDATE ser executado.
O resultado seria duas propostas aceitas.

**Solução para produção:** usar `UPDATE ... WHERE status = 'open' RETURNING id`
no próprio UPDATE — se retornar 0 linhas, a operação falhou (pedido já fechado).
Isso é uma transação implícita e o PostgreSQL garante atomicidade por operação.

**Por que não foi implementado assim agora:** o Supabase JS SDK não expõe
facilmente `UPDATE ... RETURNING` com verificação de rows afetadas em uma única
chamada. A solução atual é adequada para o MVP com volume baixo.

### Como protege o SERVICE_ROLE_KEY

```typescript
// A chave nunca vai para o browser
// SUPABASE_SERVICE_ROLE_KEY não tem prefixo NEXT_PUBLIC_
// → nunca é injetada no bundle do cliente pelo Next.js

// Fallback para anon key em desenvolvimento local
process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Na Vercel, service_role é configurada como variável de servidor
// (sem marcar "Expose to browser")
```

**Risco atual:** o fallback para `anon_key` em caso de ausência da `service_role_key`
significa que o aceite funcionará parcialmente em dev, mas em produção sem a chave
configurada, o RLS pode bloquear as operações de UPDATE. O comportamento correto
seria retornar erro explícito se service_role não estiver disponível.

### O que acontece se o Resend falhar

```typescript
// Em lib/emails/index.ts — todos os métodos:
if (error) safeLog("sendXxx erro", error)
// → Erro é logado mas NÃO é lançado (throw)
// → A função retorna undefined silenciosamente

// Em accept-proposal/route.ts:
await sendProposalAcceptedEmail(...)
// → Se falhar, o erro é capturado internamente no módulo de e-mail
// → A resposta { success: true } é enviada normalmente
// → O aceite JÁ FOI GRAVADO no banco antes da tentativa de e-mail
// → O fornecedor não recebe o e-mail, mas o negócio está fechado

// Em proposta-form.tsx e pedidos/novo:
fetch("/api/notify-proposal", ...).catch(() => {})
// → Fire-and-forget: falha silenciosa, não bloqueia a UI
```

**Consequência:** o e-mail pode não chegar, mas o estado do banco é sempre
consistente. O aceite não depende do e-mail para ser válido.

**Recomendação futura:** implementar fila de reenvio (ex: Supabase Edge Function
com retry) e tabela `email_logs` para rastrear falhas.
