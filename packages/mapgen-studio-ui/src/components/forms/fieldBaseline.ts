import { createContext } from "react";

/**
 * Per-field baseline plumbing for the config form's working-change tracking.
 *
 * The baseline is the LOADED config's value at this field's path — the values
 * the user started from when they selected/imported the config — NOT the
 * recipe's schema defaults. Field drift ("you changed this") and the one-field
 * undo both key on it; reset-to-recipe-defaults is a separate, stage-level
 * action behind the stage options menu.
 *
 * Provided by `BrowserConfigFieldTemplate` (which knows the field's
 * `fieldPathId.path` — widgets never do path math) and consumed by the value
 * widgets. `null` means no baseline is available (bare `SchemaForm` reuse, or
 * the host passed none): widgets then render with no drift treatment and no
 * undo affordance.
 */
export type FieldBaseline = Readonly<{
  /** The loaded config's value at this field's path (may be `undefined`). */
  value: unknown;
}>;

export const FieldBaselineContext = createContext<FieldBaseline | null>(null);
