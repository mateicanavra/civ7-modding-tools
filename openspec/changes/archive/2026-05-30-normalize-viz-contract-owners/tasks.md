## 1. Standard Definition

- [x] 1.1 Define stage/step visualization contract ownership.
- [x] 1.2 Document the allowed file tree and forbidden wrapper/private import
      shapes.

## 2. Source Realignment

- [x] 2.1 Move stage-shared Foundation visualization helpers out of
      `steps/viz.ts`.
- [x] 2.2 Remove wrapper-only Ecology biome visualization re-export paths.
- [x] 2.3 Preserve genuinely step-private visualization helpers in their
      owning step directories.

## 3. Guardrail

- [x] 3.1 Add a categorical guard for shared visualization contracts under
      private step paths.
- [x] 3.2 Cover the guard parser/ownership cases in the guard self-test.
- [x] 3.3 Record the proof boundary in normalization guardrail policy.

## 4. Verification

- [x] 4.1 Run `bun run lint:normalization-guardrails -- --self-test`.
- [x] 4.2 Run `bun run lint:normalization-guardrails`.
- [x] 4.3 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.4 Run OpenSpec validation for this change and all specs.
- [x] 4.5 Run `git diff --check`.
