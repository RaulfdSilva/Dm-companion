import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { SectionCard } from '../../components/SectionCard';
import { CR_BANDS } from '../../lib/treasure/currency';
import type { TreasureResult } from '../../lib/treasure/generate';
import type { AttunementRequirement } from '../../lib/treasure/magic-items';
import { useAppTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';

const denominations = {
  CP: { short: 'PC', label: 'Peças de cobre' }, SP: { short: 'PP', label: 'Peças de prata' },
  EP: { short: 'PE', label: 'Peças de electro' }, GP: { short: 'PO', label: 'Peças de ouro' },
  PP: { short: 'PL', label: 'Peças de platina' },
} as const;
const rarities = { common: 'Comum', uncommon: 'Incomum', rare: 'Raro', 'very-rare': 'Muito raro' } as const;
const classes = { Bard: 'Bardo', Cleric: 'Clérigo', Druid: 'Druida', Sorcerer: 'Feiticeiro', Warlock: 'Bruxo', Wizard: 'Mago' } as const;

function attunementLabel(requirement: AttunementRequirement): string {
  switch (requirement.kind) {
    case 'none': return 'Não requer sintonização';
    case 'required': return 'Requer sintonização';
    case 'spellcaster': return 'Sintonização por conjurador';
    case 'class': return `Sintonização: ${requirement.classes.map((name) => classes[name]).join(', ')}`;
  }
}

export function ResultCard({ result }: { result: TreasureResult | null }) {
  const { colors } = useAppTheme();
  const band = result ? CR_BANDS.find((candidate) => candidate.id === result.crBand) : null;
  const currency = result?.currency;
  const item = result?.magic?.kind === 'item' ? result.magic.item : null;
  const body = { color: colors.muted, fontSize: tokens.type.label, lineHeight: 21 };
  return (
    <View accessibilityLiveRegion="polite" aria-live="polite">
      <SectionCard title="Resultado" icon="chest">
        {!result || !currency ? (
          <Text style={[body, styles.placeholder]}>Escolha o tipo e a faixa de CR. O resultado aparecerá aqui após gerar.</Text>
        ) : (
          <>
            <Text style={body}>{result.type === 'hoard' ? 'Grupo' : 'Individual'} · CR {band?.min}{band?.max === null ? '+' : `–${band?.max}`}</Text>
            <View style={[styles.reward, { backgroundColor: colors.reward }]}>
              <Icon name="coins" color={colors.accentText} size={28} />
              <View style={styles.details}>
                <Text style={[styles.label, { color: colors.text }]}>Moedas</Text>
                {currency.kind === 'empty' ? (
                  <>
                    <Text style={[styles.itemName, { color: colors.text }]}>Tesouro vazio</Text>
                    <Text style={body}>Nenhuma moeda encontrada.</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.amount, { color: colors.text }]}>
                      {currency.quantity.toLocaleString('pt-BR')} <Text style={styles.unit}>{denominations[currency.denomination].short}</Text>
                    </Text>
                    <Text style={body}>{denominations[currency.denomination].label}</Text>
                  </>
                )}
              </View>
            </View>
            {result.type === 'hoard' ? (
              <View style={[styles.reward, { backgroundColor: item ? colors.reward : colors.control }]}>
                <Icon name="magic" color={colors.accentText} size={28} />
                <View style={styles.details}>
                  <Text style={[styles.label, { color: colors.text }]}>Item mágico</Text>
                  {item ? (
                    <>
                      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={body}>{rarities[item.rarity]} · {item.treatment === 'consumable' ? 'Consumível' : 'Permanente'}</Text>
                      <Text style={body}>{attunementLabel(item.attunement)}</Text>
                      {item.equipment && <Text style={body}>Tipo básico não definido. O mestre pode escolhê-lo depois.</Text>}
                      <Text style={[styles.source, { color: colors.muted }]}>SRD 5.2.1 · p. {item.source.page}</Text>
                    </>
                  ) : <Text style={body}>Nenhum item mágico neste tesouro.</Text>}
                </View>
              </View>
            ) : <Text style={body}>Tesouros individuais contêm apenas moedas.</Text>}
          </>
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { paddingVertical: tokens.spacing.lg },
  reward: { borderRadius: tokens.radius.control, padding: tokens.spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing.md },
  details: { flex: 1, gap: tokens.spacing.xs },
  label: { fontSize: tokens.type.body, fontWeight: '700' },
  amount: { fontSize: tokens.type.amount, fontWeight: '700', fontVariant: ['tabular-nums'] },
  unit: { fontSize: tokens.type.section },
  itemName: { fontSize: tokens.type.body, fontWeight: '600', lineHeight: 24 },
  source: { fontSize: tokens.type.caption, marginTop: tokens.spacing.xs },
});
