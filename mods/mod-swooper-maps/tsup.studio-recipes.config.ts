import { defineConfig } from "tsup";
import { fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";
import { existsSync, statSync } from "node:fs";
import type { Plugin } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const domainRoot = resolvePath(__dirname, "src/domain");

function resolveWithJsToTsFallback(absPath: string): string | null {
  if (existsSync(absPath)) return absPath;
  if (absPath.endsWith(".js") || absPath.endsWith(".mjs")) {
    const tsCandidate = absPath.replace(/\.(m?js)$/, ".ts");
    if (existsSync(tsCandidate)) return tsCandidate;
    const tsxCandidate = absPath.replace(/\.(m?js)$/, ".tsx");
    if (existsSync(tsxCandidate)) return tsxCandidate;
  }
  return null;
}

function resolveFileOrDir(absPath: string): string | null {
  const tsCandidate = `${absPath}.ts`;
  if (existsSync(tsCandidate)) return tsCandidate;
  const tsxCandidate = `${absPath}.tsx`;
  if (existsSync(tsxCandidate)) return tsxCandidate;

  const direct = resolveWithJsToTsFallback(absPath);
  if (direct && existsSync(direct)) {
    try {
      const st = statSync(direct);
      if (st.isFile()) return direct;
      if (st.isDirectory()) {
        const indexTs = resolvePath(direct, "index.ts");
        if (existsSync(indexTs)) return indexTs;
        const indexTsx = resolvePath(direct, "index.tsx");
        if (existsSync(indexTsx)) return indexTsx;
      }
    } catch {
      // ignore
    }
  }

  if (existsSync(absPath)) {
    try {
      const st = statSync(absPath);
      if (st.isDirectory()) {
        const indexTs = resolvePath(absPath, "index.ts");
        if (existsSync(indexTs)) return indexTs;
        const indexTsx = resolvePath(absPath, "index.tsx");
        if (existsSync(indexTsx)) return indexTsx;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function resolveJsToTsInRepo(): Plugin {
  return {
    name: "resolve-js-to-ts-in-repo",
    setup(build) {
      build.onResolve({ filter: /\.[mc]?js$/ }, (args) => {
        if (!args.importer) return null;
        if (args.importer.includes("/node_modules/") || args.importer.includes("\\node_modules\\")) return null;
        if (!args.path.startsWith(".") && !args.path.startsWith("/")) return null;

        const qIndex = args.path.indexOf("?");
        const base = qIndex === -1 ? args.path : args.path.slice(0, qIndex);
        const query = qIndex === -1 ? "" : args.path.slice(qIndex);

        const absBase = resolvePath(dirname(args.importer), base);
        if (existsSync(absBase)) return null;

        const absTs = resolveFileOrDir(absBase.replace(/\.(m?js)$/, ".ts"));
        if (absTs) return { path: `${absTs}${query}` };
        const absTsx = resolveFileOrDir(absBase.replace(/\.(m?js)$/, ".tsx"));
        if (absTsx) return { path: `${absTsx}${query}` };

        return null;
      });
    },
  };
}

function mapgenDomainAlias(): Plugin {
  return {
    name: "mapgen-domain-alias",
    setup(build) {
      build.onResolve({ filter: /^@mapgen\/domain$/ }, () => ({
        path: resolvePath(domainRoot, "index.ts"),
      }));
      build.onResolve({ filter: /^@mapgen\/domain\/config$/ }, () => ({
        path: resolvePath(domainRoot, "config.ts"),
      }));
      build.onResolve({ filter: /^@mapgen\/domain\/(.+)$/ }, (args) => {
        const rel = args.path.replace(/^@mapgen\/domain\//, "");
        const abs = resolvePath(domainRoot, rel);
        const resolved = resolveFileOrDir(abs);
        if (resolved) return { path: resolved };
        return { path: abs };
      });
    },
  };
}

export default defineConfig({
  entry: {
    "recipes/browser-test": "src/recipes/browser-test/recipe.ts",
    "recipes/standard": "src/recipes/standard/recipe.ts",
  },
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  dts: false,
  clean: true,
  bundle: true,
  splitting: false,
  esbuildPlugins: [mapgenDomainAlias(), resolveJsToTsInRepo()],
});
