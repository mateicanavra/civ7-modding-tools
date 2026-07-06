# Decision Packet 001: Strategy Container Law

Status: open; awaiting user ruling

Question:
must every operation root contain a `strategies/` directory, or is an inline
single implementation a valid operation shape?

Why this is nondeterministic:
the survivor structure law marks `strategies` as allowed, not required. The
ecology exemplar rule requires it for ecology only. Source authority
(`SPEC-step-domain-operation-modules`, ADR er1-031 strategy-config-encoding)
treats strategies as implementations selected by the operation contract, but
does not state whether a single-implementation operation must still route
through the container. Current source is split: 92 of 101 operations have
`strategies/`; 9 do not.

Evidence (2026-07-06):

- the nine operations without `strategies/` are all foundation `compute-*`:
  `compute-crust-evolution`, `compute-crust`, `compute-mantle-forcing`,
  `compute-mantle-potential`, `compute-mesh`, `compute-plate-graph`,
  `compute-plate-motion`, `compute-plates-tensors`,
  `compute-tectonic-segments`;
- every one of those nine contracts declares a strategy envelope (grep
  `strateg` in each `contract.ts`: all nonzero) — the contract surface already
  models strategy selection even where the container is absent;
- operation kind does not discriminate: 76 contracts declare `kind: "compute"`
  and most of those do have `strategies/`;
- 83 of the 92 existing `strategies/` directories are exactly
  `default.ts + index.ts`, so the single-strategy wrap is already the dominant
  idiom.

Options:

(a) `strategies/` required for every operation.
Consequence: nine mechanical wraps in foundation (move the inline
implementation into `strategies/default.ts`, add `strategies/index.ts`). One
uniform shape; the exemplar rule's strongest clause generalizes cleanly; no
exemption grammar. Blast radius: nine operations, no behavior change.

(b) inline single implementation allowed as an alternate closed shape.
Consequence: two valid operation shapes forever; the structure law needs an
either/or expression; every future tool, generator, and agent must handle
both; the contract-declared strategy envelope and the missing container
disagree in nine places.

(c) keyed to operation kind (for example, computes may inline).
Consequence: rejected by evidence — most computes have `strategies/`, so kind
does not predict the shape; this option would encode an accident as law.

Recommended default: (a).
Uniformity is cheap here (nine wraps), the contracts already declare strategy
envelopes, and one closed shape is exactly the kind of positive assertion this
initiative exists to make.

Seal target once ruled:
`.habitat/scopes/domain/scopes/ops/scopes/operation/scope.md` moves
`strategies` from allowed to required (or records the alternate shape);
the survivor `structure.toml` operation-roots scope updates to match; row D
in `ledger.md` flips to defined destinations.

Escalation:
if any of the nine wraps turns out to require a behavior-bearing change (not a
pure move), stop and record it as law back-talk against this packet.
