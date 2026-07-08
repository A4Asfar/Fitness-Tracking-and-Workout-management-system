import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  children
}: ChartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TrendingUp size={16} color="#10B981" style={{ marginRight: 6 }} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  body: {
    height: 180,
    justifyContent: 'center',
  },
});
