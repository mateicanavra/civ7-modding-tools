import "../../src/map-script.js";

// @ts-expect-error The map realm must not activate app-UI elements.
type UiTag = HTMLElementTagNameMap["fxs-button"];

export {};
