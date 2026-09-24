# Jules Autonomous Development Instructions

## 1. Primary Operating Mode

You are operating as an autonomous coding agent for the ResearchOS repository.

Work independently and continuously within the scope of the assigned task.

Do not pause for confirmation or ask for approval for routine development work.

You may independently:

- inspect the repository;
- read and modify project files;
- create necessary files;
- install required dependencies when justified;
- run commands;
- run tests and verification;
- diagnose errors;
- debug implementation problems;
- make reasonable engineering decisions;
- revise your implementation when verification fails;
- continue iterating until the task is properly completed.

Do not stop merely because an ordinary engineering decision is required.

Ask for user input only when the required information cannot reasonably be determined from the repository, task requirements, documentation, available tools, or sound engineering judgment.

---

## 2. ResearchOS Jules Guidance Files

For non-trivial tasks, use the following project-specific guidance files:

- `.jules/TASK_CONTRACT.md`
- `.jules/PROJECT_CONTEXT.md`
- `.jules/QUALITY_GATES.md`

These files define:

- how tasks should be executed;
- how ResearchOS should be engineered;
- how completed work should be verified.

Read the relevant guidance before beginning substantial implementation work.

Do not repeatedly reread unchanged guidance files during the same task when their contents are already understood.

This `AGENTS.md` remains the primary autonomous operating instruction. The `.jules/` files provide additional task-specific execution and quality guidance.

If instructions appear to overlap, follow the safest interpretation that preserves correctness, existing functionality, security, and the task requirements.

---

## 3. Core Execution Loop

For every task, follow this general loop:

1. Understand the task.
2. Inspect the relevant existing implementation.
3. Identify dependencies and integration points.
4. Form a concise implementation plan.
5. Implement the smallest coherent solution.
6. Verify the implementation.
7. Diagnose and fix failures.
8. Re-verify.
9. Review the final diff.
10. Report completion accurately.

Do not skip investigation merely because the requested change appears simple.

Do not perform large changes before understanding the existing implementation.

For complex tasks, divide the work into logical stages and verify meaningful stages incrementally.

---

## 4. Autonomous Problem Solving

If an error or unexpected condition occurs:

1. Read the actual error.
2. Determine the likely cause.
3. Inspect the relevant code, configuration, logs, or environment.
4. Attempt a reasonable fix.
5. Re-run the relevant verification.
6. If the approach fails, reassess the diagnosis and use a different bounded approach.

Do not immediately ask the user what to do.

Do not wait for instructions when the problem can reasonably be solved from available evidence.

Only ask for help when genuinely blocked by information, authorization, credentials, or an external decision that cannot be determined safely.

If the requested approach is blocked but the underlying objective can be achieved through a safe and reasonable alternative, use the alternative and continue.

---

## 5. Anti-Stall Rules

Avoid getting stuck on small operations.

### Never:

- wait indefinitely for a command;
- repeatedly execute an identical failing command without new evidence;
- repeatedly inspect the same file without making progress;
- run a long-lived process when a finite command can perform the required verification;
- leave a development server running when it is not required;
- assume a command succeeded merely because it produced no visible error;
- spend excessive time on a trivial verification step;
- repeatedly retry an operation that has already demonstrated the same failure;
- remain in planning or investigation mode after sufficient information is available.

### If a command appears stuck:

1. Determine whether it is expected to remain running.
2. Determine whether meaningful output or progress is occurring.
3. Determine whether the command is actually necessary.
4. If it is a long-running process and is not required, stop using it and choose a finite alternative.
5. If it is unexpectedly stalled, diagnose the cause.
6. Do not repeatedly retry the same stalled command.
7. Use a simpler or more targeted verification method.
8. Continue with the task if sufficient evidence can be obtained another way.

### Verification commands should preferably be:

- finite;
- deterministic;
- scoped to the relevant feature;
- capable of returning a clear success or failure result.

Do not spend many minutes verifying something that can be established with a direct file inspection, targeted test, type check, lint check, or build.

If a command is taking substantially longer than reasonably expected for its purpose, reassess the approach instead of waiting indefinitely.

---

## 6. Long-Running Development Servers

Do not use long-running development servers as the default verification mechanism.

Do not rely on commands such as:

- `npm run dev`;
- watch scripts;
- interactive development processes;
- indefinite background services;

when a finite verification command is sufficient.

For Jules environment setup, prefer install, generation, lint, test, build, or other finite commands.

If a development server is genuinely required for a specific browser or integration verification step:

1. start it deliberately;
2. confirm that it actually started;
3. perform the required verification;
4. stop or clean up the process when it is no longer needed.

Never wait indefinitely for a server to become ready.

---

## 7. Preserve Existing Work

Treat existing working code as intentional unless evidence shows otherwise.

Never:

- reset the repository to an earlier state;
- discard existing user changes;
- revert unrelated work;
- use destructive Git operations as a shortcut;
- overwrite working files simply because a cleaner implementation is preferred.

Before modifying an important file, inspect its current contents.

If existing changes are present, preserve them unless the task explicitly requires modifying them.

If a previous implementation appears to have disappeared or been reverted unexpectedly:

1. inspect Git status and diff;
2. inspect the relevant file;
3. determine what actually exists;
4. recover or reapply only the required changes;
5. continue without destroying unrelated work.

---

## 8. Scope Discipline

Implement the requested task completely without silently expanding the scope.

Do not:

- redesign unrelated features;
- refactor unrelated modules;
- change architecture unnecessarily;
- upgrade unrelated dependencies;
- rename unrelated files;
- introduce new infrastructure without a requirement;
- add speculative features.

If a useful improvement is discovered outside the task:

- do not implement it automatically;
- mention it as a follow-up recommendation.

Keep the final diff proportional to the task.

Do not confuse thoroughness with unnecessary scope expansion.

---

## 9. ResearchOS Architecture

ResearchOS is an existing full-stack application.

Prefer the repository's existing architecture and patterns.

Before introducing a new pattern, inspect whether an equivalent pattern already exists.

Prefer reuse of existing:

- components;
- services;
- API handlers;
- validation;
- database access;
- authentication;
- types;
- utilities;
- design tokens;
- error handling;
- testing patterns.

Do not introduce a new framework, ORM, database, state-management system, or major architectural pattern unless the task genuinely requires it.

Do not replace working infrastructure merely because another technology is preferred.

Treat the repository's existing implementation as the source of truth for architecture.

---

## 10. Dependency Discipline

Before adding a dependency:

1. check whether the repository already provides the required capability;
2. determine whether the functionality can reasonably be implemented with existing dependencies;
3. consider compatibility and maintenance;
4. add the dependency only when justified.

When adding a dependency:

- update the appropriate lockfile;
- use the repository's existing package manager;
- verify installation;
- verify the affected functionality.

ResearchOS currently uses pnpm.

Respect:

- `package.json`;
- `pnpm-lock.yaml`;
- existing package scripts;
- existing dependency versions.

Do not introduce a second package manager or create another lockfile.

Do not install unnecessary packages merely for experimentation.

Do not use dependency-bypass flags such as `--force` or `--legacy-peer-deps` as the first solution to a dependency conflict.

---

## 11. Database Safety

Treat Prisma and the database schema as critical application infrastructure.

Before changing the database:

1. inspect the existing schema;
2. understand affected relationships;
3. inspect affected services and API routes;
4. consider existing data;
5. make the smallest required schema change;
6. regenerate Prisma artifacts when necessary;
7. run appropriate verification.

Never delete or recreate the database merely to bypass an ordinary development problem.

Avoid destructive database operations unless explicitly required and safe within the task context.

Do not modify database structure without considering existing application behavior and data relationships.

---

## 12. Secrets and Credentials

Never commit:

- API keys;
- passwords;
- authentication tokens;
- private credentials;
- production secrets;
- sensitive personal data.

Use environment variables and the repository's existing configuration mechanisms.

Never invent missing credentials.

Do not expose server-side secrets to client-side code.

If a required credential is genuinely unavailable:

1. determine whether a safe local or development alternative exists;
2. use it if appropriate;
3. otherwise clearly identify the blocker.

---

## 13. Verification Standard

A task is not complete merely because code was written.

Verification must match the task.

When applicable, run:

- type checking;
- linting;
- relevant tests;
- feature-specific tests;
- database validation;
- API verification;
- production build;
- appropriate frontend/browser verification.

Do not run every possible command unnecessarily.

Use the smallest sufficient verification set that provides strong evidence of correctness.

For relevant TypeScript validation, prefer:

```bash
pnpm exec tsc --noEmit --incremental false
