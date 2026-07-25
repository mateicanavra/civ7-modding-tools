# Review Disposition Ledger

| Finding | Severity | Disposition | Evidence |
|---|---:|---|---|
| Runtime id overclaim must be impossible in expectation rows | P1 | accepted, implemented | Expectation rows omit runtime ids; strict schema rejects extra runtime/numeric fields. |
| Expectation rows must cover exactly the official corpus | P1 | accepted, implemented | Artifact is generated in `OFFICIAL_RESOURCE_CORPUS` order and tests compare to `OFFICIAL_RESOURCE_TYPE_ORDER`. |
| Blocked rows must stay active-zero | P1 | accepted, implemented | Blocked schema branch requires zero range and blocked evidence; tests check exact blocked list. |
| Schema must be strict enough to reject malformed rows | P1 | accepted, implemented | TypeBox schema uses closed objects/enums and rejection tests. |
| Placement behavior must not move in this slice | P1 | accepted, implemented | Source boundary test rejects adapter/runtime/placement imports. |
| Groups cannot own aggregate closure gates | P2 | accepted, implemented | No group aggregate objects or group ranges are exported; rows own ranges and proof text. |
| Crabs navigable-river eligibility must stay visible | P2 | accepted, implemented | Crabs row includes navigable-river proxy and official type-tag caveat; focused test asserts both. |
| Schema accepted blocked resources as active rows | P1 | accepted, repaired, repair-reviewed | Schema now splits blocked and active resource symbol branches; tests reject `RESOURCE_CLOVES` as active. |
| Schema accepted malformed active range ordering | P1 | accepted, repaired, repair-reviewed | Active range schema now allows only approved ordered range shapes; tests reject `min > target > max`. |
| Runtime-calibrated claims validated without telemetry refs | P2 | accepted, repaired, repair-reviewed | Row-level `runtime-calibrated` evidence was removed from this schema/types until telemetry refs exist. |
