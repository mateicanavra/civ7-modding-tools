# Official Biome Evidence Pack For Habitat Harness

Retrieval date: 2026-06-14. Evidence lane: official Biome documentation only, English v2.x pages as served at retrieval. This is an audit-grade documentation pack for Habitat design/spec work, not final decision authority.

## Frame Carried Forward

- Selection: Biome CLI/configuration/linter/plugin/language/CI documentation that constrains Habitat's formatter, linter, safe-fix, report, VCS, and generated-structure behavior.
- Foreground: write boundaries, dry-run/report affordances, file-set gates, language support limits, and fix ownership between Biome core, Biome Grit plugins, and Habitat orchestration.
- Exterior: Biome implementation source, third-party examples/blogs, local repo behavior, Habitat code implementation, baseline policy design, and Grit language docs outside Biome's own pages.
- Hard core: Habitat may orchestrate Biome, but should not invent Biome semantics. Biome owns formatting, lint diagnostics, import sorting, declared safe fixes, and configured plugin rewrites; Habitat owns classification, path scoping, owner-layer policy, baseline truthfulness, and permissioning of write-capable commands.
- Falsifier: Reframe if official Biome docs or the repo-pinned Biome version contradict these command/write semantics, if `biome ci` gains write behavior, if unsupported/experimental language support becomes stable and broad enough to alter boundaries, or if local CLI behavior differs from the cited docs.
- System posture: a reinforcing loop is `classify -> more precise Biome scope -> safer diffs -> higher agent trust -> more use of classification`; a balancing loop is `CI/read-only reports + unsafe/manual gates -> stop uncontrolled writes -> preserve repo trust`.

## Sources

- S1: Biome CLI reference, especially `check`, `lint`, `format`, `ci`, `search`, and reporter options: https://biomejs.dev/reference/cli/ (retrieved 2026-06-14).
- S2: Biome Getting Started, CLI and Continuous Integration sections: https://biomejs.dev/guides/getting-started/ (retrieved 2026-06-14).
- S3: Biome Continuous Integration recipe, `biome check` vs `biome ci`: https://biomejs.dev/recipes/continuous-integration/ (retrieved 2026-06-14).
- S4: Biome Configuration reference, especially `files.includes`, tool includes, `vcs.*`, `plugins`, and overrides: https://biomejs.dev/reference/configuration/ (retrieved 2026-06-14).
- S5: Biome VCS integration guide, changed/staged behavior: https://biomejs.dev/guides/integrate-in-vcs/ (retrieved 2026-06-14).
- S6: Biome Linter introduction, safe/unsafe fixes and rule fix configuration: https://biomejs.dev/linter/ (retrieved 2026-06-14).
- S7: Biome Linter Plugins documentation, rewrite behavior, plugin file filters, target languages, and `fix_kind`: https://biomejs.dev/linter/plugins/ (retrieved 2026-06-14).
- S8: Biome GritQL reference, supported target languages and integration status: https://biomejs.dev/reference/gritql/ (retrieved 2026-06-14).
- S9: Biome Language Support internals page: https://biomejs.dev/internals/language-support/ (retrieved 2026-06-14).
- S10: Biome Reporters reference: https://biomejs.dev/reference/reporters/ (retrieved 2026-06-14).

## Findings

- `biome check` is the combined local command: it runs formatter, linter, and import sorting on requested files. `biome format` runs only the formatter, and `biome lint` runs lint checks. `biome ci` runs formatter, linter, and import sorting in CI but is explicitly read-only. (Sources: S1, S2, S3)
- Write behavior is opt-in. `format --write` writes formatted files. `lint --write` writes safe fixes; `--unsafe` applies unsafe fixes only with `--write`/`--fix`. `ci` has no `--write`/`--fix` option and should be used in CI. (Sources: S1, S3, S6)
- Biome defines safe fixes as semantic-preserving and suitable without explicit review; unsafe fixes may alter semantics and should be manually reviewed. Rule fix safety can be configured per rule with `fix: none|safe|unsafe`, which means repo config can intentionally downgrade, upgrade, or disable a fix. (Source: S6)
- Reporter selection changes diagnostic output, not write behavior. Available reporters include default, JSON, GitHub, JUnit, GitLab, Checkstyle, RDJSON, SARIF, concise, and summary; JSON/JSON-pretty reporters are marked experimental and subject to patch-release changes. (Sources: S1, S10)
- For Grit-backed Biome plugins, rewrites are suggestions without `--write`; `--write` applies rewrites marked `fix_kind = "safe"`; `--write --unsafe` also applies unsafe plugin rewrites; omitted `fix_kind` defaults to unsafe. (Source: S7)
- Biome config's `plugins` list enables GritQL plugins, each as a path or object with path plus file filters. Plugin includes can use positive and negated globs. Plugin scope is therefore a first-class safe-write boundary when Habitat generates or installs plugins. (Sources: S4, S7)
- `files.includes` is the outer file-set gate. `formatter.includes`, `linter.includes`, and `assist.includes` are applied after `files.includes`; a file excluded by `files.includes` cannot be reintroduced by a tool-specific include. If tool-specific includes are omitted, all `files.includes` matches are processed by that tool. (Source: S4)
- Include/exclude ordering matters: Biome supports negated glob patterns and exceptions to exceptions. Tool-specific includes have a technical limitation: they cannot match folders while `files.includes` can, so matching all files inside a folder requires an explicit `/**` suffix. (Source: S4)
- VCS integration is not automatic by default: `vcs.enabled` defaults to false. When enabled with Git and `vcs.useIgnoreFile`, Biome ignores files from VCS ignore files, Git's local exclude file, and `.ignore`, including nested ignore files. If the Biome config is not at the VCS root, `vcs.root` should be set relative to the config. (Source: S4)
- `--changed` and `--staged` are file-selection mechanisms, not semantic impact analysis. The VCS guide says `--changed` processes files with diffs, whitespace-only changes still mark a file changed, and downstream files importing changed files are not automatically checked. (Source: S5)
- `--stdin-file-path` is useful for piped code, but virtual/nonexistent paths skip project file-set and ignore checks. Habitat should not use virtual stdin paths as proof that a real file is safe to write or in scope. (Source: S1)
- Language support is broad but uneven. Current docs show support for JavaScript, TypeScript, JSX, TSX, JSON, JSONC, HTML/SVG, CSS, and GraphQL across parsing/formatting/linting; Vue/Svelte/Astro are experimental; SCSS/YAML/Markdown are not fully supported; GritQL is supported for parsing/formatting but not lint/plugin support. (Source: S9)
- JavaScript support is ES2024 and official syntax only, with development for new syntax beginning at TC39 Stage 3. TypeScript support is documented at version 5.9. Embedded CSS/GraphQL inside JavaScript template literals is experimental and disabled by default. (Source: S9)
- HTML-ish support is explicitly caveated: Vue/Svelte/Astro support is experimental, language-specific syntax may not parse as desired, and lint rules may miss or falsely report cases unless configured with overrides. (Sources: S4, S9)
- GritQL in Biome supports target languages JavaScript/TypeScript, CSS, and JSON. The GritQL reference also warns integration is active work, bugs are expected, and some features are missing. (Sources: S8, S7)
- Official CI guidance prefers `biome ci` for CI. Compared with `check`, `ci` lacks write/fix options, integrates with runners such as GitHub annotations, allows thread control, and uses `--changed` rather than `--staged` when VCS integration is enabled because remote CI has no staged concept. (Source: S3)
- Conflict/marker: no direct conflict found between CLI, Getting Started, Linter, and CI docs on write behavior. Minor doc-copy uncertainty exists in some configuration wording around `assist.includes` being described as files to "lint"; the surrounding examples and option name imply assist analysis, not lint ownership. (Source: S4)

## Implications For Habitat Changesets

- Design command tiers explicitly: report-only (`biome check`, `biome ci`, reporters), safe-write (`biome check --write`, `biome lint --write`, `biome format --write`), and unsafe/manual (`--write --unsafe` or untrusted plugin rewrites). Never let a generic "fix" path choose among these implicitly.
- Treat `biome ci` as the authoritative CI command and as read-only. Any Habitat CI changeset that writes files is outside Biome's CI recommendation and should be reframed.
- Make `files.includes` the generated outer safe-write envelope. Tool-specific includes, overrides, and plugin includes should only constrain or specialize that envelope, not substitute for classification.
- When Habitat generates Grit plugins, require explicit `fix_kind` and default Habitat review posture to unsafe if `fix_kind` is absent, mirroring Biome's default.
- Keep Biome-owned fixes distinct from Habitat/Grit-owned transformations in records. "Biome safe fix" should mean a Biome core rule/action or plugin rewrite that Biome will apply under `--write` without `--unsafe`; "Habitat safe transform" needs its own proof and should not borrow Biome's guarantee.
- Use reporters for audit artifacts, but avoid depending on experimental JSON/JSON-pretty output as a stable machine contract without pinning and local verification.
- Do not rely on `--changed` as a full correctness gate. It is useful for scoped friction reduction, but full checks remain necessary where downstream imports or cross-file effects matter.
- For parser/language routing, Habitat should classify unsupported or experimental language areas into conservative report-only or owner-review lanes, especially Vue/Svelte/Astro, SCSS, YAML, Markdown, and embedded-template features.
- Records should state the Biome version being exercised. This pack reflects official v2.x docs as retrieved, not proof of this repo's installed CLI behavior.

## Non-Applicable Areas

- Biome docs do not define Habitat classification, owner layers, Nx boundaries, baseline shrink-only policy, or Graphite workflow.
- Biome docs do not provide a general semantic equivalence proof for unsafe fixes, Grit rewrites, or Habitat transformations.
- Biome docs do not promise downstream/cross-file impact analysis for `--changed`.
- Biome docs do not make `biome search` a transformation engine; it is documented as experimental search.
- External Grit language docs and GitHub issues linked from Biome pages were not used as evidence, per this lane's official-Biome-docs-only policy.

## Uncertainties

- Local version uncertainty: this pack did not inspect the repo-pinned `@biomejs/biome` version or CLI output. Verify before converting these findings into exact Habitat command contracts.
- Experimental support uncertainty: HTML-ish, embedded snippet, and GritQL integration details may change. Treat those lanes as requiring local fixtures before safe-write enablement.
- Reporter stability uncertainty: JSON/JSON-pretty reporters are officially experimental; machine consumers should prefer stable reporters or version-pin and test output shape.
- Config wording uncertainty: a few configuration descriptions appear copy-pasted across linter/assist/formatter sections. Use section identity and local CLI validation before relying on ambiguous prose.

## Stop/Reframe Triggers

- Stop if a proposed Habitat changeset would run `biome ci` with writes or treat CI as an autofix lane.
- Stop if a path is outside `files.includes`, excluded by VCS ignore rules, or only appears in scope via a virtual `--stdin-file-path`.
- Stop if the change requires `--unsafe`, an omitted plugin `fix_kind`, or a Habitat/Grit transform that lacks independent review evidence.
- Stop if the affected file language is unsupported, in-progress, or experimental and the design assumes stable formatter/linter/plugin behavior.
- Reframe if Habitat needs cross-file semantic impact analysis, type checking, or baseline semantics from Biome; official docs do not assign those responsibilities to Biome.
- Reframe if local pinned Biome behavior differs from these official docs, because the executable is the authority for implementation while these docs remain the audit evidence lane.
