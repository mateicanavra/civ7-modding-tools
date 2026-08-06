---
level: error
tags: [service, proof, isolation, import]
---
# Require Service Proof Isolation

Standalone service production source does not import its package-owned proof
corpus. The dependency direction is one-way: package-root tests may consume
production source, while production source remains independent from proof
fixtures, harnesses, and suites.

This law selects only top-level `services/<owner>/src/**/*.ts` sources and only
quoted or substitution-free template module sources. It resolves each relative
source against the importing filename and rejects only a normalized destination
inside the owning package's exact `test/` root. There is no service-proof alias
lane. Embedded API-plugin services and package-root test sources remain outside
this source selector.

```grit
language js(typescript)

predicate require_service_proof_isolation_is_standalone_production_source() {
  $filename <: r"(?:^|.*/)services/[^/]+/src/.*\.ts$"
}

function require_service_proof_isolation_status($filename, $source) js {
  const filename = $filename.text.replace(/\\/g, "/");
  const ownerMatch = filename.match(/(?:^|\/)services\/([^/]+)\/src\//);
  if (!ownerMatch) return "outside";
  const raw = $source.text;
  const quote = raw[0];
  const last = raw[raw.length - 1];
  const quoted = (quote === '"' || quote === "'") && last === quote;
  const staticTemplate = quote === "`" && last === "`" && !raw.includes("${");
  if (!quoted && !staticTemplate) return "not-literal";
  const source = raw.slice(1, -1);
  if (!source.startsWith(".")) return "external";

  const parts = filename.split("/");
  parts.pop();
  for (const part of source.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  const target = parts.join("/");
  const proofOwner = target.match(/(?:^|\/)services\/([^/]+)\/test(?:\/|$)/);
  return proofOwner && proofOwner[1] === ownerMatch[1] ? "blocked:proof" : "ok";
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  require_service_proof_isolation_is_standalone_production_source(),
  $status = require_service_proof_isolation_status(
    filename=$filename,
    source=$source
  ),
  $status <: includes "blocked:"
}
```

## Matches a static import

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
import { catalogFixture } from "../../../../test/semantics/modules/catalog/find.fixture";
```

## Matches a re-export

```typescript
// @filename: services/jobs/src/service/model/ports/catalog.ts
export { catalogFixture } from "../../../../test/semantics/modules/catalog/find.fixture";
```

## Matches a dynamic import

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const fixtures = await import("../../../../test/semantics/modules/catalog/find.fixture");
```

## Matches a CommonJS require

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const fixtures = require("../../../../test/semantics/modules/catalog/find.fixture");
```

## Matches CommonJS resolution

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const fixturePath = require.resolve("../../../../test/semantics/modules/catalog/find.fixture");
```

## Matches a template dynamic import

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const fixtures = await import(`../../../../test/semantics/modules/catalog/find.fixture`);
```

## Matches a template CommonJS require

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const fixtures = require(`../../../../test/semantics/modules/catalog/find.fixture`);
```

## Matches template CommonJS resolution

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const fixturePath = require.resolve(`../../../../test/semantics/modules/catalog/find.fixture`);
```

## Matches an upward traversal after a current segment

```typescript
// @filename: services/jobs/src/client.ts
const fixtures = await import(`./../test/contract/client.fixture`);
```

## Matches the terminal proof root

```typescript
// @filename: services/jobs/src/service/router.ts
import "../../test";
const proofRoot = require.resolve(`../../test`);
```

## Ignores production imports

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
import { catalogPolicy } from "./model/policy/catalog";
```

## Ignores package-root test sources

```typescript
// @filename: services/jobs/test/semantics/modules/catalog/find.test.ts
import { createJobsClient } from "../../../../src/client";
```

## Ignores embedded API-plugin services

```typescript
// @filename: plugins/server/api/pipeline/src/service/modules/jobs/router.ts
import { jobsFixture } from "../../../../test/semantics/modules/jobs/run.fixture";
```

## Ignores a contest path segment

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
import { contestPolicy } from "./contest/policy";
```

## Ignores an operation named test

The contract leaf is production matter and does not traverse upward from its
sealed contract directory.

```typescript
// @filename: services/jobs/src/service/modules/providers/contract/index.ts
import { test } from "./test";
```

## Ignores interpolated template sources

```typescript
// @filename: services/jobs/src/service/modules/catalog/router.ts
const proofSegment = "test";
const fixtures = await import(`../../../../${proofSegment}/semantics/modules/catalog/find.fixture`);
```
