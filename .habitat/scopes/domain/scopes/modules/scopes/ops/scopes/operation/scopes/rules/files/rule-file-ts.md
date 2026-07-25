# Operation Rule File

Status: active working reference

Subject:
`<operation>/rules/<rule>.ts`

Role:
one pure helper owned by one operation.

The file receives explicit admitted values and returns deterministic results.
It does not own public contracts, perform runtime validation already owned by
the pipeline, duplicate generic Core helpers, or reach outside the owning
operation's admitted semantic dependencies.
