import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '../../components/ActionButton';
import { Icon } from '../../components/Icon';
import { SectionCard } from '../../components/SectionCard';
import { SegmentedControl } from '../../components/SegmentedControl';
import { CR_BANDS, type CrBandId, type TreasureType } from '../../lib/treasure/currency';
import { generateTreasure, type TreasureResult } from '../../lib/treasure/generate';
import { AppearanceSettings } from '../../theme/AppearanceSettings';
import { useAppTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';
import { MasterFilters } from './MasterFilters';
import { ResultCard } from './ResultCard';
import { SrdCredits } from './SrdCredits';

const bandOptions = CR_BANDS.map((band) => ({ value: band.id, label: band.max === null ? `${band.min}+` : `${band.min}–${band.max}` }));

export default function TreasureGeneratorScreen() {
  const { colors } = useAppTheme();
  const [type, setType] = useState<TreasureType>('individual');
  const [crBand, setCrBand] = useState<CrBandId>('cr-0-4');
  const [result, setResult] = useState<TreasureResult | null>(null);
  const [error, setError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function resetResult() { setResult(null); setError(false); }
  function generate() {
    try { setResult(generateTreasure(type, crBand)); setError(false); }
    catch { setResult(null); setError(true); }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text accessibilityRole="header" style={[styles.brand, { color: colors.text }]}>DM Companion</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={settingsOpen ? 'Fechar configurações de aparência' : 'Abrir configurações de aparência'}
              accessibilityState={{ expanded: settingsOpen }} aria-expanded={settingsOpen} onPress={() => setSettingsOpen(!settingsOpen)} style={styles.settings}>
              <Icon name="settings" color={colors.text} />
            </Pressable>
          </View>
          {settingsOpen && <AppearanceSettings />}
          <View style={styles.pageHeading}>
            <Icon name="dice" color={colors.accentText} size={36} />
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Gerador de Tesouros</Text>
          </View>
          <SectionCard title="Tipo de tesouro" icon="coins">
            <SegmentedControl<TreasureType> label="Tipo de tesouro" value={type}
              options={[{ value: 'individual', label: 'Individual' }, { value: 'hoard', label: 'Grupo' }]}
              onChange={(next) => { setType(next); resetResult(); }} />
            <Text style={[styles.hint, { color: colors.muted }]}>{type === 'hoard' ? 'Uma recompensa para todo o grupo.' : 'Moedas de uma criatura.'}</Text>
          </SectionCard>
          <SectionCard title="Classe de Desafio (CR)" icon="chart">
            <SegmentedControl<CrBandId> label="Faixa de Classe de Desafio" value={crBand} options={bandOptions}
              onChange={(next) => { setCrBand(next); resetResult(); }} />
          </SectionCard>
          <MasterFilters />
          <ActionButton label="Gerar Tesouro" icon="dice" onPress={generate} />
          {error ? (
            <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.error, borderColor: colors.errorBorder }]}>
              <Text style={[styles.errorTitle, { color: colors.errorText }]}>Não foi possível gerar o tesouro.</Text>
              <Text style={[styles.hint, { color: colors.errorText }]}>Tente gerar novamente.</Text>
            </View>
          ) : <ResultCard result={result} />}
          {(result || error) && <ActionButton label="Gerar Novamente" icon="refresh" outlined onPress={generate} />}
          <SrdCredits />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: tokens.spacing.lg, paddingBottom: tokens.spacing.xxl },
  content: { width: '100%', maxWidth: tokens.contentWidth, alignSelf: 'center', gap: tokens.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: tokens.spacing.xs },
  brand: { fontSize: 20, fontWeight: '700', flexShrink: 1 },
  settings: { minWidth: tokens.touchTarget, minHeight: tokens.touchTarget, alignItems: 'center', justifyContent: 'center' },
  pageHeading: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md, paddingVertical: tokens.spacing.sm },
  title: { flex: 1, fontSize: tokens.type.title, fontWeight: '700' },
  hint: { fontSize: tokens.type.label, lineHeight: 21 },
  error: { borderWidth: 1, borderRadius: tokens.radius.card, padding: tokens.spacing.lg, gap: tokens.spacing.sm },
  errorTitle: { fontSize: tokens.type.body, fontWeight: '700' },
});
