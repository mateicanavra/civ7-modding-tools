import SubtreeListConfigBase from "../../../adapters/subtree/subtree-list-config-base.js";

export default class GitSubtreeList extends SubtreeListConfigBase {
  static summary = "List stored git subtree configurations";
  protected domain = "git";
}
