import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TTraditionLocalization = TClassProperties<TraditionLocalization>;
/** Supplies the localized name and description shown for a tradition. */
export class TraditionLocalization extends BaseLocalization<TTraditionLocalization> {
  name = "";
  description = "";

  constructor(payload: Partial<TTraditionLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
