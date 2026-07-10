# Domain Model Config Law Repair Plan

Status: active repair frame; row obligations live in `red-ledger.md`; execution plan lives in `repair-execution.md`

Prepared at: 2026-07-04

## Purpose

This is a repair plan for the `Domain Model Config Law` execution outcome. It
is not a patch list and not another disposition ledger. Its job is to name the
categorical failure that allowed material to land in weak destinations, replace
the weak decision model with stricter positive authority, and define the
systematic remediation pass that makes the slice trustworthy again.

Active red source of truth: `red-ledger.md`.

Execution source of truth for repair: `repair-execution.md`.

The core correction:

```text
classify by authority class and destination law before classifying by current
file, current consumer, or implementation convenience.
```

The repaired workflow must make wrong destinations impossible to treat as
closed. A row is closed only when every symbol in that row has a positive owner,
the destination file shape is ratcheted by Habitat pattern law, and the old
owner has import-zero proof.

## What Fundamentally Went Wrong

### 1. File-Level Ownership Was Treated As Symbol Ownership

The prior pass classified several files as if the file itself had one owner.
That let mixed files survive when the correct move was decomposition.

Example:

- `recipes/standard/stages/map-ecology/biome-bindings.ts` was preserved because
  the stage, step contract, and runtime helper all consumed it.
- That current-consumer fact was treated as ownership proof.
- The correct discriminator was symbol-level authority:
  - official Civ7 biome globals and value schemas belong in Civ7 authority;
  - ecology biome symbols belong in the ecology domain;
  - internal-to-engine projection defaults belong to the map-ecology projection
    owner;
  - public authoring schema belongs in the stage definition;
  - step input schema belongs in the step contract.

Repair principle:

> A mixed file is not a destination. Mixed ownership is a decomposition signal.

### 2. Current Coupling Was Mistaken For Valid Topology

The previous review asked whether a helper was "stage-local" instead of asking
whether the helper's contents belonged to the stage authoring destination shape.
This allowed helper files to become hiding places.

Examples:

- `public-config.ts` files were accepted when they lived under the owning stage.
- `knobs.ts` files were accepted when they lived under the owning stage.
- `biome-bindings.ts` was accepted because multiple local consumers used it.

Repair principle:

> Current consumers are evidence for blast radius, not authority for ownership.

### 3. Negative Assertion Replaced Positive Destination Law

The stage-authoring rail blocked some bad imports and broad facades, but it did
not positively assert what a stage authoring surface must look like. The result
was a rule that could pass while still allowing wrong destinations.

The bad allowance was:

- stage-local helper files may compose public schemas, knobs, and compile
  mappings.

That allowance was too broad. It let `public-config.ts` and `knobs.ts` become
new config buckets after root/domain config buckets were removed.

Repair principle:

> A structural law must say what belongs there, not merely what is forbidden.

### 4. Direct Mirrors Were Not Classified As Invalid Owners

Direct public mirrors of operation schemas were preserved as stage-local helper
files. That violated the accepted semantic model:

- operations have contracts, not config;
- stages own authoring surfaces;
- a direct operation-schema mirror is not an authored public UX surface;
- direct mirrors must be deleted or inlined into the stage definition when they
  are only wiring.

Repair principle:

> Public authoring must be authored. If it is a direct mirror of operation
> schemas, it is residue, not a durable destination.

### 5. Review Proved The Weaker Law Instead Of Challenging The Law

Reviewers validated that the implementation matched the execution plan. They
did not adversarially test whether the execution plan encoded the full decision
criteria. This made a weak rail look like closure.

Repair principle:

> Review must attack the authority model before it reviews implementation
> conformance.

### 6. Pattern Gaps Let Closure Outrun Authority

Habitat patterns existed, but they did not ratchet the strict destination shape
needed by the execution pass. This allowed code to land in destinations that
were verbally described but not structurally enforced.

Repair principle:

> Rails come before burndown. A destination that cannot be pattern-checked is
> not ready to receive source movement.

## Corrected Classification Model

Every exported symbol, helper, schema, table, and file-level construct must be
classified into exactly one authority class before movement.

| Class | Positive owner | Forbidden owners | Decision discriminator |
| --- | --- | --- | --- |
| Operation contract material | Owning `domain/<domain>/ops/<op>/contract.ts` | operation `config.ts`, shared operation config buckets, stage authoring helpers | Is it an operation input/output/strategy/default/envelope? |
| Domain schema primitive | Owning `domain/<domain>/model/schemas/<primitive>.schema.ts` | operation envelopes, stage public schemas, generic model buckets | Is it reusable domain vocabulary or a semantic schema primitive independent of one operation envelope? |
| Domain policy | Owning `domain/<domain>/model/policy/<policy>.ts` | schemas, stage authoring, Civ7 official packages, broad data buckets | Is it reusable domain interpretation, selection, scoring, resolver, or multiplier law? |
| Domain model data | Owning `domain/<domain>/model/data/<collection>.ts` only when the domain explicitly owns a reusable data collection | operation defaults, stage defaults, public authoring schemas, official Civ7 resource data | Is it domain-authored data independent of operation envelopes, stage UX, and official Civ7 tables? |
| Artifact contract | Owning `domain/<domain>/artifacts/<artifact>.artifact.ts` | operation contracts, recipe registries, proxy validation helpers | Is it artifact payload shape or artifact publication validation? |
| Official Civ7 type declaration | `@civ7/types` | mapgen domains, recipes, map-policy, operation contracts | Is it type-only runtime/script declaration material? |
| Official Civ7 map/resource policy fact | `@civ7/map-policy` | mapgen domains, recipes, operation contracts | Is it deterministic official map/resource/feature/biome/plot-effect vocabulary, catalog, legality, index, or policy fact? |
| Official resource evidence | `.civ7/outputs/resources` as evidence only | source packages as hand-authored owner | Is it extracted official game data used to generate or prove policy? |
| Adapter/runtime access | `@civ7/adapter` or the existing runtime owner | domains, policy packages, operation contracts | Does it read/write runtime engine state or resolve engine IDs? |
| Stage authoring surface | Owning stage `index.ts` | domain config, operation config, `public-config.ts`, `knobs.ts` | Is it authored public schema, knobs schema, or public-to-step compile behavior? |
| Stage projection policy | Owning `recipes/standard/stages/<stage>/projection-policy.ts` only after a positive projection-policy pattern exists | domain policy, Civ7 official packages, generic public config helper, public/knob helpers | Does it translate mapgen truth into engine-facing projection choices without owning public schema, step schema, official vocabulary, or runtime access? |
| Stage step contract | Owning `steps/*.contract.ts` | stage public helpers, domain config, operation config | Is it step input schema or step artifact/effect contract? |
| Residue facade | deleted | all owners | Is it a barrel, mirror, wrapper, or transitional path with no authority? |

Classification rule:

> If one file contains multiple classes, split the file. Do not bless the file
> as an exception.

Default routing rule:

> Defaults stay with the owner of the thing being defaulted. Operation defaults
> live in operation contracts, stage public/knob defaults live in the stage
> definition, projection defaults live in a patterned projection-policy owner
> or inline stage definition, and official Civ7 defaults/facts live in
> `@civ7/map-policy`.

## Immediate Known Residue Classes

This repair pass starts from these known residue classes and must discover any
additional instances using the same classification model.

### A. Stage-Local Public-Config Residue

Known files:

- `recipes/standard/stages/ecology-biomes/public-config.ts`
- `recipes/standard/stages/ecology-features/public-config.ts`
- `recipes/standard/stages/ecology-pedology/public-config.ts`
- `recipes/standard/stages/hydrology-climate-baseline/public-config.ts`
- `recipes/standard/stages/hydrology-climate-refine/public-config.ts`
- `recipes/standard/stages/hydrology-hydrography/public-config.ts`
- `recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts`
- `recipes/standard/stages/placement/public-config.ts`

Required outcome:

- no durable `public-config.ts`, `*-public-config.ts`, or stage-local public
  schema/compile helper files under recipe stages;
- direct operation-schema mirrors deleted or inlined into the owning stage
  `index.ts`;
- real stage public authoring logic inlined into the owning stage `index.ts`
  unless a stricter positive pattern explicitly allows a different named owner;
- any official Civ7 vocabulary extracted before stage recomposition.

### B. Stage-Local Knob Residue

Known files:

- `recipes/standard/stages/hydrology-climate-baseline/knobs.ts`
- `recipes/standard/stages/hydrology-climate-refine/knobs.ts`
- `recipes/standard/stages/hydrology-hydrography/knobs.ts`
- `recipes/standard/stages/map-rivers/riverProjectionKnobs.ts`

Required outcome:

- no durable standalone `knobs.ts`, `*Knobs.ts`, or knob-schema owner for
  simple stage knobs;
- knob schemas inline in the owning stage definition;
- projection knobs either inline in the stage definition or split into a
  positively patterned projection-policy owner if they encode reusable
  projection policy.

### C. Mixed Projection Binding Residue

Known file:

- `recipes/standard/stages/map-ecology/biome-bindings.ts`

Required outcome:

- official Civ7 biome global value schema/support in exact Civ7 authority
  (`@civ7/map-policy` for deterministic biome-global values, not a generic
  "Civ7 authority" bucket);
- ecology biome symbol vocabulary remains in ecology domain;
- default internal-to-engine binding map lands in
  `map-ecology/projection-policy.ts` only after that file shape is patterned;
  otherwise it is inlined in `map-ecology/index.ts`;
- step contract input schema is owned by the step contract;
- runtime helper imports only runtime/projection policy data it needs;
- `biome-bindings.ts` is deleted or renamed only to a positively patterned
  owner whose contents match one authority class.

### D. Stage Public Direct Mirror Residue

Known shape:

- public schema assembled by importing operation strategy/config schemas;
- helper code that clones operation schemas, rewrites descriptions, then
  compiles back to operation configs;
- `defaultStrategyConfigSchema` or equivalent extraction from operation
  strategy unions.

Known paths to include:

- `recipes/standard/stages/placement/placement-inputs.ts`
- `recipes/standard/stages/placement/artifacts/placement-inputs.artifact.ts`
- `recipes/standard/stages/foundation-lithosphere/index.ts`
- `recipes/standard/stages/foundation-mantle/index.ts`
- `recipes/standard/stages/foundation-tectonics/index.ts`

Required outcome:

- mirrors are not durable public authoring surfaces;
- if public schema is only a direct mirror, inline simple wiring into the stage
  definition or delete the public facade if the stage can use step defaults;
- if public schema is real UX, author it directly in the stage definition using
  domain primitives/policy where appropriate.

### E. Official Civ7 Vocabulary Residue

Known paths to include:

- `mods/mod-swooper-maps/src/domain/ecology/types.ts`
- `mods/mod-swooper-maps/src/domain/ecology/index.ts`
- `recipes/standard/stages/ecology-features/steps/plan-vegetation/index.ts`
- `recipes/standard/stages/ecology-features/steps/plan-reefs/index.ts`
- `recipes/standard/stages/ecology-features/steps/plan-wetlands/index.ts`
- `recipes/standard/stages/ecology-features/public-config.ts`

Known shapes:

- `FeatureKey`, `FEATURE_PLACEMENT_KEYS`, `FEATURE_KEY_INDEX`;
- `PlotEffectKey`;
- hard-coded `PLOTEFFECT_*`, `FEATURE_*`, `RESOURCE_*`, `BIOME_*`, or official
  table-derived selector vocabulary outside Civ7 authority packages.

Required outcome:

- official feature, plot-effect, resource, terrain, river, and biome vocabulary
  lands in `@civ7/map-policy` when deterministic policy/catalog material;
- runtime ID resolution remains at adapter/runtime boundaries;
- mapgen domains may define internal semantic vocabulary only when it is not an
  alias for official Civ7 vocabulary;
- stage projection policy may translate between mapgen truth and Civ7 policy
  values, but must import official vocabulary rather than define it.

### F. Structural Enforcement In The Wrong Layer

Known examples to re-check:

- `mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts`;
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface/check.ts`;
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/check.mjs`;
- stale topology allowances for recipe-root or stage-local public config files;
- duplicate hard-coded public-key tables such as `STANDARD_PUBLIC_KEYS`.

Required outcome:

- topology/file-shape law lives in Habitat patterns and rule wiring;
- behavior tests remain behavior tests;
- scripts are allowed only when GRIT/Habitat cannot express the check and the
  reason is recorded.

### G. Artifact Proxy Validation Residue

Known shapes to re-check:

- artifact payload `Type.Object` definitions outside `artifacts/*.artifact.ts`;
- `defineArtifact` outside artifact owner files;
- exported `validate*Artifact` or `assert*Artifact` helpers outside artifact
  owner files;
- recipe registries, operation contracts, or stage helpers that proxy artifact
  validation instead of importing the artifact owner.

Required outcome:

- artifact payload shape and validation stay in artifact owner files;
- external sites import the artifact object's schema/validate/assert surface;
- tests do not substitute for artifact topology law.

### H. Stale Authority And Documentation Residue

Known examples to re-check:

- stale tsconfig aliases for `@mapgen/domain/config`;
- AGENTS/docs/comments that tell future agents to import config/defaults
  directly from operations or config facades;
- execution/disposition language that still allows broad stage-local helpers as
  final destinations.
- canonical docs and project ledgers that cite retired config/knob/public-config
  surfaces, including:
  - `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`;
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`;
  - `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`;
  - `docs/projects/standard-recipe-authoring-surface/proof-ledger.md`;
  - `docs/projects/standard-recipe-authoring-surface/corpus-ledger.md`.

Required outcome:

- docs and local instructions reflect the corrected owner classes;
- stale comments and aliases are removed or corrected;
- the active disposition/execution records point to this repair plan and no
  longer imply false closure.

## Positive Pattern Work Required

This repair must add or tighten positive Habitat pattern law before the
residue burndown is considered closed.

### Pattern 1: Recipe Stage Authoring Owner Shape

Positive assertion:

- the owning stage definition file owns `public`, `knobsSchema`, and `compile`;
- stage `index.ts` may import domain primitives, domain policy, and exact Civ7
  authority packages, but not root/domain config facades, operation `config.ts`,
  or operation envelope schemas as public authoring shortcuts;
- stage-local `public-config.ts`, `*-public-config.ts`, `knobs.ts`,
  `*Knobs.ts`, and public/knob schema helper files are invalid destinations;
- direct operation-schema mirror helpers are invalid even when they do not use
  the `public-config.ts` filename;
- stage-local support files are allowed only after a separate positive class
  names their file shape. They may not export public schemas, knob schemas, or
  compile helpers by default.

Pass condition:

- fixtures include good inline public/knobs/compile cases;
- fixtures include bad `public-config.ts`, bad `knobs.ts`, bad op-config mirror,
  bad `*-public-config.ts`, bad operation-envelope public schema composition,
  and bad root/domain config import cases;
- current tree violations are explicit and owned by this repair pass.

### Pattern 2: Operation Contract File Shape

Positive assertion:

- operation input/output/strategy/default envelopes live in `contract.ts`;
- operation contract files may compose accepted domain primitives and policy;
- operation contracts do not import sibling `config.ts`, operation-family
  config buckets, root/domain config facades, or stage authoring helpers.
- operation contracts do not import full operation envelopes from
  `model/schemas`, `model/policy`, or another owner under names such as
  `*InputSchema`, `*OutputSchema`, `*StrategySchema`, `*DefaultSchema`, or
  `*ConfigSchema`. Contract-local envelopes may compose smaller primitives.

Pass condition:

- moved operation rows are accepted by the pattern;
- any remaining operation config file is either absent or listed as an active
  violation with an owner row.
- bad fixtures prove imported full envelopes from `model/schemas` fail; good
  fixtures prove contract-local envelopes composed from primitives pass.

### Pattern 3: Domain Model Schema And Policy Owner Shape

Positive assertion:

- `model/schemas` files contain semantic primitives, not full operation
  envelopes or stage public schemas;
- `model/policy` files contain reusable semantic policy, not TypeBox schema
  mirrors, public authoring composition, or official Civ7 vocabulary;
- official Civ7 resource/vocabulary/policy facts cannot be introduced into
  mapgen domains.

Pass condition:

- fixture coverage catches broad config buckets recreated under
  `model/schemas` or `model/policy`;
- Civ7 vocabulary examples fail when placed in mapgen domain files and pass
  when imported from Civ7 authority.

### Pattern 4: Artifact Contract Shape Preservation

Positive assertion:

- artifact files remain the owner of artifact payload shape and validation;
- recipe registries, operation contracts, and stage helpers do not proxy
  artifact validation.
- external code imports artifact contract surfaces; it does not redefine
  artifact-shaped `Type.Object` payloads or export `validate*Artifact` /
  `assert*Artifact` helpers outside artifact owners.

Pass condition:

- existing artifact pattern remains green;
- companion proxy-validation rule or equivalent artifact-law extension scans
  operation contracts, recipe registries, and stage helpers;
- this repair does not regress the artifact ratchet established earlier.

### Pattern 5: Stage Projection Policy Owner Shape

Positive assertion:

- projection policy, when not inlined, lives in exactly
  `recipes/standard/stages/<stage>/projection-policy.ts`;
- the file may export readonly policy constants, pure resolver functions, and
  local types for translating mapgen truth into engine-facing projection
  choices;
- it may import internal mapgen vocabulary and exact Civ7 policy packages;
- it must not define official Civ7 vocabulary, public schemas, knob schemas,
  compile functions, step input schemas, artifact payload schemas, adapter
  calls, runtime engine reads/writes, or operation envelopes;
- it must not import root/domain config facades, operation `config.ts`, sibling
  public/knob helpers, or `@civ7/adapter`.

Pass condition:

- good fixture covers a pure projection-policy file imported by a stage;
- bad fixtures cover renamed `biome-bindings.ts`, renamed `riverProjectionKnobs`,
  public schema exports, knob schema exports, `compile` exports, adapter imports,
  official vocabulary definitions, and step input schemas;
- if this pattern is not implemented and wired, projection policy material must
  be inlined into the owning stage `index.ts` instead of moved to a support
  file.

## Repair Workstream

### Stage 0: Re-Open The Closure Claim

Objective:

- mark the previous execution outcome as conditionally repaired, not closed,
  until this repair plan is executed.

Actions:

- add this `repair.md` as the active repair container;
- update `execution.md` status only after user approval for the hardening pass;
- record that `disposition.md` remains evidence, but any row that blessed
  broad stage-local helper files must be re-evaluated under this repair model.

Gate:

- no source movement begins until the repair corpus and positive pattern plan
  are reviewed.

### Stage 1: Build The Repair Corpus

Objective:

- enumerate every file/symbol that could have landed in a weak destination.

Inputs:

- `disposition.md`;
- `execution.md`;
- current source under `mods/mod-swooper-maps/src/recipes/standard/stages`;
- current source under `mods/mod-swooper-maps/src/domain`;
- current Civ7 policy/type packages;
- Habitat blueprint patterns and rule manifests;
- tests/scripts that enforce topology.

Required searches:

```bash
rg -n "public-config|knobs\\.ts|riverProjectionKnobs|biome-bindings|defaultStrategyConfigSchema|Type\\.Unsafe|\\.ops\\.|/config\\.js|domain/config|@mapgen/domain/config" mods/mod-swooper-maps/src mods/mod-swooper-maps/test .habitat packages
rg -n "CIV7_|PLOTEFFECT_|BIOME_|FEATURE_|RESOURCE_|Global|globals" mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes packages
rg -n "export (const|function|type|interface).*?(public|Public|knob|Knob|compile|Compile|Schema|schema|Config|config)|export .*?(public|Public|knob|Knob|compile|Compile|Schema|schema|Config|config)" mods/mod-swooper-maps/src/recipes/standard/stages
rg -n "ops\\.[A-Za-z0-9_]+\\.(config|input|output|strategies\\.default)|defaultConfig|defaultStrategyConfigSchema" mods/mod-swooper-maps/src/recipes/standard/stages --glob '!**/steps/**/*.ts' --glob '!**/artifacts/**/*.ts'
rg -n "defineArtifact|validate[A-Za-z0-9_]*Artifact|assert[A-Za-z0-9_]*Artifact|artifact.*Type\\.Object|Type\\.Object\\(.*artifact" mods/mod-swooper-maps/src
rg -n "public-config|knobs\\.ts|stage-local helpers may|semantic-public-config|internal-step-config|PlacementPublicSchema|mountain-ranges-public-config|expected public key|STANDARD_PUBLIC_KEYS" .habitat/blueprints .habitat/civ7 docs mods/mod-swooper-maps/test mods/mod-swooper-maps/scripts
```

Use Narsil first for symbol/reference graphs on:

- each `public-config.ts` export;
- each `knobs.ts` export;
- each `*public-config.ts` and `*Knobs.ts` export;
- `BiomeEngineBindingsSchema`;
- feature, plot-effect, resource, terrain, river, and biome vocabulary constants
  found outside Civ7 authority packages;
- operation mirror exports that reference `ops.*.config`, `ops.*.input`,
  `ops.*.output`, or `ops.*.strategies.default`;
- any operation `config.ts` import still present.

Corpus row shape:

```text
| Row | File/symbol | Current class | Correct authority class | Positive destination | Forbidden destination | Required pattern | Required proof | Status |
```

Gate:

- every known residue class A-H has rows;
- every row has either a positive destination or `needs-authority` with a
  single blocking question;
- no grouped row hides mixed symbol ownership.

### Stage 2: Repair Positive Rails Before Source Burndown

Objective:

- make the intended destinations enforceable before moving or blessing source.

Actions:

- tighten `require_recipe_stage_authoring_file_shape`;
- tighten or add fixtures for operation contract file shape;
- tighten domain model schema/policy owner shape;
- add or tighten `require_stage_projection_policy_owner_shape`;
- confirm artifact contract patterns still pass and are not replaced by tests;
- add or tighten artifact proxy-validation structural law if proxy validators
  exist outside artifact owner files;
- remove or convert script/test-based topology checks that duplicate Habitat
  law, preserving behavior checks only.

Gate:

- each Grit-backed rule runs through its selected `.habitat/**/rule.json` manifest via `bun habitat check --rule <id>`, with Habitat's Effect-scoped `grit.yaml` and `--grit-dir` execution;
- Habitat current-tree wrapper proof runs for each repaired pattern;
- injected-violation proof demonstrates that bad public-config, knob, op-mirror,
  projection-policy, model-schema bucket, and artifact-proxy fixtures fail;
- scan roots/path coverage prove each rule actually covers the intended source
  tree and does not only test fixtures;
- each pattern is wired into an enforced Habitat lane, with an empty/shrinking
  baseline or row-owned explicit baseline for known current violations;
- current-tree violations are expected and listed in the repair corpus;
- no pattern relies only on negative assertions when a positive shape can be
  asserted.

### Stage 3: Decompose Mixed Authority Files

Objective:

- eliminate files preserved because of current coupling rather than authority.

Primary targets:

- `map-ecology/biome-bindings.ts`.
- `domain/ecology/types.ts` and ecology feature/plot-effect symbols that encode
  official Civ7 vocabulary.
- stage feature/plot-effect selector maps that combine official Civ7 values
  with mapgen projection choices.

Decision criteria:

- official Civ7 vocabulary/schema support goes to exact Civ7 authority:
  `@civ7/map-policy` for deterministic official map/resource/feature/biome/
  plot-effect policy facts, `@civ7/types` for type-only runtime declarations,
  `.civ7/outputs/resources` as evidence, and adapter/runtime owners for runtime
  ID resolution;
- mapgen domain symbols stay in mapgen domain;
- projection mapping stays with `projection-policy.ts` only after the positive
  projection-policy pattern passes; otherwise it is inlined in the owning stage;
- step input schema stays with the step contract;
- runtime helper imports only policy/runtime inputs, not public authoring
  helpers.

Gate:

- `biome-bindings.ts` is deleted or renamed into a single-class owner;
- no Civ7 official vocabulary remains in mapgen domain/stage helper files
  except imports from Civ7 authority;
- no official feature/plot-effect vocabulary remains hidden in ecology domain
  types or stage helper files;
- checks prove all callers use the new owners.

### Stage 4: Burn Down Stage Public And Operation Mirror Residue

Objective:

- remove public authoring helper buckets and operation-schema mirrors as
  durable destinations.

Decision criteria:

- if a file mirrors operation schemas, delete the public surface; do not inline
  the mirror into the stage or preserve it under another helper name;
- if a file contains real authoring UX, inline that UX into stage `index.ts`
  and extract official vocabulary/policy before inlining;
- if a file contains domain primitives, move those primitives first, then
  compose them from the stage.
- if a file proxies artifact payload shape, move the payload definition to the
  artifact owner before deleting the proxy;
- if a stage index directly exposes `ops.*.strategies.default`, classify it as
  a direct mirror and delete the public surface unless a separate, non-mirror
  stage UX facade is proven.

Gate:

- no `public-config.ts`, `*-public-config.ts`, or public-schema helper files
  remain under standard recipe stages;
- no stage imports operation `config.ts` or domain/root config facades;
- no non-`public-config` operation mirror files remain, including
  `placement-inputs.ts`-style helpers;
- artifact files no longer import artifact payload schemas from stage helper
  files;
- direct mirrors cannot pass the stage-authoring pattern.

### Stage 5: Burn Down Stage Knob Residue

Objective:

- remove standalone knob helper files that only hide stage authoring schema.

Decision criteria:

- simple knob schemas inline in stage `index.ts`;
- reusable semantic policy or lookup data moves to domain `model/policy`;
- projection-specific policy moves to the owning projection stage policy owner
  if the pattern permits it.

Gate:

- no `knobs.ts` or equivalent stage-authoring schema bucket remains unless it
  matches a named positive support class;
- stage knobs are visible at the stage definition boundary.

### Stage 5.5: Repair Structural Oracles And Stale Authority

Objective:

- remove executable and documentary oracles that preserve the weak destination
  model.

Actions:

- convert topology/file-shape assertions from package tests and ad hoc scripts
  into Habitat pattern law where expressible;
- keep package tests only for behavior and runtime authoring-model semantics;
- remove stale allowances for recipe-root `*-public-config.ts` and stage-local
  public/knob helpers;
- remove stale aliases and comments pointing to retired config owners;
- update canonical docs and project ledgers that describe old `config`,
  `shared/knobs`, or `public-config` destinations as current.

Gate:

- no executable test/script remains as the primary source of topology law when
  a Habitat pattern covers that law;
- stale docs are corrected, archived, or explicitly marked historical;
- repaired docs point to positive owner classes, not weak helper filenames.

### Stage 6: Reconcile Disposition And Execution Records

Objective:

- ensure the paper trail no longer claims weak destinations as closure.

Actions:

- update any rows in `disposition.md` that said `keep` for stage-local helper
  files but now resolve to inline, split, delete, or exact projection policy;
- update `execution.md` to reference this repair pass and its final proof;
- preserve historical context only where it helps explain why the repair was
  needed;
- remove duplicate or contradictory source-of-truth documents.

Gate:

- one current disposition source of truth remains;
- it contains no destination like "stage-local files" without a named positive
  file-shape class;
- every repaired row has proof.

### Stage 7: Verification And Closure

Required checks:

```bash
bun habitat classify .habitat/.active
bun habitat classify mods/mod-swooper-maps/src/recipes/standard/stages
bun habitat classify mods/mod-swooper-maps/src/domain
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test
git diff --check -- .habitat mods/mod-swooper-maps packages
```

Required scans:

```bash
rg -n "public-config|knobs\\.ts|riverProjectionKnobs|biome-bindings|placement-inputs" mods/mod-swooper-maps/src/recipes/standard/stages
rg -n "from .*config\\.js|@mapgen/domain/config|domain/config" mods/mod-swooper-maps/src mods/mod-swooper-maps/test
rg -n "CIV7_|PLOTEFFECT_|BIOME_|FEATURE_|RESOURCE_" mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes
rg -n "ops\\.[A-Za-z0-9_]+\\.(config|input|output|strategies\\.default)|defaultStrategyConfigSchema" mods/mod-swooper-maps/src/recipes/standard/stages --glob '!**/steps/**/*.ts' --glob '!**/artifacts/**/*.ts'
rg -n "defineArtifact|validate[A-Za-z0-9_]*Artifact|assert[A-Za-z0-9_]*Artifact" mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes
```

Closure gate:

- all Habitat structural rules pass or have an explicit baseline only for an
  approved later domino;
- behavior checks pass;
- row corpus shows no open weak-destination rows;
- fresh review finds no P1/P2 issues;
- Graphite closure commit leaves the worktree clean.

## Accepted Review Findings

Review Wave 1 was run with three fresh adversarial reviewers. The following
findings were accepted and integrated:

- P1: `projection-policy` was still an escape hatch. This plan now requires an
  exact `projection-policy.ts` owner shape and forbids using that owner before
  the pattern is implemented and wired.
- P1: "Civ7 authority" was too broad. The classification model now splits
  `@civ7/types`, `@civ7/map-policy`, `.civ7/outputs/resources`, and adapter/
  runtime owners.
- P1: positive patterns must be current-tree Habitat law, not fixture-only or
  advisory examples. Stage 2 now requires wrapper proof, injected-violation
  proof, scanRoots/pathCoverage proof, and enforced-lane/baseline decisions.
- P1: operation envelopes could be smuggled into `model/schemas`; operation
  contract pattern requirements now reject imported full envelopes.
- P1: residue was broader than exact filenames. The corpus now includes
  `*-public-config.ts`, non-public-config operation mirrors such as
  `placement-inputs.ts`, direct `ops.*.strategies.default` public mirrors,
  and feature/plot-effect official vocabulary outside Civ7 packages.
- P2: artifact proxy validation needs structural protection beyond the artifact
  file shape. The plan now requires companion proxy-validation law if proxy
  sites exist.
- P2: stale tests, scripts, docs, ledgers, aliases, and comments are part of
  the repair surface when they preserve the weak destination model.

## Review Model

This repair requires two independent review waves.

### Review Wave 1: Plan Review

Fresh agents review this document before source implementation.

Reviewer lanes:

1. Authority classifier reviewer: verifies the categorical failure analysis and
   corrected classification model.
2. Pattern-law reviewer: verifies the plan requires positive Habitat patterns,
   not negative assertion or test/script topology substitutes.
3. Corpus completeness reviewer: hunts for missed residue classes and checks
   whether each known residue class has an explicit repair route.

Accepted findings update this document before execution hardening.

### Review Wave 2: Implementation Review

Fresh agents review the actual repair implementation after local proof.

Reviewer lanes:

1. Source ownership reviewer: symbol-by-symbol owner placement and imports.
2. Pattern enforcement reviewer: fixtures, current-tree violations, and Habitat
   rule wiring.
3. Closure reviewer: row ledger, stale docs/tests/scripts, proof classes, and
   Graphite/worktree hygiene.

Accepted P1/P2 findings block closure.

## Non-Goals

- Do not broaden into unrelated domain-blueprint topology enforcement.
- Do not reopen row `S06`; it remains tracked by its resource-policy domino.
- Do not preserve helper files because they are convenient.
- Do not introduce behavior changes while repairing topology.
- Do not use tests or scripts as the primary authority for file shape when a
  Habitat pattern can express the law.

## Draft Review Prompts

These prompts are intentionally bounded. The agents are reviewers, not
implementers.

### Authority Classifier Reviewer Prompt

You are reviewing
`.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/repair.md`
in the Civ7 worktree
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`.

Your job is to attack the categorical failure analysis and classification model.
Assume the prior execution wrongly allowed weak destinations such as
`public-config.ts`, `knobs.ts`, and mixed projection helper files. Check whether
the repair plan correctly shifts from current-file/current-consumer reasoning
to symbol-level authority classes and positive destination law.

Focus on:

- whether each authority class has a positive owner and forbidden owners;
- whether mixed files are forced to decompose instead of becoming exceptions;
- whether official Civ7 vocabulary/resource/policy is routed out of mapgen
  domains and recipe helpers;
- whether the plan avoids inventing broad new buckets.

Return only findings that would materially improve executability or prevent a
repeat of the failure. For each finding, include severity, file/section, issue,
and concrete repair.

### Pattern-Law Reviewer Prompt

You are reviewing
`.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/repair.md`
in the Civ7 worktree
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`.

Your job is to verify that the repair plan requires positive Habitat pattern
law before source burndown. The key failure to prevent is a weak negative rule
or broad allowance that lets code land in convenient helper files while still
passing checks.

Focus on:

- recipe stage authoring owner shape;
- operation contract file shape;
- domain model schema/policy owner shape;
- artifact contract preservation;
- avoiding test/script-based topology enforcement when GRIT/Habitat can own it.

Return only findings that would make the repair plan stricter, more positive,
or easier to enforce mechanically. For each finding, include severity,
file/section, issue, and concrete repair.

### Corpus Completeness Reviewer Prompt

You are reviewing
`.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/repair.md`
in the Civ7 worktree
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`.

Your job is to hunt for missed residue classes. Treat the listed files as a
starting point, not proof of completeness. Use `rg` and the current source to
look for additional config/public/knob/projection/helper residue that could
repeat the same categorical error.

Focus on:

- stage-local files that export public schemas, knobs schemas, compile helpers,
  or operation-schema mirrors;
- official Civ7 vocabulary outside Civ7 authority packages;
- topology/file-shape checks living in tests or scripts;
- stale docs/comments/aliases that would steer future agents back to weak
  destinations.

Return a compact findings list. For each finding, include severity, exact path,
why it belongs to a residue class, and what repair route the plan should name.
