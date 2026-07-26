# Review Disposition Ledger

| Finding | Severity | Disposition | Evidence |
|---|---:|---|---|
| Initial partition omitted `RESOURCE_WINE` and `RESOURCE_QUININE` | P2 | accepted, repaired before spec finalization | Added both to cultivated/plantation/medicinal group; coverage is now `6 + 18 + 11 + 20 = 55`. |
| Artifact name drifted from accepted resource-stage contract | P2 | accepted, repaired | Replaced noncanonical expectation artifact name with `artifact:resources.earthlikeExpectations`. |
| Expectation status needed explicit mapping to corpus disposition | P2 | accepted, repaired | Added status mapping: `expected` requires corpus `strategyRequired.status === "required"`; blocked rows inherit corpus blocked status. |
| Group-level models could become gating obligations | P2 | accepted, repaired | Design/spec now make groups non-gating rollups and require per-resource predicate/range/evidence/gate/stat proof. |
| Marine/coastal grouping risked dropping crabs navigable-river eligibility | P2 | accepted, repaired | Renamed group to aquatic/coastal/navigable-river and added explicit crabs lane preservation requirement. |
| Feature exclusion was missing from optional source-test gates | P3 | accepted, repaired | Source-test gate now includes `FEATURE_*` exclusion when source artifacts are added. |
| Earthlike multipliers need concrete map fields or proxy derivations before implementation | P2 | accepted, repaired | Design/spec now require derived ecological/geologic predicates to name implementation proxies or record proxy gaps. |
| Expected ranges must remain soft until seed telemetry verifies candidate and placement counts | P2 | accepted, repaired | Design/spec now require seed-matrix or in-game telemetry before inferred ranges become hard closure gates. |
| Count guidance needs claim-strength markers | P2 | accepted, repaired | Design/spec now require `official`, `external`, `inferred`, or `runtime-calibrated` evidence strength. |
| Blocked-row evidence rows still carried future nonzero range language | P2 | accepted, repaired | Blocked rows now show active range `0 official; blocked`; any future nonzero range requires a later source-backed disposition outside active range fields. |
| Hard-gate exception allowed official evidence to bypass telemetry calibration | P2 | accepted, repaired | Design now says hard count closure requires runtime-calibrated evidence with eligible-tile denominator and placement telemetry. |
