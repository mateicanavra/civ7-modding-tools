# Verification Evidence

| Gate | Required | Command Or Protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| openspec-strict | required | `bun run openspec -- validate studio-run-browser-originated-contract --strict` | packet files written | not run | n/a | change validates strictly | open |
| habitat-classify | required | `bun habitat classify <write-set>` | implementation diff exists | not run | n/a | reported authority checks are known | open |
| classify-reported-commands | required | append one row per Habitat-reported Nx/Biome/Grit/Habitat command | `habitat-classify` completed | not run | n/a | every classify-reported command has its own closed verification row | open |
| ui-request-tests | required | focused Studio UI/request tests | implementation diff exists | not run | n/a | visible selections admit one public operation | open |
| live-browser-admission | required | rendered Studio button plus `/rpc` follow-up calls | Studio server from worktree | not run | n/a | status/current/events agree on request id | open |
| review-lanes | required | reviewer prompts | implementation diff exists | not run | n/a | material findings dispositioned | open |
