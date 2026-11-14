import { StyleSheet, Text } from 'react-native';

import { SectionCard } from '../components/SectionCard';
import { SegmentedControl } from '../components/SegmentedControl';
import { useAppTheme } from './ThemeProvider';
import { tokens, type AppearancePreference } from './tokens';

export function AppearanceSettings() {
  const { colors, preference, scheme, setPreference } = useAppTheme();
  return (
    <SectionCard title="Aparência" icon="settings">
      <SegmentedControl<AppearancePreference> label="Tema do aplicativo" value={preference} onChange={setPreference}
        options={[{ value: 'system', label: 'Sistema' }, { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }]} />
      <Text style={[styles.hint, { color: colors.muted }]}>
        {preference === 'system' ? `Seguindo o dispositivo: modo ${scheme === 'dark' ? 'escuro' : 'claro'}.` : 'Sua escolha vale durante esta sessão.'}
      </Text>
    </SectionCard>
  );
}

const styles = StyleSheet.create({ hint: { fontSize: tokens.type.label, lineHeight: 21 } });
