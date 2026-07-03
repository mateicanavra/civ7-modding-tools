# Change: Deep Habitat Effect Target-Check Alias Drain

## Why

The previous Nx provider identity slice made provider calls request `nx`, but
left `target-check` behind as rule metadata vocabulary and a workspace-tool
alias. That preserves two names for the same vendor capability and keeps a dead
compatibility state in the rule registry.

Habitat should name the capability directly. Graph-backed rules that depend on
Nx targets are Nx-owned rules, and command materialization should only know
about the real `nx` workspace tool.

## What Changes

- Rename the active graph-backed rule ownership value from `target-check` to
  `nx`.
- Require `graphTarget` on `nx` rule records.
- Remove the `target-check` workspace-tool policy alias.
- Update rule graph facts, Nx plugin graph facts, and tests to use the direct
  `nx` identity.
- Close the follow-up items in `deep-habitat-effect-nx-provider-identity`.

## Non-Goals

- Do not change Nx target semantics.
- Do not add a compatibility selector or fallback for `target-check`.
- Do not change provider command materialization for the real `nx` executable.
