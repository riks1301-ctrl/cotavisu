# CotaVisu — Resumo Técnico Completo

## Visão Geral

**Produto:** Plataforma SaaS marketplace B2B para o setor de comunicação visual  
**Modelo:** Comparador de orçamentos (estilo Melhor Câmbio / GetNinjas aplicado a gráficas)  
**URL produção:** https://cotavisu.vercel.app  
**Repositório:** https://github.com/riks1301-ctrl/cotavisu  
**Status:** MVP funcional em produção (beta)

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.7 |
| Linguagem | TypeScript | 5.x |
| UI | shadcn/ui + TailwindCSS | 4.x |
| Componentes base | @base-ui/react | — |
| Ícones | lucide-react | — |
| Banco de dados | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth (JWT) | — |
| IA | Anthropic SDK (Claude Haiku) | — |
| Deploy | Vercel (produção) | — |
| Fonte de imagens | Unsplash (externas) + /public/images (locais) | — |

---

## Principais Funcionalidades

### Para Compradores
- Criar pedido de orçamento em 5 etapas guiadas
- Sugestão automática por IA (descreve em texto → IA sugere categoria/serviço/medidas)
- Medidas em centímetros com conversão automática para m²
- Estimativa de preço em tempo real com breakdown (total / por m² / por unidade)
- Cards de preço estilo iFood (mais barato, mais rápido, melhor avaliado)
- Comparar propostas recebidas lado a lado
- Aceitar proposta e contatar fornecedor
- Painel "Meus Pedidos"
- Pedidos PDV com múltiplos itens (kit de materiais de loja)

### Para Fornecedores
- Feed de pedidos abertos filtrado por região
- Enviar proposta com preço, prazo, condições e observações
- Perfil público com avaliações e badge verificado
- Dashboard com pedidos disponíveis

### Modo Prateleira (Admin)
- Sistema funciona mesmo sem fornecedores ativos
- Estimativas automáticas baseadas em serviços padrão cadastrados
- Exibidas como "Preço estimado" com contexto claro para o usuário
- 8 serviços padrão + 5 produtos de referência pré-cadastrados

### Painel Admin
- Dashboard com métricas (pedidos, propostas, fornecedores, usuários)
- CRUD de serviços padrão (nome, preço base, fórmula, prazo)
- CRUD de produtos de prateleira
- Toggle ativar/desativar sem excluir

---

## Categorias de Serviço

1. **PDV — Materiais de Loja** ← diferencial exclusivo
   - 10 itens: Wobbler, Clip Strip, Régua de Gôndola, Totem, Cubo Promocional,
     Mobile Suspenso, Display de Balcão, Testeira, Take One, Stopper de Gôndola
   - Fluxo de kit múltiplo: seleciona vários itens, configura cada um separado

2. **Adesivos** — Impresso, Recortado (Plotter), Envelopamento Veicular
3. **Banners e Lonas** — Banner, Lona para Fachada
4. **Fachadas e ACM** — Placa em ACM, Placa em PVC ou PS, Letra Caixa
5. **Plotagem** — Plantas, Adesivo de Corte
6. **Luminosos** — Painel Luminoso
7. **Impressão Digital** — Em Papel, Em Rígido (UV)

**Materiais disponíveis:** PVC (0,5mm a 10mm) e PS (0,5mm a 3mm) em todos os itens relevantes

---

## Fluxo de Pedidos

```
Comprador acessa /pedidos/novo
    ↓
[Opcional] IA analisa descrição → sugere categoria/serviço/medidas
    ↓
Step 1: Seleciona categoria
    ↓ (se PDV → fluxo especial com múltiplos itens)
Step 2: Seleciona serviço específico
    ↓
Step 3: Configura especificações (material, laminação, acabamento, etc.)
    ↓
Step 4: Informa medidas em CM + quantidade
         → Mostra estimativa de preço (total + por m²)
         → Mostra cards de faixa de mercado (barato/rápido/avaliado)
    ↓
Step 5: Cidade, estado, prazo, observações + resumo final
    ↓
Pedido salvo no Supabase (status: open, expira em 7 dias)
    ↓
Redireciona para /pedidos/[id] (comparador)
```

---

## Fluxo de Propostas

```
Fornecedor acessa /pedidos (feed de pedidos abertos)
    ↓
Seleciona pedido de interesse
    ↓
Na página do pedido: vê detalhes + scroll até formulário de proposta
    ↓
Preenche: preço total, prazo de entrega, condições, observações
    ↓
Proposta salva no banco (status: pending)
    → UNIQUE constraint: 1 proposta por fornecedor por pedido
    ↓
Comprador vê proposta no comparador (/pedidos/[id])
    → Badges automáticos: "Menor preço" / "Menor prazo"
    → Estrelas e badge "Verificado" do fornecedor
    ↓
Comprador clica "Aceitar proposta" → contato direto
```

---

## Fluxo de Usuários

```
CADASTRO:
/cadastro → Seleciona papel (Comprador / Fornecedor)
          → supabase.auth.signUp() com metadata {name, role}
          → Trigger on_auth_user_created cria registro em profiles
          → E-mail de confirmação enviado
          → Redireciona para /login

LOGIN:
/login → supabase.auth.signInWithPassword()
       → Redireciona para /dashboard
       → Navbar detecta sessão e exibe nome + botão Sair

DASHBOARD:
  Comprador → mostra pedidos criados + CTA "Novo pedido"
  Fornecedor → mostra pedidos abertos + CTA "Ver pedidos"
  Admin → acesso a /admin

LOGOUT:
  Navbar → supabase.auth.signOut() → redirect para /
```

---

## Módulos Existentes

| Módulo | Arquivos | Status |
|--------|---------|--------|
| Auth (login/cadastro) | app/login, app/cadastro, lib/auth.ts | ✅ Funcional |
| Dashboard | app/dashboard | ✅ Funcional |
| Pedidos (lista) | app/pedidos | ✅ Funcional |
| Criar pedido | app/pedidos/novo | ✅ Funcional |
| Comparador | app/pedidos/[id] | ✅ Funcional |
| Meus pedidos | app/meus-pedidos | ✅ Funcional |
| Propostas | components/proposta-form.tsx | ✅ Funcional |
| PDV Builder | components/pdv-builder.tsx | ✅ Funcional |
| Sugestão por IA | app/api/sugerir-pedido, components/ai-suggestion.tsx | ✅ Funcional |
| Modo prateleira | lib/db.ts (calculateEstimates) | ✅ Funcional |
| Admin | app/admin | ✅ Funcional |
| Fornecedores | app/fornecedores | ✅ Funcional |
| Trust badges | components/trust-badges.tsx | ✅ Funcional |
| Urgency bar | components/urgency-bar.tsx | ✅ Funcional |
| Cards de preço | components/price-cards.tsx | ✅ Funcional |
| Cards de categoria | components/category-cards.tsx | ✅ Funcional |

---

## Variáveis de Ambiente

| Variável | Descrição |
|---------|-----------|
| NEXT_PUBLIC_SUPABASE_URL | URL do projeto Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Chave pública Supabase (anon) |
| ANTHROPIC_API_KEY | Chave API Claude (Anthropic) — server-side only |

---

## Pendências / Próximos Passos

- [ ] Sistema de avaliação após aceite de proposta
- [ ] Notificações por e-mail (nova proposta, proposta aceita)
- [ ] Aceite de proposta com status no banco
- [ ] Perfil completo do fornecedor (CNPJ, logo, portfólio)
- [ ] Monetização: destaque pago, perfil premium
- [ ] Rede de profissionais (instaladores, técnicos)
- [ ] Diretório de fornecedores de insumos
- [ ] App mobile (React Native)
