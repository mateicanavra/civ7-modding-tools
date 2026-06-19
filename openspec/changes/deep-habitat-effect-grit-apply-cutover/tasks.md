# Tasks

## 1. Grit Adapter

- [ ] 1.1 Move Grit command construction and parsing to `src/providers/grit/**`.
- [ ] 1.2 Route docs apply and apply dry-run command construction through `GritProvider`.
- [ ] 1.3 Move cache acquisition to scoped filesystem resources.
- [ ] 1.4 Preserve existing scan-root refusal and output parsing contracts.

## 2. Transaction Consumption

- [ ] 2.1 Consume the already-migrated `TransformationTransaction` and `ProtectedZoneAuthority` services.
- [ ] 2.2 Replace process-layer option with provider Layers in Grit adapter callsites.
- [ ] 2.3 Preserve D9 refusal reasons and recovery instructions.

## 3. Tests And Proof

- [ ] 3.1 Update fake-provider tests for Grit unavailable, command failed, parse failed, and cache missing states.
- [ ] 3.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/pattern-apply.test.ts`.
- [ ] 3.3 Run `bun run --cwd tools/habitat-harness validate:grit-patterns`.
- [ ] 3.4 Run `bun run habitat check --tool pattern-check --json`.

## 4. Validation

- [ ] 4.1 Run `bun run openspec -- validate deep-habitat-effect-grit-apply-cutover --strict`.
- [ ] 4.2 Run `bun run openspec:validate`.
- [ ] 4.3 Run `git diff --check`.
