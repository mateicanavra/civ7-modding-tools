# Ensure Docs Checkout Paths Are Portable

Subject ID: `ensure_docs_checkout_paths_are_portable`

Title: Ensure Docs Checkout Paths Are Portable

Blueprint: `_self`

Primary category: `quality`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/_self/quality/check/ensure_docs_checkout_paths_are_portable`

Files:
- `ensure_docs_checkout_paths_are_portable.baseline.json`
- `ensure_docs_checkout_paths_are_portable.pattern.md`
- `ensure_docs_checkout_paths_are_portable.rule.json`

Evidence: The Grit apply-backed diagnostic removes host-local absolute checkout prefixes from durable docs references while preserving advisory severity.

Notes:
- Split canary: command-script advisory detection was deleted after the Grit dry-run diagnostic path preserved the same advisory ownership.
