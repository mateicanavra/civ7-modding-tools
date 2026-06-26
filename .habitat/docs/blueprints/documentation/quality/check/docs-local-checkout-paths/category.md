# docs-local-checkout-paths

Blueprint: `documentation`

Primary category: `quality`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/documentation/quality/check/docs-local-checkout-paths`

Files:
- `docs-local-checkout-paths.baseline.json`
- `docs-local-checkout-paths.check.mjs`
- `docs-local-checkout-paths.pattern.md`
- `docs-local-checkout-paths.rule.json`

Evidence: The check/pattern removes host-local absolute checkout prefixes from durable docs references.

Notes:
- Contains both diagnostic and rewrite semantics; future operation admission may split them.
