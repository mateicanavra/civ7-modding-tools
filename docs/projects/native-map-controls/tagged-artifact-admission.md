# Tagged Artifact Admission

## Decision

The basin integration uses explicitly different physical models rather than an object full of
optional legacy fields. Importing those artifacts exposed a generic Core limitation: typed-array
admission accepted direct typed-array alternatives, but refused object variants containing them.
This is a prerequisite correction to the integration packet's original "Core unchanged" scope.

Admit root object unions selected by a common, required, unique string-literal property. Compile
every branch eagerly against its own schema, then validate only the selected branch's exact
constructors and cardinalities. Structural admission still precedes typed-array admission and
semantic refinement. Values are not copied, defaulted, or coerced.

Do not add mixed ordinary-array/typed-array alternatives, nested object-union support, arbitrary
union matching, or product-specific logic to Core. Root union validation siblings are refused;
only descriptive JSON Schema annotations accompany `anyOf`. This prevents branch selection from
silently dropping conjunctive array constraints or stronger requiredness. Ambiguous and optional
tags remain unsupported.

For numeric operation consumers, use `number[]` and widen legacy Float32 values with `Array.from`.
That preserves every represented value and avoids rounding certified physical budgets into a
legacy representation. Legacy artifact arrays retain their existing Float32 identity.

## Review And Proof

An independent review found two sibling-constraint bypasses in the initial implementation:
typed-array constraints outside `anyOf`, and outer requiredness strengthening a branch optional
array. Both are refused by the final root annotation allowlist and have regression tests.

The shared tests cover branch-specific constructors and cardinalities, unknown/missing/inherited
tags, contextual dimensions, malformed nonselected branches, unsupported union shapes, frozen
plans, and complete artifact validation ordering. Core checks, tests, and build must pass before
the consuming integration is qualified.

Verified: `nx run-many --targets=check,test,build --projects=mapgen-core` passed, including
364 tests across 43 files, source/test/tool types, policy, and the generated package build.
The integration has not yet been qualified by this prerequisite result.
