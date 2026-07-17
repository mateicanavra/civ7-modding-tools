<toc>
  <item id="scope" title="Subsystem boundary"/>
  <item id="model" title="Measurements, targets, and studies"/>
  <item id="pipeline" title="Evaluation pipeline"/>
  <item id="authoring" title="Authoring a benchmark"/>
  <item id="proof" title="Proof boundary"/>
  <item id="implementations" title="Recipe study banks"/>
</toc>

# Map product benchmarks

## Subsystem boundary

Map product benchmarks turn a completed recipe run into reproducible product
evidence. The subsystem owns reusable measurement primitives, closed target
evaluation, and the contract a recipe follows to declare executable studies. It
does not own a recipe's product thresholds, configurations, seed cohorts, or
domain policy.

`@swooper/mapgen-metrics` is the environment-neutral engine. It supplies
count-with-population evidence, numeric and component summaries, JSON-safe
comparators, and `MetricTarget` evaluation. A recipe owns capture, measurement,
targets, scenarios, studies, and report projection beside that recipe.

## Measurements, targets, and studies

| Layer | Authority | Rule |
| --- | --- | --- |
| Measurement primitive | `packages/mapgen-metrics/src/` | Refuse malformed or missing evidence; make no product judgment. |
| Recipe metric family | `<recipe>/metrics/families/*.ts` | Project one completed capture into neutral, reusable facts. |
| Benchmark target | `<recipe>/metrics/targets/*.ts` | A `MetricTarget` names a nonempty set of product expectations and comparators. |
| Executable study | `<recipe>/metrics/studies/benchmarks/*.study.ts` | A recipe study binds configuration, named dimensions, stable seeds, sample targets, and cohort targets. |
| Study sheet | `<recipe>/metrics/studies/benchmarks/*.md` | Explain the hypothesis, inputs, measurements, expected outcomes, and proof command; never configure execution. |

The TypeScript target and study modules are executable authority. Markdown is a
human research index, not a second configuration language. A change to a bound,
seed, preset, or target binding is made in TypeScript first and described in the
adjacent sheet in the same change.

## Evaluation pipeline

The current contract is a one-way chain:

```text
declared scenario
  -> completed recipe capture
  -> neutral family measurements
  -> sample or cohort MetricTarget evaluation
  -> immutable study result
  -> test assertion and JSON report
```

Recipe study runners must preserve these properties:

1. Product studies use named product dimensions rather than inferred width and
   height.
2. Scenario identity includes every product input that can change the result,
   including configuration content, dimensions, and seed.
3. Overlapping studies reconcile semantic scenario identity before generation
   and capture each identical scenario once.
4. A run is atomic: capture failure or missing evidence aborts instead of
   manufacturing a partial pass.
5. Sample targets close each map before cohort targets compare the population.

## Authoring a benchmark

1. Add a neutral measurement only when existing families cannot observe the
   product question. Keep counts with their populations and retain `null` or a
   hard refusal when evidence is absent.
2. Pre-declare the expected outcome as a `MetricTarget` before tuning generation
   behavior. Targets own product policy; family modules do not.
3. Bind the target in the recipe's study bank with a named configuration, named
   dimensions, and stable seed or seed cohort. Do not add a parallel config file.
4. Add or update the adjacent family and benchmark sheets so a reviewer can
   recover the question and reproduce the study without reading every observer.
5. Run the recipe's study report and behavioral test target.

## Proof boundary

A recipe study executed through a headless adapter proves deterministic
completed-map behavior at the `generated` evidence class. It does not prove that
the live Civ7 engine accepted or preserved the map. Behavioral map changes still
require the separately owned live in-game gate and any final-surface parity proof
required by the workstream.

The JSON report is the complete evidence projection for automation. The test
target is the pass/fail gate. Diagnostic dumps and visualization tools may
explain a failure, but they must not become a second benchmark authority.

## Recipe study banks

- Standard Swooper Maps recipe: [Standard metric studies](../../../../../mods/mod-swooper-maps/src/recipes/standard/metrics/studies/STUDIES.md)

Each additional recipe that claims product benchmarks should expose one stable
`metrics/studies/index.ts` module and colocate each logical executable study with
its protocol sheet under `metrics/studies/benchmarks/`. This system page defines
the generic contract only.
