# Domain Model Schema Primitive File

Status: active working reference

Subject:
`<domain>/model/schemas/<primitive>.schema.ts`

Role:
reusable domain schema primitive.

Allowed contents:
- one small domain-authored TypeBox schema fragment or closely bound primitive
  schema packet;
- derived type exports for that primitive;
- imports from `@swooper/mapgen-core/authoring/contracts` and other
  domain-model schema primitives when needed.

Violation messages:
- full operation input/output/strategy envelopes;
- stage public schema, `knobsSchema`, or `compile` composition;
- operation, recipe, stage, adapter, or runtime implementation imports;
- generic config bags or facade exports.

Import/export boundary:
- may be imported by operation contracts and stage authoring surfaces;
- may be re-exported through a local `model/schemas/index.ts` barrel.

Enforcement:
source-shape gate in
`.habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/`.
