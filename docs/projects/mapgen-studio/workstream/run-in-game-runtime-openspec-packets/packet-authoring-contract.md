# Packet Authoring Contract

Status: active guidance for the Run in Game runtime packet train

This contract applies to every OpenSpec packet produced by this workstream.

## Behavior Verification

Behavior tests cover observable product and code behavior only:

- public API accepts and rejects the right inputs;
- public status and error projections expose the right safe shape;
- operation phases, cancellation, terminalization, diagnostics lookup, and
  runtime launch outcomes behave correctly;
- generated artifacts, deployment copies, runtime observations, and attribution
  records contain the expected runtime data;
- live verification, when required, demonstrates the user-facing Run in Game
  flow.

Do not add behavior tests whose purpose is to search for deleted names, legacy
keys, former env vars, old file paths, retired entrypoints, or old topology.

Every packet uses the same command-selection rule:

1. Run `bun run openspec -- validate <change-id> --strict`.
2. Run `bun habitat classify <diff-or-packet-write-set>`.
3. Run every Habitat/Nx/Biome/Grit command reported by classify.
4. Run packet-specific behavior tests named in the packet.
5. For the final closure packet, also run `bun run openspec:validate` and the
   live Run in Game verification contract from `target-vocabulary.md`.

## Structural Enforcement

Structural and topological requirements are enforced with Habitat/Grit authority
rules or existing Habitat boundary mechanisms. Packets phrase permanent
structure as positive assertions:

- the public Run in Game contract has this exact closed schema owner and shape;
- launch source resolution has this owner and these input/output contracts;
- request generation has exactly one manifest input;
- request artifacts write under exactly one request workspace root;
- catalog generation reads exactly one catalog source index;
- deployment copies from this generated mod root to this deployed mod identity;
- diagnostics and attribution are available only through explicit lookup
  records.

The rule should assert the desired shape directly. Avoid encoding permanence as
"old string X is absent" unless the rule is a temporary transition pattern.

## Grit Pattern Work

When a packet requires a Grit rule, it must specify:

- lifecycle: candidate, registered advisory, registered enforced, or removed;
- owner surface and scan roots;
- positive assertion;
- fixture strategy: positive examples, negative examples, parser edge cases,
  and false-positive controls;
- current-tree scan result: zero findings, accepted baseline, or blocker;
- baseline/introduction contract;
- hook-scope decision;
- promotion or removal condition.

Temporary rules exist only to control a transition hazard. Permanent rules
encode the target topology and become part of the architecture.

## Optionality

`optional` means an intentionally supported product or code capability with a
declared contract. It never means ad hoc data, unmanaged records, raw catch-all
fields, or best-effort topology.

If a concept does not deserve first-class support in this packet train, exclude
it and state the supported contract without an optional hole.
