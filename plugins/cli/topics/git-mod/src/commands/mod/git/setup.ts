import { Args } from '@oclif/core';
import SubtreeImportBase from '../../../utils/subtree/SubtreeImportBase.js';

export default class ModGitSetup extends SubtreeImportBase {
  static summary = 'Configure and import a mod in one step';
  static description = 'Adds the remote and imports the repository into mods/<slug>.';
  static args = { slug: Args.string({ description: 'Mod slug', required: true }) } as const;
  static aliases = ['link:setup'];

  protected domain = 'mod';

  protected getPrefix(slug: string): string {
    return `mods/${slug}`;
  }
}
