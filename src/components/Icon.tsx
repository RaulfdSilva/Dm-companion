import { StyleSheet, Text, View } from 'react-native';

export type IconName = 'dice' | 'coins' | 'chart' | 'chest' | 'magic' | 'refresh' | 'settings' | 'down' | 'up';

/** Small monochrome marks built from native primitives; no icon/font dependency. */
export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {name === 'chart' ? (
        <View style={styles.bars}>
          {[10, 20, 15].map((height, index) => <View key={index} style={{ width: 4, height, backgroundColor: color }} />)}
        </View>
      ) : name === 'coins' ? (
        <View style={styles.coinStack}>
          {[{ left: 2, top: 11 }, { left: 10, top: 6 }, { left: 10, top: 1 }].map((position, index) => (
            <View key={index} style={[styles.coin, position, { borderColor: color }]} />
          ))}
        </View>
      ) : name === 'chest' ? (
        <View style={[styles.chest, { borderColor: color }]}>
          <View style={{ borderTopWidth: 2, borderColor: color, width: '100%', marginTop: 5 }} />
          <View style={[styles.lock, { backgroundColor: color }]} />
        </View>
      ) : (
        <Text accessible={false} style={{ color, fontSize: name === 'dice' ? size + 3 : size, lineHeight: size + 6, textAlign: 'center' }}>
          {{ dice: '⬡', magic: '✦', refresh: '↻', settings: '⋮', down: '⌄', up: '⌃' }[name]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  coinStack: { width: 26, height: 24 },
  coin: { position: 'absolute', width: 15, height: 10, borderWidth: 2, borderRadius: 8 },
  chest: { width: 23, height: 18, borderWidth: 2, borderRadius: 4 },
  lock: { position: 'absolute', left: 8, top: 5, width: 4, height: 6, borderRadius: 1 },
});
