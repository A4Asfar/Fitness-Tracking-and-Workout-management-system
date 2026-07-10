import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dumbbell, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
  title: string;
  description: string;
  motivationalText?: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
  accentColor?: string;
}

export default function EmptyState({
  title,
  description,
  motivationalText = "Every journey begins with a single step.",
  buttonLabel,
  onButtonPress,
  accentColor = '#10B981'
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[accentColor + '10', 'transparent']}
        style={styles.iconRing}
      >
        <View style={[styles.iconInner, { borderColor: accentColor + '20' }]}>
          <Dumbbell size={36} color={accentColor} strokeWidth={1.5} />
        </View>
      </LinearGradient>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.motivation}>"{motivationalText}"</Text>

      {buttonLabel && onButtonPress && (
        <TouchableOpacity
          onPress={onButtonPress}
          activeOpacity={0.8}
          style={styles.btnWrapper}
        >
          <LinearGradient
            colors={[accentColor, accentColor + 'D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.btnText}>{buttonLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    marginVertical: 12,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 240,
  },
  motivation: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
  },
  btnWrapper: {
    width: '100%',
    maxWidth: 200,
  },
  btn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
