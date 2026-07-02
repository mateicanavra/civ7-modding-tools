import { Civ7ControlOrpcContract } from "@civ7/control-orpc/contract";
import {
  type StudioEffectContract,
  studioCiv7Contract,
  studioEffectContract,
} from "@civ7/studio-contract";
import { oc } from "@orpc/contract";

/**
 * `@civ7/studio-server/contract` — the server's published mount surface.
 *
 * The studio-owned contract itself lives in `@civ7/studio-contract`
 * (contract-first topology: this package IMPLEMENTS it via
 * `implementEffect(studioEffectContract, runtime)` in `router/index.ts`).
 * What stays here is the server's own composition — which procedures the
 * daemon mounts at `/rpc`:
 *
 * - `contract` / `StudioContract` — the unified client-facing contract:
 *   `studioEffectContract` with the canonical Civ7 control contract spread
 *   under `civ7.*`. The control procedures are implemented by
 *   `@civ7/control-orpc`'s prebuilt router and merged at the handler level;
 *   their I/O and error schemas are untouched here. This merge cannot move
 *   into the contract package: `Civ7ControlOrpcContract`'s value graph is
 *   effect-orpc-built inside a `kind:control` package.
 *
 * The `civ7.*` merge is collision-proof: the studio keys
 * (status/mapSummary/gameInfo/autoplay/setupConfig/savedConfigs/setupCatalog/live)
 * and the control namespaces
 * (attention/city/diplomacy/display/government/narrative/notifications/
 * progression/readiness/strategy/turn/unit/view/world) are disjoint, and the
 * single-mount contract pin asserts that stays true.
 *
 * NOTE: deliberately NO `export * from "@civ7/studio-contract"` here — the
 * contract package is the one owner of those names (import it directly), and
 * esbuild drops star re-exports of externals when this module is code-split
 * into a shared chunk (the named exports below survive; a star would not).
 */
export type StudioContract = Omit<StudioEffectContract, "civ7"> & {
  civ7: StudioEffectContract["civ7"] & typeof Civ7ControlOrpcContract;
};

export const contract: StudioContract = oc.router({
  ...studioEffectContract,
  civ7: {
    ...studioCiv7Contract,
    ...Civ7ControlOrpcContract,
  },
});
