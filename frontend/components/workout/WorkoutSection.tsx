import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';

interface WorkoutSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function WorkoutSection({
  title,
  children
}: WorkoutSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={14} color="#64748B" />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.list}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  list: {
    gap: 2,
  },
});
