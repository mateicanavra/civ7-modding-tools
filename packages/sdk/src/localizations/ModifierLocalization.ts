import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TModifierLocalization = TClassProperties<ModifierLocalization>;
/** Supplies localized descriptive copy for a gameplay modifier. */
export class ModifierLocalization extends BaseLocalization<TModifierLocalization> {
  description = "";

  constructor(payload: Partial<TModifierLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
