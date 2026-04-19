import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../constants/tokens';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {/* Logo mark */}
        <View style={styles.logoMark} />

        {/* Wordmark + tagline */}
        <View style={styles.wordmarkBlock}>
          <Text style={styles.wordmark}>Surmount</Text>
          <Text style={styles.tagline}>Your portfolio, professionally managed.</Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaBlock}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
          >
            <Text style={styles.btnPrimaryText}>Get started</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnSecondaryPressed]}
          >
            <Text style={styles.btnSecondaryText}>Sign in</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        By continuing, you agree to our Terms and Privacy Policy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: spacing['4xl'],
    paddingTop: 100,
    paddingBottom: spacing['5xl'],
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing['4xl'],
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgBrandSolid,
  },
  wordmarkBlock: {
    gap: spacing.sm,
  },
  wordmark: {
    fontSize: fontSize.displaySm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: -0.75,
  },
  tagline: {
    fontSize: fontSize.textMd,
    fontWeight: fontWeight.regular,
    color: colors.textTertiary,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  ctaBlock: {
    gap: spacing.md,
  },
  btnPrimary: {
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.bgBrandSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryPressed: {
    backgroundColor: colors.bgBrandSolidHover,
  },
  btnPrimaryText: {
    fontSize: fontSize.textMd,
    fontWeight: fontWeight.semibold,
    color: colors.textWhite,
    letterSpacing: -0.3,
  },
  btnSecondary: {
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryPressed: {
    backgroundColor: colors.bgSecondary,
  },
  btnSecondaryText: {
    fontSize: fontSize.textMd,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: fontSize.textXs,
    color: colors.textQuaternary,
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
});
