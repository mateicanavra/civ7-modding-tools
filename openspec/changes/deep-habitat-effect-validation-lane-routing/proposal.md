# Change: Deep Habitat Effect Validation Lane Routing

## Why

Habitat validation has been mixing local feedback, graph proof, hygiene checks,
hook planning, and CI-style verification in provider and hook-runtime files.
That makes short feedback loops inherit workspace-proof behavior and leaves Nx
provider helpers responsible for product validation policy.

## What Changes

- Introduce a `validation-routing` domain for validation lane target policy.
- Move pre-push changed-path target planning out of hook runtime and into that
  domain.
- Make Nx target-name helpers delegate lane lists to the validation routing
  domain, keeping the provider surface as execution/metadata plumbing.
- Preserve current target lists in this slice; later slices can change lane
  membership from the new owner.

## Non-Goals

- Do not change which targets pre-push, verify, or graph checks run yet.
- Do not change Graphite submit behavior or create PRs.
- Do not add structural topology tests.
