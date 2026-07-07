import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Compass, Target } from 'lucide-react-native';

interface NutritionCardProps {
  consumed: number;
  burned: number;
  target: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export default function NutritionCard({
  consumed,
  burned,
  target,
  protein = 95,
  carbs = 180,
  fat = 55
}: NutritionCardProps) {
  const caloriesPct = Math.min(100, Math.round((consumed / target) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Flame size={16} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.title}>Energy Balance</Text>
        </View>
        <Text style={styles.kcalRemaining}>
          {Math.max(0, target - consumed)} kcal left
        </Text>
      </View>

      <View style={styles.calOverview}>
        <View style={styles.calCol}>
          <Text style={styles.calVal}>{consumed}</Text>
          <Text style={styles.calLabel}>Consumed</Text>
        </View>
        <View style={styles.calCol}>
          <Text style={styles.calVal}>{target}</Text>
          <Text style={styles.calLabel}>Goal</Text>
        </View>
        <View style={styles.calCol}>
          <Text style={[styles.calVal, { color: '#EF4444' }]}>{burned}</Text>
          <Text style={styles.calLabel}>Burned</Text>
        </View>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${caloriesPct}%` }]} />
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroVal}>{protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroVal}>{carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroVal}>{fat}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  kcalRemaining: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  calOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calCol: {
    alignItems: 'center',
  },
  calVal: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  calLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroVal: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  macroLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
