# Folding And Consolidation

Use folding when a local-only stack is too atomized to submit or review branch
by branch. Folding is not the default answer for ordinary stacks.

## When Folding Is Appropriate

- The stack is local-only or not yet PR-associated.
- Branches are micro-slices of one semantic body of work.
- The branch count would create an impractical number of PRs.
- The stack itself remains the intended work carrier.
- You can preserve a branch-map from old branch ranges to survivor branches.

Do not fold:

- submitted/open PRs unless PR association loss is accepted;
- branches whose messages/history are needed for review;
- mixed owner lanes where folding would hide domain boundaries;
- branches you intend to retire rather than carry forward.

## Semantic Groups

A semantic group is a contiguous run of branches that can be reviewed as one
branch without hiding an important contract, runtime boundary, proof boundary,
or ownership decision.

For each group, record:

- original branch range;
- survivor branch;
- semantic name;
- intended final branch name;
- proof/review boundaries preserved or intentionally collapsed.

## Fold Mechanics

Graphite `gt branch fold`:

- folds the current branch into its parent;
- updates descendant dependencies and restacks;
- does not touch GitHub or remote branches;
- has no range argument;
- has no `--no-restack` mode.

Practical implication: fold top-down inside a semantic group when possible so
early folds have fewer descendants. After a group is folded, rename the survivor
branch before submit:

```bash
gt checkout <top-branch-in-group>
gt branch fold --no-interactive
gt branch rename <semantic-survivor-name> --no-interactive
```

Confirm exact command names and aliases with `gt branch fold --help` and
`gt branch rename --help` in the installed Graphite version.

## Restack Timing

The usual consolidation order is:

1. Run deterministic census.
2. Fold semantic groups in place.
3. Rename survivor branches before PR creation.
4. Run one explicit targeted submit-readiness restack from the consolidated
   top branch:

   ```bash
   gt restack --branch <consolidated-top> --downstack --no-interactive
   ```

Do not run a full pre-fold restack solely because an old root says it needs
restack. If the first guarded fold shows the stale stack cannot be folded
coherently, stop and reframe.

## Branch Map Template

```json
{
  "schemaVersion": "graphite-stack-fold-map/v1",
  "groups": [
    {
      "id": "control-orpc-client",
      "survivor": "codex/control-orpc-client-runtime",
      "originalBranches": [
        "branch-a",
        "branch-b"
      ],
      "method": "fold",
      "status": "planned"
    }
  ]
}
```

Keep the map close to the workstream record or accounting ledger. It is the
reviewer's bridge between old local topology and new semantic PRs.
