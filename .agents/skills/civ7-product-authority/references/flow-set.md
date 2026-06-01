# Flow Set

Use these flow templates to classify product/domain changes.

## Flow 1: Official Resources To Typed Model

```text
official game resources -> extraction/indexing -> constants/types/docs/tests
```

- Owner: resource workflow, `civ7-types`, SDK constants as applicable.
- Proof: resource files, generated types/constants, typecheck/tests.
- Forbidden claim: generated constants alone prove in-game behavior.

## Flow 2: SDK Mod Authoring To XML Output

```text
SDK builder/config -> nodes/files -> XML/modinfo output -> optional game validation
```

- Owner: SDK.
- Proof: unit tests, generated XML snapshots, playground examples, optional game checks.
- Forbidden claim: XML shape is correct for gameplay without schema/resource or in-game validation.

## Flow 3: CLI Command To Plugin Workflow

```text
CLI args/config -> plugin workflow -> filesystem/output/logging
```

- Owner: CLI for user command behavior; plugin package for reusable mechanics.
- Proof: CLI tests, plugin tests, sample outputs.
- Forbidden claim: command behavior owns plugin API semantics.

## Flow 4: MapGen Recipe To Truth Artifacts

```text
recipe config -> compiled plan -> stages/steps/domains -> artifacts/fields/diagnostics
```

- Owner: MapGen core and source recipe package.
- Proof: compiler tests, step/domain tests, trace/dump inspection.
- Forbidden claim: engine materialization is deterministic truth unless the pipeline owns and verifies it.

## Flow 5: Truth Artifacts To Civ7 Projection

```text
MapGen artifacts -> map-* or game-facing steps -> adapter/mod runtime -> engine state/mod output
```

- Owner: projection step, adapter, or mod runtime depending on concern.
- Proof: adapter tests, mod build, in-game validation, parity diagnostics.
- Forbidden claim: projection telemetry is source truth.

## Flow 6: Docs To User Promise

```text
canonical doc/tutorial -> source example/test -> generated or runtime behavior
```

- Owner: docs plus corresponding code owner.
- Proof: doc lint, linked source/tests, examples that still run.
- Forbidden claim: project scratch or archived notes are current user promises.

## Flow 7: Workstream Review To Durable Authority

```text
review finding -> disposition -> doc/ADR/deferral/test/code change -> closure claim
```

- Owner: workstream owner and affected docs/code owner.
- Proof: changed durable artifact plus verification.
- Forbidden claim: chat acknowledgement resolves a finding.

