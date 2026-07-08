# Verification Evidence

| Gate | Required | Command Or Protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| openspec-strict | required | `bun run openspec -- validate studio-run-real-user-matrix-closure --strict` | packet files written | not run | n/a | change validates strictly | open |
| openspec-all | required | `bun run openspec:validate` | all packets present | not run | n/a | OpenSpec tree validates | open |
| habitat-classify | required | `bun habitat classify <write-set>` | implementation diff exists | not run | n/a | reported authority checks are known | open |
| classify-reported-commands | required | append one row per Habitat-reported Nx/Biome/Grit/Habitat command | `habitat-classify` completed | not run | n/a | every classify-reported command has its own closed verification row | open |
| mapgen-studio-test | required | `nx run mapgen-studio:test` | implementation complete | not run | n/a | behavior tests green | open |
| earthlike-live-row | required | rendered Studio button matrix row | Civ7 and Studio available | not run | n/a | Swooper Earthlike starts generated content | open |
| latest-juicy-live-row | required | rendered Studio button matrix row | Civ7 and Studio available | not run | n/a | Latest Juicy starts generated content | open |
| desert-mountains-live-row | required | rendered Studio button matrix row | Civ7 and Studio available | not run | n/a | Swooper Desert Mountains starts generated content | open |
| exact-run-artifact-row-match | required | setup row readback check for every live row | live rows captured | not run | n/a | setup row matches exact admitted runArtifactId and not a prior row | open |
| missed-terminal-recovery-row | required | browser reload or missed terminal event against daemon terminal state | Civ7 and Studio available | not run | n/a | UI adopts daemon terminal state without replaying start | open |
| generated-row-missing-row | required | rendered or controlled row-missing failure | Civ7 and Studio available | not run | n/a | operation terminalizes safely with setup diagnostics | open |
| saved-config-modset-mismatch-row | required | stale saved config mismatch failure | Civ7 and Studio available | not run | n/a | generated-mod mismatch stays private and public status is safe | open |
| repeat-freshness-row | required | repeat same rendered scenario | Civ7 and Studio available | not run | n/a | fresh request/workspace/generated/deployment identities | open |
| public-private-redaction | required | scan retained logs and public status/current/event payloads | live rows captured | not run | n/a | public records contain no private diagnostics or local paths | open |
| review-lanes | required | reviewer prompts | implementation complete | not run | n/a | material findings dispositioned | open |
