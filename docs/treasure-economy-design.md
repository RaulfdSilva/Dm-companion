# Treasure economy design — v0.1 proposal

Date: 2026-11-08. **Status: draft for owner review; the proposed economy is not approved.**
This is a design specification only. No treasure dataset, generator, UI, dependency,
or dice-engine change is part of this task.

## Scope, provenance, and proposal summary

The owner has approved four CR bands (0–4, 5–10, 11–16, 17+), currency-only
individual treasure, party-wide hoards containing currency with a chance of magic
items, SRD 5.2.1 ingredients, original distributions, and no gems or art objects.
Those decisions are retained. All amounts, dice formulas, probability ranges,
cadence assumptions, and additional selection policies **below are proposals**.

The tables were constructed for this design from a chosen small-purse distribution,
a party-cache distribution, and explicit scaling factors. They are not copied,
rescaled, or rearranged from non-SRD DMG tables. The four CR bands come from the
owner's instructions, not an asserted SRD treasure rule. This proposal is intended
for the updated fifth-edition rules; it is neither an official D&D economy nor a
claim of DMG-equivalent output.

| CR band | Mean individual currency | Mean hoard currency, whole party | Chance of one magic item per hoard |
| --- | ---: | ---: | ---: |
| 0–4 | 2.93 GP | 279.50 GP | 40% |
| 5–10 | 29.30 GP | 1,397.50 GP | 60% |
| 11–16 | 146.50 GP | 5,590 GP | 75% |
| 17+ | 732.50 GP | 16,770 GP | 85% |

These are unconditional expectations, including empty individual purses and
itemless hoards. They are not guaranteed rewards or per-character hoard values.

## Official SRD facts versus original design

The [content and licensing audit](srd-content-audit.md) establishes the content
boundary, attribution requirements, and missing official treasure distributions.
Use the audited English [SRD 5.2.1 PDF][srd], not D&D Beyond tooltips or unrelated
web tables, as the item source. Printed and PDF page numbers match.

| Official SRD fact used here | Exact source | Original DM Companion decision built on it |
| --- | --- | --- |
| CP, SP, EP, GP, and PP; one GP equals 100 CP or 10 SP; one EP equals half a GP; one PP equals 10 GP | Equipment → Coins → Coin Values, [p. 89][srd89] | Random rewards use SP, GP, and PP for compact amounts. CP and EP remain valid conversion units but are not sampled in this proposal. |
| Mundane equipment prices and a basic Potion of Healing price | Equipment → Armor, [p. 92][srd92]; Adventuring Gear → Potion of Healing, [p. 99][srd99] | Use 1,500-GP Plate Armor and a 50-GP basic potion as purchasing-power checks, not as mandatory purchases or loot targets. |
| Magic-item rarity values and consumable adjustments; underlying equipment cost is added | Magic Items → Magic Item Values by Rarity, [pp. 205–206][srd205] | Appearance probabilities, rarity weights, and consumable/permanent mix are original. Values are planning estimates, not guaranteed sale proceeds. |
| Magic-item entries, rarity variants, and attunement requirements | Magic Items A–Z, [pp. 209–253][srd209]; Equipment → Attunement, [pp. 102–103][srd102] | A curated eligible pool and its exclusions are proposed below. No item mechanics are changed. |
| Higher-level starting-equipment guidance | Character Creation → Starting Equipment at Higher Levels, [p. 24][srd24] | This is context, not an official cumulative wealth curve or a source of treasure quantities. It does not approve this economy. |

The SRD has no CR-indexed individual/hoard distribution to implement; see the audit's
availability review. CC BY 4.0 permits use of the included material subject to its
conditions, not reproduction of the rest of the DMG. The SRD notice appears at the
end of this document. Original table licensing remains for the owner to decide.

## Operating assumptions and notation

- **One purse:** one search of a designated creature's carried currency, shared as
  the party chooses. It is not a payout to each character or automatically to every
  defeated creature. Creatures without a plausible purse need no individual roll.
- **One hoard:** one meaningful cache or adventure reward for the entire party.
  Never multiply by party size or award a separate hoard to every defeated guard.
  A purse and a hoard must not represent the same money twice.
- **Calibration cadence:** four characters, eight distinct individual-purse rolls
  and two distinct party-hoard rolls per level-sized reward interval. This is a
  proposed budget assumption, not a session, XP, or kill-count rule. The purses are
  outside the two hoards' contents. No income from other sources or expenses is
  assumed in the calculations.
- **CR assignment:** use the creature's CR for its purse. Proposed hoard handling
  is an explicitly chosen CR associated with the main guardians or adventure
  threat; no automatic aggregation formula is assumed. Fractional CRs belong to
  0–4. CR 17+ uses one flat band without further extrapolation. The same band need
  not match party level; that correspondence is used only in the budget examples.
- All selectors are independent fair `1d100` rolls, inclusive 1–100; percentile
  dice showing `00` mean 100. Select one currency cell, then roll its amount once.
  Currency and magic rolls are independent; a successful magic roll adds to coins.
- `×` multiplies the **entire** parenthesized dice total. For example,
  `(2d6+4) × 10 GP` means roll `2d6+4`, then multiply by ten gold pieces. Multipliers
  belong in a future generator layer; the existing dice API need not change.
- Coin quantities are integers. GP equivalents below are accounting comparisons,
  not extra coins. Later denomination conversion must preserve exact value; it
  must not round a fractional PP upward or apply another random multiplier.

## Individual treasure: original currency distributions

One selector: **01–30 empty (30%), 31–70 loose change (40%), 71–95 a full purse
(25%), 96–100 a windfall (5%)**. Individual treasure never rolls for magic items.

| CR band | 01–30: empty | 31–70: loose change | 71–95: full purse | 96–100: windfall |
| --- | --- | --- | --- | --- |
| 0–4 | 0 | `2d6` SP | `2d6` GP | `(2d6+2) × 2` GP |
| 5–10 | 0 | `2d6` GP | `2d6 × 10` GP | `(2d6+2) × 20` GP |
| 11–16 | 0 | `2d6 × 5` GP | `2d6 × 5` PP | `(2d6+2) × 10` PP |
| 17+ | 0 | `2d6 × 25` GP | `2d6 × 25` PP | `(2d6+2) × 50` PP |

### Expected value

For fair dice, `E[NdS] = N(S+1)/2`, so `E[2d6] = 7` and `E[2d6+2] = 9`.
The first-band mean is:

`E[I₀] = 0.30×0 + 0.40×(7/10) + 0.25×7 + 0.05×(9×2) = 2.93 GP`.

All first-band outcomes are multiplied in GP value by **1, 10, 50, and 250**
across the four bands. Thus `E[I] = 2.93 × factor` GP. Empty purses are included;
conditional on finding currency, the means are approximately 4.19, 41.86, 209.29,
and 1,046.43 GP. Those conditional figures must not replace the unconditional
means when budgeting all purse rolls.

## Hoards: original party currency distributions

One selector: **01–25 lean cache (25%), 26–85 standard cache (60%), 86–100 rich
cache (15%)**. Every hoard has positive currency; magic is determined separately.

| CR band | 01–25: lean cache | 26–85: standard cache | 86–100: rich cache |
| --- | --- | --- | --- |
| 0–4 | `(2d6+4) × 10` GP | `(4d6+6) × 15` GP | `(4d6+10) × 20` GP |
| 5–10 | `(2d6+4) × 5` PP | `(4d6+6) × 75` GP | `(4d6+10) × 10` PP |
| 11–16 | `(2d6+4) × 20` PP | `(4d6+6) × 30` PP | `(4d6+10) × 40` PP |
| 17+ | `(2d6+4) × 60` PP | `(4d6+6) × 90` PP | `(4d6+10) × 120` PP |

### Expected value

`E[2d6+4] = 11`, `E[4d6+6] = 20`, and `E[4d6+10] = 24`. First-band row means
are 110, 300, and 480 GP. Therefore:

`E[H₀] = 0.25×110 + 0.60×300 + 0.15×480 = 279.50 GP`.

Hoard GP-value factors are **1, 5, 20, and 60**, yielding 279.50, 1,397.50,
5,590, and 16,770 GP. These means cover **the whole party**. Fixed additions reduce
the chance that a meaningful cache is almost empty; multiple dice concentrate
outcomes near the middle without eliminating occasional richer rewards.

## Hoard magic: appearance, rarity, and item selection

**Original proposal:** each hoard contains zero or one magic item. First roll the
appearance selector. On success, independently roll the conditional rarity selector.
An item is one catalog reward unit, including a matched pair if the entry requires
it; it is not one item per character. There are no repeat appearance rolls.

| CR band | Appearance success on `1d100` | Conditional Common | Conditional Uncommon | Conditional Rare | Conditional Very Rare |
| --- | --- | --- | --- | --- | --- |
| 0–4 | 61–100 (40%) | 01–60 (60%) | 61–100 (40%) | — | — |
| 5–10 | 41–100 (60%) | 01–20 (20%) | 21–90 (70%) | 91–100 (10%) | — |
| 11–16 | 26–100 (75%) | 01–10 (10%) | 11–55 (45%) | 56–97 (42%) | 98–100 (3%) |
| 17+ | 16–100 (85%) | — | 01–25 (25%) | 26–85 (60%) | 86–100 (15%) |

A dash means 0%, not a missing result or permission to reroll. Failure of the first
selector means no magic item. Consequently, the **unconditional** probabilities
per hoard are:

| CR band | No magic | Common | Uncommon | Rare | Very Rare |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0–4 | 60% | 24% | 16% | 0% | 0% |
| 5–10 | 40% | 12% | 42% | 6% | 0% |
| 11–16 | 25% | 7.50% | 33.75% | 31.50% | 2.25% |
| 17+ | 15% | 0% | 21.25% | 51% | 12.75% |

For example, a Rare item at CR 5–10 occurs with `0.60×0.10 = 6%` probability,
not 10%. These are reward probabilities, not probabilities of buying an item.

### Proposed eligible pool and consumable policy

Common results select a **one-use consumable**. For Uncommon, Rare, and Very Rare,
an independent `1d100` selects a one-use consumable on **01–40 (40%)** or a
permanent item on **41–100 (60%)**. “Permanent” here means an enduring item, not
an item with unlimited uses; rechargeable items remain in this group. A healing
potion's precise rarity variant must match the rolled rarity.

Select uniformly within the approved pool for that rarity and treatment; unequal
rarity weights above do not imply equal power within a rarity. Pools should contain
only verified SRD entries with their exact variants, conditions, and provenance.
The calculations assume sampling with replacement across hoards: duplicates can
occur, and no duplicate reroll is implicit. This handling also requires owner review.
Common consumable candidates do exist, including Bead of Nourishment (p. 213),
Potion of Climbing (p. 235), and basic Potion of Healing (pp. 99, 236).

**Additional proposed exclusions, requiring owner review:** Legendary items,
Artifacts, cursed items, Spell Scrolls, and magic ammunition. The first two have
0% random appearance at every CR. Scrolls and ammunition have special valuation
or quantity rules (SRD pp. 103, 206, 209, 244) that would complicate this first
pricing model. Their omission is a design proposal, not a licensing prohibition.
Gems and art objects are excluded by the already approved product scope.

No catalog is populated in this task. Each supported rarity/treatment pool must
be nonempty and reviewed before implementation; an empty pool is a data-validation
failure, not a reason to reroll into a stronger rarity. Item suitability and
attunement do not silently increase the number of items or their rarity.

## Monetary expectations: cash versus item value

**Currency expectations are exact for the proposed fair-dice distributions.**
Magic-item figures below are approximate economic planning figures, not cash.

SRD p. 206 gives base values of 100/400/4,000/40,000 GP for Common/Uncommon/Rare/
Very Rare items, halving the value for consumables other than Spell Scrolls.
Under the proposed mix, the expected **base value conditional on rarity** is:

| Rarity | Proposed calculation | Conditional base value |
| --- | --- | ---: |
| Common | All eligible results are consumables: `100/2` | 50 GP |
| Uncommon | `0.40×200 + 0.60×400` | 320 GP |
| Rare | `0.40×2,000 + 0.60×4,000` | 3,200 GP |
| Very Rare | `0.40×20,000 + 0.60×40,000` | 32,000 GP |

Let `p` be appearance probability and `qᵣ` the conditional rarity weights.
`E[magic base] = p × Σ(qᵣ × conditional base valueᵣ)`.
For CR 11–16, this is
`0.75×(0.10×50 + 0.45×320 + 0.42×3,200 + 0.03×32,000) = 1,839.75 GP`.

| CR band | E[individual cash] | E[hoard cash] | E[magic base per hoard, including misses] | Hoard cash + nominal magic base |
| --- | ---: | ---: | ---: | ---: |
| 0–4 | 2.93 GP | 279.50 GP | 63.20 GP | 342.70 GP |
| 5–10 | 29.30 GP | 1,397.50 GP | 332.40 GP | 1,729.90 GP |
| 11–16 | 146.50 GP | 5,590 GP | 1,839.75 GP | 7,429.75 GP |
| 17+ | 732.50 GP | 16,770 GP | 5,780 GP | 22,550 GP |

These base estimates exclude underlying mundane-equipment costs. For an actual
approved catalog, add the expected applicable surcharge, weighted by the chance
of selecting each entry, as required by SRD pp. 205–206. Any entry-specific value
exception must also be applied. Exact catalog-level magic value therefore remains
unresolved; the final column is not a complete appraisal or a hard value ceiling.
Changing exclusions or the consumable mix requires recalculation.

SRD p. 205 makes magic-item buying/selling conditional on the campaign and describes
availability differences. An appraised item is not a guaranteed buyer, shop stock,
or reward of additional gold. Do not add its nominal value to the currency payout.

## Representative low, typical, and high currency outcomes

Low/typical/high below mean **10th/50th/90th percentiles of the entire currency
mixture**, including selector probabilities; the typical value is the median,
not a conditional row mean. For discrete outcomes, a percentile is the smallest
value whose cumulative probability reaches that percentage. These values were
calculated by exact enumeration of 2d6 and 4d6 sums. All amounts are GP equivalents.

| Reward | CR band | Low: P10 | Typical: P50 | High: P90 | Absolute possible range |
| --- | --- | ---: | ---: | ---: | ---: |
| Individual | 0–4 | 0 | 0.70 (7 SP) | 9 | 0–28 |
| Individual | 5–10 | 0 | 7 | 90 | 0–280 |
| Individual | 11–16 | 0 | 35 | 450 | 0–1,400 |
| Individual | 17+ | 0 | 175 | 2,250 | 0–7,000 |
| Hoard, party total | 0–4 | 100 | 285 | 450 | 60–680 |
| Hoard, party total | 5–10 | 500 | 1,425 | 2,250 | 300–3,400 |
| Hoard, party total | 11–16 | 2,000 | 5,700 | 9,000 | 1,200–13,600 |
| Hoard, party total | 17+ | 6,000 | 17,100 | 27,000 | 3,600–40,800 |

Worked examples illustrate actual selectable outcomes, not extra reward rolls:

- **Low purse, CR 0–4:** selector 20 produces no currency and never rolls magic.
- **Typical early purse:** selector 50 and dice 3+4 produce 7 SP, or 0.70 GP.
- **Typical CR 5–10 hoard with magic:** currency selector 50 and 4d6 faces
  3+3+3+4 yield `(13+6)×75 = 1,425 GP` for the party. Appearance 70, rarity 80,
  and treatment 20 allow an Uncommon consumable, such as a greater Potion of
  Healing (SRD p. 236). Its nominal 200-GP value is not extra cash.
- **High CR 11–16 purse:** selector 100 and dice 6+6 yield `(12+2)×10 = 140 PP`,
  or 1,400 GP. This is the maximum, not the 90th percentile.
- **High CR 17+ hoard:** currency selector 95 and 4d6 faces 5+5+5+5 yield
  `(20+10)×120 = 3,600 PP`, or 36,000 GP. Appearance 90, rarity 95, and
  treatment 20 allow a Very Rare consumable, such as a supreme Potion of Healing
  (SRD p. 236). This deliberately rare example is neither a typical reward nor a
  percentile of combined cash and item value.

Examples identify licensed items without reproducing their rules or constructing
an implementation catalog. Exact item selection would still depend on the later
approved pool.

## Progression rationale and cadence sensitivity

The aim is useful everyday purses and meaningful shared caches, with restrained
access to enduring high-rarity rewards. Purse value factors increase 10×, 5×, 5×
between bands, while hoards increase 5×, 4×, 3×. Later absolute rewards rise while
relative hoard growth tapers. No interpolation inside a band is proposed.

For `n` purses and `h` hoards, expected party cash is
`n×E[I] + h×E[H]`. With the proposed calibration of eight purses and two hoards:

| Band used for all rewards in the interval | Expected party cash | Per-character illustration, four-way split | Expected magic items | Expected permanent items |
| --- | ---: | ---: | ---: | ---: |
| 0–4 | 582.44 GP | 145.61 GP | 0.80 | 0.192 |
| 5–10 | 3,029.40 GP | 757.35 GP | 1.20 | 0.576 |
| 11–16 | 12,352 GP | 3,088 GP | 1.50 | 0.810 |
| 17+ | 39,400 GP | 9,850 GP | 1.70 | 1.020 |

Permanent expectation is `2×p×(1−qCommon)×0.60`. Purchases and crafting are not
included. Hoards supply roughly 96%, 92%, 91%, and 85% of cash respectively, so
minor-enemy farming is not intended as the primary progression path. This remains
dependent on limiting the number of eligible purses; CR alone cannot prevent farming.

At the same cadence, four first-band intervals give approximately **582.44 GP per
character before expenses**. Basic 50-GP potions are meaningful purchases; 1,500-GP
Plate Armor is not immediately funded by that reward stream alone. Tier-two income
makes saving for it more plausible. These are SRD price comparisons, not proof of
balance, an assumed potion shop, or a prescription for how players spend money.

As an exposure illustration, twenty level-sized reward intervals using bands for
4/6/6/4 intervals yield **252,218.16 GP party cash**, or **63,054.54 GP each** with
equal four-way division, plus **26.2 magic items** of which approximately **13.164
are permanent**. That is about 3.29 permanent rewards per character, not a guarantee
of equal distribution, usefulness, or attunement eligibility. Twenty intervals
include play at level 20; this is not a claim of twenty level-ups. Actual monster
CRs can differ from party level, so a real campaign needs its actual CR/reward mix.

These figures exclude starting money, recovered gear, quest income outside these
hoards, expenses, sales, and crafting. Doubling hoard frequency doubles hoard cash
and expected magic items; adding another eight purse rolls adds only another
`8×E[I]`. Giving every character a full party hoard instead of a share multiplies
hoard income by four in this example and violates the approved party-wide scope.

## Balance risks and proposed review checks

| Risk | Quantified exposure or implication | Proposed response for review |
| --- | --- | --- |
| Too many treasure events | A CR 17+ hoard averages 16,770 GP; four such caches in place of two add 33,540 GP party cash per interval. | Calibrate reward-event frequency first. Use a hoard for an adventure milestone, not every encounter. Keep unrelated quest payments in the same campaign budget. |
| Repeated or farmable purses | An average alone does not cap rewards; arbitrarily many designated carriers produce arbitrarily much gold. | One roll per unique purse/cache; avoid paying summoned, created, or repeatedly searched creatures automatically. These eligibility rules need owner review. |
| Boundary jumps | CR 4→5 increases mean purse value 10× and mean hoard value 5×. A minor CR change can dominate a session's wealth. | Show and review the selected band; do not automatically upgrade a hoard because one incidental creature crosses a threshold. No smoothing rule is approved here. |
| Strong early magic | A permanent Rare result at CR 5–10 has `0.60×0.10×0.60 = 3.6%` chance per hoard; across twelve hoards, the chance of at least one is about 35.6%. | Curate entries within each rarity, especially combat bonuses, flight, and resource-generating effects. Rarity is a coarse measure, not a balance guarantee. |
| High-tier Very Rare concentration | At CR 17+, any Very Rare item occurs on 12.75% of hoards; a permanent Very Rare item on 7.65%. Across eight hoards, the chance of at least one is about 66.4% or 47.1% respectively. | Keep the one-item cap and review the 15% conditional Very Rare weight. Legendary and Artifact rolls are proposed at zero, not silently available in an empty pool. |
| Misleading magic-value averages | Very Rare results contribute 4,080 GP of the 5,780-GP nominal magic-base mean per CR 17+ hoard, despite appearing only 12.75% of the time. | Present coins separately from items; do not promise the combined mean as typical spendable wealth. Retest after approving the catalog and its value exceptions. |
| Unlimited magic purchases or sales | The illustrated top-band cash share is 9,850 GP per character per interval, enough to materially change power if every listed item can be bought without limit. | Review market availability and actual transactions with the GM. This proposal does not assume mandatory gold sinks, forbid trade, or rely on attunement as a universal item cap. |
| Party size or unequal sharing | Hoards do not scale automatically; two players receive twice the four-player share, six players receive two-thirds. | Keep party-wide output fixed as approved; communicate the calibration assumption. Any party-size adjustment is a separate owner decision. |
| Magic droughts or too few lasting upgrades | Eight early hoards still have a `0.60⁸ ≈ 1.68%` chance of no magic at all. The full-campaign illustration averages only 3.29 permanent items per character before trade/crafting. | Review both scarcity and excess in play. Do not add an undisclosed pity timer; changing guarantees or cadence requires rebalancing. The SRD starting-at-higher-levels table is not a cumulative target this design has proven it meets. |
| Misclassifying rewards | Scroll exceptions, ammunition bundles, equipment surcharges, matched pairs, and rechargeable items can distort nominal estimates. | Approve entries/variants and reward-unit definitions explicitly. Keep excluded categories excluded until their economics are reviewed. |

## Assumptions and decisions still requiring review

1. Approve or revise the proposed currency coefficients and percentile ranges;
   approved CR bands and the currency-only/party-hoard distinction stay fixed.
2. Confirm that two hoards and eight eligible purses per level-sized interval are
   a useful calibration target. Specify how a GM chooses hoard CR for mixed threats
   or a cache without guardians. No encounter-to-treasure formula is approved.
3. Approve the one-item cap, appearance chances, rarity weights, and Common-only
   consumables / other-rarity 40:60 mix. Review both high-tier item access and
   potentially slow early permanent-item acquisition.
4. Review the proposed extra exclusions and curate each eligible item/variant pool.
   Uniform within-pool selection, duplicate handling, and nominal monetary estimates
   remain conditional on that review. Check equipment surcharges and item-specific
   exceptions before claiming an exact item-value expectation.
5. Confirm expected market access, non-treasure income, party sizes, and desired
   reward cadence in target campaigns. No mandatory spending, automatic party-size
   scaling, market restriction, or deterministic item guarantee is selected here.
6. Decide the license for the original distributions and preserve SRD attribution
   and separation of provenance when any implementation is later approved.

The proposal has not been playtested. A later validation phase should exercise
multiple CR mixes and twice/half the assumed cadence, track actual purchasing
power and powerful permanent items, and compare observed outcomes with these
expectations. Implementation and further product decisions wait for owner review.

## Calculation and scope validation

- Analytic expectations were checked by exact finite enumeration of 2d6 and 4d6
  sums using rational probabilities, not by a random simulation. The resulting
  mixtures normalize to 100%; P10/P50/P90 and support endpoints were checked.
- All `1d100` partitions cover 1–100 without overlaps or gaps. Appearance and
  conditional rarity probabilities were multiplied to obtain unconditional rates.
  Party budgets, conditional purse means, item counts, and repeated-hoard chances
  were calculated separately.
- SRD currency ratios, price anchors, rarity values, and relevant section references
  were checked against the audited official PDF. No non-SRD DMG distributions or
  item text were consulted as design inputs.
- Only `docs/treasure-economy-design.md` is added. No executable datasets, generator
  logic, UI, dependencies, dice engine, or existing audit document change. Runtime
  tests are not applicable to this design-only document.

## SRD attribution and sources

> This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

SRD facts are summarized and reorganized here. All reward quantities, probability
distributions, CR scaling, eligibility policies, and balance assessments are original
DM Companion proposals, not Wizards-authored rules. Retain the notices and change
indications described in the [audit](srd-content-audit.md) and [CC BY 4.0][legal].
The SRD notice refers to the warranty disclaimer and liability limitation in CC
section 5; attribution does not imply endorsement or grant trademark rights.

[srd]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
[legal]: https://creativecommons.org/licenses/by/4.0/legalcode
[srd24]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=24
[srd89]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=89
[srd92]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=92
[srd99]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=99
[srd102]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=102
[srd205]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=205
[srd209]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=209
