import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Theme';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon: Icon,
  style,
  textStyle
}: ButtonProps) {
  
  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: [s.container, s.secondary, style],
          text: [s.text, s.secondaryText, textStyle],
          loaderColor: Colors.primary
        };
      case 'outlined':
        return {
          container: [s.container, s.outlined, style],
          text: [s.text, s.outlinedText, textStyle],
          loaderColor: Colors.text
        };
      case 'danger':
        return {
          container: [s.container, s.danger, style],
          text: [s.text, s.dangerText, textStyle],
          loaderColor: '#FFF'
        };
      default:
        return {
          container: [s.container, s.primary, style],
          text: [s.text, s.primaryText, textStyle],
          loaderColor: '#FFF'
        };
    }
  };

  const { container, text, loaderColor } = getStyles();

  return (
    <TouchableOpacity
      style={[container, disabled && s.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <>
          {Icon && <Icon size={20} color={(StyleSheet.flatten(text) as any).color?.toString()} style={s.icon} />}
          <Text style={text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryText: {
    color: '#FFF',
  },
  
  secondary: {
    backgroundColor: '#F3F4F6', // Subtle Gray
  },
  secondaryText: {
    color: Colors.text,
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  outlinedText: {
    color: Colors.text,
  },

  danger: {
    backgroundColor: Colors.error,
  },
  dangerText: {
    color: '#FFF',
  }
});
