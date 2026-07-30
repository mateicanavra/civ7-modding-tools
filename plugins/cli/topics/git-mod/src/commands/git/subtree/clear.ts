import SubtreeClearConfigBase from "../../../adapters/subtree/subtree-clear-config-base.js";

export default class GitSubtreeClear extends SubtreeClearConfigBase {
  static summary = "Delete all stored git subtree configurations";
  protected domain = "git";
  protected getPrefix(slug: string): string {
    return slug;
  }
}
