import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TConstructibleLocalization = TClassProperties<ConstructibleLocalization>;

export class ConstructibleLocalization extends BaseLocalization<TConstructibleLocalization> {
  name = "test";
  description = "text";
  tooltip = "Tooltip";

  constructor(payload: Partial<TConstructibleLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
