import * as fs from "node:fs";
import * as path from "node:path";
import { ACTION_GROUP_ACTION } from "../constants";
import { ImportFile } from "../files";
import { ActionGroupNode } from "../nodes";
import { TClassProperties, TObjectValues } from "../types";
import { BaseBuilder } from "./BaseBuilder";

type TImportFileBuilder = TClassProperties<ImportFileBuilder>;

export class ImportFileBuilder extends BaseBuilder<TImportFileBuilder> {
  content: string = "";
  name: string = "";
  actionGroups: ActionGroupNode[] = [];
  actionGroupActions: TObjectValues<typeof ACTION_GROUP_ACTION>[] = [];

  constructor(payload: Partial<TImportFileBuilder> = {}) {
    super();
    this.fill(payload);
  }

  build() {
    if (!fs.existsSync(this.content)) {
      return [];
    }

    return [
      new ImportFile({
        name: this.name ? this.name : path.basename(this.content),
        content: this.content,
        actionGroups:
          this.actionGroups.length > 0
            ? this.actionGroups
            : [this.actionGroupBundle.shell, this.actionGroupBundle.always],
        actionGroupActions:
          this.actionGroupActions.length > 0
            ? this.actionGroupActions
            : [ACTION_GROUP_ACTION.IMPORT_FILES],
      }),
    ];
  }
}
