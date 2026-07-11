import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AIInsightCardProps {
  insightText: string;
  isPremium: boolean;
  onPress: () => void;
}

export default function AIInsightCard({
  insightText,
  isPremium,
  onPress
}: AIInsightCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <LinearGradient
        colors={['#10B98115', '#10B98103']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.botIconWrap}>
          <Bot size={22} color="#10B981" strokeWidth={2} />
        </View>
        <View style={styles.titleInfo}>
          <View style={styles.badgeRow}>
            <Text style={styles.title}>AI Coach Insight</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.dateLabel}>Personalized coaching tip</Text>
        </View>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.insightText}>{insightText}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLink}>
          {isPremium ? 'View Deep Analytics' : 'Unlock Pro Insights'}
        </Text>
        <ChevronRight size={16} color="#10B981" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#10B98130',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  botIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B98120',
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  liveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  dateLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  messageBox: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  insightText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#10B98115',
  },
  footerLink: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
});
