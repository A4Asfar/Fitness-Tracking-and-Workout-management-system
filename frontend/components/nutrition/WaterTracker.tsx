import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassWater, Plus, Minus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WaterTracker() {
  const [cups, setCups] = useState(0);
  const targetCups = 8;

  useEffect(() => {
    const loadWater = async () => {
      try {
        const stored = await AsyncStorage.getItem(`water_intake_${new Date().toDateString()}`);
        if (stored) setCups(parseInt(stored));
      } catch (e) {}
    };
    loadWater();
  }, []);

  const saveWater = async (newVal: number) => {
    try {
      setCups(newVal);
      await AsyncStorage.setItem(`water_intake_${new Date().toDateString()}`, newVal.toString());
    } catch (e) {}
  };

  const increment = () => {
    if (cups < 20) saveWater(cups + 1);
  };

  const decrement = () => {
    if (cups > 0) saveWater(cups - 1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <GlassWater size={18} color="#0EA5E9" style={{ marginRight: 6 }} />
          <Text style={styles.title}>Hydration Tracker</Text>
        </View>
        <Text style={styles.progress}>
          {cups} / {targetCups} cups
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.cupsGrid}>
          {Array.from({ length: targetCups }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.cupPlaceholder,
                idx < cups && styles.cupFilled
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={decrement} style={styles.btn} activeOpacity={0.7}>
            <Minus size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={increment} style={[styles.btn, styles.plusBtn]} activeOpacity={0.7}>
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
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
    marginHorizontal: 20,
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
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  progress: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cupsGrid: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 16,
  },
  cupPlaceholder: {
    width: 20,
    height: 28,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
  },
  cupFilled: {
    backgroundColor: '#38BDF8',
    borderColor: '#0EA5E9',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBtn: {
    backgroundColor: '#0EA5E9',
  },
});
