import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Share2 } from 'lucide-react-native';

interface AnalyticsHeaderProps {
  onSharePress?: () => void;
}

export default function AnalyticsHeader({ onSharePress }: AnalyticsHeaderProps) {
  const formattedRange = "Jul 1 - Jul 7, 2026";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.titleInfo}>
          <Text style={styles.title}>Progress & Analytics</Text>
          <View style={styles.rangeRow}>
            <Calendar size={12} color="#64748B" />
            <Text style={styles.rangeText}>{formattedRange}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onSharePress} style={styles.shareBtn} activeOpacity={0.7}>
          <Share2 size={16} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rangeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
});
