# DM Companion

A mobile toolkit for Dungeon Masters running Dungeons & Dragons with the 2024 rules.

This initial setup provides an Expo application with React Native, strict TypeScript,
and Expo Router. The home screen displays **DM Companion** and
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
npm run typecheck
npm run lint
```

TypeScript runs in strict mode. ESLint uses Expo's recommended configuration and
treats warnings as failures.

## Project structure

```text
app/
  _layout.tsx       Root navigation layout
  index.tsx         Home route
src/
  components/      Shared UI components, when needed
  features/        Future feature-specific screens, components, and logic
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
