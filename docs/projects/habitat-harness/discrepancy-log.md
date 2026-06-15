# Discrepancy Log — Architecture Docs vs Code

Per Matei's standing instruction (FRAME.md D5): discrepancies between what
architecture docs say and what code/enforcement actually does are **logged
here, not resolved** during the harness workstream. Review and disposition at
workstream end (or fold into later doc-stewardship passes).

Severity: P1 = doc contradicts enforced reality · P2 = enforcement exists but
docs drift/omit it · P3 = enforced or practiced but entirely undocumented.

Overall finding from the derivation pass: **no code-violates-docs cases were
found** — the codebase is clean against its own rules. Every entry below is
documentation lagging enforcement, which is the favorable direction.

| ID | Severity | Where documented | What code/enforcement actually does | Suggested disposition (decide later) |
|---|---|---|---|---|
| DL-1 | P1 | `packages/sdk/AGENTS.md` underspecifies mapgen surface | G11 enforces: SDK root must NOT import `./mapgen`; `@civ7/adapter/civ7` only importable under `src/mapgen/` (opt-in `@civ7/sdk/mapgen` subpath) | Update SDK AGENTS.md to state the subpath isolation rule explicitly |
| DL-2 | P2 | `lint-domain-refactor-guardrails.sh` has `boundary` vs `full` profiles; narrative domain exempt from stage-root rule | Only `boundary` runs in CI; `full` (JSDoc, schema descriptions, config-merge bans) is opt-in local | Document profile split + narrative exemption in `docs/system/TESTING.md`; decide whether `full` becomes a ratcheted harness rule |
| DL-3 | P2 | not documented | Guardrails full profile forbids op-calls-op imports (ops must not import sibling ops; recipe layer composes) | Document in `docs/system/libs/mapgen/MAPGEN.md` ("Op Structure and Composition") |
| DL-4 | P2 | not documented | Normalization G5 forbids sibling-stage step imports (stage isolation) | Document in `docs/system/mods/swooper-maps/architecture.md` ("Stage Isolation") |
| DL-5 | P2 | `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` stage list | G6 hard-fails when recipe.ts stage order and the doc diverge (docs are enforcement input!) | Keep; document that this doc is lint-checked so agents update both together |
| DL-6 | P2 | full profile only | TypeBox-runtime ban in mapgen-core engine/core paths enforced only in `full` profile, not CI | Decide: promote to ratcheted CI rule or document as local-only |
| DL-7 | P3 | not documented | G10 enforces visualization contract ownership (no shared `steps/viz.ts` hubs; no cross-step private viz imports) | Document in swooper-maps architecture.md |
| DL-8 | P3 | not documented | G8 enforces placement outcome contracts (`resourcePlacementOutcomes`/`discoveryPlacementOutcomes` referenced; legacy generators banned in apply.ts) | Document in swooper-maps architecture.md |
| DL-9 | P3 | mentioned only inside the script | Adapter-boundary allowlist (6 files, CIV-20/CIV-47) tracked only in `lint-adapter-boundary.sh` output | Becomes the rule's ratchet baseline in the harness (slice H5, `habitat-grit-catalog`); also list in `docs/system/DEFERRALS.md` |
| DL-10 | P3 | not documented | Guardrails full profile forbids domain-root `export *` facades (ops only via explicit `/ops` surface) | Document in MAPGEN.md ("Domain Public Surface Contract") |
| DL-11 | P3 | not documented | Recipe import surface is exactly three entrypoints (`@mapgen/domain/<d>`, `/ops`, `/config.js`); contracts vs recipe.ts import different surfaces by rule | Document the surface contract table in MAPGEN.md |
| DL-12 | P3 | `.prettierrc` exists; no doc or gate mentions formatting | No formatting enforcement anywhere (CI or local) | Resolved by slice H4 (Biome); no decision needed |
| DL-13 | P3 | root `AGENTS.md`: "treat generated artifacts as read-only; regenerate via scripts" | Zero enforcement on any generated zone | Resolved by slice H5 (file-layer rules); no decision needed |
| DL-14 | P2 | swooper-maps architecture.md: stage truth/projection separation, typed intent APIs | Prose + partial G-guards only; no general rule | Exterior to this workstream (normalization train owns it); revisit after both trains land |
| DL-15 | P3 | CONTRIBUTING.md: "package-local scripts stay leaf-local" | `@civ7/plugin-*` and `@mateicanavra/civ7-sdk` `test` scripts run bare `vitest run`, which ascends to the ROOT `vitest.config.ts` projects config — each package's test task silently runs the ENTIRE workspace's vitest suites (observed during H1: N copies of all suites in one `test` run, load-flaking the slow studio-emissions tests). mapgen-studio/docs scope correctly via `--project`. | Future rule candidate (workspace-entrypoints family: package-local `vitest run` without `--project` hides workspace orchestration); fix scripts to `vitest run --project <name>` in a later slice or separate change — semantics deliberately preserved in H1 |
| DL-16 | P3 | root AGENTS.md: "treat generated artifacts as read-only; regenerate via scripts" | Tracked build artifact `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` drifted from what `bun run build` produces (fresh build dirties it; its package test fails on a `from "net"` leak — pre-existing red on main). Exactly the generator-drift class H5's regenerate-and-diff gate will catch. | Out-of-scope fix task spawned (net-import leak); H5 zone rules will prevent recurrence |

Maintenance: append new entries during execution slices as agents find them.
Do not resolve in-slice unless the slice's own scope requires it.
