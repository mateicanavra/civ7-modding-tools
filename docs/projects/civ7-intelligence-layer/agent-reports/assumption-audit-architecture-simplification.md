# Assumption Audit: Architecture Simplification

Agent: Mencius
Lane: architecture and complexity audit
Date: 2026-06-03
Status: DRA-captured report from peer-agent final output

## `/goal` Objective

Challenge the current Civ7 intelligence-layer architecture for unnecessary
bridge-shaped complexity, unclear ownership names, and hidden third authority
lanes. Recommend a simpler model that still preserves the desired live AI
influence over Civ7.

## Sources Inspected

- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/actuation-path-map.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/src/orpc/router.ts`
- `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`

No live-game mutation was performed.

## Executive Conclusion

The current frame is directionally right but too bridge-shaped. The companion
mod should not be modeled as a third authority surface beside direct-control
and the static profile compiler. The canonical architecture is simpler:

1. External action-control side: observe, validate, send, and verify through
   `@civ7/direct-control`.
2. Native policy side: compile and load static AI profiles, then measure
   behavior.
3. Optional in-game UI endpoint: a subordinate App UI surface for annotations,
   snapshots, acknowledgements, and probes.
4. Corpus, proofs, and metrics cut across both sides.

This model removes most special-case pressure while staying aligned with the
direct-control package that already owns runtime transport.

## Challenged Assumptions

### Companion mod as peer execution lane

Status: `eliminated`.

The docs already say companion scripts must not own gameplay sends, because
that would bypass direct-control approval and postcondition discipline. That
makes the companion path an auxiliary App UI endpoint, not a peer execution
adapter.

Product implication: the endpoint can display, acknowledge, snapshot, and maybe
later assist under direct-control-owned approval. It must not become a stealth
alternate control plane.

### "Bridge" as architecture center

Status: `eliminated`.

The missing product layer is not "the bridge." The real product layer is the
decision-and-evidence loop across two sides: live direct-control action and
static native policy shaping.

Product implication: keep bridge language implementation-scoped. The main
architecture should describe authority, not transport metaphors.

### Sender, tuner, game, or controller service naming

Status: `eliminated`.

`@civ7/direct-control` already owns the runtime boundary. App UI and Tuner are
state surfaces, not separate services. "Sender service" incorrectly splits
reads, validation, sends, and verification, which belong together. "Game
service" is too broad. "Tuner service" is false because App UI is load-bearing.

Recommended nouns:

- `direct-control`
- `strategy director`
- `agent-turn runner`
- `static profile compiler`
- `companion App UI API`
- `companion UI endpoint`

### Approval outside direct-control

Status: `eliminated`.

Approval is enforced at the direct-control procedure boundary and in concrete
mutating wrappers. The companion endpoint should never own approval decisions.

### Universal postcondition subsystem

Status: `eliminated`.

Postconditions live in specific wrappers. Some direct-control wrappers have
explicit before/after proof; generic operation requests are weaker and should
not be treated as rich semantic outcome deltas.

### Queue and `localStorage` as baseline

Status: `eliminated`.

The baseline should be synchronous direct App UI RPC. `localStorage` is useful
as a reload mirror or async probe, but it carries collision risk and is not
needed as the first architecture now that a callable App UI global is plausible.

## Recommended Model

Use this as the canonical frame:

- `@civ7/direct-control` is the repo-owned runtime control boundary.
- The intelligence layer has two product authority sides:
  - live external play through direct-control;
  - static native-AI shaping through generated profiles.
- The companion mod is an App UI endpoint attached to the live side.
- Corpus, proofs, and metrics span both sides.

If the implementation keeps `globalThis.Civ7IntelligenceBridge` as the symbol,
that is acceptable. It should not make "bridge" the top-level architecture
metaphor.

## Eliminated Complexity

- Four operating layers as the primary architecture story.
- Three peer execution adapters with the companion endpoint beside the two real
  authority sides.
- Up-front queue protocol claims.
- Generic service names that hide actual ownership.
- Any implication that approval or postconditions live outside direct-control.
- Any implication that companion App UI code is a safe replacement for
  validators.

## Residual Unknowns

- Hotseat remains the real unlock for mixed human/agent play, but it is still
  proof-gated.
- Generic direct-control operation postconditions are weaker than the solution
  docs previously implied.
- A project-owned companion endpoint still needs lifecycle proof across shell,
  game, reload, restart, save/load, and turn changes.
- Age-transition profile layering is still a probe.
- It is unproven that async queueing is needed once direct App UI RPC exists.

## Product Implication

The architecture should be framed as two-sided authority with one subordinate
in-game endpoint. A richer in-game controller can be a future target, but it
must graduate through proof instead of being assumed because it is attractive.
