import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TTraditionLocalization = TClassProperties<TraditionLocalization>;
export class TraditionLocalization extends BaseLocalization<TTraditionLocalization> {
  name = "";
  description = "";

  constructor(payload: Partial<TTraditionLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
