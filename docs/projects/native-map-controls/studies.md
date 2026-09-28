# Study And Review Loop

## Mechanism And Falsifier

Hypothesis: replacing reconstruction at the native projection boundary reduces
loss of authored elevation and river topology without changing upstream physics.
Falsifiers: direct writes do not survive native finalization; required semantics
cannot represent the physical network; or gameplay/legality degrades despite
better immediate write/readback agreement.

Declare expectations before behavior changes. Distinguish the resource-schema
migration's placement baseline from the later controls baseline so a resource
distribution change is not attributed to elevation or rivers.

## Existing Measurement Owners

Use `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md` and Standard's
`metrics/{families,targets,studies}`. A measurement describes a completed run;
a MetricTarget supplies product expectations; a named study supplies stable
scenarios. Add projection/native metrics to that bank, not a parallel harness.
The current `metrics/capture.ts` generates with `createMockAdapter`: its results
cannot prove native behavior. Reuse pure measurement functions across
deterministic studies and correlated live proof, with separate evidence
provenance. Native-only observations are unavailable in headless results, never
synthetic passing native-parity targets. Do not build a second benchmark system.

Baseline the existing river-network, representative-relief, Huge-relief,
geography/identity, floodplain and placement studies. Resolve their current
scenario IDs, config digests and seed cohorts before execution. Include wet,
arid, mountain, archipelago and closed-basin cases, with small orientation
fixtures and at least one Huge memory/cardinality case. Use the bank's stable
seeds rather than replacing them after viewing results.

## Predeclared Expectations

| Surface | Expected change | Guard / acceptance |
| --- | --- | --- |
| Physical topography, drainage, discharge, climate | HOLD | Exact outputs on identical source/config/seeds; controls do not retune truth |
| Projected elevation -> native observation | Error down | Exact admitted values or a probe-established quantization rule; observe late too |
| Native cliff derivation | Authored relief respected | Controlled-boundary cases and late-state observation |
| Minor river realization | Authored coverage up | Missing/extra/wrong-class counts explicit, not inferred from readback availability |
| River connectivity/directions | Fidelity up | Known graph connections agree wherever native evidence supports comparison |
| Navigable corridors/transitions | Authored fidelity up | No unexplained rejection/addition or second procedural network |
| Lakes/coasts/water classification | HOLD | No unexpected terrain drift; explicit approved native exceptions only |
| Ecology, floodplains, resource legality, starts | Existing targets HOLD | Compare cohorts and distributions, not one attractive seed |
| Determinism and execution cost | HOLD | Repeat same inputs; record time/memory by size and reject material unexplained regression |

The baseline mock's buildElevation is a no-op. Existing relief metrics read
model elevation and river integrity largely reads terrain masks. Those greens
are not baseline proof of the new native outcomes. Extend observation coverage
before claiming improvement. Do not adjust old target meaning to manufacture a
pass.

## Loop

1. Capture baseline after each prerequisite that changes official policy.
2. Declare the slice's mechanism, expected deltas and protected measurements.
3. Review architecture and physical/native assumptions independently.
4. Implement one complete slice; run focused contract and semantics tests.
5. Run deterministic cohorts; compare distributions and named failures.
6. Build/deploy the exact realization and inspect a correlated live run.
7. Review deviations, repair the earliest failing owner, and rerun affected
   gates. A changed mechanism is a redesign, not tolerance tuning.
8. Delete displaced compensation, then rerun its protected invariants.

Decisions are PASS, FAIL-mechanism, FAIL-collateral or INCONCLUSIVE. Amend a
bound only with an explicit rationale before re-evaluation; never backfit the
original declaration to the observed output.

## Proof Classes

Keep independent facts for contract, semantics, execution, projection, assembly,
generated artifact, installed tree, loader acceptance and live behavior. Record
source SHA, resource receipt, config digest, seed/map size, artifact/install
identity and observation/run correlation for live comparisons. An unresolved
cross-window identity link stays unresolved; seeds or matching-looking maps do
not substitute for identity.

Discover commands from the selected checkout: `nx show project <owner> --json`
and `bun apps/cli/bin/run.js mapgen --help`. The old
`swooper-physics:metrics:report` target is absent on the selected base; the CLI
owns metrics reporting. Normal checks are graph-owned. Do not hide a failed
Habitat rule, type check or resource freshness check to launch the app.

## Review Lanes

- Architecture: sole writers, portable definition/native realization split,
  exact step capabilities, existing shared Habitat law.
- Physics/gameplay: no invented drainage, correct class transitions and
  outlet treatment, meaningful downstream start/resource/floodplain guards.
- Native-runtime: setter/finalizer semantics, late overwrites, lake/seam cases,
  fresh deployment and observation identity.
- Verification: measured model versus projected versus observed surfaces,
  honest unavailable evidence and reproducible cohorts.

Material findings get a disposition and repair before dependent work. Closure
requires a clean Graphite tip plus a working user-facing Studio and the named
live result, not merely completion of these documents.

## Opening Baseline

On 2026-09-27, the existing `earthlike/relief-representative` sample passed
`standard/integrity` and `swooper-earthlike/relief` through the public metrics
evaluator. No source or expectations were changed for this run.

- Source: selected parent `10e6b74493bd5aae7d0016389dd09bd8f12d2512`, with
  startup/materializer prerequisites that do not change physical algorithms.
- Resource snapshot: `aba19f44f2f8f0b2954117c0edb0883b3f439c3d`.
- Config: `swooper-earthlike`, raw JSON SHA-256
  `60c4da8b2b89d603637c105dc87e6d492627ac79a8f13d5a266e6ce0b8cab32c`.
- Scenario: Huge, 106 x 66, map/game seed 1018, players 0-9.
- Foothills 12.60%, rough uplands 7.69%, largest rough-upland component 32.
- Headless observed hills 19.26%, flats 63.79%, non-volcano relief 32.15%.
- Modeled minor/major river tiles 290/421; selected navigable tiles 37 in six
  chains. Final water/lake drift counts zero.

This is headless/mock evidence for one sample, not native Civ7 behavior or a
full-bank pass. The current `mapgen metrics report` CLI has no study selector;
it runs the whole closed bank. The bounded sample used the existing public API,
not a new CLI option or test harness. After `nx run cli-mapgen:build`, run from
`plugins/cli/topics/mapgen`:

```sh
bun -e 'import { evaluateStandardMetricStudies, STANDARD_METRIC_STUDIES } from "@swooper/swooper-physics/standard/metrics"; const study = STANDARD_METRIC_STUDIES.find((study) => study.id === "earthlike/relief-representative"); if (study === undefined) throw new Error("Missing earthlike/relief-representative study"); console.log(JSON.stringify({ studyId: study.id, kind: study.kind, scenario: study.kind === "sample" ? study.scenario : study.scenarios })); const evaluation = evaluateStandardMetricStudies([study]); console.log(JSON.stringify(evaluation)); process.exitCode = evaluation.status === "pass" ? 0 : 1;'
```
