# Domain Atom Schema File

Status: active working reference

Subject:
`<model>/atoms/<concept>.schema.ts`

Role:
one cohesive, composable domain schema primitive.

Allowed contents:

- one concept-sized TypeBox schema or closely bound primitive packet;
- derived static types for those primitives;
- composition from atoms owned at the same level or a semantic ancestor.

The file does not own a complete operation envelope, complete artifact
container, strategy configuration, artifact validator, policy table, or
runtime behavior.
