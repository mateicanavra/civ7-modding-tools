import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TUnitLocalization = TClassProperties<UnitLocalization>;
export class UnitLocalization extends BaseLocalization<TUnitLocalization> {
  name = "";
  description = "";

  constructor(payload: Partial<TUnitLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
