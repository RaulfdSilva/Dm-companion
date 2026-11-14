import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { MAGIC_ITEM_SOURCE } from '../../lib/treasure/magic-items';
import { useAppTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';

export function SrdCredits() {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const [linkError, setLinkError] = useState(false);
  async function open(url: string) {
    try { await Linking.openURL(url); setLinkError(false); } catch { setLinkError(true); }
  }
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel="Créditos do conteúdo SRD" accessibilityState={{ expanded }} aria-expanded={expanded}
        onPress={() => setExpanded(!expanded)} style={styles.toggle}>
        <Text style={[styles.caption, { color: colors.muted }]}>SRD 5.2.1 · CC BY 4.0</Text>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          <Text style={[styles.caption, { color: colors.muted }]}>{MAGIC_ITEM_SOURCE.attribution}</Text>
          <Text style={[styles.caption, { color: colors.muted }]}>Nomes e metadados foram selecionados e organizados. A classificação e as distribuições de tesouro são decisões do DM Companion. A licença inclui a isenção de garantias e limitação de responsabilidade da seção 5.</Text>
          <Pressable accessibilityRole="link" onPress={() => void open(MAGIC_ITEM_SOURCE.url)} style={styles.link}>
            <Text style={{ color: colors.accentText, fontSize: tokens.type.label }}>Abrir SRD 5.2.1</Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => void open(MAGIC_ITEM_SOURCE.licenseUrl)} style={styles.link}>
            <Text style={{ color: colors.accentText, fontSize: tokens.type.label }}>Ler licença CC BY 4.0</Text>
          </Pressable>
          {linkError && <Text accessibilityRole="alert" style={{ color: colors.errorText }}>Não foi possível abrir o link. Tente novamente.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { minHeight: tokens.touchTarget, alignItems: 'center', justifyContent: 'center' },
  caption: { fontSize: tokens.type.caption, lineHeight: 19 },
  content: { gap: tokens.spacing.sm, paddingHorizontal: tokens.spacing.xs },
  link: { minHeight: tokens.touchTarget, justifyContent: 'center' },
});
