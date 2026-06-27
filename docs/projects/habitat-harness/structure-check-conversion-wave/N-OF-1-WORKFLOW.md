# N-of-1 Mixed Command-Check Prep Workflow

## Purpose

This is the single-agent workflow for preparing one bounded Habitat segment for
later mechanical extraction.

Round 1 is preparation only. The agent does not implement rule moves, edit
command scripts, create Grit patterns, or author `.structure.toml` files. The
agent turns the existing corpus into implementation-ready extraction rows.

Round 2 is the implementation pass. The same agent can be compacted and then
reused to execute the rows it prepared.

## What Already Exists

The classification work is not starting over.

The existing inputs are:

1. `docs/projects/habitat-harness/command-check-split-systematic-wave/assertion-corpus.jsonl`
2. `docs/projects/habitat-harness/structure-check-conversion-wave/assertion-corpus.jsonl`
3. `docs/projects/habitat-harness/structure-check-conversion-wave/mechanical-extraction-inputs.jsonl`
4. `docs/projects/habitat-harness/execution-surface-map/`
5. Current `.habitat/**` rule packets and current package source.

The first corpus already classified many assertions. The prep task is to
reconcile, normalize, and fill in the implementation inputs that make later
extraction mechanical.

## Round 1 Output Contract

For its assigned segment, the agent must leave a parseable extraction ledger.

Each assertion row needs:

- `ruleId`
- `assertionId`
- `assertionSummary`
- `sourceFiles`
- `commandScript`
- prior owner/disposition from the existing corpus
- final owner for the next implementation pass
- prep status
- next-round action
- target packet or residual owner hint
- extraction inputs, such as remove-from script, structure scope hints, Grit
  scope files, companion proof commands, retained residual owner, or explicit
  non-structure notes
- proof commands
- confidence and notes

The canonical current prep ledger is
`mechanical-extraction-inputs.jsonl`.

## Stage 1: Reconcile Existing Corpus

Goal: establish current truth without recreating the whole investigation.

Actions:

1. Start from existing assertion rows for the segment.
2. Check that each `ruleId`, `rule.json`, and `.check.*` path still exists.
3. Mark stale rows as stale only if current disk proves they are already
   converted or deleted.
4. Add only genuinely missing current branches that are still in the command
   script.

Do not reclassify rows that are already specific and current. Preserve the old
classification unless direct source evidence shows it is wrong.

Exit artifact:

- current assertion rows for the segment, with stale rows removed or marked.

## Stage 2: Normalize To Extraction Actions

Goal: turn classification into next-turn instructions.

For each assertion, record exactly one final owner:

| Final owner | Meaning |
| --- | --- |
| `structure-check` | Pure current-tree file/directory topology expressible in TOML v1. |
| `grit-check` | Source, Markdown, import/export, call, identifier, or token shape that Grit should own. |
| `existing-rule` | A narrower accepted Habitat rule already owns the assertion. |
| `package-local-validator` | Runtime/API behavior, exact positive currentness, generated-output equivalence, evaluated config, docs reference resolution, or package semantics. |
| `nx-data` | Package JSON/Nx target graph/order/workspace graph metadata. |
| `delete-demote` | Transitional wrapper, stale compatibility branch, duplicate, or branch not worth preserving. |
| `needs-split` | One prior assertion row still contains multiple proof classes and must be split before code edits. |

This stage is not broad semantic discovery. It only converts prior
classification into concrete extraction work.

Exit artifact:

- each row has a final owner, prep status, next-round action, and extraction
  inputs.

## Stage 3: Fill Mechanical Inputs

Goal: make Round 2 implementation straightforward.

For `structure-check` rows, log:

- expected root/path globs;
- required, allowed, or forbidden child hints;
- exact old command-script branch to remove later;
- proposed target packet location;
- focused proof command.

For `grit-check` rows, log:

- source files or globs to scan;
- forbidden tokens/imports/calls/Markdown shape;
- proposed target packet location;
- exact old command-script branch to remove later;
- focused proof command.

For `existing-rule` rows, log:

- companion rule id/proof command;
- exact old command-script branch to remove later;
- whether a coverage gap remains.

For `package-local-validator` and `nx-data` rows, log:

- why this is not structure-check or Grit;
- where it should remain for now;
- what future owner would replace the residual command check, if known.

For `delete-demote` rows, log:

- branch to delete;
- reason not to preserve it.

Exit artifact:

- the segment is ready for implementation without another classification pass.

## Stage 4: Prep Review

Goal: prevent the next implementation pass from discovering avoidable ambiguity.

Review axes:

1. **Corpus completeness:** every current branch in the segment's command
   script appears in the extraction ledger.
2. **Owner correctness:** no source predicate is routed to structure-check, no
   topology is hidden in Grit, and no package/runtime/currentness behavior is
   laundered into Habitat static authority.
3. **Mechanical readiness:** every implementable row names what to create,
   what to remove, and what proof to run.
4. **Residual honesty:** retained rows are retained because their proof class is
   wrong for structure/Grit, not because the prep was incomplete.

Accepted P1/P2 review findings must be fixed before Round 1 closes.

## Stage 5: Round 1 Closure

Round 1 closes when:

- the segment extraction ledger parses;
- every row has a final owner and prep status;
- every implementable row has a next-round action and proof command;
- every retained row names the proof class that keeps it out of structure/Grit;
- review findings are fixed or explicitly dispositioned;
- no implementation code edits have been made.

## Round 2: Mechanical Extraction

Round 2 starts from the prep ledger, ideally after compacting and reusing the
same agent.

The Round 2 agent:

1. implements `structure-check`, `grit-check`, `existing-rule`, and
   `delete-demote` rows that are marked ready;
2. narrows or deletes command scripts only after every removed branch has a
   destination;
3. leaves `package-local-validator` and `nx-data` rows as honest residuals
   unless an accepted owner already exists;
4. updates adjacent `category.md`, `.habitat/SUBJECT-CATEGORIES.md`, analytics,
   and proof ledgers;
5. runs focused and aggregate proof;
6. commits a clean worktree.

## Multi-Agent Use

The multi-agent version is parallel N-of-1 prep or extraction over bounded
segments.

Each agent receives one segment and this workflow. Each agent produces or
consumes a segment extraction ledger. The orchestrator only resolves
cross-segment conflicts and runs final aggregate proof.

