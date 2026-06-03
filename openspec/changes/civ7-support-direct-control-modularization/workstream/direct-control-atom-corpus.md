# Direct-Control Atom Corpus

This ledger has the completed direct-control inventory reports merged. It is
still pre-code planning: do not edit direct-control source until the target atom
row names exact source ranges, module owner, public/private exports, required
tests, consumers, and proof class for the slice.

| Atom Candidate | Source Region | Proposed Owner | Existing Evidence / Consumers | Required Before Extraction | Runtime Proof | Status |
|---|---|---|---|---|---|---|
| Public constants/types/schemas | `index.ts` lines 8-1780: tuner defaults, state names, command constants, API roots, bounds, `Civ7ComponentIdSchema`, runtime probe and play result/input types, operation/postcondition types, capability catalog schemas | `src/primitives/*`, `src/types/*`, `src/constants/*` with package barrel compatibility | Direct package type/check tests; CLI and Studio import public barrel | Inspect protected direct-control TODO stash; add API-shape tests before moves | not runtime proof for type-only extraction | Planned after CLI tests stabilize. |
| Transport/session/framing | `index.ts` lines 1817-2076 and 3758-3904: config, endpoint discovery, `Civ7DirectControlSession`, state selection, frame encode/parse, socket lifecycle, pending requests | `src/session/{config,error,state,frame,socket,session,execute}.ts` | Direct package tests around health/session/framing; all CLI/Studio consumers through package API | Focused session/framing package suite and unchanged exports | no live proof for pure move; runtime proof for reconnect/state behavior changes | Planned; direct-control owned only. |
| Runtime command source builders | `index.ts` lines 3909+ and 4714-4847: command builders and embedded JS helpers | `src/runtime-sources/*` and atom-local source modules | Direct package tests often match function names; CLI consumers invoke package wrappers | Exact string/source behavior equivalence tests before moves | runtime proof required for embedded JS behavior changes | Planned; high-risk source surface. |
| Notification HUD/materialization | Play types around 913-1000, wrapper around 2925, builder around 4714, source around 5119+ | `src/play/notifications/{view,details,decision-hints}.ts` | CLI notification HUD/queue tests; direct package notification tests | Finish CLI HUD extraction and add focused direct-control notification tests | runtime proof for live HUD/source behavior changes | Planned after CLI HUD suite. |
| Notification dismissal/verification | Types around 1005-1045, wrappers around 2935/2946, source around 7491, polling/identity verification around 10472-10534 | `src/play/notifications/{dismissal,verification}.ts` | CLI exact dismiss and dismiss-queue tests; direct package dismissal tests | Finish exact dismiss CLI extraction; add package verification tests | runtime proof for timing/routes/identity behavior changes | Planned after exact dismiss suite. |
| Operation validation/send/postconditions | Operation types around 1190-1341, wrappers around 2996-3130, builders 4722/4729, router around 7753, classifiers 10660-11224 | `src/play/operations/{families,validate-request,postconditions,production-choice,chooser-closeouts}.ts` | CLI operation wrappers/unit-target/production/population/progression tests; `game-play-shared.ts` remains CLI-owned | Focused package operation/postcondition tests; preserve approval-first semantics | runtime proof for mutation/postcondition behavior changes | Planned after CLI command surfaces stabilize. |
| Ready unit/city/move preview | Ready-unit types 1392-1449, move preview 1451-1482, ready-city 1484-1549, wrappers 3313/3328/3344, sources 9094/9343/9481 | `src/play/ready/{unit,city,move-preview}.ts` | CLI ready-unit, ready-city, unit-move-preview suites; direct package tests | Preserve host/port fixture note; add package atom tests before source moves | runtime proof for live read/source behavior changes | Planned. |
| Tactical/progression/read lenses | Unit target source 8041, settlement 8258, target candidates 8349, battlefield 8637, destination 8927, traditions 4864, progress dashboard 4975 | `src/play/tactical/*` and `src/play/progression/*` | CLI tactical/progression/settlement/unit-target suites; direct package tests | Relationship-label review and proof boundaries before stronger labels | read-only live proof only when claiming runtime behavior | Planned; relationship invariant protected. |
| Capability catalog and proof/log support | Static entries around 10089, catalog exports 3594/3616, file/log proof helpers 3694-3758 | `src/catalog/*` and `src/proof/*` | Direct package catalog/proof tests and Studio consumers | Source owner and generated-output boundary review | runtime proof only for live proof behavior claims | Planned. |

## Forbidden Owners

- CLI must not own raw socket framing, state discovery, reconnect polling,
  embedded runtime JS, or postcondition classification.
- Direct-control must not own CLI flag parsing, compact envelope formatting,
  batch dismissal policy, or command-specific human guardrail prose.
- oRPC must compose stable direct-control atoms; it must not fork runtime source
  strings or define new proof semantics.
- Effect can be evaluated for transport/stream/fixture mechanics, not introduced
  as gameplay policy ownership before atom seams exist.
