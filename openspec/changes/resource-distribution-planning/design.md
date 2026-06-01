# Resource Distribution Planning Design

## Frame

- Cynefin domain: complicated-to-complex. The code path is inspectable, but the
  desired output range depends on official game constraints, earthlike realism,
  stochastic map generation, and engine feasibility.
- Object: objective frame.
- Lifecycle: novel planning frame for a regression workstream.
- Mode: audience-export for future agents and reviewers.
- Durability: standalone within this OpenSpec change.

### Selection And Salience

- In scope: official resource corpus, resource-stage architecture, resource
  group steps, adapter typed reconciliation, per-resource earthlike
  expectations, local stats gates, generated mod proof, game restart, and
  scripting logs.
- Foregrounded: why planned resource intents collapse after adapter
  materialization, and how each official resource receives dedicated
  operation-owned strategy coverage with measurable expected ranges.
- Exterior: unrelated ecology feature balance except where needed to distinguish
  lotus/reef-family feature visibility from resource placement; unrelated
  Studio UI work; unrelated map identities unless they supply comparison stats.

### Hard Core

- Official Civ7 resource files are evidence for facts, not architecture.
- MapGen owns deterministic resource intent and proof claims.
- The adapter owns engine feasibility, materialization, and readback evidence.
- Every placeable official resource needs explicit strategy coverage before
  closure.
- Resources may become their own stage when the stage has real authoring,
  input/handoff, placement, enablement, trace, helper-ownership, or projection
  surfaces.
- Local stats and in-game runtime logs prove different things and must be
  labeled separately.

### Structural Alternative Considered

Alternative: keep all resource behavior inside the existing
`placement/plan-resources` step. Rejected as the default posture after direct
user correction. It remains an allowable outcome only if the resource-stage
architecture slice proves a specific blocker, such as no stable artifact
boundary or unavoidable duplication with placement product/effect steps.

### Falsifier

Reframe if official resource evidence cannot be mapped to stable type ids and
constraints, if resource groups cannot define coherent input/output artifacts,
or if in-game readback shows adapter `canHaveResource` accepts a materially
different legality surface than the official resource tables imply.

## Team Design

### Axes

- Objective precision: specified/verifiable for planning; exploratory only for
  individual resource realism ranges until evidence is gathered.
- Coupling: parallel read-only discovery in Wave 1, then tightly integrated
  implementation slices.
- Autonomy: agents are empowered inside their evidence packets but do not own
  final authority or repo integration.
- Composition stability: wave-based and fluid.
- Context distribution: partitioned sidecar evidence packets; workstream owner
  integrates.
- Verification mode: process-traced for planning and outcome-checked for tests,
  stats, build/deploy, and runtime logs.

### Roles And Interfaces

| Agent | Accountable Output | Consumes | Hands Off To |
|---|---|---|---|
| Workstream owner | Objective, synthesis, phase state, OpenSpec slice map, Graphite cleanup | All evidence packets | Implementers/reviewers |
| Resource corpus explorer | Complete official resource list and constraints | `.civ7/outputs/resources` | Workstream owner, strategy implementers |
| Regression hotspot explorer | Ranked root-cause hypotheses with commit/file evidence | git history, placement code, tests | Workstream owner, root-cause slice |
| Architecture explorer | Owner boundaries, stage/step options, review checklist | AGENTS, architecture packet, OpenSpec, user decisions | Workstream owner, spec reviewer |
| Verification explorer | Stats, deploy, restart, and log verification matrix | package scripts, tests, CLI/FireTuner code | Workstream owner, verification reviewer |
| Implementer wave | Bounded code/docs/tests per OpenSpec slice | Planning artifacts and accepted findings | Workstream owner |
| Review wave | Product, architecture, spec, and verification findings | Slice artifacts and diffs | Workstream owner |

Every delegated prompt must carry the frame fields: objective, selection and
salience, exterior, hard core, falsifier, expected artifact, and no-edit or
write-set contract.

## Investigation Brief

### Primary Questions

1. Which official Civ7 resources are placeable, and what terrain, biome,
   feature, water, age, class, weight, and distribution constraints does each
   carry?
2. Where did current MapGen behavior stop matching those constraints?
3. Why do rubies appear when most resources do not?
4. Why is lotus visible, and which proof lane should own it as a feature rather
   than a resource?
5. What per-resource earthlike count ranges should each strategy target under
   representative map conditions?
6. What is the right resource-stage decomposition: which resource groups deserve
   steps, what artifacts do they consume and publish, and how does the final
   resource materialization step consume them?

### Secondary Questions

- Do current SDK/adapter constants omit or misorder any official resources?
- Which tests currently prove only aggregate planned/placed counts rather than
  per-resource diversity?
- Which config knobs currently constrain resource candidate catalogs?
- Which in-game logs can prove runtime materialization after local stats pass?

### Evidence Policy

Authority order: direct user instruction, AGENTS routers, accepted architecture
baseline, canonical docs, OpenSpec records, current code/tests, official
resources as evidence, and runtime logs as observation. Claims about root cause
must cite code or commit evidence. Claims about official constraints must cite
resource files. Claims about expected earthlike ranges must cite research notes
or a documented inference rule before becoming gates.

## Official Resource Corpus

Wave 1 parsed 55 official base-standard resources from
`.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml` and
`resources-v2.xml`. The corpus is verified as static official file/load order.
Runtime `GameInfo.Resources` id order remains unverified and is an entry
condition for `resource-corpus-contract`.

| Class | Resources |
|---|---|
| `RESOURCECLASS_BONUS` | `00:COTTON`, `01:DATES`, `02:DYES`, `03:FISH`, `18:HIDES`, `22:WOOL`, `32:WHALES`, `33:COFFEE`, `34:TOBACCO`, `35:CITRUS`, `39:QUININE`, `42:CLAY`, `44:RUBIES`, `47:TIN`, `48:LLAMAS`, `50:WILD_GAME`, `51:CRABS`, `52:COWRIE`, `53:TURTLES`, `54:PITCH` |
| `RESOURCECLASS_CITY` | `06:GYPSUM`, `07:INCENSE`, `09:JADE`, `10:KAOLIN`, `12:PEARLS`, `13:SILK`, `17:CAMELS`, `21:SALT`, `23:LAPIS_LAZULI`, `29:TRUFFLES`, `31:CLOVES`, `37:NICKEL`, `41:MANGOS`, `43:FLAX` |
| `RESOURCECLASS_EMPIRE` | `04:GOLD`, `05:GOLD_DISTANT_LANDS`, `08:IVORY`, `11:MARBLE`, `14:SILVER`, `15:SILVER_DISTANT_LANDS`, `16:WINE`, `19:HORSES`, `20:IRON`, `24:COCOA`, `25:FURS`, `26:SPICES`, `27:SUGAR`, `28:TEA`, `30:NITER`, `36:COAL`, `38:OIL`, `40:RUBBER`, `45:RICE`, `46:LIMESTONE`, `49:HARDWOOD` |

Age overrides matter. Exploration can turn resources including rubies into
`RESOURCECLASS_TREASURE`; Modern introduces `RESOURCECLASS_FACTORY` and updates
several classes. The downstream corpus slice must capture base facts and
age-specific overrides separately.

### Corpus Artifact Contract

The downstream corpus artifact must include, for every official resource row:

- `resourceType` and static file-order slot.
- runtime id verification status: `unverified`, `verified`, or `mismatch`.
- base class and age-specific class overrides.
- valid ages.
- official terrain, biome, feature, water/adjacency, and lake eligibility
  constraint sources.
- map distribution facts: weight, staple/minimum fields, hemisphere fields, and
  map-size modifiers when applicable.
- placeability status: `placeable`, `conditional`, `not-map-placed`, or
  `unknown`, with rationale.
- strategy-required status: `required`, `not-required`, or `blocked`, with
  rationale and owner.

## Integrated Root-Cause Evidence

- `placement/plan-resources` takes an adapter-owned numeric candidate catalog
  and physical fields, then chooses a `preferredResourceType` from a generic
  environmental signature. It does not read official `Resource_ValidBiomes`,
  feature constraints, water/adjacency flags, age validity, or resource class.
- `place-resources` materializes the typed intent through
  `adapter.placeResourceIntent`, and the adapter can reject the intent with
  `cannot-have-resource` when Civ7 says the tile cannot hold that exact type.
- Current world-balance stats measure feature families and geography, but they
  do not yet record per-resource planned, placed, rejected, and mismatch counts.
- `FEATURE_LOTUS` is defined in `terrain.xml`, not in `Resources`, so lotus
  visibility belongs to ecology/feature proof unless a downstream slice changes
  feature strategy.
- Commit hotspot: `c2e9735aa refactor: reconcile placement intent outcomes`
  replaced the earlier official-generator resource path with typed intent
  reconciliation. `1211f7020` had made `generateOfficialResources()` primary
  because deterministic planning was parity-incomplete.
- Hypothesis: rubies likely survive because resource type selection maps high environmental
  signatures into the upper numeric catalog range; `RESOURCE_RUBIES` is id `44`
  and has broad enough valid placements across plains hills, tropical flat/hill,
  and desert hills to pass some engine checks. Promote this only after
  per-resource rejection telemetry confirms the planned/placed/rejected profile.
- Existing mock-adapter tests allow all resources unless overridden, so they do
  not catch habitat rejection collapse.

## Resource Stage Candidate

The next architecture slice should design this as the preferred target unless a
specific blocker is found:

```text
resources stage
  derive-resource-corpus
  score-resource-groups
  plan-resource-groups
  reconcile-resource-intents
  summarize-resource-distribution
```

Candidate group steps should be based on shared official constraints and shared
input/output artifacts, not arbitrary names:

- aquatic/coastal resources: fish, whales, crabs, cowrie, turtles, pearls.
- mineral/stone resources: gold, silver, iron, niter, coal, oil, rubies, tin,
  limestone, gypsum, marble, kaolin, clay, nickel, salt.
- cultivated/wetland resources: rice, cotton, flax, sugar, tea, coffee, tobacco,
  citrus, dates, mangos, quinine.
- forest/pastoral/wild resources: hardwood, rubber, furs, hides, wild game,
  wool, horses, camels, llamas, ivory.
- luxury/cultural/aromatic resources: dyes, incense, jade, silk, wine, cocoa,
  spices, truffles, cloves, lapis lazuli.

The grouping is provisional. The downstream slice must prove the final groups
from official constraints and earthlike domain evidence.

Candidate groups are not step candidates until each group can name:

- consumed input artifacts;
- published output artifact;
- shared invariant across member resources;
- downstream consumer;
- verification boundary.

If those fields cannot be named, keep the bucket as a discovery/research group
rather than a stage step.

## Verification Matrix

| Rail | Command/Path | Proves | Does Not Prove |
|---|---|---|---|
| Local world stats | `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/world-balance-stats.test.ts` | Generator outputs across shipped identities/seeds | Civ7 loaded the mod |
| Resource count tests | `bun run --cwd mods/mod-swooper-maps test -- test/placement/resources-landmass-region-restamp.test.ts test/map-hydrology/lakes-area-recalc-resources.test.ts test/placement/placement-does-not-call-generate-snow.test.ts` | Expected plan vs mock-adapter placement summary | Live game readback |
| Config identity | `bun run --cwd mods/mod-swooper-maps test -- test/config/maps-schema-valid.test.ts test/config/shipped-map-identity.test.ts test/config/studio-presets-schema-valid.test.ts` | Shipped config/schema coherence | Runtime map selection |
| Generated mod proof | `bun run --cwd mods/mod-swooper-maps build` | Source generated local mod artifacts | Deployment or game execution |
| Deploy proof | `bun run --cwd mods/mod-swooper-maps deploy` | Files copied to Civ7 Mods folder | Game selected/executed them |
| Runtime proof | deploy plus `bun run --filter @mateicanavra/civ7-cli dev -- game restart --agent Codex --wait` plus bounded logs | Civ7 loaded map script and ran map generation | Balance correctness without resource telemetry |

Expected log paths: `~/Library/Application Support/Civilization VII/Logs/` and
bridge log `~/Parallels Tunnel/Sid Meier's Civilization VII Development Tools/Comms/civ7-firetuner-bridge.append-only.log`.
Runtime restart commands must include `AGENT=<agent-name>` in bridge requests.

## Downstream OpenSpec Slice Map

| Slice | Status | Write Set | Protected Paths | Review Lanes | Entry Conditions | Stop Conditions | Required Evidence |
|---|---|---|---|---|---|---|---|
| `resource-distribution-root-cause` | planned | placement/resource artifacts, materialize tests, stats support | generated output, corpus strategy tuning | spec, verification | planning branch merged/upstacked; corpus static evidence available | no per-resource telemetry path; runtime id mismatch becomes primary | grouped planned/placed/rejected/mismatch stats by resource id/status/reason |
| `resource-corpus-contract` | planned | adapter/catalog facts, resource corpus module, corpus tests | official resource submodule, generated constants unless regenerated by script | product, architecture, verification | static corpus source files initialized | runtime id order cannot be verified or mismatches without disposition | 55-resource corpus with runtime id status, placeability, constraints, strategy-required status |
| `resource-stage-architecture` | planned | recipe/stage docs, contracts, OpenSpec delta, no behavior tuning | generated output, resource tuning configs | architecture, spec, product | root-cause evidence and corpus contract draft available | no coherent resource-stage artifacts can be named | accepted resources-stage/step artifact design or a proven blocker |
| `resource-strategy-batches` | planned | resource stage/group strategy modules and tests | stage topology unless prior architecture slice lands | product, architecture, verification | corpus and stage architecture accepted | group lacks input artifact, output artifact, shared invariant, or consumer | per-resource strategy coverage and deterministic plan output |
| `resource-distribution-stats-gates` | planned | world-balance stats/tests, research notes | production strategy code except test hooks | product, verification | strategy batch outputs available | earthlike expected ranges lack evidence or inference notes | seed matrix stats with per-resource expected ranges |
| `resource-distribution-runtime-proof` | planned | workstream ledgers and runtime evidence, no generated hand edits | generated source artifacts except via build/deploy scripts | verification, product | local stats pass and deployable mod build exists | game restart unavailable or logs lack bounded map-generation window | deploy, restart command with `AGENT=...`, bounded logs, resource telemetry |

Implementation slices may split further by resource group if per-resource
strategy coverage would make a single branch too broad.
