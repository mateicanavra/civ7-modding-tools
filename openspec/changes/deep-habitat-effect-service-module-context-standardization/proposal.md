# deep-habitat-effect-service-module-context-standardization

## Why

Habitat's Effect-oRPC service layer should have one obvious authoring shape.
The root service context defines requirements, the root service implementer
joins those requirements with the contract, each module context decorates its
owned implementer branch, and each router authors procedure logic directly.

The current service spine mostly follows that shape, but it still keeps a
duplicate `base.ts` runtime tag and module-specific implementer export names
such as `verifyModule` and `checkModule`. Those names make every module look
slightly bespoke even though the role is identical.

## What Changes

- Move `HabitatServiceRuntime` into `service/context.ts` and delete
  `service/base.ts`.
- Standardize every service module context file to export a single
  `module` implementer created from `habitatServiceImplementer.<module>`.
- Update routers to import and use that module implementer directly while
  keeping procedure bodies in router files.
- Extend the existing Habitat service architecture guard so module context
  files must use the standard implementer export.
- Delete the verify router source-text test now that structural enforcement is
  owned by Habitat's guard layer.

## Non-Goals

- Do not change Habitat command behavior, oRPC contracts, CLI output, provider
  layers, or public command exports.
- Do not introduce compatibility aliases for the old module implementer names.
- Do not move procedure bodies out of router files.
