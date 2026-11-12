import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  ARMOR_BASE_TYPES, MAGIC_ITEM_CATALOG, MAGIC_ITEM_SOURCE, WEAPON_BASE_TYPES,
  validateMagicItemCatalog, type AttunementRequirement, type MagicItem,
} from './magic-items';

function item(id: string): MagicItem {
  const result = MAGIC_ITEM_CATALOG.find((entry) => entry.id === id);
  assert.ok(result, `missing ${id}`);
  return result;
}

function copy(): Record<string, unknown>[] {
  return structuredClone(MAGIC_ITEM_CATALOG) as unknown as Record<string, unknown>[];
}

function changed(id: string, fields: Record<string, unknown>): Record<string, unknown>[] {
  const entries = copy();
  const index = entries.findIndex((entry) => entry.id === id);
  assert.notEqual(index, -1);
  entries[index] = { ...entries[index], ...fields };
  return entries;
}

function rejects(id: string, fields: Record<string, unknown>, pattern = /Invalid magic-item catalog:/): void {
  const input = changed(id, fields);
  const before = structuredClone(input);
  assert.throws(() => validateMagicItemCatalog(input), pattern);
  assert.deepEqual(input, before, 'invalid data must not be silently corrected');
}

// Pin public identifiers independently of the implementation and of document order.
const approvedIds = [
  'bead-of-nourishment', 'potion-of-climbing', 'potion-of-healing',
  'dust-of-disappearance', 'oil-of-slipperiness', 'potion-of-animal-friendship',
  'potion-of-healing-greater', 'potion-of-water-breathing', 'bag-of-holding',
  'boots-of-elvenkind', 'cloak-of-elvenkind', 'cloak-of-protection', 'goggles-of-night',
  'immovable-rod', 'lantern-of-revealing', 'wand-of-web', 'weapon-plus-1',
  'elixir-of-health', 'potion-of-clairvoyance', 'potion-of-healing-superior',
  'potion-of-heroism', 'potion-of-invisibility', 'potion-of-invulnerability',
  'amulet-of-health', 'armor-plus-1', 'boots-of-speed', 'bracers-of-defense',
  'cape-of-the-mountebank', 'portable-hole', 'ring-of-protection',
  'rope-of-entanglement', 'staff-of-healing', 'weapon-plus-2', 'potion-of-flying',
  'potion-of-healing-supreme', 'potion-of-speed', 'potion-of-vitality', 'armor-plus-2',
  'cloak-of-arachnida', 'ring-of-regeneration', 'ring-of-telekinesis',
  'robe-of-scintillating-colors', 'rod-of-alertness', 'staff-of-frost', 'weapon-plus-3',
];

test('catalog has exactly the approved stable IDs, counts, and seven nonempty pools', () => {
  assert.equal(MAGIC_ITEM_CATALOG.length, 45);
  const ids = MAGIC_ITEM_CATALOG.map((entry) => entry.id);
  assert.equal(new Set(ids).size, 45);
  assert.ok(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)));
  assert.deepEqual([...ids].sort(), [...approvedIds].sort());
  const counts: Record<string, number> = {};
  for (const entry of MAGIC_ITEM_CATALOG) {
    const key = `${entry.rarity}:${entry.treatment}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  assert.equal(counts['common:permanent'] ?? 0, 0);
  assert.deepEqual(counts, {
    'common:consumable': 3, 'uncommon:consumable': 5, 'uncommon:permanent': 9,
    'rare:consumable': 6, 'rare:permanent': 10,
    'very-rare:consumable': 4, 'very-rare:permanent': 8,
  });
  assert.equal(Object.keys(counts).length, 7);
  assert.ok(Object.values(counts).every((count) => count > 0));
  assert.doesNotThrow(() => validateMagicItemCatalog(MAGIC_ITEM_CATALOG));
});

function documentedAttunement(text: string): AttunementRequirement {
  if (text === 'None') return { kind: 'none' };
  if (text === 'Yes') return { kind: 'required' };
  if (text === 'Yes — a Spellcaster') return { kind: 'spellcaster' };
  if (text === 'Yes — a Bard, Cleric, or Druid') return { kind: 'class', classes: ['Bard', 'Cleric', 'Druid'] };
  if (text === 'Yes — a Druid, Sorcerer, Warlock, or Wizard') return { kind: 'class', classes: ['Druid', 'Sorcerer', 'Warlock', 'Wizard'] };
  throw new Error(`unrecognized documented attunement: ${text}`);
}

test('membership, variants, rarity, treatment, attunement, and pages match the approved document', () => {
  const document = readFileSync('docs/magic-item-catalog-proposal.md', 'utf8');
  assert.match(document, /Status: approved by the owner for v0\.1 implementation/);
  const expected = document.split(/^### /m).flatMap((block) => {
    const heading = /^(Common|Uncommon|Rare|Very Rare) — (consumable|permanent) \((\d+)\)/.exec(block);
    if (!heading) return [];
    const rows = block.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('| Official') && !line.startsWith('| ---'));
    assert.equal(rows.length, Number(heading[3]));
    return rows.map((row) => {
      const [name, attunement, reference] = row.split('|').slice(1).map((cell) => cell.trim());
      const page = /\[p\. (\d+)\]/.exec(reference);
      assert.ok(page);
      const variant = /, (\+\d)$/.exec(name)?.[1] ?? /\((greater|superior|supreme)\)$/.exec(name)?.[1] ?? null;
      const sourceEntry = name.startsWith('Potion of Healing') ? 'Potions of Healing'
        : name.startsWith('Weapon, +') ? 'Weapon, +1, +2, or +3'
          : name.startsWith('Armor, +') ? 'Armor, +1, +2, or +3' : name;
      return { name, variant, rarity: heading[1].toLowerCase().replace(' ', '-'), treatment: heading[2],
        attunement: documentedAttunement(attunement), page: Number(page[1]), sourceEntry };
    });
  });
  assert.equal(expected.length, 45);
  const actual = MAGIC_ITEM_CATALOG.map((entry) => ({ name: entry.name, variant: entry.variant,
    rarity: entry.rarity, treatment: entry.treatment, attunement: entry.attunement,
    page: entry.source.page, sourceEntry: entry.source.entry }));
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
  assert.deepEqual(actual.sort(byName), expected.sort(byName));
});

test('all records have precise SRD references with shared attribution and modification metadata', () => {
  assert.equal(MAGIC_ITEM_SOURCE.document, 'SRD 5.2.1');
  assert.equal(MAGIC_ITEM_SOURCE.license, 'CC-BY-4.0');
  assert.equal(MAGIC_ITEM_SOURCE.licenseUrl, 'https://creativecommons.org/licenses/by/4.0/legalcode');
  assert.match(MAGIC_ITEM_SOURCE.attribution, /Wizards of the Coast LLC/);
  assert.match(MAGIC_ITEM_SOURCE.changes, /Selected and structured SRD/);
  assert.equal(MAGIC_ITEM_SOURCE.sha256, '8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87');
  for (const entry of MAGIC_ITEM_CATALOG) {
    assert.equal(entry.source.document, 'SRD 5.2.1');
    assert.equal(entry.source.section, 'Magic Items A–Z');
    assert.ok(Number.isInteger(entry.source.page) && entry.source.page >= 209 && entry.source.page <= 253);
    assert.equal(entry.source.url, `${MAGIC_ITEM_SOURCE.url}#page=${entry.source.page}`);
    assert.ok(entry.source.entry.trim().length > 0);
  }
});

test('consumable classification covers all 18 expendable units; rechargeable equipment stays permanent', () => {
  const consumables = MAGIC_ITEM_CATALOG.filter((entry) => entry.treatment === 'consumable').map((entry) => entry.id).sort();
  assert.deepEqual(consumables, [
    'bead-of-nourishment', 'potion-of-climbing', 'potion-of-healing',
    'dust-of-disappearance', 'oil-of-slipperiness', 'potion-of-animal-friendship',
    'potion-of-healing-greater', 'potion-of-water-breathing', 'elixir-of-health',
    'potion-of-clairvoyance', 'potion-of-healing-superior', 'potion-of-heroism',
    'potion-of-invisibility', 'potion-of-invulnerability', 'potion-of-flying',
    'potion-of-healing-supreme', 'potion-of-speed', 'potion-of-vitality',
  ].sort());
  for (const id of ['wand-of-web', 'staff-of-healing', 'staff-of-frost', 'lantern-of-revealing', 'rod-of-alertness']) {
    assert.equal(item(id).treatment, 'permanent');
  }
  assert.equal(item('potion-of-invisibility').rarity, 'rare');
});

test('attunement preserves unrestricted, spellcaster, and exact class requirements', () => {
  assert.deepEqual(item('wand-of-web').attunement, { kind: 'spellcaster' });
  assert.deepEqual(item('staff-of-healing').attunement, { kind: 'class', classes: ['Bard', 'Cleric', 'Druid'] });
  assert.deepEqual(item('staff-of-frost').attunement, { kind: 'class', classes: ['Druid', 'Sorcerer', 'Warlock', 'Wizard'] });
  assert.deepEqual(item('rod-of-alertness').attunement, { kind: 'required' });
  assert.deepEqual(item('bag-of-holding').attunement, { kind: 'none' });
  assert.equal(MAGIC_ITEM_CATALOG.filter((entry) => entry.attunement.kind !== 'none').length, 14);
  const input = copy();
  const staff = input.find((entry) => entry.id === 'staff-of-healing');
  assert.ok(staff);
  staff.attunement = { kind: 'class', classes: ['Druid', 'Bard', 'Cleric'] };
  assert.doesNotThrow(() => validateMagicItemCatalog(input));
});

const equipmentVariants = [
  ['weapon-plus-1', 'uncommon', 'weapon', 1],
  ['weapon-plus-2', 'rare', 'weapon', 2],
  ['weapon-plus-3', 'very-rare', 'weapon', 3],
  ['armor-plus-1', 'rare', 'armor', 1],
  ['armor-plus-2', 'very-rare', 'armor', 2],
] as const;

test('each of five equipment bonus variants has one row, its official rarity, and no assigned base', () => {
  assert.equal(MAGIC_ITEM_CATALOG.filter((entry) => entry.equipment !== null).length, 5);
  for (const [id, rarity, kind, bonus] of equipmentVariants) {
    const entry = item(id);
    assert.equal(MAGIC_ITEM_CATALOG.filter((candidate) => candidate.id === id).length, 1);
    assert.equal(entry.rarity, rarity);
    assert.equal(entry.treatment, 'permanent');
    assert.equal(entry.category, kind);
    assert.equal(entry.variant, `+${bonus}`);
    assert.deepEqual(entry.equipment, { kind, bonus, mode: 'manual', baseType: null });
    assert.deepEqual(entry.attunement, { kind: 'none' });
    assert.equal(entry.source.page, kind === 'weapon' ? 253 : 210);
    assert.equal(Object.hasOwn(entry, 'weight'), false);
  }
});

test('manual designation accepts every SRD base type, unspecified values, and no extra catalog entries', () => {
  assert.equal(WEAPON_BASE_TYPES.length, 38);
  assert.equal(ARMOR_BASE_TYPES.length, 12);
  assert.equal(new Set(WEAPON_BASE_TYPES).size, 38);
  assert.equal(new Set(ARMOR_BASE_TYPES).size, 12);
  for (const [id, , kind] of equipmentVariants) {
    const original = item(id).equipment;
    assert.ok(original);
    const allowed = kind === 'weapon' ? WEAPON_BASE_TYPES : ARMOR_BASE_TYPES;
    for (const baseType of [null, undefined, ...allowed]) {
      const equipment: Record<string, unknown> = { ...original, baseType };
      if (baseType === undefined) delete equipment.baseType;
      const input = changed(id, { equipment });
      const before = structuredClone(input);
      assert.doesNotThrow(() => validateMagicItemCatalog(input), `${id}: ${baseType}`);
      assert.deepEqual(input, before);
      assert.equal(input.length, 45);
    }
  }
  assert.ok(WEAPON_BASE_TYPES.includes('Musket') && WEAPON_BASE_TYPES.includes('Pistol'));
  assert.equal(item('weapon-plus-1').equipment?.baseType, null, 'manual designations never mutate catalog templates');
});

test('excluded items and categories cannot enter the eligible catalog, even when disguised', () => {
  assert.ok(MAGIC_ITEM_CATALOG.every((entry) => !entry.cursed && !/Spell Scroll|Ammunition|Horseshoes of a Zephyr|Armor, \+3/.test(entry.name)));
  for (const rarity of ['legendary', 'artifact', 'Legendary']) {
    rejects('armor-plus-2', { rarity }, /excluded rarity/);
  }
  rejects('armor-plus-2', { name: 'Armor, +3', variant: '+3', rarity: 'very-rare' }, /approved entry/);
  rejects('armor-plus-2', { id: 'armor-plus-3', name: 'Armor, +3' }, /unapproved item/);
  rejects('potion-of-climbing', { cursed: true }, /cursed items are excluded/);
  for (const category of ['scroll', 'spell-scroll', 'ammunition', 'magic-ammunition']) {
    rejects('potion-of-climbing', { category }, /category/);
  }
  for (const name of ['Spell Scroll', 'Ammunition, +1', 'Potion of Poison', 'Horseshoes of a Zephyr', 'Sword of Vengeance']) {
    rejects('potion-of-climbing', { name }, /approved entry/);
  }
});

test('validator rejects malformed roots, entries, lengths, nonempty IDs, and duplicates', () => {
  for (const input of [undefined, null, true, 45, 'catalog', {}, new Map(), [], copy().slice(1), [...copy(), copy()[0]]]) {
    assert.throws(() => validateMagicItemCatalog(input), /exactly 45/);
  }
  for (const raw of [undefined, null, [], true, 1, 'item', new Date()]) {
    const input: unknown[] = copy(); input[0] = raw;
    assert.throws(() => validateMagicItemCatalog(input), /entry 0 must be an object/);
  }
  assert.throws(() => validateMagicItemCatalog(new Array(45)), /entry 0 must be an object/);
  for (const id of [undefined, null, '', '   ', 1, []]) {
    rejects('potion-of-climbing', { id }, /nonempty ID/);
  }
  const duplicate = copy(); duplicate[1] = duplicate[0];
  assert.throws(() => validateMagicItemCatalog(duplicate), /duplicate ID/);
  rejects('potion-of-climbing', { id: 'unapproved-item' }, /unapproved item/);
  assert.doesNotThrow(() => validateMagicItemCatalog(copy().reverse()), 'catalog order is not a weight');
});

test('validator rejects malformed or missing fields and valid-enum metadata substitutions', () => {
  for (const key of Object.keys(item('potion-of-climbing'))) {
    const input = copy(); delete input[1][key];
    assert.throws(() => validateMagicItemCatalog(input), /Invalid magic-item catalog:/, key);
  }
  for (const rarity of [undefined, null, 1, '', 'Common', {}, []]) rejects('potion-of-climbing', { rarity }, /rarity/);
  for (const treatment of [undefined, null, 1, '', 'charged', {}, []]) rejects('potion-of-climbing', { treatment }, /treatment/);
  for (const name of ['', null, 1, [], {}]) rejects('potion-of-climbing', { name }, /name/);
  rejects('potion-of-climbing', { rarity: 'rare' }, /rarity/);
  rejects('potion-of-climbing', { treatment: 'permanent' }, /treatment/);
  rejects('potion-of-climbing', { variant: 'greater' }, /variant/);
  rejects('potion-of-climbing', { category: 'wand' }, /category/);
  rejects('potion-of-climbing', { weight: 2 }, /unexpected.*weight/);
  rejects('potion-of-climbing', { cursed: 'false' }, /explicit false/);
  const swapped = copy();
  const consumable = swapped.find((entry) => entry.id === 'dust-of-disappearance');
  const permanent = swapped.find((entry) => entry.id === 'bag-of-holding');
  assert.ok(consumable && permanent);
  consumable.treatment = 'permanent'; permanent.treatment = 'consumable';
  assert.throws(() => validateMagicItemCatalog(swapped), /treatment/, 'unchanged pool totals cannot disguise incorrect classifications');
});

test('validator rejects malformed, missing, incomplete, and wrong source references', () => {
  const original = item('potion-of-climbing').source;
  for (const source of [undefined, null, [], 235, 'SRD', {}]) rejects('potion-of-climbing', { source }, /source/);
  for (const key of Object.keys(original)) {
    const source: Record<string, unknown> = { ...original }; delete source[key];
    rejects('potion-of-climbing', { source }, /source/);
    rejects('potion-of-climbing', { source: { ...original, [key]: null } }, /source/);
  }
  for (const [key, value] of [
    ['document', 'SRD 5.1'], ['page', '235'], ['page', 236], ['page', NaN],
    ['url', 'https://www.dndbeyond.com/'], ['section', 'DMG'], ['entry', 'Invented Potion'],
  ]) rejects('potion-of-climbing', { source: { ...original, [key]: value } }, /source/);
});

test('validator rejects missing or malformed attunement and altered class restrictions', () => {
  for (const attunement of [undefined, null, [], true, 'Yes', {}, { kind: 'optional' }, { kind: 'required' }]) {
    rejects('wand-of-web', { attunement }, /attunement/);
  }
  rejects('wand-of-web', { attunement: { kind: 'none' } }, /attunement/);
  rejects('rod-of-alertness', { attunement: { kind: 'class', classes: ['Wizard'] } }, /attunement/);
  rejects('bag-of-holding', { attunement: { kind: 'none', classes: [] } }, /attunement/);
  for (const classes of [undefined, null, 'Bard', [], ['Bard'], ['Bard', 'Cleric', 'Cleric'],
    ['Bard', 'Cleric', 'Wizard'], ['Bard', 'Cleric', 'Druid', 'Wizard'], [1, 2, 3]]) {
    rejects('staff-of-healing', { attunement: { kind: 'class', classes } }, /attunement classes/);
  }
  rejects('staff-of-frost', { attunement: { kind: 'class', classes: ['Druid', 'Sorcerer', 'Warlock', 'Cleric'] } }, /attunement classes/);
  const sparseClasses = ['Bard', 'Cleric', 'Druid']; delete sparseClasses[2];
  rejects('staff-of-healing', { attunement: { kind: 'class', classes: sparseClasses } }, /attunement classes/);
});

test('validator rejects missing designation, automatic assignment, invalid bases, and extra weights', () => {
  const weapon = item('weapon-plus-1').equipment;
  const armor = item('armor-plus-2').equipment;
  assert.ok(weapon && armor);
  for (const equipment of [undefined, null, [], 'Longsword', {},
    { ...weapon, mode: 'random' }, { ...weapon, mode: 'automatic' },
    { ...weapon, kind: 'armor' }, { ...weapon, bonus: 2 },
    { ...weapon, bonus: '1' }, { ...weapon, weight: 38 }]) {
    rejects('weapon-plus-1', { equipment }, /equipment/);
  }
  rejects('armor-plus-2', { equipment: { ...armor, bonus: 3 } }, /equipment/);
  for (const baseType of ['', 'Shield', 'Arrow', 'Bullet', 'Plate Armor', 'Unarmed Strike', 'Laser Rifle', 1, [], {}]) {
    rejects('weapon-plus-1', { equipment: { ...weapon, baseType } }, /base type/);
  }
  for (const baseType of ['Shield', 'Longsword', 'Leather', 'Invented Armor']) {
    rejects('armor-plus-2', { equipment: { ...armor, baseType } }, /base type/);
  }
  rejects('bag-of-holding', { equipment: weapon }, /unexpected equipment/);
});

test('catalog and every nested exported data structure are immutable at runtime', () => {
  function frozen(value: unknown): void {
    if (value === null || typeof value !== 'object') return;
    assert.ok(Object.isFrozen(value));
    for (const nested of Object.values(value)) frozen(nested);
  }
  for (const value of [MAGIC_ITEM_CATALOG, MAGIC_ITEM_SOURCE, WEAPON_BASE_TYPES, ARMOR_BASE_TYPES]) frozen(value);
  assert.equal(Reflect.set(MAGIC_ITEM_CATALOG, '0', item('rod-of-alertness')), false);
  assert.equal(Reflect.set(item('potion-of-climbing'), 'rarity', 'legendary'), false);
  assert.equal(Reflect.set(item('potion-of-climbing').source, 'page', 1), false);
  assert.equal(Reflect.set(item('weapon-plus-1').equipment!, 'baseType', 'Longsword'), false);
  assert.equal(Reflect.set(MAGIC_ITEM_SOURCE, 'license', 'unlicensed'), false);
  assert.doesNotThrow(() => validateMagicItemCatalog(MAGIC_ITEM_CATALOG));
});
