# Evidence And Proof

Use this reference when recording what a gate proves and what it does not prove.

## Proof Classes

| Proof class | Proves | Does not prove |
| --- | --- | --- |
| OpenSpec validation | OpenSpec artifact shape | source behavior, generated output, runtime behavior |
| Unit/integration tests | local source contract under test conditions | deployed Civ7 behavior unless the test exercises it |
| Local stats | generated pipeline output for selected seeds/configs | runtime engine legality or live game readback |
| Build proof | source compiles/builds | deploy success or game load |
| Deploy proof | generated files copied to target location | game loaded or executed them |
| Runtime logs | bounded live observations | unexercised paths or future runs |
| FireTuner/API response | command path returned a response | map generation completed unless logs prove it |
| Graphite submit/PR | external review artifact exists | behavior correctness or runtime proof |

## Runtime Proof Record

Runtime proof must name:

- branch and commit;
- downstack restart/control branch and commit when relevant;
- deploy command/path;
- restart/control command or API path;
- request id and response;
- runtime state or manual boundary, if any;
- log file paths;
- timestamp or mtime bounds;
- parsed payload summary;
- exact claim satisfied or unresolved.

Logs count only when fresh, bounded, parseable, and tied to the branch being
claimed.

## Closure State Matrix

Use exact labels:

- **Local commit complete:** branch committed locally and worktree clean.
- **Graphite submitted:** `gt submit` or equivalent produced PR/version
  evidence.
- **PR created/updated:** PR URL, state, branch, and submitted head are known.
- **Local stats proof:** stats match predeclared expected ranges for named
  seeds/configs.
- **Runtime proof:** live deployed behavior is proven through fresh bounded
  logs or readback.
- **Product proof:** the user-facing claim is proven across the required
  conditions, not only one local/runtime sample.

Do not claim a stronger label than the evidence supports.

## Exact Closure Language

Every `<...>` placeholder below must be replaced with real evidence. A closure
statement that still contains an unfilled `<...>` is not a valid claim.

Local commit:

```text
Locally committed on <branch> at <commit>; worktree clean. This records local
commit closure only. External Graphite submission/PR delivery remains unclaimed.
```

Runtime proof:

```text
Runtime proof is <satisfied/unresolved> for <claim> on <branch>@<commit> after
deploy <deploy command/path> to <target>, using restart/control path
<command/API path> via <control branch>@<commit if relevant>, request id <id>,
response <response>, runtime state/manual boundary <state/boundary>, logs
<files> bounded by <timestamps/mtimes>, parsed payload <summary>. This proves
only <exercised path>; excluded claims remain <list>.
```

Product proof:

```text
Product proof is <satisfied/unresolved/not required> for <user-facing claim>
across <required conditions>. Evidence covers <scope> via <records>; uncovered
or excluded conditions are <list>. Local tests, stats, deploy, or one runtime
sample do not prove broader product behavior unless each required condition is
covered here.
```

## Stale-Record Audit

Before closure, compare actual state against:

- `tasks.md`;
- `workstream/phase-record.md`;
- `workstream/review-disposition-ledger.md`;
- `workstream/downstream-realignment-ledger.md` (OpenSpec slices only);
- `workstream/next-packet.md` (OpenSpec slices only);
- live `NOTE-TO-DRA*.md` or watcher notes;
- `git status`, `git log -1`, and `gt log --no-interactive`.

The `workstream/*` record templates are owned by `civ7-open-spec-workstream`;
for a pre-OpenSpec planning slice, audit only the records that exist.

Stale unchecked commit tasks, "ready to commit" phase text after commit, and
next packets that tell the next agent to redo complete work are closure
blockers.
