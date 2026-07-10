# Planning Prerequisite Branch Closure Review 01

Status: closed with changes requested

Review window closed: 2026-07-09T20:59:01-04:00

## Assignments

| Branch | Agent/session | State | Review lens |
| --- | --- | --- | --- |
| `codex/fix-local-environment-setup` | Gauss (`019f4979-1c7a-7673-a81e-67830c297af6`) | closed | TypeScript/code quality, Habitat bootstrap, generated output, clean-worktree setup |
| `codex/civ7-modding-foundry-architecture-draft` | Ptolemy (`019f4979-1dc7-7c50-abd0-16997af5bdc5`) | closed | RAWR/Foundry ontology, Habitat authority routing, blueprint-kind boundaries |
| `studio-ui-token-oklch` | Nash (`019f4979-1ed2-73c3-a72d-0b174d650dc1`) | closed | token semantics, visual/static gates, external classifier falsifier, evidence integrity |

All reviewers were read-only and left the three branch worktrees clean.

## Environment Findings

| Finding | Severity | Disposition | Repair demand |
| --- | --- | --- | --- |
| `ENV-CLOSE-01` commit record contradicts executable setup | P1 | accepted | amend the commit body to describe resource/Effect initialization, frozen install, build, checks, Habitat source-first graph, and generated bridge output honestly |
| `ENV-CLOSE-02` empty-gitlink repair lacks regression coverage | P2 | accepted | add temp-Git fixtures for empty configured submodule success and nonempty non-submodule refusal; run `civ7-cli:test` |

Clean-clone resource/Effect init, frozen install, build/check, source-first Nx
graph, bridge regeneration, focused Habitat/docs/bridge gates, and two-worktree
Studio isolation passed. Inherited Habitat, Biome, and Studio reds matched main
at branch-owned inputs and remain closeout corpus rows, not environment defects.
The declared Desktop Local Environments editor inspection remains unrun.

## Foundry Findings

| Finding | Severity | Disposition | Repair demand |
| --- | --- | --- | --- |
| `FOUNDRY-CLOSE-01` RAWR ownership law conflated | P1 | accepted | separate SDK derivation, runtime realization, adapter lowering, and harness mounting; distinguish four semantic/foundry roots from the runtime-authoring `resources/` root |
| `FOUNDRY-CLOSE-02` blueprint-kind boundaries absent | P1 | accepted | add explicit service/API/worker/host kind, location, boundary, dependency, constructibility, and non-kind/admission conditions |
| `FOUNDRY-CLOSE-03` competing method authority | P1 | accepted | make the semantic-ratchet addendum a specialization/generalization of the active descent frame rather than a parallel normative method |
| `FOUNDRY-CLOSE-04` authority routers conflict | P1 | accepted | align `.habitat/README.md`, `.habitat/AUTHORITY.md`, and active `FRAME.md` source order/exception routing |
| `FOUNDRY-CLOSE-05` probabilistic target choices unowned | P2 | accepted | replace hedges with named design gaps, owners, lock points, and integration hooks |

Patch equivalence between the main-root sink and opening-chain duplicate remains
confirmed. OpenSpec and diff checks passed, but classify-reported/docs gates were
not runnable in the uninstalled Foundry worktree and remain required after
repair/dependency attachment.

## Token Findings

| Finding | Severity | Disposition | Repair demand |
| --- | --- | --- | --- |
| `TOKEN-CLOSE-01` OKLCH upload/classifier gate unrun | P1 | accepted | execute the approved atomic upload and require the external adherence classifier to report canonical color token kinds |
| `TOKEN-CLOSE-02` canonical deferral overclaims Step B | P1 | accepted | qualify the confirmed result as the earlier HSL step until distinct OKLCH output exists |
| `TOKEN-CLOSE-03` light canary fails open | P2 | accepted | aggregate drift and exit nonzero after cleanup when any row differs |
| `TOKEN-CLOSE-04` task/evidence drift | P2 | accepted | rerun the negative mutation gate in an isolated worktree and reconcile task 4.4 |
| `TOKEN-CLOSE-05` two comments overstate enforcement/evidence | P3 | accepted | describe lexical shape honestly and replace unavailable scratchpad provenance with durable checker/evidence |

All local UI tests/checks/build/design-sync checks, visual contact-sheet review,
CSS Color 4/browser comparisons, strict OpenSpec validation, and diff checks
passed. PR `#2052` remains draft; no upload or PR mutation occurred.

## Closure Rule

Each branch receives a disjoint implementation worker, then fresh reviewers.
No branch may commit, submit, publish, upload external state, or merge until its
repair and relevant gates are complete. Graphite commits/submissions/merges and
the token external upload are separate serialized mutation cohorts with their
own lease/census records.
