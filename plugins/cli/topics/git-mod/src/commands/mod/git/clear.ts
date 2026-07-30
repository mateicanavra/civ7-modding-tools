import SubtreeClearConfigBase from '../../../adapters/subtree/subtree-clear-config-base.js';

export default class ModGitClear extends SubtreeClearConfigBase {
  static summary = 'Delete all stored mod subtree configurations';
  static aliases = ['link:clear'];
  protected domain = 'mod';
  protected getPrefix(slug: string): string {
    return `mods/${slug}`;
  }
}
