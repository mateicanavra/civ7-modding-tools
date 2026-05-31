# Downstream Realignment Ledger

| Area | Artifact | Assumption Or Impact | Disposition | Evidence | Next Action |
|---|---|---|---|---|---|
| CLI | `packages/cli/src/commands/game/restart.ts`, `exec.ts`, `health.ts`, `inspect.ts` | CLI runtime control should use canonical direct-control boundary | patched | package tests, CLI check/build, focused CLI tests | direct only; no bridge flags or fallback |
| Studio | `apps/mapgen-studio/vite.config.ts` | Studio restart should keep behavior while losing raw socket ownership | patched | Studio build and worker-bundle gate | imports `@civ7/direct-control`; restart path uses native begin plus Tuner readiness |
| Docs | `docs/system/cli/overview.md`, `packages/cli/AGENTS.md`, `packages/civ7-direct-control/README.md` | Developer control docs need direct Civ7 path and proof boundary | patched | docs diff review | App UI restart/begin proven; Tuner has post-Begin canary |
| Operational skill | `.agents/skills/civ7-operational-debugging/**` | Runtime proof guidance should use direct control, not append bridge logs | patched | skill diff review | direct tuner gate plus restart/begin loop replace bridge gate |
| Legacy Bridge | CLI bridge utilities, tests, flags, docs; shared-drive bridge scripts | removed | remove-firetuner-bridge-legacy | no repo bridge owner; shared `Comms/` now only contains `Modifiers.ltp` |
