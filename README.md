# Portfolio Website Template

A Next.js portfolio site for a creative business, with a public-facing gallery, contact form, and a password-protected admin area.

## Features

- Responsive marketing site
- Portfolio gallery and project detail pages
- Contact form
- Admin dashboard for content management
- Server-authenticated admin session
- Supabase-backed content storage
- Vercel Blob image uploads

## Stack

- Next.js
- React and TypeScript
- Tailwind CSS
- Supabase Postgres and PostgREST
- Vercel Blob

## Prerequisites

- Node.js 18+
- npm
- A Supabase project with a `gay_solomon` schema
- The shared SQL migration `013_gay_solomon_policies.sql` if you want public reads and contact-form inserts through Supabase

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
SUPABASE_SECRET_KEY=<your Supabase secret key>
ADMIN_PASSWORD=<your admin password>
BLOB_READ_WRITE_TOKEN=<your Vercel Blob token>
```

Notes:
- `SUPABASE_SECRET_KEY` is server-only and used for admin operations.
- `ADMIN_PASSWORD` is server-only and used to create a signed admin session cookie.

## Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Admin access is available at `/admin`.

## Security Model

- Admin authentication is handled on the server.
- Successful login creates a signed, secure cookie session.
- Middleware protects admin routes.
- Admin data changes run server-side with the Supabase secret key.
- Public portfolio reads and contact form inserts can be allowed with `013_gay_solomon_policies.sql`.

## Customization

Update `lib/config.ts` to change:
- business name and branding
- contact details
- SEO metadata
- marketing copy
- social links

## Project Structure

- `app/` routes, pages, server actions, and API handlers
- `components/` reusable UI
- `lib/` configuration, Supabase client helpers, and admin session helpers
- `public/` static assets
- `types/` shared TypeScript types
