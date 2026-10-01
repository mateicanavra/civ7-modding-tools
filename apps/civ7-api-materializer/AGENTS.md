# Civ7 API Materializer

This app is the one-shot host realization for official Civ7 knowledge. It
selects an identified installed game, stages an exact admitted `Base`/`DLC`
snapshot, records deterministic provenance, and replaces the pinned resource
snapshot only after complete validation.

- Keep filesystem, process, installation discovery, and replacement effects in
  this app.
- Keep the extraction profile explicit and fail closed. Source maps are
  evidence and must not be discarded.
- Do not author Civ7 API declarations here by hand. Projection code may only
  emit facts derived from the admitted snapshot or a separately identified
  runtime capture.
- `packages/civ7-api` is the generated authority; this app is never imported by
  in-engine code.
