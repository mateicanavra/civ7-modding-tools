export * from "./constants";
export * from "./core";
export * from "./files";
export * from "./builders";
export * from "./types";
export * from "./utils";
export * from "./localizations";
export * from "./nodes";
export * from "./presets";
/**
 * The SDK root is consumed by Node/Bun build tools, playground examples, and
 * XML mod packages. Civ7 map generation binds to engine globals through the
 * adapter, so it is intentionally exported only from
 * `@mateicanavra/civ7-sdk/mapgen` where consumers opt into that runtime.
 */
