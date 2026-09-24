# ResearchOS Project Context

## 1. Project Identity

ResearchOS is a research-management application designed to help users organize, discover, process, and work with research information in one workspace.

The product should prioritize:

- usefulness;
- clarity;
- reliability;
- fast workflows;
- maintainable architecture;
- high-quality user experience.

ResearchOS is a real software product, not a demo or throwaway prototype.

---

## 2. Core Engineering Stack

Use the technologies already established by the repository.

Current known stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL-compatible database architecture
- pnpm

Use the existing versions and configuration unless the task explicitly requires a change.

Do not introduce a second package manager.

Do not create a second lockfile.

---

## 3. Repository Authority

Before implementing a feature, treat the following as authoritative:

1. existing source code;
2. `package.json`;
3. `pnpm-lock.yaml`;
4. Prisma schema;
5. TypeScript configuration;
6. existing application architecture;
7. existing reusable components;
8. existing tests;
9. task requirements.

Do not assume an architecture that is not present in the repository.

---

## 4. Architecture Principle

Prefer the existing architecture over introducing a new architecture.

Before creating:

- components;
- utilities;
- API routes;
- database models;
- hooks;
- services;
- state-management systems;

search for an existing equivalent.

Reuse existing abstractions when they are appropriate.

Only create a new abstraction when it provides a clear benefit.

---

## 5. Database

Prisma is the database access layer.

Relevant schema:

```text
prisma/schema.prisma
