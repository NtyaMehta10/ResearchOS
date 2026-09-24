#!/usr/bin/env bash

set -euo pipefail

echo "==> ResearchOS Jules environment setup"

echo "==> Installing locked dependencies with pnpm"
pnpm install --frozen-lockfile

echo "==> Generating Prisma Client"
pnpm run prisma:generate

echo "==> Running TypeScript validation"
pnpm exec tsc --noEmit

echo "==> ResearchOS Jules environment setup completed successfully"
