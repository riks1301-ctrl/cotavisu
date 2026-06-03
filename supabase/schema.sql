-- ============================================================
-- CotaVisu — Schema completo
-- Execute no Supabase SQL Editor
-- ============================================================

-- Extensão para UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- CATEGORIAS
-- ============================================================
create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(100) unique not null,
  icon varchar(10),
  color_hex char(7),
  sort_order smallint default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- SERVIÇOS PADRÃO (modo prateleira)
-- ============================================================
create table if not exists standard_services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references service_categories(id) on delete set null,
  name varchar(150) not null,
  description text,
  unit varchar(20) check (unit in ('m2', 'unit', 'linear_meter')) default 'm2',
  base_price decimal(10,2) not null,
  avg_days smallint default 3,
  formula_type varchar(20) check (formula_type in ('area', 'unit', 'area_min1m2')) default 'area',
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUTOS DE PRATELEIRA
-- ============================================================
create table if not exists shelf_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references service_categories(id) on delete set null,
  name varchar(150) not null,
  description text,
  unit varchar(20) default 'm2',
  avg_price decimal(10,2) not null,
  supplier_name varchar(150),
  supplier_url varchar,
  technical_specs text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- USUÁRIOS (perfil público, além do auth.users do Supabase)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name varchar(150),
  phone varchar(20),
  city varchar(100),
  state char(2),
  role varchar(30) check (role in ('buyer', 'supplier', 'admin')) default 'buyer',
  created_at timestamptz default now()
);

-- ============================================================
-- PERFIS DE FORNECEDOR
-- ============================================================
create table if not exists supplier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  company_name varchar(150) not null,
  cnpj varchar(18),
  logo_url varchar,
  description text,
  services text[],
  cities_served text[],
  rating_avg decimal(3,2) default 0,
  total_reviews int default 0,
  is_premium boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- PEDIDOS DE ORÇAMENTO
-- ============================================================
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id) on delete set null,
  buyer_name varchar(150),
  service_type varchar(100) not null,
  category varchar(100),
  material varchar(100),
  width_m decimal(8,2),
  height_m decimal(8,2),
  quantity int default 1,
  city varchar(100) not null,
  state char(2) not null,
  deadline_days int default 7,
  description text,
  file_url varchar,
  status varchar(20) check (status in ('open','reviewing','closed','cancelled')) default 'open',
  expires_at timestamptz default now() + interval '7 days',
  created_at timestamptz default now()
);

-- ============================================================
-- PROPOSTAS
-- ============================================================
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references service_requests(id) on delete cascade,
  supplier_id uuid references supplier_profiles(id) on delete cascade,
  price_total decimal(10,2) not null,
  delivery_days int not null,
  payment_terms varchar(200),
  notes text,
  is_featured boolean default false,
  status varchar(20) check (status in ('pending','accepted','rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(request_id, supplier_id)
);

-- ============================================================
-- AVALIAÇÕES
-- ============================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  reviewer_id uuid references profiles(id) on delete set null,
  supplier_id uuid references supplier_profiles(id) on delete cascade,
  rating smallint check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now()
);

-- ============================================================
-- LOG DE ESTIMATIVAS (modo prateleira)
-- ============================================================
create table if not exists shelf_estimates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references service_requests(id) on delete cascade,
  standard_service_id uuid references standard_services(id) on delete set null,
  calculated_price decimal(10,2),
  formula_used varchar(30),
  inputs_snapshot jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS — Row Level Security (básico para MVP)
-- ============================================================
alter table service_categories enable row level security;
alter table standard_services enable row level security;
alter table shelf_products enable row level security;
alter table profiles enable row level security;
alter table supplier_profiles enable row level security;
alter table service_requests enable row level security;
alter table proposals enable row level security;
alter table reviews enable row level security;
alter table shelf_estimates enable row level security;

-- Leitura pública para dados de referência
create policy "public read categories" on service_categories for select using (true);
create policy "public read standard_services" on standard_services for select using (is_active = true);
create policy "public read shelf_products" on shelf_products for select using (is_active = true);
create policy "public read supplier_profiles" on supplier_profiles for select using (is_active = true);
create policy "public read service_requests" on service_requests for select using (status = 'open');
create policy "public read proposals" on proposals for select using (true);
create policy "public read reviews" on reviews for select using (true);

-- ============================================================
-- SEED — Categorias
-- ============================================================
insert into service_categories (name, slug, icon, color_hex, sort_order) values
  ('Adesivos',          'adesivos',          '🏷️', '#3B82F6', 1),
  ('Banners e Lonas',   'banners-lonas',     '🚩', '#10B981', 2),
  ('Fachadas e ACM',    'fachadas-acm',      '🏢', '#F59E0B', 3),
  ('Plotagem e Recorte','plotagem-recorte',  '✂️', '#8B5CF6', 4),
  ('Luminosos e Letras','luminosos-letras',  '⚡', '#EF4444', 5),
  ('Impressão Digital', 'impressao-digital', '🖨️', '#6B7280', 6)
on conflict (slug) do nothing;

-- ============================================================
-- SEED — Serviços padrão
-- ============================================================
insert into standard_services (category_id, name, unit, base_price, avg_days, formula_type, notes)
select c.id, s.name, s.unit, s.base_price, s.avg_days, s.formula_type, s.notes
from (values
  ('banners-lonas',    'Banner em Lona 440g',             'm2',   25.00, 2, 'area',        'Preço por m². Acabamento com ilhós incluso.'),
  ('banners-lonas',    'Banner Blackout Dupla Face',       'm2',   55.00, 3, 'area',        'Lona blackout, impressão frente e verso.'),
  ('adesivos',         'Adesivo Impresso Colorido',        'm2',   45.00, 3, 'area',        'Vinil adesivo, impressão digital colorida.'),
  ('adesivos',         'Adesivo Recortado (Plotter)',      'm2',   35.00, 2, 'area_min1m2', 'Mínimo de 1m² cobrado.'),
  ('fachadas-acm',     'Fachada em ACM',                  'm2',  280.00,10, 'area',        'ACM 3mm com estrutura. Instalação não inclusa.'),
  ('luminosos-letras', 'Letra Caixa Acrílico',            'unit', 180.00, 7, 'unit',        'Por letra/peça. Iluminação LED opcional.'),
  ('plotagem-recorte', 'Plotagem Planta A1',               'unit',  12.00, 1, 'unit',        'Impressão em papel sulfite 90g.'),
  ('adesivos',         'Envelopamento Veicular Parcial',   'm2',  380.00, 5, 'area',        'Vinil cast, acabamento profissional.')
) as s(slug, name, unit, base_price, avg_days, formula_type, notes)
join service_categories c on c.slug = s.slug
on conflict do nothing;

-- ============================================================
-- SEED — Produtos de prateleira
-- ============================================================
insert into shelf_products (category_id, name, unit, avg_price, supplier_name, technical_specs)
select c.id, p.name, p.unit, p.avg_price, p.supplier_name, p.specs
from (values
  ('adesivos',         'Vinil Adesivo Branco Fosco',  'm2',   18.00, null,          'Espessura 80µ, adesivo permanente, durabilidade 5 anos external'),
  ('banners-lonas',    'Lona Impressa 440g',          'm2',    8.00, null,          'Gramatura 440g/m², impressão digital, resistente à água'),
  ('fachadas-acm',     'ACM 3mm Branco',              'm2',   95.00, 'AlumíniosCorp','Alumínio composto 3mm, acabamento PVDF'),
  ('plotagem-recorte', 'PVC Expancel 3mm',            'm2',   42.00, null,          'PVC expandido, leveza e rigidez, para displays e painéis'),
  ('impressao-digital','Tinta UV para Impressora',    'litro',180.00,'TintasPro',   'Tinta UV, alta aderência, secagem instantânea')
) as p(slug, name, unit, avg_price, supplier_name, specs)
join service_categories c on c.slug = p.slug
on conflict do nothing;
