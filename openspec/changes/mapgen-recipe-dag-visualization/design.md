## Classification

### Frame

- Object: solution frame for a concrete product capability.
- Cynefin domain: complicated software/domain design, not chaotic; codebase
  investigation and contract design can produce a stable path.
- Mode: audience-export to future implementers and reviewers.
- Durability: standalone workstream record plus OpenSpec change.

### Domain Boundaries

- **Recipe authoring domain** owns stage ids, step ids, step order inside
  stages, `phase`, and explicit artifact requirement/provision contracts.
- **DAG preparation domain** owns pure transformation from authored recipe
  contracts to a JSON-safe graph DTO. This domain belongs in MapGen core because
  it is generic, pure, and future editable graph work must reuse the same
  identity model.
- **Studio service domain** owns selected recipe lookup, oRPC/Effect transport,
  public error shaping, and server-side procedure tests.
- **Studio presentation domain** owns graph layout, phase clusters, expansion
  state, and user interaction. It consumes prepared graph DTOs and does not
  infer artifact semantics.

Single authority:

- Generic DAG extraction: `@swooper/mapgen-core/authoring`.
- Concrete recipe corpus: `mod-swooper-maps/src/recipes/**`.
- Transport: `apps/mapgen-studio/src/server/**` and shared client contract
  files.
- Presentation: `apps/mapgen-studio/src/features/recipeDag/**` and shell tab
  integration.

### API Positions

- Consumer: known internal Studio client and future authoring tools.
- Task: load the selected recipe and display dependency structure for author
  understanding.
- Relationship: controlled internal API with strict TypeScript/schema contracts.
- Contract formality: strict, TypeBox/Standard Schema compatible where exposed
  over oRPC.
- Interaction style: operation-centric RPC, because the consumer asks for a
  prepared view model (`recipeDag.get`) rather than CRUD over stored graph rows.
- Evolution: additive fields and stable ids; future editing adds new procedures
  rather than changing read DTO meaning.

### System Dynamics

Dominant reinforcing loop: clearer artifact dependencies improve recipe author
decisions, which increases pressure to make contracts explicit rather than
hidden in step bodies.

Dominant balancing loop: graph complexity can overwhelm Studio users; phase
clusters, stage-level aggregation, and step expansion keep the first viewport
readable.

Second-order effect: if React reconstructs dependencies locally, later editable
graph work will encode a second semantic model. Server/core preparation avoids
that drift.

## Contract Model

### DTO Shape

The prepared DAG result must be JSON-safe and stable enough for rendering,
testing, and later editing identity.

```ts
type RecipeDag = Readonly<{
  recipeId: string;
  recipeKey: string;
  title: string;
  phases: readonly RecipeDagPhase[];
  stages: readonly RecipeDagStage[];
  edges: readonly RecipeDagEdge[];
  diagnostics: readonly RecipeDagDiagnostic[];
}>;
```

Required concepts:

- `phase`: grouping label from `step.contract.phase`; rendered as a phase
  cluster/lane, not execution order.
- `stage`: primary graph node, includes recipe order index and sequential
  `steps`.
- `step`: expandable row under a stage with step order, full step id, phase,
  artifact requires/provides, and tag diagnostics.
- `edge`: artifact dependency from producing stage to consuming stage. Same
  stage dependencies remain visible in expanded step details and are counted as
  internal links rather than rendered as self-loop clutter.
- `diagnostic`: missing provider, duplicate provider, missing consumer, or
  unused provided artifact facts. Diagnostics are graph facts, not execution
  failures unless existing compiler/runtime gates already fail.

### Edge Derivation

1. Iterate authored stages in recipe order.
2. Iterate each stage's authored steps in stage order.
3. Read `step.contract.artifacts?.provides` and map each artifact id to exactly
   one producing step and stage.
4. Read `step.contract.artifacts?.requires` and create an artifact edge from
   provider stage to consumer stage when a producer exists.
5. Record missing/duplicate producer diagnostics without inventing a producer.
6. Carry merged `contract.requires/provides` as tag metadata only. Because
   `defineStep` merges artifact ids into tag gates, using merged tags directly
   would double-count and weaken the explicit artifact contract boundary.

## oRPC + Effect Surface

Procedure namespace:

- `recipeDag.get`

Input:

- `recipeId`: Studio recipe id such as `mod-swooper-maps/standard`.

Output:

- `RecipeDag`.

Expected errors:

- `RECIPE_DAG_RECIPE_NOT_FOUND`: unknown selected recipe id.
- `RECIPE_DAG_UNAVAILABLE`: unexpected extractor failure with safe public
  message and no raw stack leakage.

Implementation pattern:

- Use `effect-orpc` contract-first patterns from `@civ7/control-orpc`.
- Keep a small Studio-local Effect service for recipe DAG loading.
- The service receives a recipe catalog of source-backed stage arrays.
- The Vite server mounts the RPC handler under a Studio-owned prefix alongside
  existing server middleware.

## Frontend Flow

Primary user: a MapGen recipe author.

Core scenario:

1. Author opens MapGen Studio.
2. Author selects a recipe from the existing recipe selector.
3. Author switches from map/config exploration into the full-screen pipeline
   DAG tab.
4. Studio calls `recipeDag.get` for the selected recipe.
5. The graph renders phase clusters, stage nodes, and artifact edges.
6. Author expands a stage to inspect sequential steps and their artifact
   requires/provides.
7. Author changes selected recipe; the DAG reloads for that recipe id.

Interaction requirements:

- The DAG tab must be a peer of the existing full-screen Studio experience, not
  a small embedded card.
- Stage nodes must show stage label/id, phase summary, step count, inbound and
  outbound artifact counts, and diagnostics.
- Step expansion must preserve stage order and step order.
- Phase clusters must not imply execution order beyond grouping; recipe order
  remains the order signal.
- Empty, loading, and error states must be explicit and accessible.

Visualization choice:

- Use plain SVG/HTML layout for the first DAG view unless current code already
  provides a stronger graph library. The graph is a dependency diagram, not a
  geospatial map; existing deck.gl remains the map layer renderer, not the DAG
  renderer.
- Layout should be deterministic from recipe order and phase grouping so tests
  can assert node/edge identity without pixel-fragile force simulation.
- Dense real recipes should use a deterministic dependency-ranked layout:
  stages remain the graph nodes, cross-stage artifact groups assign dependency
  ranks, phase ids remain visual lanes, and edges route through stable
  orthogonal ports. This preserves the native scroll surface that makes
  trackpad navigation fluid while reducing long arbitrary splines and avoiding a
  premature editable-canvas dependency.

## Review Lanes

- Architecture review: verifies owner boundaries, generated-output protection,
  recipe-order posture, and artifact-edge derivation.
- API review: verifies procedure naming, DTO stability, error contract, and
  oRPC/Effect consistency.
- Frontend review: verifies full-screen tab behavior, a11y, readable graph
  density, and future editable affordances.
- Adversarial review: checks for React semantic derivation, generated artifact
  misuse, hidden dependency edges, and overclaiming phase order.

## Future Work Outside This Slice

- Editable graph operations for stage/step reordering or artifact contract
  edits.
- Runtime trace overlays and live artifact materialization state.
- Export/share graph image or JSON.
- Graph layout tuning for very large third-party recipes.
