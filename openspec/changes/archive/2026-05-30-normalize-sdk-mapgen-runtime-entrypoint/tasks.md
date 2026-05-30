## 1. Spec And Target Shape

- [x] 1.1 Define the SDK root versus SDK mapgen runtime entrypoint boundary.
- [x] 1.2 Record affected owners, forbidden owners, write set, and verification
      gates.

## 2. Source Realignment

- [x] 2.1 Remove the SDK root re-export of the mapgen runtime subpath.
- [x] 2.2 Document why `@mateicanavra/civ7-sdk/mapgen` is the explicit Civ7
      map runtime import surface.
- [x] 2.3 Verify first-party map entrypoints already consume the mapgen
      subpath.
- [x] 2.4 Remove stale stage keys outside built-in Studio preset `config`
      wrappers.

## 3. Guardrail

- [x] 3.1 Add categorical guard coverage for SDK root runtime safety.
- [x] 3.2 Cover the guard helper/parser cases in the guard self-test.
- [x] 3.3 Record the proof boundary in normalization guardrail policy.
- [x] 3.4 Tighten reusable preset wrapper validation so tests catch unknown
      root wrapper keys categorically.

## 4. Verification

- [x] 4.1 Run `bun run lint:normalization-guardrails -- --self-test`.
- [x] 4.2 Run `bun run lint:normalization-guardrails`.
- [x] 4.3 Run `bun run --cwd packages/sdk build`.
- [x] 4.4 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.5 Run `bun run --cwd mods/mod-swooper-maps test -- test/config/studio-presets-schema-valid.test.ts`.
- [x] 4.6 Run `bun run --cwd packages/mapgen-core test`.
- [x] 4.7 Run `bun run build`.
- [x] 4.8 Run `bun run deploy:mods`.
- [x] 4.9 Run OpenSpec validation for this change and all specs.
- [x] 4.10 Run `git diff --check`.
