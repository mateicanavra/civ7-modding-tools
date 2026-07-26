# Domain Model Rule File

Status: active working reference

Subject:
`<model>/rules/<rule>.ts`

Role:
one pure computation shared by children of the owning model level.

The file may compose local atoms and policy. It does not recreate generic
MapGen utilities, define public contracts, perform runtime I/O, or reach into a
child operation's private implementation.
