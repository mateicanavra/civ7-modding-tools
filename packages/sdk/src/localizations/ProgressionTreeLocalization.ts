import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TProgressionTreeLocalization = TClassProperties<ProgressionTreeLocalization>;
/** Supplies the localized display name for a progression tree. */
export class ProgressionTreeLocalization extends BaseLocalization<TProgressionTreeLocalization> {
  name = "";

  constructor(payload: Partial<TProgressionTreeLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
