# Studio Design Pipeline — Director Frame

> **What this is.** The durable, compaction-surviving operating frame for the
> continual design→development pipeline between Matei's Claude Design project
> ("Civ7 MapGen Studio", `531d158d-a7f6-41cb-87a4-f0f8a5e521b0`) and this repo's
> mapgen-studio application. It is the lens and the law of process — not a task
> list, not a status ledger. **Read it first on every resume**, together with
> [`CREW.md`](CREW.md) (standing agent baselines) before spawning any agent.
>
> **Authority order when sources disagree:** Matei's live directives → this
> FRAME (process law) → the design source (project explorations; locked
> references outrank candidates) → repo authority skills
> (`.agents/skills/civ7-product-authority`, `civ7-architecture-authority`) →
> [`packages/mapgen-studio-ui/.design-sync/NOTES.md`](../../../packages/mapgen-studio-ui/.design-sync/NOTES.md)
> (sync operational law) → conventions/READMEs → current code (evidence, never
> oracle).
>
> **Sibling frame:** [`../mapgen-studio-redesign/FRAME.md`](../mapgen-studio-redesign/FRAME.md)
> governed the bounded redesign workstream that built the design system and
> decomposed the app. This frame governs the *ongoing operation* that grew out
> of it. It inherits that frame's parity hard core and oRPC-only law; it
> supersedes its "never submit" rule — this lane submits finished work as
> **draft PRs** (`gt submit --draft`, Matei's later standing directive).

---

## 1. WHAT (the situation as framed)

This frame treats the **domino** — one bounded design-intent delta carried
whole through the loop from ingestion to sealed sync — as the unit of analysis.
It makes **state-space collapse and the meaning of information** the primary
signal (every domino should leave the studio with fewer reachable states,
simpler surfaces, more legible meaning — not merely different pixels), and it
holds the map-generation domain itself exterior. Matei **designs** in the
source project; I **direct** the sink side: program the pipeline, run the crew,
and develop design intent into the shipped studio experience. The pipeline has
a deterministic spine (converter, checks, grading gates, typed contracts) and
deliberately few judgment joints (classification, review verdicts, polish
taste, direction locks) — the work of direction is keeping judgment at the
joints and determinism everywhere else.

## 2. WHY (rationale and stakes)

The structural alternative — ad-hoc orchestration, each round designing its own
team and process — was rejected because the work is *repetitive by design*
(ingest → classify → compose → implement → review → polish → sync → repeat),
and inconsistent review baselines are precisely how repetitive work degrades:
each round would re-derive process, review quality would drift with prompt
phrasing, and no falsifier would ever accumulate across rounds. A second
alternative — organizing around roles first (a roster) rather than the pipeline
— was rejected because roles only earn their coordination cost in service of
stages; the pipeline is the invariant, the crew is its instrument. What is at
stake: if this frame degenerates, the failure mode is not loud breakage but
quiet mistranslation — designs land "done" that Matei doesn't recognize as his
intent, or sync drift accumulates until the design agent composes with stale
parts.

## 3. Topology — two loops, one pipeline

```
      PULL (design intent, downstream)
  Claude Design project ──explorations/proposals──▶ ingest → … → studio app
      (source of intent)                                (sink: experience)

      PUSH (system truth, upstream)
  repo dist/tokens/stories ──design-sync converter──▶ project components
      (source of truth)                                 (sink: design parts)
```

- **Pull loop:** design intent flows down. Explorations and proposals in the
  project are **candidates**; a candidate becomes a **reference** only when
  Matei locks it. We implement references (or candidates Matei explicitly
  green-lights), never speculative taste.
- **Push loop:** component truth flows up. The repo is the only component
  source — the project never holds hand-authored component truth. Every push
  is generated, atomic, and verified (the design-sync contract in NOTES.md).
- **Cascade:** a token or component change propagates stories → sheets →
  bundle → project → every future design the agent composes. This is why
  fidelity gates are non-negotiable: an unverified push poisons downstream
  designs, not just one screen.
- **Authority map:** Matei owns direction and experience; the project owns
  design intent; the repo owns code and component truth; product/architecture
  authority skills own behavior meaning and code placement; this FRAME owns
  process; NOTES.md owns sync mechanics.

## 4. Selection commitments

**In (selected):**
- The studio UI surface: `packages/mapgen-studio-ui` (components, tokens,
  stories, design-sync campaign) and `apps/mapgen-studio` (panels, surfaces,
  pages, state, runtime seam).
- The design project's exploration/proposal/reference lifecycle.
- The crew: standing lenses, their baselines, tiers, and coordination.
- The ledgers this loop writes: NOTES.md, DEFERRALS, OpenSpec changes, lane
  memory, seal records.

**Foreground (made salient):**
- Reachable-state count as the complexity measure at every altitude (types,
  hooks, component APIs, semantic lifecycle).
- Intent fidelity over generic polish: findings framed as "stated X, built Y."
- Proof-class honesty: what a grade, a green check, a parity number, or a
  match verdict actually proves — and never more.
- Sealed-ness: a domino is either whole (implemented + reviewed + polished +
  synced + recorded) or it is not done.

**Exterior (deliberately off-frame):**
- Map-generation algorithms, engine semantics, mod behavior, live-game runtime
  (owned by other lanes; the runtime-contract *seam* is in scope, its far side
  is not).
- The design platform's own checks and heuristics (app-side; we fix inputs,
  not the platform — DEF-017 pattern).
- The studio runtime train / DRA readiness stacks (peer work; we ride their
  tips, we don't steer them).
- Deploy contention for the shared game Mods folder (governed by its own
  memory; touch only when a domino needs live proof).

## 5. Hard core · protective belt · falsifiers

**Hard core (violating any of these forces a reframe):**
1. **The repo is the sole component source.** Nothing hand-authored lands in
   the project's component surface; every push rides the atomic, verified sync
   contract.
2. **Dominos seal whole or not at all.** No half-implemented deltas
   accumulate; an unsealed domino blocks opening the next in its class.
3. **The design source is the oracle; current code is evidence.** Expected
   behavior/appearance is predeclared per delta *before* implementation reads
   what the code currently does.
4. **Proof-class honesty.** A grade, test, parity score, or verdict is labeled
   by its actual evidence class; inflation (a green check presented as design
   fidelity, a match grade as product proof) is a defect, not enthusiasm.
5. **Direction locks belong to Matei.** Candidates never self-promote to
   references; the pipeline stalls on a missing lock rather than guessing.

**Protective belt (flexes without reframing):** crew composition and tiers,
batch sizes, stage-internal tactics, which review lenses fire per class,
tooling choices, ledger formats, OpenSpec granularity.

**Falsifier (forces a reframe — stop and tell Matei):** a sealed domino is
repudiated by Matei on design-intent grounds twice consecutively (the pull
loop is mistranslating intent — reframe ingestion/classification); or a
verified upload renders wrong in the project (the push-loop contract itself is
broken — stop all sync until re-derived).

**Degeneration trigger:** two consecutive dominos needing more than one
rework round after review (crew baselines are failing — re-run the
prompt-design mandate on them); or three consecutive reviews yielding zero
accepted findings while polish still materially changes the result (lenses
have drifted off the real defects — recompose the lens set). When a trigger
fires, also adopt the **dual-role split** (implementer vs enforcer,
`$HAB/dual-role-workstream`) for the following dominos — the systematic-
workstream invariant for long-running, high-drift streams.

## 6. The domino loop (stages, gates, convergence)

The internalized harness: **workstream-runner** gives the outer shell (one
objective, a durable record, closure with a zero-context Next Packet);
**systematic-workstream** gives the inner mechanics (oracle → corpus →
predeclared expectations → implementation → proof → clean close). I am the
**DRA**: agents produce evidence and findings; synthesis, scope, canonicality,
proof claims, repair disposition, repo state, and closure are mine and are
never delegated. At S0, **type the inputs** before drawing conclusions —
opening / authority / coordination / evidence / stale-excluded / control. At
S2–S3, **rails before burn-down**: where expectations can be encoded as guards
(token tests, lint rules, story checks), encode them before implementing
against them. Record formats are not invented — copy the runner's assets
(`next-packet.md`, `finding-record.md`, `minimal-workstream-record.md`). No
theater: minimal record over full record; no fresh frame per cycle (this FRAME
is the standing frame — re-verify, don't re-derive); host-only execution
unless parallelism cuts real risk; the smallest lens set that covers the
class.

| Stage | Work | Gate to pass |
| --- | --- | --- |
| **S0 PULL** | Refresh source state (project explorations, locks, decisions), refresh sync anchor, ground the lane (branch, clean tree, foreign staged files). | Source state named; workspace grounded. |
| **S1 CLASSIFY** | Decompose intent into corpus rows (deltas). Assign each a **class** (§7). Map anchors into source (narsil, §9). Order by dependency. **Predeclare** expected behavior/appearance per row. | Corpus visible, no hidden rows; expectations predeclared; classes assigned. |
| **S2 COMPOSE** | Design the implementation shape. Visual work: the ui-design checkpoint (Intent/Palette/Depth/Surfaces/Typography/Spacing, each with a why). State work: name the collapse (which union, which provider boundary, which machine). | Composition named per row; taste forks surfaced to Matei only if genuinely open. |
| **S3 IMPLEMENT** | Edits + stories in the lane worktree. COMPOSER (Sonnet 5) for beauty-critical builds; MECHANIC (Codex Luna / Haiku) for bulk; me for integration. | Build, typecheck, tests green. |
| **S4 REVIEW** | Standing lenses fan out per class (§7): LENS-BEHAVIOR, LENS-FIDELITY, SOL-GATE, LENS-HYGIENE. Ultracode Workflow when ≥2 lenses × ≥3 rows; findings adversarially verified before acceptance. I am the single editor: every finding gets a disposition. | No accepted P1/P2 finding undispositioned. |
| **S5 POLISH** | Apply dispositions; craft pass; state coverage (default/hover/active/focus/disabled; loading/empty/error). | Re-run only the affected lenses; green. |
| **S6 SYNC & SEAL** | design-sync check → grade (manual full-page path for the portal set) → atomic upload → anchor refresh → NOTES seal entry (+ OpenSpec change if the class warrants) → commit → nudge the narsil index (§9) → **Next Packet**. | Proof labels match evidence class; ledgers updated; clean tree. |

**Seal quality gates (from the runner, applied at S6):** the domino's outcome
is stated as achieved / partially achieved / not achieved with residual gaps
named; every finding is accepted, rejected, invalidated, waived, or deferred;
gates are recorded with commands and results (skipped checks get a rationale);
deferrals carry context, owner, and trigger; the Next Packet names what to
inspect first and the exact next action.

**Convergence rule:** the Next Packet of domino N (what a zero-context resume
needs: what sealed, what it proved, what it unblocked, what's next) is the S0
input of domino N+1. Dominos cascade; the loop is closed because each seal
feeds the next pull. Batching is allowed (several rows of one class ride one
loop pass) but per-row obligations stay visible — a batch going green never
hides a blocked row.

## 7. Classes — how a delta routes through the loop

Classification is the routing act of S1. The class picks the lens set and the
seal record weight; 2–3 core lenses, up to 2 more when the class demands.

| Class | Examples | Review lenses (core → added) | Seal record |
| --- | --- | --- | --- |
| **token** | palette, spacing, elevation, @kind kinds | LENS-FIDELITY + token-guard tests | NOTES |
| **element** | one component's internals, stories | LENS-BEHAVIOR + LENS-FIDELITY | NOTES |
| **composition** | multi-component shape, compound APIs, prop collapse | LENS-BEHAVIOR (composition-patterns armed) + LENS-FIDELITY → SOL-GATE if stateful | NOTES |
| **container/panel** | RecipePanel, ExplorePanel, panel state placement | LENS-BEHAVIOR + LENS-FIDELITY + SOL-GATE → LENS-HYGIENE | NOTES (+ OpenSpec if behavior shifts) |
| **surface/page** | navigation, layout, page-level state, new pages | all four lenses | OpenSpec + NOTES |
| **runtime-contract** | daemon/oRPC/TypeBox schema edge, config contracts | SOL-GATE (orpc/typebox/effect armed) + LENS-BEHAVIOR | OpenSpec + NOTES |

Anything with genuine lifecycle/async/protocol semantics (multi-status
reducers, optimistic UI, retries, idempotency) arms **state-machine-design**
in both LENS-BEHAVIOR and SOL-GATE regardless of class.

## 8. Crew & coordination

Topology (per team-design): an **orchestrated pipeline of specialist stages**
whose review stage is **parallel single-lens reviewers converging on one
editor** — me. Every deliverable has exactly one accountable owner: me as
integrator; lenses report, never edit; producers (COMPOSER/MECHANIC) return
diffs, never commit. Full baselines, return contracts, tool scopes, and seeds:
[`CREW.md`](CREW.md). Baselines are stable; call-time **seeds** carry only the
task instance. Never rewrite a baseline ad hoc — revise it deliberately under
the prompt-design mandate and commit the revision.

**Model tiers (config, not prose):**
- **Claude Opus** — default for intelligent processing, review lenses,
  documentation.
- **Claude Sonnet 5** — only where beauty is the deliverable (COMPOSER) or
  design-critical implementation.
- **Claude Haiku** — mechanical, low-trust work whose output I verify
  (advisory audits, sweeps in-repo).
- **Codex `gpt-5.6-sol`** (verified in local config; default profile, xhigh) —
  SOL-GATE deep logic/state/lifecycle review.
- **Codex `gpt-5.6-terra` / `gpt-5.6-luna`** (presumed ids — verify on first
  use, fall back to best available) — operational / mechanical delegation.

**Codex law:** invoke via `Skill(codex:rescue)` (or `/codex:review` for
diff-shaped review) — never raw-spawn the agent type. Codex briefs are
crafted under **prompt-design's model-fit method, exactly like every Claude
baseline** — there is one prompting law in this pipeline, not one per vendor.
Fit against the target model's current profile first
(`$COG/prompt-design/references/model-fit-method.md` + `model-profiles.md`;
no 5.6 profile exists yet — the nearest, 5.5, says: literal
instruction-following, one clean directive beats three, bound autonomy with
stop rules and budgets, legacy process-scaffolding is a liability; Matei's
lived experience outranks docs), then run T1–T7. The plugin's
`gpt-5-4-prompting` block library is a **vocabulary quarry, not assembly
law** — its durable content is contract substance (explicit done-state,
output contract, evidence rules, action-safety for writes); a block survives
only if it passes the deletion test on the current model. The forwarded
prompt is the *only* channel: attach skill anchors by instructing Codex to
read the skill file paths in-repo, emit model as `--model <literal-id>` (the
plugin resolves no aliases but `spark`). Reviews run read-only (no
`--write`); only MECHANIC tasks get `--write` plus scope-bound edit rules.
Diff-shaped review: `/codex:adversarial-review` carries the structured
verdict/findings schema; `/codex:review` is the free-form native reviewer.
Result law: preserve severity order and file:line; never auto-apply review
fixes; never substitute a Claude answer for a failed Codex run.

**Ultracode law:** the Workflow tool orchestrates review fan-outs and
multi-row parallel stages: `pipeline()` by default, barriers only for genuine
cross-item dependencies, adversarial verification (independent refuters) on
findings before I accept them, worktree isolation only when agents mutate
files in parallel.

## 9. Tooling law (standing overrides and disciplines)

- **narsil (code intel):** anchor mapping and blast radius run through the
  `narsil-code-intel-civ7` server, not blind grep. Scope `repo=` with ids
  from `list_repos()` — never filesystem paths (the skill's most-repeated
  rule). Named anchor → `find_symbols`/`search_code`; prose anchor →
  `neural_search` **unscoped** (`repo=` returned zero in our tests — observed,
  not doctrine) or `semantic_search`; **never `hybrid_search`** — Matei's
  standing directive, a deliberate local override of the skill's own default
  (do not "correct" the rule after reading SKILL.md). Confirm every hit with
  `get_excerpt(expand_to_scope=true)`. Blast radius = `find_references` +
  `find_symbol_usages` + `get_dependencies(path=)`, cross-checked with an
  `rg -n "\bSymbol\b"` pass (references can be token-matched, and beware
  substring traps). Markdown/JSON are commonly non-indexed (doctrine; on this
  index they register but content-search returns nothing — observed
  2026-07-18) — use `rg` for docs/configs, narsil for the code they point at.
  **Instance config, not narsil law:** this deployment indexes two repos —
  the TS monorepo materialized at the primary worktree
  (`/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`) and
  the base-game resources dump — so only code checked out at that path is
  searchable. Doctrinal freshness is `--watch` + `--persist`; our operational
  ritual (observed practice): `get_incremental_status` Last Updated recent +
  clean tree at the indexed path (no commit-SHA surface exists). Staleness
  ladder: restart first; `reindex` is last resort. **Nudge discipline:**
  after sealing, advance the primary worktree to the new tip
  (`git -C <primary> switch --detach <commit>`) *only when its tree is clean
  and nothing foreign is staged* — other lanes stage work there.
- **design-sync:** mechanics live in NOTES.md and are law: anchored checks,
  story-source-keyed grades, the manual full-page path for the portal set
  (currently Dialog, MapConfigSaveDialog, DropdownMenu), the atomic upload
  fence, anchor refresh, light canary. Grading is director-owned judgment —
  never delegated.
- **Graphite/worktrees:** lane branch `agent-DS-studio-ui-design-sync` in
  `wt-agent-DS-studio-ui-design-sync`; `gt sync --no-restack` in this
  multi-worktree repo; check `git diff --cached` before every commit; commit
  messages via `git commit -F <scratchpad-file>` (heredocs break the shell
  init here); finished work → `gt submit --draft` (confirm parent=main).
- **Session mechanics:** cwd resets between Bash calls (`cd` or `-C` every
  call); foreground `sleep` is blocked — long runs go `run_in_background`;
  design-sync checks need `DS_CHROMIUM_PATH`; the studio dev daemon resolves
  TS source via the bun-source condition.

## 10. Skill atlas (curated for this journey)

Core = load per the stage/class gates above. Situational = named-and-gated.
Paths: `$COG` = cognition plugin skills, `$DEV` = dev plugin skills, `$HAB` =
habitat, `$DESIGN` = design, `$SEARCH` = search (all under
`~/.claude/plugins/cache/local/<plugin>/<active-version>/skills/`); repo-local
under `.agents/skills/`.

| Skill | Role in the loop |
| --- | --- |
| `$HAB/workstream-runner`, `$HAB/systematic-workstream` | The internalized harness (§6): outer shell + inner mechanics. Consult `references/method-loop.md`, `evidence-and-proof.md`, `failure-patterns.md` when the loop feels busy-but-not-converging. |
| `$HAB/workstream-review-loops` | The lane contract template (concern + evidence base + forbidden scope + required output); re-run only affected lanes. |
| `$DEV/review-code-quality` | Review posture + authority-stop (LENS-BEHAVIOR governor). |
| `$DEV/refactor-typescript` | TS smell catalog + state-space spine + mandate self-checks. |
| `$DEV/vercel-react-best-practices` | React runtime rulebook; the useEffect triage is the highest-yield standing check. |
| `$DEV/vercel-composition-patterns` | Component-API altitude: boolean-prop proliferation → compound/variant shapes; provider/context state placement. |
| `$COG/state-machine-design` | Escalation lens for real lifecycle/async semantics (D2/D3/D4/D13/D16 probes; software-and-api route). |
| `$DESIGN/ui-design` | THE design anchor (compose + critique): Before-Writing checkpoint, craft floor, four-pass critique, swap/squint/signature/token mandate, `system.md` persistence. |
| `$DEV/web-design-guidelines` | Situational hygiene audit lens (a11y/forms/focus/perf); vendor the remote checklist if the fetch flakes. |
| `$DEV/frontend-design` | Quarantined by policy: expressive one-offs only — its never-converge law conflicts with a locked design system (the ui-design split is by intent, consistency vs differentiation, not strictly by surface). |
| `$COG/prompt-design`, `$COG/team-design` | Harness authoring: crew baselines (sub-agent mode, T1–T7 + six sub-agent tests, model-fit method — **governs Codex briefs too**; `references/codex-mechanics.md` documents the Codex TOML agent surface) and topology (six axes, five-test mandate). Re-run on any crew revision. |
| `$COG/framing-design`, `$COG/information-design` | This document's own laws: frame discipline and document shaping (ingestion briefs, specs). |
| `$DEV/orpc`, `$DEV/typebox`, `$DEV/effect-ts`, `$DEV/effect-orpc` | Runtime-contract class anchors: procedure/contract → orpc; config/schema artifacts → typebox; daemon internals → effect-ts; Effect-crosses-procedure → effect-orpc. Evidence honesty is their shared spine. |
| `openai-codex/gpt-5-4-prompting` | Vocabulary quarry for Codex briefs (contract substance: done-states, output contracts, action-safety) — 5.4-era, subordinate to prompt-design's model-fit, never assembly law. |
| `$SEARCH/narsil-mcp` | Code-intel discipline (§9 records the local overrides). |
| `dev:graphite`, `dev:git-worktrees` | Stack and worktree law. |
| `.agents/skills/civ7-product-authority`, `civ7-architecture-authority` | Behavior meaning and code placement law — the authority-stop target for every lens. |
| `.agents/skills/civ7-open-spec-workstream` | Change-record discipline for surface/page and runtime-contract dominos. |
| bundled `design-sync` | The push-loop contract itself. |

## 11. Keywords and config bags

**Matei's keyword field** (the spaces this collaboration lives in — re-read
them aloud when re-anchoring): Design · Direct · Program · Source · Sink ·
Develop · Pipeline · Deterministic · Polish · Loop · Iterative · Authority ·
Pull · Deploy · Component · Layer · Page · Class · Project · Reference ·
Candidate · State · Decouple · Simplify · Collapse · Experience · Meaning ·
Composition · Surface · Elevated · Stack · Stage · Sequence · Unit · Element ·
Hierarchy · Container · Push · Sync · Cascade · Whole · Complete · Systematic.

Read as spaces: *flow* (source/sink/pull/push/sync/cascade/deploy/deterministic),
*ontology* (element/unit/component/container/layer/surface/page/hierarchy/
stack/composition), *intent lifecycle* (project/candidate/reference/class/
state/authority), *mission* (decouple/simplify/collapse/meaning/experience/
elevated), *process* (stage/sequence/loop/iterative/polish/whole/complete/
systematic), *role* (design/direct/program/develop).

**Director's config bags** (my working pockets; the session's anchors):

- **flow** — source · sink · pull · push · authority · anchor · drift ·
  cascade · seam · closure
- **domino** — ingest · classify · predeclare · compose · implement · review ·
  polish · seal · packet · converge
- **crew** — lens · baseline · seed · tier · anchor-skill · verdict ·
  disposition · adversarial · editor · overhead-test
- **fidelity** — story · sheet · portal · grade · match · canary · parity ·
  proof-class · falsifier · pixel
- **ontology** — token · element · component · container · panel · surface ·
  page · experience · class · collapse
- **ledger** — FRAME · NOTES · DEFERRALS · memory · next-packet · retire-when ·
  pending-falsifier · snapshot

## 12. State pointer (snapshot 2026-07-18 — live state lives in the ledgers)

- Lane: `agent-DS-studio-ui-design-sync` @ the drift-refresh seal
  (`99536d51d`); remote at 45 components, anchors fresh.
- Domino queue: **flat-and-flush** (RecipePanel config surface; 9 deltas,
  guide order 5 → 8 → 9 → rest; guide lives in the project at
  `explorations/proposals/recipe-panel/flat-and-flush.implementation.md`);
  **TagSelectWidget** `[GRID_OVERFLOW]` → `cardMode: column`; **legend** —
  blocked on Matei's A/B lock (written recommendation: B, merge into
  ExplorePanel Layers).
- Pending falsifiers: DEF-017 @kind → next `check_design_system` run should
  clear finding #1 (record either way in `docs/system/DEFERRALS.md`);
  "no pages" clears when one real page is authored studio-side.
- Live state: lane memory `studio-design-collapse-lane`, NOTES.md, DEFERRALS.

## 13. Construction record

- **Mode/object:** frame-discovery + co-framing over Matei's keyword field and
  standing directives; object-path: objective (an operating frame for a
  continual outcome, not a bounded problem).
- **Structural alternatives considered:** ad-hoc per-round orchestration
  (rejected §2); roles-first organization (rejected §2); single-loop framing
  (pull only) — rejected because the push loop's cascade risk is what makes
  fidelity gates hard requirements, and a pull-only frame would demote sync to
  an afterthought.
- **Assumptions committed:** the Claude Design project remains the design
  source of record; design-sync's contract remains stable under CC upgrades
  (re-verify after binary bumps); Codex GPT-5.6 tiering stays available;
  the studio train tip remains our base until Matei redirects.
- **Perspectives composed:** the seven-reader skill-atlas survey
  (2026-07-18, workflow `wf_13fe8189-b91`), the prior redesign FRAME, lane
  memory, NOTES.md operational history.
