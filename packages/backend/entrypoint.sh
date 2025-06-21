#!/bin/sh
set -e

sleep 10

echo "Running database migrations..."
pnpm db:generate
pnpm db:migrate
echo "Migrations finished."

echo "Starting dev server..."
pnpm run dev --ip 0.0.0.0 &

echo "Starting Drizzle Studio..."
pnpm run db:studio --host 0.0.0.0 