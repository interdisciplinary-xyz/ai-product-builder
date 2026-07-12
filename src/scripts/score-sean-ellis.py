#!/usr/bin/env python3
"""Sean Ellis PMF survey scorer, with the polite-signal discount.

The Sean Ellis question — "How would you feel if you could no longer use
<product>?" — has one benchmark: >= 40% answering "very disappointed" is the
conventional product-market-fit line.

The number is easy to compute and easy to believe. The problem is that a
cohort-sized read (N=20..100) is usually contaminated: warm-network users say
"very disappointed" because they are being kind, not because they would be
devastated. The raw percentage is therefore an OVERCOUNT, and founders scale on
it. This script prints the raw verdict AND a discounted verdict, and asks you
to act on the second one.

POLITE-SIGNAL FLAGS (each one costs the response confidence)
------------------------------------------------------------
  response_within_hours_of_dm  they replied within N hours of a personal ask
  answer_too_broad             "who would benefit" is broad ("anyone", "teams")
  answer_too_generic           "main benefit" names no concrete workflow
  low_usage_count              they have used the product fewer than N times

A response carrying `--downgrade-at` flags or more (default 2) is downgraded
one bucket: "very" becomes "somewhat" for the headline rate. Real signal looks
the opposite way — an unprompted reply, days later, naming a specific workflow,
describing an uncomfortably narrow audience, with a complaint attached (people
complain about things they depend on).

USAGE
-----
    python3 score-sean-ellis.py responses.json
    python3 score-sean-ellis.py responses.csv
    cat responses.json | python3 score-sean-ellis.py -
    python3 score-sean-ellis.py responses.json --json
    python3 score-sean-ellis.py examples/pmf-responses.example.json

    # The genericity heuristic is only as good as the nouns you give it.
    # Pass the workflow nouns YOUR users would name if they meant it:
    python3 score-sean-ellis.py r.json --workflow-nouns invoice,handoff,standup

INPUT — one object per respondent (JSON list, {"responses": [...]}, or CSV)
--------------------------------------------------------------------------
    {
      "respondent_id": "u-101",
      "disappointment": "very" | "somewhat" | "not" | "na",
      "who_benefits":   "free text — the ICP question",
      "main_benefit":   "free text — the retention question",
      "delivery_surface": "email" | "in_app" | "dm" | "other",
      "responded_within_hours": 36,
      "usage_count": 9
    }

Aliases accepted: q1_disappointment / q2_who_benefits / q3_main_benefit.
Missing fields fail SAFE — a missing `usage_count` is treated as unknown-low,
because an unmeasured user is not a proven one.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from collections import Counter

# The conventional PMF line. Do not move it to make a number look better.
SEAN_ELLIS_THRESHOLD = 40.0

BUCKETS = ("very", "somewhat", "not", "na")

# "Who would benefit?" — a broad answer means they cannot picture the user.
# The best answers are uncomfortably narrow.
BROAD_MARKERS = {
    "anyone", "everyone", "everybody", "all", "any", "most", "people",
    "person", "humans", "someone", "somebody", "many", "lots", "general",
    "public", "users", "companies", "businesses", "teams", "professionals",
}

# "What is the main benefit?" — these words appear when someone is being
# pleasant rather than specific. They are the vocabulary of a compliment.
GENERIC_MARKERS = {
    "useful", "helpful", "helps", "help", "great", "good", "nice", "cool",
    "easy", "easier", "simple", "convenient", "interesting", "amazing",
    "awesome", "love", "like", "better", "improves", "improved", "quality",
    "efficient", "efficiency", "productivity", "saves", "value", "everything",
}

STOPWORDS = {
    "the", "a", "an", "to", "of", "and", "or", "but", "i", "you", "we", "it",
    "is", "was", "are", "be", "for", "with", "on", "in", "at", "by", "as",
    "this", "that", "my", "me", "have", "has", "had", "do", "does", "did",
    "would", "could", "should", "can", "will", "so", "if", "not", "no", "yes",
    "from", "use", "using", "used", "very", "really", "just", "more", "less",
    "much", "any", "also", "out", "up", "down", "about", "into", "through",
    "over", "under", "again", "when", "what", "who", "how", "them", "they",
    "their", "our", "your", "its", "get", "gets", "make", "makes", "than",
    "then", "there", "here", "some", "all", "one", "like",
}


def words(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z][a-zA-Z'-]+", (text or "").lower())


def get(resp: dict, *names: str, default=None):
    """First present key among `names` — tolerates q1_/q2_/q3_ aliases."""
    for name in names:
        if name in resp and resp[name] not in (None, ""):
            return resp[name]
    return default


# --------------------------------------------------------------------------
# flags
# --------------------------------------------------------------------------


def answer_too_broad(text: str, min_words: int) -> bool:
    """The ICP answer is broad: too short, or led by a catch-all noun."""
    tokens = words(text)
    if len(tokens) < min_words:
        return True
    # A broad marker in the opening clause is the tell. "Anyone with a team"
    # is broad; "engineers who inherit a legacy service" is not.
    return any(t in BROAD_MARKERS for t in tokens[:4])


def answer_too_generic(text: str, workflow_nouns: set[str], min_words: int) -> bool:
    """The benefit answer is generic: it compliments instead of describing.

    If you supplied --workflow-nouns, naming one clears the flag: the user
    reached for a concrete thing they do. With no noun list, we fall back to
    length plus the compliment vocabulary, which is weaker — supply the nouns.
    """
    tokens = words(text)
    if len(tokens) < min_words:
        return True
    if workflow_nouns and any(t in workflow_nouns for t in tokens):
        return False
    content = [t for t in tokens if t not in STOPWORDS]
    if not content:
        return True
    generic_hits = sum(1 for t in content if t in GENERIC_MARKERS)
    # Mostly compliment, little substance.
    return generic_hits / len(content) >= 0.25


def compute_flags(resp: dict, cfg: argparse.Namespace) -> list[str]:
    flags: list[str] = []

    surface = str(get(resp, "delivery_surface", default="") or "").strip().lower()
    hours = get(resp, "responded_within_hours", "hours_to_respond")
    try:
        hours = float(hours) if hours is not None else None
    except (TypeError, ValueError):
        hours = None
    if surface == "dm" and hours is not None and hours <= cfg.dm_window_hours:
        flags.append("response_within_hours_of_dm")

    if answer_too_broad(
        str(get(resp, "who_benefits", "q2_who_benefits", default="") or ""),
        cfg.min_words,
    ):
        flags.append("answer_too_broad")

    if answer_too_generic(
        str(get(resp, "main_benefit", "q3_main_benefit", default="") or ""),
        cfg.workflow_nouns,
        cfg.min_words,
    ):
        flags.append("answer_too_generic")

    usage = get(resp, "usage_count", "uses")
    try:
        usage = int(usage) if usage is not None else None
    except (TypeError, ValueError):
        usage = None
    # Unknown usage is not innocent — an unmeasured user is not a proven one.
    if usage is None or usage < cfg.min_usage:
        flags.append("low_usage_count")

    return flags


# --------------------------------------------------------------------------
# scoring
# --------------------------------------------------------------------------


def bucket_of(pct: float) -> tuple[str, str]:
    if pct >= SEAN_ELLIS_THRESHOLD:
        return ("SCALE", (
            "At or above the 40% line. Scale signal — but only if the "
            "'who benefits' answers cluster on ONE segment. If every "
            "respondent names a different main benefit, you do not have one "
            "product with fit; you have four small audiences that each like a "
            "different feature."
        ))
    if pct >= 25:
        return ("ITERATE", (
            "Real signal, wrong aim. The product is a must-have for a "
            "sub-segment you are not targeting. Find that sub-segment in the "
            "'who benefits' answers, reposition, re-read in 4 weeks at N>=30. "
            "Do not add features."
        ))
    if pct >= 15:
        return ("WEAK", (
            "Weak signal — possibly real, possibly politeness that survived "
            "the discount. Interview 5 of the 'very disappointed' respondents "
            "before deciding anything. If a coherent sub-segment surfaces, "
            "pivot toward it; if it does not, pivot harder."
        ))
    return ("KILL", (
        "No fit. Features do not move this number — positioning, ICP and the "
        "problem statement do. Either restate the problem entirely, or stop."
    ))


def cluster(texts: list[str], top_k: int) -> list[tuple[str, int]]:
    counter: Counter = Counter()
    for text in texts:
        for t in words(text):
            if t in STOPWORDS or len(t) < 3:
                continue
            counter[t] += 1
    return counter.most_common(top_k)


def score(responses: list[dict], cfg: argparse.Namespace) -> dict:
    n = len(responses)
    if n == 0:
        raise SystemExit("no responses found in the input")

    raw = Counter()
    discounted = Counter()
    annotated = []
    downgraded = 0

    for r in responses:
        b = str(get(r, "disappointment", "q1_disappointment", default="na") or "na")
        b = b.strip().lower()
        if b not in BUCKETS:
            # "Very disappointed" / "VERY" / "very_disappointed" all land here.
            b = next((k for k in BUCKETS if b.startswith(k)), "na")

        flags = compute_flags(r, cfg)
        raw[b] += 1

        db = b
        if b == "very" and len(flags) >= cfg.downgrade_at:
            db = "somewhat"
            downgraded += 1
        discounted[db] += 1

        annotated.append({
            "respondent_id": get(r, "respondent_id", "id", default="?"),
            "raw": b,
            "discounted": db,
            "flags": flags,
        })

    def pct(c: Counter, key: str) -> float:
        return round(100 * c[key] / n, 1)

    raw_very = pct(raw, "very")
    disc_very = pct(discounted, "very")
    verdict, note = bucket_of(disc_very)

    very_ids = {a["respondent_id"] for a in annotated if a["raw"] == "very"}
    very = [r for r in responses
            if get(r, "respondent_id", "id", default="?") in very_ids]

    return {
        "n": n,
        "threshold": SEAN_ELLIS_THRESHOLD,
        "raw": {b: {"count": raw[b], "pct": pct(raw, b)} for b in BUCKETS},
        "discounted": {b: {"count": discounted[b], "pct": pct(discounted, b)}
                       for b in BUCKETS},
        "raw_verdict_pct": raw_very,
        "discounted_verdict_pct": disc_very,
        "downgraded": downgraded,
        "passes_raw": raw_very >= SEAN_ELLIS_THRESHOLD,
        "passes_discounted": disc_very >= SEAN_ELLIS_THRESHOLD,
        "verdict": verdict,
        "verdict_note": note,
        "flag_tally": dict(Counter(f for a in annotated for f in a["flags"])),
        "responses": annotated,
        "who_benefits_clusters": cluster(
            [str(get(r, "who_benefits", "q2_who_benefits", default="") or "")
             for r in very], cfg.top_k),
        "main_benefit_clusters": cluster(
            [str(get(r, "main_benefit", "q3_main_benefit", default="") or "")
             for r in very], cfg.top_k),
        "small_n": n < 20,
    }


# --------------------------------------------------------------------------
# io
# --------------------------------------------------------------------------


def load(path: str, fmt: str | None) -> list[dict]:
    raw = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()

    if fmt is None:
        fmt = "csv" if path.lower().endswith(".csv") else "json"
        if path == "-":
            fmt = "json" if raw.lstrip()[:1] in "[{" else "csv"

    if fmt == "csv":
        return list(csv.DictReader(io.StringIO(raw)))

    data = json.loads(raw)
    if isinstance(data, dict) and "responses" in data:
        data = data["responses"]
    if not isinstance(data, list):
        raise SystemExit("JSON must be a list of responses, or {\"responses\": [...]}")
    return data


def emit_text(result: dict, product: str) -> None:
    n = result["n"]
    line = "-" * 66

    print("=" * 66)
    print(f"SEAN ELLIS PMF READ — {product} — N={n}")
    print("=" * 66)
    print()
    print("  RAW                                    DISCOUNTED (act on this)")
    print(line)
    labels = {
        "very": "very disappointed",
        "somewhat": "somewhat disappointed",
        "not": "not disappointed",
        "na": "no longer use it",
    }
    for b in BUCKETS:
        r, d = result["raw"][b], result["discounted"][b]
        move = ""
        if d["count"] != r["count"]:
            move = f"  ({d['count'] - r['count']:+d})"
        print(f"  {labels[b]:<22} {r['count']:>3}  {r['pct']:>5.1f}%   →   "
              f"{d['count']:>3}  {d['pct']:>5.1f}%{move}")
    print(line)
    print()

    raw_pct, disc_pct = result["raw_verdict_pct"], result["discounted_verdict_pct"]
    gap = raw_pct - disc_pct

    def mark(p: float) -> str:
        return "PASS" if p >= SEAN_ELLIS_THRESHOLD else "FAIL"

    print(f"  Raw verdict          {raw_pct:>5.1f}%   vs 40% threshold  →  {mark(raw_pct)}")
    print(f"  Discounted verdict   {disc_pct:>5.1f}%   vs 40% threshold  →  {mark(disc_pct)}")
    print(f"  {result['downgraded']} response(s) downgraded on polite-signal flags "
          f"({gap:.1f} points of the raw number)")
    print()

    if result["passes_raw"] and not result["passes_discounted"]:
        print("  ⚠  THE HEADLINE NUMBER PASSES AND THE REAL ONE DOES NOT.")
        print("     This is the exact failure mode the discount exists to catch:")
        print("     you would have scaled on politeness. Do not scale.")
        print()

    print(f"  VERDICT: {result['verdict']}")
    for chunk in wrap(result["verdict_note"], 62):
        print(f"    {chunk}")
    print()

    if result["flag_tally"]:
        print(line)
        print("  FLAGS FIRED")
        print(line)
        for flag, count in sorted(result["flag_tally"].items(),
                                  key=lambda kv: -kv[1]):
            print(f"    {flag:<32} {count:>3}")
        print()

    downgrades = [r for r in result["responses"]
                  if r["raw"] == "very" and r["discounted"] != "very"]
    if downgrades:
        print(line)
        print("  DOWNGRADED RESPONSES (spot-check these by hand — the heuristic")
        print("  is a prompt to look, not a verdict on a person)")
        print(line)
        for r in downgrades:
            print(f"    {str(r['respondent_id']):<14} {', '.join(r['flags'])}")
        print()

    if result["who_benefits_clusters"] or result["main_benefit_clusters"]:
        print(line)
        print("  WHAT THE 'VERY DISAPPOINTED' USERS SAID")
        print(line)
        wb = ", ".join(f"{w} ({c})" for w, c in result["who_benefits_clusters"])
        mb = ", ".join(f"{w} ({c})" for w, c in result["main_benefit_clusters"])
        print(f"    who benefits : {wb or '—'}")
        print(f"    main benefit : {mb or '—'}")
        print()
        print("    If the 'main benefit' words do not converge, the number is")
        print("    lying even when it passes: that is several small audiences,")
        print("    not one product with fit.")
        print()

    if result["small_n"]:
        print(line)
        print(f"  ⚠  N={n} — BELOW THE READ THRESHOLD")
        print(line)
        swing = round(100 / n, 1)
        print(f"    One respondent is worth {swing}% here. Two people changing")
        print("    their mind moves the headline by more than the discount does.")
        print("    Treat this as directional only. Re-read at N>=30.")
        print()


def wrap(text: str, width: int) -> list[str]:
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


# --------------------------------------------------------------------------
# cli
# --------------------------------------------------------------------------


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="score-sean-ellis.py",
        description=(
            "Score a Sean Ellis PMF survey against the 40% threshold — raw AND "
            "discounted for polite signal. Reads JSON or CSV from a path or "
            "stdin ('-')."
        ),
        epilog=(
            "The discounted number is the one to act on. If the raw number "
            "passes and the discounted number does not, you were about to "
            "scale on politeness."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("input", help="path to responses.json / responses.csv, or '-' for stdin")
    p.add_argument("--format", choices=["json", "csv"], default=None,
                   help="override format detection (default: infer from extension)")
    p.add_argument("--product", default="«PROJECT»",
                   help="product name for the report header")
    p.add_argument("--workflow-nouns", default="",
                   help="comma-separated nouns a real user would name (invoice,handoff,"
                        "standup). Naming one clears the answer_too_generic flag")
    p.add_argument("--min-usage", type=int, default=5,
                   help="uses below this fire low_usage_count")
    p.add_argument("--dm-window-hours", type=float, default=1.0,
                   help="a reply to a personal DM within this many hours is polite signal")
    p.add_argument("--min-words", type=int, default=4,
                   help="answers shorter than this are treated as broad/generic")
    p.add_argument("--downgrade-at", type=int, default=2,
                   help="how many flags downgrade a 'very disappointed' response")
    p.add_argument("--top-k", type=int, default=5,
                   help="how many clustered words to show per open-text question")
    p.add_argument("--json", action="store_true",
                   help="emit JSON instead of the human-readable report")

    args = p.parse_args(argv)
    args.workflow_nouns = {
        w.strip().lower() for w in args.workflow_nouns.split(",") if w.strip()
    }
    if args.downgrade_at < 1:
        p.error("--downgrade-at must be >= 1")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    responses = load(args.input, args.format)
    result = score(responses, args)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        emit_text(result, args.product)
    return 0


if __name__ == "__main__":
    sys.exit(main())
