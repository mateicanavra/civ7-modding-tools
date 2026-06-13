import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TModifierLocalization = TClassProperties<ModifierLocalization>;
export class ModifierLocalization extends BaseLocalization<TModifierLocalization> {
  description = "";

  constructor(payload: Partial<TModifierLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
