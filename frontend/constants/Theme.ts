import { StyleSheet } from 'react-native';

export const Colors = {
  background:    '#FAFAFA',   // Cleaner, minimal background
  card:          '#FFFFFF',   // Pure white surfaces
  primary:       '#000000',   // Elegant black as primary for extreme contrast
  secondary:     '#10B981',   // Energetic emerald fitness accent
  text:          '#111827',   // Sharp charcoal for text
  textSecondary: '#6B7280',   // Gray-500 for secondary text
  error:         '#EF4444',   // Standard Red
  border:        '#E5E7EB',   // Gray-200 for subtle borders
  inputBg:       '#F3F4F6',   // Gray-100 for inputs
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
    borderRadius: 24, // Softer, more modern corners
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontWeight: '500',
    lineHeight: 22,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: SPACING.lg,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent', // Focus states will handle borders
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  linkText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: 15,
    fontWeight: '600',
  },
});
