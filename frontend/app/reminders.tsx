import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { Bell, ArrowLeft, Sun, Moon, Coffee, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';

/* ─── Reminder Card Component ─── */
function ReminderCard({ 
  icon: Icon, 
  title, 
  time, 
  description, 
  isEnabled, 
  onToggle 
}: { 
  icon: any; 
  title: string; 
  time: string; 
  description: string; 
  isEnabled: boolean; 
  onToggle: (val: boolean) => void;
}) {
  return (
    <View style={[styles.card, isEnabled && styles.cardActive]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: isEnabled ? Colors.primary + '15' : '#222' }]}>
          <Icon size={20} color={isEnabled ? Colors.primary : Colors.textSecondary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.cardTitle, isEnabled && { color: Colors.text }]}>{title}</Text>
          <Text style={styles.cardTime}>{time}</Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: '#333', true: Colors.primary + '60' }}
          thumbColor={isEnabled ? Colors.primary : '#666'}
        />
      </View>
      <Text style={styles.cardDesc}>{description}</Text>
    </View>
  );
}

export default function RemindersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [morningRem, setMorningRem] = useState(true);
  const [eveningRem, setEveningRem] = useState(false);
  const [restRem, setRestRem] = useState(true);

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity 
          onPress={() => safeBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Reminders</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Intro Badge ── */}
        <View style={styles.badgeContainer}>
          <LinearGradient 
            colors={[Colors.primary + '20', Colors.primary + '05']} 
            style={styles.badge}
          >
            <Bell size={14} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.badgeText}>SMART NOTIFICATIONS</Text>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Daily Schedule</Text>

        {/* ── Reminder Cards ── */}
        <ReminderCard
          icon={Coffee}
          title="Morning Workout"
          time="07:00 AM"
          description="Get energized with an early morning session to start your day right."
          isEnabled={morningRem}
          onToggle={setMorningRem}
        />

        <ReminderCard
          icon={Sun}
          title="Evening Workout"
          time="06:30 PM"
          description="Wind down your day by hitting your fitness targets before dinner."
          isEnabled={eveningRem}
          onToggle={setEveningRem}
        />

        <ReminderCard
          icon={Moon}
          title="Rest Day Reminder"
          time="09:00 AM"
          description="Gentle reminder to prioritize recovery and stay hydrated on off-days."
          isEnabled={restRem}
          onToggle={setRestRem}
        />

        {/* ── Footer Note ── */}
        <View style={styles.footerNote}>
          <LinearGradient
            colors={['#1A1A1A', '#141414']}
            style={styles.noteCard}
          >
            <Sparkles size={18} color={Colors.primary} />
            <Text style={styles.noteText}>
              Stay consistent by enabling daily reminders. Consistency is the key to progress!
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  badgeContainer: {
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: SPACING.lg,
    letterSpacing: -0.8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardActive: {
    borderColor: Colors.primary + '30',
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardTime: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  cardDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footerNote: {
    marginTop: SPACING.lg,
  },
  noteCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  noteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
