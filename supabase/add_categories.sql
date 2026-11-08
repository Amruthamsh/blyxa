-- A plant can belong to several website categories (e.g. both
-- "Medicinal & Herbal Plants" and "Edible & Culinary Plants").
-- The list of allowed names lives in client/src/lib/categories.ts.
alter table products
  add column if not exists categories text[] not null default '{}';

create index if not exists products_categories_idx
  on products using gin (categories);
