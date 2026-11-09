import { parseDiceExpression } from '../dice';

export const CR_BANDS = [
  { id: 'cr-0-4', min: 0, max: 4 },
  { id: 'cr-5-10', min: 5, max: 10 },
  { id: 'cr-11-16', min: 11, max: 16 },
  { id: 'cr-17-plus', min: 17, max: null },
] as const;

export type CrBandId = (typeof CR_BANDS)[number]['id'];
export type TreasureType = 'individual' | 'hoard';
export type CurrencyDenomination = 'CP' | 'SP' | 'EP' | 'GP' | 'PP';

export interface CurrencyAmount {
  readonly denomination: CurrencyDenomination;
  readonly dice: string;
  readonly multiplier: number;
}

export type CurrencyReward =
  | { readonly kind: 'empty' }
  | { readonly kind: 'currency'; readonly amount: CurrencyAmount };

export interface CurrencyRow {
  readonly id: string;
  readonly min: number;
  readonly max: number;
  readonly reward: CurrencyReward;
}

export interface CurrencyTable {
  readonly id: string;
  readonly type: TreasureType;
  readonly crBand: CrBandId;
  readonly rows: readonly CurrencyRow[];
}

const denominations: readonly string[] = ['CP', 'SP', 'EP', 'GP', 'PP'];

function fail(message: string): never {
  throw new Error(`Invalid currency treasure data: ${message}`);
}

export function validateCrBands(bands: readonly { readonly id: string; readonly min: number; readonly max: number | null }[]): void {
  if (bands.length !== 4) fail('expected exactly four CR bands');
  const ids = new Set<string>();
  for (let i = 0; i < bands.length; i++) {
    const band = bands[i];
    const approved = CR_BANDS[i];
    if (!band || !approved || band.id !== approved.id || band.min !== approved.min || band.max !== approved.max) {
      fail(`CR band ${i} does not match the approved non-overlapping CR coverage`);
    }
    if (ids.has(band.id)) fail(`duplicate CR band ID ${band.id}`);
    ids.add(band.id);
  }
}

export function validateCurrencyTables(tables: readonly CurrencyTable[]): void {
  validateCrBands(CR_BANDS);
  if (tables.length !== 8) fail('expected exactly eight currency tables');
  const ids = new Set<string>();
  const combinations = new Set<string>();
  for (const table of tables) {
    if (!table || typeof table.id !== 'string' || !table.id) fail('table ID is required');
    if (ids.has(table.id)) fail(`duplicate ID ${table.id}`);
    ids.add(table.id);
    if (table.type !== 'individual' && table.type !== 'hoard') fail(`invalid treasure type in ${table.id}`);
    if (!CR_BANDS.some((band) => band.id === table.crBand)) fail(`invalid CR band in ${table.id}`);
    const key = `${table.type}:${table.crBand}`;
    if (combinations.has(key)) fail(`duplicate treasure type/CR band ${key}`);
    combinations.add(key);
    if (table.rows.length !== (table.type === 'individual' ? 4 : 3)) {
      fail(`unexpected row count in ${table.id}`);
    }
    let next = 1;
    for (const row of table.rows) {
      if (!row || typeof row.id !== 'string' || !row.id) fail(`row ID missing in ${table.id}`);
      if (ids.has(row.id)) fail(`duplicate ID ${row.id}`);
      ids.add(row.id);
      if (!Number.isSafeInteger(row.min) || !Number.isSafeInteger(row.max) ||
          row.min !== next || row.max < row.min || row.max > 100) {
        fail(`percentile gap, overlap or invalid boundary at ${row.id}; expected ${next}`);
      }
      next = row.max + 1;
      if (!row.reward || (row.reward.kind !== 'empty' && row.reward.kind !== 'currency')) {
        fail(`invalid or implicit empty reward at ${row.id}`);
      }
      if (row.reward.kind === 'currency') {
        const { denomination, dice, multiplier } = row.reward.amount;
        if (!denominations.includes(denomination)) fail(`invalid denomination at ${row.id}`);
        if (!Number.isSafeInteger(multiplier) || multiplier <= 0) fail(`invalid multiplier at ${row.id}`);
        try {
          const parsed = parseDiceExpression(dice);
          const low = parsed.count + parsed.modifier;
          const high = parsed.count * parsed.sides + parsed.modifier;
          if (low < 0 || !Number.isSafeInteger(low * multiplier) || !Number.isSafeInteger(high * multiplier)) {
            fail(`unsafe or negative currency quantity at ${row.id}`);
          }
        } catch (error) {
          fail(`invalid dice expression or quantity at ${row.id}: ${String(error)}`);
        }
      }
    }
    if (next !== 101) fail(`missing percentile coverage in ${table.id}: expected 1–100`);
  }
  for (const type of ['individual', 'hoard'] as const) {
    for (const band of CR_BANDS) {
      if (!combinations.has(`${type}:${band.id}`)) fail(`missing table for ${type} ${band.id}`);
    }
  }
}

const empty = (): CurrencyReward => Object.freeze({ kind: 'empty' as const });
const coins = (dice: string, multiplier: number, denomination: CurrencyDenomination): CurrencyReward =>
  Object.freeze({ kind: 'currency' as const, amount: Object.freeze({ dice, multiplier, denomination }) });

function table(type: TreasureType, crBand: CrBandId, values: readonly (CurrencyReward)[]): CurrencyTable {
  const ranges = type === 'individual' ? [[1, 30], [31, 70], [71, 95], [96, 100]] : [[1, 25], [26, 85], [86, 100]];
  const id = `${type}-${crBand}`;
  return Object.freeze({
    id, type, crBand,
    rows: Object.freeze(ranges.map(([min, max], index) => Object.freeze({
      id: `${id}-${index + 1}`, min, max, reward: values[index],
    }))),
  });
}

/** Original approved project distributions, docs/treasure-economy-design.md (2026-11-08).
 * Hoards are party-wide; no magic items or rolling occurs in this module. */
export const CURRENCY_TABLES: readonly CurrencyTable[] = Object.freeze([
  table('individual', 'cr-0-4', [empty(), coins('2d6', 1, 'SP'), coins('2d6', 1, 'GP'), coins('2d6+2', 2, 'GP')]),
  table('individual', 'cr-5-10', [empty(), coins('2d6', 1, 'GP'), coins('2d6', 10, 'GP'), coins('2d6+2', 20, 'GP')]),
  table('individual', 'cr-11-16', [empty(), coins('2d6', 5, 'GP'), coins('2d6', 5, 'PP'), coins('2d6+2', 10, 'PP')]),
  table('individual', 'cr-17-plus', [empty(), coins('2d6', 25, 'GP'), coins('2d6', 25, 'PP'), coins('2d6+2', 50, 'PP')]),
  table('hoard', 'cr-0-4', [coins('2d6+4', 10, 'GP'), coins('4d6+6', 15, 'GP'), coins('4d6+10', 20, 'GP')]),
  table('hoard', 'cr-5-10', [coins('2d6+4', 5, 'PP'), coins('4d6+6', 75, 'GP'), coins('4d6+10', 10, 'PP')]),
  table('hoard', 'cr-11-16', [coins('2d6+4', 20, 'PP'), coins('4d6+6', 30, 'PP'), coins('4d6+10', 40, 'PP')]),
  table('hoard', 'cr-17-plus', [coins('2d6+4', 60, 'PP'), coins('4d6+6', 90, 'PP'), coins('4d6+10', 120, 'PP')]),
]);
validateCurrencyTables(CURRENCY_TABLES);
