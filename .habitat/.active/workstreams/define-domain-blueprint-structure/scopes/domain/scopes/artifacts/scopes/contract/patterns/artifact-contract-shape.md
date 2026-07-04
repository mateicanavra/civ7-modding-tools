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
- broad `artifacts.ts` registries during their prework/migration period.

Required behavior:
- the file defines exactly one pipeline truth product artifact;
- the artifact value is defined by a file-local `Schema`;
- the artifact contract is exported as `artifact = defineArtifact(...)`;
- publish-time validation is exported as `validate(...)`;
- contextual operation-boundary assertion is exported as `assert(...)` only
  when execution proves publish-time validation cannot know the required
  context, such as compatibility with an already accepted mesh cell count or
  plate count;
- the contract owns validation rules for the artifact value; operation code
  owns call-site choice and contextual values, not reusable artifact-shape
  predicates.

Stable export surface:

```ts
export const Schema = ...;
export type Artifact = Static<typeof Schema>;
export const artifact = defineArtifact(...);
export function validate(value: unknown): readonly ValidationIssue[];
// Optional, only when contextual operation-boundary assertions are justified.
export function assert(value: unknown, context: AssertionContext): Artifact;
```

The type export may be semantically named when that materially improves
call-site readability or generated declaration output. Validation and assertion
exports must not use semantically unique names such as
`validateFoundationPlateMotionArtifact` or
`assertFoundationPlateMotionArtifact`. Callers that need semantic clarity should
namespace-import the contract module.

Validator shape:
- `validate` returns a readonly issue list and does not mutate, normalize, fill,
  repair, or coerce the artifact payload;
- an empty issue list means publishable;
- `assert` may call `validate` and throw with contextual operation scope, then
  return the narrowed artifact value;
- contextual `assert` checks are not a substitute for publish-time validation.

Representative destination shape:

```ts
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export type ValidationIssue = Readonly<{ message: string }>;

export const Schema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    waterMask: TypedArraySchemas.u8({
      shape: null,
      description: "Water mask per tile (1 = water, 0 = land).",
    }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "water",
  id: "artifact:morphology.water",
  schema: Schema,
});

export function validate(value: unknown): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!value || typeof value !== "object") {
    return [{ message: "Missing water artifact payload." }];
  }

  const candidate = value as Partial<Artifact>;
  const width = candidate.width;
  const height = candidate.height;
  const hasValidDimensions =
    typeof width === "number" &&
    typeof height === "number" &&
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0;
  const expectedLength = hasValidDimensions ? width * height : 0;

  if (typeof width !== "number" || !Number.isInteger(width) || width <= 0) {
    issues.push({ message: "Invalid water.width." });
  }
  if (typeof height !== "number" || !Number.isInteger(height) || height <= 0) {
    issues.push({ message: "Invalid water.height." });
  }
  if (!(candidate.waterMask instanceof Uint8Array)) {
    issues.push({ message: "Invalid water.waterMask." });
  } else if (candidate.waterMask.length !== expectedLength) {
    issues.push({ message: "Invalid water.waterMask length." });
  }

  return issues;
}

export function assert(value: unknown, context: { scope: string }): Artifact {
  const issues = validate(value);
  if (issues.length > 0) {
    throw new Error(
      `[ArtifactContract:${context.scope}] ${issues.map((issue) => issue.message).join("; ")}`
    );
  }
  return value as Artifact;
}
```

Violation messages:
- artifact contract files with zero or multiple `defineArtifact(...)` values;
- semantic function exports for validation/assertion instead of stable
  `validate` / `assert`;
- validators that normalize, repair, or silently coerce payloads;
- operation implementation, strategy logic, or registries in artifact contract
  files;
- files under `artifacts/contract/` that are not artifact contract source.

Enforcement:
Grit/source-shape gate over `**/artifacts/contract/*.contract.ts`, plus targeted
tests for any contract whose validation semantics move from legacy guard code.
