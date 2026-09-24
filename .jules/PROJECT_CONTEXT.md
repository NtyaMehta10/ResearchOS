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

`prisma/schema.prisma`

When changing persistent data structures:

1. inspect the existing schema;
2. understand relationships;
3. preserve existing data semantics;
4. use appropriate Prisma migrations;
5. regenerate Prisma Client when required;
6. verify affected application flows.

Never casually delete or reset the database.

Never use destructive migrations as a debugging shortcut.

---

## 6. Frontend Principles

ResearchOS UI should feel like a serious modern software product.

Prioritize:

- clear information hierarchy;
- consistent spacing;
- readable typography;
- responsive layouts;
- accessible interactions;
- useful feedback;
- predictable navigation;
- meaningful empty states;
- meaningful loading states;
- meaningful error states.

Do not generate generic dashboard UI merely to satisfy a visual requirement.

Prefer consistency with existing ResearchOS design patterns.

---

## 7. Backend Principles

Backend functionality should be:

- type-safe;
- validated;
- predictable;
- appropriately error-handled;
- integrated with the existing database architecture.

Do not put business logic into UI components when it belongs in an appropriate server-side layer.

Do not expose secrets or sensitive configuration to the client.

---

## 8. API Principles

Before creating a new API endpoint:

1. search for existing endpoints serving the same domain;
2. reuse existing conventions;
3. validate input;
4. handle expected errors;
5. return predictable responses;
6. protect authenticated operations where required.

Do not create duplicate endpoints for the same responsibility.

---

## 9. Authentication

Authentication-related work is security-sensitive.

Preserve the repository's existing authentication architecture.

Never:

- fabricate credentials;
- hard-code secrets;
- expose server secrets;
- bypass authentication merely for convenience;
- weaken authorization checks to make a feature work.

When authentication behavior changes, verify both:

- authenticated behavior;
- unauthenticated behavior.

---

## 10. Research Domain

Research-related features should model actual user workflows.

When implementing a research feature, think in terms of:

- research items;
- projects;
- sources;
- documents;
- notes;
- tasks;
- organization;
- discovery;
- processing;
- retrieval;
- collaboration where applicable.

Do not add artificial features merely to increase feature count.

Every feature should have a clear user purpose.

---

## 11. AI Features

AI functionality must be treated as an application capability, not as a substitute for product engineering.

When implementing AI features:

- keep provider integration isolated;
- keep API keys server-side;
- handle provider failures;
- handle rate limits;
- handle empty or malformed responses;
- provide useful loading states;
- provide useful failure states;
- avoid pretending that an AI operation succeeded when it did not.

Prefer provider-agnostic boundaries where practical.

Do not tightly couple unrelated product functionality to one AI provider without a reason.

---

## 12. External Services

External services can fail.

Design application behavior so that reasonable failures are handled gracefully.

Do not fabricate successful responses when a service is unavailable.

Where practical, provide:

- retry behavior;
- useful error messages;
- safe fallback behavior;
- graceful degradation.

Do not make the entire application dependent on an optional external service unless the product requirement explicitly requires it.

---

## 13. Performance

Do not prematurely optimize.

First ensure:

1. correctness;
2. maintainability;
3. appropriate data access;
4. acceptable user experience.

When performance is actually relevant:

- inspect the bottleneck;
- measure where practical;
- optimize the identified problem;
- verify the improvement.

Do not introduce complex caching or infrastructure without evidence that it is needed.

---

## 14. File Modification Discipline

Before changing a file:

- understand why it is relevant;
- inspect the current implementation;
- preserve unrelated behavior.

Avoid rewriting large files when a focused modification is sufficient.

Do not modify unrelated files merely because they are nearby.

---

## 15. Development Priority

When requirements compete, prioritize:

1. correctness;
2. security;
3. preservation of existing functionality;
4. user-facing usefulness;
5. maintainability;
6. performance;
7. visual polish;
8. implementation convenience.

Never sacrifice correctness or security merely for speed.

---

## 16. Unknowns

If repository information is missing:

1. search the repository;
2. inspect configuration;
3. inspect related implementations;
4. inspect documentation already available to the project;
5. make the safest reasonable engineering decision.

Do not invent repository facts.

If an important fact genuinely cannot be determined, identify the specific blocker rather than guessing.

---

## 17. Change Philosophy

Prefer:

- small coherent changes;
- existing patterns;
- explicit behavior;
- deterministic verification;
- reversible decisions.

Avoid:

- unnecessary rewrites;
- speculative architecture;
- dependency proliferation;
- duplicated functionality;
- fake placeholders;
- unrelated cleanup.

---

## 18. Product Quality Standard

A feature is not complete merely because it compiles.

A complete ResearchOS feature should be:

- implemented;
- integrated;
- usable;
- appropriately validated;
- verified;
- consistent with the existing product;
- free of obvious regressions.

The goal is a coherent product, not a collection of disconnected AI-generated features.
