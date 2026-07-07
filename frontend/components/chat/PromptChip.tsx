import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PromptChipProps {
  label: string;
  onPress: () => void;
}

export default function PromptChip({
  label,
  onPress
}: PromptChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.chip}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  text: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
});
