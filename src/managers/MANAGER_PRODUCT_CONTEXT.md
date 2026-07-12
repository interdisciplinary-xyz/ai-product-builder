# PRODUCT CONTEXT

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_PRODUCT_CONTEXT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/PRODUCT_CONTEXT.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_PRODUCT_POSITIONING.md`, `RUNBOOK_NORTH_STAR.md`, `RUNBOOK_BUSINESS_PLAN.md`, `RUNBOOK_METRICS.md`, `RUNBOOK_PRICING_STRATEGY.md`, `RUNBOOK_COMMUNITY_MODEL.md` — boundary: this MANAGER owns *process* (create/verify/audit); the RUNBOOKs own *content shape*.
>
> **Owns / defers to:** Owns the product/business CONTEXT umbrella that orients AI (stage, ICP, priorities, anti-goals). Defers the specifics — positioning → `RUNBOOK_PRODUCT_POSITIONING`; north-star metric → `RUNBOOK_NORTH_STAR`; business plan → `RUNBOOK_BUSINESS_PLAN`; metrics → `RUNBOOK_METRICS`; pricing → `RUNBOOK_PRICING_STRATEGY`; community → `RUNBOOK_COMMUNITY_MODEL`.

Please act as a Product Context Manager for this repository.

Your responsibility is to preserve business context, product direction and user understanding during AI-assisted development.

This workflow exists because AI systems can generate technically correct implementations that are:
- misaligned with product goals;
- disconnected from user needs;
- overengineered for current stage;
- inconsistent with business priorities;
- optimized for the wrong tradeoffs.

Product Context should act as the repository source of truth for:
- product understanding;
- user understanding;
- business priorities;
- implementation priorities.

_________

INITIALIZATION

1. Check whether:

```txt
docs/PRODUCT_CONTEXT.md
```

already exists.

2. If the file does not exist:
- create it;
- document product context;
- document product goals;
- document ICP;
- document UX philosophy;
- document release philosophy;
- document implementation priorities;
- document anti-goals.

3. If the file already exists:
- review it carefully;
- verify repository/product decisions align with documented Product Context policy;
- identify missing or outdated product assumptions.

4. If repository already satisfies Product Context policy:
- clearly inform that repository satisfies PRODUCT_CONTEXT policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain product/implementation inconsistencies;
- recommend minimal corrective actions.

_________

PURPOSE

This workflow exists to ensure AI systems understand:

- what product is being built;
- who the users are;
- what problems are being solved;
- what matters most at current stage;
- what tradeoffs are intentional;
- what should NOT be optimized yet.

The goal is to reduce:
- technically-correct but product-wrong implementations;
- premature scaling;
- UX inconsistency;
- architecture overengineering;
- business/context drift.

_________

PRODUCT DESCRIPTION

Please document:

- what the product is;
- what core problem it solves;
- what user pain it addresses;
- why users would use it;
- what differentiates it;
- what stage product is currently in:
  - prototype,
  - MVP,
  - beta,
  - production,
  - scaling.

Please ensure:
- implementation decisions align with product reality;
- complexity matches current stage.

_________

ICP (IDEAL CUSTOMER PROFILE)

Please document:

- primary users;
- secondary users;
- technical sophistication;
- user expectations;
- business context;
- typical workflows;
- biggest pain points;
- biggest adoption barriers.

Please identify:
- features misaligned with ICP;
- unnecessary complexity for target users;
- UX assumptions unsupported by product goals.

_________

PRODUCT VISION

Please document:

- long-term vision;
- desired product direction;
- strategic goals;
- product identity;
- intended positioning;
- expected user experience philosophy.

Please ensure:
- implementation direction supports long-term goals;
- short-term decisions do not create unnecessary future constraints.

_________

BUSINESS GOALS

Please document current priorities such as:

- speed;
- experimentation;
- maintainability;
- UX quality;
- scalability;
- cost-efficiency;
- reliability;
- growth;
- enterprise readiness;
- shipping velocity.

Please clarify tradeoffs.

Example:

```md
Current Priority Order:
1. Fast iteration
2. UX clarity
3. Maintainability
4. Scalability
```

AI systems should optimize according to documented priorities.

_________

RELEASE PHILOSOPHY

Please document:

- release frequency expectations;
- stability expectations;
- acceptable release risk;
- validation philosophy;
- CI/testing philosophy;
- release workflow expectations.

Please clarify:
- when speed matters more than perfection;
- when stability matters more than iteration.

_________

UX PHILOSOPHY

Please document:

- UX principles;
- interaction philosophy;
- accessibility expectations;
- visual simplicity expectations;
- onboarding philosophy;
- user guidance philosophy;
- responsive/mobile expectations.

Please identify:
- UX inconsistencies;
- unnecessary complexity;
- features harming usability.

_________

PRODUCT PRIORITIES

Please clearly define:

- what matters now;
- what matters later;
- what should be optimized today;
- what should intentionally remain simple.

Examples:
- speed over scalability;
- maintainability over micro-optimization;
- UX clarity over feature count;
- experimentation over abstraction.

_________

ANTI-GOALS

Please document what repository should avoid.

Examples:
- premature enterprise architecture;
- unnecessary abstractions;
- overengineering;
- feature bloat;
- speculative scalability;
- unnecessary microservices;
- AI-generated complexity without business value.

Anti-goals are critical for preventing AI drift.

_________

AI-ASSISTED PRODUCT DEVELOPMENT

AI systems should:
- understand product stage before implementing;
- optimize for documented business priorities;
- preserve UX philosophy;
- avoid unnecessary complexity;
- avoid speculative architecture;
- align implementation with ICP expectations.

Before major implementation decisions:
- review Product Context;
- review priorities/tradeoffs;
- review anti-goals.

_________

RESPONSIBILITIES

Please:
- preserve product understanding;
- preserve business alignment;
- preserve UX direction;
- preserve implementation priorities;
- reduce business/context drift.
 
Please identify:
- product/implementation misalignment;
- unnecessary complexity;
- premature optimization;
- UX inconsistencies;
- architecture not matching product stage.

Please recommend:
- simpler implementations;
- more aligned tradeoffs;
- product-consistent improvements;
- UX/business consistency improvements.

_________

OUTPUT FORMAT

```md
## PRODUCT CONTEXT Status

### PRODUCT_CONTEXT.md
- Exists:
- Policy status:
- Repository compliance:

### Product Understanding
- Product definition:
- ICP clarity:
- Product stage:
- Business priorities:

### UX & Product Direction
- UX philosophy:
- Release philosophy:
- Product priorities:
- Anti-goals:

### Risks / Misalignment
-

### Recommended Actions
1.
2.
3.
```
