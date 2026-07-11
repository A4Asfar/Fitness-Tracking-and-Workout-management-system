import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Apple, Sparkles } from 'lucide-react-native';

interface NutritionHeaderProps {
  goalName: string;
}

export default function NutritionHeader({ goalName }: NutritionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Apple size={22} color="#10B981" />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.title}>Smart Nutrition</Text>
          <View style={styles.goalRow}>
            <Sparkles size={12} color="#10B981" fill="#10B981" />
            <Text style={styles.goalText}>{goalName}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  titleInfo: {
    flex: 1,
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  goalText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
