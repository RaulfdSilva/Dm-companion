import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { useAppTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';

/** Pre-generation extension point. Future controls belong in children only after
 * their generation rules and API have owner approval. No filter state exists yet. */
export function MasterFilters({ children }: { children?: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useAppTheme();
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel="Filtros do Mestre" accessibilityState={{ expanded }} aria-expanded={expanded}
        onPress={() => setExpanded(!expanded)} style={styles.toggle}>
        <Text style={[styles.title, { color: colors.muted }]}>Filtros do Mestre</Text>
        <Icon name={expanded ? 'up' : 'down'} color={colors.muted} size={20} />
      </Pressable>
      {expanded && (
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {children ?? <Text style={[styles.description, { color: colors.muted }]}>Os filtros personalizados chegarão em uma próxima versão. Nenhum filtro adicional é aplicado.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { minHeight: tokens.touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4 },
  title: { fontSize: tokens.type.label, fontWeight: '600', flexShrink: 1 },
  content: { borderWidth: 1, borderRadius: tokens.radius.control, padding: tokens.spacing.md, marginBottom: tokens.spacing.sm },
  description: { fontSize: tokens.type.label, lineHeight: 21 },
});
