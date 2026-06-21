# Change: Deep Habitat Effect Pre-Push Artifact Target Policy

## Why

Pre-push currently asks Nx for generic `check` targets even when the diff only
changes Habitat artifacts. Because source-check rule artifacts are owned by
Habitat rule targets, generic `check` turns an artifact edit into ordinary
product build/check work. That is the wrong local feedback path for rule
authoring.

## What Changes

- Select pre-push Nx targets from changed paths.
- Keep generic `check` for ordinary source/product changes.
- Use Habitat structural targets for Habitat artifact-only changes.
- Run source-check and Grit pattern validation only when the artifact family
  can affect those tools.

## Non-Goals

- Do not change CI target policy.
- Do not change `check:graph`.
- Do not add topology tests; this is enforced through the hook service and Nx
  provider behavior.
