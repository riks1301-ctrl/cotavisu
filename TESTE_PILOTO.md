# Roteiro de teste E2E — Piloto CotaVisu

**Commit:** `610ed30` · **Produção:** https://cotavisu.vercel.app

Use duas contas (ou duas abas anônimas + normal) para simular comprador e fornecedor.

---

## Pré-requisitos

- [ ] Migration `supabase/migration-pilot.sql` executada no Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada na Vercel
- [ ] `PILOT_NOTIFY_STATES=PR` na Vercel (e-mails de novo pedido só em PR)
- [ ] Deploy `610ed30` ativo em produção

---

## Conta A — Comprador

| Campo | Sugestão teste |
|-------|----------------|
| E-mail | `comprador.teste+cotavisu@gmail.com` |
| Senha | `teste123456` |
| Nome | `Loja Teste Curitiba` |

## Conta B — Fornecedor

| Campo | Sugestão teste |
|-------|----------------|
| E-mail | `grafica.teste+cotavisu@gmail.com` |
| Senha | `teste123456` |
| Empresa | `Gráfica Piloto PR` |
| WhatsApp | `(41) 99999-0001` (número real seu para validar handoff) |

---

## Fluxo (≈15 min)

### 1. Fornecedor — perfil

1. Cadastro em `/cadastro` → tipo **Fornecedor**
2. Login → `/perfil`
3. Preencher: empresa, WhatsApp, cidade **Curitiba**, UF **PR**, serviços
4. Salvar

**Esperado:** perfil salvo sem erro.

### 2. Comprador — publicar pedido

1. Cadastro em `/cadastro` → tipo **Comprador** (aba anônima ou outro browser)
2. Login → `/pedidos/novo`
3. Sem login, ao publicar deve redirecionar para login (testar se quiser)
4. Criar pedido: ex. **Adesivo** → medidas 10×10 cm → 100 un → **Curitiba/PR**
5. Publicar

**Esperado:** redirect para `/pedidos/[id]`; pedido com `buyer_id` preenchido.

### 3. Fornecedor — proposta

1. Login conta B → `/pedidos`
2. Abrir pedido de Curitiba (badge “Sua região” se fornecedor PR)
3. Enviar proposta: R$ 450,00 · 5 dias · condições PIX

**Esperado:** “Proposta enviada!”; sem WhatsApp no feed público.

### 4. Comprador — comparar e aceitar

1. Login conta A → `/pedidos/[id]`
2. Ver tabela com proposta da Gráfica Piloto PR
3. Clicar **Aceitar** → modal com WhatsApp + checkbox LGPD
4. Informar WhatsApp real → **Confirmar e conectar**

**Esperado:**
- Pedido status **Fechado**
- Botão **Abrir WhatsApp** visível
- Clique abre `wa.me` com mensagem pré-preenchida

### 5. Fornecedor — pós-aceite

1. Login conta B → mesmo `/pedidos/[id]`
2. Ver pedido fechado; formulário de nova proposta oculto

**Esperado:** e-mail “Proposta aceita” (se Resend configurado).

---

## Checklist Go/No-Go

| # | Teste | OK |
|---|--------|-----|
| 1 | `/termos` e `/privacidade` abrem | ☐ |
| 2 | Publicar pedido exige login | ☐ |
| 3 | Proposta exige WhatsApp no `/perfil` | ☐ |
| 4 | Aceite só pelo dono do pedido | ☐ |
| 5 | WhatsApp só após aceite | ☐ |
| 6 | `wa.me` abre com mensagem correta | ☐ |
| 7 | Home sem stats fake (4.8 / 100+) | ☐ |
| 8 | `/admin` bloqueia usuário comum | ☐ |

---

## Problemas comuns

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| Aceite retorna 500 | RPC `accept_proposal` não migrada | Rodar `migration-accept-rpc.sql` |
| Sem botão WhatsApp | Coluna `whatsapp` ausente | Rodar `migration-pilot.sql` |
| E-mail não chega | Resend / `profiles.email` | Verificar env + migration e-mail |
| “Acesso negado” no aceite | Pedido antigo sem `buyer_id` | Criar pedido novo logado |

---

## Métricas do piloto (30 dias)

- Pedidos PR publicados: ___
- Pedidos com ≥1 proposta em 48h: ___%
- Aceites com clique WhatsApp: ___
- Gráficas ativas em Curitiba: ___
