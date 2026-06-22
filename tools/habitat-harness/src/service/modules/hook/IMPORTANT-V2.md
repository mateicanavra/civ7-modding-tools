Finish whatever you're currently working on first. Once that domino is done, the next full domino is:

**Fix the router pattern — it's currently bypassing oRPC entirely.**

The current approach (creating named standalone functions like `runWhateverEffect` inside routers) is wrong. It bypasses EffectORPC and oRPC completely, which is fundamentally broken.

The correct pattern is simple: routers should be built through the implementer using oRPC procedure routers, with logic authored directly via EffectORPC — no standalone wrapper functions.

To figure out the exact correct pattern, research the magic migration repo: look at how it was done with the collect service and the collect refactor spec there.

Once the pattern is established:
1. Define and document the correct router pattern.
2. Apply it across all existing routers.

This is the final ratchet step to make this work correctly as an EffectORPC service.

Next stable domino:

Service procedures must stop pretending to be CLI inputs. Procedure contracts
should expose direct service actions a caller needs, not flags, arg arrays, or
CLI command vocabulary. The CLI owns parsing user flags and compiling them into
service-client calls; module routers own normal action procedures.


Bad example:

```
runPreCommitEffect
```

Good example:

see effect-orpc docs and magic-migration collect service router.ts examples
