#!/usr/bin/env bash

set -euo pipefail

echo "==> ResearchOS Jules environment setup"

echo "==> Installing locked dependencies"
npm ci

echo "==> Generating Prisma Client"
npm run prisma:generate

echo "==> Running TypeScript validation"
npx tsc --noEmit

echo "==> Running lint"
npm run lint

echo "==> ResearchOS environment setup completed successfully"
