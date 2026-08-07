# Generated Civ7 API Authority

## Scope

- Applies to `packages/civ7-api`.

## Role

- This package is the generated, static projection of admitted official Civ7 evidence.
- `apps/civ7-api-materializer` is the only writer of `src/`.
- Public realm entries remain separate. Importing one realm must not activate another.
- Diagnostics, unresolved edges, and source-authored `any` are evidence. Do not hide or
  rewrite them with handwritten shims.

## Boundary

- The project is entirely admissible in Civ7's embedded V8 and carries `runtime:civ7-v8`.
- It owns no host acquisition, filesystem access, Tuner session, app lifecycle, controller policy, or product behavior.
- Update generated source through the materializer; never edit it by hand.
