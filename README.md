# DM Companion

A mobile toolkit for Dungeon Masters running Dungeons & Dragons with the 2024 rules.

The application uses Expo with React Native, strict TypeScript, and Expo Router,
and includes a reusable TypeScript dice engine. The home screen displays **DM Companion** and
**Treasure Generator — Coming Soon**. Treasure generation and other gameplay tools
are planned for future work; no backend, authentication, or database is included.

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
or rolls. Armor, +3 is Legendary and excluded. No random selection, treasure
generation, equipment-selection interface, or item mechanics are implemented.

## Project structure

```text
app/
  _layout.tsx       Root navigation layout
  index.tsx         Home route
src/
  components/      Shared UI components, when needed
  features/        Future feature-specific screens, components, and logic
  lib/             Framework-independent utilities and their unit tests
app.json           Expo application configuration
eslint.config.js   ESLint configuration
tsconfig.json      Strict TypeScript configuration
```

Keep routes in `app/` and feature implementations in `src/features/` as features
are added. The empty source directories are reserved for future work; no shared
abstractions are required yet.

Expo manages native project generation. Generated `android/`, `ios/`, local Expo
state, and dependencies are excluded from version control. Use Expo-compatible
package versions when adding dependencies, for example with `npx expo install`.
