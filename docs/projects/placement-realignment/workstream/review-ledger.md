# Review Disposition Ledger — Plan Review (gate 11, pre-implementation)

Reviewers: architecture-authority lane (agent a0d56bfc), product/policy lane
(agent aabf8073). 2026-06-09. All findings dispositioned **accepted + repaired**
in `refactor-plan.md` / `expectations.md` unless noted.

| # | Lane | Finding | Sev | Disposition |
| --- | --- | --- | --- | --- |
| F1 | arch | domain/resources ops are demand planners, not site planners; S3 needs new site-selection op + mask derivation | P1 | Accepted — S3 rewritten as 4-step pipeline; risk note updated |
| F2/5 | both | D2 ownership ADR must land in S3, not S8 | P1 | Accepted — D2 is now an S3 entry gate |
| F3 | arch | Milestone A sampled probes would regress full-grid `verify:final-surface-parity`; earthlike-* corpus would be orphaned | P1 | Accepted — Milestone A reruns full-grid parity + dispositions the 106/6996 corpus |
| F4 | arch | S5 post-stamp adjustment infeasible; ordering change must be named | P2 | Accepted — plan/stamp split: stamping moves after support pass; alternative rejected explicitly |
| F5 | arch | Slot→player mapping belongs in the op, adapter exposes read only | P2 | Accepted — S4 reworded |
| F6 | arch | Studio-twin disposition was a silent OR | P2 | Accepted — promoted to D6 (single generator, twin retired, consumer gates named) |
| F7 | arch | S2 overstated gaps (validity rows + mock emulation exist) | P3 | Accepted — S2 rescoped: generator first byte-stable, then Weight/minimums/StartBias/DLC |
| F8 | arch | S3 ambiguity could revive `stages/resources` contra D3 | P3 | Accepted — wiring via placement stage steps; orphan artifacts.ts absorbed or deleted in S3 |
| P1 | prod | E2.1 Weight direction inverted (deficit rotation: freq ∝ 1/Weight among co-eligible) | P1 | Accepted — E2.1 respecified (Spearman ≤ −0.7 within shared-habitat pools) |
| P2 | prod | E1.5 official buffers don't scale by map size; 12 is a score taper | P1 | Accepted — E1.5 respecified; scaling only as recorded repo extension |
| P3 | prod | E2.5 clumped-vs-CSR contradicts blue-noise floor | P1 | Accepted — E2.5 respecified at radii above spacing floor (inhomogeneous Poisson) |
| P4 | prod | E2.2/E2.8 hemisphere → landmass-region + MapResourceMinimumAmountModifier | P2 | Accepted — E2.2 respecified; modifier added to S2 table list |
| P6 | prod | S4 must enumerate target-card deliverables | P2 | Accepted — target-card checklist added to S4 |
| P7 | prod | RDP absorption incomplete (step-2 spacing fallback; step-1 metrics) | P2 | Accepted — spacing-preserving fallback added to S1; E2.9 added |
| P8 | prod | E1.8/E2.7/E1.6 unverifiable as written | P2 | Accepted — populations/tolerances/normalization pinned |
| — | prod | Sector-machinery removal diverges from official chooseStartSectors | sub-P3 | Accepted — noted in S4, recorded in ADR |

No rejected findings. No open blockers to implementation.
