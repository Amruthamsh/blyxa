alter table products
  add column if not exists botanical_name text,
  add column if not exists family text,
  add column if not exists plant_type text,
  add column if not exists light text,
  add column if not exists water text,
  add column if not exists potting_mix text,
  add column if not exists maintenance text,
  add column if not exists common_pests text,
  add column if not exists common_diseases text,
  add column if not exists traditional_uses text,
  add column if not exists propagation text,
  add column if not exists safety_note text;
