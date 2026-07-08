import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  isPositive?: boolean;
  accentColor?: string;
  icon: any;
}

export default function MetricCard({
  label,
  value,
  sub,
  isPositive = true,
  accentColor = '#10B981',
  icon: IconComponent
}: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: accentColor + '10' }]}>
          <IconComponent size={16} color={accentColor} />
        </View>
        <View style={styles.trendRow}>
          {isPositive ? (
            <ArrowUpRight size={14} color="#10B981" />
          ) : (
            <ArrowDownRight size={14} color="#EF4444" />
          )}
          <Text style={[styles.trendText, { color: isPositive ? '#10B981' : '#EF4444' }]}>
            {sub}
          </Text>
        </View>
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '800',
  },
  value: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
