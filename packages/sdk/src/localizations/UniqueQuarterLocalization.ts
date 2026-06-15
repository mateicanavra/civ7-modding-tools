import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TUniqueQuarterLocalization = TClassProperties<UniqueQuarterLocalization>;
export class UniqueQuarterLocalization extends BaseLocalization<TUniqueQuarterLocalization> {
  name = "";
  description = "";

  constructor(payload: Partial<TUniqueQuarterLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
