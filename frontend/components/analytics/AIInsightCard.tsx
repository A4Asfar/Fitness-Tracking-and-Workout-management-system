import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AIInsightCardProps {
  title: string;
  value: string;
  sub: string;
  icon: any;
  color?: string;
}

export default function AIInsightCard({
  title,
  value,
  sub,
  icon: IconComponent,
  color = '#10B981'
}: AIInsightCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[color + '08', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: color + '12' }]}>
          <IconComponent size={18} color={color} />
        </View>
        <Text style={styles.label}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    padding: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sub: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
