import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  // Base Backgrounds
  background:    '#0F172A',   // Deep Slate (Global Screen BG)
  card:          '#1E293B',   // Dark Charcoal (Cards & Modals)
  
  // Accents & Interactive
  primary:       '#38BDF8',   // Glowing Blue (Interactive Primary)
  primaryDark:   '#0284C7',   // Dark Blue Gradient End
  secondary:     '#10B981',   // Emerald (Success & Call to action)
  secondaryDark: '#059669',   // Dark Emerald Gradient End
  accent:        '#D4AF37',   // Gold (Premium elements)
  accentDark:    '#B48A28',   // Dark Gold Gradient End
  
  // Text
  text:          '#F8FAFC',   // Pure White (Titles)
  textSecondary: '#94A3B8',   // Muted Slate (Descriptions)
  textMuted:     '#64748B',   // Heavy Muted (Placeholders/Icons)
  
  // Status & System
  error:         '#EF4444',   // Ruby Red (Destructive)
  errorBg:       'rgba(239,68,68,0.1)',
  border:        'rgba(255,255,255,0.05)', // Extremely subtle glass border
  inputBg:       '#0F172A',   // Deep dark for inset forms
  
  // Glassmorphism overlays
  overlay:       'rgba(15,23,42,0.85)'
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  glowPrimary: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glowAccent: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }
};

export const SharedStyles = StyleSheet.create({
  // LAYOUT
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentPad: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  
  // CARDS
  card: {
    backgroundColor: Colors.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOWS.md,
  },

  // TYPOGRAPHY
  titleHero: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // FORMS & INPUTS
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: RADIUS.lg,
    height: 56,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: SPACING.md,
  },
  inputField: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },

  // BUTTONS
  buttonPrimary: {
    height: 56,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    ...SHADOWS.glowPrimary,
  },
  buttonTextPrimary: {
    color: '#FFFFFF', // Keep white for high contrast on colored buttons
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    height: 56,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonTextSecondary: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  // BADGES
  badgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  badgePremiumText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // EMPTY STATES
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
  }
});
