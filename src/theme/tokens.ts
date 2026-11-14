export const tokens = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32 },
  radius: { control: 12, card: 16, pill: 999 },
  type: { caption: 12, label: 14, body: 16, button: 17, section: 18, title: 26, amount: 32 },
  touchTarget: 48,
  contentWidth: 600,
  shadow: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
} as const;

export const palettes = {
  light: {
    background: '#FAF7F1', surface: '#FFFCF7', control: '#F0ECE5',
    text: '#20211E', muted: '#62635B', border: '#E5DFD3',
    accent: '#FFCC00', onAccent: '#211C00', accentText: '#795700',
    reward: '#FFF4D2', outline: '#AC7B0B', shadow: '#352E1D',
    error: '#FFF0EC', errorText: '#9D3024', errorBorder: '#D6897E',
  },
  dark: {
    background: '#121310', surface: '#1B1D19', control: '#292C26',
    text: '#F7F5EF', muted: '#BEC2B5', border: '#383D32',
    accent: '#FFCC00', onAccent: '#211C00', accentText: '#F4CE53',
    reward: '#352C14', outline: '#D9B436', shadow: '#000000',
    error: '#38201D', errorText: '#FFB5A7', errorBorder: '#99594D',
  },
} as const;

export type ThemeColors = { readonly [K in keyof typeof palettes.light]: string };
export type AppearancePreference = 'system' | 'light' | 'dark';
