# D6 Packet Phase Record - Operations Current

Status: accepted
Date: 2026-06-14
Domino: D6
OpenSpec change: `mapgen-studio-operations-current`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D6 exposes daemon-owned operation truth through `studio.operations.current` and deletes browser-owned operation recovery. D4 owns runtime current projection, terminal-retention, expiry tombstones, TTL pruning, and daemon identity. D5 workflows publish operation transitions into that runtime. D6 makes `apps/mapgen-studio/src/app/operationAdoption.ts` and `StudioShell.tsx` consume the projection at boot while protecting D8/D9 event surfaces.

## Dependencies

- D0 accepted one-mount baseline.
- D1 accepted dev-watch deploy isolation.
- D2 accepted runtime effect corpus.
- D2.5 accepted TypeBox public contract spine.
- D3 accepted error spine and typed not-found vocabulary.
- D4 accepted `StudioOperationRuntime` lifecycle/current ownership.
- D5 accepted package-owned workflow pipelines and operation transition publication.
- D8/D9 consume D6 boot adoption when replacing status polling with events/push.

## Required Review Lanes

- Runtime projection / D4 ownership review.
- Browser recovery deletion review.
- TypeBox/schema projection review.
- Testing/parity review.
- Hardening/prework philosophy review.
- Black-ice disambiguation review.
- Downstream D8/D9 realignment review.

## Packet Acceptance Stop Conditions

D6 cannot be accepted if:

- browser localStorage operation recovery remains a valid path;
- `operations.current` reads app-local stores instead of D4 runtime projection;
- TypeBox schema origin is unclear;
- TTL/status agreement is not specified;
- fresh-daemon empty truth is not specified;
- client adoption can replay persisted request ids into status calls;
- unrelated localStorage owners are not protected from deletion;
- active operations are duplicated into terminal-only `recent`;
- expired-known tombstones and physically pruned ids collapse into the same status outcome;
- D8/D9 polling/event scope is conflated with D6;
- review finds unresolved P1/P2 findings.

## Future Implementation Closure Blockers

The D6 implementation slice cannot close if:

- `studio.operations.current` bypasses `StudioOperationRuntime.current`;
- operation current DTOs are Zod-backed or broader than TypeBox validation;
- expected current/status misses use raw errors, status-code truth, or public unknown details;
- production browser code reads or writes Run in Game / SaveDeploy operation recovery keys;
- retained parser/snapshot helpers have any storage read/write path;
- boot adoption can synthesize active operations from browser-only persisted request ids;
- status polling is broadened beyond existing active-operation polling before D8/D9;
- localStorage authoring/view/theme/preset owners are changed without owning scope;
- negative searches for operation recovery bridge symbols are unresolved;
- package/app gates and focused adoption/current tests are absent.

## Packet Acceptance Evidence

Review:

- Runtime lifecycle semantics: accepted by Newton.
- Browser recovery deletion / protected storage: accepted by Russell.
- TypeBox/schema/testing adequacy: accepted by Boole.
- Hardening/prework/black ice: accepted by Mendel.

Verification:

- `bun install --frozen-lockfile` passed on 2026-06-14 with no dependency changes.
- `bun run build` passed on 2026-06-14. The build dirtied `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`; that generated output was restored because it is outside the D6 packet write set.
- `bun run check` passed on 2026-06-14. `lint-mapgen-docs` emitted the existing three `@mapgen/*` warnings and exited OK.
- `bun run openspec -- validate mapgen-studio-operations-current --strict` passed.
- `bun run openspec:validate` passed 151/151.
- `git diff --check -- openspec/changes/mapgen-studio-operations-current` passed.
- Dirty-file quarantine after gates: only D6 packet docs and `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` are dirty.
