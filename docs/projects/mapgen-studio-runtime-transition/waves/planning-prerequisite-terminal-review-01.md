# Planning Prerequisite Terminal Closure

Status: environment and Foundry merged; token locally closed and externally open

Parent method:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

## Purpose

This wave closed the three branches admitted ahead of the Studio source-stack
recovery barrier. It repaired each existing branch in place. It did not rebuild
their accepted work, replay them into a Studio sink, restack an opening Studio
source ref, or admit the parked readiness stack.

The branch decisions were:

| Branch | Decision | Terminal identity |
| --- | --- | --- |
| `codex/fix-local-environment-setup` | hard operational prerequisite; merge after branch-local closure | PR `#2056`, merged main identity `ada321597b98` |
| `codex/civ7-modding-foundry-architecture-draft` | sole main-root Foundry authority sink; repair canonical semantics before merge | PR `#2057`, merged main identity `2eea5f7dedec` |
| `studio-ui-token-oklch` | independent trunk stabilization; merge only after its own live DesignSync gate | local commit `e455f7a427`, restacked as `4204e82b0b01`; PR `#2052` still open |

`studio_runner_parked` remains untouched. The readiness PR stack `#2036`-
`#2043` remains a post-Studio consumer and was not made ancestral to the token
or Studio closeout branches.

## Environment Closure

The retained branch implementation was narrowed around one missing behavior:
resource initialization in a real linked worktree whose configured gitlink is
empty. The final regression fixture:

- creates a real detached `git worktree` checkout;
- starts the resource gitlink empty;
- supplies a hostile global `post-checkout` hook;
- requires a global URL rewrite for the submodule transport;
- establishes that the checked-in helper suppresses the hook without broadly
  discarding required Git configuration;
- preserves and rejects a nonempty non-submodule directory.

The final local review reported no P1/P2/P3 findings. Focused tests passed 3/3;
the full CLI suite passed 237/237; CLI check, package lint, shell syntax, and
diff whitespace checks passed. The final purpose comment claims only exercised
behavior.

The branch was amended as `36eb7be574`, submitted as PR `#2056`, and merged as
`ada321597b98de0e3c2f5a15acf55de5dcf34ac7`.

## Foundry Closure

The initial branch was not mergeable as authority. It inverted the canonical
root distinction and collapsed compiler, bootgraph, Effect-kernel, and process-
runtime ownership. The repaired 18-file routing patch now establishes:

- five repository roots: `packages`, `resources`, `services`, `plugins`,
  `apps`;
- four semantic/foundry roots: `packages`, `services`, `plugins`, `apps`;
- `resources` as the separate runtime-realization contract/selector root, not a
  business-capability owner;
- providers as resource-contract implementations;
- compiler as pure planning/validation, bootgraph as ordering/finalization,
  Effect kernel as scoped acquisition/release, and process runtime as live
  binding plus adapter/harness coordination;
- `FRAME.md` as the sole ordered live authority router;
- `api` as a blueprint kind rather than a repository root;
- `worker` and `host` as candidates rather than prematurely admitted kinds;
- current Studio topology as evidence, never permanent target authority.

The bounded final reviewer answered every canonical question affirmatively and
reported no P1/P2/P3 findings. `bun run lint` and `git diff --check` passed. One
earlier broad reviewer failed to converge and was closed without contributing a
verdict; the fresh bounded reviewer replaced that lane rather than reusing it.

The branch was amended as `ee6681f465`, targeted-restacked as `0b09b350f85c`
with stable patch-id `89b3b4eb27570af36cf03cf66ccea1a8e14cfb4a`, submitted as
PR `#2057`, and merged as
`2eea5f7dedec367072675dece3a9a4785f452c2e`.

## Token Local Closure

The accepted token conversion stayed intact. Review exposed false-green canary
seams rather than a need to replace the token work. The final local contract is:

- exact, case-preserved equality among requested `?story=`, emitted export, and
  expected export;
- exactly one populated root for each surface;
- Playwright visibility and positive rendered geometry;
- real-browser failures for missing export, case mismatch, absent, empty,
  hidden, zero-size, and duplicate roots;
- pure tests retained and described only as pure tests;
- built-artifact OKLCH validation covering valid multidigit chroma and malformed,
  empty, HSL, and out-of-range values;
- local DesignSync receipt of `components: []`, `bundle: false`,
  `styling: true`, `aux: true`, `deletes: []`.

The final local reviewer reported no P1/P2/P3 findings. Focused pure tests passed
33/33, the Playwright regression passed, the package suite passed 201/201, and
package check, DesignSync check, the seven-row light canary, strict OpenSpec
validation, changed-path Biome, and diff whitespace checks passed.

The branch was amended as `e455f7a427`. A first no-restack sync was mistakenly
run from the token checkout, which synchronized the unsubmitted branch from its
remote. `gt undo` restored the commit immediately. The same sync was then run
from a sibling worktree so Graphite skipped the checked-out token branch and
advanced `main`. The targeted restack produced `4204e82b0b01` on
`2eea5f7dedec` with unchanged patch-id
`6b760fe972253620176d3a8f3d1f480a414a1eec`. No readiness head became
ancestral; `studio_runner_parked` still contributes zero commits beyond main.

## External Token Gate

Tasks 5.1-5.4 remain open. The supported surface is Claude Code's native
`/design-sync` skill, not an MCP server or a repo-authored uploader. Closure
requires, in order:

1. authenticate Claude Code and `/design-login` for the pinned project;
2. fetch live `_ds_sync.json` into the local anchor cache;
3. rerun the anchored local DesignSync check;
4. finalize the exact write plan with no deletes;
5. write ordinary paths first and `_ds_sync.json` alone and last;
6. run the Claude Design app self-check;
7. fetch `_adherence.oxlintrc.json` and require authored colors to classify as
   `color`;
8. update the owning `ds-sync-token-noise-disposition` memory record;
9. archive/promote `studio-ui-token-oklch` through OpenSpec;
10. amend, narrow-submit, and merge PR `#2052`.

Claude Code OAuth session `72454` completed successfully on 2026-07-10. Native
`/design-login` and every subsequent live action remain open. No upload, delete,
self-check, classifier claim, memory update, archive, PR
publication, or merge has been represented as complete.

## Review Fleet

Fresh implementation and review lanes were used for each semantic repair. The
terminal approving reviewers were:

| Scope | Reviewer | Outcome |
| --- | --- | --- |
| environment behavior/test structure | Galileo (`019f49f1-abd4-73f2-a641-1ac7529bf368`) | approved |
| Foundry canonical authority | Beauvoir (`019f4a06-972d-71a1-a39b-cae0d7cc77f1`) | approved |
| token TypeScript/test/browser/library behavior | Dalton (`019f4a1a-ae68-7941-9c2b-7d6c192f9e7f`) | approved local closure |
| token Graphite isolation | Hegel (`019f4a10-795a-79d1-ba57-8f85b8288bff`) | main-parented targeted-restack plan accepted |
| token external route | Gibbs (`019f49ff-a302-73b3-afe6-21b6c200710c`) | native DesignSync path and authentication gate identified |

All completed agents were closed. The previously interrupted Peirce lane was
not called, reused, or treated as review authority.
