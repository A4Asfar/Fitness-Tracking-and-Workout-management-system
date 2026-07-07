import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  suffix?: string;
}

export default function MetricBadge({
  label,
  value,
  suffix = ''
}: MetricBadgeProps) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.value}>
        {value}
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 64,
  },
  value: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  suffix: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 1,
  },
  label: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
