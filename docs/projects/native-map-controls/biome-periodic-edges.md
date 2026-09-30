# Periodic Biome Edge Refinement

## Change Identity And Declaration

Owner: Ecology's existing `classify-biomes` strategy. No Core, schema, recipe,
configuration or engine-control change. Actor outcome: identical climate/land
inputs produce identical biome transitions when rotated around a cylindrical
map, rather than treating longitude zero as a privileged edge.

These expectations were supplied in the bounded implementation brief before
the red tests or production edit; this note persists that declaration using
the MapGen expectation-ledger structure. The current-source discriminator is
retained separately at `earth-calibration/biome-row-dominance-discriminator-20260930/`.

## Hypothesis And Alternatives

The actual Gaussian refinement clips both axes, while Core's world neighborhood
wraps X and bounds Y. The same isolated wet column survives at x=0 but disappears
after rotation to x=2; the raw classifier commutes with that rotation. This
witness localizes longitude-origin dependence to refinement, not climate.

Select existing Core `wrapX` in the existing kernel traversal. Reject new
boundary helpers, strategy/schema controls, retuned aridity/moisture thresholds,
or removal of smoothing: none is needed to repair this witnessed topology
defect. Keep the Gaussian approximation and authored strength unchanged.
If the operation already commuted with rotation under admitted inputs, or
the intended world were X-bounded, this edit would not be justified.

## Predeclared Expectations

| ID | Expectation | Bound |
| --- | --- | --- |
| X1 | Cyclic X input rotation commutes with admitted classification, including mixed water and repeated passes | Exact output identity after inverse rotation |
| X2 | Y remains bounded; water sentinel/exclusion, kernel, iterations and tie behavior remain unchanged | Focused boundary/degenerate-grid controls |
| X3 | Inputs and forwarded climate arrays are not reauthored; vegetation calculation remains the existing law | Exact input/forwarded-field checks |
| X4 | General configurations retain current contracts, policy, determinism and collateral study expectations | Owning graph and original study bank; no weakened targets |

Biome majority counts are measured consequences, not a promise that every
dominance target improves. This fix does not qualify physical altitude,
maritime heat transfer, lake heights, river navigation or a new native view.
The existing realization must build before deployment; installed artifacts
alone are not live loader/parity proof.

## Results

The production edit imports public Core `wrapX` and replaces the clipped X
lookup inside the existing strategy: two inserted and five removed lines.
No operation, schema, knob or step implementation was added. An independent
SDK/correctness review returned **ALIGNED**, with no established findings.
Kernel indexing and tie selection are inspection-preserved; tie behavior is
not claimed as a separately tested fixture.

Before the production edit, the full new regression failed five of eleven
cases. After it, all eleven pass with 210 assertions. The nearest classifier
suite passes twenty tests / 235 assertions. The owning graph additionally
exposed a composing-step test whose repeating three-cell stripe became
uniform once both longitude edges participated. Its purpose is publication,
not a biome-diversity target: the coordinator replaced the incidental variety
assertion with exact parity to the admitted classifier's biome and vegetation
outputs. Vegetation response and non-sentinel checks remain. This subsequent
test-only adjustment was coordinator-reviewed, not included in the earlier
independent review. The combined focused suite passes 22 tests / 242 assertions
and pinned test TypeScript passes.

Final definition proof: `nx run-many --projects=swooper-physics
--targets=check,test,check:policy --outputStyle=static`. Types and Habitat pass;
1,038 tests pass and the single study-bank aggregate still fails the same
eleven calibration expectations. Shattered Ring lacks atoll; four mountain
map variants lack vegetation-family variety and taiga; Earthlike fails the
temperature-variation floor and biome dominance. No target was relaxed.
The earlier single definition+realization graph built and deployed the code,
with all 187 realization tests / 31,847 assertions passing. Direct Biome
execution processes zero ignored files and is not a lint pass.

Two complete four-case generated studies retain exact compressed payloads,
48 repeated capture-field hashes and twenty admitted climate-index arrays.
Compared with the pre-repair capture, all eleven non-biome field hashes per
case, the complete climate indices, physical variance budget, scenarios and
sea-level datums remain exact. Only 3/8/2/1 terrestrial biome cells change:

| Case | Dominance before | Dominance after | Changed biome cells |
| --- | ---: | ---: | ---: |
| Huge 1018 | 0.744275 | 0.745547 | 3 |
| Standard 1018 | 0.775791 | 0.777166 | 8 |
| Standard 1 | 0.753275 | 0.754731 | 2 |
| Standard 42 | 0.746099 | 0.746809 | 1 |

Temperature RMS remains 0.149356/0.127782/0.181309/0.163265 C. This accepts the
bounded topology correction, not climate or biome calibration. Correcting
the seam slightly increases dominance in this cohort; do not reverse a
world-topology correction to improve a pooled statistic.

External evidence under `earth-calibration/`: `land-thermal-variance-20260930/
periodic-biome-run1/`, `periodic-biome-repeat2/`,
`periodic-biome-verification.json`, `periodic-biome-comparison.json`, and the
rerunnable `compare-periodic-biome.mjs`. Exact source inventory SHA-256:
`e8b2c507468c64bded7d1779be2ffbec5d5f424956462fac9844e310f6616ebb`.
The older run script is retained as `run-study-physical-budget-vintage.mjs`;
the current script accepts an explicit coordinator source label and uses
actual file hashes as its identity authority. The original discriminator
also passes a coordinator rerun of five tests / twelve assertions and complete
retained-payload verification with corruption controls; it remains pre-repair
evidence, not a claim that its source is current.

Owning logs: `biome-periodic-owning-proof-20260930.log` (initial publication
assertion failure retained) and `biome-periodic-final-owning-proof-20260930.log`.
Installed and built ordinary Earthlike scripts match SHA-256
`0f7068b90efa98b86bd371548882daa835b3bc10f0cc78a38b948b42b42576ca`.
That establishes same-name deployment, not a new live generation, naval
traversal, or updated screenshot gallery.
