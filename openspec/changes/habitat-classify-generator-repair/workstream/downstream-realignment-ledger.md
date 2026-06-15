# Downstream Realignment Ledger

**Change:** `habitat-classify-generator-repair`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `openspec/changes/habitat-oclif-entrypoint-repair/**` | Canonical classify product proof depends on trustworthy root/dev/prod Habitat entrypoints and selector behavior. | accepted downstack | Consumed for bounded `habitat classify` wrapper proof; no root command-trust claim is made by this packet. | consumed |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | H8 and target rows need to distinguish repaired classify target truth from still-open generator/rule-scope/migration work. | seed rows present with stale target-truth wording | Update with current target-truth behavior and remaining blockers. | in progress |
| `openspec/changes/habitat-generators-migrations/**` | H8 closure can be read as approving static target output and broad generator capability. | historical source | Reclassify target/generator closure as historical where this packet supersedes it. | open |
| `openspec/changes/habitat-pattern-generator-metadata-repair/**` | Pattern metadata repair depends on classify target truth but must not absorb it. | dependent | Patch only if final dependency wording or classify output contract changes. | watched |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Per-pattern workstreams may need path-aware rule scope from classify. | dependent | Patch only when Grit proof and classify output schemas settle. | watched |
| `tools/habitat-harness/README.md` | Agent guidance currently presents classify targets and generators as more settled than current proof supports. | stale guidance | Update during implementation with resolved-target and supported-root contracts. | open |
| Root `AGENTS.md` | Tooling guidance currently says to run classify and generators, including old Grit pattern generation wording. | stale guidance | Update during implementation with classify target truth and pattern metadata gate. | open |
| `habitat-nx-adoption-cleanup` future packet | Nx cleanup may need to supply graph proof consumed by classify. | not opened | Create dependency note only if classify implementation exposes a graph-authority gap. | watched |
| `habitat-boundary-taxonomy-tightening` future packet | Taxonomy proof may affect rule-scope classification. | not opened | Create dependency note only if rule-scope design needs taxonomy changes. | watched |
