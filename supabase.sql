-- Luna Beauty: տեղադրիր այս ամբողջ SQL-ը Supabase → SQL Editor → New query → Run։
-- Ադմինի իրավունքը տրվում է միայն admin_users աղյուսակում ձեռքով ավելացված օգտվողին։

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  category text not null check (category in ('makeup','eyes','lips','skincare')),
  image_url text not null,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  address text not null check (char_length(address) between 4 and 500),
  note text not null default '',
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total integer not null check (total >= 0),
  status text not null default 'new' check (status in ('new','processing','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products" on public.products
for select to anon, authenticated using (in_stock = true or exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Users can read own admin membership" on public.admin_users;
create policy "Users can read own admin membership" on public.admin_users
for select to authenticated using (user_id = auth.uid());

drop policy if exists "Anyone can submit an order" on public.orders;
create policy "Anyone can submit an order" on public.orders
for insert to anon, authenticated
with check (
  char_length(customer_name) between 2 and 120
  and char_length(phone) between 5 and 40
  and char_length(address) between 4 and 500
  and jsonb_typeof(items) = 'array'
  and total >= 0
  and status = 'new'
);

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders" on public.orders
for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Demo ապրանքներ. Կարող ես փոխել կամ ջնջել ադմինի վահանակից։
insert into public.products (name,description,price,category,image_url,in_stock) values
('Velvet Matte Lipstick','Թավշյա ավարտով շրթներկ՝ ամեն օրվա համար։',5900,'lips','https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80',true),
('Rose Eyeshadow Palette','Նուրբ վարդագույն և բնական երանգներ։',8900,'eyes','https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80',true),
('Daily Glow Serum','Թեթև շիճուկ՝ մաշկի ամենօրյա խնամքի համար։',7500,'skincare','https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',true),
('Soft Touch Blush','Թարմ, բնական գույն այտերի համար։',4900,'makeup','https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=700&q=80',true),
('Volume Mascara','Արտահայտիչ թարթիչների համար։',4200,'eyes','https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=700&q=80',true),
('Hydrating Face Cream','Խոնավեցնող կրեմ՝ մաշկի ամենօրյա խնամքի համար։',6800,'skincare','https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=700&q=80',true),
('Nude Lip Gloss','Փայլուն նյուդ երանգ՝ շուրթերին։',3900,'lips','https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=700&q=80',true),
('Everyday Foundation','Հավասար երանգի համար թեթև տոնային միջոց։',8200,'makeup','https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=700&q=80',true);
