# Domain-Root Topology Rule Revalidation Workstream Draft

Status: draft instance input for `POST-RATCHET-RULE-REVALIDATION-FRAME.md`.

Purpose:
define the first concrete post-ratchet rule revalidation pass. The reusable
frame supplies the method; this draft supplies the domain-root topology
instance context, admission tests, agent lanes, stop conditions, and proof
shape.

## Ratchet Event

Name: Domain-Root Topology Ratchet

Closure premise:
domain/root/topology consolidation was finalized and enforced. The descent
ratcheted current positive law into Habitat. Rules in that blast radius now
need revalidation against the new authority surface.

Current closure evidence to reconfirm before per-rule disposition:

```bash
bun habitat check --json --rule require_domain_source_topology
bun habitat check --json --rule require_domain_ops_binding_surface
bun habitat check --json --rule require_domain_ops_registry_surface
bun habitat check --json --rule require_domain_operation_contract_file_shape
bun habitat classify .habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology
```

Ratcheted authority surfaces:

- `require_domain_source_topology`
- `require_domain_ops_binding_surface`
- `require_domain_ops_registry_surface`
- `require_domain_operation_contract_file_shape`

Related positive-law rows admitted by the prior grounding pass:

- `require_artifact_file_shape`
- `require_artifact_index_aggregate_shape`
- `require_domain_model_schema_policy_owner_shape`
- `require_recipe_stage_authoring_file_shape`

Those related rows are contextual neighbors, not automatic inputs to this
first pass. Admit them only if the source evidence ties the rule to domain-root
topology or operation-surface authority.

## Instance Scope

In scope:

- Live Habitat rules whose manifest, pattern, baseline, evidence record, or
  source target names domain roots, domain source topology, domain operation
  roots, retired domain-root catalogs, root facades, domain source imports, or
  operation-surface topology.
- Rules whose original purpose was to contain drift now addressed by the
  ratcheted domain-root topology or domain operation surface rules.
- Rules whose selector, manifest, baseline, pattern, or current evidence names
  a domain-root topology surface touched by the completed descent.

Out of scope:

- Rules outside that blast radius, even if they look stale.
- Runtime, generated-output, Studio, package, or docs rails unless the rule
  also carries domain-root topology authority.
- Broad rule cleanup, label normalization, runner migration, baseline growth,
  or source movement.

## Admission Tests

Admit a rule into this instance pass only if at least one test is true:

1. The rule id, manifest, pattern, baseline, or evidence record references a
   domain-root topology surface: domain root, retired domain catalog, domain
   source topology, domain operation root, root facade, domain source import,
   or operation-surface topology.
2. The rule's source scope overlaps files governed by the completed descent and
   the rule's selector, manifest, pattern, baseline, or current evidence names
   one of the topology surfaces above. Source path overlap alone is not enough.
3. Current manifest, pattern, baseline, source, or command evidence confirms a
   transitional containment concern that the ratcheted domain-root topology
   authority may now absorb. Historical rationale alone is not admission
   evidence.
4. Static source inspection shows the rule can fire only because of shapes now
   owned by the ratcheted topology authority.

If none are true, the per-rule record should be `out of scope`.

## Likely Overlap Lanes

These are hypotheses for pre-filtering and review. They do not settle any row
disposition.

1. Domain topology and fossil guards:
   `require_domain_source_topology` likely overlaps with retired-domain-root,
   retired domain `artifacts.ts` modules, and older domain topology guards.
2. Domain operation surfaces:
   `require_domain_ops_binding_surface`,
   `require_domain_ops_registry_surface`, and
   `require_domain_operation_contract_file_shape` likely overlap with
   config-bag, root config facade, contract-root, and operation-local negative
   guards.
3. MapGen artifact owner surfaces:
   `require_artifact_file_shape` and
   `require_artifact_index_aggregate_shape` may absorb some old artifact alias,
   tag, and validation-owner concerns, but generated recipe output parity and
   currentness remain a separate proof class.
4. Recipe-stage authoring:
   `require_recipe_stage_authoring_file_shape` may overlap with wrapper-only
   advanced config, stage config bag, sentinel passthrough, and standard public
   authoring-surface checks.
5. Runtime/build/generated-output rails:
   rules that mention runtime, adapter, generated output, `dist`, or currentness
   need proof-class review before deletion. Many likely belong in Nx,
   package-local validation, generated-output protection, or file-layer rails
   rather than this semantic pass.

## Instance Decision Notes

Use `POST-RATCHET-RULE-REVALIDATION-FRAME.md` for each admitted rule.

For this instance:

- Absorbing authority must be one of the ratcheted domain-root topology or
  domain operation surface rules, or a named existing owner surface directly
  connected to them.
- A deletion record must identify the old domain-root or operation-surface
  shape and the ratcheted authority that now catches it.
- If proof belongs to generated-output, runtime, Studio, package validation, or
  another native rail, return `out of scope` unless the rule also has a
  domain-root topology clause that can be separately dispositioned.

## Proof Commands

Closure proof commands are listed above and must be rerun before the first
per-rule batch. Per-rule proof depends on the accepted `actionDecision`, but
the instance proof menu is:

```bash
bun habitat check --json --rule <candidate-rule-id>
bun habitat check --json --rule require_domain_source_topology
bun habitat check --json --rule require_domain_ops_binding_surface
bun habitat check --json --rule require_domain_ops_registry_surface
bun habitat check --json --rule require_domain_operation_contract_file_shape
bun habitat classify mods/mod-swooper-maps/src/domain
git diff --check -- .habitat
```

Deletion-oriented dispositions also need an explicit old-shape proof: either
an injected violation proof that the ratcheted authority catches the old shape,
or a recorded reason why the old shape is retired residue with no live
recurrence risk.

## Execution Workstream Shape

1. Pre-filter lane:
   read live manifests, patterns, baselines, evidence records, and source
   scopes to admit only rules touched by domain-root topology closure.
2. Per-rule analysis lanes:
   assign one admitted rule group per fresh read-only agent. Each agent applies
   `POST-RATCHET-RULE-REVALIDATION-FRAME.md` and returns compact rule records.
3. Synthesis lane:
   the DRA owner reconciles agent records into the ledger ontology, rejects
   unsupported dispositions, and identifies the first mutation slice.
4. Review lane:
   a separate fresh review team checks admission, action-decision choice,
   residual-risk claims, owner-layer claims, vocabulary collisions, and
   proof-class adequacy.
5. Implementation lane:
   only after review, a separate implementation group executes the accepted
   mutation slice. Implementation agents must not be reused as reviewers.

Each lane is bounded. No agent owns synthesis, authority calls, Graphite state,
or closure claims except the DRA owner. Rule mutation begins only after a
reviewed disposition set identifies the smallest safe domino.

## Batch Degeneration Trigger

If three admitted rules in one batch require proof classes outside domain-root
topology, domain operation surfaces, or source topology, stop the batch and
reframe the slice boundary before more per-rule analysis proceeds.

## Expected Output

The workstream should produce:

- pre-filtered admitted rule set with excluded-neighbor notes;
- one compact revalidation record per admitted rule;
- synthesis into existing ledger action vocabulary;
- review disposition for P1/P2 findings;
- first mutation-slice recommendation, or an explicit no-mutation result if no
  safe domino is proven.

No implementation is authorized by this draft alone.
