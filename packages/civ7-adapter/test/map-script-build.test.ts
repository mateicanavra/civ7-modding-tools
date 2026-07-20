import { describe, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { civ7MapScriptTextEncoderBanner } from "../tools/map-script-build.js";

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
});
