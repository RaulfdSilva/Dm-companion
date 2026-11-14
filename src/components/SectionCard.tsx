import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { Icon, type IconName } from './Icon';

export function SectionCard({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, tokens.shadow, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.heading}>
        <Icon name={icon} color={colors.accentText} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: tokens.radius.card, padding: tokens.spacing.md, gap: tokens.spacing.md },
  heading: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  title: { flex: 1, fontSize: tokens.type.section, fontWeight: '700' },
});
