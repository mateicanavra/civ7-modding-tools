# Domain Model Config Law Investigation Brief

Status: reviewed and executed

Prepared at: 2026-07-04

Frame source:

- `../../frame.md`
- `../../single-prework-decision-frame.md`
- `../../inventory.md`
- `../../../../decision-book/content-classes.md`
- `../../../../decision-book/owner-boundaries.md`
- `.habitat/scopes/domain/scopes/model/scopes/schemas/scope.md`
- `.habitat/scopes/domain/scopes/model/scopes/schemas/files/schema-primitive-ts.md`

## Readiness

Inquiry status: complete.

Frame status: committed enough for investigation.

Execution status: investigation only. This brief does not authorize source
movement, refactors, test rewrites, public-schema removal, or `structure.toml`
changes.

## Frame Carried Forward

WHAT:
run a short but discriminating metrics and semantic investigation pass for the
active `Domain Model Config Law` prework decision.

WHY:
the next prework pass needs to know which apparent config surfaces are real
domain schema primitives, which are stage-owned authoring surfaces,
which are operation/strategy contracts, which are domain policy, and which are
facade residue or deletion candidates. The goal is to collapse ambiguity before
row-level disposition, not to gather an unconstrained catalog.

In scope:

- root and per-domain `config.ts` files;
- shared domain knobs and knob multiplier files;
- operation config schemas and repeated operation input/schema fragments;
- artifact property schemas where they overlap operation/stage/domain concepts;
- stage public schemas, `knobsSchema`, and `compile` functions as evidence for
  stage-owned authoring surfaces;
- import graphs, symbol references, project ownership, and file history needed
  to classify the above.

Foreground:

- public schemas that are wrappers or mirrors and could potentially be removed
  later without losing intentional stage UX;
- public schemas whose compile path contains policy or mapping semantics that
  must not be deleted blindly;
- repeated operation input fragments and artifact property fragments that prove
  reusable domain primitives;
- broad config facades whose contents are evidence rather than destination
  authority.

Exterior:

- implementation, source movement, deletion, public-schema removal, and
  topology ratcheting;
- deciding the full row disposition table for the entire prework item;
- changing artifact file shape or foundation-lib work already closed elsewhere;
- treating filename matches as owner proof.

Hard core:

- stages own recipe authoring surfaces: public schemas, `knobsSchema`,
  public-to-internal `compile`, and local step composition;
- operations own operation/strategy contract config;
- domains may own reusable semantic primitives, schemas, types, enums,
  invariants, defaults objects, and object-local normalizers that stages and
  operations compose;
- reusable semantic policy routes to `model/policy/`, not `model/config/`;
- reusable schema primitives route to `model/schemas/`, not `model/config/`;
- broad root/per-domain `config.ts` barrels are evidence or transitional import
  surfaces, not destination authority;
- no false third config model should be invented.

Assumptions committed:

- metrics are useful only when they discriminate owner classes or likely
  execution slices;
- current code is evidence, but current path is not authority;
- public-schema removal is a candidate simplification strategy, not a law until
  blast radius and semantics are known.

Structural alternative considered:
remove public schemas globally first. Rejected for this investigation because
there are many `public + compile` stages, and semantic compile logic may encode
stage policy or intentional UX.

Falsifier / reframe trigger:
if investigation shows public schemas are the only durable authoring API for
important map presets or callers, or if domain `config.ts` files own stable
public surfaces by explicit authority rather than accident, the prework frame
must stop treating public-schema removal as an easy simplification lane.

## Investigation Objective

Objective:
produce a path- and symbol-grounded corpus that answers what information
actually matters for the `Domain Model Config Law` decision: where public
schemas are mirrors vs semantic authoring surfaces, where repeated operation or
artifact properties imply domain primitives, and where root/domain config
facades can likely be deleted or split.

Downstream action supported:
opening the full `Domain Model Config Law` decision packet and deciding row
dispositions with less noise and fewer false owner classes.

Investigation type:
codebase deep dive plus corpus curation and decision support.

Non-goals:

- no code edits outside this packet;
- no implementation plan beyond opportunity lanes and disposition leads;
- no final authority updates unless a later explicit prework pass accepts them;
- no tests as structure/topology enforcement.

Required confidence level:
verified for counts, paths, symbols, and importer relationships; corroborated
for semantic classification; plausible only for later execution opportunity
ranking.

## Question Architecture

### Primary Questions

1. How many current public stage schemas are merely mirrors/wrappers of internal
   step or operation config, and how many contain intentional stage UX or policy
   that must remain stage-owned?
2. Which repeated operation input, strategy, or artifact-property schemas prove
   reusable domain primitive/config-contract candidates?
3. Which current root or per-domain `config.ts` files are only facade residue,
   and which contain material that needs exact owner classification?

### Secondary Questions

- Which stages define `public`, `knobsSchema`, and `compile`, and where do
  those schemas come from?
- Which public-config helper files derive schemas from operation contracts
  instead of authoring direct stage-owned schemas?
- Which operation contracts repeat the same object concepts, field names,
  schemas, defaults, or invariants across domains?
- Which artifact contracts repeat object concepts that operation contracts also
  validate or compose?
- Which domain shared knob files are truly stage authoring controls rather than
  domain primitives?
- Which exports have public import pressure through `@mapgen/domain` or broad
  barrels?

### Exclusion Questions

- Do not ask how to implement the moves.
- Do not ask whether every domain must contain `model/schemas/` before the
  repeated schema primitive evidence exists.
- Do not ask whether public schemas should be globally banned.
- Do not relitigate closed artifact contract shape or foundation-lib
  disposition.

### Falsification Questions

- Is there any public schema whose compile logic carries real policy that is
  not stage-local?
- Is there any domain `config.ts` export that is explicitly used as a stable
  public product API rather than a workaround facade?
- Are the apparent repeated operation fields only coincidental names with
  incompatible semantics?
- Are any likely primitive candidates actually operation-local strategy tuning
  or domain policy rather than object-local schema primitives?

## Search Geometry

Selected geometry:
graph tracing plus metrics corpus-building plus targeted depth-first semantic
inspection.

Why this geometry:
the important facts are connected structure: exports, imports, stage compile
flows, operation contracts, repeated schema objects, and artifact schema reuse.
Simple grep can find the terrain, but owner classification requires tracing
consumer role and semantic purpose.

Initial terrain / sources / paths:

- `mods/mod-swooper-maps/src/domain/**/*.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/**/*.ts`
- `mods/mod-swooper-maps/src/maps/**/*.ts`
- active Habitat scope and decision-book docs listed above
- Narsil repo `civ7-modding-tools`

Required breadth:

- all `config.ts` files under `mods/mod-swooper-maps/src/domain`;
- all `shared/knobs.ts` and `shared/knob-multipliers.ts` files under domains;
- all stage files that define `public`, `knobsSchema`, or `compile`;
- all `*-public-config.ts` files under `recipes/standard/stages`;
- all operation contracts with strategy/default schemas;
- all artifact contracts whose field shapes appear in operation or stage config.

Required depth:

- deep semantic pass on every `*-public-config.ts` file and every stage
  `compile`;
- deep semantic pass on any operation config file longer than a simple local
  strategy schema, especially morphology mountains shared config;
- enough source reading to tell domain primitive from operation tuning from
  reusable semantic policy.

Stop rule:
stop when the corpus can classify every discovered config-shaped surface into
one of: stage authoring, operation contract, domain schema primitive candidate,
domain policy candidate, facade residue, delete candidate, or
blocked by a specific evidence gap. This applies to surfaces discovered within
the Required breadth; outside discoveries are recorded only as evidence gaps or
follow-up leads.

## Evidence Policy

Evidence standard:
verified for inventory and graph relationships; corroborated for owner-class
recommendations.

Source authority order:

1. direct user decisions in the active session;
2. active Habitat scope/file/pattern docs and decision-book entries;
3. repo/root `AGENTS.md` instructions and canonical MapGen product or
   architecture docs when public surface or owner meaning is in question;
4. current code, Narsil symbol/reference/import evidence, `rg`, and Nx project
   ownership facts;
5. tests and type-level authoring SDK checks as consumer evidence only;
6. Git history/blame as explanatory evidence only.

Minimum corroboration:

- every count must cite the command or tool that produced it;
- every semantic classification must cite at least one source path and the
  role it plays;
- every "likely removable/simplifiable" public schema must cite whether compile
  is identity, mirror, wrapper, projection, or policy-bearing.

Conflict rule:
authority docs win over current path; current code wins over stale docs for
actual usage; conflicts between public API pressure and desired owner law must
be preserved as blockers or later public-import-surface questions.

Claim-strength labels allowed:
`verified`, `corroborated`, `plausible`, `blocked`, `outside scope`.

Required uncertainty markers:
`semantic collision`, `public API pressure`, `policy-bearing compile`,
`operation-local tuning`, `requires row-level disposition`.

What does not count as evidence:

- filename `config.ts` by itself;
- barrel export presence by itself;
- model inference without path inspection;
- docs not reconciled with source;
- tests as structure/topology law.

Code-vs-doc rule:
docs define target owner classes; code proves current shape and blast radius.
If code contradicts target owner law, record the contradiction as disposition
work rather than weakening the owner law.

## Rail Decision

Selected rail:
codebase investigation with fresh agents plus steward-run metrics.

Why this rail:
the problem is local, graph-shaped, and source-grounded. External research
would add little.

Rejected rails:

- broad Hyperresearch: wrong source landscape;
- implementation spike: premature;
- one-agent manual read: too likely to miss corpus-wide repetition and public
  schema blast radius.

Rail-bias risks:

- metrics bias: over-counting repeated field names without semantic sameness;
- semantic read bias: over-focusing on hairy files and missing easy bulk
  opportunities;
- path bias: treating current `config.ts` location as owner proof.

Constraints passed to the rail:
agents must keep evidence path-grounded, classify by role, and return findings
for the results corpus rather than editing source.

Adapter notes:
use Narsil first for symbol/reference/import graph evidence, then `rg` and
source reading for corroboration and semantic detail. Use Nx only for project
ownership and runnable-target context, not as a substitute for source
classification.

## Agent Team

### Agent A: Public Stage Surface Semantic Analyst

Purpose:
classify stage public schemas, `knobsSchema`, and `compile` functions by
semantic role.

Focus:

- every `recipes/standard/stages/**/index.ts` with `public`, `knobsSchema`, or
  `compile`;
- every recursive `recipes/standard/stages/**/*-public-config.ts` match;
- whether public schemas are direct wrappers/mirrors, generated from operation
  contracts, or real stage UX.

Output:

```text
| Stage/file | Public surface source | Compile role | Mirror/removable? | Policy/UX carried | Destination implication | Evidence |
```

### Agent B: Domain Primitive And Operation Overlap Analyst

Purpose:
find repeated operation input/strategy/schema/property concepts that justify
domain primitive/config-contract candidates.

Focus:

- operation `contract.ts` and operation-local `config.ts` files;
- repeated field groups, object schemas, defaults, invariants, and local
  normalizers;
- morphology mountains shared config as a likely large overlap locus;
- artifact property overlap only where it helps decide domain primitives.

Output:

```text
| Concept/field group | Source paths | Current owner(s) | Candidate owner class | Why same/different | Disposition lead |
```

### Agent C: Facade, Import Pressure, And Tool Metrics Analyst

Purpose:
produce the corpus metrics and public import pressure map that keep the
semantic agents honest.

Focus:

- Narsil symbol/reference/import checks for domain config exports and likely
  public-config exports;
- `rg` and local Git corroboration;
- Nx project ownership and runnable target context;
- `@mapgen/domain` / broad barrel import pressure.
- KNIP or equivalent unused-export/dead-code evidence when available before
  labeling a surface as removable or a delete candidate; if unavailable, record
  the limitation and keep deletion confidence provisional.

Output:

```text
| Surface/export/path | Importers | Public pressure | Facade? | Risk if removed | Evidence |
```

## Merge Protocol

Agents return lane findings to the steward. They do not edit source and do not
write `results-corpus.md` directly unless explicitly reassigned. The steward
deduplicates the lane outputs into one row-level corpus and preserves source
agent provenance in the evidence column.

Every durable corpus row must use this shape:

```text
| Path/symbol | Current role | Content class | Candidate owner | Explicit non-owner | Evidence strength | Blocker/later-domino marker | Disposition lead |
```

The row shape is intentionally stronger than the lane tables. It lets the later
prework disposition pass promote rows into exact destinations, delete actions,
implementation-gated actions, or tracked dominoes without re-running the whole
census.

## Artifact Contract

Required artifact:
`results-corpus.md` in this packet directory.

Intended reader:
the steward and future agents running the actual `Domain Model Config Law`
prework decision packet.

Required sections:

- executive answer: what the corpus changes about our next move;
- metrics summary with commands/tool sources;
- durable row-level corpus using the required row shape from the merge
  protocol;
- public stage surface table;
- domain primitive/operation overlap table;
- facade/import pressure table;
- opportunity lanes with confidence labels;
- blockers or evidence gaps;
- recommended next prework action.

Required claim support:
path-grounded evidence for every classification and command/tool provenance
for every count.

Must include:

- whether public schemas look broadly removable, selectively removable, or not
  ready to remove;
- where repeated primitives likely exist;
- which current `config.ts` files are facade residue;
- what should be inspected in the full row-level disposition pass.

Must not include:

- source edits;
- new owner laws;
- untracked deferrals;
- recommendations to enforce structure with tests.

Durability:
source-of-truth candidate for the investigation pass only. Final authority
still belongs in the active decision packet, decision book, scopes, files, or
patterns after the prework decision is run.

## Stop And Reframe Conditions

Stop if:

- Narsil and local source evidence materially disagree on import/caller facts;
- public schema compile logic turns out to be broad product policy rather than
  stage-local mapping;
- domain `config.ts` surfaces have public import pressure that cannot be
  safely classified without the later public/import-surface decision.

Return to Inquiry Design if:
the user changes the intended architecture of stage authoring versus domain
primitives.

Return to Framing Design if:
the investigation discovers a real third config owner that is neither stage
authoring, operation contract, nor domain primitive/policy.

Downgrade confidence if:
bulk metrics cannot distinguish semantically identical field names from
coincidental naming.

Ask the user if:
the only way to classify a surface depends on product intent rather than code,
authority docs, or current user decisions.

## Review Gate

Before execution, fresh review agents must check this brief for:

- frame carry-through;
- discriminating question architecture;
- evidence/tool-first posture;
- agent lane separation;
- artifact contract usefulness;
- hidden implementation or source-change authorization.

Accepted P1/P2 findings must be repaired before investigation agents start.

Review outcome:
fresh review agents checked the brief before investigation execution. Accepted
findings were repaired before launch: decision-book paths were corrected,
product/architecture authority was added to the evidence hierarchy, recursive
`*-public-config.ts` coverage was made explicit, the stop rule was constrained
to the required breadth, KNIP/unused-export evidence was required before
deletion confidence, and the steward merge protocol plus durable row shape were
added.

Execution outcome:
fresh investigation agents then ran the three independent lanes named above.
Their findings were steward-merged into `results-corpus.md`.
