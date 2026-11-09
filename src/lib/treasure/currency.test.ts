import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseDiceExpression } from '../dice';
import { CR_BANDS, CURRENCY_TABLES, validateCrBands, validateCurrencyTables, type CurrencyTable } from './currency';

const expected = [
  [['empty'], ['2d6', 1, 'SP'], ['2d6', 1, 'GP'], ['2d6+2', 2, 'GP']],
  [['empty'], ['2d6', 1, 'GP'], ['2d6', 10, 'GP'], ['2d6+2', 20, 'GP']],
  [['empty'], ['2d6', 5, 'GP'], ['2d6', 5, 'PP'], ['2d6+2', 10, 'PP']],
  [['empty'], ['2d6', 25, 'GP'], ['2d6', 25, 'PP'], ['2d6+2', 50, 'PP']],
  [['2d6+4', 10, 'GP'], ['4d6+6', 15, 'GP'], ['4d6+10', 20, 'GP']],
  [['2d6+4', 5, 'PP'], ['4d6+6', 75, 'GP'], ['4d6+10', 10, 'PP']],
  [['2d6+4', 20, 'PP'], ['4d6+6', 30, 'PP'], ['4d6+10', 40, 'PP']],
  [['2d6+4', 60, 'PP'], ['4d6+6', 90, 'PP'], ['4d6+10', 120, 'PP']],
] as const;

function copy(): CurrencyTable[] {
  return structuredClone(CURRENCY_TABLES) as CurrencyTable[];
}
function invalid(change: (tables: CurrencyTable[]) => void, pattern: RegExp): void {
  const tables = copy();
  change(tables);
  assert.throws(() => validateCurrencyTables(tables), pattern);
}
function setRow(tables: CurrencyTable[], ti: number, ri: number, changes: object): void {
  const table = tables[ti];
  (table.rows as unknown as object[])[ri] = { ...table.rows[ri], ...changes };
}

test('all eight approved tables, kinds, CR bands and exact percentile boundaries', () => {
  assert.equal(CURRENCY_TABLES.length, 8);
  assert.deepEqual(CR_BANDS.map(({ min, max }) => [min, max]), [[0, 4], [5, 10], [11, 16], [17, null]]);
  for (const [i, table] of CURRENCY_TABLES.entries()) {
    assert.equal(table.type, i < 4 ? 'individual' : 'hoard');
    assert.equal(table.crBand, CR_BANDS[i % 4].id);
    assert.deepEqual(table.rows.map((row) => [row.min, row.max]),
      i < 4 ? [[1, 30], [31, 70], [71, 95], [96, 100]] : [[1, 25], [26, 85], [86, 100]]);
    assert.deepEqual(table.rows.map((row) => row.reward.kind === 'empty'
      ? ['empty']
      : [row.reward.amount.dice, row.reward.amount.multiplier, row.reward.amount.denomination]), expected[i]);
    for (let percentile = 1; percentile <= 100; percentile++) {
      assert.equal(table.rows.filter((row) => row.min <= percentile && percentile <= row.max).length, 1);
    }
  }
  assert.doesNotThrow(() => validateCurrencyTables(CURRENCY_TABLES));
});

test('approved expected GP values use dice mean, then multiplier, then denomination conversion', () => {
  const gpPerCoin: Record<string, number> = { CP: 0.01, SP: 0.1, EP: 0.5, GP: 1, PP: 10 };
  const actual = CURRENCY_TABLES.map((table) => table.rows.reduce((sum, row) => {
    if (row.reward.kind === 'empty') return sum;
    const { dice, multiplier, denomination } = row.reward.amount;
    const parsed = parseDiceExpression(dice);
    const diceMean = parsed.count * (parsed.sides + 1) / 2 + parsed.modifier;
    return sum + (row.max - row.min + 1) / 100 * diceMean * multiplier * gpPerCoin[denomination];
  }, 0));
  const approved = [2.93, 29.30, 146.50, 732.50, 279.50, 1397.50, 5590, 16770];
  actual.forEach((value, i) => assert.ok(Math.abs(value - approved[i]) < 1e-8, `table ${i}: ${value}`));
  const first = CURRENCY_TABLES[0].rows[1].reward;
  assert.equal(first.kind, 'currency');
  if (first.kind === 'currency') {
    assert.equal(first.amount.denomination, 'SP');
    assert.equal(first.amount.multiplier, 1);
  }
});

test('invalid percentile overlaps, gaps and incomplete coverage fail', () => {
  invalid((t) => setRow(t, 0, 1, { min: 30 }), /percentile/);
  invalid((t) => setRow(t, 0, 1, { min: 32 }), /percentile/);
  invalid((t) => setRow(t, 0, 3, { max: 99 }), /coverage/);
  invalid((t) => setRow(t, 0, 0, { min: 0 }), /percentile/);
  invalid((t) => setRow(t, 0, 0, { max: 101 }), /percentile/);
});

test('rejects missing and duplicated IDs, kinds, bands and rows', () => {
  invalid((t) => { (t[1] as { id: string }).id = t[0].id; }, /duplicate ID/);
  invalid((t) => setRow(t, 0, 1, { id: t[0].rows[0].id }), /duplicate ID/);
  invalid((t) => { (t[0] as { type: string }).type = 'unknown'; }, /treasure type/);
  invalid((t) => { (t[0] as { crBand: string }).crBand = 'cr-unknown'; }, /CR band/);
  invalid((t) => { (t[1] as { crBand: string }).crBand = 'cr-0-4'; }, /duplicate treasure type/);
  invalid((t) => { t.pop(); }, /eight/);
  invalid((t) => { (t[0].rows as unknown as object[]).pop(); }, /row count/);
  assert.throws(() => validateCrBands([{ id: 'cr-0-4', min: 0, max: 5 }]), /CR bands/);
  assert.throws(() => validateCrBands([
    { id: 'cr-0-4', min: 0, max: 4 }, { id: 'cr-5-10', min: 4, max: 10 },
    { id: 'cr-11-16', min: 11, max: 16 }, { id: 'cr-17-plus', min: 17, max: null },
  ]), /CR band/);
});

test('rejects invalid denominations, dice and multipliers', () => {
  const mutate = (key: string, value: unknown) => invalid((tables) => {
    const row = tables[0].rows[1];
    if (row.reward.kind !== 'currency') throw new Error('test setup');
    setRow(tables, 0, 1, { reward: { kind: 'currency', amount: { ...row.reward.amount, [key]: value } } });
  }, /invalid/);
  mutate('denomination', 'XP');
  mutate('multiplier', 0);
  mutate('multiplier', -1);
  mutate('multiplier', 1.5);
  mutate('multiplier', Number.MAX_SAFE_INTEGER + 1);
  mutate('dice', '2d6*10');
  mutate('dice', '0d6');
  mutate('dice', '1d9007199254740992');
  mutate('dice', '2d6-10');
  mutate('multiplier', Number.MAX_SAFE_INTEGER);
  invalid((t) => setRow(t, 0, 0, { reward: null }), /empty reward/);
});

test('all nested approved data are immutable', () => {
  assert.ok(Object.isFrozen(CURRENCY_TABLES));
  for (const table of CURRENCY_TABLES) {
    assert.ok(Object.isFrozen(table));
    assert.ok(Object.isFrozen(table.rows));
    for (const row of table.rows) {
      assert.ok(Object.isFrozen(row));
      assert.ok(Object.isFrozen(row.reward));
      if (row.reward.kind === 'currency') assert.ok(Object.isFrozen(row.reward.amount));
    }
  }
  assert.throws(() => { (CURRENCY_TABLES[0].rows[0] as { min: number }).min = 99; }, TypeError);
});
