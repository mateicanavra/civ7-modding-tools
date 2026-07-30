import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TUnitLocalization = TClassProperties<UnitLocalization>;
/** Supplies the localized name and description shown for a unit. */
export class UnitLocalization extends BaseLocalization<TUnitLocalization> {
  name = "";
  description = "";

  constructor(payload: Partial<TUnitLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
