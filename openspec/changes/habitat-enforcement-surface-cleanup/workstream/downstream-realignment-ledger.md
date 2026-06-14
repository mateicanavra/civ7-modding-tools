# Downstream Realignment Ledger

**Change:** `habitat-enforcement-surface-cleanup`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-H6-ONE-PATH` remains mixed while historical H6 says one path is closed. | seed row present | Update after implementation proof with exact root/CI/wrapper/selector boundaries. | open |
| `docs/projects/habitat-harness/workstream-record.md` | Train-closed and H6 closure rows can be read as current proof despite live repair packets. | historical until this repair lands | Patch or explicitly downgrade before H6 is marked current. | open |
| `docs/projects/habitat-harness/invariant-corpus.md` | H6-era enforcement map still says adapter-boundary is `ci:architecture-strict-core` only and root `check` does not invoke it. | stale authority input | Patch or annotate after implementation proof so future agents do not treat the old migration map as current command truth. | open |
| `docs/projects/habitat-harness/research/local-stage0-claim-extraction.md` and related Stage 0 research records | Research notes contain historical probes and shortcut vocabulary from earlier recovery analysis. | source evidence, not current guidance | Scan during implementation realignment and promote only current proof into claim/workstream records. | open |
| `openspec/changes/habitat-enforcement-consolidation/proposal.md` | Historical H6 proposal says the harness is the only enforcement path and root/CI are repointed. | historical until this repair lands | Patch or annotate with current proof boundary if wrappers/diagnostic aliases remain. | open |
| `openspec/changes/habitat-enforcement-consolidation/tasks.md` | Tasks are checked as closed but current selector and wrapper parser gaps remain. | historical until this repair lands | Patch closure wording and task evidence after implementation proof. | open |
| `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md` | Results claim single-path closure from old local proof. | historical until this repair lands | Patch results, evidence boundary, wrapper dispositions, and current proof state. | open |
| `openspec/changes/habitat-grit-proof-repair/**` | Grit proof depends on truthful rule selection and enforcement surface. | dependent packet open | Patch dependency wording if H6 cleanup changes accepted Grit proof command surface. | open |
| `openspec/changes/habitat-git-hook-hardening/**` | Hook proof depends on canonical pre-push/check target selection. | dependent packet open | Patch dependency wording if verify/pre-push target policy changes. | open |
| `tools/habitat-harness/README.md` | Agent guidance may overstate one enforcement path or understate direct diagnostic aliases. | active guidance | Patch if root/CI or wrapper policy changes user-facing commands. | open |
| Root `AGENTS.md` | Agent operating loop points at classify and Habitat targets; may need updated proof-surface wording. | active guidance | Patch if stable guidance changes. | open |
| `.github/workflows/ci.yml` | CI currently uses Habitat verify and diagnostics artifact; proof policy may require metadata changes. | active CI config | Patch only if implementation changes CI proof policy. | watched |
