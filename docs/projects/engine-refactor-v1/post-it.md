# Initiative Post-It

## Rolling Focus

**Frame:** authority before instance. Define each reusable kind as a small,
positive, generic law; make the current tree red against that law; then perform
the mechanical burn-down. Physical source moves are violation evidence until
their destination kind is sealed.

**Authority order:** behavioral intent -> ownership -> boundary -> blueprint
law -> source conformance -> verification. A niche may refine a kind but may not
recreate, weaken, or hardcode its membership.

**Current container:** Resources and the minimal root/module laws are sealed.
Foundation is the next whole-domain burn-down: mesh, mantle, lithosphere,
tectonics, orogeny, and projection form one ordered aggregate under
`modules/`. The domain root is only the aggregate `contract.ts`, `router.ts`,
public `index.ts`, and its shared `model/`; model atoms and policy cannot sit
beside semantic modules as though they were equivalent kinds. Each module owns
its operations and immutable artifacts and may own the same optional
`model/{atoms,policy}` slot. Vocabulary descends to the lowest module that fully
owns it and rises only when multiple sibling modules prove a shared edge; no
empty model shell is created. Operation registries are the singular
`ops/contract.ts`. Operation input and output envelopes exist only in their
contract file and are authored inline at the `defineOp` callsite; detached
`InputSchema`/`OutputSchema` aliases are not secondary authorities. Strategy
configuration belongs to a closed strategy leaf
`strategies/<semantic-id>/{contract.ts,index.ts}` rather than remaining as a
detached schema inside the parent operation contract; sibling
`strategies/{contract.ts,index.ts}` files aggregate contracts and executable
descriptors separately. Contracts
compose the smallest named model atoms they actually require, while rules,
strategies, and implementation helpers consume
those atom types or private algorithm-local types directly. They never
reconstruct working types from an artifact schema or project them back out of
an operation envelope. Atoms are schema primitives and cohesive subentities,
not complete container schemas reused wholesale. Each artifact owns its full
publication schema and each operation owns its full boundary envelope; both
may compose the same smaller atoms without borrowing the other's container.
Duplicated whole-container shapes are a signal to narrow the operation input
or decompose a smaller semantic atom. Four
intermediate tectonic payloads lose false
artifact identity and remain plain module-model atoms. No flat compatibility
catalog survives. For every law, `required` names the fixed
spine, `allowed` names deliberate flexibility, and everything else is excluded
without a second forbidden inventory. Membership and topology stay in
`pathCoverage` and `structure.toml`; Grit expresses only cheap relationships
inside the admitted kind; TypeScript owns composition, key identity, duplicate
refusal, and artifact-validator binding by construction. Current positive
schemas and public types are the complete authority for authored keys; removed
keys receive no historical tombstone rules.

**Stable ownership:** Swooper domains own their semantic modules and immutable
data-product contracts; recipes own orchestration and publication; live Civ7
state is adapter observation; metrics, diagnostics, trace, and visualization
are separate capabilities. Core owns the generic authoring/execution and
domain-composition SDK, not Swooper's domain model.

**Gradient:** first repair the generic domain, module, operation, and strategy
kind laws for the nested destination. Then relocate Foundation atomically into
its six semantic modules, preserve every operation identity and behavior, zip
each artifact to its real owner, move shared vocabulary under the nearest
`model/`, replace whole-container schema borrowing with independent boundary
composition from smaller semantic atoms, and delete false artifacts and
low-value schema-repetition tests. A subdomain is a
semantic router: operations expose swappable strategies, and strategies
compose the module's rules, policy, and atoms through transparent dependencies.
Verify the complete Foundation/Standard consumer graph, then seal the branch
before the next whole-domain slice. Keep successor laws advisory for the mixed
interval; promote the domain and child laws to enforced only at zero and retire
flat laws in the same semantic cut.
The immediate mechanical successors first make every operation `defineOp` call
directly own its inline input/output envelopes, then move strategy schemas and
implementations into their leaf strategy kind behind one typed Core
`defineStrategy` authority. Typed-array inputs also declare honest cardinality
intent at that boundary: fixed grid, plate, segment, and era fields bind to an
explicit count path; only genuinely variable adjacency, event, and list values
use constructor-only admission. The schema API should name those modes rather
than leaving `cardinality: null` as an opaque routine escape hatch. These
structural corpora must settle before
reopening operation-to-artifact or other pipeline relationship design.
For every structural kind, `required` names only the fixed spine, `allowed`
names optional or generative members, and `closed` rejects everything else.
Relocate one semantic module at a time, hoisting vocabulary only when a real
cross-module edge proves it shared. Then drain the remaining recipe artifacts
into adapter observation, domain products, or metrics/diagnostics evidence.
Retire a niche rule after a named generic or typed owner proves a live
invariant, or when the current positive shape makes its historical subject
nonexistent. The program ends only when generic laws, source tree, types,
tests, Knip, and the boundary graph agree.

**Release cadence:** cut each directionally reviewed law or completed
burn-down into its own Graphite branch as soon as its proof closes. The dirty
buffer contains only the currently coupled semantic work; sealed artifacts do
not remain mixed into the next focus.

**Focus maintenance:** clarifications, tighter scope, stronger authority, and
better expressions of this same frame update it in place. Add a prior-focus
entry only when the governing model or admitted direction changes enough to
produce materially different work.

**Protected context:** A.2 remains separate. User-owned root configuration,
map-config edits, NOTE files, and unrelated worktrees stay outside this
program's semantic cuts.

<details>
<summary>Prior focus pivots</summary>

### 2026-07-22 - Domain Aggregate Ownership

The artifact-by-domain migration revealed that flat root `ops/`, `artifacts/`,
and `model/` directories still separated things that change together. The
replacement unit is the semantic subdomain aggregate:

`domain root -> subdomain -> {contract, router, ops, artifacts, atoms, policy}`

The root composes child contracts and routers; siblings cannot reach through
one another; shared vocabulary moves upward only after multiple subdomains
prove the edge. This preserves the positive artifact and operation kinds while
changing their containment owner.

### 2026-07-22 - Instance-First Authority Inversion

The program paused the dirty stage hierarchy and artifact relocation after
recognizing the wrong execution order:

`physical move -> weakened blueprint -> niche compensation`

The replacement frame is:

`kind decision -> generic blueprint law -> red corpus -> mechanical burn-down -> seal`

This pivot superseded the earlier package-relocation focus without reopening
its sealed SDK, metrics, visualization, context, or artifact-runtime gains.

### Earlier - Package Destination And Context Consolidation

- Package destination, structural-test authority, bundle compatibility,
  exported-symbol documentation, metrics, visualization, ArtifactModule,
  generated recipe types, placement/resource metrics, and Nx foundations were
  treated as sealed layers.
- Mutable fields and buffers were retired in favor of explicit immutable
  artifact vintages.
- The active focus was an author-facing `MapContext`, Core type-module split,
  and the pre-A.2 package destination migration.
- A.2 remained a sibling concern and protected user edits remained outside
  every staged semantic layer.

</details>
