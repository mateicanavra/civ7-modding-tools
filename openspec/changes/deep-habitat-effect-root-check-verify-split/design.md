# Design: Root Check Verify Split

## Frame

Habitat is a developer toolkit for turning repository structure into enforceable
rules, patterns, and graph-owned workflows. Its root commands should communicate
their operational cost clearly. A command named `check` should not secretly run
every package build/test/verify lane when Habitat already owns the structural
check surface and explicit graph commands can carry the heavier work.

## Ownership

- Root `package.json` owns human-facing graph command aliases.
- `tools/habitat-harness/README.md` and `tools/habitat-harness/docs/*.md` own
  Habitat command usage docs.
- CI owns authoritative composition.

## Implementation

Change root `check` from the repo-wide graph aggregate:

```text
build,check,lint,test,verify,validate:boundary-taxonomy,validate:grit-patterns
```

to:

```text
bun run habitat:check
```

Add `check:graph` for affected build/check/lint/test structural validation.
Keep the root `verify` script unchanged. Update root `ci` to run the full
repo-wide graph aggregate explicitly, preserving CI authority while making local
command cost explicit.

Update Habitat docs so agents and humans use `check` for ordinary structural
health, `check:graph` when affected package build/test validation is needed,
and `verify` when they need heavier package verification.

## Risks

- Users accustomed to `bun run check` as the full graph aggregate must learn the
  explicit split. The docs and CI script make that contract visible.
- CI will still pay the full cost because it runs the full graph aggregate; this
  slice improves command meaning and local cost, not CI wall time.
