import SubtreeImportBase from "../../../adapters/subtree/subtree-import-base.js";

export default class GitSetup extends SubtreeImportBase {
  static summary = "Configure and import a repository into a subtree";
  static description = "Adds the remote and imports the repository under a prefix.";

  protected domain = "git";
}
