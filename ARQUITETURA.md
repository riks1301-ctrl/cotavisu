# ARQUITETURA.md — Análise CTO
## CotaVisu — Marketplace B2B Comunicação Visual

**Análise realizada em:** Junho 2026  
**Status do produto:** MVP funcional em produção  
**Fase:** Pré-tração (0 a 100 empresas ativas)

---

## 1. O QUE ESTÁ BOM

### Decisões de produto corretas

**Modo Prateleira é a decisão mais inteligente do projeto.**  
Resolver o problema do ovo e da galinha (marketplace sem fornecedores = sem valor) com dados de estimativa é uma solução elegante e pragmática. Poucos marketplaces fazem isso bem no início.

**Stack enxuta e adequada ao estágio.**  
Next.js + Supabase é a escolha certa para MVP B2B. Custo operacional próximo de zero, deploy automático, banco gerenciado, auth gerenciado. Não há desperdício de engenharia em infraestrutura.

**Formulário de pedido multi-step com validação por etapa.**  
Reduz abandono. O usuário não vê o formulário completo de uma vez — percebe progresso. Correto do ponto de vista de UX de conversão.

**Categoria PDV com fluxo de kit múltiplo.**  
Diferencial real. Nenhum concorrente resolve pedido de múltiplos itens de PDV em um único orçamento. Isso cria lock-in natural: quem já usou não quer voltar a enviar por WhatsApp.

**RLS ativado no banco desde o início.**  
Decisão de segurança correta que a maioria das startups atrasa até ser tarde. Qualquer vazamento de dados B2B é fatal para reputação.

**Sugestão por IA com fallback gracioso.**  
A IA é opcional e o sistema funciona sem ela. Correto: IA como acelerador, não como dependência.

**Preço estimado com contexto claro ("Baseado em pedidos similares").**  
Evita o erro clássico de mostrar número sem contexto que gera desconfiança.

---

## 2. O QUE ESTÁ RUIM

### Problemas que vão impedir crescimento se não forem resolvidos

**Não existe notificação.**  
O ciclo completo do marketplace depende de timing: fornecedor precisa saber que existe um pedido novo, comprador precisa saber que chegou uma proposta. Hoje nenhum dos dois recebe nenhuma comunicação. O pedido abre, ninguém sabe, expira em 7 dias. Taxa de conversão próxima de zero sem notificação.

**Aceitar proposta não faz nada no banco.**  
O botão "Aceitar proposta" existe na interface mas não atualiza o status da proposta, não notifica o fornecedor, não fecha o pedido. É UI sem backend. Em produção, isso quebra a confiança do usuário no momento mais crítico do funil.

**Perfil do fornecedor é incompleto e não está na jornada.**  
O comprador não consegue ver informações suficientes para confiar no fornecedor antes de aceitar. CNPJ, portfólio, anos de mercado, fotos de trabalhos anteriores — nenhum desses campos é preenchível. A página `/fornecedores` existe mas os dados são mockados hardcoded, não vêm do banco.

**`lib/mock-data.ts` ainda existe em produção.**  
Arquivo com dados falsos não foi removido após integração com Supabase. Não causa bug imediato, mas é dívida técnica que confunde manutenção futura e pode causar inconsistência se alguém referenciar por engano.

**Dois clientes Supabase paralelos (`lib/supabase.ts` e `lib/supabase-client.ts`).**  
Um para server-side, outro para client-side. Sem documentação de quando usar cada um. Em 3 meses, um desenvolvedor novo vai usar o errado e criar bug de autenticação silencioso.

**`lib/service-options.ts` com 929 linhas.**  
O maior arquivo de lógica do projeto é um arquivo de configuração. Quando o negócio evoluir e precisar que fornecedores cadastrem seus próprios serviços, toda essa lógica vai precisar ser migrada para banco. O custo de migração cresce com o tempo.

**Pedidos sem filtro por região no feed do fornecedor.**  
Um fornecedor de Belém vê pedidos de Porto Alegre. O feed de pedidos não filtra por cidade ou estado do fornecedor. Em escala, isso vai gerar ruído e fornecedores vão parar de usar o feed.

---

## 3. O QUE ESTÁ COMPLEXO DEMAIS

### Para o estágio atual do produto

**Formulário de pedido tem 6 etapas + fluxo PDV paralelo + fluxo IA paralelo.**  
São três jornadas de criação de pedido vivendo no mesmo componente de 545 linhas. O arquivo `app/pedidos/novo/page.tsx` já é o maior componente de UI do projeto. Para um comprador novo, o formulário é longo demais. Para um desenvolvedor, é difícil de manter.

**Cards de preço com variações de mercado simuladas.**  
O componente `price-cards.tsx` gera variações de "mais barato" e "mais rápido" com multiplicadores estáticos por categoria. Isso parece inteligência, mas é ruído. O usuário pode tomar decisões baseado em números que não têm fundamento real.

**PDV Builder com 318 linhas e 10 itens de PDV.**  
Para um MVP, 10 itens de PDV com atributos completos é excesso. O mercado ainda não validou quais itens têm demanda real. O correto seria começar com 3 a 4 itens mais pedidos e expandir baseado em dados.

**Urgency bar com cálculos assíncronos na home.**  
A barra de urgência faz 2 queries ao Supabase em tempo real na home. Para uma home que deveria ser estática, isso adiciona latência e custo desnecessários. Os números de urgência poderiam ser calculados em build time ou em cache.

---

## 4. O QUE NÃO DEVERIA EXISTIR AINDA

### Funcionalidades prematuras para o estágio de 0 a 100 usuários

**Seção "Por que confiar?" com promessas que não podem ser cumpridas.**  
O texto diz "CNPJ confirmado" e "validação manual da equipe". Se isso não for verdade operacionalmente, é promessa falsa. Com 0 usuários ativos, a plataforma ainda não tem processo de verificação real. Isso é risco jurídico e de reputação.

**Sistema de avaliações (mesmo que não funcional).**  
A tabela `reviews` existe, o componente `StarRating` existe, mas nenhum fluxo de avaliação está implementado. Existe UI de estrelas mostrando zero ou "Novo fornecedor" em toda parte. Isso passa impressão de sistema vazio.

**Diretório de fornecedores com dados hardcoded.**  
A página `/fornecedores` mostra 4 empresas fictícias com dados fixos no código. Em produção, isso é enganoso. Deveria ser removida ou substituída por "Em breve".

**`components/product-preview.tsx` (196 linhas) — não está em uso.**  
O arquivo existe e foi removido da UI, mas permanece no projeto. É código morto que ocupa espaço cognitivo.

**Admin com 4 abas onde apenas 2 funcionam.**  
A aba "Usuários" do admin mostra "Disponível na próxima versão". A aba está na navegação, o usuário clica e não vê nada. Pior do que não ter a aba.

---

## 5. GARGALOS PARA ESCALAR PARA 1.000 EMPRESAS

### O que vai quebrar antes de chegar a 1.000 usuários ativos

**Ausência de e-mail transacional.**  
Sem notificação de nova proposta, o comprador não volta. Sem notificação de novo pedido, o fornecedor não responde. O marketplace inteiro depende de timing. Sem e-mail, a taxa de conversão pedido→aceite vai ser menor que 5%.

**Sem filtro geográfico inteligente.**  
Com 1.000 fornecedores, o feed de pedidos vai ter dezenas por dia. Sem filtragem por cidade/estado/raio, fornecedores vão ser inundados com pedidos irrelevantes e vão parar de monitorar.

**Supabase no plano gratuito tem limite de 500MB de banco e 50MB de storage.**  
Com 1.000 empresas ativas, pedidos, propostas e uploads de arte, esse limite é atingido em meses. A migração de plano precisa acontecer antes, não depois.

**Sem processo de verificação de fornecedor.**  
Hoje qualquer e-mail cria conta como fornecedor. Com 1.000 fornecedores, vai ter spam, CNPJ falso, proposta de empresa que não existe. O comprador vai ser enganado e a plataforma vai perder reputação.

**Sem mecanismo de expiração real de pedidos.**  
A coluna `expires_at` existe no banco, mas não há job que feche pedidos expirados automaticamente. Com volume, pedidos de 6 meses atrás vão aparecer no feed como "abertos".

**`lib/service-options.ts` não escala para fornecedores cadastrando serviços.**  
As categorias e serviços são estáticos em código. Para chegar a 1.000 fornecedores, eles vão precisar cadastrar serviços personalizados (ex: "Letreiro em neon com projeto elétrico"). Hoje isso é impossível sem alterar código.

---

## 6. GARGALOS PARA ESCALAR PARA 10.000 EMPRESAS

### O que precisa ser reescrito ou repensado entre 1.000 e 10.000 empresas

**Arquitetura de notificações em tempo real.**  
Com 10.000 usuários, e-mail não é suficiente. Fornecedores precisam de push notification quando um pedido aparece na sua região. Compradores precisam de alerta quando chega proposta. Isso exige WebSocket ou long-polling, não existe na arquitetura atual.

**Matching inteligente pedido → fornecedor.**  
Hoje o fornecedor varre o feed e decide o que responder. Com 10.000 pedidos por dia, isso é inviável. O sistema precisa notificar ativamente os fornecedores mais adequados para cada pedido baseado em: especialidade, cidade, histórico, taxa de aceite. Isso é um módulo de recomendação que não existe.

**Fraude e abuso.**  
Com volume, vão aparecer: compradores fantasma que pedem orçamento para espionar preço da concorrência, fornecedores que enviam spam de proposta em todos os pedidos, robôs criando contas. A plataforma não tem nenhuma camada de detecção de abuso.

**Banco de dados sem índices otimizados.**  
As queries atuais fazem full scan em `service_requests` filtradas por status e data. Com 100.000 pedidos, sem índices compostos em `(status, created_at, city, state)`, cada consulta vai ser lenta.

**Arquitetura de multi-tenant para regiões.**  
Um fornecedor de São Paulo não deveria ter a mesma latência que um de Manaus. Com 10.000 empresas distribuídas no Brasil, a infraestrutura precisa ter presença regional. Hoje tudo está em US-East (North Virginia).

**Modelo de monetização inexistente na arquitetura.**  
Com 10.000 empresas, a plataforma precisa cobrar. Não há tabela de assinaturas, não há integração de pagamento, não há controle de limites por plano. Adicionar monetização em cima de uma arquitetura que não previu isso vai exigir mudanças em toda a camada de acesso a dados.

**RLS vai se tornar gargalo de performance.**  
O PostgreSQL RLS é executado em cada query. Com volume alto e políticas complexas, o overhead de RLS pode representar 20 a 40% do tempo de query. Em 10.000 usuários, isso vai ser perceptível.

---

## 7. MELHORIAS PRIORITÁRIAS

### O que fazer nos próximos 30 dias para chegar a 100 empresas ativas

**Prioridade 1 — Fechar o ciclo (crítico)**
- Implementar o aceite de proposta de verdade (atualizar status no banco, fechar pedido)
- Implementar e-mail transacional básico: nova proposta → comprador, pedido aceito → fornecedor
- Implementar job de expiração de pedidos (cron Supabase a cada hora)

**Prioridade 2 — Confiança (alto impacto)**
- Fazer página `/fornecedores` puxar dados reais do banco
- Fluxo de avaliação: depois de aceitar proposta, comprador pode avaliar
- Remover promessas de verificação que não são cumpridas operacionalmente

**Prioridade 3 — Limpeza (reduzir risco)**
- Remover `lib/mock-data.ts`
- Remover `components/product-preview.tsx` (arquivo morto)
- Unificar os dois clientes Supabase em um único com documentação clara
- Filtro geográfico no feed do fornecedor (pedidos da mesma cidade/estado)

**Prioridade 4 — Produto (aumentar ativação)**
- Formulário de pedido simplificado: 3 etapas em vez de 6
- Perfil do fornecedor editável: CNPJ, descrição, logo, cidades atendidas
- Onboarding guiado para fornecedores novos (primeiro acesso)

---

## 8. FUNCIONALIDADES QUE DEVEM SER ADIADAS

### O que não construir antes de ter 500 empresas ativas

**App mobile (React Native)**  
Custo de desenvolvimento 3x maior, base de usuários ainda pequena demais para justificar. PWA (Progressive Web App) resolve 80% das necessidades mobile com zero custo adicional. Adiar até 500 empresas ativas.

**Rede de profissionais (instaladores, técnicos)**  
É um segundo marketplace dentro do primeiro. Antes de resolver o marketplace principal, criar um segundo produto vertical vai dividir foco e orçamento. Adiar até o core estar consolidado.

**Diretório de fornecedores de insumos**  
Mesma lógica: terceiro produto. O usuário que busca vinil ou ACM tem canais consolidados (Mercado Livre, fornecedores diretos). A oportunidade de negócio ainda não está validada. Adiar.

**Integração com ERPs de gráficas**  
Alta complexidade técnica, baixo número de gráficas que usam ERP no segmento SMB (que é o público-alvo do MVP). Adiar até o produto ter pelo menos 200 fornecedores ativos e entender quais ERPs predominam.

**Sistema de gamificação (badges, certificações, ranking)**  
Funciona bem em plataformas com engajamento diário (Duolingo, apps de fitness). Em marketplace B2B, o fornecedor quer negócio, não badge. A energia investida aqui tem retorno muito menor do que fechar o ciclo de negócio com notificação e aceite real.

**WhatsApp Business API**  
Custo operacional alto (Meta cobra por mensagem), aprovação de template burocrática, manutenção constante. E-mail resolve a mesma necessidade com custo próximo de zero no volume atual. Adiar até ter volume para justificar o custo e complexidade.

**Destaque pago e perfil premium**  
Monetização prematura antes de ter ativação do produto. Fornecedor não paga por destaque em plataforma que ainda não prova valor. Construir monetização antes de ter NPS positivo é queimar a relação com os primeiros fornecedores. Adiar até ter 200 transações concluídas.

---

## RESUMO EXECUTIVO

O CotaVisu tem **fundações sólidas** e uma **hipótese de produto válida**. O maior risco hoje não é tecnológico — é operacional: sem fechar o ciclo (notificação + aceite real + avaliação), o produto não tem loop de retorno e vai perder usuários após a primeira experiência.

O projeto está no momento certo para **parar de adicionar funcionalidades e finalizar as existentes**. Cada funcionalidade incompleta (aceite sem backend, avaliações sem fluxo, fornecedores com dados falsos) corrói mais confiança do que a ausência da funcionalidade.

**A prioridade dos próximos 30 dias deve ser:**
1. Fechar o ciclo pedido → proposta → aceite → avaliação
2. Adicionar e-mail transacional
3. Limpar o que não deveria existir

Com isso, o produto estará pronto para trazer os primeiros 20 fornecedores reais e validar o modelo de negócio.
