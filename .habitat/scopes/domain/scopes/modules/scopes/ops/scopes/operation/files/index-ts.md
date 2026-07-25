# Operation Implementation File

Status: active working reference

Subject:
`<domain>/modules/<module>/ops/<operation>/index.ts`

Role:
the singular implementation binding for one operation contract.

Required shape:

- imports the local operation contract;
- imports semantic strategy implementations from leaf `index.ts` files;
- creates one operation whose implementations satisfy that shared contract;
- default-exports that operation.

The file may remain compact when a trivial single strategy is inline, but
semantic strategy identity is never reduced to `default`. At 300 lines, the
operation advisory directs authors to extract implementation into a strategy
leaf rather than grow an opaque router.

The file does not redefine the operation contract, derive public input/output
types, own policy or artifacts, or implement unrelated operations.
