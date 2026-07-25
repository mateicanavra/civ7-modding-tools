# Domain Policy Concern File

Status: active working reference

Subject:
`<model>/policy/<concern>.ts`

Role:
one named semantic policy concern at its owning domain or module level.

The file may expose policy types, constants, tables, and pure decision
functions. It does not re-export another authority, reach into sibling module
internals, implement an operation, call adapters, duplicate generic utilities,
or own official Civ7 resources.
