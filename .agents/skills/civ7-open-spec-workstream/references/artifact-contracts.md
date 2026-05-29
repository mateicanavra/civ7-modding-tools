# Artifact Contracts

## Artifact Layers

| Artifact | Owner | Purpose |
|---|---|---|
| Canonical docs and skills | Product/architecture authority | Durable rules and target shape |
| OpenSpec config/specs/changes | Workstream owner | Downstream implementation control, validation, archive history |
| Project spec/review | Active project | Time-bound objective, decisions, sequencing, findings |
| Phase record | Workstream continuity | Current phase state and resumability |
| Review disposition ledger | Workstream owner | Findings and repair status |
| Downstream realignment ledger | Workstream owner | Changed assumptions and patch/no-patch disposition |
| Closure checklist | Workstream owner | Final gate evidence |
| Next packet | Workstream owner | Zero-context handoff |
| Commits/Graphite | Repo state | Reviewable checkpoints |

## Default Location

```text
openspec/changes/<change-id>/
```

Use this for implementation changes. Put phase continuity files under
`openspec/changes/<change-id>/workstream/`. Use project-local paths only for
project control records that have not yet become OpenSpec changes.

## Spec/Change Contract

A phase spec or proposal must answer:

- why this phase exists;
- controlling authority refs;
- what changes and what does not;
- dependencies and enabled parallel work;
- affected owners and code areas;
- verification gates and stop conditions.

Tasks must be implementation steps, not unresolved design questions.

## Downstream Realignment Contract

At phase end, record:

- affected docs/specs/issues;
- affected tests/guards/scripts;
- affected generated-output assumptions;
- patch/no-patch/blocked/deferred/not-applicable disposition;
- exact next downstream action.

Patch downstream artifacts when facts changed. Do not patch normative skills with temporary phase trivia.

## Commit Contract

Commit when a coherent artifact or implementation checkpoint is complete.

Before committing:

```bash
git status --short --branch
gt status
git diff --check
bun run openspec:validate
```

Use Graphite for branch and commit workflow in this repo.

## Compaction Contract

A compaction-safe state includes:

- active phase and artifact path;
- controlling authority refs;
- completed and remaining tasks;
- open findings and dispositions;
- latest gate results;
- dirty-file ownership;
- agent fleet state;
- downstream realignment disposition;
- next exact action.

If this exists only in chat, the phase is not compaction-safe.
