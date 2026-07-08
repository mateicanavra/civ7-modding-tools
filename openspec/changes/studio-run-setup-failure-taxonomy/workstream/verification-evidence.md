# Verification Evidence

| Gate | Required | Command Or Protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| openspec-strict | required | `bun run openspec -- validate studio-run-setup-failure-taxonomy --strict` | packet files written | not run | n/a | change validates strictly | open |
| habitat-classify | required | `bun habitat classify <write-set>` | implementation diff exists | not run | n/a | reported authority checks are known | open |
| classify-reported-commands | required | append one row per Habitat-reported Nx/Biome/Grit/Habitat command | `habitat-classify` completed | not run | n/a | every classify-reported command has its own closed verification row | open |
| diagnostics-tests | required | focused runtime-control diagnostics tests | implementation diff exists | not run | n/a | setup failures have specific private reasons | open |
| direct-control-modset-readback-tests | required | focused direct-control setup readback tests | implementation diff exists | not run | n/a | generated-mod-not-enabled uses active mod-set evidence | open |
| live-row-missing | conditionally required | live or controlled endpoint check | row-missing scenario available | not run | n/a | row invisibility is classified specifically | open |
| review-lanes | required | reviewer prompts | implementation diff exists | not run | n/a | material findings dispositioned | open |
