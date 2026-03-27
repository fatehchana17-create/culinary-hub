# Restaurant Management System — Savoria

## Overview

A full-stack Restaurant Management System built with React + Vite (frontend), Express 5 (backend), and PostgreSQL + Drizzle ORM (database). Designed for high-capacity menus (150+ items), WhatsApp ordering, admin dashboard, and live order tracking.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/restaurant), Tailwind CSS, Framer Motion, Lucide React, Embla Carousel
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Forms**: react-hook-form + @hookform/resolvers
- **Auth**: express-session (cookie-based)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/          # Express 5 API server
│   └── restaurant/          # React + Vite frontend (public menu + admin)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/                  # Drizzle ORM schema + DB connection
├── scripts/                 # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## Database Schema

- `menu_items` — id, name, category, price (numeric), image_url, prep_time_limit (int mins), is_available, created_at
- `events` — id, name, discount_percentage (numeric), start_date, end_date, is_active
- `orders` — id, item_details (jsonb), total_price (numeric), customer_info (jsonb), status, created_at
- `ads` — id, image_url, title, sub_text, link, is_active

## API Routes (all prefixed /api)

- `GET/POST /menu` — list (paginated, filterable by category/search) / create menu items
- `GET/PUT/DELETE /menu/:id` — get/update/delete menu item
- `GET /menu/categories` — distinct categories
- `GET/POST /events` — list/create events
- `GET /events/active` — get the currently active event (date-range based)
- `PUT/DELETE /events/:id` — update/delete event
- `GET/POST /orders` — list (paginated, filterable by status) / place order
- `PATCH /orders/:id/status` — update order status
- `GET/POST /ads` — list/create ads
- `GET /ads/active` — list active ads for hero banner
- `PUT/DELETE /ads/:id` — update/delete ad
- `POST /auth/login` — admin login (session cookie)
- `POST /auth/logout` — admin logout
- `GET /auth/me` — check auth status

## Admin Credentials (default)
- Username: `admin`
- Password: `restaurant2024`
- Change via env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## Frontend Pages

- `/` — Public menu with hero carousel, category filters, pagination, freshness timers, WhatsApp ordering, floating WhatsApp widget
- `/admin/login` — Admin login page
- `/admin` — Live orders dashboard (auto-refreshes every 10s)
- `/admin/menu` — CRUD for menu items
- `/admin/events` — CRUD for events/discounts
- `/admin/ads` — CRUD for hero banner ads

## Key Features

- **Event discount logic**: `GET /api/events/active` checks current date against start_date/end_date. Active event shows original price (strikethrough) + discounted price on menu cards.
- **Freshness Timer**: Live countdown based on `prepTimeLimit` minutes showing "Ready in X mins (at HH:MM AM/PM)"
- **WhatsApp ordering**: POST to `/api/orders` then opens `https://wa.me/PHONE?text=...` with pre-filled order summary
- **Floating WhatsApp bubble**: Fixed bottom-right persistent widget
- **Staggered animations**: Framer Motion fade-in for menu cards
- **Infinite pagination**: Page-based pagination for 150+ items
- **Session auth**: HTTP-only cookie sessions for admin, credentials sent with `credentials: "include"` in all API calls

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `SESSION_SECRET` — Secret for express-session (default: "restaurant-secret-key-change-in-prod")
- `ADMIN_USERNAME` — Admin username (default: "admin")
- `ADMIN_PASSWORD` — Admin password (default: "restaurant2024")
- `PORT` — Server port (auto-assigned by Replit)

## Deployment Notes (Vercel/Neon.tech)

- Set `DATABASE_URL` to Neon.tech connection string
- Set `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` as Vercel env vars
- Run `pnpm --filter @workspace/db run push` after deployment to sync schema
- Frontend builds to static files (`pnpm --filter @workspace/restaurant run build`)
- Backend builds via esbuild (`pnpm --filter @workspace/api-server run build`)
