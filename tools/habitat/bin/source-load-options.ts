import { createRequire } from "node:module";
import path from "node:path";
import { Plugin, type Interfaces } from "@oclif/core";

const require = createRequire(import.meta.url);
const helpPluginRoot = path.resolve(path.dirname(require.resolve("@oclif/plugin-help")), "..");

/** Builds the source CLI graph without consulting Habitat's release manifest. */
export async function makeSourceLoadOptions(root: string, pjson: Interfaces.PJSON) {
  const rootPlugin = new Plugin({
    root,
    pjson,
    isRoot: true,
    ignoreManifest: true,
  });
  await rootPlugin.load();

  const helpPlugin = new Plugin({
    root: helpPluginRoot,
    type: "core",
    parent: rootPlugin,
  });
  await helpPlugin.load();
  rootPlugin.children.push(helpPlugin);

  return {
    root,
    pjson,
    plugins: new Map([
      [rootPlugin.name, rootPlugin],
      [helpPlugin.name, helpPlugin],
    ]),
  };
}
