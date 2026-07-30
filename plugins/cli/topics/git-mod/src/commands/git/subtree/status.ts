import SubtreeStatusBase from "../../../adapters/subtree/subtree-status-base.js";

export default class GitStatus extends SubtreeStatusBase {
  static summary = "Show git subtree status";
  static description = "Displays push configuration for the subtree's remote.";

  protected domain = "git";
}
