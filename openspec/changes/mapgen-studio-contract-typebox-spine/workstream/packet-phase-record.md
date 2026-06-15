# D2.5 Packet Phase Record - Contract TypeBox Spine

Status: accepted
Date: 2026-06-14
Domino: D2.5
OpenSpec change: `mapgen-studio-contract-typebox-spine`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D2.5 closes the Studio public contract substrate before D3-D12 add sealed failures, package-owned operation state, current projections, events, and live watcher behavior. It is accepted only when TypeBox is the named public schema origin, Standard Schema wrappers can prove that origin, and app-local operation DTO mirrors are no longer allowed to act as public wire authority.

## Dependencies

- D0 accepted one-mount baseline.
- D1 accepted dev-watch deploy isolation.
- D2 accepted the runtime engine corpus and classified phase/projection artifacts that D2.5 must preserve.
- D3 consumes D2.5 for sealed failure data.
- D4-D6 consume D2.5 for operation DTOs and projections.
- D8-D10 consume D2.5 for event/live schemas.

## Required Review Lanes

- TypeScript/schema authority review.
- Testing/parity review.
- Adversarial residue/orphan review.
- Hardening/prework philosophy review.
- Black-ice disambiguation review.

## Packet Acceptance Stop Conditions

D2.5 cannot be accepted if:

- the packet fails to name a known mixed-baseline residue item, owner, target, and proof gate;
- a proof gate reads as optional, vague, or dependent on chat context;
- required implementation prework is missing from `workstream/prework-ledger.md`;
- baseline entrance proof is missing from packet acceptance records;
- a required implementation closeout has no test/search oracle;
- review finds an unresolved P1/P2 finding.

## Future Implementation Closure Blockers

The D2.5 implementation slice cannot close if:

- any Studio-owned public contract schema lacks a TypeBox owner;
- raw TypeBox schemas are passed directly to oRPC schema slots;
- the TypeBox-to-Standard Schema adapter cannot prove recoverable TypeBox origin;
- Zod import, `z.infer`, or stale Zod contract commentary remains in `@civ7/studio-server` public contract scope;
- Run in Game or Save&Deploy app modules retain public wire DTO authority;
- parity behavior is not explicitly tested or intentionally changed;
- direct `/api` operation paths or public raw operation fields remain unowned;
- `effect-orpc` imports remain outside router/runtime implementation ownership;
- permissive expected-error details remain without D3 deletion/narrowing guard and sanitization proof.

## Packet Acceptance Evidence

Selected baseline:

- Packet authored on the historical pre-settlement Graphite stack branch `codex/runtime-effect-openspec-packets`.
- D2.5 implementation must run on the accepted migrated Nx/Habitat baseline or stop/reroute before code edits.
- Build generated tracked `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` churn; it was restored because generated UI bundle output is outside this docs packet.

Repo-state and verification proof:

- `bun install --frozen-lockfile` passed with no dependency changes.
- `bun run build` passed on the current packet-authoring base.
- `bun run check` passed on the current packet-authoring base with existing mapgen-doc warnings only.
- `git status --short --branch` showed only intended D2.5 docs packet files after generated churn was restored.
- `gt status` showed the same intended docs packet file set.
- `gt log --no-interactive` confirmed `codex/runtime-effect-openspec-packets` stacked above `codex/runtime-effect-refactor-frame`.
- `bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict` passed.
- `bun run openspec:validate` passed, 149/149.
- `git diff --check` passed.

Review acceptance:

- TypeScript/schema authority review accepted D2.5 after schema origin, operation DTO, stale comment, permissive details, and effect-orpc ownership repairs.
- Testing/parity review accepted D2.5 after packet acceptance and future implementation closure were separated.
- Adversarial residue/orphan review accepted D2.5 after raw-control, D3 bridge, app-as-source comment, and effect-orpc ownership repairs.
- Hardening/prework review accepted D2.5 after phase-record blockers and entrance proof gates were repaired.
- Black-ice disambiguation review accepted D2.5 after baseline proof, effect-orpc authority, and D3 bridge timing repairs.
