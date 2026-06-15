# Downstream Realignment Ledger

**Change:** `habitat-git-hook-hardening`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `openspec/changes/habitat-git-hooks/**` | Historical H7 closure can be read as fully proving hook side-effect policy. | historical source | Reclassify closure as hook wiring/staged containment proof, not resource publish policy closure, after implementation proof. | open |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-H7-HOOKS` remains mixed-with-blockers until this hardening packet is implemented and verified. | seed row present | Update after review with accepted design state and proof boundary. | open |
| `docs/process/resources-submodule.md` | Current docs say every monorepo commit auto-publishes resources through the hook. | stale under this packet | Patch during implementation to state that resources publishing is an explicit command path outside default pre-commit. | open |
| Root `AGENTS.md` | Current hook guidance preserves resource publish behavior as if settled. | stale if policy changes | Patch during implementation with accepted resource publish and hook proof boundaries. | open |
| `tools/habitat-harness/README.md` | Hook guidance can imply local hook success is broader proof than it is. | watched | Patch during implementation if hook output, resource policy, or proof language changes. | open |
| `tools/habitat-harness/package.json`, root `package.json`, `bun.lock` | Effect adoption would require explicit package dependency surfaces and package-manager-generated lockfile proof. | watched | Patch only if the Effect substrate decision selects Effect for hook transaction orchestration. | watched |
| `habitat-effect-grit-adapter` / future `habitat-effect-hook-transaction` | Hook hardening may require Effect services or command runner decisions shared with other Effect slices. | dependent | Create or consume an Effect hook transaction packet if implementation selects Effect. | watched |
| `habitat-grit-proof-repair` and pattern-generator metadata repair | Hook-scope Grit acceptance depends on Grit proof and Pattern Authority Manifest records. | dependent | Consume hook-scope metadata; do not define Grit authority inside this packet. | watched |
| `habitat-oclif-entrypoint-repair` | Canonical root/dev/prod `habitat hook` proof depends on entrypoint repair. | design packet reviewed; implementation open | Consume implemented command-surface proof before closing canonical hook command proof. | blocking dependency |
