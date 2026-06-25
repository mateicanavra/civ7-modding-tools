# docs-local-checkout-paths

Primary category: `quality`

Secondary categories: none

Lifecycle: `steady`

Admission: `admitted`

Niche: `docs/content`

Artifact kind: `check`

Files:
- `docs-local-checkout-paths.baseline.json`
- `docs-local-checkout-paths.check.mjs`
- `docs-local-checkout-paths.pattern.md`
- `docs-local-checkout-paths.rule.json`

Evidence: The check/pattern removes host-local absolute checkout prefixes from durable docs references.

Notes:
- Contains both diagnostic and rewrite semantics; future operation admission may split them.
