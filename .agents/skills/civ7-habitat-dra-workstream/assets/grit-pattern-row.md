# Grit Pattern Row Template

```markdown
| Field | Value |
| --- | --- |
| Row ID | `<stable pattern/codemod/disposition id>` |
| Row Type | `<check, apply codemod, generator, migration, test, manual disposition>` |
| Product Link | `<which Habitat outcome this protects>` |
| Normative Source | `<architecture/spec/doc/source path>` |
| Proving Source | `<current-tree examples and fixtures>` |
| Predicate | `<exact match semantics>` |
| Exclusions | `<false-positive and owner-boundary exclusions>` |
| Scan Roots | `<roots and exclusions>` |
| Positive Cases | `<paths or fixtures>` |
| Negative Cases | `<paths or fixtures>` |
| Injected Violation | `<path and expected failure>` |
| Baseline Behavior | `<write, shrink, unchanged, or not applicable with rationale>` |
| Apply Safety | `<dry run, applied diff, rollback, cleanup, idempotence>` |
| Metadata/Registration | `<generated records and registration files>` |
| Proof Commands | `<commands with proof-class labels>` |
| Downstream Records | `<docs, ledgers, generated records>` |
| Closure State | `<open, blocked, under review, closed with commit>` |
```
