#!/usr/bin/env python3
"""Unit-economics stress test: which variable, off by 50%, kills the model?

This is NOT a forecast. A forecast tells you what you will earn; a stress test
tells you which assumption is load-bearing — i.e. which one you must go and
validate before you spend money on top of it.

Product-neutral and dependency-free (stdlib only). Every input is a CLI flag;
running with zero args uses demo defaults so you can see the shape of the
output before wiring in your own numbers.

    python3 sensitivity-table.py --help
    python3 sensitivity-table.py                       # demo defaults
    python3 sensitivity-table.py --price 6 --cadence monthly --churn 0.06
    python3 sensitivity-table.py --json                # machine-readable

WHAT IT MODELS
--------------
A steady-state subscription funnel:

    signups/month × conversion  =  new paying users/month
    new paying users/month ÷ churn  =  steady-state paying users
    steady-state paying users × contribution margin − fixed burn  =  net/month

Contribution margin per paying user per month
    = (price − payment fees), amortised to a month
    − variable cost per paying user per month

THE PAYMENT-FEE PHYSICS (the part generalists get wrong)
--------------------------------------------------------
Payment fees are `pct × amount + fixed` PER TRANSACTION. The fixed part does
not care how small the transaction is, so at low price points it dominates:

    $0.30 fixed on a $1.50/mo charge  = 20.0% of revenue, before the % fee
    $0.30 fixed on an $18/yr charge   =  1.7% of revenue, before the % fee

Same product, same money, ~12x difference in fee load — purely from billing
cadence. This is why monthly billing can be structurally unviable at a price
point where annual is comfortable. The script always prints BOTH cadences at
the same monthly-equivalent price so the comparison is unavoidable.

The fee model is a flag (`--fee-pct`, `--fee-fixed`), not a hardcoded
provider. Look up your own processor's rate for your own region and card mix —
and use the rate for the cards you actually get, not the headline domestic one.

WHAT IT PRINTS
--------------
1. Unit economics at your assumptions (fees, contribution margin, break-even)
2. Cadence comparison (monthly vs annual at the same monthly-equivalent price)
3. Sensitivity table — each variable moved 50% the WRONG way, ranked by damage
4. A grid of net cash across (signups/month × conversion)
5. Trip-wires — the thresholds that should stop you, with the number filled in
"""

from __future__ import annotations

import argparse
import json
import math
import sys

# A model this far below break-even is "marginal", not "fine".
MARGINAL_FRACTION = 0.20
# Rule-of-thumb payback ceiling used to derive the CAC trip-wire.
CAC_LTV_RATIO = 3.0
# A fixed fee above this share of the transaction is a structural problem.
FIXED_FEE_ALARM = 0.05


# --------------------------------------------------------------------------
# model
# --------------------------------------------------------------------------


def fee_per_charge(price: float, fee_pct: float, fee_fixed: float) -> float:
    """Processor fee on a single transaction of `price`."""
    return price * fee_pct + fee_fixed


def unit_economics(
    price: float,
    cadence: str,
    fee_pct: float,
    fee_fixed: float,
    variable_cost: float,
    fixed_burn: float,
) -> dict:
    """Per-paying-user economics, normalised to a month.

    `price` is the amount charged per transaction at the chosen cadence:
    a monthly price if cadence=monthly, an annual price if cadence=annual.
    """
    charges_per_year = 12 if cadence == "monthly" else 1
    monthly_equivalent = price if cadence == "monthly" else price / 12

    fee = fee_per_charge(price, fee_pct, fee_fixed)
    gross_year = monthly_equivalent * 12
    fees_year = fee * charges_per_year
    effective_fee = fees_year / gross_year if gross_year else 0.0

    net_revenue_month = (gross_year - fees_year) / 12
    margin_month = net_revenue_month - variable_cost

    if margin_month > 0:
        break_even_users = math.ceil(fixed_burn / margin_month)
    else:
        break_even_users = None  # no user count fixes a negative margin

    return {
        "price": price,
        "cadence": cadence,
        "monthly_equivalent_price": monthly_equivalent,
        "fee_per_charge": fee,
        "fixed_fee_share_of_charge": (fee_fixed / price) if price else 0.0,
        "effective_fee_pct": effective_fee,
        "gross_revenue_per_user_month": monthly_equivalent,
        "net_revenue_per_user_month": net_revenue_month,
        "variable_cost_per_user_month": variable_cost,
        "contribution_margin_per_user_month": margin_month,
        "fixed_burn_monthly": fixed_burn,
        "break_even_paying_users": break_even_users,
    }


def steady_state(
    econ: dict, signups: float, conversion: float, churn: float
) -> dict:
    """Steady state of a funnel fed at `signups`/month and drained at `churn`."""
    new_paying_month = signups * conversion
    paying_users = new_paying_month / churn  # little's law: L = λ × W, W = 1/churn
    margin = econ["contribution_margin_per_user_month"]

    net_month = paying_users * margin - econ["fixed_burn_monthly"]
    lifetime_months = 1 / churn
    ltv = margin * lifetime_months

    be_users = econ["break_even_paying_users"]
    signups_needed = (be_users * churn / conversion) if be_users else None

    return {
        "signups_per_month": signups,
        "conversion": conversion,
        "churn_monthly": churn,
        "new_paying_per_month": new_paying_month,
        "steady_state_paying_users": paying_users,
        "lifetime_months": lifetime_months,
        "ltv": ltv,
        "cac_ceiling": ltv / CAC_LTV_RATIO,
        "net_cash_per_month": net_month,
        "signups_per_month_to_break_even": signups_needed,
    }


def evaluate(cfg: dict) -> dict:
    """Run the whole model from a flat config dict."""
    econ = unit_economics(
        cfg["price"],
        cfg["cadence"],
        cfg["fee_pct"],
        cfg["fee_fixed"],
        cfg["variable_cost"],
        cfg["fixed_burn"],
    )
    state = steady_state(econ, cfg["signups"], cfg["conversion"], cfg["churn"])
    return {"econ": econ, "state": state, "net": state["net_cash_per_month"]}


# --------------------------------------------------------------------------
# sensitivity
# --------------------------------------------------------------------------

# Each entry: (label, key, how to move it 50% the WRONG way, what it means)
STRESSES = [
    ("price", "price", lambda v: v * 0.5, "price is half what you assumed"),
    ("conversion", "conversion", lambda v: v * 0.5, "half as many visitors buy"),
    ("churn", "churn", lambda v: v * 1.5, "users leave 50% faster"),
    ("variable cost", "variable_cost", lambda v: v * 1.5, "cost per user is 50% higher"),
    ("fixed burn", "fixed_burn", lambda v: v * 1.5, "fixed costs are 50% higher"),
]


def verdict_for(net: float, baseline_net: float) -> str:
    if net < 0:
        return "KILLS"
    if baseline_net > 0 and net < baseline_net * MARGINAL_FRACTION:
        return "MARGINAL"
    return "SURVIVES"


def sensitivity(cfg: dict) -> dict:
    """Move each variable 50% the wrong way; rank by damage to net cash."""
    base = evaluate(cfg)
    baseline_net = base["net"]

    rows = []
    for label, key, move, meaning in STRESSES:
        stressed_cfg = dict(cfg)
        stressed_cfg[key] = move(cfg[key])
        result = evaluate(stressed_cfg)
        rows.append(
            {
                "variable": label,
                "meaning": meaning,
                "from": cfg[key],
                "to": stressed_cfg[key],
                "net_cash_per_month": result["net"],
                "damage": baseline_net - result["net"],
                "contribution_margin": result["econ"][
                    "contribution_margin_per_user_month"
                ],
                "break_even_paying_users": result["econ"]["break_even_paying_users"],
                "ltv": result["state"]["ltv"],
                "verdict": verdict_for(result["net"], baseline_net),
            }
        )

    rows.sort(key=lambda r: r["damage"], reverse=True)

    # The two worst variables, wrong at the same time. Reality does not stress
    # one assumption at a time, and founders never model this case.
    combined = None
    if len(rows) >= 2:
        worst = [r["variable"] for r in rows[:2]]
        combo_cfg = dict(cfg)
        for label, key, move, _ in STRESSES:
            if label in worst:
                combo_cfg[key] = move(cfg[key])
        combo = evaluate(combo_cfg)
        combined = {
            "variables": worst,
            "net_cash_per_month": combo["net"],
            "verdict": verdict_for(combo["net"], baseline_net),
        }

    return {
        "baseline_net_cash_per_month": baseline_net,
        "rows": rows,
        "load_bearing_variable": rows[0]["variable"] if rows else None,
        "combined_worst_two": combined,
    }


def grid(cfg: dict, signup_cases: list[float], conversion_cases: list[float]) -> dict:
    cells = []
    for s in signup_cases:
        for c in conversion_cases:
            probe = dict(cfg, signups=s, conversion=c)
            cells.append(
                {
                    "signups_per_month": s,
                    "conversion": c,
                    "net_cash_per_month": evaluate(probe)["net"],
                }
            )
    return {"cells": cells}


def trip_wires(cfg: dict, base: dict) -> list[dict]:
    """Thresholds that should stop you, with the number already filled in."""
    econ, state = base["econ"], base["state"]
    wires: list[dict] = []

    be = econ["break_even_paying_users"]
    if be is None:
        wires.append(
            {
                "id": "negative_margin",
                "rule": "STOP. Contribution margin is negative — every new paying "
                "user loses money. No amount of growth fixes this. Raise price, "
                "cut variable cost, or switch cadence before anything else.",
            }
        )
        return wires

    min_conversion = be * cfg["churn"] / cfg["signups"] if cfg["signups"] else None
    if min_conversion is not None:
        wires.append(
            {
                "id": "conversion_floor",
                "rule": f"If conversion < {min_conversion * 100:.2f}% at "
                f"{cfg['signups']:,.0f} signups/month, you never reach break-even "
                f"at this burn — do NOT open paid acquisition. Measure it over the "
                f"first 100-200 signups, before you spend.",
            }
        )

    wires.append(
        {
            "id": "variable_cost_ceiling",
            "rule": f"Variable cost per paying user must stay below "
            f"${econ['net_revenue_per_user_month']:.2f}/month "
            f"(you assumed ${cfg['variable_cost']:.2f}). Above that the margin "
            f"is negative. Instrument it in production; do not trust the estimate.",
        }
    )

    max_churn = None
    margin = econ["contribution_margin_per_user_month"]
    if margin > 0 and cfg["signups"] * cfg["conversion"] > 0:
        # churn at which steady-state paying users exactly covers the burn
        max_churn = (
            cfg["signups"] * cfg["conversion"] * margin / econ["fixed_burn_monthly"]
        )
        wires.append(
            {
                "id": "churn_ceiling",
                "rule": f"Monthly churn must stay below {min(max_churn, 1.0) * 100:.1f}% "
                f"(you assumed {cfg['churn'] * 100:.1f}%) or the funnel cannot "
                f"refill fast enough to cover the burn at this acquisition rate.",
            }
        )

    wires.append(
        {
            "id": "cac_ceiling",
            "rule": f"If you turn on paid acquisition, CAC must stay under "
            f"${state['cac_ceiling']:.2f} (LTV ${state['ltv']:.2f} ÷ {CAC_LTV_RATIO:.0f}). "
            f"Pre-launch, CAC is founder-time, not money — do not model it in "
            f"dollars until a paid channel is actually live.",
        }
    )

    if econ["fixed_fee_share_of_charge"] > FIXED_FEE_ALARM:
        wires.append(
            {
                "id": "fixed_fee_dominance",
                "rule": f"The fixed per-transaction fee is "
                f"{econ['fixed_fee_share_of_charge'] * 100:.1f}% of each "
                f"${cfg['price']:.2f} charge. Above ~{FIXED_FEE_ALARM * 100:.0f}% the "
                f"cadence — not the price — is your biggest cost line. Bill less "
                f"often (annual) or raise the per-charge amount.",
            }
        )

    return wires


# --------------------------------------------------------------------------
# output
# --------------------------------------------------------------------------


def money(x: float) -> str:
    return f"${x:,.2f}"


def rule(char: str = "-", width: int = 74) -> str:
    return char * width


def wrap(text: str, width: int = 68) -> list[str]:
    out, line = [], ""
    for word in text.split():
        if len(line) + len(word) + 1 > width:
            out.append(line)
            line = word
        else:
            line = f"{line} {word}".strip()
    if line:
        out.append(line)
    return out


def emit_text(cfg: dict, base: dict, sens: dict, g: dict, wires: list[dict]) -> None:
    econ, state = base["econ"], base["state"]
    other = "annual" if cfg["cadence"] == "monthly" else "monthly"

    print(rule("="))
    print("UNIT ECONOMICS — STRESS TEST (not a forecast)")
    print(rule("="))
    print(f"  Price                    {money(cfg['price'])} / {cfg['cadence']}")
    print(f"  Payment fee              {cfg['fee_pct'] * 100:.2f}% + {money(cfg['fee_fixed'])} per transaction")
    print(f"  Variable cost / user     {money(cfg['variable_cost'])} / month")
    print(f"  Fixed burn               {money(cfg['fixed_burn'])} / month")
    print(f"  Signups                  {cfg['signups']:,.0f} / month")
    print(f"  Conversion               {cfg['conversion'] * 100:.2f}%")
    print(f"  Churn                    {cfg['churn'] * 100:.2f}% / month")
    print()

    print(rule())
    print("PER PAYING USER")
    print(rule())
    print(f"  Gross revenue            {money(econ['gross_revenue_per_user_month'])} / month")
    print(f"  Payment fees             {econ['effective_fee_pct'] * 100:.1f}% effective "
          f"({money(econ['fee_per_charge'])} per charge)")
    print(f"  Net revenue              {money(econ['net_revenue_per_user_month'])} / month")
    print(f"  Variable cost           -{money(econ['variable_cost_per_user_month'])} / month")
    print(f"  CONTRIBUTION MARGIN      {money(econ['contribution_margin_per_user_month'])} / month")
    print(f"  Lifetime (1 / churn)     {state['lifetime_months']:.1f} months")
    print(f"  LTV                      {money(state['ltv'])}")
    print()
    if econ["break_even_paying_users"] is None:
        print("  BREAK-EVEN               never — contribution margin is negative.")
    else:
        print(f"  BREAK-EVEN               {econ['break_even_paying_users']:,} paying users "
              f"(covers {money(econ['fixed_burn_monthly'])}/mo burn)")
        if state["signups_per_month_to_break_even"]:
            print(f"                           = {state['signups_per_month_to_break_even']:,.0f} "
                  f"signups/month at {cfg['conversion'] * 100:.2f}% conversion "
                  f"and {cfg['churn'] * 100:.1f}% churn")
    print()
    print(f"  At your assumptions:     {state['steady_state_paying_users']:,.1f} paying users "
          f"in steady state")
    print(f"  NET CASH                 {money(state['net_cash_per_month'])} / month")
    print()

    # --- cadence -----------------------------------------------------------
    print(rule())
    print("CADENCE — the same money, billed differently")
    print(rule())
    m = econ["monthly_equivalent_price"]
    for cad, charge in (("monthly", m), ("annual", m * 12)):
        probe = unit_economics(
            charge, cad, cfg["fee_pct"], cfg["fee_fixed"],
            cfg["variable_cost"], cfg["fixed_burn"],
        )
        mark = "  ← you" if cad == cfg["cadence"] else ""
        be = probe["break_even_paying_users"]
        be_str = f"{be:,} users" if be else "never"
        print(f"  {cad:<8} {money(charge):>9} / charge   "
              f"fees {probe['effective_fee_pct'] * 100:>5.1f}%   "
              f"margin {money(probe['contribution_margin_per_user_month']):>7}/mo   "
              f"break-even {be_str}{mark}")
    print()
    print(f"  The fixed {money(cfg['fee_fixed'])} fee is "
          f"{econ['fixed_fee_share_of_charge'] * 100:.1f}% of each {money(cfg['price'])} charge. "
          f"A fixed fee is\n  indifferent to how small your charge is — that is the whole "
          f"asymmetry between\n  the two rows above. Switching to {other} does not change what "
          f"a user pays you;\n  it changes how many times the processor takes its cut.")
    print()

    # --- sensitivity -------------------------------------------------------
    print(rule())
    print("WHICH VARIABLE, OFF BY 50%, KILLS THE MODEL?")
    print(rule())
    base_be = econ["break_even_paying_users"]
    base_be_str = f"{base_be:,}" if base_be else "never"
    print(f"  {'variable':<16} {'moved to':>12} {'net/month':>12} {'break-even':>12}  verdict")
    print(f"  {rule('.', 16)} {rule('.', 12):>12} {rule('.', 12):>12} {rule('.', 12):>12}  {rule('.', 8)}")
    print(f"  {'(baseline)':<16} {'—':>12} {money(sens['baseline_net_cash_per_month']):>12} "
          f"{base_be_str:>12}  —")
    for r in sens["rows"]:
        to = (f"{r['to'] * 100:.2f}%" if r["variable"] in ("conversion", "churn")
              else money(r["to"]))
        be = r["break_even_paying_users"]
        be_str = f"{be:,}" if be else "never"
        print(f"  {r['variable']:<16} {to:>12} {money(r['net_cash_per_month']):>12} "
              f"{be_str:>12}  {r['verdict']}")
    print()
    top = sens["rows"][0]
    print(f"  LOAD-BEARING: {top['variable'].upper()} — {top['meaning']}, and net cash "
          f"moves by\n  {money(top['damage'])}/month. This is the assumption to validate first. "
          f"Everything you\n  build on top of an unvalidated {top['variable']} is built on the "
          f"same unvalidated {top['variable']}.")
    combo = sens["combined_worst_two"]
    if combo:
        print()
        print(f"  BOTH AT ONCE ({combo['variables'][0]} + {combo['variables'][1]}): "
              f"{money(combo['net_cash_per_month'])}/month → {combo['verdict']}")
        print("  Reality does not stress one assumption at a time.")
    print()

    # --- grid --------------------------------------------------------------
    print(rule())
    print("NET CASH / MONTH  (signups/month ↓ × conversion →)")
    print(rule())
    convs = sorted({c["conversion"] for c in g["cells"]})
    signups = sorted({c["signups_per_month"] for c in g["cells"]})
    by_key = {(c["signups_per_month"], c["conversion"]): c for c in g["cells"]}
    print("  signups/mo " + "".join(f"{c * 100:>11.2f}%" for c in convs))
    for s in signups:
        row = "".join(
            f"{by_key[(s, c)]['net_cash_per_month']:>+12,.0f}" for c in convs
        )
        print(f"  {s:>10,.0f}{row}")
    print()

    # --- trip-wires --------------------------------------------------------
    print(rule())
    print("TRIP-WIRES — measure these, and stop when one trips")
    print(rule())
    for i, w in enumerate(wires, 1):
        lines = wrap(w["rule"])
        print(f"  {i}. {lines[0]}")
        for extra in lines[1:]:
            print(f"     {extra}")
        print()


# --------------------------------------------------------------------------
# cli
# --------------------------------------------------------------------------


def csv_floats(s: str) -> list[float]:
    try:
        return [float(x.strip()) for x in s.split(",") if x.strip()]
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"expected comma-separated numbers: {exc}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="sensitivity-table.py",
        description=(
            "Unit-economics stress test. Answers 'which variable, off by 50%, "
            "kills the model?' — not 'how much will we make?'. Runs with zero "
            "args on demo defaults."
        ),
        epilog=(
            "The demo defaults describe a $12/year product with a $30/month burn. "
            "They are a shape to look at, not a recommendation. Replace every one "
            "of them with a number you can defend."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--price", type=float, default=12.0,
                   help="amount charged per transaction, in your currency")
    p.add_argument("--cadence", choices=["monthly", "annual"], default="annual",
                   help="how often --price is charged")
    p.add_argument("--fee-pct", type=float, default=0.029,
                   help="processor percentage fee, as a decimal (0.029 = 2.9%%)")
    p.add_argument("--fee-fixed", type=float, default=0.30,
                   help="processor FIXED fee per transaction — the killer at low prices")
    p.add_argument("--variable-cost", type=float, default=0.04,
                   help="variable cost per PAYING user per month (AI, storage, per-seat vendors)")
    p.add_argument("--fixed-burn", type=float, default=30.0,
                   help="fixed cost per month, independent of user count")
    p.add_argument("--conversion", type=float, default=0.02,
                   help="signup → paying conversion, as a decimal (0.02 = 2%%)")
    p.add_argument("--churn", type=float, default=0.05,
                   help="monthly churn of paying users, as a decimal (0.05 = 5%%/month)")
    p.add_argument("--signups", type=float, default=200.0,
                   help="new signups per month entering the funnel")
    p.add_argument("--grid-conversions", type=csv_floats, default="0.005,0.01,0.02,0.04",
                   help="conversion cases for the grid (comma-separated decimals)")
    p.add_argument("--grid-signups", type=csv_floats, default="100,200,500,1000,2500",
                   help="signups/month cases for the grid (comma-separated)")
    p.add_argument("--json", action="store_true",
                   help="emit JSON instead of the human-readable report")

    args = p.parse_args(argv)

    # argparse does not run `type` over a string default, so normalise here.
    for name in ("grid_conversions", "grid_signups"):
        value = getattr(args, name)
        if isinstance(value, str):
            setattr(args, name, csv_floats(value))

    problems = []
    if args.price <= 0:
        problems.append("--price must be > 0")
    if not 0 < args.conversion <= 1:
        problems.append("--conversion must be in (0, 1] — it is a decimal, not a percent")
    if not 0 < args.churn <= 1:
        problems.append(
            "--churn must be in (0, 1]. Zero churn has no steady state (users "
            "accumulate forever); if you truly believe churn is ~0, use a small "
            "value like 0.005 and read the result as a ceiling."
        )
    if not 0 <= args.fee_pct < 1:
        problems.append("--fee-pct must be in [0, 1) — it is a decimal, not a percent")
    if args.fee_fixed < 0:
        problems.append("--fee-fixed must be >= 0")
    if args.variable_cost < 0:
        problems.append("--variable-cost must be >= 0")
    if args.fixed_burn < 0:
        problems.append("--fixed-burn must be >= 0")
    if args.signups <= 0:
        problems.append("--signups must be > 0")
    if problems:
        p.error("\n  ".join(["invalid inputs:"] + problems))

    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    cfg = {
        "price": args.price,
        "cadence": args.cadence,
        "fee_pct": args.fee_pct,
        "fee_fixed": args.fee_fixed,
        "variable_cost": args.variable_cost,
        "fixed_burn": args.fixed_burn,
        "conversion": args.conversion,
        "churn": args.churn,
        "signups": args.signups,
    }

    base = evaluate(cfg)
    sens = sensitivity(cfg)
    g = grid(cfg, args.grid_signups, args.grid_conversions)
    wires = trip_wires(cfg, base)

    if args.json:
        print(json.dumps(
            {
                "inputs": cfg,
                "per_paying_user": base["econ"],
                "steady_state": base["state"],
                "sensitivity": sens,
                "grid": g,
                "trip_wires": wires,
            },
            indent=2,
        ))
    else:
        emit_text(cfg, base, sens, g, wires)

    return 0


if __name__ == "__main__":
    sys.exit(main())
