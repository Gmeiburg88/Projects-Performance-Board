# Project Target Dashboard - Local SQLite Version (Admin v2)

This version uses:
- Next.js
- Prisma
- SQLite
- local cookie-based admin login

## Quick start

### Windows
```powershell
./scripts/setup.ps1
npm run dev
```

### macOS / Linux
```bash
chmod +x ./scripts/setup.sh
./scripts/setup.sh
npm run dev
```

## Local login
Default values in `.env`:
- username: `admin`
- password: `change-me`

## Admin improvements in this version
- add new teams
- delete teams
- add new projects
- delete projects
- status dropdown for projects
- company-total row protected from delete in the UI

## Routes
- `/dashboard`
- `/login`
- `/admin`
