# Domain Model Rules Scope

Status: active working reference

Subjects:

- `<domain>/model/rules/`
- `<domain>/modules/<module>/model/rules/`

Ownership boundary:
pure reusable computation shared at the exact semantic level. A rule rises
only when multiple child owners genuinely share it.

Rules do not own configuration, policy, artifacts, adapters, recipe behavior,
or generic math/grid utilities already owned by MapGen Core. A rule used by
only one operation stays under that operation.
