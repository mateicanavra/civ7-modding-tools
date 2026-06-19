# Design: D15 Execution Provenance Trigger

## Frame

D15 Execution Provenance Trigger is a downstream implementation-control packet
derived from `D15-execution-provenance-substrate-trigger.md`. The packet is
complete only when it leaves later execution agents with no product, domain,
naming, sequencing, public-surface, or validation decision to invent.

The existing packet is input, not output. Current Habitat code is
present-behavior records. This design chooses target language from Habitat's
generic repo-maintenance product scenarios rather than preserving accidental
module or DTO names.

## Domain Boundary

- Owner: Command Observation Trigger.
- Primary scenario: A consuming packet reaches command-observation complexity
  that local TypeScript DTOs cannot model without contradictory states, and
  Habitat needs an explicit trigger before adopting shared command-observation
  substrate work.
- Adjacent domains consume this packet through explicit contracts and may not
  recreate its decisions locally.

## Target Contract

- Define trigger conditions for a shared command-observation substrate decision.
- Require packet-local DTO sufficiency review before any standalone substrate
  work.
- Document why D15 is a trigger, not default implementation.

## Non-Goals

- No unbounded Effect migration.
- No standalone substrate unless a consuming packet proves necessity.
- No generic record expansion.

## Naming And Language Decisions

- Use standard engineering terms that name the actual workflow object:
  receipts, checks, diagnostics, guard decisions, transactions, refusals,
  recovery instructions, metadata, command outcomes, and handoff
  records.
- Treat inherited verification-record-shaped code names as compatibility facts
  unless this packet explicitly accepts them as target language.
- Treat `Execution Provenance` and `substrate` as inherited packet labels or
  implementation-control shorthand. Target domain language is command
  observation; shared substrate means only a future accepted typed
  command-observation contract after `trigger-accepted`.
- Do not create generic record machinery when a command result,
  receipt, or diagnostic contract serves the scenario.

## Trigger State Model

D15 has four allowed design states:

- `dormant`: no accepted consuming packet has recorded an unrepresentable
  command-observation state. No D15 source work is authorized.
- `trigger-requested`: a consuming packet names the command family, observed
  contradiction, local DTO alternative, affected public surfaces, validation
  gates, and owner boundary, but the D15 substrate packet is not yet accepted.
- `trigger-accepted`: a separate accepted OpenSpec change owns the bounded
  command-observation substrate for the named command family.
- `trigger-rejected`: final review accepts that the request is complete but the
  named state is representable by local DTOs/contracts; the consuming packet
  records the rejection and D15 returns to `dormant`.

The accepted upstream packets currently leave D15 dormant:

| Consumer | Current D15 status | Reason |
| --- | --- | --- |
| D6 Diagnostic Pattern Catalog | dormant | D6 records D15 only if diagnostic command observations cannot be represented by D6-local contracts. Its accepted design does not trigger shared substrate work. |
| D7 Structural Enforcement Pipeline | dormant | D7 records D15 only if check pipeline command/cache/cwd/env/output states cannot be represented locally. Its accepted design does not trigger shared substrate work. |
| D9 Transformation Transaction | dormant | D9 records D15 only if transaction records cannot represent dry-run/apply/rollback command observations locally. Its accepted design does not trigger shared substrate work. |
| D11 Hook Runtime | dormant | D11 records D15 only if hook-runtime observations cannot be represented by D1/D3/D6/D7/D9/D10 contracts. Its accepted design does not trigger shared substrate work. |
| G-HOST Host Policy Boundary Gate | dormant | G-HOST records D15 only if host-policy implementation discovers a local command-observation contradiction. Its accepted design does not trigger shared substrate work. |

## Trigger Request Contract

A consuming packet may request D15 only by recording all of:

- command family and owner packet;
- concrete contradictory state reachable with local DTOs;
- exact local DTO or contract alternative attempted or rejected;
- local DTO sufficiency record containing the attempted discriminated union,
  typestate, or contract shape; the contradiction that remains representable;
  a negative fixture or typed example; the safe TypeScript alternatives rejected
  such as discriminated-union input, exhaustive tagged result handling,
  DTO/domain separation, boundary parsing, or typed error values; and the
  proposed shared discriminants that make the contradiction unrepresentable;
- required command observation fields: argv, cwd, env subset, git state, cache
  status, output bounds, duration, and command family failure states, limited to
  the fields the scenario actually needs;
- field-level owner map for each requested command-observation field,
  naming the owner packet or explaining why the future shared
  contract owns that field only because local ownership failed;
- public/durable surface impact, concrete D0 compatibility rows, and D1
  output-family/support-boundary handling for every touched public command, JSON,
  export, script, target, generator, hook, doc, or example;
- write/protected set for any source change;
- validation gates that falsify the contradiction;
- rollback plan if a shared substrate proves unnecessary or harmful.

Missing any required item keeps D15 dormant. A prose-only claim that local DTOs
are insufficient is not a trigger request.

## Later Trigger-Accepted Implementation Readiness

This section applies only after a consuming packet has moved D15 from `dormant`
to `trigger-accepted` through the trigger request contract. Before
implementation starts, the executor must have:

- D0 compatibility disposition for every public command, JSON, package export,
  script, target, generator, hook, doc, and example surface touched by this
  packet.
- D1 output-family and support-boundary handling for every public receipt, diagnostic,
  transaction, handoff, hook, or command-observation field.
- A concrete write set and protected path list.
- A protected-set decision covering generated outputs, lockfiles unless
  regenerated by owning scripts, `.git/`, `.civ7/outputs/resources`,
  `.grit/cache/`, `dist/`, `node_modules/`, `tools/habitat-harness/dist/`, and
  any owning packet's protected/generated zones.
- Tests and command gates from this packet copied into the phase record.
- Review findings dispositioned with accepted P1/P2 repaired.

## Review Lanes

- Domain-language adversary: names, owner, responsibility, and inherited terminology.
- OpenSpec packet review: proposal/design/tasks/spec consistency and shortcut
  language.
- TypeScript state-space review: invalid states removed without type machinery
  that exceeds the product need.
- Testing/validation review: gates are falsifying, scenario-grounded, and have
  exact command expectations.
- Cross-domino review: dependencies, public-surface compatibility, and
  downstream realignment.

## Structural Alternative Rejected

The rejected alternative is to treat existing Effect/process code as a mandate
for shared substrate work. That would preserve accidental composition and add
reachable states before naming the contradiction being removed. D15 only opens
when an accepted consuming packet records the exact local DTO insufficiency.

## Shared Substrate Serialization

D15 is not a default substrate migration. If D6, D7, D9, D11, or G-HOST triggers
a need for shared command-observation code, the shared substrate must move into one
sequential owner packet with a separate OpenSpec decision before implementation.
Other packets either consume that owner packet after closure or keep command
observations inside packet-local DTOs.
