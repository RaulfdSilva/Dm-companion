import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          DM Companion
        </Text>
        <Text style={styles.subtitle}>Treasure Generator — Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    color: '#24211E',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#5C554E',
    fontSize: 16,
    textAlign: 'center',
  },
});
