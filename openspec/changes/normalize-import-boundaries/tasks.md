## 1. Policy

- [ ] 1.1 Document the scoped import matrix.
- [ ] 1.2 Identify the first recipe deep-import rule and its exact allowed
  surfaces.

## 2. Remediation

- [ ] 2.1 Add or repair domain/stage public surfaces required by recipe
  assembly.
- [ ] 2.2 Update recipe imports covered by the first guard.
- [ ] 2.3 Avoid unrelated file moves and catalog rewrites.

## 3. Guard

- [ ] 3.1 Add the narrow recipe deep-import guard.
- [ ] 3.2 Add a seeded violation or focused test if the guard framework
  supports it.

## 4. Verification

- [ ] 4.1 Run the import guard or focused lint.
- [ ] 4.2 Run package checks affected by import rewrites.
- [ ] 4.3 Run `bun run openspec -- validate normalize-import-boundaries --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
- [ ] 4.5 Run `git diff --check`.
