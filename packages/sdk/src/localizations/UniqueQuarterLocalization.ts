import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TUniqueQuarterLocalization = TClassProperties<UniqueQuarterLocalization>;
/** Supplies the localized name and description shown for a unique quarter. */
export class UniqueQuarterLocalization extends BaseLocalization<TUniqueQuarterLocalization> {
  name = "";
  description = "";

  constructor(payload: Partial<TUniqueQuarterLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
