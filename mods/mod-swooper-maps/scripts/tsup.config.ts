import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  civ7MapScriptTextEncoderBanner,
  civ7TypeBoxCompatibilityPlugin,
} from "@civ7/adapter/map-script-build";
import { defineConfig } from "tsup";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  banner: {
    js: civ7MapScriptTextEncoderBanner,
  },

  // Generated from canonical configs by `nx run mod-swooper-maps:gen:maps`.
  entry: Object.fromEntries(
    readdirSync(join(__dirname, "../src/maps/generated"))
      .filter((file) => file.endsWith(".ts"))
      .sort()
      .map((file) => [file.replace(/\.ts$/, ""), `src/maps/generated/${file}`])
  ),

  // Output directly to the structure the .modinfo expects
  outDir: "mod/maps",

  format: ["esm"],
  target: "esnext",

  // Bundle all dependencies into the output file
  bundle: true,
  // Avoid shared chunks: Civ7 MapGeneration script loader may not resolve mod-local relative imports.
  splitting: false,
  // Bundle node_modules deps too (Civ7 cannot resolve bare specifiers like "typebox" at runtime).
  skipNodeModulesBundle: false,

  // Clear mod/maps between builds to avoid stale chunks.
  clean: true,

  // CRITICAL: Keep /base-standard/... imports external
  // These are resolved at runtime by the Civ7 game engine
  external: [/^\/base-standard\/.*/],

  // Civ7 loads each generated map file as a self-contained game script. SDK/core/adapter
  // authoring packages must be bundled into that script; only engine virtual modules may
  // remain as imports for the game loader to resolve.
  noExternal: [
    "@swooper/mapgen-core",
    "@civ7/adapter",
    "@civ7/map-policy",
    "@civ7/studio-contract",
    "@mateicanavra/civ7-sdk",
    "typebox",
  ],

  esbuildOptions(options) {
    options.splitting = false;
    options.target = "esnext";
    // If tsup auto-externalizes deps, ensure TypeBox is bundled (MapGeneration cannot resolve "typebox").
    options.external = (options.external ?? []).filter((id) => !id.startsWith("typebox"));
  },
  esbuildPlugins: [civ7TypeBoxCompatibilityPlugin],

  // Civ7 doesn't use source maps
  sourcemap: false,
  minify: false,
});
