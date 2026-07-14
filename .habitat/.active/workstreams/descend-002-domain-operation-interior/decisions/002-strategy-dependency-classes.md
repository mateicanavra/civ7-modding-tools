# Decision 002: Strategy Dependency Law

Status: sealed by later user authority

## Question And Provenance

What positive dependency law governs
`ops/<operation>/strategies/*.ts`?

The original Foundation-only negative rule was underbroad, while the first
source census mixed legitimate local, domain, and public-package dependencies
with three private-boundary anomalies. A static list of today's specifiers
would turn evidence into permanent authority.

## Evidence

The refreshed census contains 506 strategy import specifiers. Legitimate use
clusters around the operation's own contract, rules, and strategy modules; the
owning domain's model; MapGen core public surfaces; and admitted public
packages. Three imports cross private owner boundaries:

- Placement `plan-starts` reaches Hydrology internals by relative path.
- Placement `plan-natural-wonders` reaches Hydrology model policy directly.
- Ecology `plot-effects-score-snow` reaches a sibling operation's rules.

The earlier bare `mountain` result was prose/comment parsing, not an import.

## Alternatives Considered

1. Promote the Foundation rule's path allowlist.
2. Maintain a repository-wide inventory of admitted package and subpath
   strings.
3. Assert dependency classes from capability and owner boundaries.

The first two preserve current spelling as law and require continuous
exception maintenance. They were rejected.

## Ruling

Strategy dependencies are legal by architectural class:

- same-operation public surfaces;
- the owning domain's public model surfaces;
- public packages admitted by existing domain and workspace boundaries.

Private cross-domain dependencies and private sibling-operation dependencies
are forbidden, regardless of relative or package-specifier spelling. Existing
adapter, engine-runtime, recipe, projection, and config-facade rules continue
to compose with this law; D2 does not duplicate them.

The enforcement must derive ownership from repository structure and admitted
public surfaces. It must not carry an inventory of current paths or package
subpaths.

## Consequence

The three confirmed anomalies are red by boundary class. Their exact
behavior-preserving destinations come from the consuming contracts and owner
authority during row classification, not from a new exception in this
decision. The Foundation-local negative rule retires after the generic
survivor proves both bad and clean samples.

## Falsifier

If legitimate current dependencies cannot be expressed through these owner
classes without a broad exception or path inventory, the assertion is too
coarse. Stop and narrow the capability boundary rather than widening private
access.
