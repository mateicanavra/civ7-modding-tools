# Change: Deep Habitat Effect Source Check Exact Coverage Only

## Why

Habitat source-check is now registry-driven: rules carry exact path coverage,
rule modules declare candidate extensions, and execution plans files before
policy logic runs. Keeping the old scan-root fallback for source-check rules
without exact coverage preserves an over-broad compatibility path that lets
rule applicability drift back into generated policy code.

## What Changes

- Require native source-check rules to declare exact path coverage before
  execution.
- Report missing exact coverage as a structured source-check diagnostic.
- Remove scan-root-overlap fallback matching from source-check rule dispatch.
- Keep scan roots as collection hints; exact coverage owns rule applicability.

## Non-Goals

- Do not change rule registry schema for non-source-check rule routing.
- Do not remove project-owner or workspace-gate coverage from graph/classify
  facts.
- Do not change generated source-check rule modules.
- Do not add topology tests.

## Validation

- Focused source-check rule execution test must prove missing exact coverage
  fails closed.
- Live `habitat check --tool source-check` must pass all active source rules.
- Habitat package check, OpenSpec validation, Biome, and whitespace checks must
  pass.
