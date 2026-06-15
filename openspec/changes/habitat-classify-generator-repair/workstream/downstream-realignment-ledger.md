# Downstream Realignment Ledger

**Change:** `habitat-classify-generator-repair`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `openspec/changes/habitat-oclif-entrypoint-repair/**` | Canonical classify product proof depends on trustworthy root/dev/prod Habitat entrypoints and selector behavior. | accepted downstack | Consumed for bounded `habitat classify` wrapper proof; no root command-trust claim is made by this packet. | consumed |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | H8 and generator rows need to distinguish repaired classify target/scope truth, generator support/refusal/discovery truth, and no-op migration wiring truth from still-open convention migration/product work. | patched for current classify target, scope, generator support/refusal, scratch discovery, target-matrix, and no-op migration wiring behavior | Keep open until final packet closure lands. | partially realigned |
| `openspec/changes/habitat-generators-migrations/**` | H8 closure can be read as approving static target output, broad generator capability, or convention migration capability from a no-op migration. | patched as historical source | H8 phase record now states the no-op migration is wiring proof only and not convention migration proof. Broader H8 target/generator historical realignment remains open for final closure. | partially realigned |
| `openspec/changes/habitat-pattern-generator-metadata-repair/**` | Pattern metadata repair depends on classify target truth but must not absorb it. | dependent | Patch only if final dependency wording or classify output contract changes. | watched |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Per-pattern workstreams may need path-aware rule scope from classify. | dependent | Patch only when Grit proof and classify output schemas settle. | watched |
| `tools/habitat-harness/README.md` | Agent guidance currently presents classify targets and generators as more settled than current proof supports. | stale guidance | Update during implementation with resolved-target and supported-root contracts. | open |
| Root `AGENTS.md` | Tooling guidance currently says to run classify and generators, including old Grit pattern generation wording. | stale guidance | Update during implementation with classify target truth and pattern metadata gate. | open |
| `habitat-nx-adoption-cleanup` future packet | Nx cleanup may need to supply graph proof consumed by classify. | not opened | Create dependency note only if classify implementation exposes a graph-authority gap. | watched |
| `habitat-boundary-taxonomy-tightening` future packet | Taxonomy proof may affect rule-scope classification. | not opened | Create dependency note only if rule-scope design needs taxonomy changes. | watched |
