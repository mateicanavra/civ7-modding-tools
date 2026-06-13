## Why

The repo has a `.prettierrc` but zero formatting enforcement anywhere (CI or
local) — formatting consistency is promised by convention only
(discrepancy-log DL-12). The harness assigns the hygiene layer to Biome
(format, ordinary lint hygiene, import organization). Matei D3: this gets done
now, not deferred; trade-offs recorded. Biome 2.4.x verified working under Bun
(`bunx --bun @biomejs/biome`).

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (hard core #2; trade-offs table; D3)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §5.3
  (Biome ownership), §12.1 (ESLint must not duplicate hygiene)
- `https://biomejs.dev/guides/getting-started/` (Bun commands)

## What Changes

- Add `@biomejs/biome` as exact-pinned devDependency; root `biome.json`
  (formatter + linter + assist enabled; excludes: `node_modules`, `dist`,
  `mod`, `.nx`, generated zones, `.civ7/outputs`, `docs/_archive`).
- Translate `.prettierrc` settings (semi, double quotes, trailing comma es5,
  printWidth 100) into Biome formatter config so the reformat diff is
  minimal; then remove `.prettierrc` and any prettier devDependencies.
- One dedicated repo-wide reformat commit
  (`bunx --bun @biomejs/biome format --write .`), recorded in a new
  `.git-blame-ignore-revs`.
- Biome lint: start with `recommended` OFF except rules that are green or
  trivially fixable; every enabled rule registers in the harness rule pack
  with a ratchet baseline (red rules land baselined, burned down later).
- Harness integration: `biome:format`, `biome:check`, `biome:ci` inferred
  targets (never plain `lint`); `habitat fix` runs Biome format + safe
  assists; `habitat check`/CI run `biome:ci`.

## What Does Not Change

- No code semantics; the reformat commit is format-only (verified by
  build/test parity).
- `eslint.config.js` untouched (retired later); ESLint gains no hygiene role.
- No grit/file-layer rules.

## Requires

- `habitat-nx-adoption`, `habitat-harness-scaffold`

## Enables Parallel Work

- Runs parallel with `habitat-boundary-tags` (disjoint writes).
- Required by `habitat-grit-catalog` (grit:apply must Biome-format rewrites)
  and `habitat-git-hooks` (staged formatting).

## Affected Owners

- New `biome.json`, `.git-blame-ignore-revs`; removed `.prettierrc`
- Repo-wide format-only diff (the reformat commit)
- `tools/habitat-harness` rule pack + plugin targets; root scripts; CI

## Forbidden Owners

- No Biome rule that overlaps a boundary/syntax-layer concern (import
  boundaries, domain surfaces) — those belong to Nx/Grit.
- No formatting of generated zones, official resources, or archives.
- No prettier left anywhere (config, deps, editor docs).

## Stop Conditions

- Biome cannot express a `.prettierrc` setting and the resulting diff is not
  acceptable as a one-time cost — stop and record the delta before
  reformatting.
- The reformat commit changes any build output byte (should be impossible;
  verify).

## Consumer Impact

One large format-only commit (blame-shielded). Thereafter formatting is
automatic via `habitat fix`/hooks and enforced via `biome:ci`. Editor guidance
documented in harness README.

## Verification Gates

- `bun run openspec -- validate habitat-biome-hygiene --strict`
- `bunx --bun @biomejs/biome ci .` green post-reformat.
- `bun run build && bun run test` green pre/post reformat with identical
  `mod/**` build outputs (byte parity).
- `.git-blame-ignore-revs` contains the reformat commit; `git blame` probe on
  a touched file attributes pre-reformat authorship.
- `bun run habitat check` includes biome rules with correct baseline counts;
  `habitat fix --dry-run` reports format diffs without writing.
- `git grep -i prettier` → no functional references remain.
