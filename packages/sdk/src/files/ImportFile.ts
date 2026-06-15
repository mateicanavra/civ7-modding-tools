import * as fs from "node:fs";

import { TClassProperties } from "../types";

import { BaseFile } from "./BaseFile";

type TXmlFile = TClassProperties<ImportFile>;

export class ImportFile extends BaseFile<ImportFile> implements TXmlFile {
  path = "/imports/";
  content = "";

  constructor(payload: Partial<TXmlFile> = {}) {
    super();
    this.fill(payload);
  }

  write(dist: string) {
    console.log(`${dist}${this.path}${this.name}`);
    fs.mkdirSync(`${dist}${this.path}`, { recursive: true });
    fs.cpSync(this.content, `${dist}${this.path}${this.name}`);
  }
}
