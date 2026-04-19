/**
 * Surmount Design System — React Native token bridge
 *
 * Values sourced from shawnji33/design-system-surmount tokens/tokens.css.
 * Update this file when the design system tokens change.
 */

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bgPrimary:          '#ffffff',
  bgSecondary:        '#fafafa',
  bgTertiary:         '#f5f5f5',
  bgPrimaryHover:     '#fafafa',
  bgSecondaryHover:   '#f5f5f5',
  bgDisabled:         '#f5f5f5',
  bgActive:           '#fafafa',
  bgOverlay:          '#0a0c12',

  // Brand backgrounds
  bgBrandPrimary:     '#f1f6fd',   // brand-50
  bgBrandSecondary:   '#e0eaf9',   // brand-100
  bgBrandSolid:       '#406ad0',   // brand-600
  bgBrandSolidHover:  '#3757be',   // brand-700
  bgBrandSection:     '#32499b',   // brand-800

  // State backgrounds
  bgErrorPrimary:     '#fbf5f5',
  bgErrorSecondary:   '#f9eceb',
  bgWarningPrimary:   '#fef7ee',
  bgSuccessPrimary:   '#eef7ee',
  bgSuccessSecondary: '#e4f4e5',

  // Text
  textPrimary:        '#181d27',   // fg-primary-900
  textSecondary:      'rgba(10,13,18,0.70)',  // text-secondary-700
  textTertiary:       'rgba(10,13,18,0.60)',  // text-tertiary-600
  textQuaternary:     'rgba(10,13,18,0.50)',  // text-quaternary-500
  textDisabled:       'rgba(10,13,18,0.40)',
  textPlaceholder:    'rgba(10,13,18,0.40)',
  textWhite:          '#ffffff',
  textBrand:          '#406ad0',   // brand-600
  textBrandSecondary: '#3757be',   // brand-700
  textError:          '#b6544c',   // error-600
  textSuccess:        '#3b7e3f',   // success-600
  textWarning:        '#de5b18',   // warning-600
  textOnBrand:        '#ffffff',

  // Foreground / icons
  fgPrimary:          '#181d27',
  fgSecondary:        '#414651',
  fgTertiary:         '#535861',
  fgQuaternary:       '#a3a7ae',
  fgDisabled:         '#a3a7ae',
  fgBrand:            '#406ad0',
  fgError:            '#b6544c',
  fgSuccess:          '#3b7e3f',
  fgWarning:          '#de5b18',
  fgWhite:            '#ffffff',

  // Borders (alpha)
  borderPrimary:      'rgba(0,0,0,0.086)',  // ~#00000016
  borderSecondary:    'rgba(0,0,0,0.063)',  // ~#00000010
  borderTertiary:     'rgba(0,0,0,0.039)',  // ~#0000000a
  borderBrand:        '#5585dc',
  borderError:        '#cb6f68',
  borderErrorSubtle:  '#eabbb7',
  borderDisabled:     'rgba(0,0,0,0.020)',
  borderDisabledSubtle: '#e9e9eb',

  // Brand palette (direct access when needed)
  brand25:  '#f7faff',
  brand50:  '#f1f6fd',
  brand100: '#e0eaf9',
  brand200: '#c8dbf5',
  brand300: '#8eb8eb',
  brand400: '#75a5e5',
  brand500: '#5585dc',
  brand600: '#406ad0',
  brand700: '#3757be',
  brand800: '#32499b',

  // Gray palette
  gray25:  '#fcfcfc',
  gray50:  '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e9e9eb',
  gray300: '#d5d6d9',
  gray400: '#a3a7ae',
  gray500: '#717680',
  gray600: '#535861',
  gray700: '#414651',
  gray800: '#252b37',
  gray900: '#181d27',

  // Status
  error600:   '#b6544c',
  error700:   '#98443d',
  success600: '#3b7e3f',
  success700: '#316434',
  warning600: '#de5b18',
  warning700: '#b84416',

  // Utility (for badge/tag colors)
  utilityBrand50:    '#f1f6fd',
  utilityBrand200:   '#c8dbf5',
  utilityBrand600:   '#406ad0',
  utilityBrand700:   '#3757be',
  utilityError50:    '#fbf5f5',
  utilityError200:   '#f3d7d5',
  utilityError600:   '#b6544c',
  utilitySuccess50:  '#eef7ee',
  utilitySuccess200: '#cbe7cc',
  utilitySuccess600: '#3b7e3f',
  utilityWarning50:  '#fef7ee',
  utilityWarning200: '#f9d7af',
  utilityWarning600: '#de5b18',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  none: 0,
  xxs:  2,
  xs:   4,
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 64,
  '8xl': 80,
  '9xl': 96,
  // Fractional
  '2-5': 10,
  '3-5': 14,
  '4-5': 18,
} as const;

// ─── Border radius ───────────────────────────────────────────────────────────

export const radius = {
  none: 0,
  xxs:  2,
  xs:   4,
  sm:   6,
  md:   8,
  lg:   10,
  xl:   12,
  '2xl': 16,
  '3xl': 20,
  '4xl': 24,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const fontSize = {
  // Text scale
  textXxs: 10,
  textXs:  12,
  textSm:  14,
  textMd:  16,
  textLg:  18,
  textXl:  20,
  // Display scale
  displayXxxs: 18,
  displayXxs:  20,
  displayXs:   24,
  displaySm:   28,
  displayMd:   32,
  displayLg:   40,
  displayXl:   48,
  display2xl:  72,
} as const;

export const lineHeight = {
  textXxs: 14,
  textXs:  18,
  textSm:  20,
  textMd:  24,
  textLg:  28,
  textXl:  30,
  displayXs:  32,
  displaySm:  38,
  displayMd:  40,
  displayLg:  52,
} as const;

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
} as const;

// Font families — use these string values in StyleSheet
export const fontFamily = {
  body:    'Geist',
  display: 'Inter',
} as const;

// ─── Shadows (React Native format) ───────────────────────────────────────────

export const shadow = {
  xs: {
    shadowColor: '#0a0d12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0a0d12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0a0d12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0a0d12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;
