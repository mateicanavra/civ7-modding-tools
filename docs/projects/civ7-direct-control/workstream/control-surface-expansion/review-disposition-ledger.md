# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| DC-REVIEW-001 | P1 | State-role architecture | App UI and Tuner must remain complementary roles, not interchangeable transports. | boundary | accepted | Keep lifecycle/restart/turn/Autoplay status in App UI; keep gameplay/map/control reads and validators in Tuner. | `@civ7/direct-control` wrappers, `implementation-closure.md` | no |
| DC-REVIEW-002 | P1 | Read surface | Broad reads can become unbounded dumps. | product/verification | accepted | Require roots/tables/bounds/limits and return omitted/truncation metadata. | `getCiv7MapGrid`, `getCiv7GameInfoRows`, `inspectCiv7Root`, tests | no |
| DC-REVIEW-003 | P1 | Action surface | Mutations must be validator-first where available, with postcondition/no-repeat evidence and no replay after failure. | product/boundary | superseded | Caller approval contracts were retired by the later approval-removal rebaseline; preserve validator wrappers, before/after result types, and no automatic mutation replay. | package tests and `implementation-closure.md` | no |
| DC-REVIEW-004 | P2 | Catalog/types | Type/catalog output needs provenance rather than guessed declarations. | downstream | accepted | Add TypeBox schemas, static catalog, runtime inspection catalog, and official-resource capability scanner. | `Civ7CapabilityCatalogSchema`, `game catalog` | no |
| DC-REVIEW-005 | P2 | Integration/cleanup | CLI and Studio must call the package boundary, not own socket behavior. | boundary | accepted | Add thin CLI commands and Studio endpoints backed by `@civ7/direct-control`; leave bridge cleanup under accepted cleanup record. | CLI command sources, Studio Vite endpoints | no |
| DC-REVIEW-006 | P3 | Live proof | Live mutation proof is risky without disposable-session boundaries. | verification | waived | Verify mutating wrappers with mock socket before/after proof; record live mutation limit and keep reveal/autoplay gated by proof/no-repeat evidence. | `implementation-closure.md` | no |
| DC-REVIEW-007 | P2 | Post-implementation review | `startCiv7Autoplay()` can start without a turn cap. | product | user-decision | User clarified on 2026-05-31 that unbounded `Autoplay.setActive(true)` is valid and already works; keep audit/proof evidence but do not require `turns`. | `startCiv7Autoplay` allows omitted `turns`; tests prove unbounded start command behavior. | no |
| DC-REVIEW-008 | P1 | Post-implementation review | `configureCiv7Autoplay()` mutated Autoplay without the then-planned approval contract. | product/boundary | superseded | Caller approval was retired by the later approval-removal rebaseline; current safety relies on validator/proof/no-repeat boundaries and no automatic replay. | `configureCiv7Autoplay`, CLI `game autoplay` | no |
| DC-REVIEW-009 | P1 | Post-implementation review | Bounded map/visibility reads could iterate broad bounds before truncation. | verification | accepted | Stop Civ-side bounds traversal at `maxPlots`, report requested plot count and omitted count, and test generated break behavior. | `locationsFromBounds`, visibility grid loop, direct-control tests | no |
| DC-REVIEW-010 | P2 | Post-implementation review | Turn-complete guard defaulted to sendable when native guard was absent. | product/boundary | accepted | Missing `canEndTurn` now reports false, so `sendCiv7TurnComplete` refuses unknown readiness. | `buildTurnCompletionStatusCommand`, `sendCiv7TurnComplete` | no |
| DC-REVIEW-011 | P2 | Post-implementation review | Studio build verification was reported as unreproducible by peer review. | verification | invalidated | Owner reran `bun run --cwd apps/mapgen-studio build` successfully after review; closure proof remains valid. | Studio build output, `implementation-closure.md` | no |
| DC-REVIEW-012 | P2 | Live proof | `Autoplay.setActive(false)` and `isActive === false` can still leave queued autoplay turns resolving. | verification | accepted | Start infers return/observe player and clears pause; stop keeps `setPause(true)`, calls `setActive(false)`, then waits for inactive, player-restored, turn-stable status. | `stopCiv7Autoplay`, direct-control tests, 2026-05-31 live start/stop proof | no |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `superseded`: later accepted product direction replaced the repair demand;
  preserve the durable safety concern under the new mechanism.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.

No material finding may remain undispositioned at phase closure.
