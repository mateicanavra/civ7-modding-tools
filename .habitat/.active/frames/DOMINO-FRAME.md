# Habitat Domino Frame

Status: active operating frame for the Habitat authority dominoes

Built: 2026-06-28

Owner: DRA Habitat authority-tree workstream

Durability: standalone frame for continuing the authority-tree initiative
across branches, agents, compactions, and review loops.

## Purpose

This frame governs how we continue the Habitat authority-tree work now that
the execution-support cleanup has mostly landed and the work has shifted into
ontology-guided shaping.

It is not a history log, a project plan, or a list of all remaining tasks. Use
it as the shared lens for deciding what matters, what to ignore, how to choose
the next domino, and how the agent should carry ownership without requiring the
user to repeatedly extract the obvious next move.

## Source Pointers

- `.habitat/AUTHORITY.md` defines what is authoritative in the current tree.
- `.habitat/AUTHORITY-ONTOLOGY.md` defines the normative conceptual model.
- `.habitat/AUTHORITY-TREE-SHAPE.md` defines the current transitional physical
  tree.
- `.habitat/.active/frames/FRAME.md` defines the authority-tree pruning lens and source order.
- `.habitat/.active/dominoes/README.md` records the working ratchet sequence.
- Graphite stack top at creation: `codex/habitat-domino-framing-document`,
  stacked above `codex/habitat-authority-ontology-polish`.

## WHAT

This frame treats the remaining Habitat work as a sequence of authority-shaping
dominoes. A good domino narrows future states: it removes ambiguity, moves a
real authority surface to its correct owner, deletes a misleading bridge,
admits a proper concept, or creates a proof rail that makes the next move more
mechanical. The primary signal is not how many files changed, how much history
was summarized, or how many rows were logged; the signal is whether the next
agent can act with less guessing and whether the repository's Habitat model is
more truthful after the move.

## WHY

The previous phase proved that Habitat can become a reliable authoring SDK and
application for defining repository structure, but only when execution
mechanics, authority content, ontology, and proof are kept distinct. A
structurally different frame would treat the next work as backlog burn-down:
pick the next stale file, clean it, and repeat. That would preserve the old
failure mode under better tooling. This frame instead treats every branch as a
ratchet in the authority model: the agent owns finding the next meaningful
move, proving it, and leaving a cleaner decision surface for the next turn.

## Selection Commitments

In:

- The current `.habitat` authority tree, including transitional packet shape,
  ontology docs, category/kind metadata, support islands, and proof ledgers.
- The Graphite stack as the live sequence of reviewable authority dominoes.
- User corrections that reveal the real frame, especially when a completed
  slice gathered data but did not make a decision easier.
- Review findings from focused agents when they expose ontology, ownership, or
  proof drift.
- Tooling and tests only as evidence for claims they actually exercise.

Foreground:

- Domino quality: did the move reduce future states and make the next move more
  obvious?
- Ontology before layout: physical paths are evidence and projection until the
  conceptual owner is clear.
- Owner truth: every kept surface should have a clear authority owner,
  forbidden owner, proof class, and mutation shape.
- Collaboration ownership: the agent should frame, choose, and drive the next
  concrete move unless a sealed user decision is genuinely required.
- Review loops as pressure, not ceremony: P1/P2 findings repair the branch
  before dependent work stacks on top.

Exterior:

- Exhaustive session history as the deliverable. History supports the frame; it
  is not the frame.
- Broad roadmap creation disconnected from a next testable authority move.
- Scans, ledgers, and reports that do not feed a decision, deletion, movement,
  admission, or proof rail.
- Final physical manifest/schema design unless the active domino is explicitly
  a schema/design workstream.
- Treating current file names, runner names, check names, or old defect labels
  as ontology.

## Hard Core

Violating any of these forces a reframe:

1. A domino must make the following work simpler or more mechanical. If it only
   records more uncertainty, it is not a completed domino.
2. The current ontology governs interpretation: Habitat, blueprint, instance,
   capability, and niche are conceptual owners; category, kind, and packet are
   current pruning axes.
3. Execution mechanics do not become authority because they run. Toolkit,
   scripts, Nx, Grit, package checks, and generated analytics are evidence or
   adapters unless a Habitat authority record admits the concept.
4. Proof classes stay separate. Static checks, generated analytics, local test
   suites, Graphite submission, PR state, runtime proof, and product proof are
   different claims.
5. The agent owns the next move. The user should not have to ask repeatedly
   what moved forward, what is next, or whether a gathered corpus actually
   changed the decision surface.

## Protective Belt

These may change without reframing:

- Exact branch names and commit grouping.
- Whether a slice is docs-only, code-only, or mixed.
- Whether a frame, worksheet, corpus, or review ledger is the right supporting
  artifact for a particular domino.
- The current physical folder projection while final manifest and schema design
  remains open.
- The size of a domino, as long as it has a bounded proof and leaves the
  worktree clean.
- Which focused review agents are used for ontology, architecture, proof, or
  information-design pressure.

## Operating Commitments

When taking a new turn in this initiative:

- Start in the correct Habitat worktree and branch. Do not work from the dirty
  root checkout or an unrelated MapGen Studio branch.
- Use the ontology docs to classify the problem before touching files.
- Name the next domino in terms of the state it will reduce, not the files it
  will edit.
- Prefer one complete vertical move over another broad preparatory artifact.
- Keep branch layers small enough for Graphite review, but large enough to tell
  a complete authority story.
- If a scan or corpus is needed, predeclare the decision it will enable and do
  not call the scan complete until that decision is made or explicitly blocked.
- Before closure, label what was proved and what was not proved.

## Review And Polishing Standard

Use review to attack the frame, not to decorate it.

Ask reviewers to look for:

- ontology drift: folder names or runner labels becoming concepts;
- hidden broadness: a domino that is actually a vague workstream;
- proof inflation: a local check described as stronger than it is;
- decision evasion: evidence gathered without acting on the decision it enables;
- user-dependence: places where the agent is still waiting for the user to name
  the obvious next step.

Accepted P1/P2 findings block closure until repaired, rejected with source
evidence, or resolved by explicit user decision.

## Reframe Conditions

What would force a reframe:

If two consecutive Habitat domino turns end with the user needing to ask what
actually moved forward or what the agent thinks is next, this frame has failed
its collaboration hard core and must be revised before more implementation
continues.

Degeneration trigger:

If three branches in this line add reports, ledgers, categories, or docs without
deleting, moving, admitting, proving, or demoting a concrete authority surface,
pause and run a reframe pass against this document.

## Current Landing Point

The execution-support cleanup is no longer the center of gravity. Source-check
has been retired, structure-check exists, mixed command-check extraction has
closed, triage packets are gone, and residual owners were moved or retained
honestly.

The current center of gravity is ontology-guided authority shaping. The next
useful dominoes should apply the polished ontology back to the live tree:
identify surfaces that are pretending to be blueprints, packets that only exist
because of historical runner shape, metadata that duplicates conceptual
authority, and compatibility bridges that should now be removed, demoted, or
turned into explicit manifest-era design work.

## Not How

This frame deliberately does not prescribe the next branch's exact edit list.
The next branch should derive its worksheet from this frame plus the current
tree, current stack, and fresh proof state.
