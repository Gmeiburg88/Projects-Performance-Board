#!/usr/bin/env bash
set -e
echo "Installing dependencies..."
npm install
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi
echo "Generating Prisma client..."
npx prisma generate
echo "Creating SQLite database..."
npx prisma db push
echo "Seeding starter data..."
npx tsx prisma/seed.ts
echo "Done. Start with: npm run dev"
