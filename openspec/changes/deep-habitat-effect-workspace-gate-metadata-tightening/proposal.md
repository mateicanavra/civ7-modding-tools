# Change: Deep Habitat Effect Workspace Gate Metadata Tightening

## Why

Some Habitat rules declare `workspace-gate` and `project-owner` path coverage
even though their enforcement surface is already an exact generated path or doc
tree. That makes precise rules look repo-wide, poisons owner target inputs, and
causes classify/pre-push planning to treat unrelated Habitat implementation
files as if every generated-zone rule applies.

## What Changes

- Tighten generated-zone file-layer rules to their exact protected paths.
- Tighten the MapGen docs command rule to the docs tree it checks.
- Classify the inferred `.habitat` artifact project in the boundary taxonomy so
  validation matches Habitat's generated Nx project metadata.
- Preserve genuinely repo-wide rules as workspace gates: formatter CI, import
  boundaries, forbidden package-manager artifacts, and host protected surfaces.
- Record the follow-up from `deep-habitat-effect-owner-check-input-scope` as
  addressed for the scoped rules handled here.

## Non-Goals

- Do not alter protected-zone execution behavior.
- Do not change formatter/import-boundary workspace-gate semantics.
- Do not remove `ownerProject`; this slice only corrects path coverage.
