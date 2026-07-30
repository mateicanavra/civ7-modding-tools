<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="steps" title="Steps"/>
  <item id="verification" title="Verification"/>
</toc>

# How-to: add a completion dependency

## Purpose

Add a payload-free causal edge for a successful transaction whose result exists
only in mutable external state.

## Prereqs

Confirm that a later selected step actually consumes the completed external
state. If an exact artifact already represents that completed outcome, depend
on the artifact instead. A planning or pre-materialization artifact from the
same provider does not replace an external-state completion. If the edge only
repeats the recipe array order, add nothing.

## Steps

1. Add one typed `CompletionId` constant to the owning recipe catalog.
2. Select that constant in the provider's `provides` list.
3. Select the same constant in each genuine consumer's `requires` list.
4. Keep the provider fail-hard: it must throw before returning when its semantic
   transaction cannot complete.

```ts
import type { CompletionId } from "@swooper/mapgen-core/authoring";

export const STANDARD_COMPLETIONS = {
  elevationBuilt: "completion:map.elevation-built",
} as const satisfies Readonly<Record<string, CompletionId>>;
```

Do not create a definition object, registry entry, adapter event, or manual emit
call. Selected-plan compilation admits the edge once; sequential fail-fast
execution already prevents the consumer from running after a failed provider.

## Verification

- Compile a selected plan containing the consumer but not the provider and
  confirm plan admission fails.
- Confirm a throwing provider prevents its consumer from running.
- Confirm a successful semantic no-op permits its consumer to run.
- Run `nx run mapgen-core:test` and the owning mod's test target.
