import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Flame, Settings, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { usePremiumStatus } from '../PremiumGate';
import PremiumBadge from '../PremiumBadge';

interface DashboardHeaderProps {
  userName: string;
  streakCount: number;
  onNotificationPress: () => void;
  onSettingsPress: () => void;
}

export default function DashboardHeader({
  userName,
  streakCount,
  onNotificationPress,
  onSettingsPress
}: DashboardHeaderProps) {
  const { isPremium } = usePremiumStatus();
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : 'A';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* User avatar ring */}
        <TouchableOpacity onPress={onSettingsPress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#7C4DFF', '#BD00FF']}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.greetContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.name}>{userName || 'Athlete'}</Text>
            {isPremium && <PremiumBadge />}
          </View>
        </View>

        {/* Streak & Settings */}
        <View style={styles.rightActions}>
          <View style={styles.streakBadge}>
            <Flame size={16} color="#FF6B00" fill="#FF6B00" />
            <Text style={styles.streakText}>{streakCount}</Text>
          </View>
          
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Bell size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.dateText}>{formattedDate}</Text>
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
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#7C4DFF',
    fontSize: 16,
    fontWeight: '800',
  },
  greetContainer: {
    flex: 1,
  },
  greeting: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 56,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF2E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD9B3',
  },
  streakText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '800',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
});
