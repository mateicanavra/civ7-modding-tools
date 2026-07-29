---
level: error
---
# Require CLI Command Module Identity

Every TypeScript module below a CLI topic plugin's `src/commands` tree owns one
named concrete command class. The command is the module's singular default
runtime export. The class name preserves useful stack and diagnostic identity;
oclif derives the canonical command id from the module's relative path,
including the native `index.ts` topic-command form. Exact singularity,
additional value exports, authored static identity, resolved command
assignability, and dependency destinations are owned by
`require_cli_command_module_semantics`.

```grit
language js(typescript)

predicate is_concrete_default_command($export, $body) {
  $export <: or {
    `export default class $command extends $base { $class_body }`,
    `export default $command` where {
      $body <: contains `class $command extends $base { $class_body }`
    }
  }
}

program(statements=$body) where {
  ! $body <: contains export_statement() as $export where {
    is_concrete_default_command($export, $body)
  }
}
```

## Matches Fixture

```typescript
// @filename: plugins/cli/topics/example/src/commands/example/missing-command.ts
export const describeOnly = () => "not a command";

// @filename: plugins/cli/topics/example/src/commands/example/abstract-command.ts
import { Command } from "@oclif/core";

export default abstract class AbstractCommand extends Command {}
```

## Ignores Fixture

```typescript
// @filename: plugins/cli/topics/example/src/commands/example/direct.ts
import { Command } from "@oclif/core";

function formatResult(value: string): string {
  return value.trim();
}

export default class Direct extends Command {
  async run(): Promise<void> {
    this.log(formatResult("ok"));
  }
}

// @filename: plugins/cli/topics/example/src/commands/example/derived.ts
import TopicCommandBase from "../../adapters/topic-command-base.js";

export default class Derived extends TopicCommandBase {
  async run(): Promise<void> {}
}

// @filename: plugins/cli/topics/example/src/commands/example/topic/index.ts
import { Command } from "@oclif/core";

export default class Topic extends Command {
  async run(): Promise<void> {}
}

// @filename: plugins/cli/topics/example/src/commands/example/detached.ts
import { Command } from "@oclif/core";

class Detached extends Command {
  async run(): Promise<void> {}
}

export default Detached;
```
