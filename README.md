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

## Run the Development Server

Start the application in development mode. Next.js will compile the project and automatically open a local server:

```
npm run dev
```

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
