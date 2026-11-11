export type MagicItemRarity = 'common' | 'uncommon' | 'rare' | 'very-rare';
export type MagicItemTreatment = 'consumable' | 'permanent';
export type MagicItemCategory = 'wondrous-item' | 'potion' | 'ring' | 'rod' | 'wand' | 'staff' | 'weapon' | 'armor';
export type AttunementClass = 'Bard' | 'Cleric' | 'Druid' | 'Sorcerer' | 'Warlock' | 'Wizard';

export type AttunementRequirement =
  | { readonly kind: 'none' }
  | { readonly kind: 'required' }
  | { readonly kind: 'spellcaster' }
  | { readonly kind: 'class'; readonly classes: readonly AttunementClass[] };

/** Valid manual designations from SRD 5.2.1, Weapons table, p. 91.
 * These are metadata, not extra catalog entries or a random subtype table.
 * Ranged weapons are permitted; magic ammunition is not. */
export const WEAPON_BASE_TYPES = Object.freeze([
  'Club', 'Dagger', 'Greatclub', 'Handaxe', 'Javelin', 'Light Hammer', 'Mace',
  'Quarterstaff', 'Sickle', 'Spear', 'Dart', 'Light Crossbow', 'Shortbow', 'Sling',
  'Battleaxe', 'Flail', 'Glaive', 'Greataxe', 'Greatsword', 'Halberd', 'Lance',
  'Longsword', 'Maul', 'Morningstar', 'Pike', 'Rapier', 'Scimitar', 'Shortsword',
  'Trident', 'Warhammer', 'War Pick', 'Whip', 'Blowgun', 'Hand Crossbow',
  'Heavy Crossbow', 'Longbow', 'Musket', 'Pistol',
] as const);

/** SRD 5.2.1, Armor table, p. 92: Light/Medium/Heavy only; excludes Shields. */
export const ARMOR_BASE_TYPES = Object.freeze([
  'Padded Armor', 'Leather Armor', 'Studded Leather Armor', 'Hide Armor',
  'Chain Shirt', 'Scale Mail', 'Breastplate', 'Half Plate Armor',
  'Ring Mail', 'Chain Mail', 'Splint Armor', 'Plate Armor',
] as const);

export type WeaponBaseType = (typeof WEAPON_BASE_TYPES)[number];
export type ArmorBaseType = (typeof ARMOR_BASE_TYPES)[number];

/** A future result can retain an unspecified base type or carry a later manual
 * designation. Neither changes the catalog ID, creates an item, or adds a roll. */
export type EquipmentDesignation =
  | { readonly kind: 'weapon'; readonly bonus: 1 | 2 | 3; readonly mode: 'manual'; readonly baseType?: WeaponBaseType | null }
  | { readonly kind: 'armor'; readonly bonus: 1 | 2; readonly mode: 'manual'; readonly baseType?: ArmorBaseType | null };

export interface MagicItemSourceReference {
  readonly document: 'SRD 5.2.1';
  readonly url: string;
  readonly section: 'Magic Items A–Z';
  readonly entry: string;
  readonly page: number;
}

export interface MagicItem {
  readonly id: string;
  readonly name: string;
  readonly variant: string | null;
  readonly rarity: MagicItemRarity;
  readonly treatment: MagicItemTreatment;
  readonly category: MagicItemCategory;
  readonly cursed: false;
  readonly attunement: AttunementRequirement;
  readonly source: MagicItemSourceReference;
  readonly equipment: EquipmentDesignation | null;
}

/** Attribution and modification notice for the SRD metadata represented here. */
export const MAGIC_ITEM_SOURCE = Object.freeze({
  document: 'SRD 5.2.1',
  url: 'https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf',
  sha256: '8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87',
  license: 'CC-BY-4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/legalcode',
  attribution: 'This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.',
  changes: 'Selected and structured SRD names, variants, rarities, categories, attunement requirements, and equipment names as typed metadata. Curation and consumable/permanent classification are DM Companion decisions; full item mechanics are not reproduced.',
});

const NONE: AttunementRequirement = Object.freeze({ kind: 'none' });
const REQUIRED: AttunementRequirement = Object.freeze({ kind: 'required' });
const SPELLCASTER: AttunementRequirement = Object.freeze({ kind: 'spellcaster' });

function classAttunement(...classes: AttunementClass[]): AttunementRequirement {
  return Object.freeze({ kind: 'class', classes: Object.freeze(classes) });
}

function designation(kind: 'weapon', bonus: 1 | 2 | 3): EquipmentDesignation;
function designation(kind: 'armor', bonus: 1 | 2): EquipmentDesignation;
function designation(kind: 'weapon' | 'armor', bonus: 1 | 2 | 3): EquipmentDesignation {
  // The overloads prohibit Legendary Armor, +3 in this eligible-only dataset.
  return Object.freeze({ kind, bonus, mode: 'manual', baseType: null }) as EquipmentDesignation;
}

function item(
  id: string, name: string, rarity: MagicItemRarity, treatment: MagicItemTreatment,
  category: MagicItemCategory, page: number,
  options: {
    readonly attunement?: AttunementRequirement;
    readonly variant?: string;
    readonly entry?: string;
    readonly equipment?: EquipmentDesignation;
  } = {},
): MagicItem {
  return Object.freeze({
    id, name, rarity, treatment, category, cursed: false,
    variant: options.variant ?? null,
    attunement: options.attunement ?? NONE,
    source: Object.freeze({
      document: 'SRD 5.2.1', url: `${MAGIC_ITEM_SOURCE.url}#page=${page}`,
      section: 'Magic Items A–Z', entry: options.entry ?? name, page,
    }),
    equipment: options.equipment ?? null,
  });
}

/** Approved membership: docs/magic-item-catalog-proposal.md.
 * Data only: no rolling, probabilities, prices, equipment assignment, or UI.
 * Armor, +3 (SRD p. 210) is Legendary and deliberately absent, as are all other
 * approved exclusions and deferrals. Each eligible bonus variant has one row. */
export const MAGIC_ITEM_CATALOG: readonly MagicItem[] = Object.freeze([
  // Common — consumable (3)
  item('bead-of-nourishment', 'Bead of Nourishment', 'common', 'consumable', 'wondrous-item', 213),
  item('potion-of-climbing', 'Potion of Climbing', 'common', 'consumable', 'potion', 235),
  item('potion-of-healing', 'Potion of Healing', 'common', 'consumable', 'potion', 236, { entry: 'Potions of Healing' }),
  // Uncommon — consumable (5)
  item('dust-of-disappearance', 'Dust of Disappearance', 'uncommon', 'consumable', 'wondrous-item', 219),
  item('oil-of-slipperiness', 'Oil of Slipperiness', 'uncommon', 'consumable', 'potion', 233),
  item('potion-of-animal-friendship', 'Potion of Animal Friendship', 'uncommon', 'consumable', 'potion', 235),
  item('potion-of-healing-greater', 'Potion of Healing (greater)', 'uncommon', 'consumable', 'potion', 236, { variant: 'greater', entry: 'Potions of Healing' }),
  item('potion-of-water-breathing', 'Potion of Water Breathing', 'uncommon', 'consumable', 'potion', 236),
  // Uncommon — permanent (9)
  item('bag-of-holding', 'Bag of Holding', 'uncommon', 'permanent', 'wondrous-item', 212),
  item('boots-of-elvenkind', 'Boots of Elvenkind', 'uncommon', 'permanent', 'wondrous-item', 213),
  item('cloak-of-elvenkind', 'Cloak of Elvenkind', 'uncommon', 'permanent', 'wondrous-item', 215, { attunement: REQUIRED }),
  item('cloak-of-protection', 'Cloak of Protection', 'uncommon', 'permanent', 'wondrous-item', 216, { attunement: REQUIRED }),
  item('goggles-of-night', 'Goggles of Night', 'uncommon', 'permanent', 'wondrous-item', 224),
  item('immovable-rod', 'Immovable Rod', 'uncommon', 'permanent', 'rod', 227),
  item('lantern-of-revealing', 'Lantern of Revealing', 'uncommon', 'permanent', 'wondrous-item', 228),
  item('wand-of-web', 'Wand of Web', 'uncommon', 'permanent', 'wand', 251, { attunement: SPELLCASTER }),
  item('weapon-plus-1', 'Weapon, +1', 'uncommon', 'permanent', 'weapon', 253, { variant: '+1', entry: 'Weapon, +1, +2, or +3', equipment: designation('weapon', 1) }),
  // Rare — consumable (6)
  item('elixir-of-health', 'Elixir of Health', 'rare', 'consumable', 'potion', 220),
  item('potion-of-clairvoyance', 'Potion of Clairvoyance', 'rare', 'consumable', 'potion', 235),
  item('potion-of-healing-superior', 'Potion of Healing (superior)', 'rare', 'consumable', 'potion', 236, { variant: 'superior', entry: 'Potions of Healing' }),
  item('potion-of-heroism', 'Potion of Heroism', 'rare', 'consumable', 'potion', 236),
  item('potion-of-invisibility', 'Potion of Invisibility', 'rare', 'consumable', 'potion', 236),
  item('potion-of-invulnerability', 'Potion of Invulnerability', 'rare', 'consumable', 'potion', 236),
  // Rare — permanent (10)
  item('amulet-of-health', 'Amulet of Health', 'rare', 'permanent', 'wondrous-item', 209, { attunement: REQUIRED }),
  item('armor-plus-1', 'Armor, +1', 'rare', 'permanent', 'armor', 210, { variant: '+1', entry: 'Armor, +1, +2, or +3', equipment: designation('armor', 1) }),
  item('boots-of-speed', 'Boots of Speed', 'rare', 'permanent', 'wondrous-item', 214, { attunement: REQUIRED }),
  item('bracers-of-defense', 'Bracers of Defense', 'rare', 'permanent', 'wondrous-item', 214, { attunement: REQUIRED }),
  item('cape-of-the-mountebank', 'Cape of the Mountebank', 'rare', 'permanent', 'wondrous-item', 215),
  item('portable-hole', 'Portable Hole', 'rare', 'permanent', 'wondrous-item', 234),
  item('ring-of-protection', 'Ring of Protection', 'rare', 'permanent', 'ring', 238, { attunement: REQUIRED }),
  item('rope-of-entanglement', 'Rope of Entanglement', 'rare', 'permanent', 'wondrous-item', 242),
  item('staff-of-healing', 'Staff of Healing', 'rare', 'permanent', 'staff', 245, { attunement: classAttunement('Bard', 'Cleric', 'Druid') }),
  item('weapon-plus-2', 'Weapon, +2', 'rare', 'permanent', 'weapon', 253, { variant: '+2', entry: 'Weapon, +1, +2, or +3', equipment: designation('weapon', 2) }),
  // Very Rare — consumable (4)
  item('potion-of-flying', 'Potion of Flying', 'very-rare', 'consumable', 'potion', 235),
  item('potion-of-healing-supreme', 'Potion of Healing (supreme)', 'very-rare', 'consumable', 'potion', 236, { variant: 'supreme', entry: 'Potions of Healing' }),
  item('potion-of-speed', 'Potion of Speed', 'very-rare', 'consumable', 'potion', 236),
  item('potion-of-vitality', 'Potion of Vitality', 'very-rare', 'consumable', 'potion', 236),
  // Very Rare — permanent (8)
  item('armor-plus-2', 'Armor, +2', 'very-rare', 'permanent', 'armor', 210, { variant: '+2', entry: 'Armor, +1, +2, or +3', equipment: designation('armor', 2) }),
  item('cloak-of-arachnida', 'Cloak of Arachnida', 'very-rare', 'permanent', 'wondrous-item', 215, { attunement: REQUIRED }),
  item('ring-of-regeneration', 'Ring of Regeneration', 'very-rare', 'permanent', 'ring', 238, { attunement: REQUIRED }),
  item('ring-of-telekinesis', 'Ring of Telekinesis', 'very-rare', 'permanent', 'ring', 239, { attunement: REQUIRED }),
  item('robe-of-scintillating-colors', 'Robe of Scintillating Colors', 'very-rare', 'permanent', 'wondrous-item', 240, { attunement: REQUIRED }),
  item('rod-of-alertness', 'Rod of Alertness', 'very-rare', 'permanent', 'rod', 241, { attunement: REQUIRED }),
  item('staff-of-frost', 'Staff of Frost', 'very-rare', 'permanent', 'staff', 245, { attunement: classAttunement('Druid', 'Sorcerer', 'Warlock', 'Wizard') }),
  item('weapon-plus-3', 'Weapon, +3', 'very-rare', 'permanent', 'weapon', 253, { variant: '+3', entry: 'Weapon, +1, +2, or +3', equipment: designation('weapon', 3) }),
]);

const approvedById = new Map(MAGIC_ITEM_CATALOG.map((entry) => [entry.id, entry]));
const expectedCounts = {
  common: { consumable: 3, permanent: 0 },
  uncommon: { consumable: 5, permanent: 9 },
  rare: { consumable: 6, permanent: 10 },
  'very-rare': { consumable: 4, permanent: 8 },
} as const;

function fail(message: string): never {
  throw new Error(`Invalid magic-item catalog: ${message}`);
}

function record(value: unknown, context: string, keys: readonly string[]): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    fail(`${context} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) fail(`unexpected ${context} field ${key}`);
  }
  return value as Record<string, unknown>;
}

function matchFields(actual: Record<string, unknown>, expected: object, keys: readonly string[], context: string): void {
  const fields = expected as Record<string, unknown>;
  for (const key of keys) {
    if (!Object.hasOwn(actual, key) || actual[key] !== fields[key]) fail(`${context}.${key} does not match the approved entry`);
  }
}

/** Validate unknown runtime data against the fixed v0.1 catalog contract.
 * Throws a contextual Error; never corrects, freezes, or otherwise mutates input.
 * Order may vary, and equipment base types may be unspecified or manually set.
 * All other metadata must match the approved catalog, preventing substitutions
 * (including an excluded item disguised with an eligible rarity/category). */
export function validateMagicItemCatalog(value: unknown): asserts value is readonly MagicItem[] {
  if (!Array.isArray(value) || value.length !== 45) fail('expected exactly 45 eligible entries');
  const ids = new Set<string>();
  const counts: Record<string, number> = {};
  for (const [index, raw] of value.entries()) {
    const entry = record(raw, `entry ${index}`, ['id', 'name', 'variant', 'rarity', 'treatment', 'category', 'cursed', 'attunement', 'source', 'equipment']);
    if (typeof entry.id !== 'string' || entry.id.trim().length === 0) fail(`nonempty ID required at entry ${index}`);
    const id = entry.id;
    if (ids.has(id)) fail(`duplicate ID ${id}`);
    ids.add(id);
    if (!['common', 'uncommon', 'rare', 'very-rare'].includes(entry.rarity as string)) fail(`invalid or excluded rarity in ${id}`);
    if (entry.treatment !== 'consumable' && entry.treatment !== 'permanent') fail(`invalid treatment in ${id}`);
    if (entry.cursed !== false) fail(`cursed items are excluded; explicit false required in ${id}`);
    const approved = approvedById.get(id);
    if (!approved) fail(`unapproved item ID ${id}`);
    matchFields(entry, approved, ['name', 'variant', 'rarity', 'treatment', 'category', 'cursed'], id);
    const sourceKeys = ['document', 'url', 'section', 'entry', 'page'];
    const source = record(entry.source, `${id}.source`, sourceKeys);
    matchFields(source, approved.source, sourceKeys, `${id}.source`);
    const attunement = record(entry.attunement, `${id}.attunement`, ['kind', 'classes']);
    matchFields(attunement, approved.attunement, ['kind'], `${id}.attunement`);
    if (approved.attunement.kind === 'class') {
      const classes = attunement.classes;
      const expected = approved.attunement.classes;
      if (!Array.isArray(classes) || classes.length !== expected.length || new Set(classes).size !== classes.length ||
          !expected.every((name) => classes.includes(name))) {
        fail(`invalid attunement classes in ${id}`);
      }
    } else if (Object.hasOwn(attunement, 'classes')) {
      fail(`unexpected attunement classes in ${id}`);
    }
    if (approved.equipment === null) {
      if (entry.equipment !== null) fail(`unexpected equipment designation in ${id}`);
    } else {
      const equipment = record(entry.equipment, `${id}.equipment`, ['kind', 'bonus', 'mode', 'baseType']);
      matchFields(equipment, approved.equipment, ['kind', 'bonus', 'mode'], `${id}.equipment`);
      const bases: readonly string[] = approved.equipment.kind === 'weapon' ? WEAPON_BASE_TYPES : ARMOR_BASE_TYPES;
      if (equipment.baseType !== undefined && equipment.baseType !== null &&
          (typeof equipment.baseType !== 'string' || !bases.includes(equipment.baseType))) {
        fail(`invalid SRD equipment base type in ${id}`);
      }
    }
    const pool = `${entry.rarity}:${entry.treatment}`;
    counts[pool] = (counts[pool] ?? 0) + 1;
  }
  let enabledPools = 0;
  for (const [rarity, treatments] of Object.entries(expectedCounts)) {
    for (const [treatment, expected] of Object.entries(treatments)) {
      const pool = `${rarity}:${treatment}`;
      const actual = counts[pool] ?? 0;
      if (actual !== expected) fail(`expected ${expected} entries in ${pool}, received ${actual}`);
      if (expected > 0 && actual > 0) enabledPools++;
    }
  }
  if (enabledPools !== 7) fail('all seven enabled rarity/treatment pools must be nonempty');
}

validateMagicItemCatalog(MAGIC_ITEM_CATALOG);
