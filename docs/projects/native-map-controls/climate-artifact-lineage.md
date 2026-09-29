# Climate Artifact Lineage And Decision

## Question And Evidence Boundary

Are pressure, wind and temperature different kinds of published products, or
did the thermal-coherence repair miss an intentional field-extraction program?
This audit compares implementation, adopted plans, later reconstruction and
current contracts. A surviving bundle is not proof that an extraction was
rejected; a local branch's normative document is not automatically current
repository law. Our September 29 documentation is an output of the disputed
decision, not independent evidence for it.

The audit used three independent lanes: code/branch lineage, documentation and
blueprint lineage, and the current producer/consumer graph. Historical paths
below are inspectable with `git show <commit>:<path>` even where the file never
landed on main. No game or physics result is inferred from this architecture
audit.

## What The History Establishes

| Date / commit | Change | What it establishes |
| --- | --- | --- |
| December 2025, ADR-ER1-010 | TS-owned rainfall/humidity `climateField` replaces engine authority | Artifact ownership rather than a universal payload-granularity rule. |
| January 13, `570aca7795` | Hydrology publishes `windField` | Wind moves from Foundation ownership, not out of a universal climate container. Initially bundles wind U/V and current U/V. |
| January 17, `7d993ad36d` | M9 S4 introduces `climateIndices` with thermal, PET/aridity and freeze | A deliberate minimal downstream descriptor set for moving Ecology off its own proxies, not a permanent prohibition on finer products. |
| July 20, `c973a01c47` | Pipeline Realism `DESIGN-LAW.md`, category 1 | Explicit program-level direction: independently meaningful physical fields should have operations and published artifacts. Temperature is in scope. |
| July 20, `b2cefe47f9` | Separates immutable baseline/final rainfall-humidity vintages | Removes mutable shared publication; it is not pressure/wind extraction or scalar atomization. |
| July 21, `3abefcbc92` | Caused pressure and the thermal handoff design | Replaces synthetic pressure inside the wind operation with separately computed/published pressure, not an extraction from `climateField`. E1/E3 also identifies refine's duplicate temperature and adopts `thermalField`. |
| July 21, `4c42ee86ed` | Implements `artifact:hydrology._internal.thermalField` | A real named-object artifact, `{ surfaceTemperatureC }`, not just a proposal or raw-array payload. |
| July 21, `4f37be5ae4` | Pressure experiment seal and NEXT | Thermal publication completed; refine repoint explicitly remains unfinished. |
| July 23-26, `f49bb84e15` through `79f1db5e2d` | Wind narrows to atmospheric U/V | Currents become invocation-local because no downstream causal consumer requires their durable publication. Extraction did not mean publishing more arrays indiscriminately. |
| July 26-30, normalization commits | Domain/module ownership and exact artifact admission | These govern where and how products are published. They do not establish one artifact per scalar or require all climate quantities to be bundled. |
| July 31, `299dbac3e7` | Reconstructs caused pressure/circulation in current topology | Pressure/wind integration landed; baseline thermal publication and the refine follow-up did not. This is not evidence that the thermal design was rejected. |
| September 29, `9a8bee662d`, `98c9d00e9f` | Our raw-array rule expansion, two thermal artifacts and documentation | The causal repair is valid; the wider publication prescription was asserted before this complete history was checked. |

### The Missing Branch Matters

`4c42ee86ed` and the pressure seal are retained by local
`claude/wind-field-rca`; neither is an ancestor of this workstream. The current
tree descends from the July 31 reconstruction. That reconstruction's
`docs/projects/engine-refactor-v1/post-it.md` explicitly treats the old flat-path
branch as evidence rather than an integration candidate. The thermal artifact
and program design-law files were therefore not deleted from main: they never
landed there. No explicit later rejection of the thermal destination was found.

The relevant historical documents are:

- `c973a01c47:docs/projects/pipeline-realism/DESIGN-LAW.md`, category 1.
- `3abefcbc92:docs/projects/pipeline-realism/experiments/pressure-field/RECORD.md`, E1 and E3.
- `4f37be5ae4:docs/projects/pipeline-realism/experiments/pressure-field/NEXT.md`, climate-refine repoint.
- `4c42ee86ed:mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts/thermal-field.schema.ts`.
- `7d993ad36d:docs/projects/engine-refactor-v1/issues/LOCAL-TBD-M9-hydrology-s4-cryosphere-aridity-diagnostics.md`, proposed minimal additive artifact set.

## The Distinctions That Actually Matter

A **field** describes spatial data. An **artifact** is the admitted, immutable,
dependency-declared publication of a product. A field can be an artifact or a
member of one. Neither implies a separate ambient storage system. A numerical
operation, published product, visualization layer and typed-array allocation
are four different boundaries.

| Product | Meaning and boundary | Current use |
| --- | --- | --- |
| `pressureField` | Annual circulation-pressure anomaly, not absolute surface pressure | Inspection/metrics; seasonal pressure feeds wind inside baseline, not through the annual artifact. |
| `windField` | One annual atmospheric vector, with U and V components | Refine diagnostics and inspection; seasonal wind drives transport inside baseline. |
| Baseline `thermalField` | Annual actual-ground/SST temperature before albedo feedback | The explicit physical handoff from baseline to refinement. |
| Final `climateIndices` | Completed post-feedback thermal/water-stress descriptors | Ecology and Placement consume temperature together with moisture/aridity/freeze. |

Pressure, wind and baseline ground temperature are all independently meaningful
physical fields. There is no intrinsic rule allowing the first two to be
artifacts but forbidding temperature. Their common producing step does not
erase their separate meanings. Conversely, seven of the eight final-temperature
consumer steps also need other `climateIndices` members. The remaining
`plot-biomes` consumer needs temperature alone: that is real schema coupling,
but currently not a second numerical computation, extra copy, scheduling
barrier or cycle. Grouping is a product choice, not proof of physical coherence.

Pressure's sea-level thermal calculation is intentionally different from the
actual-ground temperature: it excludes ground lapse, uses the same calibrated
thermal law, and serves a different datum. The defect was a second independent
ground-temperature model in refinement, not this datum-specific calculation.

## Decision

Complete the concrete July thermal deferral in current architecture:

1. Publish the annual baseline as `thermalField`, with a named
   `{ surfaceTemperatureC }` payload, finite samples and map cardinality.
2. Require that exact artifact in refinement. Apply only declared feedback;
   do not reconstruct base temperature from another solar curve or controls.
3. Retain final `climateIndices.surfaceTemperatureC` as part of the completed
   downstream descriptor product. It is a later, post-feedback vintage, not
   an alias alongside a second authoritative final temperature artifact.
4. Do not also place baseline temperature in `baselineClimateField`. Do not
   introduce a raw-array final-temperature artifact or weaken the kind rule.

This is not a compromise that duplicates authority: one baseline publication
feeds one final publication, and one numerical thermal calibration owns both.
It completes the documented physical handoff without claiming that the old
program's literal publication of every intermediate is already adopted
repository-wide. Current normalization deliberately leaves invocation-local
ocean/seasonal state local when it has no durable handoff.

The stable selection rule is **a separately meaningful published product with
an identified owner, lifetime and consumer contract**, not one artifact per
array and not one artifact per producing step. The July physical-field
direction is genuine evidence for a separate baseline thermal product. The
January descriptor contract is genuine evidence for retaining its final
consumer-facing shape. A future split of final descriptors needs an actual
independent producer/refinement lifetime or a deliberately reviewed narrower
consumer API; it must not be justified merely by key count. Likewise, bundle
age alone cannot veto such a split.

### Blueprint And Documentation Disposition

The enforced artifact blueprint is kind-wide, not unfinished local scaffolding.
It requires one exported artifact authority with an inline `Type.*` root,
complete admission and bounded imports. It does not require multiple payload
properties. Existing pressure and wind use named `Type.Object` payloads; the
historical thermal artifact did too. The proposed thermal product fits that
law without an exemption, rule expansion, or a second validator.

Restore the pre-change rule. Correct our new general scalar-splitting
prescription in `ARTIFACTS.md`, and explicitly supersede ADR-021 rather than
presenting its recent prose as historical authority. Preserve the actual
thermal, albedo and resource-density fixes, and all calibration failures.

## Verification Boundary

Publication changes must preserve numerical output from `c4b6601e0c`: same
seasonal aggregation, SST, feedback and final downstream arrays. Verify finite
admission, exact artifact requirements, disabled-feedback identity, enabled
feedback/nonmutation, actual producer-to-consumer data flow, and visualization.
Run the original kind policy and owning checks/build/tests. Existing numerical
study failures remain calibration work, not grounds to relax expectations.

The [corrected publication proof](thermal-coherence.md#corrected-publication-proof)
records the completed checks: original policy/typechecks/builds pass; the same
twelve calibration expectations remain; all 120 retained field hashes match
across ten scenarios. Independent review found no correctness issue in the
handoff or historical account. Numerical parity is scoped to those captures,
not a claim of complete native-engine behavior.
