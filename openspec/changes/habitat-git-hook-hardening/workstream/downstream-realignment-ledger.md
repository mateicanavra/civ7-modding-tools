# Downstream Realignment Ledger

**Change:** `habitat-git-hook-hardening`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `openspec/changes/habitat-git-hooks/**` | Historical H7 closure could be read as fully proving hook side-effect policy. | realigned; pending supervisor review | Historical H7 records now classify the packet as hook wiring/staged containment/local pre-push evidence and explicitly defer current resource publish policy to hook hardening. | pending-review |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-H7-HOOKS` needed current resource-policy proof boundary. | accepted in resource-policy checkpoint | Row now records implicit publish removal, read-only resource-state gate, fail-closed remediation, and open full hook proof classes. | accepted-resource-policy |
| `docs/process/resources-submodule.md` | Current docs said every monorepo commit auto-publishes resources through the hook. | accepted in resource-policy checkpoint | Docs now make `bun run resources:publish` the explicit publish path and state pre-commit only checks resources state. | accepted-resource-policy |
| Root `AGENTS.md` | Current hook guidance preserved resource publish behavior as if settled. | accepted in resource-policy checkpoint | Router now says hooks are local friction reduction and resource publishing is explicit, not a hidden default pre-commit side effect. | accepted-resource-policy |
| `tools/habitat-harness/README.md` | Hook guidance could imply local hook success is broader proof than it is. | accepted in resource-policy checkpoint | Hook guidance now describes read-only resource-state checks, explicit remediation, formatter-touched restage, and local-proof limits. | accepted-resource-policy |
| `tools/habitat-harness/package.json`, root `package.json`, `bun.lock` | Effect adoption would require explicit package dependency surfaces and package-manager-generated lockfile proof. | watched | Patch only if the Effect substrate decision selects Effect for hook transaction orchestration. | watched |
| `habitat-effect-grit-adapter` / future `habitat-effect-hook-transaction` | Hook hardening may require Effect services or command runner decisions shared with other Effect slices. | dependent | Create or consume an Effect hook transaction packet if implementation selects Effect. | watched |
| `habitat-grit-proof-repair` and pattern-generator metadata repair | Hook-scope Grit acceptance depends on Grit proof and Pattern Authority Manifest records. | dependent | Consume hook-scope metadata; do not define Grit authority inside this packet. | watched |
| `habitat-oclif-entrypoint-repair` | Canonical root/dev/prod `habitat hook` proof depends on entrypoint repair. | design packet reviewed; implementation open | Consume implemented command-surface proof before closing canonical hook command proof. | blocking dependency |
