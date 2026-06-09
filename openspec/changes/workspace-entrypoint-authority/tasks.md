## 1. Normal Entrypoints

- [x] 1.1 Remove hidden MapGen Studio dependency preflights from app-local
  `dev`.
- [x] 1.2 Remove hidden MapGen Studio dependency preflights from app-local
  `build`.
- [x] 1.3 Remove hidden Docs lifecycle dependency builds from `predev` and
  `prebuild`.
- [x] 1.4 Route root Docs dev through Turbo so dependency freshness stays in the
  workspace graph.

## 2. Guardrail

- [x] 2.1 Add a lint guard for package-local normal entrypoints.
- [x] 2.2 Include the guard in root `check`.
- [x] 2.3 Keep explicit diagnostic scripts outside the normal-entrypoint
  preflight violation set.
- [x] 2.4 Block package-local deploy scripts from invoking Turbo or sibling
  workspace filters.

## 3. Docs

- [x] 3.1 Update MapGen Studio local dev/build runbook.
- [x] 3.2 Update contributing guidance for package-local entrypoint authority.
- [x] 3.3 Update deploy guidance so package deploy scripts stay leaf-local and
  root Turbo owns build prerequisites.

## 4. Verification

- [x] 4.1 Run `bun run lint:workspace-entrypoints`.
- [x] 4.2 Run Turbo dry-runs for MapGen Studio dev/build.
- [x] 4.3 Run Turbo dry-runs for Docs dev/build.
- [x] 4.4 Run Turbo dry-runs for mod deploy tasks.
- [x] 4.5 Run focused MapGen Studio deploy command tests.
- [x] 4.6 Run OpenSpec strict validation.
- [x] 4.7 Run `git diff --check`.
