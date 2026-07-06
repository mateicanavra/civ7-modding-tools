# Decision Packet 003: Contract Quality Owner

Status: open; awaiting user ruling

Question:
who owns operation contract schema metadata law — which surface enforces that
contract schemas carry `description:` metadata (and any future quality bar)?

Why this is nondeterministic:
the corrective audit split `validate_ecology_op_contract_quality` into three
clauses with different fates: the schema-description clause is real quality
pressure with no accepted owner ("schema metadata policy must be
source/package-verify owned before mutation"); the exported-function JSDoc
clause and the stale `recipes/standard/stages/ecology/steps` path clause are
not domain-operation invariants and should delete. The open question is only
the owner of the surviving clause.

Evidence (2026-07-06):

- 95 of 101 operation contracts already carry `description:` metadata; the
  bar is de facto met;
- the six gaps: `foundation/ops/compute-hotspot-events`,
  `compute-segment-events`, `compute-tectonic-provenance`,
  `compute-tectonics-current`, `compute-tracer-advection`, and
  `placement/ops/plan-wonders` (each `contract.ts`);
- the current enforcement is an ecology-only script mixing all three clauses;
- contracts are TypeBox schemas consumed by the op registry and Studio; the
  metadata has runtime-visible consumers, which is why a source-owned check is
  plausible.

Options:

(i) package-verify owned: a check in the owning package's verify/test surface
asserts every registered operation contract carries the metadata.
Consequence: quality law lives beside the code it governs, runs in the
package's own gate, and can read the registry (typed, complete coverage by
construction); Habitat routes to it rather than duplicating it. Matches the
audit's direction and the house tool-separation authority (behavior and
schema-value checks are native-rail territory).

(ii) Habitat pattern rule: a Grit pattern over `contract.ts` files.
Consequence: enforcement sits with the other shape law, but a text-level
pattern asserting schema metadata is brittle (metadata can be composed,
spread, or imported) and duplicates what the registry can verify natively.

(iii) generator-owned: contract scaffolding emits the metadata and a
generator-currentness check keeps it.
Consequence: strongest ergonomics, but there is no operation generator today;
this option creates tooling scope this descent does not want.

Recommended default: (i) package-verify owned, with Habitat's role limited to
routing (the existing ecology rule deletes; no Habitat replacement rule).
The six gap contracts get their metadata completed as mechanical rows under
the new check.

Seal target once ruled:
the ruled owner gains the check; the six gap rows in `ledger.md`
flip to defined destinations; `validate_ecology_op_contract_quality` splits —
surviving clause to the ruled owner, JSDoc and stale-path clauses deleted —
and the rule id retires after survivor proof.

Escalation:
if the ruled owner cannot express the check without weakening it (for
example, package verify cannot see unregistered contracts), reopen with that
evidence rather than silently downgrading the bar.
