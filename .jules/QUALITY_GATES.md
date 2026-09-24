ResearchOS Quality Gates
Purpose
Use this file as the final quality checklist for ResearchOS tasks.

A task is complete only when the applicable gates pass or any unavoidable limitation is clearly reported.

1. Functional Gate
Confirm that:

the requested functionality is actually implemented;
the feature works through the intended user flow;
required backend and frontend pieces are connected;
required data is persisted correctly where applicable;
existing functionality still works.
Do not consider placeholder UI or disconnected code complete.

2. Type Safety Gate
Run the appropriate TypeScript validation.

Preferred project command:
pnpm exec tsc --noEmit --incremental false

Resolve errors introduced by the current task.

Do not hide TypeScript errors with unnecessary type assertions or compiler suppression.

3. Test Gate

Run relevant existing tests.

When meaningful new behavior is introduced:

add or update appropriate tests where practical;
verify the new behavior;
do not weaken existing assertions merely to make tests pass.

If unrelated pre-existing tests fail, distinguish them from failures caused by the current task.

4. Build Gate

For changes affecting application architecture, routing, major UI, server behavior, authentication, database logic, or deployment behavior, run the appropriate production build when practical.

A successful type check alone does not prove that a major feature builds correctly.

5. UI Gate

For UI changes, verify the actual user experience where practical.

Check:

layout;
responsive behavior;
navigation;
interaction states;
loading states;
empty states;
error states;
disabled states;
form validation;
accessibility basics;
visual consistency with the existing product.

Do not claim visual verification if only source code was inspected.

6. Data and Database Gate

For database-related changes, verify:

Prisma schema correctness;
appropriate migration behavior;
Prisma Client generation;
affected queries;
data relationships;
error handling.

Never reset or destroy the database merely to make a development check pass.

7. Security Gate

Before completion, check that the change does not:

expose secrets;
expose private credentials;
bypass authentication;
bypass authorization;
trust unvalidated user input;
expose sensitive server-side information to the client.

Authentication and authorization changes require additional care.

8. Regression Gate

Check the functionality most likely to be affected by the change.

Prioritize:

shared components;
shared utilities;
authentication;
database models;
API contracts;
navigation;
global state;
core research workflows.

Do not perform an unnecessarily broad regression pass for an isolated low-risk change.

9. Repository Hygiene Gate

Before completion:

inspect git status;
inspect the relevant diff;
remove unnecessary temporary files;
do not commit secrets;
do not commit caches or unintended generated artifacts;
do not include unrelated modifications.

Do not discard existing user work.

10. Scope Gate

Confirm that the implementation does not contain unnecessary:

dependencies;
abstractions;
refactors;
configuration;
unrelated cleanup;
speculative features.

Prefer the smallest complete solution.

11. Failure Gate

If verification fails:

identify the actual failure;
determine whether it was caused by the current change;
fix the root cause where possible;
re-run the relevant verification.

Never:

repeatedly run the same failed command without changing the approach;
suppress errors simply to obtain a passing result;
weaken tests;
fabricate successful verification.
12. Completion Gate

Before declaring completion, confirm:

 requested functionality implemented;
 integration completed;
 relevant TypeScript validation passed;
 relevant tests passed;
 relevant build verification passed when appropriate;
 UI verified when applicable;
 security checked;
 relevant regressions checked;
 Git diff reviewed;
 no unnecessary files or changes remain.

If a gate cannot be completed because of a genuine external limitation, clearly report:

what could not be verified;
why;
what was verified instead;
whether the limitation affects confidence in the implementation.
13. Final Principle

Do not optimize for a green command.

Optimize for a working ResearchOS feature that is correctly implemented, integrated, verified, maintainable, and honest about its limitations.
