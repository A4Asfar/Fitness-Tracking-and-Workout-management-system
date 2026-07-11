import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import MacroCard from './MacroCard';

interface NutritionSummaryProps {
  consumed: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionSummary({
  consumed,
  target,
  protein,
  carbs,
  fat
}: NutritionSummaryProps) {
  const remaining = Math.max(0, target - consumed);
  const progressPct = Math.min(100, Math.round((consumed / target) * 100));

  return (
    <View style={styles.container}>
      {/* Calories Card */}
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Flame size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.title}>Calorie Budget</Text>
          </View>
          <Text style={styles.budget}>{target} kcal</Text>
        </View>

        <View style={styles.caloriesRow}>
          <View style={styles.calCol}>
            <Text style={styles.calVal}>{consumed}</Text>
            <Text style={styles.calLabel}>Consumed</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.calCol}>
            <Text style={[styles.calVal, { color: '#10B981' }]}>{remaining}</Text>
            <Text style={styles.calLabel}>Remaining</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.calCol}>
            <Text style={styles.calVal}>{progressPct}%</Text>
            <Text style={styles.calLabel}>Logged</Text>
          </View>
        </View>

        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>

      {/* Macros Row */}
      <View style={styles.macrosGrid}>
        <MacroCard label="Protein" value={protein} target={120} color="#10B981" />
        <MacroCard label="Carbs" value={carbs} target={220} color="#3B82F6" />
        <MacroCard label="Fat" value={fat} target={70} color="#F59E0B" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
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
    marginBottom: 14,
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
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  budget: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calCol: {
    alignItems: 'center',
  },
  calVal: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  calLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 10,
  },
});
