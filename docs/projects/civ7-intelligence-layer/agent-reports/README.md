# Agent Reports

This directory holds normative lane reports for the Civ7 intelligence open
threads investigation. Reports are workstream inputs, not final synthesis.

Assumption-audit follow-up reports:

- [assumption-audit-script-contexts.md](assumption-audit-script-contexts.md)
- [assumption-audit-architecture-simplification.md](assumption-audit-architecture-simplification.md)
- [assumption-audit-direct-control-hotseat.md](assumption-audit-direct-control-hotseat.md)
- [assumption-audit-api-contract.md](assumption-audit-api-contract.md)

Each report should include:

- Agent and lane.
- `/goal` objective received.
- Sources inspected, with paths or URLs.
- Probes run, with commands where safe to record.
- Findings with claim labels:
  - `verified-local`
  - `source-backed`
  - `corroborated-external`
  - `hypothesis`
  - `eliminated`
- Actuation-path classification:
  - production candidate
  - probe candidate
  - static-only lever
  - observation-only signal
  - eliminated path
  - deferred reverse-engineering thread
- Product implication for strategy agents.
- Safety or live-game risk.
- Remaining unknowns and exact next probes.
