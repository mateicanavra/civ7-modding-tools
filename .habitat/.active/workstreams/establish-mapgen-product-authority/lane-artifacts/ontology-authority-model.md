# Authority Ontology Model For Layer 2 Rule Remediation

Status: lane artifact, non-mutating investigation output

Date: 2026-07-01

Lane: ontology authority model

Scope: model the authority ontology needed for future Layer 2 rule-remediation
decisions. This artifact does not inspect source code and does not classify any
rule for implementation.

## Competency Questions

Packet authors need the ontology to answer these questions, not to inventory
every noun in the docs:

1. What authority surface would make a negative rule unnecessary,
   mechanically derivable, honestly owned, safely deleted, or good enough to
   leave alone?
2. Is the rule about an accepted constructible kind, a candidate kind, a
   bounded context, a native validation rail, or only stale/local evidence?
3. Does the whole rule belong to one owner and proof shape, or must it split by
   owner, context, stage kind, product surface, or evidence class?
4. Is a local rule a true context rule, or is it a proxy for a broader positive
   authority surface?
5. Is a forbidden literal live recurrence risk, or stale migration vocabulary
   that should retire without replacement?
6. Which evidence class can support the decision: accepted packet, canonical
   MapGen reference, Layer 1 ledger, generated-output proof, or Lane 4 source
   constructibility?
7. What alias or near-synonym would cause packet authors to merge, split,
   falsely promote, or delete the wrong thing?

## Evidence Strata

Use these strata in every packet. Evidence is not truth unless promoted by the
source hierarchy.

| Stratum | Meaning | Packet use |
| --- | --- | --- |
| Accepted authority | Current user instruction, AGENTS/process routing, accepted project baseline, canonical MapGen reference docs, accepted frames | Can define owner, accepted concept, relation semantics, or decision vocabulary |
| Operational ledger | `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json` | Canonical operational source for Layer 1 rows, packet queue, blockers, and action decisions |
| Candidate authority | Ledger rows, queued slices, `_blueprints` pressure, local negative proxies, unresolved semantic blockers | Can seed Layer 2 packet design; cannot be treated as accepted kind until affirmed |
| Raw evidence | Rule manifests, runners, generated output, code, tests, docs examples, official resources | Not inspected in this lane except listed docs/ledger; implementation status requires Lane 4 source-constructibility evidence |
| Contradiction | Source or ledger fact that falsifies a proposed owner/action, e.g. Grit ignoring tests or source proof showing mixed owners | Must be preserved; cannot be smoothed into "no action" |
| Stale or retired claim | Superseded docs, retired rows, migration literals, generated output as policy | Can justify deletion or supersession, not live authority by itself |

## Accepted Core Concepts

These are the reviewed concepts already supported by the scoped sources.

| Concept | Identity rule | Accepted meaning | Evidence status |
| --- | --- | --- | --- |
| `rule` | Stable `rule.json.id` | Live Habitat authority predicate plus runner/support/baseline/path coverage | Accepted process concept |
| `action-decision` | One value from Rule Action Classification vocabulary | Primary remediation lane: no action, split, consolidation, retirement, positive authority creation, closed structure inversion, boundary inversion, context admission, runtime/source validation, metadata repair | Accepted process concept |
| `decision-packet` | One n = 1 record for a classified rule needing action | Clause-level semantic decision consumed by later implementation | Accepted process concept |
| `clause` | Atomic predicate part that can be owned/proved/acted on independently | Unit for split, owner, proof class, and disposition | Accepted process concept |
| `owner` | Authority boundary that owns the invariant | Package/domain/product/context/native rail that can truthfully own the clause or whole rule | Accepted architecture/product concept |
| `forbidden-owner` | Tempting but false destination | Boundary that must not receive the invariant, even if current path suggests it | Accepted decision-packet concept |
| `proof-class` | Named proof shape | Manifest/schema, runner/support path, source absence/presence, boundary graph, closed structure, native rail, focused Habitat check, generated execution-surface, manual source judgment | Accepted process concept |
| `constructible-kind` | Kind with multiplicity, anchors, governance, validator/generator/repair surface, instance contrast, and boundary | A future blueprint kind Habitat could generate, validate, repair, or migrate | Accepted blueprint-kind concept |
| `bounded-context` | Smallest honest niche/product/domain/stage context | Context where another valid instance may differ without violating a broader blueprint | Accepted authority-tree concept |
| `artifact` | Dependency id / contract product with `artifact:*` identity | Write-once published value; read as immutable; buffers/fields are a narrow mutation exception | Accepted MapGen concept |
| `field` | `field:*` dependency tag | Mutable buffer/performance exception, published once and mutated in place | Accepted MapGen concept |
| `effect-tag` | `effect:*` dependency tag | Effect dependency id, often projection/materialization-facing when `effect:map.*` | Accepted MapGen concept |
| `dependency-tag` | Registered string id with kind | Step `requires/provides` wiring validated by `TagRegistry`; metadata, not artifact edge in recipe DAG | Accepted MapGen concept |
| `stage` | Recipe-level authoring/config/ownership surface | Stage exists for authoring surface, input/handoff, placement, enablement, trace identity, helper ownership, or projection boundary | Accepted MapGen concept |
| `step` | Executable contract boundary | Owns id, phase, requires/provides, artifact requirements, config schema, op binding, input building, bounded orchestration | Accepted MapGen concept |
| `domain` | Pure semantic/algorithm owner | Owns pure algorithms, contract-first ops, strategies, rules, domain types, reusable semantics | Accepted MapGen concept |
| `domain-operation` | Stable op contract and implementation envelope | Pure domain operation bound by id; must not own runtime context, recipe ordering, adapter calls, or stage orchestration | Accepted MapGen concept |
| `domain-operation-strategy` | Strategy id plus strategy-specific config | Variant implementation inside a domain-operation strategy envelope | Accepted as admitted blueprint from Layer 1 slice, source constructibility not rechecked here |
| `config` | Authoring input / compiled config surface | Stage config default is flat `{ knobs?, [stepId]?: stepConfig }`; persisted `advanced` wrappers are migration concern unless a genuine surface transform exists | Accepted MapGen concept |
| `projection` | Truth-to-Civ7 materialization/readback lane | `map-*` stages consume truth artifacts and emit engine-facing fields/effects, artifacts, parity diagnostics, or projection knobs | Accepted MapGen concept |
| `recipe` | Global stage/step order and enablement | Recipe array owns ordering; dependency tags are gates, not independent topology | Accepted MapGen concept |
| `Studio runtime` | MapGen Studio app/runtime/UI/worker/server boundary | Owns visualization, viewers, workers, UI behavior, trace/dump presentation; not generation truth | Accepted product/architecture concept |
| `SDK/core` | Public SDK and pure MapGen core boundary | SDK owns mod authoring API/XML contracts; MapGen core owns deterministic generation model and pure pipeline contracts | Accepted product/architecture concept |

## Candidate Kind Map

These candidates are useful only because they change Layer 2 packet decisions.
They should not be promoted from names alone.

| Candidate | Current pressure | Affirmation status | Layer 2 use | Lane 4 need |
| --- | --- | --- | --- | --- |
| `generated-zone` / protected generated surface | Repeated generated-output hand-edit guards for Civ7 types and map-policy tables | Candidate constructible kind | Test whether one positive generated-zone authority can absorb local output-text checks | Source constructibility for anchors, generation commands, instances |
| `resource-derived-package` | Map-policy purity, generated tables, provenance labels | Candidate bounded package kind | Separate package authority from generated-output proof and resource evidence | Source constructibility for package surfaces and generator/verify rails |
| `adapter-capability` / approved engine-generator surface | Adapter-thin rules and old generator-token blacklists | Candidate capability authority | Replace token blacklist with approved adapter/runtime surface authority | Source constructibility for adapter methods and direct runtime imports |
| `deterministic-authored-generation` | Ambient RNG and legacy generator/fudge rows | Candidate policy authority | Decide exception policy and split deterministic generation from lexical cleanup/projection/runtime clauses | Source constructibility for exception sites and RNG surfaces |
| `helper-surface` | Runtime/helper redeclaration and Foundation helper local proxy | Candidate positive authority | Consolidate generic helper ownership before deleting or moving Foundation proxy | Source constructibility for helper catalog/scope and redeclarations |
| `standard-stage-kind` | Truth/projection/product stage-kind missing; local stage guards compensate | Candidate taxonomy, not a stage | Enable kind-aware rules such as no `artifact:map.*` or runtime tokens in truth contracts | Source constructibility from recipe/manifest/stage contracts |
| `dependency/effect-tag-family` | Tag catalog suffix/owner-token and retired effect-token rows | Candidate schema/registry authority | Replace root-catalog string scans with registered tag-family owner/kind validation | Source constructibility from TagRegistry definitions and catalogs |
| `domain-operation-generic-surfaces` | Ecology/Foundation local op topology, quality, strategy locality, config-bag rows | Candidate closed structure / positive authority | Decide which local rows become generic domain-operation rules and which stay context residue | Source constructibility for operation roots and exception/support dirs |
| `standard-stage-public-config-and-contract-surface` | Foundation-only stage/step config metadata, cast/default merge, sentinel passthrough | Candidate boundary authority | Split public compile/schema metadata from exact retired Foundation residue | Source constructibility for public schemas, focus paths, step contracts |
| `Studio UI/runtime recipe artifact boundary` | Studio UI imports and runtime/build-output rows | Candidate boundary authority | Split UI-vs-worker/runtime source authority from Nx/build-output currentness | Source constructibility for app/server/worker surfaces |
| `public-domain-test-import-surface` | Public domain surfaces in tests, with Grit test-file scan falsifier | Candidate split | Requires either test-file scan capability or public/internal test-policy split | Source constructibility plus Habitat/Grit capability evidence |
| `morphology-story-overlay ownership` | Story overlay publisher/artifact blockers | Semantic gate, not internally affirmed | Preserve as unresolved product/architecture decision before implementation | Source constructibility insufficient without owner decision |

## Alias And Merge Risks

| Term pair / cluster | Risk | Packet rule |
| --- | --- | --- |
| `artifact` vs `field` / `buffer` | Mutability rules differ; `field:*` is not ordinary write-once artifact authority | Do not merge; model buffer/field as exception |
| `dependency-tag` vs `artifact edge` | Recipe DAG only turns explicit artifact contracts into artifact edges; step tags remain metadata | Do not infer graph topology from tags alone |
| `effect:map.*` vs `artifact:map.*` | Both often signal projection/materialization, but one is effect dependency and one is handoff artifact | Keep kind separate; relate through projection surface |
| `stage` vs `folder` vs `phase` | Folder/debug grouping/phase display can impersonate stage authority | Promote only when stage promotion rule passes |
| `truth stage` vs `map-* stage` | `map-*` is projection/materialization, not upstream truth | Do not place truth/scoring/planning under `map-*` |
| `domain-operation` vs `domain-operation-strategy` | Strategies are variants inside op envelopes, not sibling operations | Do not promote strategy locality into op topology without distinction |
| `config` vs `Studio grouping` | UI grouping does not define persisted config contract | Keep persisted config flat unless genuine transform is accepted |
| `SDK/core` vs `adapter` | Pure core must not import Civ7 runtime; adapter owns runtime boundary | Split by owner when rules match type imports, declarations, or runtime values differently |
| `generated output` vs `source truth` | Generated output proves a run/artifact, not product policy | Move correctness to generator/source/verify rail where possible |
| `Swooper Maps` vs `mod-map` | Current concrete instance can be mistaken for constructible kind | Keep instance and kind separate |
| `map-mod` vs `mod-map` | Wrong alias reverses intended base-kind/variant signal | Use `mod-map`; treat `map-mod` as rejected alias |
| `RunSettings` vs `Env` | Legacy docs may preserve stale vocabulary | Canonical term is `Env`; preserve as stale alias only |
| `buffer:*` vs `field:*` | Spec naming drift can create a fake third concept | Canonical current runtime naming is `field:*`; `buffer:*` is stale/spec alias |

## Relationship Semantics

Use typed relationships only where they answer packet decisions.

| Relationship | Direction | Semantics | Evidence requirement |
| --- | --- | --- | --- |
| `owns` | owner -> concept/rule/clause | Owner has authority to define, validate, or change the invariant | Accepted docs or decision packet evidence |
| `must-not-own` | false owner -> rule/clause | Destination would collapse boundaries or preserve wrong authority | Packet clause table or accepted boundary docs |
| `governs-every-instance-of` | rule -> constructible-kind | Whole rule applies to every valid instance of kind | Blueprint affirmation plus whole-rule fit |
| `governs-context-only` | rule -> bounded-context | Another valid instance may differ without violating broader kind | Context admission or packet evidence |
| `requires-authority` | candidate/local proxy -> missing positive authority | Current negative/local rule points to absent constructible schema/kind/boundary | Layer 1 ledger or decision packet |
| `splits-into` | rule -> clause(s) | Predicate has multiple owners or proof shapes | Decision-packet clause decomposition |
| `replaces` | positive authority/native rail -> rule | New accepted authority makes old rule unnecessary | Decision packet and implementation receipt |
| `retires-without-replacement` | retired literal/rule -> null | No live recurrence risk remains | Source absence proof plus record reconciliation; Lane 4 if source needed |
| `validates-tags-for` | TagRegistry -> dependency-tag family | Registry owns tag kind/id validity | Canonical reference; source constructibility for live definitions |
| `publishes` | step/domain/stage -> artifact/field/effect | Producer emits contract product/effect; artifact is write-once unless field exception | Step/artifact contract evidence |
| `projects-to` | projection stage -> Civ7 engine/mod surface | Consumes truth and materializes/records engine-facing outputs | Accepted truth/projection policy; source/runtime proof later |
| `aliases` | alias -> canonical identity | Alias names same concept in same bounded context | Accepted docs or explicit packet note |
| `conflicts-with` | claim -> claim | Evidence cannot both be accepted in same context | Contradiction or stale-source record |
| `requires-lane-4-evidence` | candidate/claim -> source constructibility | Implementation status or source anchors were not inspected in this lane | This lane artifact or packet blocker |

## Packet Decision Implications

1. Start each Layer 2 packet with an evidence-status field: accepted authority,
   candidate, raw evidence, contradiction, stale, or Lane 4 required.
2. Do not convert a local negative proxy into `context admission` until the
   packet asks whether a broader positive authority would collapse more state.
3. Use `positive authority creation` when the rule points to a missing
   constructible kind, schema, boundary graph, helper surface, generated-zone,
   tag-family validator, or adapter capability.
4. Use `closed structure inversion` when the rule forbids stray shapes that
   should be replaced by allowed file/tree/contract topology.
5. Use `boundary inversion` when the rule forbids leaks and should become an
   allowed import/dependency/public-surface graph.
6. Use `split by owner` when one predicate spans source/runtime, type/value,
   truth/projection, public/internal tests, generated/source, or
   context/generic authority.
7. Use `retirement/garbage collection` only after recurrence risk is judged.
   Retired literals do not deserve replacement rules without concrete risk.
8. Treat generated output, build output, and in-game/runtime checks as proof
   classes, not policy owners.
9. Preserve semantic blockers as blockers. The morphology/story overlay
   decision requires product/architecture authority, not a clever local move.
10. Mark all implementation-currentness claims in this lane as requiring Lane
    4 source-constructibility evidence.

## Stop Rule For Future Ontology Growth

Add a concept only when it changes one of these packet outcomes:

- admits or rejects a constructible kind;
- separates owner from forbidden owner;
- changes whole-rule fit vs split;
- converts negative proxy to positive authority;
- distinguishes retirement from replacement;
- identifies proof class or proof limit;
- prevents an alias merge or stale claim from becoming authority.

Everything else belongs in evidence notes, not the ontology core.
