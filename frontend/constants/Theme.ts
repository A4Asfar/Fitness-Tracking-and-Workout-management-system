import { StyleSheet } from 'react-native';

export const Colors = {
  background:    '#F8FAFC',   // Modern neutral background (Slate-50)
  card:          '#FFFFFF',   // White surfaces
  primary:       '#10B981',   // Premium emerald/green accent
  secondary:     '#F97316',   // Orange accent for CTA
  text:          '#0F172A',   // Slate-900
  textSecondary: '#64748B',   // Slate-500
  error:         '#EF4444',   // Red
  border:        '#E2E8F0',   // Slate-200
  inputBg:       '#FFFFFF',   // White
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontWeight: '600',
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  linkText: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: 14,
    fontWeight: '700',
  },
});
