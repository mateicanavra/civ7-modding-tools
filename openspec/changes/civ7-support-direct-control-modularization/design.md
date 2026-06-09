## Design

This workstream uses two coupled but separately verified migrations:

- **CLI play ownership migration:** convert the remaining monolith-owned command
  tests into focused files under `packages/cli/test/commands/game/play/**`.
- **Direct-control atom migration:** after focused tests exist, split stable
  runtime atoms out of the large direct-control `index.ts` into named package
  modules with explicit public types/constants.

Effect/oRPC composition is intentionally last. It consumes direct-control atoms
through typed procedure cores; it does not own raw socket state, raw JavaScript
command strings, or gameplay mutation logic.

## Systematic Corpus

### CLI Command/Test Corpus

The CLI play corpus includes:

- no remaining `packages/cli/test/commands/game.play.test.ts` monolith command
  owners after the priorities slice;
- already extracted owner suites under `packages/cli/test/commands/game/play/**`;
- adjacent package-local play suites such as production, narrative, culture,
  technology, first-meet, operation wrappers, end-turn, population placement,
  town focus, unit target, progression read, tactical read, watch, topics,
  promotion readiness, rehydrate, settlement recommendations, ready city,
  unit move preview, ready unit, notification queue, dismiss queue, exact
  dismiss, notification HUD, and priorities;
- fake tuner fixture ownership and local owner-specific scenario builders.

Every corpus row needs:

- command owner;
- current test file;
- target test file;
- fixture dependency;
- mutation/read-only proof class;
- focused suite command;
- adjacent monolith filter;
- removal branch;
- validation status.

### Direct-Control Atom Corpus

The direct-control corpus includes:

- tuner socket/session/framing and state-role selection;
- JSON command execution and error shaping;
- play notification/HUD view materialization;
- notification dismissal and closeout verification;
- ready unit and ready city views;
- operation validation/send/postcondition helpers;
- tactical, progression, settlement, destination, battlefield, and target reads;
- map, visibility, GameInfo, setup/lifecycle, autoplay, turn-completion, and
  runtime root inspection surfaces;
- component ID, schema/type ownership, constants, and public exports;
- future procedure-core candidates for control-oRPC.

Every atom row needs:

- source region in `packages/civ7-direct-control/src/index.ts`;
- proposed module owner;
- public/private exports;
- existing tests;
- required new tests;
- runtime-proof requirement;
- consumers in CLI/Studio/oRPC.

## Parallel Execution Model

Every delegated lane starts from a framed objective. The spec owner must decide
whether the agent is a short report-only peer, a long-running investigation, or
an implementation lane before sending instructions.

Long-running investigation or implementation agents receive a `/goal`-prefixed
prompt with context, required skills, objective, write permissions, proof
expectations, and return shape. Existing threads are reused only when their
prior context is intentionally useful; if the topic changes, the spec owner
sends `/compact`, waits for completion, and only then sends the new frame.

### Lane A: Systematic Spec Owner

Write set:

- `openspec/changes/civ7-support-direct-control-modularization/**`
- downstream project workstream records when facts change

Responsibilities:

- maintain corpus ledgers and task status;
- receive agent reports;
- decide lane sequence;
- keep proof labels honest;
- run OpenSpec validation.
- own all Graphite sequencing decisions for this change; other agents report
  findings or contribute non-overlapping files but do not independently mutate
  the support stack without coordination.

### Lane B: Net-New CLI Suites

Write set:

- new files under `packages/cli/test/commands/game/play/**`
- `package.json` `test:cli:play` additions

Responsibilities:

- create focused owner suites before monolith removal;
- use local fakes or named fixtures only when ownership is explicit;
- do not remove monolith tests in this lane unless it also owns the extraction
  closure.
- avoid touching `package.json` unless the spec owner has assigned that file for
  the current slice.

### Lane C: Monolith Removal / DRA Integration

Write set:

- `packages/cli/test/commands/game.play.test.ts`
- `package.json` only when wiring/removing suites

Responsibilities:

- remove exactly the coverage already recreated in Lane B;
- remove obsolete monolith fixture branches only when no remaining monolith test
  uses them;
- run adjacent monolith filters and ownership scans;
- keep each Graphite branch small.
- act as the only writer to `packages/cli/test/commands/game.play.test.ts` for
  the active slice.

### Lane D: Direct-Control Atom Planning

Write set:

- OpenSpec corpus/design/task artifacts first
- direct-control source only after CLI tests stabilize and tasks authorize it

Responsibilities:

- propose module boundaries and public exports;
- identify constants/types to export after reviewing user TODO stashes;
- define runtime proof requirements;
- avoid source edits until focused direct-control tests exist.

### Lane E: Review / Gate Lane

Write set:

- review-disposition ledgers and acceptance packets

Responsibilities:

- audit authority, proof, ownership, and relationship-label invariants;
- independently rerun required gates before accepting closures;
- nudge before bad commits, not after.

## Sequencing

1. Import systematic skill and open this OpenSpec change.
   - Done in two Graphite layers:
     `0abccba10 docs(skills): add systematic workstream skill` and
     `66f9af202 docs(skills): apply systematic workstream review fixes`.
2. Fill CLI and direct-control corpus ledgers from current disk.
3. Define shared fixture strategy before extracting more notification/priorities
   suites.
4. Complete remaining CLI test ownership slices:
   - exact notification dismissal;
   - notification HUD materialization;
   - priorities compact projection;
   - any residual monolith fixture ownership.
5. Only after focused tests own behavior, extract direct-control atoms:
   - notification materialization;
   - notification dismissal verification;
   - ready views;
   - operation validation/send/postconditions;
   - read-only tactical/progression/destination surfaces;
   - schemas/types/constants.
6. Import or explicitly cite the oRPC architecture skill/source authority from
   the relevant stack branches.
7. Add Effect/oRPC procedure cores over stable atoms.

The current support branch does not track
`.agents/skills/civ7-orpc-control-architecture` or `packages/civ7-control-orpc`.
The oRPC lane is therefore planning-only here until that authority is imported
or cited, and it remains downstream of direct-control atoms.

## Proof Boundaries

- Test-only extraction proves local CLI test ownership, not runtime behavior.
- Direct-control source movement proves no behavior change only when direct
  package tests/check/build and focused CLI tests pass.
- Mutation-facing runtime behavior requires support-owned real-game proof when
  Civ7 is responsive, or explicit `pending-runtime-proof`.
- OpenSpec validation proves artifact shape only.

## Review Lanes Required

- Architecture review for package/module ownership and forbidden owners.
- Product/proof review for player-unblocking behavior and proof labels.
- Verification review for tests, filters, ownership scans, and runtime proof.
- Relationship-label review for every tactical/diplomatic/notification surface
  that could imply hostility, war, opponent, ally, or suzerain.
