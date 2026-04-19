import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/tokens';

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={colors.bgPrimary} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
