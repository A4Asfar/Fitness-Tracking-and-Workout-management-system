import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Flame, Sparkles } from 'lucide-react-native';

interface WorkoutHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  streakCount?: number;
  onBackPress?: () => void;
  quote?: string;
}

export default function WorkoutHeader({
  title,
  subtitle,
  userName,
  streakCount = 3,
  onBackPress,
  quote = "Commit to be fit, dare to be great."
}: WorkoutHeaderProps) {
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={styles.greetContainer}>
          <Text style={styles.greeting}>{getGreeting()}{userName ? `, ${userName}` : ''}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Flame size={16} color="#FF6B00" fill="#FF6B00" />
          <Text style={styles.streakText}>{streakCount}d Streak</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {quote && (
        <View style={styles.quoteCard}>
          <Sparkles size={14} color="#10B981" style={styles.quoteIcon} />
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
  },
  greetContainer: {
    flex: 1,
  },
  greeting: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF2E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD9B3',
  },
  streakText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '800',
  },
  titleSection: {
    marginBottom: 16,
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: { flexShrink: 1, 
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  quoteIcon: {
    marginRight: 8,
  },
  quoteText: {
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    flex: 1,
  },
});
