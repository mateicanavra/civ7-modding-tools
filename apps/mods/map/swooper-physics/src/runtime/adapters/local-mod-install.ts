import { type DeployResult, deployMod } from "@civ7/plugin-mods";

/** Stable Civ7 installation identity of the Swooper Physics mod realization. */
export const SWOOPER_PHYSICS_MOD_ID = "mod-swooper-maps";

/** Installs one built Swooper Physics mod tree into a local Civ7 Mods directory. */
export function installLocalSwooperPhysicsMod(options: {
  inputDir: string;
  modsDir?: string;
}): DeployResult {
  return deployMod({
    inputDir: options.inputDir,
    modId: SWOOPER_PHYSICS_MOD_ID,
    modsDir: options.modsDir,
  });
}
