# Habitat Authority Ontology

Status: normative conceptual reference for Habitat authority modeling

## Purpose

This document defines the core Habitat authority concepts and their
relationships. It is the vocabulary reference for future Habitat authority
tree, registry, generator, admission, and workflow design.

The current packet tree may still use transitional physical organization. This
document defines the durable model those physical layouts should move toward or
explain deviations from.

## Scope

This document defines:

- what a Habitat is;
- what a blueprint is;
- what an instance is;
- what a capability is;
- what a niche is;
- how these concepts relate;
- how instance admission and authority activation should work;
- where instance manifests belong, including multi-root instances.

This document does not define the final parser, registry schema, migration
sequence, or exact file extensions for every future manifest.

## Core Model

Habitat authority is item-first. The primary concepts are not folders, tools,
or runners. The primary concepts are:

```text
Habitat
Blueprint
Instance
Capability
Niche
```

The stable relationship is:

```text
Habitat contains the authority system.
Blueprint defines a constructible kind.
Instance instantiates one primary blueprint.
Capability attaches to an instance when allowed by that blueprint.
Niche admits instances by accepted facts, including blueprint and capability.
```

Same-kind nesting has different semantics for each concept:

- blueprint nesting is monotonic kind narrowing;
- capability nesting is namespacing plus explicit relationship facts;
- niche nesting is governed-space containment, not type inheritance.

## Habitat

A Habitat is the repository's authority system: the place where the repository
defines, discovers, validates, repairs, generates, and governs its own
structure.

A Habitat is not only a CLI, a rules folder, metadata, or a generated registry.
It is the repository-local authority plane.

### Responsibilities

A Habitat defines and maintains:

- the available blueprints;
- the available capabilities;
- the available niches;
- instance admission rules;
- authority activation rules;
- executable routing for checks, fixes, generators, migrations, and workflows;
- provenance and versioned policy.

### Typical Root

A repository normally has one Habitat root:

```text
.habitat/
  habitat.toml
  blueprints/
  capabilities/
  niches/
  index.toml
```

The exact physical tree may evolve, but a Habitat root must preserve the
conceptual distinction between blueprint authority, capability authority, niche
authority, and instance facts.

## Blueprint

A blueprint is an encapsulated constructible definition for a kind of thing.

A blueprint defines a kind. It never represents a concrete instance. A child
blueprint narrows its parent kind; it must not be an unrelated support surface,
runner, current defect, or one-off package concern.

Blueprints are:

- normative;
- generable;
- versioned;
- compositional;
- enforceable.

A blueprint definition includes identity, version, instance anchor grammar,
canonical shape, construction, migration, validation, repair, capability
policy, and child-blueprint relationships.

The side-chat term `kernel` is useful shorthand for "constructive definition,"
but it is not normative vocabulary. Do not turn `kernel` into a required
folder, manifest key, or separate authority plane without a later accepted
layout design.

### What A Blueprint Answers

A blueprint answers:

- what kind of thing this is;
- what structure that kind requires;
- where the instance manifest lives;
- which capabilities are required, default, allowed, or forbidden;
- how instances of the kind are generated, identified, and migrated between
  versions;
- which checks, repairs, validators, and governance policies keep the kind
  valid.

### Constructive Definition And Governance

A blueprint owns both constructive definition and governance. These are useful
semantic roles, not necessarily final directory names.

Constructive definition answers:

- how to identify an instance of the kind;
- where its `habitat.toml` manifest is anchored;
- what file, manifest, schema, or tree shape is canonical;
- how to construct or generate a new instance;
- how to migrate an instance between blueprint versions.

Governance answers:

- what must remain true after construction;
- what is allowed or forbidden;
- which checks and validators apply;
- what can be repaired safely;
- what boundaries the kind must preserve.

Policy is not a separate owner outside the blueprint. Blueprint policy is part
of the blueprint definition. Conversely, generation and migration are not merely
policy when they define or transition the kind.

### Nested Blueprints

Nested blueprints are same-kind specializations. If `app/web/static` is a child
of `app/web`, then `static` is a narrower kind of web app.

Support files, test fixtures, runner adapters, generated indexes, current
defect names, and implementation chores are not child blueprints.

The exact cascade and override model for parent and child blueprints is still
open. Until that model is accepted, child blueprints should be treated as
explicit specializations whose inherited or additional authority must be
declared rather than inferred from folder depth alone. Child blueprints may add
or narrow authority. Weakening parent authority requires explicit deprecation,
migration, or conflict handling rather than silent replacement.

### Instance Anchor Contract

Every blueprint must define the instance anchor contract for its kind.

The instance anchor contract defines where the concrete instance manifest lives.
The manifest is usually named `habitat.toml`, but its placement is not globally
fixed. Placement is blueprint-owned.

Example:

```toml
# .habitat/blueprints/app/web/blueprint.toml

id = "app/web"
version = "1"

[instance]
anchor = "root"
manifest = "habitat.toml"

[capabilities]
required = ["typescript-source"]
default = ["browser-runtime"]
allowed = [
  "authentication",
  "generated-artifact-consumer",
  "filesystem-write-access"
]
forbidden = ["civ7-runtime-mod"]
```

### Capability Policy Inside Blueprint Definition

Blueprints aggregate capability policy for their kind. A blueprint should define
which capabilities are:

- `required`: every instance of the kind must have the capability;
- `default`: instances receive the capability unless they opt out where allowed;
- `allowed`: instances may explicitly select the capability;
- `forbidden`: instances of the kind may not select the capability.

Capability applicability belongs primarily in the blueprint, not in the
capability. A capability should not carry a global list of all blueprints it can
attach to unless a real compatibility constraint requires it.

### Blueprint Authority

Blueprint authority applies to every instance of that kind and cannot be
weakened by capabilities or niches.

## Instance

An instance is a concrete repository thing admitted under a blueprint.

Examples include an app, package, mod, tool, feature, document set, generated
artifact surface, or multi-root construct.

An instance is identified by an instance manifest at the blueprint-defined
anchor. The manifest is normally `habitat.toml`.

No `habitat.toml` means no admitted instance. Candidate roots can be discovered
or generated, but admission requires manifest facts at the blueprint-defined
anchor. A compatibility bridge may only proxy or materialize those manifest
facts during migration; it must not admit an instance by bypassing the manifest
model.

### What An Instance Answers

An instance answers:

- what concrete thing this is;
- which blueprint kind it instantiates;
- which blueprint version it uses;
- where its roots are;
- which capabilities it activates;
- which niches it requests or declares as facts, if any;
- which capability configuration values are accepted facts for this instance.

### Instance Facts Are Not Policy

An instance manifest declares facts. It does not define policy.

The instance can activate authority by declaring a blueprint, roots,
capabilities, and configuration. The authority lives in Habitat definitions,
not in the instance manifest itself.

Example:

```toml
# apps/mapgen-studio/habitat.toml

id = "mapgen-studio"
blueprint = "app/web"
blueprintVersion = "1"

roots = [
  "apps/mapgen-studio"
]

niches = [
  "civ7",
  "mapgen"
]

capabilities = [
  "authentication",
  "generated-artifact-consumer"
]

[capability.authentication]
provider = "clerk"
authorityRoots = ["apps/mapgen-studio/src/auth"]

[capability.generated-artifact-consumer]
artifactRoots = ["mods/mod-swooper-maps/generated/studio-recipes"]
producerTarget = "mod-swooper-maps:build:studio-recipes"
```

## Capability

A capability is an attachable, reusable authority facet.

A capability describes something an instance does, exposes, or participates in
across blueprint kinds. A capability is not itself a constructible kind, a
niche, or a generated object.

Capabilities are monotonic. A valid capability activation may add accepted
facts, config requirements, checks, repairs, validators, or niche-admission
facts. It must not weaken blueprint authority, erase another capability's
accepted facts, or silently override niche governance.

### What A Capability Answers

A capability answers:

- what reusable behavior or operational concern is active on an instance;
- what additional instance config is required or optional;
- what rules activate when the capability is active;
- which niche selectors may use the capability as an admission fact.

### Good Capability Shape

Good capabilities are coarse, cross-cutting, and behavior-oriented.

Examples:

```text
authentication
filesystem-write-access
generated-artifact-consumer
public-api-surface
secret-consumer
network-listener
external-process-runner
database-access
```

Bad capabilities are one-off implementation details:

```text
clerk-login-button
uses-useAuth-hook
has-auth-callback-route
imports-generated-recipes-json
writes-this-one-temp-file
```

Those belong as rules or config under a capability, not as separate
capabilities.

### Nested Capabilities

Capability nesting is namespacing plus declared relationship facts, not
inheritance. A nested capability may refine vocabulary or group related facets,
but it does not automatically inherit, override, or weaken parent capability
authority.

Any relationship between parent and child capabilities must be declared
explicitly. The exact capability relationship schema remains open; likely
relationships include `requires`, `implies`, `conflictsWith`, and `refines`.

### Capability Definition Example

```toml
# .habitat/capabilities/authentication/capability.toml

id = "authentication"
version = "1"

summary = "Instance participates in identity, session, auth-token, or user-principal flows."

requiredConfig = [
  "provider",
  "authorityRoots"
]

optionalConfig = [
  "clientRoots",
  "serverRoots",
  "publicCallbackRoutes"
]

activatesRules = [
  "enforce_auth_boundary",
  "require_declared_auth_roots",
  "prohibit_client_secret_exposure"
]

exposesFacts = [
  "capability:authentication"
]
```

### Capability Is Not Generation

A capability is not about generating things. A capability may have checks,
repairs, docs, or generators around its own metadata, but generation is
incidental.

A capability normally has no constructive definition. If it needs install or
setup mechanics, model those as setup/configuration support for the capability,
not as a blueprint-style constructive core.

If `auth` is a constructible generated module shape, that shape is a blueprint.
If `authentication` is behavior that an app or package exposes, that behavior is
a capability.

The two may coexist:

```text
blueprints/auth/web-client
  constructible web client auth module shape

blueprints/auth/server-session
  constructible server session validation shape

capabilities/authentication
  reusable authority facet for instances that participate in auth behavior
```

## Niche

A niche is a governed, operable domain space.

A niche is where domain-specific or cross-cutting governance lives: policies,
workflows, roles, agents, skills, scheduled work, reviews, and additional
authority. Human stewards, teams, service agents, and AI agents should be
modeled as agent or role records, not as separate peer ontology roots.

### What A Niche Answers

A niche answers:

- which instances are in its governed space;
- what additional policy applies to admitted instances;
- which workflows, agents, skills, and roles operate there;
- how the domain is maintained over time.

### Admission

A niche admits instances by accepted facts. It does not admit raw folders,
packets, source files, or blueprints directly.

Accepted admission facts may include:

- explicit instance membership;
- blueprint kind;
- capability;
- path or root;
- metadata;
- ownership;
- other accepted instance facts.

Admission by capability means that the niche has a selector such as:

```text
Any instance with capability X is in my governed domain.
```

Example:

```toml
# .habitat/niches/security/admission.toml

[[selectors]]
name = "auth-capable"
match.capabilities = ["authentication"]

[[selectors]]
name = "filesystem-writing"
match.capabilities = ["filesystem-write-access"]
```

If an instance declares `authentication`, then the `security` niche admits that
instance. The security niche does not own or redefine authentication; it uses
authentication as an admission fact.

Explicit niche declarations in an instance manifest are requested facts, not
unilateral membership. They become accepted membership only when validated by
niche admission metadata or an explicit niche membership selector.

Admission should be treated as a derived fact with provenance:

```text
instance + niche selector + consumed accepted facts -> niche membership
```

Path-only or root-only admission is transitional unless the path or root is an
accepted fact of a manifest-backed instance.

### Niche Authority

Niche authority is additive. A niche cannot weaken blueprint authority or
redefine a capability. It may add policy, workflows, reviews, or stricter checks
for admitted instances.

Niche overlap is allowed only when policies are additive or conflicts are made
explicit.

Parent and child niches do not imply type inheritance. Any membership,
authority, or workflow inheritance between niches must be declared by niche
metadata or derived admission facts, not inferred from path nesting alone.

## Relationship Rules

### Authority Stack

Authority activates in this order:

```text
Habitat global authority
-> Blueprint kind authority
-> Instance facts
-> Capability authority
-> Niche governance authority
```

### Operational Flow

```text
1. Habitat defines available blueprints, capabilities, and niches.
2. A blueprint defines a constructible kind and its instance manifest anchor.
3. A candidate root becomes an instance when a valid manifest appears at the
   blueprint-defined anchor.
4. The instance declares its blueprint, roots, and selected capabilities.
5. Habitat validates selected capabilities against blueprint capability policy.
6. Valid capabilities activate their capability authority and add accepted
   facts.
7. Niches consume accepted facts through selectors and admit matching
   instances.
8. Niche policies, workflows, agents, and skills apply additively.
```

### Core Constraints

```text
Blueprints define kinds, not instances.
Instances declare facts, not policy.
Capabilities define reusable facets, not generated shapes.
Niches govern admitted instances, not blueprint semantics.
Blueprint authority cannot be weakened by capabilities or niches.
Capabilities compose additively and must surface conflicts.
Niches admit instances, not raw folders or blueprint definitions.
Niche overlap is valid only when governance is additive or conflicts are explicit.
```

## Manifest Placement

The instance manifest placement rule is:

```text
habitat.toml placement is blueprint-defined.
```

Do not use a universal physical rule such as:

```text
habitat.toml is always one level above the instance.
```

That rule fails for multi-root, virtual, composite, and generated instances.

Instead:

```text
A blueprint must define the anchor grammar.
A generated or admitted instance must have exactly one manifest at that anchor.
All other roots are declared by that manifest or derived by the blueprint.
```

### Single-Root Example

```text
apps/mapgen-studio/
  habitat.toml
  package.json
  src/
  public/
  tests/
```

### Multi-Root Example

```text
mods/mod-swooper-maps/
  habitat.toml
  package.json
  src/
  generated/

docs/system/mods/swooper-maps/
  OVERVIEW.md
  AUTHORING.md
```

The docs root is part of the instance, but the instance identity lives at the
blueprint-defined anchor under `mods/mod-swooper-maps/`.

### Composite Anchor Example

```text
features/mapgen-runtime/
  habitat.toml

packages/mapgen-core/
packages/mapgen-sdk/
apps/mapgen-studio/
docs/system/libs/mapgen/
```

The `features/mapgen-runtime/habitat.toml` manifest may declare:

```toml
id = "mapgen-runtime"
blueprint = "feature/multi-project-runtime"

roots = [
  "packages/mapgen-core",
  "packages/mapgen-sdk",
  "apps/mapgen-studio",
  "docs/system/libs/mapgen"
]
```

This is valid only if the blueprint says multi-project runtime instances are
anchored under `features/<id>/`.

## Physical Layout Commitments

This ontology is semantic first. It defines concepts, relationships,
activation, and identity. It does not select the final folder names for
blueprint internals, capability internals, niche internals, packet metadata, or
support artifacts.

These terms are explicitly not accepted as final physical layout commitments:

```text
kernel/
rules/
packets/
authority/
_authority/
```

They may still be useful discussion terms or transitional paths in a later
layout design, but they should not be treated as ontology.

Future physical layouts should preserve these constraints:

- primary ontology roots such as `blueprints`, `capabilities`, and `niches`
  should not be underscored;
- support, generated, cache, and runner-bridge directories may use reserved
  naming to signal non-authority or derived material;
- same-kind child containers should not blur with local support artifacts;
- metadata should avoid duplicating identity that is already supplied by an
  owning manifest or folder;
- current `category.md` plus `<packet>.rule.json` metadata is transitional.

## Current Tree Compatibility

The current authority tree still uses transitional physical concepts:

```text
.habitat/<niche>/blueprints/<blueprint>/<category>/<artifact-kind>/<packet>/
```

That layout remains the active physical packet layout until a migration changes
it. This ontology is the normative conceptual reference for deciding what that
layout means and what future layouts should converge toward.

When this document conflicts with current packet mechanics, treat the current
mechanics as transitional implementation state and this document as the
conceptual target unless an active migration packet says otherwise.

## Extension Points

Future work may add explicit schemas for:

- `habitat.toml` instance manifests;
- `blueprint.toml` blueprint manifests;
- `capability.toml` capability manifests;
- `niche.toml` and `admission.toml` niche manifests;
- conflict handling between capabilities;
- niche overlap and precedence;
- registry indexing and derived facts.

Those schemas must preserve the distinctions defined here.
