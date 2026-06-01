import { Command, Flags } from '@oclif/core';

export default class GamePlayTopics extends Command {
  static id = 'game play topics';
  static summary = 'List live-play topic families and reference shortcuts';
  static description =
    'Prints a read-only index of Civ7 live-play support topics, relevant CLI shortcuts, and proof boundaries for blocker, tactical, city, strategy, and AI-reference work.';

  static examples = [
    '<%= config.bin %> game play topics',
    '<%= config.bin %> game play topics --family strategy',
    '<%= config.bin %> game play topics --family rhq-ai --json',
  ];

  static flags = {
    family: Flags.string({
      char: 'f',
      description: 'Topic family or alias to show',
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayTopics);
    const matches = flags.family ? findTopics(flags.family) : TOPICS;
    if (flags.family && matches.length === 0) {
      throw new Error(`Unknown live-play topic family: ${flags.family}`);
    }

    if (flags.json) {
      this.log(JSON.stringify({
        ok: true,
        topics: matches,
        availableFamilies: TOPICS.map((topic) => topic.family),
      }));
      return;
    }

    for (const topic of matches) {
      this.log(`${topic.family}: ${topic.purpose}`);
      this.log(`  proof: ${topic.proof}`);
      this.log(`  references: ${topic.references.join(', ')}`);
      this.log(`  commands: ${topic.commands.join(', ')}`);
      this.log(`  load when: ${topic.loadWhen}`);
      this.log(`  boundary: ${topic.boundary}`);
    }
  }
}

type Topic = Readonly<{
  family: string;
  aliases: ReadonlyArray<string>;
  purpose: string;
  proof: string;
  references: ReadonlyArray<string>;
  commands: ReadonlyArray<string>;
  loadWhen: string;
  boundary: string;
}>;

const TOPICS: ReadonlyArray<Topic> = [
  {
    family: 'blockers',
    aliases: ['hud', 'notifications', 'end-turn'],
    purpose: 'Resolve current App UI blockers without guessing from raw notification text.',
    proof: 'live-proved plus official UI/resource backing',
    references: [
      'docs/projects/civ7-live-play-support/topics/notification-decision-hud.md',
      'docs/projects/civ7-live-play-support/topics/end-turn-blockers.md',
      'docs/projects/civ7-live-play-support/topics/informational-notification-closeout.md',
    ],
    commands: [
      'game play notifications',
      'game play end-turn',
      'game play dismiss-notification',
      'game play advisor-warning',
    ],
    loadWhen: 'before any blocker closeout, end-turn, report dismissal, advisor warning, or stale notification decision',
    boundary: 'specialized gameplay blockers outrank generic dismissal; re-read after every mutation or long-latency call',
  },
  {
    family: 'progression',
    aliases: ['culture', 'tech', 'traditions', 'attributes', 'narrative', 'celebration'],
    purpose: 'Choose or close progression, story, policy, attribute, and celebration decisions.',
    proof: 'live-proved with postcondition gaps called out per subfamily',
    references: [
      'docs/projects/civ7-live-play-support/topics/progression-tree-targets.md',
      'docs/projects/civ7-live-play-support/topics/celebration-choice.md',
      'docs/projects/civ7-live-play-support/topics/notification-decision-hud.md',
    ],
    commands: [
      'game play choose-tech',
      'game play set-tech-target',
      'game play choose-culture',
      'game play set-culture-target',
      'game play choose-celebration',
      'game play choose-narrative',
      'game play buy-attribute',
      'game play change-tradition',
      'game play consider-attributes',
      'game play consider-traditions',
    ],
    loadWhen: 'when the HUD names tech, culture, celebration, narrative, attribute, or tradition blockers',
    boundary: 'use runtime enum/hash values, not row indexes or visible list positions',
  },
  {
    family: 'cities',
    aliases: ['production', 'population', 'towns', 'settlement', 'expansion'],
    purpose: 'Read city blockers and choose production, town focus, worker placement, expansion, or settlement planning paths.',
    proof: 'live-proved for key operation shapes; candidate ranking remains advisory',
    references: [
      'docs/projects/civ7-live-play-support/topics/production-build-placement.md',
      'docs/projects/civ7-live-play-support/topics/ready-city-decision-view.md',
      'docs/projects/civ7-live-play-support/topics/population-placement-expansion.md',
      'docs/projects/civ7-live-play-support/topics/settlement-recommendations.md',
    ],
    commands: [
      'game play ready-city',
      'game play build-production',
      'game play build-unit',
      'game play set-town-focus',
      'game play assign-worker',
      'game play expand-city',
      'game play settlement-recommendations',
    ],
    loadWhen: 'when production, town focus, new population, city expansion, or Settler route quality is the decision',
    boundary: 'settlement recommendations inform movement/founding; they do not replace live movement and operation validators',
  },
  {
    family: 'tactics',
    aliases: ['units', 'combat', 'commanders', 'promotion', 'upgrade', 'resettle'],
    purpose: 'Control ready units with stale-state guards, validator-backed target actions, and commander/promotion caution.',
    proof: 'live-proved for read views and several command shapes; combat outcomes require fresh postconditions',
    references: [
      'docs/projects/civ7-live-play-support/topics/ready-unit-commander-actions.md',
      'docs/projects/civ7-live-play-support/topics/unit-target-actions.md',
      'docs/projects/civ7-live-play-support/topics/early-war-tactical-stale-state-guard.md',
      'docs/projects/civ7-live-play-support/topics/unit-command-resettle-upgrade.md',
    ],
    commands: [
      'game play ready-unit',
      'game play promotion-readiness',
      'game play unit-target',
      'game play operation',
      'game play resettle-unit',
      'game play upgrade-unit',
    ],
    loadWhen: 'before moving, attacking, skipping, alerting, promoting, upgrading, or resettling a unit',
    boundary: 'validator success is not tactical success; no-state-change requires a fresh read before repeating',
  },
  {
    family: 'diplomacy',
    aliases: ['first-meet', 'influence', 'relations'],
    purpose: 'Handle diplomatic action responses and first-meet greetings without confusing them with dismissible reports.',
    proof: 'live-proved for ordinary diplomacy and first-meet operation shapes',
    references: [
      'docs/projects/civ7-live-play-support/topics/first-meet-diplomacy.md',
      'docs/projects/civ7-live-play-support/topics/notification-decision-hud.md',
      'docs/projects/civ7-live-play-support/topics/early-war-tactical-stale-state-guard.md',
    ],
    commands: [
      'game play respond-diplomacy',
      'game play respond-first-meet',
      'game play notifications',
    ],
    loadWhen: 'when the HUD reports diplomatic action, diplomatic response, first meet, grievance, or relationship pressure',
    boundary: 'grievance reports can be informational; first-meet and action responses are real player operations',
  },
  {
    family: 'runtime-sources',
    aliases: ['sqlite', 'local-data', 'catalog', 'authority'],
    purpose: 'Separate live runtime authority from static local catalog, save, log, and forensic evidence.',
    proof: 'source-authority reference',
    references: [
      'docs/projects/civ7-live-play-support/topics/runtime-state-sources.md',
      'docs/projects/civ7-live-play-support/topics/local-catalog-enrichment.md',
      'docs/projects/civ7-live-play-support/evidence-packs/local-on-disk-read-surfaces.md',
    ],
    commands: [
      'game local-data inspect',
      'game play notifications',
      'game watch',
    ],
    loadWhen: 'when deciding whether to poll the game UI/runtime or read local SQLite/resources',
    boundary: 'SQLite/resource rows enrich decisions; they are not current legality, validator, or postcondition proof',
  },
  {
    family: 'restart-watch',
    aliases: ['rehydrate', 'watch', 'observer', 'latency'],
    purpose: 'Recover after restart/reconnect and passively observe human or agent turns with freshness markers.',
    proof: 'live-proved watcher and restart guard',
    references: [
      'docs/projects/civ7-live-play-support/topics/restart-rehydration.md',
      'docs/projects/civ7-live-play-support/evidence-packs/watcher-latency-observer-mode.md',
      'docs/projects/civ7-live-play-support/topics/runtime-state-sources.md',
    ],
    commands: [
      'game play rehydrate',
      'game watch',
      'game play ready-unit',
    ],
    loadWhen: 'after restart, compacted context, tuner failure, human input, slow reads, or passive watcher handoff',
    boundary: 'prior thread state is only an expectation after restart; live rehydrate/watch output is the authority',
  },
  {
    family: 'strategy',
    aliases: ['multi-turn', 'autoplay', 'objectives', 'runner'],
    purpose: 'Frame short-horizon objectives and decide whether to use external runner, static mod, or native autoplay.',
    proof: 'reference-with-gap',
    references: [
      'docs/projects/civ7-live-play-support/topics/multi-turn-strategy-and-ai-levers.md',
      'docs/projects/civ7-live-play-support/topics/strategic-planning-snapshot.md',
      'docs/projects/civ7-live-play-support/topics/early-game-decision-context.md',
    ],
    commands: [
      'game play rehydrate',
      'game watch',
      'game autoplay',
      'game play settlement-recommendations',
    ],
    loadWhen: 'when setting a 5-10 turn posture, comparing against autoplay, or deciding what the next inspection should be',
    boundary: 'strategy snapshots rank what to inspect; they never bypass live blocker reads, validators, or postconditions',
  },
  {
    family: 'rhq-ai',
    aliases: ['ai-mod', 'static-ai', 'ai-levers', 'steam-workshop-3507042742'],
    purpose: 'Use RHQ AI MOD as a comparator for static AI/resource tuning over autoplay.',
    proof: 'advisory author-claim baseline with source-status caveats',
    references: [
      'docs/projects/civ7-live-play-support/topics/rhq-ai-mod-baseline.md',
      'docs/projects/civ7-live-play-support/topics/multi-turn-strategy-and-ai-levers.md',
      'docs/projects/civ7-live-play-support/evidence-packs/current-online-play-context.md',
    ],
    commands: [
      'game autoplay',
      'game watch',
      'future: game ai loaded-levers',
      'future: game ai autoplay-telemetry',
    ],
    loadWhen: 'when comparing native autoplay/static AI mods with the external direct-control strategy runner',
    boundary: 'RHQ public claims seed experiments; actual loaded GameInfo rows and bounded telemetry must prove behavior',
  },
];

function findTopics(query: string): ReadonlyArray<Topic> {
  const normalized = normalize(query);
  return TOPICS.filter((topic) =>
    normalize(topic.family) === normalized || topic.aliases.some((alias) => normalize(alias) === normalized),
  );
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
