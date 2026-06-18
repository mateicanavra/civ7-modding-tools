# Downstream Realignment Ledger

**Change:** `deep-habitat-d0-public-contract-inventory`
**Owner:** directly responsible implementation agent

| Downstream artifact | Current risk | Required disposition | Status |
| --- | --- | --- | --- |
| Command dependency/build grounding | Stale or missing ignored `tools/habitat-harness/dist/**` command artifacts can produce false command-surface receipts. | Later command packets must run dependency/build grounding before claiming command behavior. No source repair is required from D0. | watched |
| D1 receipt-contract packet | Proof/artifact-shaped surfaces could be preserved as target authority merely because they exist today. | D1 must consume the D0 DTO matrix, reassess proof/artifact-shaped code through concrete repo-maintenance scenarios, and collapse/remove artifact-generation concepts that do not carry product value. | watched |
| D2 Rule Registry Metadata Contract | Rule registry exports and generated per-rule targets could be treated as public API by accident. | D2 must consume the package export and Nx target matrix. | watched |
| D3 Workspace Graph Integration Boundary | Graph plugin aliases and root script targets could be repaired without preserving command guidance. | D3 must consume root script and Nx target compatibility notes. | watched |
| D4 Orientation and Routing | `Classification` currently lacks top-level schema versioning. | D4 must preserve current classify DTO fields or introduce a versioned replacement. | watched |
| D5 Baseline Authority | Baseline internals are broadly exported through `src/index.ts`. | D5 may move them only after import/test realignment or facade introduction. | watched |
| D6 Diagnostic Pattern Catalog | Grit adapter and injected-probe exports are mixed public/internal surfaces. | D6 must preserve receipt/test consumers or move them behind diagnostic catalog APIs. | watched |
| D7 Structural Enforcement Pipeline | `CheckReport` helpers and diagnostics are mixed with enforcement internals. | D7 must preserve schema version 1 JSON or version it. | watched |
| D8 Pattern Governance | Pattern Authority manifest exports are public versioned governance contracts. | D8 must version or migrate manifest changes explicitly. | watched |
| D9 Transformation Transaction | `GritApplyTransactionProof` is the current transaction DTO, but proof/artifact-shaped transaction logic may exceed Habitat's product value. | D9 must keep only receipt fields needed for guarded structural writes, rollback, formatter handoff, and maintenance/evolution decisions; collapse artifact-generation concepts that do not serve those workflows. | watched |
| D10 Generated/Protected Zone Authority | `generated:check` is a public graph target but host policy remains separate. | D10 must not hard-code Civ7 policy into generic Habitat. | watched |
| D11 Local Feedback | Hook CLI is public; `HookTrace` is runtime/test DTO only today. | D11 must not claim hook trace JSON CLI output unless it implements and tests it. | watched |
| Command help/documentation alignment | `habitat hook` help still says hook wiring is deferred although Husky delegation is implemented. | Align command help under a command-surface/docs packet without changing hook behavior. | open |
| D12 Receipt/Handoff Verify Command | `VerifyProof` schema version 1 is current handoff DTO, but its proof-shaped name/model is not automatically target-domain authority. | D12 must preserve compatibility until it deliberately versions/replaces the DTO, and should simplify toward the smallest verify receipt that supports handoff, non-claims, and maintenance decisions. | watched |
| D13 Scaffolding and Refusal Contracts | Project and pattern generator surfaces are already public. | D13 must preserve supported/refused kinds or record versioned refusal changes. | watched |
| D14 Authoring Topology Fence | Unsupported authoring generators must remain refused. | D14 must consume generator refusal notes before adding future topology triggers. | watched |
| Habitat implemented-surface docs | Future agents may miss the D0 matrix. | Link implemented-surface docs to the D0 compatibility ledger. | realigned |
