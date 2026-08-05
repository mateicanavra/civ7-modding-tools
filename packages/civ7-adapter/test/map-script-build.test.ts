import { describe, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { join } from "node:path";
import { build } from "esbuild";
import {
  civ7MapScriptTextEncoderBanner,
  civ7TypeBoxCompatibilityPlugin,
} from "../tools/map-script-build.js";

type CompatibleTextEncoder = Readonly<{
  encoding: string;
  encode: (input?: string) => Uint8Array;
  encodeInto: (
    source: string,
    destination: Uint8Array
  ) => Readonly<{ read: number; written: number }>;
}>;
type CompatibleTextEncoderConstructor = new () => CompatibleTextEncoder;

function evaluateBanner(
  existing?: CompatibleTextEncoderConstructor
): CompatibleTextEncoderConstructor {
  const sandbox: {
    TextEncoder?: CompatibleTextEncoderConstructor;
    Uint8Array: Uint8ArrayConstructor;
  } = { TextEncoder: existing, Uint8Array };
  runInNewContext(civ7MapScriptTextEncoderBanner, sandbox);
  if (!sandbox.TextEncoder) throw new Error("Civ7 TextEncoder banner installed no constructor");
  return sandbox.TextEncoder;
}

type TypeBoxCompatibilityProof = Readonly<{
  urls: readonly Readonly<{ href: string; pathname: string; hash: string }>[];
  plain: boolean;
  recursive: boolean;
  recursiveRefusal: boolean;
  fragment: boolean;
  fragmentRefusal: boolean;
}>;

async function evaluateTypeBoxCompatibility(): Promise<TypeBoxCompatibilityProof> {
  const result = await build({
    stdin: {
      contents: `
        import { Type } from "typebox";
        import { Compile } from "typebox/compile";
        import { TypeBoxURL } from "civ7:typebox-url";

        const recursiveSchema = Type.Cyclic(
          {
            JsonValue: Type.Union([
              Type.Null(),
              Type.Array(Type.Ref("JsonValue")),
            ]),
          },
          "JsonValue"
        );
        const fragmentSchema = {
          $id: "Root",
          $defs: { Leaf: Type.Object({ value: Type.Number() }) },
          $ref: "#/$defs/Leaf",
        };
        const urls = [
          new TypeBoxURL("http://unknown"),
          new TypeBoxURL("JsonValue", "http://unknown/"),
          new TypeBoxURL("#/$defs/Leaf", "http://unknown/Root"),
        ];
        globalThis.__typeBoxCompatibilityProof = {
          urls: urls.map(({ href, pathname, hash }) => ({ href, pathname, hash })),
          plain: Compile(Type.Object({ value: Type.Number() })).Check({ value: 1 }),
          recursive: Compile(recursiveSchema).Check([null, [null]]),
          recursiveRefusal: Compile(recursiveSchema).Check([1]),
          fragment: Compile(fragmentSchema).Check({ value: 1 }),
          fragmentRefusal: Compile(fragmentSchema).Check({ value: "one" }),
        };
      `,
      loader: "js",
      resolveDir: join(import.meta.dir, "..", "..", ".."),
      sourcefile: "civ7-typebox-url-compatibility.js",
    },
    banner: { js: civ7MapScriptTextEncoderBanner },
    bundle: true,
    format: "iife",
    logLevel: "silent",
    platform: "neutral",
    plugins: [civ7TypeBoxCompatibilityPlugin],
    write: false,
  });
  const sandbox: { __typeBoxCompatibilityProof?: TypeBoxCompatibilityProof } = {};
  runInNewContext(result.outputFiles[0]!.text, sandbox);
  if (!sandbox.__typeBoxCompatibilityProof) {
    throw new Error("Civ7 TypeBox compatibility bundle emitted no proof.");
  }
  return JSON.parse(JSON.stringify(sandbox.__typeBoxCompatibilityProof));
}

describe("Civ7 map-script build support", () => {
  test("preserves an existing TextEncoder implementation", () => {
    class ExistingTextEncoder implements CompatibleTextEncoder {
      readonly encoding = "utf-8";

      encode(): Uint8Array {
        return new Uint8Array();
      }

      encodeInto(): Readonly<{ read: number; written: number }> {
        return { read: 0, written: 0 };
      }
    }

    expect(evaluateBanner(ExistingTextEncoder)).toBe(ExistingTextEncoder);
  });

  test("installs deterministic UTF-8 encoding when the host omits TextEncoder", () => {
    const Encoder = evaluateBanner();
    const encoder = new Encoder();

    expect(encoder.encoding).toBe("utf-8");
    expect(Array.from(encoder.encode("map"))).toEqual([0x6d, 0x61, 0x70]);
    expect(Array.from(encoder.encode("é"))).toEqual([0xc3, 0xa9]);
    expect(Array.from(encoder.encode("🗺"))).toEqual([0xf0, 0x9f, 0x97, 0xba]);
    expect(Array.from(encoder.encode("\ud800"))).toEqual([0xef, 0xbf, 0xbd]);
  });

  test("encodes only complete code points into bounded destinations", () => {
    const encoder = new (evaluateBanner())();

    const oneByte = new Uint8Array(1);
    expect(encoder.encodeInto("é", oneByte)).toEqual({ read: 0, written: 0 });
    expect(Array.from(oneByte)).toEqual([0]);

    const threeBytes = new Uint8Array(3);
    expect(encoder.encodeInto("🗺", threeBytes)).toEqual({ read: 0, written: 0 });
    expect(Array.from(threeBytes)).toEqual([0, 0, 0]);

    const fourBytes = new Uint8Array(4);
    expect(encoder.encodeInto("🗺", fourBytes)).toEqual({ read: 2, written: 4 });
    expect(Array.from(fourBytes)).toEqual([0xf0, 0x9f, 0x97, 0xba]);

    const twoBytes = new Uint8Array(2);
    expect(encoder.encodeInto("aé", twoBytes)).toEqual({ read: 1, written: 1 });
    expect(Array.from(twoBytes)).toEqual([0x61, 0]);
  });

  test("keeps TypeBox compilation and reference resolution host-independent", async () => {
    const proof = await evaluateTypeBoxCompatibility();
    const oracle = [
      new URL("http://unknown"),
      new URL("JsonValue", "http://unknown/"),
      new URL("#/$defs/Leaf", "http://unknown/Root"),
    ].map(({ href, pathname, hash }) => ({ href, pathname, hash }));

    expect(proof.urls).toEqual(oracle);
    expect(proof).toMatchObject({
      plain: true,
      recursive: true,
      recursiveRefusal: false,
      fragment: true,
      fragmentRefusal: false,
    });
  });
});
