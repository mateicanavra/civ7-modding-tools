import { defineConfig } from "tsup";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { readdirSync } from "node:fs";
import type { Plugin } from "esbuild";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// Reuse mapgen-core’s TypeBox format shim to avoid Unicode regexes in Civ7’s V8 (built-in format validation is disabled).
const typeboxFormatShim = join(__dirname, "../../packages/mapgen-core/src/shims/typebox-format.ts");
const typeboxGuardEmitShim = join(__dirname, "../../packages/mapgen-core/src/shims/typebox-guard-emit.ts");
const civ7TextEncoderBootstrap = `
// Civ7's MapGeneration V8 does not expose Web TextEncoder. This bundle-level
// bootstrap must run before bundled dependencies evaluate because TypeBox and
// mapgen-core create TextEncoder instances during module initialization.
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = class TextEncoder {
    constructor() {
      this.encoding = "utf-8";
    }
    encode(input = "") {
      const bytes = [];
      const value = String(input);
      for (let i = 0; i < value.length; i++) {
        let codePoint = value.codePointAt(i);
        if (codePoint === undefined) continue;
        if (codePoint > 0xffff) i++;
        if (codePoint <= 0x7f) {
          bytes.push(codePoint);
        } else if (codePoint <= 0x7ff) {
          bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        } else if (codePoint <= 0xffff) {
          bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        } else {
          bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        }
      }
      return new Uint8Array(bytes);
    }
    encodeInto(source, destination) {
      const encoded = this.encode(source);
      const writeLength = Math.min(encoded.length, destination.length);
      for (let i = 0; i < writeLength; i++) destination[i] = encoded[i];
      return { read: String(source).length, written: writeLength };
    }
  };
}
`;
const typeboxFormatPlugin: Plugin = {
  name: "typebox-format-shim",
  setup(build) {
    build.onResolve({ filter: /^typebox\/format$/ }, () => ({ path: typeboxFormatShim }));
    build.onResolve({ filter: /format[/\\]index\.mjs$/ }, (args) => {
      if (args.importer.includes("/typebox/") || args.importer.includes("\\typebox\\")) {
        return { path: typeboxFormatShim };
      }
      return null;
    });
    build.onResolve({ filter: /(^|[/\\])emit\.mjs$/ }, (args) => {
      if (
        args.path.endsWith("emit.mjs") &&
        (args.importer.includes("/typebox/build/guard/") || args.importer.includes("\\typebox\\build\\guard\\"))
      ) {
        return { path: typeboxGuardEmitShim };
      }
      return null;
    });
  },
};

export default defineConfig({
  banner: {
    js: civ7TextEncoderBootstrap,
  },

  // Generated from canonical src/maps/configs/*.config.json by `bun run gen:maps`.
  entry: Object.fromEntries(
    readdirSync(join(__dirname, "src/maps/generated"))
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
    "@mateicanavra/civ7-sdk",
    "typebox",
  ],

  esbuildOptions(options) {
    // Shim TypeBox format registry so no Unicode-property regexes reach the game engine (built-in format validation disabled).
    options.splitting = false;
    options.target = "esnext";
    // If tsup auto-externalizes deps, ensure TypeBox is bundled (MapGeneration cannot resolve "typebox").
    options.external = (options.external ?? []).filter((id) => !id.startsWith("typebox"));
    options.alias = {
      "typebox/format": typeboxFormatShim,
    };
  },
  esbuildPlugins: [typeboxFormatPlugin],

  // Civ7 doesn't use source maps
  sourcemap: false,
  minify: false,
});
