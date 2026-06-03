# Direct-Control Game Controller Bridge Proof Ledger

## Proof Classes

| Class | What It Proves | Current Status |
| --- | --- | --- |
| Source-backed native rail | Civ7 modinfo supports `scope="game"` and `scope="shell"` `UIScripts`; official UI loads scripts through those rails | Proven by official resources and installed mods |
| Source-backed controller pattern | Game App UI scripts can listen to browser/engine events and call game-side helpers | Proven by official `tuner-input.js` and normal UI operation code |
| Shared oRPC/Effect substrate | Repo control APIs already use Effect-backed oRPC procedure/router/context patterns that can be reused as the controller/API/intelligence service substrate | Source-backed in direct-control package; not yet proven inside deployed Civ App UI runtime |
| Live read-only parity | App UI game context can read the same major gameplay roots and representative values checked in Tuner | Proven in current running game |
| Project-owned controller lifecycle | This repo's controller mod deploys, loads, exposes a global, and survives reload/restart/load-save/turn changes | Not yet proven |
| Controller read parity | Project-owned controller methods match existing direct-control wrappers on the same turn | Not yet proven |
| Controller validation parity | Project-owned `operations.validate` matches existing operation validators | Not yet proven |
| Disposable approved mutation | Controller executes one direct-control-approved action exactly once with semantic postcondition readback | Not yet proven |

## Evidence

| Evidence | Source | Claim Supported | Boundary |
| --- | --- | --- | --- |
| Official `base-standard.modinfo` and `core.modinfo` contain separate `scope="game"` and `scope="shell"` action groups with `UIScripts`/`ImportFiles` | `.civ7/outputs/resources/Base/modules/**` | Native deployment rails exist | Source-backed only |
| `component-support.js` creates script tags and loads initial scripts | `.civ7/outputs/resources/Base/modules/core/ui/component-support.js` | `UIScripts` load into active UI document | Source-backed only |
| Official `tuner-input.js` is a game-scoped UI script and listens for `tuner-user-action-a/b` browser events | `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js` and `core/ui/input/action-handler.js` | Native game-side controller pattern exists | Source-backed only |
| Installed LF policies/yields preview attaches `globalThis.LfYieldsPreview` from a game-scoped `UIScripts` item | Local deployed Mods folder | Public global API pattern exists | Local mod evidence, not project-owned |
| Live App UI/Tuner parity probe | `bun run --cwd packages/cli dev game exec ...` against `127.0.0.1:4318` | App UI game context has major read/action roots and representative value parity | Current live session only |
| Direct-control raw wrapper source | `packages/civ7-direct-control/src/index.ts` | Existing wrappers are migration sources | Source evidence only |
| Direct-control oRPC/Effect source | `packages/civ7-direct-control/src/orpc/**` | Existing oRPC/Effect patterns cover typed procedure contracts, in-process callable clients, context, approval policy, and managed runtime | Source evidence only; controller still needs game-runtime proof |

## Promotion Gates

1. Source-backed rail: complete.
2. Live read-only parity: complete for representative roots/values checked on
   2026-06-03.
3. Controller oRPC/Effect source slice: required before treating the controller
   API as more than serialized ingress.
4. Project-owned deployed controller lifecycle: required before product callers
   depend on the controller.
5. Read parity: required before migrating each wrapper family.
6. Validation parity: required before using controller validation for approved
   action flow.
7. Disposable approved mutation: required before enabling
   `actions.executeApproved`.
8. Long lifecycle proof: required before removing raw diagnostic wrappers or
   making controller absence a hard failure.
