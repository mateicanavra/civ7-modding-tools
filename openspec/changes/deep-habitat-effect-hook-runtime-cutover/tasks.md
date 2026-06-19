# Tasks

## 1. Move And Replace Seams

- [ ] 1.1 Move hook runtime source to `src/domains/local-feedback/**`.
- [ ] 1.2 Replace `runCommand`, `nowMs`, `pathExists`, and `fileHash` options with service requirements.
- [ ] 1.3 Route staged Git reads through `GitProvider`.
- [ ] 1.4 Route Biome and pattern checks through providers.

## 2. Preserve Behavior

- [ ] 2.1 Keep local hook notice in human output.
- [ ] 2.2 Preserve partial-staging refusal.
- [ ] 2.3 Preserve formatter restage-only behavior.
- [ ] 2.4 Preserve pre-push target sequence unless changed by verify/Nx packet.

## 3. Verification

- [ ] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`.
- [ ] 3.2 Run `bun run habitat hook pre-commit`.
- [ ] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 3.4 Run `bun run openspec -- validate deep-habitat-effect-hook-runtime-cutover --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Run `git diff --check`.
