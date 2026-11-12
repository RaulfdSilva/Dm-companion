import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';

import type { RandomNumberGenerator } from '../dice';
import { CURRENCY_TABLES, type CrBandId, type TreasureType } from './currency';
import { generateTreasure, type GeneratedMagic, type TreasureResult } from './generate';
import { MAGIC_ITEM_CATALOG } from './magic-items';

const percentile = (face: number): number => (face - 0.5) / 100;

function sequence(samples: readonly unknown[]) {
  let calls = 0;
  const random: RandomNumberGenerator = () => {
    assert.ok(calls < samples.length, `unexpected RNG call ${calls + 1}`);
    return samples[calls++] as number;
  };
  return { random, calls: () => calls, done: () => assert.equal(calls, samples.length, 'unused RNG samples') };
}

function run(type: TreasureType, band: CrBandId, samples: readonly number[]): TreasureResult {
  const rng = sequence(samples);
  const result = generateTreasure(type, band, rng.random);
  rng.done();
  assert.equal(result.type, type);
  assert.equal(result.crBand, band);
  return result;
}

function found(result: TreasureResult): Extract<GeneratedMagic, { kind: 'item' }> {
  assert.ok(result.type === 'hoard' && result.magic.kind === 'item', 'expected one hoard magic item');
  return result.magic;
}

// Independent expectations from the approved specification. Quantities below
// use minimum dice faces and preserve the original denomination (no conversion).
const bands = [
  { id: 'cr-0-4', appearanceMin: 61,
    rarities: [['common', 1, 60], ['uncommon', 61, 100]],
    individual: [['SP', 2], ['GP', 2], ['GP', 8]],
    hoard: [['GP', 60], ['GP', 150], ['GP', 280]] },
  { id: 'cr-5-10', appearanceMin: 41,
    rarities: [['common', 1, 20], ['uncommon', 21, 90], ['rare', 91, 100]],
    individual: [['GP', 2], ['GP', 20], ['GP', 80]],
    hoard: [['PP', 30], ['GP', 750], ['PP', 140]] },
  { id: 'cr-11-16', appearanceMin: 26,
    rarities: [['common', 1, 10], ['uncommon', 11, 55], ['rare', 56, 97], ['very-rare', 98, 100]],
    individual: [['GP', 10], ['PP', 10], ['PP', 40]],
    hoard: [['PP', 120], ['PP', 300], ['PP', 560]] },
  { id: 'cr-17-plus', appearanceMin: 16,
    rarities: [['uncommon', 1, 25], ['rare', 26, 85], ['very-rare', 86, 100]],
    individual: [['GP', 50], ['PP', 50], ['PP', 200]],
    hoard: [['PP', 360], ['PP', 900], ['PP', 1680]] },
] as const;

// Currency is a lean hoard with two minimum amount dice, then independent magic.
const lean = [percentile(1), 0, 0];

for (const band of bands) {
  test(`all 100 individual currency percentiles and skipped branches, ${band.id}`, () => {
    for (let face = 1; face <= 100; face++) {
      const row = face <= 30 ? 0 : face <= 70 ? 1 : face <= 95 ? 2 : 3;
      const result = run('individual', band.id, [percentile(face), ...(row === 0 ? [] : [0, 0])]);
      const currency = result.currency;
      assert.equal(currency.tableId, `individual-${band.id}`);
      assert.equal(currency.rowId, `individual-${band.id}-${row + 1}`);
      assert.equal(currency.selectionRoll.total, face);
      assert.equal(currency.selectionRoll.sides, 100);
      assert.equal(result.magic, null);
      if (row === 0) {
        assert.equal(currency.kind, 'empty');
        assert.equal(Object.hasOwn(currency, 'amountRoll'), false);
      } else {
        assert.ok(currency.kind === 'currency');
        assert.deepEqual([currency.denomination, currency.quantity], band.individual[row - 1]);
        assert.deepEqual(currency.amountRoll.rolls, [1, 1]);
        assert.ok(Number.isSafeInteger(currency.quantity) && currency.quantity > 0);
      }
    }
  });

  test(`all 100 hoard currency percentiles remain party-wide and positive, ${band.id}`, () => {
    for (let face = 1; face <= 100; face++) {
      const row = face <= 25 ? 0 : face <= 85 ? 1 : 2;
      const dice = row === 0 ? 2 : 4;
      const result = run('hoard', band.id, [percentile(face), ...new Array(dice).fill(0), percentile(1)]);
      const currency = result.currency;
      assert.equal(currency.rowId, `hoard-${band.id}-${row + 1}`);
      assert.equal(currency.tableId, `hoard-${band.id}`);
      assert.equal(currency.selectionRoll.total, face);
      assert.ok(currency.kind === 'currency');
      assert.deepEqual([currency.denomination, currency.quantity], band.hoard[row]);
      assert.equal(currency.amountRoll.rolls.length, dice);
      assert.ok(Number.isSafeInteger(currency.quantity) && currency.quantity > 0);
      assert.ok(result.type === 'hoard' && result.magic.kind === 'none');
      assert.equal(result.magic.appearanceRoll.total, 1);
      assert.equal(Object.hasOwn(result.magic, 'rarityRoll'), false);
    }
  });

  test(`appearance failure/success endpoints match approved ranges, ${band.id}`, () => {
    for (const face of [1, band.appearanceMin - 1, band.appearanceMin, 100]) {
      const success = face >= band.appearanceMin;
      const firstRarity = band.rarities[0][0];
      const result = run('hoard', band.id, [...lean, percentile(face),
        ...(success ? [percentile(1), ...(firstRarity === 'common' ? [] : [percentile(1)]), 0] : [])]);
      assert.ok(result.type === 'hoard');
      assert.equal(result.magic.kind, success ? 'item' : 'none');
      assert.equal(result.magic.appearanceRoll.total, face);
      if (success) assert.equal(found(result).item.rarity, firstRarity);
    }
  });

  test(`every conditional rarity percentile and zero-probability exclusion, ${band.id}`, () => {
    for (let face = 1; face <= 100; face++) {
      const expected = band.rarities.find(([, min, max]) => face >= min && face <= max);
      assert.ok(expected);
      const [rarity] = expected;
      const result = run('hoard', band.id, [...lean, percentile(100), percentile(face),
        ...(rarity === 'common' ? [] : [percentile(41)]), 0]);
      const magic = found(result);
      assert.equal(magic.item.rarity, rarity);
      assert.equal(magic.rarityRoll.total, face);
      assert.equal(magic.item.treatment, rarity === 'common' ? 'consumable' : 'permanent');
      if (rarity === 'common') assert.equal(magic.treatmentRoll, null);
      else assert.equal(magic.treatmentRoll?.total, 41);
    }
  });

  for (const [rarity, rarityFace] of band.rarities) {
    if (rarity === 'common') continue;
    test(`treatment boundaries for ${rarity} at ${band.id}`, () => {
      for (const face of [1, 40, 41, 100]) {
        const result = run('hoard', band.id, [...lean, percentile(100), percentile(rarityFace), percentile(face), 0]);
        const magic = found(result);
        assert.equal(magic.item.rarity, rarity);
        assert.equal(magic.item.treatment, face <= 40 ? 'consumable' : 'permanent');
        assert.equal(magic.treatmentRoll?.total, face);
      }
    });
  }
}

test('each amount expression is rolled once, then its entire total including modifier is multiplied', () => {
  for (const table of CURRENCY_TABLES) {
    for (const row of table.rows) {
      if (row.reward.kind !== 'currency') continue;
      const { dice, multiplier, denomination } = row.reward.amount;
      // Independent expected faces: alternate minimum and maximum, not a fixed mean.
      const fourDice = dice.startsWith('4');
      const samples = fourDice ? [0, 1 - Number.EPSILON, 0, 1 - Number.EPSILON] : [0, 1 - Number.EPSILON];
      const expectedFaces = fourDice ? [1, 6, 1, 6] : [1, 6];
      const modifier = table.type === 'individual' ? (row.min === 96 ? 2 : 0) : row.min === 1 ? 4 : row.min === 26 ? 6 : 10;
      const result = run(table.type, table.crBand, [percentile(row.min), ...samples,
        ...(table.type === 'hoard' ? [percentile(1)] : [])]);
      const currency = result.currency;
      assert.ok(currency.kind === 'currency');
      assert.deepEqual(currency.amountRoll.rolls, expectedFaces);
      assert.equal(currency.amountRoll.modifier, modifier);
      assert.equal(currency.amountRoll.total, expectedFaces.reduce((a, b) => a + b, 0) + modifier);
      assert.equal(currency.multiplier, multiplier);
      assert.equal(currency.denomination, denomination);
      assert.equal(currency.quantity, currency.amountRoll.total * multiplier);
    }
  }
});

const pools = [
  ['common', 'consumable', 1, null, 3],
  ['uncommon', 'consumable', 11, 40, 5],
  ['uncommon', 'permanent', 11, 41, 9],
  ['rare', 'consumable', 56, 40, 6],
  ['rare', 'permanent', 56, 41, 10],
  ['very-rare', 'consumable', 98, 40, 4],
  ['very-rare', 'permanent', 98, 41, 8],
] as const;

for (const [rarity, treatment, rarityFace, treatmentFace, size] of pools) {
  test(`uniform selection intervals cover every ${rarity}/${treatment} item without extra rolls`, () => {
    const pool = MAGIC_ITEM_CATALOG.filter((item) => item.rarity === rarity && item.treatment === treatment);
    assert.equal(pool.length, size);
    const selected = new Set<string>();
    for (let index = 0; index < size; index++) {
      // Both ends of each equal-width interval, plus the exact RNG endpoints.
      const low = index === 0 ? 0 : index / size + Number.EPSILON;
      const high = index === size - 1 ? 1 - Number.EPSILON / 2 : (index + 1) / size - Number.EPSILON;
      for (const sample of [low, high]) {
        const result = run('hoard', 'cr-11-16', [...lean, percentile(100), percentile(rarityFace),
          ...(treatmentFace === null ? [] : [percentile(treatmentFace)]), sample]);
        const magic = found(result);
        assert.equal(magic.selectionRoll.count, 1);
        assert.equal(magic.selectionRoll.sides, size, 'selection must use the pool size, not d100/modulo');
        assert.equal(magic.selectionRoll.total, index + 1);
        assert.equal(magic.item, pool[index]);
        selected.add(magic.item.id);
        assert.equal(magic.item.cursed, false);
        assert.doesNotMatch(magic.item.name, /Spell Scroll|Ammunition|Armor, \+3|Horseshoes/);
        assert.ok(['common', 'uncommon', 'rare', 'very-rare'].includes(magic.item.rarity));
        assert.equal(Object.hasOwn(magic, 'items'), false, 'one catalog reward per hoard');
        if (magic.item.equipment !== null) {
          assert.equal(magic.item.equipment.baseType, null);
          assert.equal(magic.item.equipment.mode, 'manual');
        }
      }
    }
    assert.equal(selected.size, size);
  });
}

test('currency and magic rolls are independent, with all relevant trace metadata preserved', () => {
  for (const currencyFace of [1, 25, 26, 85, 86, 100]) {
    const currencySamples = [percentile(currencyFace), ...new Array(currencyFace <= 25 ? 2 : 4).fill(0)];
    const result = run('hoard', 'cr-11-16', [...currencySamples, percentile(26), percentile(11), percentile(41), 1 - Number.EPSILON]);
    const magic = found(result);
    assert.equal(magic.item.id, 'weapon-plus-1');
    assert.equal(magic.appearanceRoll.total, 26);
    assert.equal(magic.rarityRoll.total, 11);
    assert.equal(magic.treatmentRoll?.total, 41);
    assert.equal(magic.selectionRoll.total, 9);
    assert.equal(magic.item.name, 'Weapon, +1');
    assert.equal(magic.item.variant, '+1');
    assert.equal(magic.item.source.page, 253);
    assert.deepEqual(magic.item.attunement, { kind: 'none' });
    assert.deepEqual(magic.item.equipment, { kind: 'weapon', bonus: 1, mode: 'manual', baseType: null });
  }
});

test('fixed RNG sequences reproduce complete results; independent generations permit duplicates', () => {
  const samples = [...lean, percentile(100), percentile(98), percentile(41), 1 - Number.EPSILON];
  const first = run('hoard', 'cr-11-16', samples);
  assert.deepEqual(first, run('hoard', 'cr-11-16', samples));
  const rng = sequence([...samples, ...samples]);
  const second = generateTreasure('hoard', 'cr-11-16', rng.random);
  const third = generateTreasure('hoard', 'cr-11-16', rng.random);
  rng.done();
  assert.deepEqual(first, second);
  assert.deepEqual(second, third);
  assert.equal(found(second).item.id, 'weapon-plus-3');
  assert.equal(found(third).item.id, 'weapon-plus-3');
});

test('invalid treasure types, CR bands, and non-callable RNGs fail before consuming samples', () => {
  const rng = sequence([]);
  for (const type of [undefined, null, '', 'party', 'Individual', 1, [], {}]) {
    assert.throws(() => generateTreasure(type as TreasureType, 'cr-0-4', rng.random), /Treasure type/);
  }
  for (const band of [undefined, null, '', '0-4', 'cr-0-5', 0, [], {}]) {
    assert.throws(() => generateTreasure('individual', band as CrBandId, rng.random), /Invalid CR band/);
  }
  for (const random of [null, false, 1, 'random', [], {}]) {
    assert.throws(() => generateTreasure('individual', 'cr-0-4', random as RandomNumberGenerator), /must be a function/);
  }
  rng.done();
});

test('invalid RNG samples at every active stage are rejected without retries', () => {
  const prefixes = [
    [], // currency selector
    [percentile(1)], // first amount die
    [percentile(1), 0], // second amount die
    [...lean], // appearance
    [...lean, percentile(100)], // rarity
    [...lean, percentile(100), percentile(11)], // non-Common treatment
    [...lean, percentile(100), percentile(11), percentile(41)], // permanent item
    [...lean, percentile(100), percentile(1)], // Common item; no treatment
  ];
  for (const prefix of prefixes) {
    for (const bad of [-1, -Number.EPSILON, 1, 2, NaN, Infinity, -Infinity, undefined, null, true, '0.5', {}, []]) {
      const rng = sequence([...prefix, bad]);
      assert.throws(() => generateTreasure('hoard', 'cr-11-16', rng.random), RangeError);
      rng.done();
    }
  }
  const throwing: RandomNumberGenerator = () => { throw new Error('RNG unavailable'); };
  assert.throws(() => generateTreasure('individual', 'cr-0-4', throwing), /RNG unavailable/);
});

test('default RNG is Math.random and empty individual treasure consumes just one sample', (context) => {
  const mock = context.mock.method(Math, 'random', () => 0);
  const result = generateTreasure('individual', 'cr-0-4');
  assert.equal(result.currency.kind, 'empty');
  assert.equal(result.magic, null);
  assert.equal(mock.mock.callCount(), 1);
});

test('valid RNG endpoints are accepted for all stages, including item selection', () => {
  for (const sample of [0, 1 - Number.EPSILON / 2]) {
    const result = generateTreasure('hoard', 'cr-17-plus', () => sample);
    assert.ok(result.type === 'hoard' && result.currency.kind === 'currency');
    assert.ok(Number.isSafeInteger(result.currency.quantity) && result.currency.quantity > 0);
    if (sample === 0) assert.equal(result.magic.kind, 'none');
    else {
      const magic = found(result);
      assert.equal(magic.item.id, 'weapon-plus-3');
      assert.equal(magic.item.equipment?.baseType, null);
    }
  }
});

test('invalid catalog or an emptied required pool fails before hoard rolls, without substitution', () => {
  // Reload a private CommonJS instance with a shadow dependency, restoring the
  // cache in finally. No production hooks, frozen-data mutation, or child process.
  const require = createRequire(resolve('package.json'));
  const catalogPath = require.resolve('./src/lib/treasure/magic-items.ts');
  const enginePath = require.resolve('./src/lib/treasure/generate.ts');
  const catalogModule = require.cache[catalogPath];
  const engineModule = require.cache[enginePath];
  assert.ok(catalogModule && engineModule);
  const original = catalogModule.exports;
  const dependency = { ...original };
  try {
    catalogModule.exports = dependency;
    delete require.cache[enginePath];
    const { generateTreasure: withDependency } = require(enginePath) as typeof import('./generate');
    const invalid = structuredClone(MAGIC_ITEM_CATALOG) as unknown as Record<string, unknown>[];
    invalid[0].rarity = 'legendary';
    const missingPool = MAGIC_ITEM_CATALOG.filter((item) => item.rarity !== 'common');
    for (const data of [missingPool, invalid]) {
      dependency.MAGIC_ITEM_CATALOG = data;
      const rng = sequence([]);
      assert.throws(() => withDependency('hoard', 'cr-0-4', rng.random), /Invalid magic-item catalog:/);
      rng.done();
    }
  } finally {
    catalogModule.exports = original;
    require.cache[enginePath] = engineModule;
  }
});

test('generation leaves approved currency and catalog data unchanged', () => {
  const currency = structuredClone(CURRENCY_TABLES);
  const catalog = structuredClone(MAGIC_ITEM_CATALOG);
  for (const band of bands) {
    generateTreasure('individual', band.id, () => 1 - Number.EPSILON);
    generateTreasure('hoard', band.id, () => 1 - Number.EPSILON);
  }
  assert.deepEqual(CURRENCY_TABLES, currency);
  assert.deepEqual(MAGIC_ITEM_CATALOG, catalog);
});
