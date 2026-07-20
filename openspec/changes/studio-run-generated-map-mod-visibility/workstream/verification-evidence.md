# Verification Evidence

| Gate | Required | Command Or Protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| openspec-strict | required | `bun run openspec -- validate studio-run-generated-map-mod-visibility --strict` | packet files written | not run | n/a | change validates strictly | open |
| habitat-classify | required | `bun habitat classify <write-set>` | implementation diff exists | not run | n/a | reported authority checks are known | open |
| classify-reported-commands | required | append one row per Habitat-reported Nx/Biome/Grit/Habitat command | `habitat-classify` completed | not run | n/a | every classify-reported command has its own closed verification row | open |
| generated-mod-tests | required | focused generated mod/deployment tests | implementation diff exists | not run | n/a | generated mod has visible request-local row | open |
| live-row-visibility | required | live setup/shell row readback | Civ7 and Studio available | not run | n/a | generated row is visible to setup | open |
| review-lanes | required | reviewer prompts | implementation diff exists | not run | n/a | material findings dispositioned | open |
