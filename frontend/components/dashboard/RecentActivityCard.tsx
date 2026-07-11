import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Clock, ChevronRight, Dumbbell } from 'lucide-react-native';

interface RecentActivityCardProps {
  title: string;
  time: string;
  calories: number;
  duration: string;
  onPress?: () => void;
  accentColor?: string;
}

export default function RecentActivityCard({
  title,
  time,
  calories,
  duration,
  onPress,
  accentColor = '#10B981'
}: RecentActivityCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={[styles.iconBox, { backgroundColor: accentColor + '10' }]}>
        <Dumbbell size={18} color={accentColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Flame size={12} color="#64748B" />
            <Text style={styles.statText}>{calories} kcal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Clock size={12} color="#64748B" />
            <Text style={styles.statText}>{duration}</Text>
          </View>
        </View>
      </View>
      {onPress && <ChevronRight size={16} color="#94A3B8" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  time: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
});
