import { randomUUID } from "node:crypto";

import { BaseNode } from "./BaseNode";

export type TVisualRemapNode = Pick<VisualRemapNode, "id" | "displayName" | "kind" | "from" | "to">;

/** Maps a gameplay type to another type's visual asset through a stable remap identifier. */
export class VisualRemapNode extends BaseNode<TVisualRemapNode> {
  id: string | null = randomUUID();
  displayName: string | null = "LOC_";
  kind: string | null = "UNIT";
  from: string | null = "UNIT_";
  to: string | null = "UNIT_";

  constructor(payload: Partial<TVisualRemapNode> = {}) {
    super();
    this.fill(payload);
  }

  toXmlElement() {
    return {
      Row: {
        ID: this.id,
        DisplayName: this.displayName,
        Kind: this.kind,
        From: this.from,
        To: this.to,
      },
    };
  }
}
