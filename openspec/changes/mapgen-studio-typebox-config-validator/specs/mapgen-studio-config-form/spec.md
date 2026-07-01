## ADDED Requirements

### Requirement: Config Form Validation Is CSP-Safe

The MapGen Studio config-authoring form SHALL validate form data without
generating executable code from strings at runtime, so the compiled component
bundle runs under a strict Content-Security-Policy (`script-src` without
`'unsafe-eval'`). The form MUST NOT depend on a JSON Schema validator that
compiles schemas via `new Function`/`eval` (e.g. ajv), and MUST NOT use
TypeBox's `TypeCompiler`.

#### Scenario: Bundle validates under a no-unsafe-eval CSP
- **WHEN** the Studio component bundle is loaded in an environment that
  disallows code generation from strings
- **THEN** the config form validates and renders without throwing an `EvalError`
- **AND** the compiled bundle contains no `new Function` JSON Schema compiler
  and no ajv runtime

### Requirement: Config Form Validation Preserves ajv Behavior

The TypeBox-backed rjsf validator SHALL match the previous ajv validator's
validity decisions and error attribution for every JSON Schema feature that
real recipe config schemas use. Parity MUST be pinned by a committed
differential test that runs both validators over the same inputs.

#### Scenario: Validity parity across used schema features
- **WHEN** identical form data and schema are validated by both the TypeBox
  validator and the ajv validator
- **THEN** both agree on whether the data is valid
- **AND** this holds across the used feature set: `type`, `enum`, `const`,
  numeric bounds (`minimum`/`maximum`), string `minLength`/`maxLength`/`pattern`,
  array `minItems`/`maxItems`/`uniqueItems`, homogeneous `items` and tuple
  `items: [...]` with `additionalItems: false`, nested objects, `required` and
  nested `required`, and multi-variant `anyOf`/`oneOf` unions

#### Scenario: Required-error attribution matches rjsf expectations
- **WHEN** a required property is missing from an object
- **THEN** the resulting error is attributed to the missing child field's path
  (as ajv/rjsf attribute it), not to the parent object
- **AND** the returned `errorSchema` places the `__errors` entry under the
  missing field so the form renders the message at the correct control

#### Scenario: Tuple-overflow error attaches to the array field
- **WHEN** a tuple array (`items: [...]` with `additionalItems: false`) receives
  more elements than the tuple length
- **THEN** the error is attributed to the array field (matching ajv's
  `additionalItems`), not to a phantom index sub-field, with a meaningful
  "must NOT have more than N items" message rather than "schema is false"
