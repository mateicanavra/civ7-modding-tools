<toc>
  <item id="critical" title="Critical (read disclaimer)"/>
  <item id="objective" title="Overall objective"/>
  <item id="sources" title="Sources and scope"/>
  <item id="artifacts" title="Working artifacts"/>
  <item id="plan" title="Research plan and structure"/>
  <item id="traverse" title="How to traverse and evaluate docs"/>
  <item id="classification" title="Classification and curation"/>
  <item id="outcome" title="Final intended outcome (directional)"/>
  <item id="agents" title="Use of additional agents"/>
  <item id="disclaimer" title="Disclaimer + workflow requirements"/>
</toc>

<critical>
YOU MUST READ THE BOTTOM DISCLAIMER
</critical>

Alright, so I’ve got a big task for you. I hope you’re ready for this.

First thing: launch the Dev Spike workflow.

- When you set up your work tree, branch off the very tip of the current stack.
- Before you start using the Code Intelligence MCP server (ideally do this right away), move the primary work tree’s branch up to the highest available branch in the stack, as long as that branch is not already checked out by another work tree. Then leave the primary work tree there.
- Your actual work tree for this spike should still branch off the tip of the stack. The Code Intelligence MCP server will index whatever branch is on the primary work tree, which should be fine.

Now, the main job is a deep research and documentation-alignment spike around MapGen:

1. **Overall objective**

   Investigate and reconcile all our current documentation and examples for:
   - The MapGen core SDK
   - The MapGen pipeline generally
   - The domains and the “standard recipe” (hydrology, ecology, foundation, etc.)

   The core tension:
   - We’ve been iterating domains and architecture in parallel for a long time.
   - Some domains are closer to the target architecture, some are not, and maybe none exactly match the target.
   - We therefore have a mixed state:
     - Multiple architectures implicitly in play
     - Documentation that points to old approaches, new approaches, or half‑and‑half, often without clearly indicating which is canonical or which to follow.
   - There *is* a streamlined, DX‑first way to do what we need, and the architecture already supports it, but:
     - Documentation is confusing
     - Current example implementations are not necessarily good exemplars of the target architecture.

   Ultimately, I want to start building a coherent set of policies from the ground up, using the documentation we already have—some of which is salvageable and maybe already in the right shape.

2. **Sources and scope**

   You’ll be drawing from:
   - The **engine refactor v1** project
   - The **system-level lib** for the `mapgen` package
   - Any other non‑archived documents/specs related to:
     - Map generation
     - The core SDK
     - The MapGen domains and pipeline

   Note: Some canonical information is currently buried inside project specs and docs; this is part of the problem you’re surfacing and resolving.

3. **Working artifacts**

   Set up the following:

   - **Scratch documents (one or more):**
     - This is your scratch space, not the final spike.
     - Write into these continuously as you discover things:
       - Insights, background, links, references, notes, partial categorizations, etc.
     - Don’t try to make scratch docs perfect or polished.
     - You can (and probably should) create multiple scratch pads so no single markdown file becomes a thousand-line mess.
       - E.g., one scratch pad per system/subsystem/domain or per cluster of related docs.
       - Keep them small and focused on the specific topic you’re investigating at that moment.

   - **Spike document (final output of this effort, but evolving):**
     - This will eventually integrate and synthesize everything from the scratch docs.
     - For now, just create it and treat it as the place where you’ll ultimately:
       - Compile your research outcomes
       - Organize the canonical doc set
       - Outline policies, architecture explanations, etc.

4. **Research plan and structure**

   This is going to be a long, deep research effort. I want you to:

   - Create an **overall research plan**:
     - Describe how you’ll traverse all relevant docs and code.
     - Include how you’ll leverage code intelligence for deep search.
     - Outline phases or passes (e.g., discovery, classification, evaluation, consolidation), if that’s helpful to you.

   - For **each domain / subsystem / document cluster**, also create a **local plan**:
     - For every subsystem or domain you investigate, have a specific mini‑plan:
       - What you’re looking for
       - Where you’ll search (docs, specs, code, etc.)
       - How you’ll determine whether it reflects the target architecture and desired DX
     - Think “fractal plans”: an overall plan, plus per‑subsystem/per‑domain plans nested within it.
     - Avoid an unstructured, “all over the place” approach; each subsystem/domain should have an explicit investigation path.

   - Break down the system **categorically / hierarchically**:
     - Identify systems and subsystems in MapGen (domains, recipes, core SDK layers, pipelines, etc.).
     - Use that structure to:
       - Understand how things *should* be built.
       - Understand how things *should* be documented.

5. **How to traverse and evaluate documentation**

   - Use **deep search** with Code Intelligence:
     - Explore both code and documentation.
     - Follow references to find buried canonical info.
   - Consider that:
     - At the outset, treat all non‑archived docs as **not meeting the bar**.
     - Your job is to:
       - Find which documents are:
         - Fully salvageable
         - Partially salvageable
         - Mostly or significantly accurate
       - And which are effectively obsolete or should be superseded.

6. **Classification and curation of documents**

   Your spike should ultimately:

   - **Compile all active (non‑archived) documents** that relate to:
     - Map generation
     - The core SDK
     - Domains (hydrology, ecology, foundation, etc.)
     - The MapGen pipeline and architecture more broadly

   - **Evaluate and classify them**:
     - Start by assuming none of them meet the bar.
     - Then identify a **pool of “working set” documents**:
       - Docs that are salvageable or partially salvageable
       - Docs that are mostly correct and accurate with respect to the target architecture and DX
     - Hoist these into a clearly labeled section:
       - “These are the docs we want to work with.”
       - We may:
         - Combine them
         - Break them apart
         - Harden them
         - Slim them down
       - Everything *outside* this pool should be treated as:
         - Superseded
         - Archived
         - Or clearly marked as non‑canonical.

   - The idea is to create a clear separation between:
     - The curated, actively maintained, canonical doc set.
     - The legacy / superseded material.

7. **Final intended outcome (directionally)**

   The eventual (not necessarily in this single spike step, but as the direction of the work) curated set should:

   - Explain **how the architecture works for the SDK**, including:
     - System-level architecture and engineering details
     - How the MapGen pipeline and domains fit into it

   - Describe **how to use the system**:
     - The developer experience we’re aiming for
     - Concrete patterns of usage

   - Capture **policies and conventions**, such as:
     - Policies around imports
     - Policies around dependency injection
     - Domain modeling and domain boundaries
     - Any other DX‑critical patterns and guardrails

   - Strong emphasis:
     - Optimize for **clean developer experience**
     - Minimize confusion
     - Put **good guardrails** in place so people naturally do the right thing.

   Conceptually, the goal is to have a “real physics engine” backing SivE map generation: solid, consistent, principled foundations for how MapGen works, both architecturally and in terms of DX and documentation.

8. **Use of additional agents**

   You may:
   - Launch multiple new default agents (a “swarm” of agents) for each subsystem or area you want explored.
   - If you do:
     - Give them the same context and instructions you have:
       - How to use scratch pads
       - How their findings will be integrated into the main spike
     - Your role is to manage and coordinate these agents.
   - Or you can do all of this yourself if that feels more appropriate.
   - I’ll leave that decision to you.

Please go all the way through this process and don’t stop mid‑way.

-------------

<disclaimer>

VERY IMPORTANT: you already have a worktree up and running at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-spike-mapgen-docs-alignment` -- please use this worktree, and notice that you have this prompt at `docs/projects/engine-refactor-v1/mapgen-docs-alignment/PROMPT.md` and your prior iteration's reserach plan here `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SPIKE.md`

Notice that in `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch` you also have several files that you created in the last iteration. Please do not inherit these directly yet -- do the exact work you would do given the prompt, from the ground up, and simply utilize the existing documents as if they were the documents you were going to write. By that I mean, add the text YOU want to write THIS time, and modify these docs only if there are gaps or additional information that you think should be added.

Otherwise, continue with the rest of your spike, fractally, as you set out to do. Whatever work is already done, just double check/verify it + modify it as needed, then continue with the remainder of the resaerch all the way through to the end as if this was your first pass. You got this!!!

ALSO CRITICAL: every time you compact, please refer back to this original prompt so that you remember the high level directive and never leave any gaps in your work. In your context continuation packets, keep the focus less on carrying over all information from the session (which should be written down for permanence in scratch or official docs) and more about rapidly re-onboarding yourself onto the task you were in the middle of doing, while also injecting the original prompt back into your mind so you don't forget what your high level goal is. Remember, this should take you a very long time, since you're fractally researching and documenting along the way. Use agents (type: default) if you'd like, but it's not necessary.

WORKFLOW: for each major slice of work that you do, create a new graphite branch and stack it on top of the stack (or insert it after your current branch). Commit all significant changes along the way when working on any particular slice. Also, you must have fractal plans for all slices that you update as you go, as well as an overall research plan. Use your planning tool in addition to the live documents for the plans (you must write down plans as well)

</disclaimer>
