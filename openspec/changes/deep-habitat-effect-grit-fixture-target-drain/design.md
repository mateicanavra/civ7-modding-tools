# Design: Grit Fixture Target Drain

## Ownership

Habitat has two Grit concerns:

- **Current-tree diagnostics:** owned by `grit:check` and the Habitat pattern
  adapter.
- **Checked-in pattern fixture validity:** owned by
  `@internal/habitat-harness:validate:grit-patterns`, which runs native
  `grit patterns test` over checked-in pattern markdown.

The unit suite owns command materialization and adapter parsing behavior. It
must not execute native Grit merely to prove that the vendor binary exists.

## Target Shape

The target runs:

```bash
bun run --cwd tools/habitat-harness validate:grit-patterns
```

The target is cacheable and declares inputs over:

- `.grit/grit.yaml`;
- `.habitat/patterns/**/*.md`;
- root package and lockfile state;
- the Habitat package manifest that declares the script.

## Output Shape

Use normal `grit patterns test` output. The previous `--json` mode produced a
large match corpus on stderr through the Bun wrapper; this target needs pass/fail
fixture validity, not serialized match evidence.

## Boundary

This slice does not add, remove, or alter Grit patterns. It changes execution
ownership and output shape for existing fixture validation.
