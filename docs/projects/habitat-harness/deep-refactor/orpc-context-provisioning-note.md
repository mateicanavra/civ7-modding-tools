# oRPC Context Provisioning Note

This note was moved out of `tools/habitat-harness/src/service/modules/hook/model`
because service module source allows only managed file kinds. The instruction
still applies to the refactor:

> `biome: requiredHabitatServiceDependency(context.deps.biome, "biome"), // TODO: yuo don't need to do this wrappin.... this is literally what orpc context is for. you use middleware once at the service implementer definition level if you want to verify that the provisioning has been done. but really you should only use middleware once to do that provisioning at the service level for all the things you need lower down`
>
> this is overcomplicated. dependency resolution happens at the service level.
> middleware can help you do that, OR you need some other way to provision
> outside of hte service boundary and not break the service structrure
>
> but we already have a simple solution for this -- do less, see the orpc
> playgorund or other example repos specifically. those show you how, for
> example, they provision a db client from a db pool. you could do similarly
> here. again, keep in mind you shoudl only be doing this with
> actually-external-to-the-service providers/resources. don't make the mistake
> of pretending a module "service" is an external dependency -- that just means
> you need to put stuff in the module

Follow-up direction: collapse module-local dependency assertions once the
service/context provisioning can validate the complete dependency bag at the
service edge without reintroducing provider acquisition into service internals.

## Fix Contract Export Ordering Note

This note was moved out of `tools/habitat-harness/src/service/modules/fix`
because service module source allows only managed file kinds. The instruction
still applies to the fix contract cleanup:

> I want ordered exports at the bottom. so take this:
>
> ```ts
> const FixCommandIntentSchema = Type.Object(
>   {
>     kind: Type.Union([Type.Literal("dry-run-intent"), Type.Literal("live-write-intent")]),
>   },
>   { additionalProperties: false, description: "Habitat fix command intent." }
> );
>
> export type FixServiceRunInput = Static<typeof FixCommandIntentSchema>;
>
> const FixServiceRunOutputSchema = Type.Object(
>   {
>     exitCode: Type.Integer(),
>     stdout: Type.String(),
>     stderr: Type.String(),
>   },
>   { additionalProperties: false, description: "Habitat fix service execution result." }
> );
> export type FixServiceRunOutput = Static<typeof FixServiceRunOutputSchema>;
> ```

Additional instruction from the follow-up note: put type exports for types
grouped together at the bottom, above other exports, and make that a pattern.

## Fix Admissions Middleware Note

This inline instruction was moved out of `fix/router.ts` because service source
should not carry loose refactor notes:

> this should be middleware (the whole admissions thing; policy is almost
> always a middleware; see magic-migration collect service for how to create
> standalone middleware)

Follow-up clarification from the lowercase note: policy should generally execute
in middleware, with the admissions path as the concrete example. The
magic-migration collect service and rawr-hq example-todo service package are
the reference shapes. Some policy can remain helper logic in routers, but this
should be intentional.
