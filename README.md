# Blyxa — Living Botanicals & Plants

Full-stack e-commerce application for **Blyxa**, a small plant studio. It pairs a React storefront and admin dashboard (this repo's `client/`) with a Supabase backend (database, auth, storage, and a Deno edge function in `server/`). Static assets are deployed to Cloudflare.

```
                    BLYXA ENTERPRISES
                           │
                ┌──────────┴──────────┐
                │                     │
             Customer                Admin
                │                     │
          React / TypeScript    email / password
           (Cloudflare Pages)         │
                │                     │
                └──────────┬──────────┘
                           │
                      Supabase
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Database          Auth           Storage
      PostgreSQL                       Images
          │
          ▼
     Edge Functions (create-order)
          │
      Orders / Products
```

## Tech Stack

- **Frontend** (`client/`): React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router 7, oxlint
- **Backend**: Supabase (Postgres, Auth, Storage) + a Deno Edge Function for order creation
- **Deployment**: Cloudflare Pages/Workers via `wrangler.jsonc` (SPA fallback enabled, assets served from `client/dist`)

## Repo Layout

```
├── client/                          # React storefront + admin dashboard
│   ├── src/
│   │   ├── components/              # Storefront UI (Header, Hero, ProductCard, CartDrawer, CheckoutModal, ...)
│   │   │   └── admin/               # Admin UI (ProductForm, ProductTable, OrderList, ...)
│   │   ├── lib/                     # Supabase client, types, helpers (format, whatsapp, orderStatus, admin)
│   │   └── pages/                   # Home, Login, Admin
│   ├── .env.example                 # Frontend env template
│   └── package.json
├── server/supabase/functions/       # Supabase Edge Functions (Deno)
│   └── create-order/                # Validates + places orders, decrements stock
├── supabase/                        # SQL migrations/setup
│   └── rls_products.sql             # Row-level security policies for products
└── wrangler.jsonc                   # Cloudflare deployment config
```

## Features

### Storefront (`/`)
- Hero, product collection, about, and contact sections
- Product grid with live stock indicators ("Out of stock", "Only 1 left", "All in your cart")
- Shopping cart drawer with quantity steppers and per-item totals
- Checkout modal with client-side form validation
- WhatsApp deep links to discuss a plant, a cart, an order, or general inquiries
- Toast notifications and an order confirmation banner
- Checkout details persisted to `localStorage`

### Admin (`/login`, `/admin`)
- Email/password sign-in via Supabase Auth, restricted to users in the `admin_users` table
- Product management: create, edit, activate/deactivate, upload product images
- Order management: view orders with line items and update status (`new` → `confirmed` → `processing` → `completed` / `cancelled`)

### Backend
- **`products`, `orders`, `order_items`, `admin_users`** tables
- **RLS**: products are publicly readable; admins get full management access
- **`create-order` edge function**: validates the payload, locks product rows, inserts the order + items in a single transaction, and decrements stock
- **Storage**: product images in the `product-images` bucket; public URLs stored on `products.image_url`

## Getting Started

### 1. Set up Supabase

1. Create a Supabase project and run the setup SQL (see `supabase/rls_products.sql` and the schema implied by `client/src/lib/types.ts`).
2. Create tables: `products`, `orders`, `order_items`, `admin_users`.
3. Create the `product-images` storage bucket (public).
4. Deploy the edge function:

```bash
cd server/supabase
supabase functions deploy create-order
```

Set the `SUPABASE_DB_URL` secret for the function (the project's Postgres connection string with connection pooling).

### 2. Frontend environment

Copy `client/.env.example` to `client/.env` and fill in your values:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WHATSAPP_NUMBER=your-whatsapp-number
VITE_CONTACT_EMAIL=your-email
VITE_CONTACT_PHONE=your-phone
```

### 3. Run locally

```bash
cd client
npm install
npm run dev
```

Other scripts: `npm run build` (type-check with `tsc -b`, then build), `npm run preview`, `npm run lint` (oxlint).

## Deployment

1. Build the client: `cd client && npm run build`
2. Deploy with Wrangler from the repo root:

```bash
npx wrangler deploy
```

`wrangler.jsonc` serves `client/dist` as static assets with single-page-application fallback.