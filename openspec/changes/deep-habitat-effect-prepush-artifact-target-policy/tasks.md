# Tasks

## 1. Implementation

- [x] 1.1 Add changed-path-aware pre-push target selection in the Nx provider target policy.
- [x] 1.2 Use the changed-path target policy from the pre-push hook service.
- [x] 1.3 Update hook service tests for default and Habitat authority-only paths.
- [x] 1.4 Update harness docs for the authority-only pre-push behavior.

## 2. Verification

- [x] 2.1 Focused hook service tests.
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-prepush-artifact-target-policy --strict`
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 Graph probe for rule authority file changes uses Habitat structural targets instead of generic `check`.
- [x] 2.6 `git diff --check`
