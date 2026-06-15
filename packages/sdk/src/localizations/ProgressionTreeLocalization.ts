import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TProgressionTreeLocalization = TClassProperties<ProgressionTreeLocalization>;
export class ProgressionTreeLocalization extends BaseLocalization<TProgressionTreeLocalization> {
  name = "";

  constructor(payload: Partial<TProgressionTreeLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
