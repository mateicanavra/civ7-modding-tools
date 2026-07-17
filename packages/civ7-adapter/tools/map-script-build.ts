import { readFile } from "node:fs/promises";
import type { Plugin } from "esbuild";

const TYPEBOX_FORMAT_NAMESPACE = "civ7-typebox-format";
const TYPEBOX_FORMAT_MODULE = `
const formats = new Map();

export function Clear() { formats.clear(); }
export function Entries() { return [...formats.entries()]; }
export function Set(format, check) { formats.set(format, check); }
export function Has(format) { return formats.has(format); }
export function Get(format) { return formats.get(format); }
export function Test(format, value) { return formats.get(format)?.(value) ?? true; }
export function Reset() { Clear(); }

export const Format = { Clear, Entries, Set, Has, Get, Test, Reset };
export default Format;
`;
const TYPEBOX_UNICODE_IDENTIFIER_DECLARATION = String.raw`const identifierRegExp = /^[\p{ID_Start}_$][\p{ID_Continue}_$\u200C\u200D]*$/u;`;
const CIV7_ASCII_IDENTIFIER_DECLARATION = "const identifierRegExp = /^[$A-Z_][0-9A-Z_$]*$/i;";

/**
 * Installs the Web `TextEncoder` surface before a Civ7 map bundle evaluates.
 * Civ7's embedded V8 omits that API, while TypeBox constructs an encoder during
 * module initialization, so this code must remain an esbuild banner rather than
 * an imported polyfill.
 */
export const civ7MapScriptTextEncoderBanner = `
/* @civ7/adapter map-script TextEncoder compatibility */
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
        if (codePoint >= 0xd800 && codePoint <= 0xdfff) codePoint = 0xfffd;
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
      const value = String(source);
      let read = 0;
      let written = 0;
      while (read < value.length) {
        const codePoint = value.codePointAt(read);
        const codeUnitLength = codePoint !== undefined && codePoint > 0xffff ? 2 : 1;
        const encoded = this.encode(value.slice(read, read + codeUnitLength));
        if (written + encoded.length > destination.length) break;
        for (let i = 0; i < encoded.length; i++) destination[written + i] = encoded[i];
        read += codeUnitLength;
        written += encoded.length;
      }
      return { read, written };
    }
  };
}
`;

/**
 * Adapts TypeBox's final bundled modules to the syntax supported by Civ7's V8.
 * The format registry intentionally starts empty because no admitted MapGen
 * schema uses formats. The guard-emitter edit is surgical and fails closed when
 * a TypeBox upgrade changes the single upstream declaration we own replacing.
 */
export const civ7TypeBoxCompatibilityPlugin: Plugin = {
  name: "civ7-typebox-compatibility",
  setup(build) {
    build.onResolve({ filter: /^typebox\/format$/ }, () => ({
      path: "format",
      namespace: TYPEBOX_FORMAT_NAMESPACE,
    }));
    build.onResolve({ filter: /format[/\\]index\.mjs$/ }, (args) => {
      if (!args.importer.includes("/typebox/") && !args.importer.includes("\\typebox\\")) {
        return undefined;
      }
      return { path: "format", namespace: TYPEBOX_FORMAT_NAMESPACE };
    });
    build.onLoad({ filter: /.*/, namespace: TYPEBOX_FORMAT_NAMESPACE }, () => ({
      contents: TYPEBOX_FORMAT_MODULE,
      loader: "js",
    }));
    build.onLoad({ filter: /[/\\]typebox[/\\]build[/\\]guard[/\\]emit\.mjs$/ }, async (args) => {
      const source = await readFile(args.path, "utf8");
      const occurrences = source.split(TYPEBOX_UNICODE_IDENTIFIER_DECLARATION).length - 1;
      if (occurrences !== 1) {
        throw new Error(
          `TypeBox guard emitter compatibility expected one Unicode identifier declaration; found ${occurrences}.`
        );
      }
      return {
        contents: source.replace(
          TYPEBOX_UNICODE_IDENTIFIER_DECLARATION,
          CIV7_ASCII_IDENTIFIER_DECLARATION
        ),
        loader: "js",
      };
    });
  },
};
