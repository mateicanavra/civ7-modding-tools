# Review Disposition Ledger

| Finding | Lane | Severity | Summary | Disposition | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| SCDS-R0 | internal drafting | P1 | The row could overclaim all-mod enforcement because registry metadata says `mods/*` while the current Habitat adapter only scans Swooper roots. | accepted | Proposal, design, spec, tasks, and downstream ledger separate raw regex capability, registry metadata, wrapper scan roots, and current Swooper enforcement. | repaired in draft |
| SCDS-R1 | internal drafting | P1 | Step-contract policy could be diluted by ordinary recipe allowances for `/ops` and `/config.js`. | accepted | Packet states domain root is the only allowed step-contract domain source and requires `/ops` and `/config.js` positives for this row. | repaired in draft |
| SCDS-R2 | internal drafting | P1 | Filename regex can match lookalikes such as `notacontract.ts`, contradicting metadata that names `contract.ts` and `*.contract.ts`. | accepted | Packet requires filename controls and blocks exact filename-scope claims until predicate repair, sibling ownership, or blocked downstream owner is recorded. | repaired in draft |
| SCDS-R3 | internal drafting | P2 | Native samples do not cover namespace imports, type imports, side-effect imports, or re-export forms. | accepted | Packet requires parser-form fixture or adapter proof for all claimed import/export forms. | repaired in draft |
| SCDS-R4 | internal drafting | P2 | Recipe-local tests under `steps/**` can match the raw predicate. | accepted | Packet requires recipe-local test-path classification for `__tests__`, `__type_tests__`, `*.test.ts`, and `*.spec.ts`. | repaired in draft |
| SCDS-R5 | internal drafting | P2 | The row overlaps with recipe-domain, domain-deep, and contract-export checks. | accepted | Packet requires multi-rule expectation or predicate partition proof, including remediation-owner records. | repaired in draft |
| SCDS-R6 | internal drafting | P2 | Current direct Grit proof uses disposable probes rather than committed fixtures or wrapper-injected proof. | accepted | Packet records disposable probes only as seed evidence and requires durable fixture or accepted adapter proof before closure. | repaired in draft |
| SCDS-R7 | internal drafting | P2 | Missing explicit baseline can let `baseline-integrity` pass without proving this rule's committed empty baseline and unbaselined injected finding. | accepted | Packet requires `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json` as `[]`, integrity proof, and injected-finding failure proof. | repaired in draft |
| SCDS-R8 | internal drafting | P2 | Manual injected proof could preserve the untyped command/JSON/cleanup failure classes that motivated the adapter repair. | accepted | Packet blocks injected-probe implementation until `habitat-effect-grit-adapter` or equivalent typed substrate is accepted. | repaired in draft |
| SCDS-R9 | external adversarial review | P2 | The leading-wildcard source regex can report prefixed or relative source-specifier lookalikes containing `@mapgen/domain/<domain>/<tail>`, so exact source-scope enforcement could be overclaimed. | accepted | Proposal, design, spec, tasks, evidence, phase, and downstream ledgers now require source-specifier lookalike controls before exact source-scope claims. | repaired after review |
| SCDS-R10 | external adversarial review | P2 | The authority order let H5/H6 records outrank current pattern and command behavior for behavior claims. | accepted | Source synthesis now splits policy/product authority from behavior/proof authority and marks H5/H6 only as historical parity targets until current proof ids re-establish their claims. | repaired after review |

## External Review Result

Agent `019ec731-6096-71e2-af1e-08b432b632bc` returned no P1 findings and two
P2 findings. Both P2 findings are accepted and repaired in this packet.

Review lanes to run:

- product/outcome;
- Grit semantics;
- architecture/public-surface authority;
- evidence/proof classes;
- system ownership and stale-record risk;
- Effect/substrate fit.
