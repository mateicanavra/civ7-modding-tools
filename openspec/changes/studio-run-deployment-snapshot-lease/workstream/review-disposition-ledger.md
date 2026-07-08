# Packet 11 Review Disposition Ledger

Date: 2026-07-08

## Accepted And Repaired

| Finding | Severity | Disposition |
| --- | --- | --- |
| Snapshot digest order could be nondeterministic. | P2 | Accepted. Snapshot hashing now reduces over the sorted snapshot file list. |
| Deployment evidence was not atomic enough in runtime state. | P2 | Accepted. Runtime state carries `deploymentEvidence` as the private container for `runDeployment` plus `deployedSnapshot`. |
| Fake deployment helpers could construct inconsistent request/materialization evidence. | P2 | Accepted. Tests now route through helpers using actual `requestId` and materialization; snapshot `fileCount` is derived from fixture files. |
| Lease attach failure was swallowed and workflow could continue into Civ7 control. | P1 | Accepted. Lease evidence attach failure now fails the transition, terminalizes through workflow failure handling, and is behavior-tested. |
| Post-deploy phases could be represented without deployment evidence. | P2 | Accepted. Post-deploy transition variants require `deploymentEvidence`; runtime also fails closed if a future caller reaches a post-deploy phase without evidence. |
| Cancellation could release the runtime lease while deployment copy/snapshot was still running. | P1 | Accepted. The workflow tracks the deploy promise and cancellation cleanup waits for that critical section before terminal publish releases the lease; tests prove cancel remains pending while deploy is pending. |
| Public active-operation errors leaked `deployedModId`. | P2 | Accepted. Public blocked diagnostics now contain only safe operation-active fields; private lease/diagnostics retain deployed mod evidence. |
| SA-13 overclaimed runtime request-workspace output as source topology. | P2 | Accepted. Structural matrix now classifies attribution files as runtime evidence verified by behavior/live proof, not `structure.toml` source topology. |
| SA-11 copy-deploy Grit rule was too token/file-wide in places. | P2 | Accepted. The rule now scopes generated-root/stable-mod-id checks inside the deploy helper and deploy/snapshot threading inside `deployRunInGame`. |
| SA-02 identity-owner Grit rule included brittle whole-body assertions. | P2 | Accepted. The rule now focuses on scoped identity/record fields, capability presence, and negative content-digest identity checks. |

## Residual P3

| Finding | Disposition |
| --- | --- |
| Broad `RunInGameInternalOperation` still has optional `deploymentEvidence`. | Nonblocking. Transition types plus fail-closed runtime guard cover Packet 11; future type-state split can collapse this further. |
| `RunDeployment` and `DeployedModSnapshot` repeat identity fields. | Nonblocking. Current builders/tests are consistent; future canonical evidence parser/builder would further reduce fixture risk. |
| Grit rules retain some local-name sensitivity. | Nonblocking. Accepted as current guardrail shape after removing the brittle whole-body/topology overclaims. |
| Filesystem cancellation is cooperative around async file operations. | Nonblocking. Packet 11 requires lease release to wait for deploy critical-section settlement, which is covered. OS-level file syscall cancellation is not claimed. |
| Setup config wording around enabling the Studio-run mod id was stronger than implementation. | Resolved in packet docs/tasks: Packet 11 launches via the stable Studio-run map script and reports setup/visibility failures if Civ7 cannot observe it. |
| Snapshot design wording claimed marker observations inside `DeployedModSnapshot`. | Resolved in design: snapshot records file identity/digests; marker observations live in materialization proof. |
