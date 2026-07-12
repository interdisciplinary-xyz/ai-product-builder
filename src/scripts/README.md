# Scripts — the calculators the playbooks end in

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init` on the runbook a script serves (e.g. `/ai-init RUNBOOK_PRICING_STRATEGY`) to fill that doc's local definitions — the scripts themselves take **CLI flags, not `«placeholders»`**, so there is nothing to fill in here.
>
> Canonical copy — vendored at `docs/ai-product-builder/scripts/` in every deployed repo (source of truth). Copy the whole folder; run the scripts in place.
>
> **Reusability:** template-ready — product-neutral and dependency-free (Python 3 stdlib only). Every product-specific number is a flag with a demo default. Reuse the SCRIPT as-is; supply your own numbers.
>
> **Owns:** the arithmetic behind two decisions — *what price / cadence survives contact with reality* and *do we actually have product-market fit*.
> **Defers to:** [`../PRICING_STRATEGY.md`](../PRICING_STRATEGY.md) and [`../METRICS.md`](../METRICS.md) for the decisions themselves, and [`../BUSINESS_PLAN.md`](../BUSINESS_PLAN.md) for the model these numbers feed. A script computes; it does not decide.
>
> **Local definitions to provide per repo** (as flags at the call site, or recorded in the paired runbook):
> - `«CURRENCY»` — the currency all amounts are denominated in (the scripts are unit-agnostic; they print `$` glyphs but do no conversion)
> - `«PAYMENTS»` — your processor, and its **actual** `pct + fixed` rate for the cards and region you really get (not the headline domestic rate)
> - `«TIER_PRICES»` + `«CADENCE»` — the price point and billing cadence under test
> - `«METRIC_TARGETS»` — the conversion / churn / burn assumptions being stressed

## The governing principle

**A playbook that ends in a number should ship the calculator that produces it.**

A doc can't run. A doc that says "compute your break-even and check the sensitivity of each assumption" is an instruction to do arithmetic that nobody does — and when someone does do it, they do it once, in a spreadsheet, at the assumptions that flatter them. Every doc in this library that terminates in a number is supposed to hand you the thing that produces it, so the number is **reproducible, re-runnable when an input changes, and identical for you and for the agent reading over your shoulder.**

That is the whole reason this layer exists. If you add a runbook whose last step is "and then you'll know your X", either ship the script that computes X, or say plainly that X is a judgement call and stop pretending it's arithmetic.

## What's here

| Script | Answers | Pairs with |
|---|---|---|
| `sensitivity-table.py` | *Which variable, off by 50%, kills the model?* | [`../PRICING_STRATEGY.md`](../PRICING_STRATEGY.md) |
| `score-sean-ellis.py` | *Do we have PMF — after discounting the people who were just being nice?* | [`../METRICS.md`](../METRICS.md), [`../NORTH_STAR.md`](../NORTH_STAR.md) |

Both are **Python 3 stdlib only** — no `pip install`, no lockfile, no virtualenv. They run on whatever `python3` the machine already has. That is a deliberate constraint: a calculator with a dependency tree is a calculator nobody runs.

## `sensitivity-table.py` — unit-economics stress test

```bash
python3 scripts/sensitivity-table.py --help
python3 scripts/sensitivity-table.py                      # demo defaults
python3 scripts/sensitivity-table.py \
  --price 12 --cadence annual \
  --fee-pct 0.029 --fee-fixed 0.30 \
  --variable-cost 0.04 --fixed-burn 30 \
  --conversion 0.02 --churn 0.05 --signups 200
python3 scripts/sensitivity-table.py --json               # machine-readable
```

**It is a stress test, not a forecast.** A forecast tells you what you will earn — and is wrong. A stress test tells you which assumption is load-bearing, so you know which one to go and *validate* before you spend money on top of it. The output ranks every input by how much damage it does when it's off by 50% in the unfavourable direction, and names the one to check first.

It prints:

1. **Contribution margin** per paying user, per month — after fees, after variable cost.
2. **Break-even** — in paying users, and in signups/month at your conversion and churn.
3. **A cadence comparison** — the same money billed monthly vs annually, side by side.
4. **The sensitivity table** — price, conversion, churn, variable cost and fixed burn, each moved 50% the wrong way, ranked by damage, each verdict one of `SURVIVES` / `MARGINAL` / `KILLS`. Plus the **worst two at once**, because reality does not stress one assumption at a time.
5. **Trip-wires** — thresholds with your numbers already in them: *"if conversion < 0.85% at 200 signups/month, do NOT open paid acquisition."*

### The payment-fee physics it exists to encode

Processor fees are `pct × amount + fixed` **per transaction**. The fixed part does not care how small the transaction is. So:

| Same product, same money | Charges/year | Effective fee |
|---|:--:|:--:|
| `«CURRENCY»`1.50 / month | 12 | **~22.9%** |
| `«CURRENCY»`18 / year | 1 | **~4.6%** |

A `«CURRENCY»`0.30 fixed fee is **20% of a `«CURRENCY»`1.50 charge** and **1.7% of an `«CURRENCY»`18 charge**. Five-fold difference in fee load, from the cadence alone — the customer pays the same, the processor just takes its cut twelve times instead of once.

This is why a price point can be perfectly viable annually and structurally dead monthly, and it is the single most common thing missed when a generalist "runs the numbers". The script always prints both cadences so the comparison is unavoidable, and trips a wire when the fixed fee exceeds ~5% of a charge.

The fee model is a **flag, not a hardcoded provider** — look up `«PAYMENTS»`'s real rate for the region and card mix you actually get, and pass it. The defaults are a common shape, not your rate.

## `score-sean-ellis.py` — PMF survey scorer

```bash
python3 scripts/score-sean-ellis.py --help
python3 scripts/score-sean-ellis.py scripts/examples/pmf-responses.example.json
python3 scripts/score-sean-ellis.py responses.csv
cat responses.json | python3 scripts/score-sean-ellis.py -
python3 scripts/score-sean-ellis.py responses.json --workflow-nouns invoice,handoff,standup
```

Scores *"how would you feel if you could no longer use `«PROJECT»`?"* against the conventional **40% "very disappointed"** line — and prints **two** numbers.

**The raw verdict is an overcount, and this is not a subtle effect.** At cohort size (N=20–100) the people who answer are the people who like you. Warm-network users say "very disappointed" because they are being kind. Scale on that number and retention craters, because politeness does not renew a subscription.

So each response is scored for **polite-signal flags**:

| Flag | What it means |
|---|---|
| `response_within_hours_of_dm` | They replied within an hour of you personally asking. That's a favour, not a preference. |
| `answer_too_broad` | "Who would benefit?" → *"anyone with a team"*. They can't picture the user. Real answers are uncomfortably narrow. |
| `answer_too_generic` | "Main benefit?" → *"it's really useful, saves time"*. That's the vocabulary of a compliment, not of a workflow. |
| `low_usage_count` | They used it fewer than 5 times. Dependence you can't have formed yet. |

A response carrying **2+ flags is downgraded** one bucket for the headline rate (tune with `--downgrade-at`). The report prints the raw %, the discounted %, and — the point of the whole exercise — a loud warning when **the raw number passes 40% and the discounted number does not**. That is the moment a founder scales on politeness, and it is what this script exists to catch.

The bundled example (`examples/pmf-responses.example.json`) is built to show exactly that flip: raw 40.0% `PASS` → discounted 20.0% `FAIL`.

Two things the script deliberately will not do for you:

- **It does not judge people.** A flag is a prompt to go and look at that response, not a verdict on that respondent. The downgraded responses are listed by ID so you can overrule the heuristic by hand — and you should.
- **It does not read minds.** The genericity heuristic is only as good as the nouns you feed it. Pass `--workflow-nouns` with the concrete things *your* users do (`invoice`, `handoff`, `standup`, `deploy`) — naming one is what separates *"it helps a lot"* from *"it cuts my invoice reconciliation from three hours to twenty minutes"*.

### Input shape

One object per respondent — JSON list, `{"responses": [...]}`, or CSV with the same column names:

```json
{
  "respondent_id": "u-101",
  "disappointment": "very",
  "who_benefits": "solo consultants who bill hourly and chase late invoices",
  "main_benefit": "cuts the monthly invoice reconciliation from three hours to twenty minutes",
  "delivery_surface": "email",
  "responded_within_hours": 72,
  "usage_count": 14
}
```

`disappointment` is one of `very` / `somewhat` / `not` / `na`. Missing fields **fail safe** — an absent `usage_count` counts as low, because an unmeasured user is not a proven one.

## Adding a script here

The bar is deliberately high. A script earns its place in this folder when:

1. **A runbook in this library ends in the number it produces.** No orphan calculators.
2. **It is stdlib-only.** A dependency is a reason not to run it.
3. **It runs with zero args** on demo defaults, so you can see the shape of the output before you trust it with your own numbers — and has a `--help` that explains what it refuses to do.
4. **It is product-neutral.** Every product fact is a flag. If a fact is baked into the source, the script belongs in your repo, not in this library.
5. **It prints the assumption, not just the answer.** A number without its inputs beside it is how a 50% error hides for six months.
