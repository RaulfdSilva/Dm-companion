import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';

interface Props<T extends string> {
  readonly label: string;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  const { colors } = useAppTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }} aria-checked={selected}
            onPress={() => { if (!selected) onChange(option.value); }}
            style={({ pressed }) => [styles.option, {
              backgroundColor: selected ? colors.accent : colors.control,
              borderColor: selected ? colors.accent : colors.border,
              opacity: pressed ? 0.8 : 1,
            }]}>
            <Text style={[styles.label, { color: selected ? colors.onAccent : colors.text, fontWeight: selected ? '700' : '500' }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: tokens.spacing.sm },
  option: { flex: 1, minHeight: tokens.touchTarget, paddingHorizontal: 6, paddingVertical: tokens.spacing.md,
    alignItems: 'center', justifyContent: 'center', borderRadius: tokens.radius.control, borderWidth: 1 },
  label: { fontSize: tokens.type.body, textAlign: 'center' },
});
