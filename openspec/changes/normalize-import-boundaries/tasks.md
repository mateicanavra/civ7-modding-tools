## 1. Policy

- [x] 1.1 Document the scoped import matrix.
- [x] 1.2 Identify the first recipe deep-import rule and its exact allowed
  surfaces.

## 2. Remediation

- [x] 2.1 Add or repair domain/stage public surfaces required by recipe
  assembly.
- [x] 2.2 Update recipe imports covered by the first guard.
- [x] 2.3 Avoid unrelated file moves and catalog rewrites.

## 3. Guard

- [x] 3.1 Add the narrow recipe deep-import guard.
- [x] 3.2 Add a seeded violation or focused test if the guard framework
  supports it.

## 4. Verification

- [x] 4.1 Run the import guard or focused lint.
- [x] 4.2 Run package checks affected by import rewrites.
- [x] 4.3 Run `bun run openspec -- validate normalize-import-boundaries --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `git diff --check`.
