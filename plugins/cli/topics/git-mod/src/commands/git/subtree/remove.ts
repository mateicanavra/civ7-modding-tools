import SubtreeRemoveConfigBase from "../../../adapters/subtree/subtree-remove-config-base.js";

export default class GitSubtreeRemove extends SubtreeRemoveConfigBase {
  static summary = "Remove a stored git subtree configuration";
  static description = "Delete config for a slug or repo URL.";
  protected domain = "git";
  protected getPrefix(slug: string): string {
    return slug;
  }
}
