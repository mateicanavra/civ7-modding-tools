# D1 Domain/Ontology Investigation

## Scope

This is a domain/ontology lane investigation for D1 Receipt Contract Boundary.
It does not edit packet files and does not implement D0.

Sources read include the mandated domain, information, solution, ontology, and
TypeScript refactoring skills; all mandated ontology and TypeScript
refactoring references/assets; the D1 source packet and current D1 OpenSpec
scaffold; the prior D1 review; the accepted D0 packet and final D0 acceptance
review; and a narrow source skim of current proof-shaped DTO names to verify
the semantic problem.

## Bottom Line

D1 should not define a broad `Proof` domain. The target domain is a set of
bounded command records with typed relationship semantics:

- command execution records;
- command receipts and handoff records;
- check reports and diagnostics;
- verification receipts;
- local hook feedback traces;
- apply transaction records;
- adapter command capture artifacts;
- refusal records;
- non-claim statements.

`Proof` and most `Evidence` language should be treated as compatibility
language inherited from current surfaces. It may appear in D0 rows and
compatibility wrappers, but it should not be D1 target language unless D1 names
a concrete Habitat invariant that requires that stronger term. I did not find
such an invariant in the D1 scenario. The actual invariant is weaker and more
standard: records must state scope, outcome, observations, bounded command
output, post-state, handoff links, and non-claims without implying broader CI,
runtime, apply safety, Graphite, OpenSpec, or product completion.

The current D1 scaffold remains blocked. It gestures at the right target terms,
but it does not yet define the semantic objects, owner map, compatibility
mapping, closed state ontology, relationship ontology, or D0 dependency table
that would prevent implementation agents from inventing semantics later.

## Correct Target Semantic Objects

Use standard engineering names unless Habitat has a real policy invariant that
ordinary terms do not carry.

| Target object | Standard name | Purpose | Not this |
| --- | --- | --- | --- |
| Raw process invocation result | `CommandExecutionRecord` or `ProcessExecutionRecord` | argv, cwd, env projection, start/duration, exit code, stdout/stderr bounds, truncation/hash metadata. | Not proof of domain correctness. |
| User/reviewer-facing command record | `CommandReceipt` | Summarizes one Habitat command outcome, scope, attached records, and non-claims for handoff. | Not CI proof, product completion, or Graphite readiness. |
| Check output | `CheckReport` | Reports selected rules, rule statuses, failing/advisory counts, and diagnostics. | Not proof that every relevant rule is correct or that current tree is globally clean. |
| Rule finding | `Diagnostic` or `RuleDiagnostic` | A structured observation that a rule emitted for a path/scope. | Not evidence of all possible correctness; not a receipt. |
| Verify output | `VerificationReceipt` or `VerifyReceipt` | Handoff-oriented command receipt for `habitat verify`, including check summary, affected-target execution/skips/failures, post-state observation, and non-claims. | Not Graphite state, CI proof, or apply-safety proof. |
| Hook output | `HookTrace` / `LocalFeedbackTrace` | Local hook command/event trace and local-feedback outcome. | Not verification proof; CI remains authoritative. |
| Grit/apply operation | `ApplyTransactionRecord` | Records dry-run, isolated copy check, live apply, formatter/gate commands, rollback, changed paths, digests, and final outcome. | Not current-tree diagnostic proof and not product runtime proof. |
| Adapter command capture | `CommandCaptureArtifact` or `AdapterCommandArtifact` | Durable capture of command result, redaction, retention, raw output digests, and downstream links. | Not a generic proof artifact model. |
| Refused operation | `RefusalRecord` | Records that Habitat intentionally declined an unsupported/unsafe request with reason and recovery instruction. | Not a failure hidden as pass or skip. |
| Explicit limits | `NonClaim` | Canonical statement of what the record does not assert. | Not a disclaimer blob; this is a policy invariant. |
| Cross-record link | `HandoffLink` / typed relationship | Connects a receipt to D0 rows, diagnostics, transaction records, docs, or downstream records. | Not an untyped `downstreamLinks` bag. |

The current source names map roughly as follows:

| Current name | Target interpretation |
| --- | --- |
| `AdapterProofArtifact` | `AdapterCommandArtifact` / `CommandCaptureArtifact`. |
| `ProofArtifactWriter` | `CommandArtifactWriter` or narrower adapter-specific writer if it stays public only through compatibility. |
| `proofId` | `artifactId`, `recordId`, or `receiptId` depending on family. |
| `proofClass` / `AdapterProofClass` | `recordKind`, `artifactKind`, `captureKind`, `transactionStage`, or family-specific discriminant. |
| `VerifyProof` | Public compatibility name for a target `VerifyReceipt` / `VerificationReceipt`. |
| `GritApplyTransactionProof` | Public compatibility name for target `ApplyTransactionRecord`. |
| `GritApplyDiffEvidence` | Prefer `DiffObservation`, `DiffDigest`, or `ChangeDigest`; use `Evidence` only for reviewed source evidence, not accepted truth. |
| hook "proof" wording | Target `local feedback` / `hook trace`; proof wording is compatibility or human-output legacy. |

## Compatibility Facts Versus Target Language

D0's accepted contract is the rule: proof/evidence-shaped names are current
compatibility facts until a downstream packet explicitly keeps, renames,
versions, facades, deprecates, or removes them. D1 must cite D0 rows before
touching any such public surface.

Target language:

- `receipt`
- `command receipt`
- `handoff record`
- `check report`
- `diagnostic`
- `verification receipt`
- `hook trace`
- `local feedback`
- `apply transaction record`
- `command execution record`
- `command capture artifact`
- `refusal record`
- `non-claim`
- `observation`, `digest`, `sample`, `citation`, or `source evidence` where the layer is actually raw evidence rather than accepted contract truth

Compatibility-only unless explicitly justified:

- `Proof*`, `*Proof`
- `proof artifact`
- `proof class`
- `proof id`
- `ProofArtifactWriter`
- `AdapterProofArtifact`
- `VerifyProof`
- `GritApplyTransactionProof`
- hook "proof" human-output strings
- broad `Evidence` terms in DTO names where the field is actually a digest,
  observation, command output, or transaction sample

Still target-acceptable with constraints:

- `nonClaims` / `non-claims`: keep as target language because it encodes a real
  Habitat policy invariant. It prevents a local command record from being read
  as CI, runtime, OpenSpec, apply-safety, product, or Graphite proof.
- `schemaVersion`: compatibility/versioning infrastructure, not domain language.
- `rawOutput`, `stdoutSha256`, `stderrSha256`, `truncated`: standard command
  capture language.

## Owners And Forbidden Owners

D1 should not name one mega-owner that owns all receipt-like records. The
boundary design should state one authority per contract family and the
relationships between them.

| Contract family | Target owner | Owns | Forbidden owners / forbidden claims |
| --- | --- | --- | --- |
| Public compatibility | D0 Public Surface Compatibility | Surface rows, planes, `surface_id`, compatibility handling, target owner, downstream citations. | D1 may not classify public compatibility without D0 rows. |
| Command receipt/handoff boundary | D1 Command Receipt/Handoff Contract | Shared receipt fields, non-claim policy, handoff relationship semantics, compatibility-wrapper rules for proof-shaped receipt names. | Check, hooks, apply, Graphite, and OpenSpec records may not redefine generic receipt semantics locally. |
| Check report | Check/diagnostics owner, consumed by D1 | Rule selection summary, rule status counts, diagnostic shape. | D1 may not redefine rule correctness, rule registry semantics, or structural enforcement. |
| Diagnostics catalog | D6/D7 enforcement/diagnostics owners | Diagnostic taxonomy, rule severity/status semantics, structural finding semantics. | D1 may only reference diagnostics in receipts; it must not define diagnostic meaning. |
| Verify handoff | D12 verify handoff owner, constrained by D1 receipt semantics | Verify-specific handoff composition, affected-target execution/skips/failures, post-state observation. | D1 must not let `VerifyProof` imply CI authority, Graphite readiness, or product completion. |
| Hook trace/local feedback | D11 local feedback owner | Hook command/event trace and local-feedback output. | Hooks may not define verification proof or CI authority. |
| Apply transaction | D9 apply transaction owner | Dry-run/live-apply/rollback/formatter/gate transaction lifecycle. | Apply may not define current-tree diagnostic proof or product/runtime proof. |
| Adapter command capture | Adapter/command-capture owner, constrained by D1 naming | Raw command capture, redaction, retention, output bounds, downstream links. | It may not become a generic proof substrate for unrelated families. |
| Graphite state/handoff | Graphite workflow/handoff owner | Graphite branch/stack/readiness state and PR handoff. | Graphite state may not be collapsed into command receipt proof. |
| OpenSpec workstream records | OpenSpec workstream owner | Packet status, validation, review disposition, phase records. | OpenSpec records may not be treated as Habitat command proof. |

This owner map is the domain-design repair: D1 owns the common boundary and
translation policy, not every downstream record's internal semantics.

## Relationship Ontology D1 Should Use

D1 needs typed relationships, not generic `downstreamLinks`, `proofClass`, or
free-text notes.

Required relationship types:

| Relation | Direction | Allowed endpoints | Meaning |
| --- | --- | --- | --- |
| `references-d0-surface` | D1 contract/wrapper -> D0 row | Receipt/check/transaction/hook/adapter contract to D0 `surface_id`. | Public compatibility is inherited from a D0 row. |
| `wraps-compatibility-surface` | Target contract -> legacy public DTO | Target receipt/record to `Proof*` compatibility wrapper. | The old name is preserved/versioned/facaded only for compatibility. |
| `records-execution-of` | Execution record -> command invocation | `CommandExecutionRecord` to Habitat command/process. | Captures process execution, not semantic correctness. |
| `summarizes-check-report` | Receipt -> `CheckReport` | Command receipt/verify receipt to check report. | Receipt includes a projection of check output. |
| `contains-diagnostic` | Check report -> diagnostic | `CheckReport` to `Diagnostic`. | Diagnostic membership, not proof. |
| `observes-post-state` | Receipt/transaction -> post-state observation | Verify/apply record to git/resources/tree observation. | Observation is scoped and time-bound. |
| `bounded-by-non-claim` | Any record -> non-claim | Receipt/report/transaction/trace/artifact to `NonClaim`. | States an explicit semantic limit. |
| `hands-off-to` | Receipt -> downstream record/workflow | Command receipt to DRA handoff, OpenSpec workstream, Graphite handoff, or review ledger. | Handoff link without implying the downstream state is proven. |
| `is-local-feedback-for` | Hook trace -> hook invocation | Hook trace to local hook command. | Local feedback only; CI authority remains outside. |
| `is-transaction-record-for` | Apply transaction record -> apply invocation | Apply transaction to `habitat fix` / Grit apply operation. | Transaction lifecycle, not diagnostic proof. |
| `rolled-back-by` | Failed/rollback transaction state -> rollback command record | Apply transaction state to rollback command. | Rollback relation with outcome. |
| `refuses-request` | Refusal record -> request/surface | Refusal to unsupported command, generator, migration, or unsafe operation. | Explicit refusal, not silent skip. |

If a relationship needs time, confidence, source path, command ID, severity, or
lifecycle, model it as a relation object rather than a string link.

## State Ontology D1 Should Use

D1 should force closed state families so implementation cannot reconstruct
boolean/optional soup.

### Command Outcome

Use one discriminant, not `ok: boolean` plus optional failure fields:

- `succeeded`
- `failed`
- `refused`
- `skipped`

Required per state:

- `succeeded`: exit code/status, scope, completed command record.
- `failed`: failure tag/reason, command record when available.
- `refused`: refusal reason, owner, recovery instruction, no command execution
  unless a preflight command ran.
- `skipped`: skip reason and the prerequisite state that caused the skip.

### Check Outcome

`CheckReport` should derive summary state from rule reports, not accept
contradictory top-level `ok` values:

- `pass`
- `fail`
- `advisory-only`
- `no-rules-selected`
- `refused`
- `command-failed`

The report owns diagnostics and status counts. Receipts may summarize it but
may not reinterpret diagnostic semantics.

### Affected Target Execution

Use the source packet's stronger union, not the current two-state partial union:

- `executed`
- `skipped`
- `failed`

Required reason fields:

- `skipped`: e.g. `habitat-check-failed`, `no-targets`, `unavailable-targets`.
- `failed`: command exit/failure tag, bounded output metadata, cache stance
  when known.

### Apply Transaction

The target transaction record should encode lifecycle as a closed state machine:

- `dry-run-only`
- `dry-run-refused`
- `dry-run-failed`
- `copy-checked`
- `applied`
- `formatter-failed`
- `gate-failed-rollback-succeeded`
- `gate-failed-rollback-failed`
- `rollback-requested`
- `rollback-succeeded`
- `rollback-failed`
- `failed-before-apply`
- `failed-after-apply`

Not every implementation needs every state immediately, but D1 must name the
allowed families and forbid impossible combinations such as `ok: true` with a
failure tag, changed paths with no apply/copy source, or rollback fields present
without a rollback state.

### Hook Feedback

Hook records must be tagged as local feedback:

- `started`
- `pass`
- `failed`
- `skipped`
- `refused`

Every hook trace carries the non-claim that CI remains authoritative unless a
later CI-specific packet defines a separate contract.

### Non-Claims

Non-claims should be canonical identifiers plus optional human text. D1 should
define the closed base vocabulary for cross-family limits:

- `does-not-prove-ci`
- `does-not-prove-runtime`
- `does-not-prove-product-completion`
- `does-not-prove-graphite-readiness`
- `does-not-prove-openspec-acceptance`
- `does-not-prove-apply-safety`
- `does-not-prove-current-tree-cleanliness`
- `does-not-prove-rule-correctness`
- `local-feedback-only`
- `command-output-only`

Downstream packets may add family-specific non-claims only if they name the
owner and scenario.

## P1 Blockers

1. **P1 - D1 still lacks a D0 dependency table for proof-shaped public surfaces.**

   D0 is accepted as the compatibility authority, but D1 currently says only
   that D0 is required. That is not enough. D1 must include a dependency table
   naming the exact D0 row classes it consumes: `CheckReport`, `VerifyProof`,
   `HookTrace`, `GritApplyTransactionProof`, `AdapterProofArtifact`, command
   JSON rows, human-output proof phrases, and package exports. Until the D0
   implementation matrix exists, D1 must remain explicitly blocked or state
   that it is using D0's accepted row contract as a precondition rather than
   citing concrete row IDs.

   Required repair: add a D0 surface dependency section with required planes,
   expected `target_owner`, allowed `compatibility_handling` values, and a stop
   condition: no implementation may preserve, rename, version, facade,
   deprecate, or remove a proof-shaped surface without the corresponding D0 row.

2. **P1 - `Command Receipt Contract` is too broad as currently framed.**

   The D1 scaffold assigns one owner to verify, check, hooks, Grit adapter,
   apply transaction, and compatibility artifacts. That repeats the shared
   model syndrome D1 is supposed to remove. These families have different
   users, states, failure modes, and downstream owners.

   Required repair: replace the single-owner framing with the owner/forbidden
   owner map above. D1 owns shared receipt/handoff semantics and compatibility
   translation rules; it does not own diagnostic meaning, apply safety, hook CI
   authority, Graphite state, or OpenSpec acceptance.

3. **P1 - Legacy `proof/evidence` names are not fully dispositioned.**

   The packet says to replace target proof vocabulary, but proposal, tasks,
   validation gates, and current source names still leave proof language
   available as target implementation vocabulary. That leaves the key ontology
   choice to the implementation agent.

   Required repair: add a term disposition table to D1. For each inherited term,
   choose `target`, `compatibility-wrapper`, `versioned-rename`, `facade`,
   `deprecate`, or `refuse`, using D0 compatibility handling. `Proof*`,
   `*Proof`, `proofId`, `proofClass`, `ProofArtifactWriter`, and hook proof
   wording should default to compatibility-only unless D1 names a concrete
   scenario requiring proof semantics.

4. **P1 - The packet has no closed relationship/state ontology.**

   Without closed state families and typed relationships, implementation can
   keep `ok: boolean`, optional nullable command fields, untyped links, and
   broad proof class strings while claiming D1 compliance.

   Required repair: add normative state and relationship tables to design/spec:
   command outcome, check outcome, affected-target execution, apply transaction
   lifecycle, hook feedback, refusal, non-claims, and typed relationships.
   Include invalid-state examples as falsifiers.

## P2 Blockers

1. **P2 - Validation gates are command names, not semantic falsifiers.**

   D1 needs expected status, cache stance, bad payload cases, bad state cases,
   and non-claims. At minimum include malformed legacy proof payload, failed
   command projection that cannot be reported as success, contradictory
   transaction state, hook trace being rejected as verification proof, and
   verify affected-target skipped/failed handling.

2. **P2 - Non-claim vocabulary is not canonical.**

   Current strings exist, but D1 does not define which non-claims are required
   per family or how new ones are approved. Without this, non-claims become
   prose disclaimers rather than contract fields.

3. **P2 - Compatibility wrapper policy is underdesigned.**

   The spec says a legacy `Proof*` DTO is preserved or version-renamed, but it
   does not choose the rule. D1 should require wrappers to expose target record
   semantics internally and legacy names only at D0-classified public planes.

4. **P2 - Human output and JSON truth are not tied by ontology.**

   The source packet requires human output to keep the same proof/non-claim
   truth as JSON. Target D1 should say every human-output safety/handoff/local
   feedback claim maps to a command receipt field or non-claim, and D0 records
   that human-output plane separately.

5. **P2 - Adapter capture is still at risk of becoming a generic substrate.**

   `AdapterProofArtifact` contains useful command-capture fields, but D1 must
   keep it as adapter command capture, not as a generic proof artifact. The
   repair is to name the artifact family by raw command capture, redaction,
   retention, and output bounding, then link it to receipts through typed
   relationships only when needed.

## Concrete Required Repairs

Before D1 can become production-quality:

1. Add a D0 dependency table for each current proof-shaped surface D1 touches,
   with plane, expected row, compatibility handling, target owner, and stop
   condition.
2. Add a target semantic object table equivalent to this investigation's
   "Correct Target Semantic Objects" section.
3. Add a term disposition table for `Proof`, `Evidence`, `Artifact`, `Receipt`,
   `Report`, `Diagnostic`, `Transaction`, `Trace`, `Handoff`, `Refusal`,
   `NonClaim`, `proofId`, and `proofClass`.
4. Replace broad "Command Receipt Contract owns everything" wording with the
   per-family owner/forbidden-owner map.
5. Define typed relationships and forbid untyped downstream/proof links.
6. Define closed state unions per family and invalid state examples.
7. Define canonical non-claim identifiers and required non-claims per family.
8. Rewrite the OpenSpec spec to require these ontology commitments, not only a
   generic "bounded receipt" SHALL.
9. Upgrade validation gates with expected results, cache stance, non-claims,
   malformed payloads, and contradictory-state fixtures.
10. Keep D1 blocked until D0 matrix rows exist or explicitly mark any D1 packet
    work as design-only against the accepted D0 row contract.

## Acceptance Falsifier

D1 is not acceptable if an implementation agent can still decide any of these
while coding:

- whether `Proof*` is target language or compatibility language;
- whether a current proof-shaped DTO is preserved, versioned, facaded,
  deprecated, or renamed;
- whether hooks count as verification;
- whether apply transactions prove current-tree diagnostics;
- whether Graphite/OpenSpec state can be included in command proof;
- which non-claims are required;
- which relationship connects a receipt to a check report, transaction, hook
  trace, D0 row, or handoff;
- what states a receipt/check/verify/apply/hook/refusal record may represent;
- whether `ok: boolean` plus optional fields is sufficient for a contract
  family.

If any of those decisions remains open, D1 has not met the domain/ontology bar.

Skills used: domain-design, information-design, solution-design, ontology-design, typescript-refactoring.
