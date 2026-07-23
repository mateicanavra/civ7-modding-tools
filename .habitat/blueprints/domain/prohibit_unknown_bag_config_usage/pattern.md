---
level: error
---
# Prohibit Unknown Bag Config Usage

Domain source must not use unknown-bag config escape hatches. Exact rule
coverage selects domain source; this syntax rule owns only the two retired
escape-hatch tokens.

```grit
language js(typescript)

or {
  `UnknownRecord`,
  `INTERNAL_METADATA_KEY`
}
```

## Matches Fixture

```typescript
type LegacyConfig = UnknownRecord;
const metadata = INTERNAL_METADATA_KEY;
```

## Ignores Fixture

```typescript
type DomainConfig = Readonly<{ seed: number }>;
const metadataKey = "domain-metadata";
```
