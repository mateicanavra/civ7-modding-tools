import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  installLocalSwooperPhysicsMod,
  SWOOPER_PHYSICS_MOD_ID,
} from "../../src/runtime/adapters/local-mod-install.js";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("Swooper Physics local mod installation", () => {
  test("binds the built tree to the realization's stable Civ7 mod identity", () => {
    const root = mkdtempSync(join(tmpdir(), "swooper-physics-install-"));
    roots.push(root);
    const inputDir = join(root, "input");
    const modsDir = join(root, "Mods");
    mkdirSync(join(inputDir, "maps"), { recursive: true });
    writeFileSync(join(inputDir, "maps", "standard.js"), "export {};\n");

    const result = installLocalSwooperPhysicsMod({ inputDir, modsDir });

    expect(SWOOPER_PHYSICS_MOD_ID).toBe("mod-swooper-maps");
    expect(result.targetDir).toBe(join(modsDir, SWOOPER_PHYSICS_MOD_ID));
    expect(result.filesCopied).toBe(1);
    expect(readFileSync(join(result.targetDir, "maps", "standard.js"), "utf8")).toBe(
      "export {};\n"
    );
  });

  test("replaces retired installed scripts without touching another mod", () => {
    const root = mkdtempSync(join(tmpdir(), "swooper-physics-install-retired-"));
    roots.push(root);
    const inputDir = join(root, "input");
    const modsDir = join(root, "Mods");
    const targetDir = join(modsDir, SWOOPER_PHYSICS_MOD_ID);
    const otherModDir = join(modsDir, "other-mod");
    mkdirSync(join(inputDir, "maps"), { recursive: true });
    mkdirSync(join(targetDir, "maps"), { recursive: true });
    mkdirSync(otherModDir, { recursive: true });
    writeFileSync(join(inputDir, "maps", "swooper-earthlike.js"), "export {};\n");
    writeFileSync(join(targetDir, "maps", "retired-map.js"), "stale\n");
    writeFileSync(join(otherModDir, "keep.txt"), "keep\n");

    const result = installLocalSwooperPhysicsMod({ inputDir, modsDir });

    expect(result.targetDir).toBe(targetDir);
    expect(result.filesCopied).toBe(1);
    expect(existsSync(join(targetDir, "maps", "retired-map.js"))).toBe(false);
    expect(readFileSync(join(targetDir, "maps", "swooper-earthlike.js"), "utf8")).toBe(
      "export {};\n"
    );
    expect(readFileSync(join(otherModDir, "keep.txt"), "utf8")).toBe("keep\n");
  });
});
