# Ben Que Market

Ben Que Market is a B2C e-commerce web application built with Next.js. The project models a single system-operated online store rather than a multivendor marketplace. Customers can browse products, manage cart and wishlist data, place orders, pay with COD or Stripe, use coupons, subscribe to a Plus membership plan, and review purchased products. Admin users operate the store, manage products, orders, coupons, combo settings, shipping settings, dashboard data, and AI-assisted content features.

The application is implemented as a full-stack Next.js app: public storefront pages, admin pages, API route handlers, authentication, payment webhooks, database access, media upload, and background jobs live in the same codebase.

## What technologies are used in the project?

The core application is built with Next.js 15, React 19, and Tailwind CSS 4. Next.js App Router is used for page routing and API route handlers under `app/api`.

Client-side state is managed with Redux Toolkit and React Redux. The current slices cover cart, products, addresses, ratings, and wishlist data.

Authentication and user session management are provided by Clerk. Database access is implemented with Prisma Client and PostgreSQL. The schema is maintained in `prisma/schema.prisma`, with migrations stored in `prisma/migrations`.

Stripe is used for card checkout, order payment confirmation, and Plus membership subscription payments. Stripe webhook events are handled by `app/api/stripe/route.js`.

ImageKit is used for product image upload and delivery. Inngest is used for background workflows such as Clerk user synchronization and scheduled coupon expiry handling. OpenAI is configured for AI-assisted admin/store features. Recharts, Lucide React, React Hot Toast, Quill, and React Quill are used for charts, icons, notifications, and rich text editing.

## What are the prerequisites?

Use Node.js 20 LTS or newer. Next.js 15 can run on newer Node versions, but Node 20 LTS is the recommended baseline for local development.

Install npm with Node.js. The project uses `package-lock.json`, so npm is the preferred package manager.

Install PostgreSQL client tools if you plan to use backup and restore scripts. The PowerShell backup scripts call `pg_dump` and `pg_restore`, so those commands must be available in your terminal `PATH`.

Install the Stripe CLI if you need to test Stripe webhooks locally. You can download it from Stripe's official documentation and authenticate with `stripe login`.

You also need service credentials for Clerk, PostgreSQL, Stripe, ImageKit, Inngest, and OpenAI. For local-only development, you may use test keys where available.

## How to setup and run project on local machine?

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd ben-que-market-next-app
```

Install dependencies:

```bash
npm install
```

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Fill in the environment variables in `.env`.

Generate Prisma Client:

```bash
npx prisma generate
```

Apply the database schema. For an existing database with migrations, use:

```bash
npx prisma migrate deploy
```

For a disposable local database where you only need the current schema shape, you may use:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

The app runs on port `4000` because the `dev` script is configured as:

```bash
next dev --turbopack -p 4000
```

Open:

```text
http://localhost:4000
```

Useful development commands:

```bash
npm run build
npm run start
npm run encoding:check
npm run encoding:fix
```

## How to Stripe Webhook for Local Development?

Stripe payments require webhook forwarding in local development. Without this step, a card payment may succeed in Stripe, but the local database may not receive the payment confirmation event, so orders can remain unpaid in the admin UI.

Start the app first:

```bash
npm run dev
```

In a second terminal, log in to Stripe CLI if needed:

```bash
stripe login
```

Forward webhook events to the local API route:

```bash
stripe listen --forward-to localhost:4000/api/stripe
```

Stripe CLI prints a webhook signing secret that starts with `whsec_`. Copy it into `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Restart the dev server after changing `.env`.

The webhook handler receives events such as `payment_intent.succeeded`, `payment_intent.canceled`, `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`. These events are used to mark orders as paid, roll back canceled Stripe orders, decrement stock after payment, clear carts, and update Plus membership status.

After setup, test a Stripe checkout from the storefront and verify that the Stripe CLI terminal shows forwarded events. Then check that the order is marked as paid in the database/admin pages.

## How to UTF-8 Encoding Guard?

The project contains Vietnamese text in source files, reports, seed scripts, and UI content. To reduce mojibake and font corruption issues, the project includes a UTF-8 encoding guard.

Run a manual encoding check:

```bash
npm run encoding:check
```

Attempt to fix common mojibake patterns and normalize line endings:

```bash
npm run encoding:fix
```

The build pipeline also runs the encoding check before production build through the `prebuild` script:

```json
"prebuild": "npm run encoding:check"
```

The guard scans common source/content directories such as `app`, `components`, `lib`, `assets`, `prisma`, `middlewares`, `inngest`, and `scripts`. It checks file extensions such as `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.md`, `.css`, `.prisma`, `.txt`, and `.sql`.

If the guard reports suspicious encoding patterns, inspect the listed files before committing. Use `encoding:fix` only when the issue is a typical UTF-8/Latin-1 mojibake pattern and the file has no intentional unusual byte content.

## How to fill database?

The project includes helper scripts for generating dashboard/demo data. These scripts write directly to the database through Prisma, so use them only in local or staging environments unless you intentionally want to mutate the target database.

Before generating demo data, make sure the database schema is ready and there are products with `inStock > 0`. The last-month fill script reuses existing products; it does not create the main product catalog for you.

Create a backup first if you want a rollback point:

```bash
npm run db:backup
```

Fill the most recent 90 days with simulated commerce activity:

```bash
npm run db:fill:last-month
```

This script creates or reuses simulated users, creates addresses when missing, inserts orders and order items distributed across the last 90 days, applies eligible coupons, increments coupon usage counts, and creates synthetic ratings for some delivered orders.

To clear generated commerce data, use:

```bash
npm run db:clear:commerce
```

## How to Backup and Restore Database

The project includes PowerShell scripts for PostgreSQL backup and restore. They read `DATABASE_URL` from `.env` and use PostgreSQL's `pg_dump` and `pg_restore` commands.

Create a new backup snapshot:

```bash
npm run db:backup
```

Create a labeled baseline backup:

```bash
npm run db:backup:now
```

Backups are stored in:

```text
backups/db/
```

The most recent backup filename is recorded in:

```text
backups/db/LATEST.txt
```

Restore the latest backup:

```bash
npm run db:restore:latest
```

Restore is destructive. The restore script calls `pg_restore --clean --if-exists`, which removes existing database objects before restoring the backup. Always confirm that `.env` points to the intended database before running restore.

For important local work, the safest routine is:

```bash
npm run db:backup
# make changes or run demo data scripts
npm run db:restore:latest
```

To restore Neon cloud database from the local PosgreSQL:

```bash
pg_restore -d "postgresql://neondb_owner:xxxxx" --clean --if-exists --no-owner --no-privileges .\backups\db\<file.dump>
```

## Available npm scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run encoding:check
npm run encoding:fix
npm run db:backup
npm run db:backup:now
npm run db:restore:latest
npm run db:fill:last-month
npm run db:clear:commerce
```
