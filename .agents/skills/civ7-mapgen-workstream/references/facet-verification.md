# MapGen Verification Facet

MapGen verification combines several disjoint proof surfaces. Use
`civ7-operational-debugging/references/proof-boundaries.md` for the common
taxonomy; this reference adds MapGen-specific routing.

## The First Branch: Generation Or Display?

Do not choose an edit owner from a screenshot.

1. Capture deterministic diagnostic evidence for the exact recipe/config/seeds.
2. Inspect or compare the raw layer values and metadata.
3. Compare the browser projection against those values.
4. If the claim involves Civ7, compare the admitted deterministic surface with
   one correlated foundational-control map observation.

| Evidence | Likely owner |
| --- | --- |
| Causal artifact or raw diagnostic values are wrong | Swooper definition domain/recipe |
| Values are right; labels, palette, geometry, selection, or interaction are wrong | Studio web projection or retained UI component package |
| Deterministic values are right; generated bundle differs | Swooper realization build/compiler |
| Installed tree differs from generated tree | qualified install adapter |
| Civ7 readback differs from admitted deterministic product | projection/realization or foundational control map observation; preserve exact correlation |
| Run state/receipts are right but API/browser outcome is wrong | Studio API/web projection |

Discover the current MapGen CLI projection before choosing a diagnostic or
metric operation:

```bash
bun apps/cli/bin/run.js mapgen --help
```

Select the owning family and leaf from native help, then ask that leaf for
`--help`. Do not keep a command inventory or copy remembered flags in durable
guidance.

## Behavioral Expectation Gate

Before tuning, copy `assets/earthlike-expectation-ledger.md` into the workstream
and declare:

- the physical/gameplay hypothesis;
- named regimes and seed/map-size cohort;
- target metrics with direction and bounds;
- collateral `HOLD` guards;
- the decision rule and lawful amendment process;
- the stronger live claim, if any, that remains after deterministic proof.

Metric families measure; product targets decide. Keep metric mechanics in the
neutral package, Swooper target meaning in the definition, and workstream
results in the evidence record.

## Proof Ladder

### 1. Contract And Structure

Use for schemas, operation/strategy symmetry, stage/step registration,
artifacts, authoring exports, and kind law. This closes only contract and
structural claims.

### 2. Domain Semantics

Use focused tests for physical algorithms, policy, invariants, conservation,
classification, fairness, and deterministic edge cases. This closes owner-local
semantics under supplied inputs.

### 3. Deterministic Recipe Execution

Run the admitted recipe/config against exact seeds and inspect artifacts,
metrics, trace, and diagnostic layers. This proves the portable product outcome
for those inputs, not Civ7 execution.

### 4. Browser Projection

Verify that the browser consumes the same admitted values and renders correct
geometry, palette, labels, selection, and interactions. Pixel/display proof is
a projection claim. It does not promote the browser to MapGen truth owner.

### 5. Realization Artifact

Build through the `swooper-physics-mod` Nx project. Inspect the generated mod
tree and runtime compatibility proof. Generated output is not installation.

### 6. Installation And Loader

Run the qualified deploy target/adapter, record its receipt, then collect a
separate Civ7 loader signal. An exact tree replacement does not prove the game
selected or executed it.

### 7. Live Behavior And Parity

Use the uncached live targets selected by `swooper-physics-mod`, current
MapGen-runs operation evidence, fresh logs, and one coherent foundational
control map observation. Record exact build/config/seeds/map size/game setup,
operation id, resource epoch, timestamps, and unresolved links.

Only a fully correlated comparison can claim parity. A successful live map
generation with an unresolved identity link remains a bounded live observation,
not complete parity.

## Live Target Discovery

The realization project owns its live target identities. Discover them at
execution time:

```bash
bunx nx show project swooper-physics-mod --json
```

Select the required target from that result, then derive its implementation and
flags from the owning entrypoint and `--help`. Use
`assets/live-verification-runbook.md` for ordering and proof capture.

## MapGen-runs Evidence

For Save & Deploy or Run in Game, inspect the operation as a transaction:

```text
intent admitted
  -> authored config prepared/written
  -> materialization receipt
  -> installation receipt
  -> setup/control facts
  -> fresh run/log evidence
  -> reconciliation
  -> terminal semantic outcome
```

MapGen-runs owns order, phases, cancellation, retention, correlation,
reconciliation, and final outcome. Qualified app adapters own their physical
effects and opaque receipts. A projection owns caller translation only.

On failure, record the last service-owned phase and the exact lower-owner
receipt/failure. Do not collapse every failure into deployment or infer rollback
from absence of output.

## Live Observation Discipline

- Snapshot logs before the action and read only fresh bytes/lines.
- Record the Tuner resource epoch used by foundational control.
- Keep map/game/process/operation identities distinct.
- Use closed control map operations; do not add caller-local raw scripts for
  product proof.
- Preserve stale, partial, unavailable, refused, uncertain, and unresolved
  states.
- Do not repeat a mutation when dispatch may already have occurred.
- Treat window capture as separate raw evidence; it can be stale or occluded
  while log/readback proof remains valid.

## Proof By Change Class

| Change class | Minimum useful proof |
| --- | --- |
| Structural, output-preserving definition change | contract/structure checks plus explicit output/identity invariants |
| Behavioral definition change | focused semantics, stable metric cohort, deterministic run, then live realization if Civ7 behavior is claimed |
| Diagnostic/metric presentation change | package/CLI projection tests against fixed evidence |
| Browser display change | raw-value agreement plus browser view/interaction proof |
| Realization/compiler change | artifact/runtime compatibility, install receipt, loader/live proof |
| MapGen-runs change | service semantics, app-adapter execution proof, projection proof, and live reconciliation when claimed |
| Foundational map observation change | control contract/semantics/execution plus epoch-correlated live evidence |

## Failure Patterns

- A clean deterministic run is called live proof.
- A screenshot overrides raw values.
- Installed files are called loader acceptance.
- A log line is generalized beyond its bounded run.
- Seeds/dimensions are used as a substitute for missing game/process identity.
- A projection recomputes a parity or failure classification already owned by
  the definition, control, or MapGen-runs.
- A superseded verification script is revived instead of using current CLI/Nx
  discovery.
