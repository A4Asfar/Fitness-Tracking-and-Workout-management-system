import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Bell, 
  ArrowLeft, 
  Activity, 
  Zap, 
  Shield, 
  ChevronRight 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeBack } from '@/utils/navigation';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reminders, setReminders] = useState(true);
  const [progress, setProgress] = useState(true);
  const [updates, setUpdates] = useState(false);

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.bellIconWrap}>
            <Bell size={40} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.introTitle}>Stay Notified</Text>
          <Text style={styles.introSub}>Control how we alert you about your fitness journey.</Text>
        </View>

        <View style={styles.section}>
          <NotificationRow 
            icon={Bell} 
            title="Workout Reminders" 
            desc="Daily alerts to keep your training on track."
            value={reminders}
            onToggle={setReminders}
          />
          <View style={styles.divider} />
          <NotificationRow 
            icon={Activity} 
            title="Weekly Progress" 
            desc="Get a summary of your performance every Monday."
            value={progress}
            onToggle={setProgress}
          />
          <View style={styles.divider} />
          <NotificationRow 
            icon={Zap} 
            title="Premium Updates" 
            desc="New features and exclusive content alerts."
            value={updates}
            onToggle={setUpdates}
          />
        </View>

        <View style={styles.infoCard}>
          <Shield size={18} color={Colors.textSecondary} style={{ marginRight: 12 }} />
          <Text style={styles.infoText}>
            We respect your focus. We only send notifications that help you reach your goals.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function NotificationRow({ icon: Icon, title, desc, value, onToggle }: any) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: Colors.primary + '80' }}
        thumbColor={value ? Colors.primary : '#666'}
      />
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
    paddingTop: SPACING.lg,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  bellIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  introTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  introSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
});
