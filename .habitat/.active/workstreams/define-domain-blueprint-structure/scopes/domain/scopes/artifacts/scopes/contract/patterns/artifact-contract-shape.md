# Artifact Contract Shape

Status: active working reference

Subject:
any `*.contract.ts` file under a nested `artifacts/contract/` directory.

Applies to:
- `<domain>/artifacts/contract/<artifact>.contract.ts`;
- any other map-generation source subtree that intentionally uses the nested
  `artifacts/contract/<artifact>.contract.ts` shape.

Does not apply to:
- operation-local `contract.ts` files;
- recipe step `*.contract.ts` files outside `artifacts/contract/`;
- broad artifact registries outside `artifacts/contract/`.

Required behavior:
- the file defines exactly one pipeline truth product artifact;
- the artifact value is defined by a file-local `Schema`;
- the artifact contract is exported as `artifact = defineArtifact(...)`;
- publish-time validation is exported as `validate(...)`;
- contextual operation-boundary assertion is exported as `assert(...)` only
  when execution proves publish-time validation cannot know the required
  external compatibility context;
- the contract owns validation rules for the artifact value; operation code
  owns call-site choice and contextual values, not reusable artifact-shape
  predicates.

Stable export surface:

```ts
export const Schema = ...;
export type Artifact = Static<typeof Schema>;
export const artifact = defineArtifact(...);
export function validate(value: unknown): readonly { message: string }[];
// Optional, only when contextual operation-boundary assertions are justified.
export function assert(value: unknown, context: AssertionContext): Artifact;
```

The type export may be semantically named when that materially improves
call-site readability or generated declaration output. Validation and assertion
exports must not include the artifact name, domain name, migration source, or
other instance-specific meaning. Callers that need semantic clarity should
namespace-import the contract module.

Validator shape:
- `validate` returns a readonly issue list and does not mutate, normalize, fill,
  repair, or coerce the artifact payload;
- an empty issue list means publishable;
- `assert` may call `validate` and throw with contextual operation scope, then
  return the narrowed artifact value;
- contextual `assert` checks are not a substitute for publish-time validation.

Authority separation:
- this pattern defines the artifact contract file class, not any particular
  artifact payload, artifact id, field list, or domain migration decision;
- concrete artifact examples belong in packet evidence, focused fixtures, or
  tests that are explicitly labeled as examples;
- examples do not become part of this pattern unless first generalized into
  class-level structure or constraints.

Violation messages:
- artifact contract files with zero or multiple `defineArtifact(...)` values;
- semantic function exports for validation/assertion instead of stable
  `validate` / `assert`;
- validators that normalize, repair, or silently coerce payloads;
- operation implementation, strategy logic, or registries in artifact contract
  files;
- files under `artifacts/contract/` that are not artifact contract source;
- pattern authority that embeds one artifact's concrete payload shape, artifact
  id, domain-specific compatibility rule, or migration disposition as reusable
  law.

Enforcement:
Grit/source-shape gate over `**/artifacts/contract/*.contract.ts`, plus
artifact-contract tests for validation and assertion behavior.
