# Ben Que Market  Next App

## Technologies Used

This project is built upon the following core technologies:

- Next.js: The React framework for production.
- React: A JavaScript library for building user interfaces.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js: (Version 16.x or later is recommended)
- npm (Node Package Manager) or Yarn

## Clone the Repository

First, clone the project repository to your local machine using git:

```
git clone
cd
```

## Install Dependencies

Navigate into the project directory and install all the necessary dependencies. We recommend using `npm`:

```
npm install
```

## Environment Variables (Optional)

```
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## UTF-8 Encoding Guard (Recommended)

Project is configured to avoid Vietnamese font/encoding issues:

- `.editorconfig`: `charset = utf-8`, `end_of_line = crlf`
- `.vscode/settings.json`: `files.encoding = utf8`, `files.autoGuessEncoding = false`
- `.gitattributes`: enforce UTF-8 for source/content text files
- `prebuild` hook: runs encoding check before build

Run manual check:

```bash
npm run encoding:check
```

Auto-fix common mojibake patterns and normalize line endings:

```bash
npm run encoding:fix
```

## Run the Development Server

Start the application in development mode. Next.js will compile the project and automatically open a local server:

```
npm run dev
```

## Stripe Webhook (Local Development)

To ensure Stripe orders are marked as paid correctly (`isPaid = true`) in local development, you need to forward Stripe webhook events to your local API:

```bash
stripe listen --forward-to localhost:4000/api/stripe
```

### What does this command do?

- It forwards Stripe events (for example `checkout.session.completed`, `payment_intent.succeeded`) to your local machine.
- Your webhook handler at `app/api/stripe/route.js` receives those events and updates order/payment data in the database.
- If you do not run this command, a payment may succeed on Stripe but Admin can still show `Paid: No`.

### Correct usage

1. Start the app locally:
```bash
npm run dev
```

2. Open another terminal and run webhook forwarding:
```bash
stripe listen --forward-to localhost:4000/api/stripe
```

3. Copy the webhook signing secret (`whsec_...`) shown by Stripe CLI and set it in `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

4. Restart your dev server after updating `.env`.

5. Create and pay a Stripe order for testing.

6. Verify:
- Stripe CLI terminal shows forwarded webhook events.
- Next.js terminal shows webhook events received.
- Admin order detail page shows `Paid: Yes`.

## Backup and Restore Database

### Backup current database

Create a new snapshot backup (custom format) from the current `DATABASE_URL` in `.env`:

```bash
npm run db:backup
```

Create a labeled baseline backup immediately:

```bash
npm run db:backup:now
```

Backup files are stored in:

`backups/db/`

The latest backup filename is tracked in:

`backups/db/LATEST.txt`

### Restore database to latest backup

Restore DB from the latest backup snapshot:

```bash
npm run db:restore:latest
```

### Important notes

- `restore` will overwrite current database objects (`--clean --if-exists`).
- Always run a fresh backup before restoring if current data is important.
- Backup/restore uses `DATABASE_URL` from `.env`, so verify environment before running.

## Available Scripts

In the project directory, you can run the following standard Next.js scripts:

- Builds the application for production deployment:

```
npm run build
```

- Starts the Next.js production server after a successful build:

```
npm run start
```

- Runs the linter (e.g., ESLint) to check code quality and style:

```
npm run lint
```

- Checks suspicious UTF-8/mojibake patterns:

```bash
npm run encoding:check
```

- Attempts to fix common encoding issues:

```bash
npm run encoding:fix
```
