# D12 Testing Ledger - Game Door Invariant

Status: accepted packet testing plan
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Packet/spec | OpenSpec strict + full validation | D12 target docs agree and no stale implementation closeout remains |
| Direct-control guard | source guard test | only sanctioned production constructors match |
| Contract schema | TypeBox/Zod negative search + contract tests | no Zod import in Studio contract surface |
| Status endpoints | `status-endpoint-corpus.md` + implementation ledger + tests if changed | retained endpoints are diagnostic reads only |
| Control-oRPC surfaces | `control-orpc-surface-corpus.md` + implementation ledger | every game-action/effect surface has owner/risk/consumer |
| Tuner session | OpenSpec task diff + deferral/product proof | no unchecked ownership/recovery promise remains |
| Residue deletion | negative searches | hits are deleted, guarded, historical, diagnostic, or durable deferral |
| Package/app health | check/test/build for touched packages/apps | implementation does not regress runtime surfaces |
| Live proof | consumed D1/D9/D10/D11 proof or new proof if behavior changes | final closeout does not inflate source proof into live proof |
| Graphite drain | submit/merge/sync/status proof | stack closed and merged branches not checked out in worktrees |

## Future Implementation Commands

```bash
bun install --frozen-lockfile
bun run build
bun run check
bun run habitat classify <path-or-diff>
bun run openspec -- validate mapgen-studio-game-door-invariant --strict
bun run openspec -- validate mapgen-studio-tuner-session --strict
bun run openspec:validate
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server test
bun run --cwd packages/studio-server build
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio test
bun run --cwd apps/mapgen-studio build
git diff --check
git status --short --branch
gt status
gt log --no-interactive
```

## Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Guard tests prove ownership boundaries.
- Negative searches prove deletion/classification.
- Package/app gates prove local code health.
- Live proof is consumed or rerun based on behavior-change scope.
- Graphite proof proves stack closure, not runtime behavior.
