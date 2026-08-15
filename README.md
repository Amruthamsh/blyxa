High level architecture of the application:

```

                    Blyxa Enterprises
                           │
              ┌────────────┴────────────┐
              │                         │
          Customer                    Admin
              │                         │
       Product catalogue          Google Login
       Order form                       │
              │                         ▼
              └──────────────► Supabase
                                │
                         ┌──────┼──────┐
                         │      │      │
                       DB     Auth   Storage
                         │
                    Products
                    Orders
```

Branching strategy:

main -> feature branches
