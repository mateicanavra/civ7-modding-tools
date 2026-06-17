# Source Synthesis - Relative Domain Imports

## Authority

Recipe and map code compose domain behavior through public domain package
surfaces. The DDI row recorded six relative local-domain reaches as sibling
guard input; this slice owns closing that recurrence class.

## Current Source Remediation

The source diff rewrites hydrology references to
`@mapgen/domain/hydrology` and resource references to
`@mapgen/domain/resources`. The used exports already exist on those surfaces.

## Predicate Shape

The predicate is deliberately depth-specific:

- stage-root recipe files: `../../../../domain/...`;
- direct step files: `../../../../../domain/...`;
- nested step files: `../../../../../../domain/...`;
- map-root files: `../domain/...`.

This avoids a false-positive class where an unrelated short relative path
contains a literal `domain` segment.

## Non-Claims

No raw direct Grit acquisition, apply safety, generated-output freshness,
broader public-surface closure, neighboring-row proof, or product/runtime proof
is claimed.
