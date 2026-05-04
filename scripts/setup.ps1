Write-Host "Installing dependencies..."
npm install
if (!(Test-Path ".env")) { Write-Host "Creating .env from .env.example..."; Copy-Item ".env.example" ".env" }
Write-Host "Generating Prisma client..."
npx prisma generate
Write-Host "Creating SQLite database..."
npx prisma db push
Write-Host "Seeding starter data..."
npx tsx prisma/seed.ts
Write-Host "Done. Start with: npm run dev"
