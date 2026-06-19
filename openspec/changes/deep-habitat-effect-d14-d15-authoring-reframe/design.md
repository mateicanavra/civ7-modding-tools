# Design: D14 D15 Authoring Reframe

## D14/D14A Position

D14 owns authoring refusal and fence behavior. D14A owns checked-in authored
artifact placement under `.habitat`. The Effect substrate provides services that
read, validate, and guard those artifacts; it does not move managing TypeScript
code into `.habitat`.

## D15 Position

D15 remains dormant unless a later accepted packet changes public command
observation or provenance DTOs. Internal typed errors and command observations
do not activate D15 by themselves.

## Future Authoring Preconditions

Future authoring topology work must wait for:

- accepted runtime/config/error substrate;
- accepted vendor providers for Grit, Biome, Nx, Git, and Husky;
- migrated diagnostic pattern governance and transformation transaction
  domains;
- artifact/language guardrails;
- public-surface matrix entries for any new command or DTO output.
