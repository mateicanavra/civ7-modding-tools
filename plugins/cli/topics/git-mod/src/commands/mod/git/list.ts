import SubtreeListConfigBase from '../../../adapters/subtree/subtree-list-config-base.js';

export default class ModGitList extends SubtreeListConfigBase {
  static summary = 'List stored mod subtree configurations';
  static aliases = ['link:list'];
  protected domain = 'mod';
}
