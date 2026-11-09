# Magic-item catalog proposal — v0.1

**Status: candidate catalog for owner review, not an approved implementation dataset.**
SRD names, rarities, and requirements below are verified source facts. Inclusion,
curation deferrals, and reward-unit recommendations are proposals unless explicitly
identified as already approved. No TypeScript catalog or generator is implemented.

## Sources and approved boundaries

The [approved economy](treasure-economy-design.md) governs currency, magic appearance,
rarity probabilities, treatment probabilities, the one-item cap, and duplicate
behavior. The [content audit](srd-content-audit.md) governs the source/licensing
boundary. This task additionally confirms uniform selection within each eligible
rarity/treatment pool; final pool membership still requires owner approval.

Research uses only the official English [SRD 5.2.1 PDF][srd], reached from the
[official SRD download page][landing]. Page references are printed/PDF page numbers,
not commercial-book page numbers. Candidate entries are in Magic Items A–Z,
pp. 209–253; the exact entry heading is the item name in each row. Healing variants
are individually identified by the table under Potions of Healing on p. 236.

Audited PDF SHA-256:
`8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87`.
The hash matches the content audit. Availability on D&D Beyond, an older edition's
entry, or an item appearing only in a commercial book is not a licensing basis.

**Already approved and unchanged:**

- Common: 100% consumable; no Common permanent pool is enabled.
- Uncommon, Rare, Very Rare: 40% consumable / 60% permanent.
- Legendary items, Artifacts, cursed items, Spell Scrolls, and magic ammunition
  are excluded. Other source exclusions cannot be added silently.
- At most one magic item per hoard, for the party; duplicate items may occur across
  separate generations. No duplicate prevention, pity timer, or extra item roll.
- Select uniformly inside the rolled rarity/treatment pool. Catalog size must not
  change the approved appearance, rarity, or treatment probabilities.

## Eligibility and classification policy

1. **Verify an exact SRD entry/variant.** Retain its official name, rarity, and
   attunement conditions. A category example or a mention inside another item's
   effect is not a new item entry. Do not invent a Common permanent item, lower a
   rarity, or import a non-SRD alias. A printed rarity variant is a separate candidate
   only when that exact variant is identified; flavor descriptions are not extra rows.
2. **Apply approved exclusions first.** Check the actual entry, including any curse
   or variant-specific restriction. Harmful or inconvenient does not automatically
   mean cursed: an additional exclusion needs its own stated justification.
3. **Consumable means its magical resource is expended without an ordinary way to
   replenish that same item.** Drinking a potion, using up a bead, scattering a
   single-use dust packet, or applying a vial of oil qualifies. An empty mundane
   container, or an enduring benefit to its user, does not make the original item
   permanent. All proposed consumable rows below are one-use reward units.
4. **Permanent means the item retains an ongoing or reusable magical function.**
   Ordinary charges, daily/rest recharge, or replaceable mundane fuel do not make
   it consumable. A possible last-charge destruction roll is a risk, not a reason
   to move a replenishable wand/staff into the consumable pool. Preserve the official
   risk. This follows the economy's rechargeable-item rule and SRD item-use rules
   on [pp. 204–206][p204].
5. **Finite multi-use items need an explicit unit/state decision.** A non-recharging
   bag of expendable contents is consumable at container level, not permanent merely
   because it has several uses. Such entries are deferred here rather than silently
   reducing an official packet/deck to one use. Century-recharging books are
   permanent under the literal rechargeable-item rule, but their practically
   single-use benefit warrants separate review; they are not counted below.
6. **Attunement is metadata, not a hidden draw filter.** “None” means the item's
   SRD heading imposes no attunement requirement; other operating conditions still
   apply. “Yes” alone imposes no class/spellcaster condition. Keep any explicit
   class/spellcaster requirement exactly as printed. An unusable result is not an
   automatic reroll or a stronger item. Party-aware filtering is not proposed here.
7. **One candidate is one complete named reward unit.** A potion/vial/packet/bead
   is one item. Paired boots/bracers are their complete named item. The proposed
   horseshoe row is the SRD's complete set of four, not four independent draws;
   its inclusion and reward-unit representation need owner confirmation.

These labels describe item use, not economic value or power. Rechargeable healing
equipment remains permanent; a consumable can still have a large lasting impact.
Source rules and restrictions always take precedence over these short summaries.

## Proposed pool counts

These are counts of **proposed candidate variants**, not the total eligible SRD
catalog. There are 40 candidates: 18 consumable and 22 permanent, drawn through
the approved staged probabilities rather than one flat 40-item lottery.

| Rarity | Consumable candidates | Permanent candidates | Total | Per-candidate chance once that pool is selected |
| --- | ---: | ---: | ---: | --- |
| Common | 3 | 0 — disabled | 3 | Consumable: 1/3 |
| Uncommon | 5 | 8 | 13 | Consumable: 1/5; permanent: 1/8 |
| Rare | 6 | 8 | 14 | Consumable: 1/6; permanent: 1/8 |
| Very Rare | 4 | 6 | 10 | Consumable: 1/4; permanent: 1/6 |
| Total | 18 | 22 | 40 | No cross-pool weighting is inferred from these counts. |

All seven enabled pools have verified candidates. Common's three-item pool is
source-limited: the other verified Common entry is the excluded Spell Scroll.
Very Rare consumables have only four proposed options, so repetition is more
noticeable. Neither pool is empty or prevents the approved probabilities. No
minimum pool size beyond nonempty has been approved; additional variety must not
come from invented entries or relaxed exclusions.

## Candidate items by rarity and treatment

Every row inherits the rarity and treatment in its heading. Attunement and source
are stated individually. Notes paraphrase restrictions and review concerns; they
are not replacement rules text. None of these selected entries specifies a curse.

### Common — consumable (3)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Bead of Nourishment | None | [p. 213][p213] | The bead is consumed. Narrow food utility may be less appealing than a potion; do not invent a reusable version. |
| Potion of Climbing | None | [p. 235][p235] | Temporary climbing benefit; retain its specific movement/check rules. |
| Potion of Healing | None | [p. 236][p236], Potions of Healing table | Basic Common variant only; stronger variants are separate rows in their printed rarities. |

### Uncommon — consumable (5)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Dust of Disappearance | None | [p. 219][p219] | One-use packet. Area invisibility can affect unintended subjects; retain the individual early-ending conditions. |
| Oil of Slipperiness | None | [p. 233][p233] | One vial. Coverage depends on creature size; larger creatures can require additional vials. Application time and ground-use alternative matter. |
| Potion of Animal Friendship | None | [p. 235][p235] | Uses the specified level-3 spell version; do not substitute an older-edition duration or spell level. |
| Potion of Healing (greater) | None | [p. 236][p236], Potions of Healing table | Exact Uncommon healing variant, not a renamed basic potion. |
| Potion of Water Breathing | None | [p. 236][p236] | Breathing underwater does not itself grant a Swim Speed. |

### Uncommon — permanent (8)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Bag of Holding | None | [p. 212][p212] | Capacity and extradimensional-container hazards remain; do not bundle contents or extra treasure. |
| Boots of Elvenkind | None | [p. 213][p213] | Complete pair. Stealth benefits may overlap with another party member's features. |
| Cloak of Elvenkind | Yes | [p. 215][p215] | Stealth/perception effects retain their exact subjects and conditions. |
| Cloak of Protection | Yes | [p. 216][p216] | Persistent defensive bonus; evaluate stacking across distinct items without suppressing permitted duplicate draws. |
| Goggles of Night | None | [p. 224][p224] | Existing Darkvision changes its benefit; do not reroll for characters who already have it. |
| Immovable Rod | None | [p. 227][p227] | Weight and movement limits matter; does not grant unlimited structural support. |
| Lantern of Revealing | None | [p. 228][p228] | Needs ordinary oil and illumination. Fuel is not a second magic item or an unlimited free supply. |
| Wand of Web | Yes — a Spellcaster | [p. 251][p251] | Replenishing charges make it permanent. Retain its last-charge destruction risk and casting requirements. |

### Rare — consumable (6)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Elixir of Health | None | [p. 220][p220] | Removes its listed conditions/contagions; do not treat it as universal curse removal. |
| Potion of Clairvoyance | None | [p. 235][p235] | Information gathering can bypass investigation; use its actual spell/no-Concentration terms. |
| Potion of Healing (superior) | None | [p. 236][p236], Potions of Healing table | Exact Rare variant. |
| Potion of Heroism | None | [p. 236][p236] | Preserve temporary HP and spell-effect terms; not a permanent character upgrade. |
| Potion of Invisibility | None | [p. 236][p236] | **Rare**, not Very Rare. Effect can end early on the specified actions. |
| Potion of Invulnerability | None | [p. 236][p236] | Strong but short-lived damage protection; retain its duration rather than treating it as enduring resistance. |

### Rare — permanent (8)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Amulet of Health | Yes | [p. 209][p209] | Sets Constitution to its specified value; existing high Constitution can make it unhelpful. |
| Boots of Speed | Yes | [p. 214][p214] | Complete pair. Limited activity time restores after a Long Rest; not disposable boots. |
| Bracers of Defense | Yes | [p. 214][p214] | Complete pair. Benefit requires no armor and no Shield; preserve both restrictions. |
| Cape of the Mountebank | None | [p. 215][p215] | Limited Dimension Door use returns at dawn; local teleportation is not unrestricted planar travel. |
| Portable Hole | None | [p. 234][p234] | Extradimensional storage and container interactions are significant hazards; do not prefill it with treasure. |
| Ring of Protection | Yes | [p. 238][p238] | Persistent defense can combine with other permitted equipment; rarity alone does not cap total party power. |
| Rope of Entanglement | None | [p. 242][p242] | Use the entry's targeting, save, and release conditions; do not import older repair/durability rules. |
| Staff of Healing | Yes — a Bard, Cleric, or Druid | [p. 245][p245] | Exact class prerequisite. Regains charges; retain its last-charge loss risk and spell table. |

### Very Rare — consumable (4)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Potion of Flying | None | [p. 235][p235] | Temporary flight can end while airborne; preserve the entry's falling warning. |
| Potion of Healing (supreme) | None | [p. 236][p236], Potions of Healing table | Exact Very Rare healing variant. |
| Potion of Speed | None | [p. 236][p236] | Preserve the specified Haste benefit and its exception to the usual ending drawback. |
| Potion of Vitality | None | [p. 236][p236] | Removes its listed conditions and affects later Hit Point Dice use; not unlimited immediate healing. |

### Very Rare — permanent (6)

| Official item name | Attunement | SRD reference | Restrictions or eligibility concern |
| --- | --- | --- | --- |
| Cloak of Arachnida | Yes | [p. 215][p215] | Combines climbing, web-related benefits, and limited casting; preserve all restrictions and recharge. |
| Horseshoes of a Zephyr | None | [p. 226][p226] | Proposed reward unit is the complete set of four. Requires a horse or similar hooved creature and all four shoes; owner must confirm this catalog representation. |
| Ring of Regeneration | Yes | [p. 238][p238] | Slow recovery and regrowth require the entry's HP conditions; does not revive a dead wearer. |
| Ring of Telekinesis | Yes | [p. 239][p239] | Casts Telekinesis. Do not omit relevant spell limitations such as Concentration when applicable. |
| Robe of Scintillating Colors | Yes | [p. 240][p240] | Recharging charges, visibility conditions, and the robe's control effects require the full entry. |
| Staff of Frost | Yes — a Druid, Sorcerer, Warlock, or Wizard | [p. 245][p245] | Exact class prerequisite. Recharges; preserve spell costs and last-charge destruction risk. |

## Uniform selection and economic consistency

Preserve the approved sequence: appearance → rarity → treatment → uniform selection
from that eligible pool. Common skips the treatment roll and selects a consumable.
For another rarity, do not merge its consumable and permanent candidates and draw
uniformly from the combined list; different pool sizes would replace the approved
40:60 split with a different probability.

For an item in a pool of size `N`, its per-hoard probability is
`P(appearance) × P(rarity | appearance) × P(treatment | rarity) / N`.
At CR 0–4, this proposal gives each Common item an 8% per-hoard chance
(`0.40×0.60×1/3`), each Uncommon consumable 1.28%
(`0.40×0.40×0.40/5`), and each Uncommon permanent item 1.20%
(`0.40×0.40×0.60/8`). The probabilities sum back to the approved pool/rarity rates.

Duplicate item names do not create extra rows or extra weight. Printed healing
variants are distinct candidates in different pools; descriptive variations,
different artwork, or repeated source mentions are not new entries. Draws across
generations remain independent with replacement. Do not remove earlier results,
promise an item each character can use, or substitute a stronger pool when one is
empty. An empty approved pool blocks implementation until reviewed.

The economy's nominal rarity/treatment base-value expectations remain applicable;
pool membership is not permission to change prices or approved currency formulas.
Actual record-level valuation still needs source exceptions, any underlying-item
costs (including staff/base-equipment questions), and the final approved reward
units. Do not present nominal item value as extra currency or guaranteed sale income.

## Explicit disposition of items not proposed

This is a curated list, not a claim to enumerate every eligible SRD item. **Every
otherwise eligible SRD entry omitted from the 40 rows is deferred for this initial
bounded-size/coverage proposal unless a more specific reason below applies.** This
is an explicit curation recommendation, not a conclusion that the omitted content
is unlicensed or a final exclusion from the product. Forty is the proposed list
size, not a newly approved hard application limit.

The following notable deferrals make the additional recommendations visible.
They require owner approval and are not added to the already approved exclusions.
Owner-approved replacements/additions must retain uniform selection and trigger
updated pool counts; the economic appearance/rarity/treatment probabilities stay fixed.

| Otherwise eligible SRD item/family | Source and classification finding | Proposed reason to defer from this first catalog |
| --- | --- | --- |
| Dust of Dryness; Deck of Illusions | Uncommon, [pp. 219][p219] and [217][p217]. Finite expendable pinches/cards make the container-level resource consumable, despite multiple uses. | Variable starting contents and the proper reward unit need a decision; do not silently award one pinch/card as though it were the complete official item. |
| Bag of Beans; Necklace of Fireballs | Rare, [pp. 211][p211] and [233][p233]. Finite contents are consumable resources. | Random quantities and detachable contents complicate one-reward representation and valuation; the bag also has large secondary effects. |
| Efreeti Bottle | Very Rare, [p. 220][p220]. Finite, outcome-dependent uses; a delay before reopening is not unlimited replenishment. Treat as a consumable resource if later admitted. | Random contents/effects, possible hostile outcome, and Wish access need explicit campaign and reward-unit review. |
| Marvelous Pigments | Very Rare, [p. 230][p230]. Finite pigment pots are consumable. | Variable pot count, terrain/object creation, and bounded material-value rules require extra state/economy review. Its creation is not unlimited wealth; preserve the printed limits if later admitted. |
| Oil of Sharpness | Very Rare Potion, [p. 233][p233]. The oil is consumable even though its benefit may endure. | This SRD entry turns eligible equipment into +3 equipment and states no duration. Do not import an older temporary-effect rule. It can affect ammunition, but the vial is not itself a magic-ammunition entry. Defer for lasting-upgrade and ammunition-interaction review rather than relabeling it permanent or altering its mechanics. |
| Potion of Poison; Potion of Longevity | Uncommon / Very Rare, [p. 236][p236]; consumables. | Deceptive harm and cumulative aging risk are not automatically the approved cursed-item exclusion. Recommend deferral of these trap/aging rewards for v0.1, as an additional product choice. |
| Ability-increasing manuals and tomes | Very Rare; e.g. Manual of Bodily Health, [p. 229][p229], and Tome of Clear Thought, [p. 249][p249]. Retained books recharge after a century. | **Review-sensitive:** literal rechargeable-item policy places them in permanent, but their practically single-use permanent ability increase can be mistaken for a consumable. Do not silently reclassify them. Recommend deferral pending explicit treatment/valuation and power review. |
| Amulet of the Planes; Helm of Teleportation | Very Rare / Rare, [pp. 209][p209] and [226][p226]; permanent. | Planar or long-distance transport changes campaign access more than the selected local-teleportation cape. Recommend separate campaign-impact review; this is not a blanket exclusion of mobility magic. |
| Equipment-backed and subtype families | Armor, +1, +2, or +3, [p. 210][p210]; Weapon, +1, +2, or +3, [p. 253][p253]; Potion of Resistance, [p. 236][p236]; Elemental Gem, [p. 220][p220]. Rarity/treatment must be verified per actual variant. | Need explicit base type/subtype and row-granularity decisions rather than a hidden extra random table. For example, +1 Armor is Rare while a +1 Weapon is Uncommon. Elemental Gem is a magic item, not automatically an ordinary-gem reward; its subtype/summoning state is the issue here. |
| Boots of Striding and Springing; Pearl of Power; Ring of Swimming | Uncommon permanent, [pp. 214][p214], [234][p234], [239][p239]. | Eligible alternatives deferred for the initial list-size/coverage choice, not a source or rarity problem. They can replace or supplement a reviewed pool after owner approval. |
| Cloak of Displacement; Wand of Fireballs | Rare permanent, [pp. 215][p215] and [250][p250]. | Eligible alternatives deferred to keep the first defense/casting set small and avoid adding another offensive burst option without review. |

For other unlisted eligible entries, the default size/coverage deferral above is
the stated reason, not an implicit ban. The owner may reject any proposed deferral
or request additional candidates. No excluded item is being silently substituted
with a different name, rarity, edition, or weaker rules text.

## Balance and pool-readiness concerns

- **Small pools and repeats:** Common has three options and Very Rare consumables
  four. Repeated outcomes are expected and permitted. Pool expansion changes each
  item's conditional `1/N`, not the approved aggregate rarity/treatment chance.
- **Persistent low-rarity power:** invisibility dust, defensive cloaks, storage,
  and a Web wand can substantially affect play. Source eligibility and rarity are
  not proof that every result is appropriate to a particular encounter or party.
- **Restrictions must remain visible:** class-limited staffs, spellcaster
  attunement, armor/Shield restrictions, mount-only equipment, and overlapping
  Darkvision can produce less useful rewards. Do not solve this with unapproved
  rerolls, party filters, extra items, or altered attunement conditions.
- **Attunement is not a complete power cap:** some selected items need none.
  Duplicates across generations and different compatible bonuses require later
  play review; the catalog does not promise equal distribution among characters.
- **Storage hazards:** Bag of Holding and Portable Hole retain potentially severe
  container interactions. These hazards are part of their official rules, not a
  claim that the items are cursed or automatic reasons to change the pool.
- **Recharge and persistent recovery:** Staff of Healing, Ring of Regeneration,
  and other replenishable items can reduce resource pressure. Preserve last-charge
  risks where printed; do not replace them with invented generic durability rules.
- **Representation-sensitive row:** the complete Horseshoes of a Zephyr set is
  counted as one proposed named reward. If the owner defers it, Very Rare permanent
  falls from six to five candidates and remains viable; revise uniform odds/counts
  explicitly instead of generating incomplete unusable sets.
- **No empty required pool:** the proposal supports all seven enabled pools. No
  uncertain classification is used to fill one. Common permanent remains disabled,
  not a missing pool or a reason to reopen the approved Common policy.

## Decisions requiring owner approval

1. Approve or revise the 40 candidate variants and the explicit size/coverage
   deferrals. Eligibility verification does not make these the final product list.
2. Approve, reject, or narrow the additional deferrals for finite multi-use units,
   lasting equipment upgrades, harmful/aging rewards, century-recharging books,
   global/planar travel, and unresolved subtype families. Classification-sensitive
   and state-sensitive cases must be resolved before any such entry is counted.
3. Confirm whole named pairs/sets as reward units, especially the four horseshoes;
   define any required initial state from the actual SRD entry, without additional
   invented contents, doses, equipment, or magic-item rewards.
4. Complete final catalog validation: exact names/variants, source and license
   metadata, conditions, valuation exceptions/base costs, and any spells or creature
   references needed to present the full item faithfully. These notes do not replace
   the underlying rules or expand SRD coverage.

Appearance/rarity/treatment probabilities, uniform within-pool selection, the
one-item cap, approved exclusions, and duplicate allowance are **not** reopened.
No TypeScript dataset or generator should be implemented from this proposal before
catalog review. No final decision is made here on the owner's behalf.

## Validation and scope

- Reviewed the latest-main economy and content audit, including the fixed Common
  policy, licensed content boundary, and separate catalog-validation prerequisite.
- Checked all candidate names/headings, rarity variants, attunement text, source
  pages, and classification evidence in the official SRD. In particular, Potion
  of Invisibility is Rare, and healing variants follow the p. 236 table.
- Reviewed candidate restrictions and curse eligibility, charge/recharge rules,
  complete reward units, and the deferral cases above. No selected row depends on
  an uncertain classification; review-sensitive cases remain outside the counts.
- Checked unique candidate counts, all seven nonempty required pools, uniform
  per-item probabilities, reference links, and the audit PDF hash. No Common
  permanent item, duplicate row, or excluded rarity/category is counted.
- Only `docs/magic-item-catalog-proposal.md` is added. No existing document, currency
  table, Dice Engine, UI, application code, dependencies, or executable catalog is
  changed. Runtime tests are not applicable to this research/design-only task.

## Attribution

> This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

Source metadata and restrictions are summarized and reorganized. Curation,
classification explanations, and proposed deferrals are project analysis, not
Wizards-authored treasure distributions or endorsement. Preserve the notices,
modification indications, and [CC BY 4.0][legal] rights described in the audit;
the SRD notice refers to the warranty disclaimer and liability limitation in
section 5. Original project-content licensing remains a separate owner decision.

[srd]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
[landing]: https://www.dndbeyond.com/srd
[legal]: https://creativecommons.org/licenses/by/4.0/legalcode
[p204]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=204
[p209]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=209
[p210]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=210
[p211]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=211
[p212]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=212
[p213]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=213
[p214]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=214
[p215]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=215
[p216]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=216
[p217]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=217
[p219]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=219
[p220]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=220
[p224]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=224
[p226]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=226
[p227]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=227
[p228]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=228
[p229]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=229
[p230]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=230
[p233]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=233
[p234]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=234
[p235]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=235
[p236]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=236
[p238]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=238
[p239]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=239
[p240]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=240
[p242]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=242
[p245]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=245
[p249]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=249
[p250]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=250
[p251]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=251
[p253]: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf#page=253
