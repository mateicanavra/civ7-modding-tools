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
Blueprint defines a kind.
Instance instantiates one primary blueprint.
Capability attaches to an instance when allowed by that blueprint.
Niche admits instances by accepted facts, including blueprint and capability.
```

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

A blueprint is a stateless, constructible, enforceable schematic for a kind of
thing.

A blueprint defines a kind. It never represents a concrete instance.

Blueprints are:

- normative;
- generable;
- versioned;
- compositional;
- enforceable.

### What A Blueprint Answers

A blueprint answers:

- what kind of thing this is;
- what structure that kind requires;
- where the instance manifest lives;
- which capabilities are required, default, allowed, or forbidden;
- which rules, repairs, generators, and migrations keep the kind valid.

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

### Blueprint Capability Policy

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

### What An Instance Answers

An instance answers:

- what concrete thing this is;
- which blueprint kind it instantiates;
- which blueprint version it uses;
- where its roots are;
- which capabilities it activates;
- which explicit niches include it, if any;
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

activatesNicheSelectors = [
  "security.auth-capable"
]
```

### Capability Is Not Generation

A capability is not about generating things. A capability may have checks,
repairs, docs, or generators around its own metadata, but generation is
incidental.

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
authority.

### What A Niche Answers

A niche answers:

- which instances are in its governed space;
- what additional policy applies to admitted instances;
- which workflows, agents, skills, and roles operate there;
- how the domain is maintained over time.

### Admission

A niche can admit instances by accepted facts:

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

### Niche Authority

Niche authority is additive. A niche cannot weaken blueprint authority or
redefine a capability. It may add policy, workflows, reviews, or stricter checks
for admitted instances.

Niche overlap is allowed only when policies are additive or conflicts are made
explicit.

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
3. A concrete instance appears with a manifest at the blueprint-defined anchor.
4. The instance declares its blueprint, roots, and selected capabilities.
5. Habitat validates selected capabilities against blueprint capability policy.
6. Valid capabilities activate their capability authority.
7. Niches admit the instance by blueprint, capability, roots, metadata, or explicit membership.
8. Niche policies and workflows apply additively.
```

### Core Constraints

```text
Blueprints define kinds, not instances.
Instances declare facts, not policy.
Capabilities define reusable facets, not generated shapes.
Niches govern admitted instances, not blueprint semantics.
Blueprint authority cannot be weakened by capabilities or niches.
Capabilities compose additively and must surface conflicts.
Niche overlap is valid only when policies are additive or conflicts are explicit.
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

## Target File Naming

Future authority packets should avoid redundant filename prefixes inside
same-named parent directories.

Preferred:

```text
.habitat/
  capabilities/
    authentication/
      capability.toml

      enforce_auth_boundary/
        rule.json
        pattern.md

      require_declared_auth_roots/
        rule.json
        structure.toml

      prohibit_client_secret_exposure/
        rule.json
        pattern.md
```

Avoid:

```text
enforce_auth_boundary/
  enforce_auth_boundary.rule.json
  enforce_auth_boundary.pattern.md
```

The packet folder already supplies the rule identity.

## Rule Metadata Consolidation

Future authority packets should not split stable rule metadata across
`category.md` and `rule.json`. The intended target is one rule metadata file,
such as `rule.json`, `rule.toml`, or `rule.md`, with any large human rationale
kept in a companion document only when needed.

The current `category.md` plus `<packet>.rule.json` shape is transitional.

## Capability Internal Organization

Capabilities should start flat.

Inside a capability, the capability itself is already the relevant concern.
Avoid introducing category directories such as `boundary`, `structure`, or
`execution` until the capability grows enough to justify subdivision.

Prefer:

```text
capabilities/authentication/
  capability.toml
  enforce_auth_boundary/
    rule.json
    pattern.md
  require_declared_auth_roots/
    rule.json
    structure.toml
```

The rule metadata can still record concern and tool facts:

```json
{
  "kind": "check",
  "tool": "grit-check",
  "concern": "boundary"
}
```

The filesystem should not duplicate every metadata axis by default.

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
