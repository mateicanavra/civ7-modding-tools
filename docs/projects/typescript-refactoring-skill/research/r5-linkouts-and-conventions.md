# R5 — Link-Outs and Local Skill Conventions

Research lane output for the new repo-local skill: a **TypeScript first-principles
complexity-reduction & refactoring skill**. This skill must (a) **link out** to the
existing cognition/dev design skills rather than re-deriving their content, and
(b) **match the local repo skill conventions** under `.agents/skills/`.

Two parts:

- **Part A — Link-out table.** Where our skill should hand off, what each target
  skill owns, and the exact trigger that forces the handoff.
- **Part B — Local conventions** our skill must conform to (frontmatter, layout,
  tone, cross-references, README registration, operating rules).

---

## Part A — Design Skills to Link Out To

### A.0 Naming convention for link-outs (verified)

Local repo skills reference plugin design skills with the **`plugin:skill`**
prefix form — confirmed by grepping `.agents/skills/`: `cognition:system-design`,
`cognition:framing-design`, `cognition:team-design`, `cognition:inquiry-design`,
`cognition:investigation-design`, `mapgen:placement`, `mapgen:foundation`. The dev
plugin equivalents are written `dev:architecture` and `dev:api-design` (as in the
prompt and the system skill list). **Our skill must use these prefixed names when
linking out.** Bare `system-design` / `architecture` are the internal `name:` of
the skill files; the *callable* reference form in this repo is the namespaced one.

Note on the cognition skill set: the SKILL.md files in
`.../cognition/1.0.0/skills/` declare bare `name:` values (`system-design`,
`domain-design`, …). The repo invokes them as `cognition:<name>`. There is a small
naming gap: some local skills reference cognition skills that are *not* in the read
set (`framing-design`, `inquiry-design`, `investigation-design`) — these exist in
the plugin but were out of scope for this lane. Our skill should only link out to
skills it has actually located.

### A.1 What each target skill OWNS (from frontmatter + opening + reference map)

**`cognition:solution-design`** — `name: solution-design`
Owns judgment about **WHAT to solve, WHETHER to solve, at WHAT LEVEL, and HOW to
navigate solution spaces.** Problem reframing, stakeholder incentive mapping,
solution-space topology (smooth↔rugged), reversibility-calibrated depth,
satisficing vs optimizing. Six axes (Problem Character, Solution Space Topology,
Stakeholder Complexity, Intervention Type, Commitment Reversibility, Knowledge
State). Explicitly upstream of system-design. **Medium-agnostic** (product, org,
policy, technical). Its own boundary note: "Development Architecture is
software-specific patterns. Solution design is medium-agnostic."

**`cognition:system-design`** — `name: system-design`
Owns **applied systems thinking for real-world systems** — feedback loops, stocks
& flows, delays, second-order effects, leverage points (9-level hierarchy),
incentive structures, boundary-as-choice. Six axes (Agency, Complexity Domain,
Observability, Coupling, Feedback Speed, Boundary Permeability). Has a **software
systems leaflet**. Boundary note: "dev:architecture is about software structure
patterns… Architecture is a substrate-specific application of system design
principles."

**`cognition:domain-design`** — `name: domain-design`
Owns **drawing boundaries** — decomposing a system into domains/bounded contexts,
**single-authority ownership**, ubiquitous language as a boundary signal, seams of
weak interaction (Simon), encapsulation, ambiguity-as-cost. Seven axes (Boundary
Permeability, Authority Distribution, Domain Stability, Decomposition Granularity,
Domain Formality, Membership Model, Coupling Topology). Has **software-services and
software-data leaflets**. This is the closest cognition skill to "module
boundaries / where should this code live" at the *conceptual* level.

**`cognition:testing-design`** — `name: testing-design`
Owns **what to test, how rigorously, and where failure is most likely** —
adversarial/falsification testing, oracles, risk-proportional effort, boundary
analysis, testability-as-design. Six axes (Assurance Target, Cognitive Mode,
System Legibility, Discovery Method, Evidence Standard, Feedback Speed). Has a
software-testing leaflet. Explicitly **NOT** for writing test code (defers to
language/framework skills — which is exactly where *our* TS skill could provide the
"how to keep refactors safe" hook, while testing-design provides the "what to
probe" judgment).

**`cognition:information-design`** — `name: information-design`
Owns **shaping content/structure for a reader** — information hierarchy,
progressive disclosure, chunking, signal-to-noise, information scent. Six axes
(Purpose, Density, Linearity, Audience, Scope, Temporality). This is the skill we
use **on our own SKILL.md** (and on any docs the refactor produces), not on code.

**`cognition:ontology-design`** (frontmatter only) — `name: ontology-design`
Owns **operational semantic models for inference/validation** (RDF vs JSON schema,
SPARQL/SHACL, knowledge-graph ontologies). Out of scope for a refactoring skill;
no handoff expected.

**`cognition:disambiguation`** (frontmatter only) — `name: disambiguation`
Owns **detecting ambiguity in a request and asking minimal high-leverage
questions**, presenting options with tradeoffs, preserving context. Handoff when
the *refactoring request itself* is ambiguous (which module? what outcome?).

**`cognition:mental-map`** (frontmatter only) — `name: mental-map`
Owns **orientation across many steps** — mapping terrain, breadcrumbs, "already
checked", injecting accumulated context. Handoff when a large refactor spans many
files and the agent risks re-discovering / getting lost.

**`dev:architecture`** — `name: architecture`
Owns **target-state software architecture and migration**: turning exploration/
spikes into a **pure SPEC**, **decision packets** (this-or-this ambiguity →
accept/reject), **migration slices** (prepare → cutover → cleanup, every bridge
has a deletion target), dependency ordering (spine → boundaries → domain),
current/target/transition separation, cutover validation ("no legacy left"). This
is the skill our refactoring skill hands off to when a refactor is large enough to
need a *durable target spec and a phased migration plan* rather than an in-place
edit.

**`dev:api-design`** — `name: api-design`
Owns **the design of any programmatic interface** — network APIs, **SDKs, local
libraries, CLI tools, AI/MCP tool interfaces.** Consumer-model-first, explicit
contracts, consistency, encapsulation-preserves-freedom, versioning/evolution. Six
axes including a **Substrate axis (network ↔ in-process/local)** and an **SDK/Local
APIs leaflet** — directly relevant when a TS refactor changes a module's public
surface / exported types. Boundary note: "Not for system architecture (use
architecture skill)."

### A.2 LINK-OUT TABLE

For each concern, the **exact reference name** to use in our SKILL.md, what it
owns, and the **trigger phrase** that should make our skill hand off.

| Concern | Reference name (use this exact form) | What it owns (1 line) | Trigger that hands off to it |
|---|---|---|---|
| **Solution design** | `cognition:solution-design` | Whether/what to solve, problem reframing, depth calibration by reversibility, solution-space navigation | "Should we even refactor this?", "is the complexity the real problem or a symptom?", "is this worth the risk?" — i.e. the request is about *whether/what*, not *how* |
| **System design** | `cognition:system-design` | System dynamics: feedback loops, second-order effects, leverage points, coupling, incentives | "Why does this complexity keep coming back?", "what breaks two steps downstream if I change this?", reasoning about coupling/feedback rather than local code shape |
| **Domain design** | `cognition:domain-design` | Where boundaries go, single-authority ownership, bounded contexts, language seams, encapsulation | "Where should this code live?", "what's the right module boundary?", "who owns this concept?", "split this into bounded contexts" |
| **Testing design** | `cognition:testing-design` | What to test, how hard, where failure is likely; falsification, oracles, risk-proportional effort | "What could break if I refactor this?", "how do I make this refactor safe?", "design the test net before I change behavior" (the *strategy*, not the test code) |
| **Information design** | `cognition:information-design` | Structuring content for a reader; hierarchy, progressive disclosure, scent | Authoring/restructuring our SKILL.md, references/, or any doc the refactor emits — "make this doc clearer / shape this for the reader" |
| **Architecture** | `dev:architecture` | Target-state SPEC, decision packets, migration slices, current→target cutover, dependency ordering | "This refactor is big enough to need a target spec + phased migration", "plan the cutover", "decision packet for this-or-this", "no legacy left" |
| **API design** | `dev:api-design` | Interface/contract design for libraries, SDKs, CLIs, MCP tools; consumer model, explicit contracts, versioning | "The refactor changes a public/exported surface", "redesign this module's exports/types", "this is an SDK/CLI/library boundary", "versioning/evolution of the interface" |
| *(supporting)* **Disambiguation** | `cognition:disambiguation` | Detect ambiguity, ask minimal high-leverage questions | The refactoring *request* is unclear (which target? what success looks like?) before any work begins |
| *(supporting)* **Mental map** | `cognition:mental-map` | Orientation/breadcrumbs across many-step navigation | A refactor spans many files and the agent risks re-discovery or getting lost |

**Self-positioning for the new skill (the seam it must NOT cross):** our skill
owns the **TypeScript-specific, code-level craft of reducing complexity and
executing safe refactors** — type-driven simplification, module-boundary
*mechanics in TS*, in-place safe-refactor moves, dead-code/indirection removal,
keeping the type-checker green. It **defers the judgment of whether/what** to
`cognition:solution-design`, **systemic why** to `cognition:system-design`,
**conceptual boundary placement** to `cognition:domain-design`, **the safety-net
strategy** to `cognition:testing-design`, **large target-spec + migration** to
`dev:architecture`, and **public-surface/contract redesign** to `dev:api-design`.
The existing `dev:typescript` skill (in the system skill list) is the nearest
neighbor and the most important to differentiate against — note it in design.

---

## Part B — Local Repo Skill Conventions to Match

Source files:
`/.agents/skills/README.md`,
`/.agents/skills/civ7-systematic-workstream/SKILL.md`,
`/.agents/skills/civ7-architecture-authority/SKILL.md`,
`/.agents/skills/civ7-mapgen-workstream/SKILL.md`.

### B.1 Frontmatter spec

Local skills use **YAML frontmatter with exactly two keys**, same as the cognition
plugin skills:

```yaml
---
name: <kebab-case-skill-name>
description: |
  Use in the Civ7 Modding Tools repo when <situation>. Trigger phrases include
  "<phrase>", "<phrase>", ... . Do not use for <explicit non-goals / sibling skills>.
---
```

Observed rules (all three local skills conform):
- **`name:`** — kebab-case, matches the directory name (`civ7-systematic-workstream`
  in dir `civ7-systematic-workstream/`). No `civ7-` prefix is *required* by the
  format, but every current local skill carries a repo/domain prefix; our skill is
  *not* civ7-specific, so it should still be kebab-case and self-descriptive
  (e.g. `typescript-refactoring` or `typescript-complexity-reduction`).
- **`description:`** — block scalar (`|`), multi-line. **Three-part shape**:
  (1) "Use … when <situations>", (2) **explicit "Trigger phrases include …"** list
  of quoted natural-language phrases, (3) **"Do not use for …" / non-goals** that
  name the sibling skills it defers to. Local skills additionally scope with
  **"Use in the Civ7 Modding Tools repo when …"** — our skill should scope by
  *technology/condition* instead ("Use when refactoring or reducing complexity in
  TypeScript code …") since it is not repo-specific.
- **No extra frontmatter fields.** Local skills do **not** use `version`,
  `author`, `tags`, `allowed-tools`, etc. Only `name` + `description`. (This
  matches the cognition plugin skills, which also use only `name` + `description`.)

### B.2 Directory layout

Confirmed identical across all three local skills (`ls` verified):

```
.agents/skills/<skill-name>/
  SKILL.md          # lean entry point — routing, invariants, quick start
  references/       # deeper rules, method loops, axis detail, failure patterns
  assets/           # copy-forward templates (ledgers, checklists, preflights)
```

So our skill must be `.agents/skills/typescript-refactoring/` (final name TBD) with
`SKILL.md` + `references/` + `assets/`. This mirrors the cognition/dev plugin layout
too (`references/`, `assets/`), so the patterns transfer cleanly.

### B.3 SKILL.md internal structure (the local house style)

Local SKILL.md files follow a recurring section skeleton (not all sections in every
file, but this is the union and the common spine):

- `# <Title>` then `## Purpose` (what the skill owns + that it **composes** with
  other skills and **does not replace** them).
- `## When To Use` / `## When Not To Use` (or `## Non-Goals`) — explicit routing in
  and out.
- A **routing / companion-skill section** that names sibling skills and *when to
  load them* (e.g. systematic-workstream's "Companion Skill Routing";
  mapgen-workstream's "Routing Table" + "Reference Graph (compose, do not
  duplicate)").
- `## Default Workflow` — a numbered, **one-line-per-step** loop. (systematic =
  "12 gates, one line each"; mapgen = "11-step loop"; architecture = 9 steps.)
- `## Reference Map` — a table `| Reference | Path | Open When |`.
- `## Asset Map` — a table `| Asset | Path | Use When |`.
- `## Core Invariants` — wrapped in **`<invariants>` … `<invariant name="...">`**
  XML tags (identical mechanism to the cognition skills). This is a load-bearing
  convention: invariants are tagged, named, one sentence each.
- `## Anti-Patterns` / `## Failure Signals` / `## Failure Modes` — what drift looks
  like.
- `## Quick Start` — a short numbered "do this first" recap.

Our skill should adopt this spine: Purpose → When/When-Not → Companion routing →
Default Workflow (numbered, terse) → Reference Map (table) → Asset Map (table) →
`<invariants>` block → Anti-Patterns/Failure Signals → Quick Start.

### B.4 Tone / voice

- **Imperative, operator-facing, dense.** Second-person/agent-directed ("Use this
  skill before…", "Do not tune before…"). No marketing voice.
- **Strong invariant language**: short declarative rules ("Core stays pure.",
  "Generated output is read-only.", "Proof classes stay separate.").
- **Compose-don't-duplicate is an explicit value** in the local skills — they
  repeatedly say *route to the owner, never restate it as a second spec*
  (README lines 7-9; mapgen `compose-not-duplicate` invariant; systematic "it does
  not replace them"). Our link-out skill must echo this posture explicitly.
- **Evidence/proof discipline & honesty** is a recurring theme even outside
  mapgen — keep claims scoped to what was actually verified. For a refactoring
  skill this maps to: keep the type-checker/test claims separate, don't claim a
  refactor is "safe" beyond what was actually run.
- Cross-skill references are written inline as **`cognition:system-design`-style
  prefixed names**, and longer pointers use the Reference Map table with relative
  `references/<file>.md` paths.

### B.5 How they reference other skills

- **Sibling/plugin skills** → prefixed name inline (`cognition:system-design`,
  `civ7-architecture-authority`, `dev:architecture`, `mapgen:placement`).
- **Own deeper material** → relative paths in Reference/Asset Map tables
  (`references/method-loop.md`, `assets/closure-checklist.md`).
- mapgen-workstream models the gold standard for a **router skill that links out**:
  a "Reference Graph (compose, do not duplicate)" ASCII map + a CURRENCY BANNER
  classifying which referenced skills are authoritative vs philosophy-only. Our
  skill is also a "thinking-spine-plus-links" skill, so this pattern is the closest
  precedent to imitate.

### B.6 README registration (REQUIRED — exact format)

The README at `.agents/skills/README.md` has a **`## Skills` table** that every
skill must appear in. The table has **exactly two columns**: `Skill` and `Use
When`. The header/separator and an example data row, verbatim:

```markdown
## Skills

| Skill | Use When |
|---|---|
| `civ7-architecture-authority` | Placing code, moving boundaries, changing MapGen stage/step/domain shape, separating core/mod/adapter/generated concerns, or reviewing architecture drift. |
```

Rules to match when we add our row:
- **Skill name in backticks** in column 1 (e.g. `` `typescript-refactoring` ``).
- Column 2 is a **single "Use When" sentence/fragment**, capitalized, ending with a
  period, describing the triggering situation (longer entries — e.g. the
  `civ7-mapgen-workstream` row — run several clauses but stay one cell).
- Separator row is `|---|---|`.
- Add exactly one new row; do not restructure the table.

Draft row for our skill (adjust final name):

```markdown
| `typescript-refactoring` | Reducing complexity or executing safe refactors in TypeScript code from first principles — simplifying types, tightening module boundaries in TS, removing indirection/dead code, and keeping the type-checker green; routes whether/what to `cognition:solution-design`, conceptual boundaries to `cognition:domain-design`, the safety-net strategy to `cognition:testing-design`, large target-spec + migration to `dev:architecture`, and public-surface/contract redesign to `dev:api-design`. |
```

### B.7 Operating Rules (from README "## Operating Rules" — our skill must comply)

Verbatim list the README states:

- Read the root `AGENTS.md` first, then the closest subtree `AGENTS.md` for files
  being touched.
- Load the smallest skill set that covers the work.
- **Keep `SKILL.md` files lean. Put deeper rules in `references/` and copy-forward
  templates in `assets/`.**
- **Do not store temporary workstream state in these skills.** Use
  `docs/projects/<project>/...` for project state and phase artifacts.
- Use `openspec/` for implementation change records once a project slice becomes an
  OpenSpec workstream.
- **Update a skill only when durable authority changes.**

Implications for the new skill:
- SKILL.md is the **lean router**; depth → `references/`, templates → `assets/`.
- **No project status / migration notes / chat carry-forward in the skill** (README
  preamble: "They are not project status, migration notes, or chat
  carry-forward.").
- It must **encode durable operating guidance only** and **link out** to the design
  skills rather than duplicating them — same posture the README sets for the mapgen
  skills routing to the normalization packet.

---

## Summary (for the workstream)

1. **Link out, prefixed.** Use `cognition:*` and `dev:*` names exactly. Map the
   seven concerns per the Part A table; our skill owns TS code-level craft only.
2. **Frontmatter = `name` + `description` (block scalar)** with a "Trigger phrases
   include …" list and a "Do not use for …" non-goals clause. No extra fields.
3. **Layout = `SKILL.md` + `references/` + `assets/`.**
4. **House style = imperative + `<invariants>` block + Reference/Asset Map tables +
   numbered terse workflow + compose-don't-duplicate + scoped proof claims.**
5. **Register in README's two-column `| Skill | Use When |` table** (name in
   backticks, one capitalized "Use When" sentence ending in a period).
6. **Obey the Operating Rules**: lean SKILL.md, no temp state, deeper rules in
   references, durable authority only.
