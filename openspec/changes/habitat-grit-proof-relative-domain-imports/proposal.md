# Relative Domain Import Proof

## Why

Swooper recipe and map source had six live imports reaching into
`src/domain/**` through relative paths. Those reaches bypass the named domain
package surfaces that recipe/map code should use.

## What Changes

- Remediate the six current Swooper recipe relative-domain imports to public
  `@mapgen/domain/*` surfaces.
- Register `grit-relative-domain-imports` as an enforced Habitat/Grit check.
- Add explicit empty baseline ownership and a row-specific injected probe for
  the recurrence class.

## Boundary

This checkpoint proves source remediation plus an executable recurrence guard.
It does not prove raw direct Grit acquisition, apply/codemod safety, generated
output freshness, broader public-surface closure, aggregate injected-corpus
closure while DDIT remains blocked, or product/runtime behavior.
