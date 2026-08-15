High level architecture of the application:

```
                    BLYXA ENTERPRISES
                           │
                ┌──────────┴──────────┐
                │                     │
             Customer                Admin
                │                     │
          React / Next.js        Google OAuth
                │                     │
                └──────────┬──────────┘
                           │
                      Supabase
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Database          Auth           Storage
      PostgreSQL       Google OAuth      Images
          │
          ▼
     Edge Functions
          │
     ┌────┴─────┐
     │          │
   Orders    Products
```
