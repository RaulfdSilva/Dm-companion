import { rollDice, type DiceRoll, type RandomNumberGenerator } from '../dice';
import {
  CR_BANDS, CURRENCY_TABLES, type CrBandId, type CurrencyDenomination, type TreasureType,
} from './currency';
import {
  MAGIC_ITEM_CATALOG, validateMagicItemCatalog, type MagicItem, type MagicItemRarity,
  type MagicItemTreatment,
} from './magic-items';

export type GeneratedCurrency = {
  readonly tableId: string;
  readonly rowId: string;
  readonly selectionRoll: DiceRoll;
} & (
  | { readonly kind: 'empty' }
  | {
    readonly kind: 'currency';
    readonly denomination: CurrencyDenomination;
    readonly quantity: number;
    readonly amountRoll: DiceRoll;
    readonly multiplier: number;
  }
);

export type GeneratedMagic =
  | { readonly kind: 'none'; readonly appearanceRoll: DiceRoll }
  | {
    readonly kind: 'item';
    readonly item: MagicItem;
    readonly appearanceRoll: DiceRoll;
    readonly rarityRoll: DiceRoll;
    /** Common bypasses the treatment roll. */
    readonly treatmentRoll: DiceRoll | null;
    /** One-based position within the matching pool, in catalog order. */
    readonly selectionRoll: DiceRoll;
  };

export type TreasureResult = {
  readonly crBand: CrBandId;
  readonly currency: GeneratedCurrency;
} & (
  | { readonly type: 'individual'; readonly magic: null }
  | { readonly type: 'hoard'; readonly magic: GeneratedMagic }
);

/** Approved percentile ranges, docs/treasure-economy-design.md.
 * Zero-probability rarities have no interval and are never rerolled into. */
const magicRules = {
  'cr-0-4': { appearanceMin: 61, rarities: [['common', 60], ['uncommon', 100]] },
  'cr-5-10': { appearanceMin: 41, rarities: [['common', 20], ['uncommon', 90], ['rare', 100]] },
  'cr-11-16': { appearanceMin: 26, rarities: [['common', 10], ['uncommon', 55], ['rare', 97], ['very-rare', 100]] },
  'cr-17-plus': { appearanceMin: 16, rarities: [['uncommon', 25], ['rare', 85], ['very-rare', 100]] },
} as const satisfies Record<CrBandId, {
  readonly appearanceMin: number;
  readonly rarities: readonly (readonly [MagicItemRarity, number])[];
}>;

function generateCurrency(type: TreasureType, crBand: CrBandId, random: RandomNumberGenerator): GeneratedCurrency {
  const table = CURRENCY_TABLES.find((candidate) => candidate.type === type && candidate.crBand === crBand);
  if (!table) throw new Error(`Missing currency table for ${type} ${crBand}`);
  const selectionRoll = rollDice('1d100', random);
  const row = table.rows.find((candidate) => candidate.min <= selectionRoll.total && candidate.max >= selectionRoll.total);
  if (!row) throw new Error(`No currency row for ${table.id}, roll ${selectionRoll.total}`);
  const trace = { tableId: table.id, rowId: row.id, selectionRoll };
  if (row.reward.kind === 'empty') return { ...trace, kind: 'empty' };
  const { dice, multiplier, denomination } = row.reward.amount;
  const amountRoll = rollDice(dice, random);
  return { ...trace, kind: 'currency', denomination, quantity: amountRoll.total * multiplier, amountRoll, multiplier };
}

function generateMagic(crBand: CrBandId, random: RandomNumberGenerator): GeneratedMagic {
  const rules = magicRules[crBand];
  const appearanceRoll = rollDice('1d100', random);
  if (appearanceRoll.total < rules.appearanceMin) return { kind: 'none', appearanceRoll };
  const rarityRoll = rollDice('1d100', random);
  const range = rules.rarities.find(([, max]) => rarityRoll.total <= max);
  if (!range) throw new Error(`No magic rarity for ${crBand}, roll ${rarityRoll.total}`);
  const [rarity] = range;
  const treatmentRoll = rarity === 'common' ? null : rollDice('1d100', random);
  const treatment: MagicItemTreatment = treatmentRoll === null || treatmentRoll.total <= 40 ? 'consumable' : 'permanent';
  const pool = MAGIC_ITEM_CATALOG.filter((item) => item.rarity === rarity && item.treatment === treatment);
  if (pool.length === 0) throw new Error(`Empty eligible magic-item pool: ${rarity}/${treatment}`);
  // A pool-sized die gives equal-width intervals over [0, 1), without modulo
  // or mapping a d100 onto a pool whose size may not divide 100.
  const selectionRoll = rollDice(`1d${pool.length}`, random);
  const item = pool[selectionRoll.total - 1];
  if (!item) throw new Error(`Invalid magic-item selection in ${rarity}/${treatment}`);
  return { kind: 'item', item, appearanceRoll, rarityRoll, treatmentRoll, selectionRoll };
}

/** Generate one purse or party-wide hoard using independent RNG samples.
 * Call order: currency selector → amount dice → hoard appearance → rarity →
 * non-Common treatment → item selection. Skipped branches consume no samples.
 * Catalog metadata is immutable; equipment base types remain unspecified. */
export function generateTreasure(
  type: TreasureType,
  crBand: CrBandId,
  random: RandomNumberGenerator = Math.random,
): TreasureResult {
  if (type !== 'individual' && type !== 'hoard') throw new TypeError('Treasure type must be individual or hoard');
  if (!CR_BANDS.some((band) => band.id === crBand)) throw new RangeError('Invalid CR band; use one of the four CR_BANDS IDs');
  if (typeof random !== 'function') throw new TypeError('Random number generator must be a function');
  // Validate before any hoard draws; invalid/missing pool data must fail rather
  // than silently changing the approved rarity or treatment distributions.
  if (type === 'hoard') validateMagicItemCatalog(MAGIC_ITEM_CATALOG);
  const currency = generateCurrency(type, crBand, random);
  if (type === 'individual') return { type, crBand, currency, magic: null };
  return { type, crBand, currency, magic: generateMagic(crBand, random) };
}
