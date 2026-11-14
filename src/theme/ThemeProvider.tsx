import { createContext, useContext, useState, type ReactNode } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';

import { palettes, type AppearancePreference, type ThemeColors } from './tokens';

interface ThemeContextValue {
  readonly colors: ThemeColors;
  readonly scheme: 'light' | 'dark';
  readonly preference: AppearancePreference;
  readonly setPreference: (value: AppearancePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<AppearancePreference>('system');
  const scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const colors = palettes[scheme];
  return (
    <ThemeContext.Provider value={{ colors, scheme, preference, setPreference }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme requires ThemeProvider');
  return theme;
}
