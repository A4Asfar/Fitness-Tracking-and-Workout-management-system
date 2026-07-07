import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MacroCardProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color: string;
}

export default function MacroCard({
  label,
  value,
  target,
  unit = 'g',
  color
}: MacroCardProps) {
  const progressPct = Math.min(100, Math.round((value / target) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.pct, { color }]}>{progressPct}%</Text>
      </View>
      <Text style={styles.value}>
        {value} <Text style={styles.unit}>{unit}</Text>
      </Text>
      
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.targetLabel}>of {target}{unit} goal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pct: {
    fontSize: 11,
    fontWeight: '800',
  },
  value: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  unit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
