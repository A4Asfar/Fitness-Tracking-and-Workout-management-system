import { StyleSheet } from 'react-native';

export const Colors = {
  background:    '#0A0A0A',
  card:          '#181818',
  primary:       '#CCFF00',   // Neon Green
  secondary:     '#39FF14',
  text:          '#FFFFFF',
  textSecondary: '#8A8A8A',
  error:         '#FF4444',
  border:        '#242424',
  inputBg:       '#1E1E1E',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SharedStyles = StyleSheet.create({
  /* ── Full-screen container ── */
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* ── Section card ── */
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 14,
  },

  /* ── Screen-level title ── */
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.8,
    lineHeight: 34,
  },

  /* ── Screen-level subtitle ── */
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  /* ── Text input ── */
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },

  /* ── Primary action button ── */
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },

  /* ── Button label ── */
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  /* ── Inline text link ── */
  linkText: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

