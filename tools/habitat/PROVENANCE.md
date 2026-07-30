# Habitat package provenance

This file records the focused authorship audit for the distributable
`@habitat/cli` package. It does not change the license of the surrounding
repository or any third-party dependency.

## Finding

The packaged Habitat implementation is independently authored by Matei
Canavra. Its package-specific license is therefore the MIT license in
`LICENSE`.

## Git evidence

The audit was run against Civ7 commit
`b1c54a3bce1f1b334660525136888576b0fe8f5d`.

- `2fe15f66b4dedf8c50873eac57df7a093af0ae63` first added the Habitat tool as
  `tools/habitat-harness` on 2026-06-14. Its parent contains no Habitat tool
  source. The commit author is `Matei <tools@matei.work>`.
- `3d3b111946efbc784a575fcaa7b7b91f475454e5` renamed the package to
  `tools/habitat` on 2026-07-03. The rename preserves the same author history.
- `git shortlog -sne b1c54a3bce -- tools/habitat tools/habitat-harness`
  reports 90 commits, all attributed to `Matei <tools@matei.work>`.
- The repository root license was added earlier by a different author in
  `6d862dc7994f25a49e820917f79868d59fb8ef37`. It remains the license for the
  surrounding repository; it is not the authorship source for Habitat.

This audit covers files shipped by the `@habitat/cli` package. Installed
dependencies remain governed by their own licenses.
