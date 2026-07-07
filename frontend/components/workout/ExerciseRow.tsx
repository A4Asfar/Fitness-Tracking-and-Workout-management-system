import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';

interface ExerciseRowProps {
  name: string;
  detail?: string;
  completed: boolean;
  onToggle: () => void;
  accentColor?: string;
}

export default function ExerciseRow({
  name,
  detail,
  completed,
  onToggle,
  accentColor = '#7C4DFF'
}: ExerciseRowProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[
        styles.row,
        completed && { backgroundColor: '#F8FAFC' }
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.name, completed && styles.completedText]}>{name}</Text>
        {detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
      <View style={styles.status}>
        {completed ? (
          <CheckCircle2 size={20} color={accentColor} fill={accentColor + '10'} />
        ) : (
          <Circle size={20} color="#CBD5E1" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  completedText: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  detail: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  status: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
