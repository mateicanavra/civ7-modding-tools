import "../../src/app-ui-shell.js";

type ShellTag = HTMLElementTagNameMap["fxs-button"];
// @ts-expect-error The shell realm must not activate a game-only element.
type GameOnlyTag = HTMLElementTagNameMap["screen-benchmark"];

declare const shellTag: ShellTag;
void shellTag;

export {};
