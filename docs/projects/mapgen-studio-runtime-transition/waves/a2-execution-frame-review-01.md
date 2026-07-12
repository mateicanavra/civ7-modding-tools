# A.2 Execution Frame Review 01

Status: frame review closed-passed; baseline-manifest reviews closed after repair; closing gates pending

Reviewed surface:

- `packet-a2-domain-operation-topology.md`
- `NEXT-PACKET.md` A.2/A.3 handoff
- `verification-ledger.md` live admission state
- named Habitat, engine-refactor, MapGen skill, source, and test authorities

## Initial Review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| authority and sequencing | Bernoulli the 5th (`019f55b2-f396-73a3-93b3-2b75490b1dac`) | changes requested |
| standalone closed-loop operability | Schrodinger the 5th (`019f55b2-effd-7c92-bf8f-746410746c84`) | changes requested |
| TypeScript, structure, and testing | Leibniz the 5th (`019f55b2-f69c-71a0-bfcb-6005a933e0b8`) | changes requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-AUTH-01 | P1 | Bernoulli | readiness descent overlaps A.2 | rejected as a restack prerequisite against the live sentinel decision; repaired by making every descent row required evidence and later-integration disposition |
| A2-AUTH-02 | P1 | Bernoulli | strategy container assigned to child blueprint | accepted; all container topology moved to parent `domain-operation` |
| A2-AUTH-03 | P1 | Bernoulli | authority branch could not stay green | accepted; all new rules use admitted shrink-only baselines and per-branch integrity |
| A2-AUTH-04 | P1 | Bernoulli | Structure cannot own entrypoint/barrel source grammar | accepted; generic Grit authority owns those kind-level AST classes |
| A2-AUTH-05 | P1 | Bernoulli | stale project authority corpus incomplete | accepted; active specs, ADRs, workflow references, skills, guides, and strategy README are named |
| A2-AUTH-06 | P2 | Bernoulli | cleanup-ledger rows not explicit | accepted; Branch 1 dispositions every relevant row |
| A2-AUTH-07 | P2 | Bernoulli | private and cross-domain dependency corpus incomplete | accepted; a complete import-owner matrix precedes source edits |
| A2-AUTH-08 | P2 | Bernoulli | named examples were not complete exemplars | accepted; they are labeled partial separation patterns only |
| A2-AUTH-09 | P3 | Bernoulli | verification used placeholder rule ids | accepted; stable rule ids are named in the contract |
| A2-LOOP-01 | P0 | Schrodinger | launch state not admitted | accepted; launch remains locked until reviewed frame commit and role handoff |
| A2-LOOP-02 | P0 | Schrodinger | intended-red authority conflicts with full branch gates | accepted; baseline ratchet keeps every branch green |
| A2-LOOP-03 | P1 | Schrodinger | parent and child DRA ownership overlap | accepted; child is A.2 Product/Development DRA and parent is Supervisor/Enforcer |
| A2-LOOP-04 | P1 | Schrodinger | corpus count internally inconsistent | accepted; 89 root-shape plus six barrel-only rows equals 95 nonconforming roots |
| A2-LOOP-05 | P1 | Schrodinger | per-branch prework absent from loop | accepted; each branch re-derives row, owner, caller, test, baseline, and agent assignments before editing |
| A2-LOOP-06 | P1 | Schrodinger | Graphite, records, and Narsil handoff open | accepted; exact branch admission, seal, clean-state, and indexed-checkout handoff are in-loop |
| A2-LOOP-07 | P1 | Schrodinger | Narsil owner/path unspecified | accepted; primary checkout path and natural-reindex fallback are explicit |
| A2-LOOP-08 | P1 | Schrodinger | review lanes conflate unlike risks | accepted; standing lanes are risk-specialized per authority/domain branch |
| A2-LOOP-09 | P1 | Schrodinger | aggregate closure did not bind all claims | accepted; exact rule ids, clean state, count receipt, committed tip, and A.3 handoff are required |
| A2-LOOP-10 | P2 | Schrodinger | scope and agent termination could broaden or hang | accepted; mapped moves only, natural completion default, and accounted `no-result` recovery |
| A2-TS-01 | P1 | Leibniz | whole algorithms can remain behind thin strategies | accepted; every executable barrel is classified and whole algorithms move to the strategy |
| A2-TS-02 | P1 | Leibniz | Placement test type claim lacked a checking project | accepted; that repair is deferred to A.3 rather than claimed in A.2 |
| A2-TS-03 | P2 | Leibniz | required empty `rules/` adds ceremony | rejected against direct exact-topology authority; the deliberate empty slot removes an optional shape |
| A2-TS-04 | P2 | Leibniz | private-import rule scans only root entrypoints | accepted; replacement covers every operation file and preserves all old atomicity classes |
| A2-TS-05 | P2 | Leibniz | snow-rule inventory omitted duplicate diagnostics logic | accepted; both the import and independent computation are pre-edit corpus rows |

## Affected Re-review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| repaired authority and sequencing | Harvey the 5th (`019f55c5-5e01-74f3-856d-c4bb7aacb3e2`) | changes requested |
| repaired DRA loop | Socrates the 5th (`019f55c5-60db-72f3-b83c-ca7106d3297f`) | changes requested |
| repaired TypeScript, structure, and testing | Hilbert the 5th (`019f55c5-6342-7093-93a4-a948de47b90b`) | passed |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-RR-AUTH-01 | P1 | Harvey | sentinel decisions and residual rules not individually closed | accepted; D1-D4, A1-A5, Foundation config-bag, and mixed Foundation rows are mapped |
| A2-RR-AUTH-02 | P1 | Harvey | replacement cross-import rule omitted existing atomicity classes | accepted; old import/export/dynamic-import classes must pass parity before retirement |
| A2-RR-AUTH-03 | P2 | Harvey | accepted docs and skill corpus incomplete | accepted; every named live source receives update, preserve-link, or normal supersession treatment |
| A2-RR-AUTH-04 | P1 | Harvey | ledger claimed an uncommitted clean tip | accepted; exact dirty state remains recorded until mutation receipt |
| A2-RR-LOOP-01 | P1 | Socrates | review attempts and agents absent from registers | accepted; this Wave plus gate and cleanup rows use the existing accounting surfaces |

## Terminal Review Attempt

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| terminal authority | Linnaeus the 5th (`019f55d3-e2a1-7e31-8fc6-33aa60edff06`) | changes requested |
| terminal closed-loop | Ramanujan the 5th (`019f55d3-e55f-7303-8c55-9e00d8465da9`) | changes requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-TERM-AUTH-01 | P1 | Linnaeus | D3 dropped unsettled schema-metadata authority | accepted; preserve package-owned schema-description pressure and remove only JSDoc/stale-path clauses |
| A2-TERM-AUTH-02 | P1 | Linnaeus | barrel rule did not cover named-rule shim re-exports | accepted; add positive generic rule-dependency authority before retiring the exact sentry |
| A2-TERM-AUTH-03 | P1 | Linnaeus | mixed Foundation split lost recipe composition | accepted; rehome it to recipe-owned generic composition/execution coverage without an exact key mirror |
| A2-TERM-LOOP-01 | P1 | Ramanujan | packet and ledger overclaimed terminal readiness | accepted; execution remains locked and the active gate is the fresh terminal rerun |
| A2-TERM-LOOP-02 | P1 | Ramanujan | ledger listed three rather than six dirty paths | accepted; all six bounded paths are named exactly |
| A2-TERM-LOOP-03 | P2 | Ramanujan | gate finding ids had no durable records | accepted; every initial, affected, and terminal finding now retains id, severity, reviewer, disposition, and repair |

## Terminal Re-review 04

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| terminal authority | Banach the 5th (`019f55dd-4b28-7b13-91a8-939e29d5c2dd`) | passed |
| terminal closed-loop | Dewey the 5th (`019f55dd-4e18-7650-bfa0-7034a8dee84e`) | one change requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-TERM-RR-01 | P1 | Dewey | two of six dirty paths were described rather than named exactly | accepted; the live ledger now lists all six full repository-relative paths |

## Terminal Condition

Curie the 5th (`019f55e1-f09e-7ba1-8ab7-8d6171acd74c`) passed the narrow
closed-loop re-review of `A2-TERM-RR-01` against candidate digest
`e21305995898b149eb27fea191d754d43bc3727a9c7a64d785c3d499737588e4`.
The prior terminal authority pass remains valid because the repair changed only
the exact live-state path list and its accounting records. The frame is
reviewed and admitted for a leased Graphite commit and standalone A.2 launch.

## Base-Boundary Affected Review

The classify-reported `habitat:boundaries` gate exposed a pre-existing source
dependency defect in three Habitat checks. The execution frame now places one
bounded repair branch before operation authority work.

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| Nx/Habitat dependency ownership | Lovelace the 5th (`019f55e9-7b9f-7120-b05f-b07709c71c30`) | changes requested |
| closed-loop prerequisite gates | Jason the 5th (`019f55e9-78fe-7331-a80d-d059463633c7`) | changes requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-BASE-REVIEW-01 | P1 | Lovelace | package exports remain invalid `kind:tooling` dependencies and resolve stale artifacts | accepted; all 11 static imports use the established repository-root file-URL seam, selecting exact source paths except for the one intentional generated-artifact comparison |
| A2-BASE-REVIEW-02 | P1 | Jason | the prerequisite omitted Habitat's own Biome gate | accepted; `nx run habitat:biome:ci` is now a required closing gate |

A fresh narrow affected reviewer must confirm those two repairs before the
frame can commit or the standalone A.2 DRA can launch.

## Base-Boundary Re-review 02

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| exact dependency and gate closure | Laplace the 5th (`019f55f3-e917-7ef1-a02e-ce7da14e2bb3`) | one change requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-BASE-RR-01 | P1 | Laplace | the sole intentional generated-artifact dependency could be absent or stale on a clean checkout | accepted; name `dist/recipes/standard-artifacts.js` as the only permitted dist load and run `mod-swooper-maps:gen:studio-recipes-types` immediately before its comparison rule |

The prior file-URL and Biome-gate repairs passed. One fresh micro-review must
now confirm artifact identity and generation order without reopening those
settled findings.

## Base-Boundary Terminal Condition

Maxwell the 5th (`019f55f8-ae14-7490-b60a-86cf9b050786`) passed the fresh
micro-review of `A2-BASE-RR-01`. Nx metadata confirmed that
`mod-swooper-maps:gen:studio-recipes-types` exists and declares the named
artifact as output. An isolated clean archive began without that ignored
artifact, generated it successfully, and then passed
`verify_standard_recipe_artifacts_match_source_stages`. The prerequisite is
deterministic from a clean checkout, and the A.2 frame is admitted for commit.

## Base-Biome Discovery

The subsequently run `enforce_formatting_and_import_hygiene` owner reached the
committed Habitat source and exposed a repo-wide lintEffect corpus rather than
a bounded prerequisite failure.

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| authority placement and executable gate scope | Heisenberg the 5th (`019f5600-da16-7c30-8e95-a204551cc313`) | changes requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-PLACEMENT-01 | P1 | Heisenberg | root `habitat:biome:ci` reports 764 errors beyond the two inspected fixture diagnostics, so a four-file prerequisite cannot close it | accepted; retain the corpus under the existing `TOOL-EFFECT` owner and replace the impossible root gate with exact changed-file Biome checking |
| A2-PLACEMENT-02 | P1 | Heisenberg | literal path and text fixture values are not established semantic violations and rewriting them would evade an overbroad selector | accepted; remove the fixture from A.2's write set and leave rule refinement plus genuine repairs to `TOOL-EFFECT` |

The three boundary checks remain the prerequisite's exact write set. One fresh
affected reviewer must confirm that the focused gate is honest and executable
without treating it as a waiver over the independent root corpus.

## Focused-Habitat Re-review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| focused authority and gate compatibility | Sagan the 5th (`019f560b-802b-7990-ad93-9553760a67e7`) | one change requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-GATE-BOUNDARY-01 | P1 | Sagan | the specified dynamic `import()` seam satisfies Nx but violates lintEffect's active `prevent-dynamic-imports` rule | accepted; run a bounded solution investigation for a Biome-compliant exact-source loader, with no suppression, boundary weakening, subprocess, stale artifact, or harness expansion |

The TOOL-EFFECT ownership boundary and exact changed-file gate otherwise
passed. The frame remains locked until the loader mechanism is demonstrated and
freshly reviewed.

## Exact-Source Loader Investigation

Beauvoir the 5th (`019f560e-42a3-7e42-84c3-4e26f93a9b55`) demonstrated Bun's
`createRequire` implementation in an isolated clone. A computed absolute path
anchored at the repository package file leaves Nx with only a static
`node:module` edge and does not trigger lintEffect's dynamic-import rule. The
same mechanism already exists in a Studio Habitat check and Habitat policy.

The candidate loaded all six source modules, all ten source-load sites, and the
one generated artifact; passed focused Biome, strict TypeScript, Bun bundling,
Nx boundaries, the three rule checks, and diff hygiene; and left the repository
graph without a Habitat-to-product dependency. Static package imports, literal
relative `require()`, and dynamic `import()` were each falsified.

Two residuals are resolved in the repaired contract:

- run the artifact generator first so its dependency graph supplies transitive
  workspace package outputs before any source module loads;
- constrain `NodeRequire`'s untyped return immediately with local read shapes,
  without product type imports or escaping `any`.

One fresh affected reviewer must confirm those resolutions before frame commit.

## Loader Affected Review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| strict TypeScript closure | Aquinas the 5th (`019f5616-fd47-7592-a6b8-d9db8df78738`) | one change requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-LOADER-TYPE-01 | P1 | Aquinas | the listed gates did not type-check the three `.habitat` check files or bind the proposed local read-shape contract | superseded by the semantic authority disposition below; the three scripts retire rather than gaining an indirect untyped loader |

## Semantic Authority Disposition

Darwin the 5th (`019f561a-725a-7861-bb2d-0a3adde4bd62`) reviewed every
assertion against Habitat's authority ledgers, package tests, and Nx ownership.
No assertion requires a Habitat script that loads product code. The prior
`createRequire` candidate is rejected because passing mechanical gates would
hide a real dependency and preserve the wrong owner.

The repaired prerequisite retires all three command packets. Generated
entrypoint and recipe-artifact behavior moves into the existing Swooper test
target; generic authoring laws remain in MapGen Core; Studio retains its real
focus-path consumer test; and exact stage/config-property mirrors are deleted.
Live authority inventories receive current dispositions while the closed
historical split wave receives a supersession receipt.

Fresh authority and testing/Nx reviewers must now confirm that this smaller
topology closes the boundary gate without losing a durable behavior.

## Validator Ownership Review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| Habitat retirement completeness | Godel the 5th (`019f5626-93a8-7d52-a9cb-f33e9930b948`) | one change requested |
| package testing and Nx reachability | Plato the 5th (`019f5626-90bb-7063-91df-654e17d9e95f`) | changes requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-RET-01 | P1 | Godel | retiring artifact parity would lose generated UI metadata completeness | accepted; derive and compare stage/step identity, full IDs, and focus paths dynamically in the package artifact test, while omitting labels and key maps |
| A2-NX-001 | P1 | Plato | ordinary tests run after generation, so a stale tracked entrypoint can be overwritten before the assertion observes it | accepted; add one non-cacheable post-generation `generated:check` target that fails on dirty `src/maps/generated`, and make test depend on it |
| A2-COV-002 | P2 | Plato | the Studio consumer iterates only emitted metadata and cannot detect an omitted stage or step | accepted with A2-RET-01's source-derived structural projection |

One fresh terminal reviewer must confirm these exact repairs and the absence of
a new target cycle or second brittle oracle.

## Validator Ownership Terminal Review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| repaired ownership and coverage | Einstein the 5th (`019f5630-9209-7330-b7d0-d9773a200588`) | one wording change requested |

| ID | Severity | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- |
| A2-OWN-001 | P2 | Einstein | the plan overclaimed surviving Habitat ownership of generated-entrypoint structure | accepted; Nx `generated:check` owns currentness, while Habitat owns generated-zone mutation/write protection and workspace boundaries |

The task graph, UI structural projection, post-generation observation, retained
behavior, and mirror deletion otherwise passed. One fresh exact-owner
micro-review remains.

## Validator Ownership Terminal Condition

Descartes the 5th (`019f5636-d720-7ff3-ac10-85f614972c3d`) passed the exact
owner micro-review. Nx owns generated-entrypoint currentness through the new
post-generation target; Habitat owns generated-zone mutation/write protection
and workspace dependency boundaries. No surviving Habitat rule is claimed to
own currentness parity, and no P0-P2 finding remains. The prerequisite and full
A.2 frame are admitted for commit.

## Prerequisite Implementation Review

The standalone A.2 DRA reviewed the implemented validator-ownership candidate
with three fresh, read-only lanes after the focused implementation gates.

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| TypeScript refactoring and inference | `a2_validator_review_ts` | passed |
| code quality, behavior preservation, structure, and comments | `a2_validator_review_quality` | one P2 change requested |
| Habitat, library, and authority correctness | `a2_validator_review_authority` | two P2 changes requested |

| ID | Severity | Confidence | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- | --- |
| A2-VAL-CQ-001 | P2 | high | `a2_validator_review_quality` | cleanup-ledger gate state claimed a committed, closed prerequisite while the candidate was dirty and in review | accepted with A2-VAL-AUTH-001; fresh records implementer restored candidate/review-pending state and denied dependent-branch authority |
| A2-VAL-AUTH-001 | P2 | high | `a2_validator_review_authority` | canonical cleanup state contradicted the live uncommitted branch and packet ledger | accepted; the same repair left `sourceCommit` null and limited the next legal action to prerequisite repair and reruns |
| A2-VAL-AUTH-002 | P2 | high | `a2_validator_review_authority` | source-conversion rows invented `retired_to_package_nx` outside the controlling disposition vocabulary and left mechanical counts stale | accepted; all three rows use `package_local_test_or_validator` with explicit retired/package-Nx facts, and canonical corpus, matrix, mechanical counts, and affected lane copies reconcile |

The TypeScript lane found no material issue in inference, JSON-boundary
normalization, full-step identity derivation, target-shell portability, package
exports, or comment quality. The quality and authority lanes otherwise approved
the retirement mechanics, acyclic Nx graph, retained generated-zone and
boundary authority, package-owned behavior, and absence of loaders, wrappers,
aliases, copied business logic, config-key mirrors, or JSDoc/cornerstone-comment
defects.

## Prerequisite Affected Re-review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| candidate/commit record truth | `a2_validator_rereview_records` | passed |
| source-conversion taxonomy and counts | `a2_validator_rereview_inventory` | passed for the A.2 rows and canonical corpus, with one pre-existing lane-union limitation |

The record-truth reviewer confirmed that the cleanup ledger remains
nonterminal, grants no next-branch mutation, preserves all three retirement
rows, and leaves an honest final-seal update. The inventory reviewer confirmed
the three affected corpus/lane copies, all 76 canonical corpus rows, and the
matrix/mechanical totals. Its separate observation that the historical union
of every lane JSONL has unrelated pre-existing drift is not repaired or claimed
by A.2; the verification receipt now scopes reconciliation to the canonical
corpus and affected lane copies. No accepted P1/P2 remains from the
implementation review.

## Baseline-Manifest Prerequisite Implementation Review

The standalone A.2 DRA ran three fresh adversarial lanes after the minimal
D2-to-D7 candidate passed its initial typecheck, boundary, and focused-test
HUD. Authority remains with the sealed validator parent; the domain-operation
Authority branch is absent and untouched.

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| TypeScript/Effect inference and resource correctness | `a2_baseline_review_ts_effect` | passed; no P0-P3 finding |
| code quality, module ownership, JSDoc, and cornerstone comments | `a2_baseline_review_quality` | three P2 changes requested |
| Habitat baseline authority, TypeBox 1.3, CLI behavior, and dependency flow | `a2_baseline_review_authority` | passed; no P0-P3 finding |

| ID | Severity | Confidence | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- | --- |
| A2-HAB-CQ-001 | P2 | high | `a2_baseline_review_quality` | independently meaningful rule-introduction admission remained in the broad baseline operations module | accepted; a fresh D5-only implementer extracted the private policy and passed Habitat check, 29 focused tests, focused Biome, and diff hygiene; final quality re-review passed |
| A2-HAB-CQ-002 | P2 | high | `a2_baseline_review_quality` | the service-boundary matrix did not distinguish an absent registry relation from a referenced file disappearing, and omitted the corresponding expansion cases | accepted; a fresh tests-only implementer added both distinctions to report and expansion, producing 11 passing focused cases with zero-write assertions; authority and final quality re-reviews passed |
| A2-HAB-CQ-003 | P2 | high | `a2_baseline_review_quality` | the sole live ledger simultaneously described implementation and review while saying already-closed implementers were still running | accepted; the first records repair restored intermediate truth and the quality/records re-review correctly kept the finding open through the later repair cycle; the first closing-records integration was then invalidated by terminal review because it undercounted the live candidate scope, so CQ-003 remains open pending fresh exact-count re-review |

The initial passing lanes found no Effect environment leak, resource-scope defect,
TypeBox 1.3 boundary bypass, baseline-authority weakening, inferred admission,
CLI consumer divergence, JSDoc defect, or misleading cornerstone comment. All
three findings were retained through their repair HUDs and fresh affected
reviews; their terminal dispositions are recorded below.

### Focused Biome Adjudication

`a2_baseline_biome_gate_investigation` compared the parent and candidate rather
than treating the repo-wide lintEffect corpus as an A.2 obligation. Eight clean
changed files passed full Biome. Four files with inherited diagnostics passed
formatter/parser checks, and parent and candidate each reported 36 errors plus
5 infos with identical path, severity, message, and source fingerprints.

That zero fingerprint delta was not sufficient proof: changed-line selection
found one candidate-owned `no-naked-object-state-update` occurrence in the
added manifest-contract fixture. The fresh D2 repair lane rewrote only that
fixture and passed 8 focused tests, Habitat check, formatter/parser, and a
changed-line rerun with 17 inherited parent-line diagnostics unchanged and zero
added-line diagnostic. The earlier claim that no added line selected a
diagnostic remains withdrawn from the initial attempt. The independent
`TOOL-EFFECT` corpus remains owned and unwaived; this prerequisite cannot seal
until the affected reviews and closing reruns pass.

## Baseline-Manifest Affected Re-review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| repaired TypeScript/Effect inference and resources | `a2_baseline_rereview_ts_effect` | one P2 change requested |
| repaired Habitat authority, TypeBox 1.3, CLI behavior, and dependency flow | `a2_baseline_rereview_authority` | passed; no P0-P3 finding |
| repaired code quality and records | `a2_baseline_rereview_quality_records` | one P3 code cleanup; A2-HAB-CQ-003 retained until final record enumeration |

| ID | Severity | Confidence | Reviewer | Finding | Disposition and repair |
| --- | --- | --- | --- | --- | --- |
| A2-HAB-TS-001 | P2 | high | `a2_baseline_rereview_ts_effect` | the extracted policy derived its read port from a non-generic baseline file-system port and emitted `Effect.Effect<RuleIntroductionManifestAdmission, never, any>`, erasing the required environment | accepted; a fresh Effect-only implementer parameterized the read port, source, context, helpers, and exported operation with `R`; the final emitted signature is `<R>(ruleId: string, keys: readonly string[], comparisonBase: string, baselinePath: string, context: RuleIntroductionManifestContext<R>) => Effect.Effect<RuleIntroductionManifestAdmission, never, R>` and a fresh final Effect re-review passed with no P0-P3 |
| A2-HAB-CQ-004 | P3 | high | `a2_baseline_rereview_quality_records` | `ServiceHarness.deps` was returned but never read | accepted; a fresh tests-only cleanup removed only the unused interface and returned property; the final quality-code re-review passed with no P0-P3 |

The authority re-review independently passed the repaired D2-to-D7 flow,
TypeBox 1.3 validation, missing/malformed/mismatch refusals, and report/expansion
behavior. The final quality-code re-review also closed A2-HAB-CQ-001,
A2-HAB-CQ-002, and A2-HAB-CQ-004. The first records-only integration named
every original, repair, affected-review, and final code-review lane while
keeping the tooling branch unsealed and Authority absent, but its CQ-003 closure
claim did not survive the terminal records review below.

The repaired candidate then passed the cached
`nx run habitat:check --outputStyle=static` and
`nx run habitat:boundaries --outputStyle=static` targets and all 44 tests in the
five focused files. Nine full-clean changed files passed `bun biome ci`; four
changed files with inherited `TOOL-EFFECT` diagnostics passed formatter/parser
checking with lint disabled. The aggregate inherited fingerprint remains 36
errors plus 5 infos, while the D2 full-file capture contains 17 unchanged-parent
diagnostics and zero added-line diagnostic. Uncached closing gates and Graphite
seal are not claimed by this review record.

### Terminal Records Review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| exact live porcelain categories, terminal agent state, and no-seal boundary | `a2_baseline_final_records_review` | one P2 retained under A2-HAB-CQ-003 and transferred to a fresh records-count repair owner |

The reviewer found that the first closing-records integration reported 12
code/test paths plus five record surfaces for 17 total even though live
porcelain contained 13 code/test paths plus those five records for 18 total.
This is retained under the existing A2-HAB-CQ-003 record-truth finding rather
than creating a new finding family. The fresh
`a2_baseline_records_count_repair` owner corrected every stale count claim and
recomputed the same 13-plus-five categories from live porcelain. CQ-003 remains
nonterminal until a fresh exact-count re-review accepts that repair.

### Exact-Count Re-review

| Lens | Reviewer | Verdict |
| --- | --- | --- |
| exact porcelain categories, JSONL identity, refs, and no-seal boundary | `a2_baseline_records_count_rereview` | passed; no P0-P3 finding |

The reviewer independently reproduced 13 code/test paths plus the five existing
record surfaces for 18 total, found no stale live count claim, parsed both JSONL
registers without duplicate resource or attempt identities, and confirmed the
Graphite, protected-ref, `TOOL-EFFECT`, and no-Authority boundaries. This pass
closes A2-HAB-CQ-003. Uncached closing gates, Graphite seal, indexed-checkout
synchronization, and Authority admission remain unclaimed.

### Baseline-Manifest Closing Gates

The reviewed candidate passed uncached Habitat boundaries, TypeScript check,
owner build, and the full 38-file, 345-test suite. The owner build preceded the
test suite to avoid the known generated-`dist` ordering race. Nine clean changed
files passed full Biome; four inherited-corpus files passed formatter/parser
checking with zero candidate-owned selected diagnostic. JSONL identity, the
exact 13-plus-five status scope, diff hygiene, generated/excluded paths,
Graphite shape, protected refs, and the absence of Authority, remote, PR, and
active Git-operation state also passed. This admits only the exact-set tooling
seal; the commit, indexed-checkout synchronization, and Authority recreation
remain unclaimed.

The exact 18-path candidate then materialized as Graphite commit `26c9c7fa2`
with sole parent `dd38de22e05b`. A receipt command briefly created a second
local commit; `gt squash --no-edit --no-interactive` immediately restored the
required single changeset, and the final receipt amends that one branch commit.
The amended branch ref is the sealed tooling tip. Main, origin/main, validator,
and readiness refs remain unchanged. Indexed-checkout synchronization and
Authority recreation remain the next execution actions.
