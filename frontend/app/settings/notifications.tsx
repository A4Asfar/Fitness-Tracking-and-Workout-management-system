import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { 
  Bell, 
  ArrowLeft, 
  Activity, 
  Zap, 
  Shield 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reminders, setReminders] = useState(true);
  const [progress, setProgress] = useState(true);
  const [updates, setUpdates] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.bellIconWrap}>
            <Bell size={36} color="#10B981" strokeWidth={1.5} />
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
          <Divider />
          <NotificationRow 
            icon={Activity} 
            title="Weekly Progress" 
            desc="Get a summary of your performance every Monday."
            value={progress}
            onToggle={setProgress}
          />
          <Divider />
          <NotificationRow 
            icon={Zap} 
            title="Premium Updates" 
            desc="New features and exclusive content alerts."
            value={updates}
            onToggle={setUpdates}
          />
        </View>

        <View style={styles.infoCard}>
          <Shield size={18} color="#64748B" style={{ marginRight: 12 }} />
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
        <Icon size={18} color="#64748B" />
      </View>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => onToggle(!value)}
        style={[styles.switchTrack, value ? { backgroundColor: '#10B981' } : null]}
        activeOpacity={0.9}
      >
        <View style={[styles.switchThumb, value ? { transform: [{ translateX: 20 }] } : null]} />
      </TouchableOpacity>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  bellIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  introTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  introSub: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 72,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  rowTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  rowDesc: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  infoText: {
    flex: 1,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
