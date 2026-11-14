# DM Companion

A mobile toolkit for Dungeon Masters running Dungeons & Dragons with the 2024 rules.

The application uses Expo with React Native, strict TypeScript, and Expo Router,
and includes reusable TypeScript dice and treasure generation engines. The mobile
home screen generates individual treasure and party hoards with session-only
Light, Dark, and System appearance. No backend, authentication, or database is
included.

## Requirements

- A supported Node.js LTS release: 22.13+, 24.3+, or 26+ (see `package.json`).
- npm (the dependency lockfile is committed).
- Expo Go compatible with the project's Expo SDK on a physical Android or iOS device,
  or an Android emulator / iOS simulator. The iOS simulator requires macOS and Xcode;
  the Android emulator requires Android Studio.

## Getting started

```sh
git clone https://github.com/RaulfdSilva/Dm-companion.git
cd Dm-companion
npm ci
npm start
```

Scan the QR code with Expo Go, or press `a` for an Android emulator or `i` for an
iOS simulator. The development machine and physical device should be on the same
network. Expo Go must support the SDK version declared in `package.json`.

You can also use `npm run android` or `npm run ios` to start Expo and open the
corresponding emulator or simulator.

## Validation

```sh
npm test
npm run typecheck
npm run lint
```

TypeScript runs in strict mode. ESLint uses Expo's recommended configuration and
treats warnings as failures.

## Dice engine

The framework-independent API lives in `src/lib/dice.ts`:

```ts
import { parseDiceExpression, rollDice } from './src/lib/dice';

parseDiceExpression('2d6+3');
// { count: 2, sides: 6, modifier: 3 }

rollDice('2d6+3', () => 0.5);
// { count: 2, sides: 6, modifier: 3, rolls: [4, 4], total: 11 }
```

`parseDiceExpression(expression)` returns a `DiceExpression` with `count`, `sides`,
and a signed `modifier` (zero when omitted). Expressions contain one dice group
and an optional integer modifier, such as `1d6`, `2d8`, `1d100`, or `3d10-2`.
Uppercase `D`, surrounding whitespace, and spaces around the modifier are accepted.

`rollDice(expression, random?)` returns a `DiceRoll`, adding individual `rolls` and
the final `total`. The optional `RandomNumberGenerator` defaults to `Math.random`;
it must return a finite number in `[0, 1)` and is called once per die. Modifiers
are applied once after rolling, and totals may be zero or negative.

Dice counts must be between 1 and 1,000 to bound work and allocation. Sides must be
positive safe integers (including one-sided dice); modifiers, possible dice sums,
and possible totals must also be safe integers. Malformed expressions throw
`SyntaxError`; invalid configurations or RNG samples throw `RangeError`.
Non-string input throws `TypeError`.

Tests use Node's built-in test runner with `tsx` to execute TypeScript. No React
Native or Expo runtime is needed to use or test the engine.

## Magic-item catalog

`src/lib/treasure/magic-items.ts` exports the deeply frozen `MAGIC_ITEM_CATALOG`
and readonly `MagicItem` types for the [45 approved v0.1 items](docs/magic-item-catalog-proposal.md).
Each entry has a stable ID, official name/variant, rarity, treatment, category,
attunement requirement, and an SRD page/entry reference. `MAGIC_ITEM_SOURCE`
retains the source version, URL, PDF hash, CC BY 4.0 attribution, and change notice.

`validateMagicItemCatalog(value: unknown)` throws a contextual error for malformed
data, changed membership/metadata, excluded items, or incorrect pool counts. It
validates the complete 45-entry catalog, not a single result or arbitrary subset,
and never changes or freezes its input. Successful validation narrows the value
to `readonly MagicItem[]`; the exported catalog itself is frozen at every level.

The five weapon/armor bonus variants each occupy one entry with `mode: 'manual'`
and `baseType: null`. A later result may preserve an unspecified base type
(`null` or omitted), or carry a manually chosen SRD type from `WEAPON_BASE_TYPES`
or `ARMOR_BASE_TYPES`. Designation does not change the ID or add entries, weights,
or rolls. Armor, +3 is Legendary and excluded. The catalog module supplies data and
validation; the API below handles generation. No equipment-selection interface or
full item mechanics are implemented.

## Treasure generation

`generateTreasure(type, crBand, random?)` in `src/lib/treasure/generate.ts` generates
one individual purse or one party-wide hoard using the
[approved economy](docs/treasure-economy-design.md) and catalog:

```ts
import { generateTreasure } from './src/lib/treasure/generate';

const empty = generateTreasure('individual', 'cr-0-4', () => 0);
// empty.currency.kind === 'empty'; empty.magic === null

const samples = [0, 0, 0, 0.99, 0.05, 0];
let index = 0;
const hoard = generateTreasure('hoard', 'cr-0-4', () => samples[index++]);
// hoard.currency: 60 GP; rowId: 'hoard-cr-0-4-1'
// hoard.magic.kind === 'item': Bead of Nourishment (common, consumable)
```

`type` is `'individual' | 'hoard'`; `crBand` is an existing `CrBandId`:
`'cr-0-4'`, `'cr-5-10'`, `'cr-11-16'`, or `'cr-17-plus'`. The optional RNG has the
Dice Engine's `RandomNumberGenerator` contract and defaults to `Math.random`.
Identical RNG sequences and inputs reproduce the complete result. Uniform
probabilities assume independent uniform samples; runtime checks enforce `[0, 1)`,
not the statistical quality of an injected generator.

The `TreasureResult` includes `type`, `crBand`, and `currency`. Currency contains
the table/row IDs and a `selectionRoll`; its `kind` is `'empty'` or `'currency'`.
The latter adds the original `denomination`, integer `quantity`, `multiplier`,
and `amountRoll`. The whole amount-roll total, including its modifier, is multiplied
once. Hoard amounts apply to the entire party and never scale with party size.

Individuals have `magic: null`. Hoards have `magic.kind: 'none'` with an
`appearanceRoll`, or `'item'` with the selected catalog `item`, `appearanceRoll`,
`rarityRoll`, `treatmentRoll`, and `selectionRoll`. The item supplies its stable ID,
name/variant, rarity, treatment, attunement, source, and equipment metadata.
Equipment starts with `baseType: null`; generation never assigns it automatically.
All roll traces use the existing `DiceRoll` shape (individual faces, modifier,
sides/count, and total). The item-selection die's face is its one-based position
in the matching pool, in catalog order.

RNG consumption order is currency selector → amount dice → hoard appearance →
rarity → non-Common treatment → uniform item selection. Empty individual currency
skips amount dice; individuals skip magic entirely; appearance failure skips all
later magic rolls; Common skips treatment (`treatmentRoll: null`). At most one
magic item is returned, and separate generations can return duplicates.

Invalid treasure types or non-callable RNGs throw `TypeError`; invalid CR bands or
RNG samples throw `RangeError`. An invalid catalog, missing currency row/table, or
empty eligible pool throws a descriptive error. Hoards validate the catalog before
consuming RNG samples. No branch silently rerolls or substitutes another pool.
The engine remains independent of UI, persistence, pricing, denomination conversion,
and party-size input.

## Mobile treasure generator

The existing home route renders `src/features/treasure/TreasureGeneratorScreen.tsx`
and calls `generateTreasure` directly. Choose **Individual** or **Grupo**, select
one of the four CR bands, and tap **Gerar Tesouro**. **Gerar Novamente** repeats
generation using the current choices. Changing a selector clears the previous
result so it cannot be mistaken for a result from the new configuration.

The interface follows the approved yellow-accent reference: neutral surfaces,
rounded cards, segmented controls, and simple monochrome icons. It shows exactly
one currency denomination and at most one hoard magic item. Empty currency,
no-magic outcomes, generation errors, attunement requirements, and unspecified
equipment base types have explicit messages. UI text is Portuguese; official SRD
item names remain in English. PC/PP/PE/PO/PL denote copper/silver/electrum/gold/
platinum pieces; the engine's original denominations and quantities are preserved.

Use the header's appearance button to select **Sistema**, **Claro**, or **Escuro**.
System is the default and follows live OS changes. Manual overrides last only for
the current app session. Theme state lives above the route in `ThemeProvider`;
`src/theme/tokens.ts` defines both palettes, contrast, selected states, spacing,
type sizes, corners, and shadows. Native safe areas, scrolling, a centered tablet
width, 48-point touch targets, labeled radios, and expandable states support use
during a session. SRD attribution and license links are accessible from the footer.

**Filtros do Mestre** is an informational accordion before generation. The
`MasterFilters` component accepts future controls through its `children` extension
point. It currently applies no filters and exposes no switches or fake options.
Currency inclusion, item inclusion, rarity restrictions, and budgets need separate
product approval and engine API work before controls can be connected. No existing
generation probabilities, catalog membership, or economic tables were changed.

The only added application dependency is `expo-system-ui`, using the version
recommended by the installed Expo SDK. Expo requires it for Android development
builds to honor [`userInterfaceStyle: automatic`](https://docs.expo.dev/develop/user-interface/color-themes/).
No web, icon, animation, storage, or UI-testing dependency was added to the project.

Validation includes the existing 132 engine/data tests and the normal TypeScript,
ESLint, and whitespace checks. The Android production bundle and Expo config
introspection were also checked. A temporary React Native Web harness exercised
the actual screen and engine in Chromium at 320/360/390/768 px, including real
deterministic results, error/retry, theme switching, session reset, accessibility
states, and touch targets. Preview-only tooling is outside this repository.
The [light](docs/screenshots/treasure-generator-light.png) and
[dark](docs/screenshots/treasure-generator-dark.png) screenshots are mobile web
previews of the actual components, not Android emulator captures. On-device
Android/iOS, TalkBack/VoiceOver, and native font scaling still require device QA.

For device review: run the app in Expo Go or a development build, exercise both
treasure types and all CR bands, change OS appearance with System selected, verify
manual overrides and reset after a cold start, then check scrolling and larger
system text with a screen reader. No treasure history or appearance preference is
persisted.

## Project structure

```text
app/
  _layout.tsx       Root navigation layout
  index.tsx         Home route
src/
  components/      Shared controls, cards, and native icon primitives
  features/treasure/ Generator screen, result card, and filter extension point
  lib/             Framework-independent utilities and their unit tests
  theme/           Session appearance provider and reusable theme tokens
app.json           Expo application configuration
eslint.config.js   ESLint configuration
tsconfig.json      Strict TypeScript configuration
```

Keep routes in `app/`, screen components in `src/features/`, and generation logic
in `src/lib/treasure/` so UI changes do not change the approved engine or data.

Expo manages native project generation. Generated `android/`, `ios/`, local Expo
state, and dependencies are excluded from version control. Use Expo-compatible
package versions when adding dependencies, for example with `npx expo install`.
