# Studio Materialization Proof Audit

Date: 2026-06-10
Branch: `codex/river-native-object-proof`
Scope: fresh read-only peer-agent audit of Studio Run in Game / generated map
materialization after native `modelRivers` restoration.

## Framed Goal

Prove or falsify the hypothesis that Studio/Civ can still run stale generated
map JavaScript even when current source contains the native river materializer,
and identify closure-grade proof gaps that could let rivers be declared working
without same-run product evidence.

## Inquiry Design

- Compare current source, local generated map JS, installed Civ mod JS, and
  latest log markers.
- Trace Run in Game and Save/Deploy build/deploy sequence.
- Review proof surfaces for false-completion paths after native `MapRivers`
  readback was added.
- Keep findings scoped to owner boundaries: Studio proof owns artifact identity;
  map-rivers owns Civ materialization; Hydrology truth remains upstream.

## Findings

- The stale deployed-mod hypothesis was confirmed: local `mod/maps/*.js`
  contained `context.adapter.modelRivers`,
  `map.rivers.officialCivRiverModeling`, and `POST-MODEL-RIVERS`, while the
  installed Civ `Mods/mod-swooper-maps/maps/*.js` files had zero of those
  markers. Installed manifest/config hashes can match while map JS is stale.
- Run in Game does rebuild before launch through Turbo and injects
  `SWOOPER_STUDIO_RUN_ID`, but there was no independent post-build/deploy
  content proof before Civ start.
- Save/Deploy is weaker than Run in Game because it reports saved/deployed
  status without source/generated/local/deployed artifact identities.
- Native `MapRivers` proof is currently aggregate; it does not yet bind sampled
  visible tiles to native river object plots/chains.
- Rendered proof still needs real on-target camera/screenshot capture and
  same-run identity binding. Packet-shape proof and fake image bytes are not
  product evidence.
- Final-surface parity top-level `complete` can still coexist with unresolved
  rendered/product proof rows. Consumers must read proof-class labels, not the
  top-level status alone.
- `river-catalog-adapter-contract-hardening` contained stale text forbidding
  standard stages from calling `adapter.modelRivers()`, conflicting with the
  accepted native materialization path.

## Disposition

- Accepted now: add Run in Game local/deployed content-marker proof for the
  request id, config hash, envelope hash, and native river materialization
  markers; fail before game start if those links are missing.
- Accepted now: add generated bundle guard requiring native river materializer
  markers in every manifest-listed map script.
- Accepted now: reconcile stale `modelRivers()` OpenSpec language so it is a
  bounded `map-rivers` Civ materialization surface, not an upstream generator or
  public selector model.
- Accepted as downstream: extend native `MapRivers` readback to preserve plot
  membership and bind camera samples to native river objects.
- Accepted as downstream: replace screenshot packet-shape proof with actual
  same-run rendered capture evidence tied to branch/commit/request/config/seed.
- Accepted as downstream: strengthen Save/Deploy artifact identity if it is
  used as product proof rather than a deployment convenience.

## Stop Conditions For River Closure

- Stop if the installed map script lacks the same request/config/envelope and
  native river materialization markers as the local built script.
- Stop if a sampled visible river tile cannot be tied to a native `MapRivers`
  object/chain in the same run.
- Stop if rendered evidence is manual-file, off-target, or only Studio-layer
  evidence.
- Stop if any product row reads top-level parity `complete` instead of the
  required proof-class labels.
