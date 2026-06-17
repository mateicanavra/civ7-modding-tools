# Relative Domain Import Design

## Scope

`grit-relative-domain-imports` owns recipe/map source under
`mods/*/src/{recipes,maps}/**/*.{ts,tsx}` that imports or re-exports local
domain source through relative `../domain` paths.

The predicate uses `import_statement(source=$source)` plus named/star export
snippets. It intentionally uses exact filename-depth arms rather than a broad
`(?:../)+domain/` source regex:

- stage-root recipe files match `../../../../domain/...`;
- direct step files match `../../../../../domain/...`;
- nested step files match `../../../../../../domain/...`;
- map-root files match `../domain/...`.

That shape keeps same-stage `../domain`, `../../domain`, and
`../../../domain` lookalikes clean instead of treating any literal `domain`
segment as the repository `src/domain` directory.

## Source Remediation

The six current Swooper recipe reaches are remediated to public package
surfaces:

- hydrology references now import from `@mapgen/domain/hydrology`;
- resource references now import from `@mapgen/domain/resources`.

The used hydrology/resources symbols already exist on those public surfaces, so
the remediation does not require source-owner API expansion.

## Proof Classes

- Native fixture proof covers value, type-only, namespace, side-effect, named
  export, and export-star classes plus same-scan-root depth controls.
- Source proof covers the current six rewritten files through focused import
  inventory and package checks.
- Habitat wrapper proof covers per-rule selection, current-tree zero
  diagnostics, aggregate `grit-check` health, and baseline integrity.
- Injected proof covers a stage-root relative-domain import and a same-root
  short-depth control.

## Non-Claims

No raw direct Grit acquisition, apply/codemod safety, generated-output edit,
generated-output freshness, broader public-surface closure, neighboring-row
closure, aggregate injected-corpus closure while DDIT remains blocked, or
product/runtime proof is claimed.
