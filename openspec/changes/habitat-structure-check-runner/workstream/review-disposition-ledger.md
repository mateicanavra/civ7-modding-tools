# Review Disposition Ledger

| Finding | Priority | Disposition | Evidence |
| --- | --- | --- | --- |
| Do not create a command-check alias for topology. | P1 | Accepted and implemented. | `executeSelectedRulesEffect()` calls native `runStructureRulesEffect()` before command execution. |
| Keep resource interfaces under `resources/` and implementations in providers. | P1 | Accepted and implemented. | `HabitatFileSystemReadPort` lives in `resources/platform`; the provider remains the platform provider. |
| Do not hide source-order semantics inside structure-check. | P1 | Accepted and implemented. | `verify_standard_recipe_declared_stage_keys` owns literal `orderStandardStages({ ... })` key order. |
| Do not add recursive descendant fields. | P2 | Accepted. | TOML v1 uses additional scoped root globs for deeper structure. |
| Child kind should not be inferred from `required` globs. | P2 | Accepted. | File presence uses `kind = "file"` scopes; required child globs match names only. |
