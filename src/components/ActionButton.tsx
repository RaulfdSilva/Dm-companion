import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { Icon, type IconName } from './Icon';

export function ActionButton({ label, icon, onPress, outlined = false }: {
  label: string; icon: IconName; onPress: () => void; outlined?: boolean;
}) {
  const { colors } = useAppTheme();
  const color = outlined ? colors.accentText : colors.onAccent;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: outlined ? 'transparent' : colors.accent,
        borderColor: outlined ? colors.outline : colors.accent, opacity: pressed ? 0.8 : 1 }]}>
      <Icon name={icon} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderWidth: 1.5, borderRadius: tokens.radius.control,
    padding: tokens.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing.sm },
  label: { fontSize: tokens.type.button, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
});
