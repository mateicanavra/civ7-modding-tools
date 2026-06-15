# Review Disposition Ledger

**Change:** `habitat-git-hook-hardening`
**Status:** accepted P1/P2 review findings patched into design packet
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `HGH-REV-P2-001` | Resource publishing / hook transaction | P2 | Explicit publish policy did not define the complete resources state matrix. Current status script evidence covers submodule-internal dirtiness, but implementation proof must cover dirty submodule contents, changed monorepo gitlink, staged gitlink, unstaged gitlink, uninitialized submodule, lock state, and refusal before any Biome/Grit/formatter phase. | Accepted. | Design, spec, tasks, tests, and verification gates now require a resources state matrix, exact remediation commands, and ordering proof before Biome/Grit/restage. | patched |
| `HGH-REV-P2-002` | Effect/substrate | P2 | The packet required an Effect adoption decision but omitted package dependency surfaces. Habitat currently has no Effect dependency in `tools/habitat-harness/package.json`; adopting Effect requires version, runtime-edge, service-boundary, and package-manager-generated lockfile proof. | Accepted. | Proposal, design, tasks, and downstream ledger now include `tools/habitat-harness/package.json`, root `package.json`, `bun.lock`, dependency/version proof, service-boundary proof, and lockfile proof when Effect is adopted. | patched |
