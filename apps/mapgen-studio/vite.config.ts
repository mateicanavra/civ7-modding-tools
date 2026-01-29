import type { Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..", "..");

function resolveJsToTsInRepo(): Plugin {
  return {
    name: "resolve-js-to-ts-in-repo",
    async resolveId(source, importer, options) {
      if (!importer) return null;
      if (importer.includes("/node_modules/")) return null;
      if (!source.endsWith(".js") && !source.endsWith(".mjs")) return null;
      if (!source.startsWith(".") && !source.startsWith("/")) return null;

      // If the .js/.mjs resolves normally (e.g. real JS file), do nothing.
      const direct = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (direct) return null;

      const qIndex = source.indexOf("?");
      const base = qIndex === -1 ? source : source.slice(0, qIndex);
      const query = qIndex === -1 ? "" : source.slice(qIndex);

      const tsCandidate = `${base.replace(/\.(m?js)$/, ".ts")}${query}`;
      const tsxCandidate = `${base.replace(/\.(m?js)$/, ".tsx")}${query}`;

      const resolvedTs = await this.resolve(tsCandidate, importer, { ...options, skipSelf: true });
      if (resolvedTs) return resolvedTs;

      const resolvedTsx = await this.resolve(tsxCandidate, importer, { ...options, skipSelf: true });
      if (resolvedTsx) return resolvedTsx;

      return null;
    },
  };
}

export default defineConfig({
  plugins: [resolveJsToTsInRepo(), react()],
  resolve: {
    alias: [
      {
        find: "@mapgen/foundation-recipe",
        replacement: resolve(repoRoot, "mods/mod-swooper-maps/src/recipes/foundation/recipe.ts"),
      },
      {
        find: /^@mapgen\/domain$/,
        replacement: resolve(repoRoot, "mods/mod-swooper-maps/src/domain"),
      },
      {
        find: /^@mapgen\/domain\/(.*)$/,
        replacement: `${resolve(repoRoot, "mods/mod-swooper-maps/src/domain")}/$1`,
      },
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
    port: 5173,
  },
});
