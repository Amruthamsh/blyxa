-- Run this in the Supabase SQL editor, then set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in client/.env

alter table products enable row level security;

-- Public can read products (used by the shop home page)
create policy "products_public_read" on products
  for select
  using (true);

-- Logged-in admins can manage products.
-- Adjust the `auth.email()` check to match your admin account(s).
create policy "products_admin_all" on products
  for all
  using (auth.jwt()->>'email' in ('you@example.com'))
  with check (auth.jwt()->>'email' in ('you@example.com'));
