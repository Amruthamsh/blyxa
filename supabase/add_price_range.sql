-- Optional upper price. When set, the product shows as a range
-- (e.g. ₹600 – ₹3,000) and is enquiry-only: it can't be ordered online.
alter table products
  add column if not exists price_max numeric;

alter table products
  drop constraint if exists products_price_max_check;

alter table products
  add constraint products_price_max_check
  check (price_max is null or price_max > price);
