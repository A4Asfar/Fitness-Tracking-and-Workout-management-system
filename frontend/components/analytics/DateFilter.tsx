import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DateFilterProps {
  selected: 'weekly' | 'monthly';
  onChange: (val: 'weekly' | 'monthly') => void;
}

export default function DateFilter({
  selected,
  onChange
}: DateFilterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.segmentBg}>
        <TouchableOpacity
          onPress={() => onChange('weekly')}
          activeOpacity={0.8}
          style={[styles.btn, selected === 'weekly' && styles.btnActive]}
        >
          <Text style={[styles.text, selected === 'weekly' && styles.textActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange('monthly')}
          activeOpacity={0.8}
          style={[styles.btn, selected === 'monthly' && styles.btnActive]}
        >
          <Text style={[styles.text, selected === 'monthly' && styles.textActive]}>Monthly</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  segmentBg: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  textActive: {
    color: '#10B981',
  },
});
