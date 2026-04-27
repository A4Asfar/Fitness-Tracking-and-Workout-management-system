import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Modal, Pressable, Animated, Linking,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';
import {
  User, Bell, CircleHelp, Info, LogOut,
  ChevronRight, Target, Shield, Star,
  Mail, Phone, X,
  Dumbbell, Sparkles, Lock, FileText,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

/* ─── Pressable row with spring feedback ─── */
function SettingRow({
  icon: Icon, iconBg, iconColor = Colors.text,
  label, sublabel, right, onPress, danger = false,
}: {
  icon: any; iconBg: string; iconColor?: string;
  label: string; sublabel?: string;
  right?: React.ReactNode; onPress?: () => void; danger?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start(() =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start());

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={row.wrap}
        onPress={() => { press(); onPress?.(); }}
        activeOpacity={0.85}
      >
        <View style={[row.icon, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} strokeWidth={2} />
        </View>
        <View style={row.body}>
          <Text style={[row.label, danger && { color: Colors.error }]}>{label}</Text>
          {sublabel ? <Text style={row.sub}>{sublabel}</Text> : null}
        </View>
        {right ?? <ChevronRight size={18} color="#3A3A3A" />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 17, paddingHorizontal: 20,
  },
  icon: {
    width: 46, height: 46, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  body: { flex: 1, marginLeft: 15 },
  label: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  sub: { color: Colors.textSecondary, fontSize: 12, marginTop: 3, fontWeight: '500', lineHeight: 16 },
});

/* ─── Card container ─── */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/* ─── Thin divider ─── */
const Div = () => <View style={s.divider} />;

/* ─── Section label ─── */
function SectionLabel({ text }: { text: string }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionLabel}>{text}</Text>
      <View style={s.sectionLine} />
    </View>
  );
}

export default function SettingsHubScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── Hero Header ── */}
        <View style={s.hero}>
          <LinearGradient
            colors={[Colors.primary + '20', Colors.primary + '06', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroAvatar}>
            <LinearGradient colors={[Colors.primary + '50', Colors.primary + '18']} style={s.heroAvatarGrad}>
              <View style={s.heroAvatarInner}>
                <User size={44} color={Colors.primary} strokeWidth={1.6} />
              </View>
            </LinearGradient>
          </View>
          <Text style={s.heroName}>{user?.name ?? 'Athlete'}</Text>
          <Text style={s.heroEmail}>{user?.email ?? ''}</Text>
          <View style={s.heroBadge}>
            <Star size={10} color={Colors.primary} fill={Colors.primary} />
            <Text style={s.heroBadgeText}>ELITE MEMBER</Text>
          </View>
          <Text style={s.heroSub}>Manage your app preferences</Text>
        </View>

        <View style={s.body}>

          {/* ── Account ── */}
          <SectionLabel text="Account" />
          <Card>
            <SettingRow
              icon={User} iconBg={Colors.primary + '1A'} iconColor={Colors.primary}
              label="Edit Profile"
              sublabel="Name, weight, height & fitness goal"
              onPress={() => router.push('/(tabs)/settings' as any)}
            />
            <Div />
            <SettingRow
              icon={Target} iconBg="#A855F71A" iconColor="#A855F7"
              label="Fitness Goal"
              sublabel={user?.fitnessGoal ?? 'Not set'}
              onPress={() => router.push('/(tabs)/settings' as any)}
            />
          </Card>

          {/* ── Preferences ── */}
          <SectionLabel text="Preferences" />
          <Card>
            <SettingRow
              icon={Bell} iconBg="#FFD7001A" iconColor="#FFD700"
              label="Notifications"
              sublabel="Workout reminders & alerts"
              right={
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ false: '#333', true: Colors.primary + '60' }}
                  thumbColor={notifEnabled ? Colors.primary : '#666'}
                />
              }
            />
          </Card>

          {/* ── Support ── */}
          <SectionLabel text="Support" />
          <Card>
            <SettingRow
              icon={CircleHelp} iconBg="#00D1FF1A" iconColor="#00D1FF"
              label="Help & Support"
              sublabel="FAQ, contact & feedback"
              onPress={() => router.push('/support' as any)}
            />
            <Div />
            <SettingRow
              icon={Info} iconBg="#FF6B3B1A" iconColor="#FF6B3B"
              label="About This App"
              sublabel="Version 1.0 · Fitness Tracker Pro"
              onPress={() => setShowAbout(true)}
            />
          </Card>

          {/* ── Legal ── */}
          <SectionLabel text="Legal" />
          <Card>
            <SettingRow
              icon={Shield} iconBg="#4CAF501A" iconColor="#4CAF50"
              label="Privacy Policy"
              sublabel="How we handle your data"
            />
            <Div />
            <SettingRow
              icon={FileText} iconBg="#7C3AED1A" iconColor="#7C3AED"
              label="Terms of Service"
            />
          </Card>

          {/* ── Danger Zone ── */}
          <SectionLabel text="Account Actions" />
          <Card>
            <SettingRow
              icon={LogOut} iconBg={Colors.error + '15'} iconColor={Colors.error}
              label="Sign Out"
              sublabel="Log out of your account"
              danger
              onPress={() => setShowLogout(true)}
              right={null}
            />
          </Card>

          {/* App version tag */}
          <View style={s.versionTag}>
            <Dumbbell size={14} color={Colors.textSecondary} />
            <Text style={s.versionText}>Fitness Tracker Pro · v1.0.0</Text>
          </View>

        </View>
      </ScrollView>

      {/* ── About Modal ── */}
      <Modal visible={showAbout} transparent animationType="fade" statusBarTranslucent>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={m.backdrop} onPress={() => setShowAbout(false)}>
          <Pressable style={m.sheet} onPress={e => e.stopPropagation()}>
            <View style={m.handle} />
            <TouchableOpacity style={m.close} onPress={() => setShowAbout(false)}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* App icon */}
            <LinearGradient colors={[Colors.primary + '40', Colors.primary + '15']} style={m.appIcon}>
              <Dumbbell size={40} color={Colors.primary} strokeWidth={1.6} />
            </LinearGradient>

            <Text style={m.appName}>Fitness Tracker Pro</Text>
            <View style={m.versionPill}>
              <Text style={m.versionPillText}>VERSION 1.0.0</Text>
            </View>
            <Text style={m.appDesc}>
              A smart mobile fitness companion for workout tracking and performance monitoring. Built to help you achieve your goals through data-driven insights.
            </Text>

            <View style={m.infoGrid}>
              {[
                { label: 'Platform', value: 'iOS & Android' },
                { label: 'Framework', value: 'React Native' },
                { label: 'Backend', value: 'Node.js + MongoDB' },
                { label: 'Build', value: 'Expo SDK 52' },
              ].map((item, i) => (
                <View key={i} style={m.infoCell}>
                  <Text style={m.infoCellLabel}>{item.label}</Text>
                  <Text style={m.infoCellValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <LinearGradient colors={[Colors.primary, '#9FE800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={m.primaryBtn}>
              <Sparkles size={18} color="#000" />
              <Text style={m.primaryBtnText}>MADE WITH ❤️ FOR FYP</Text>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Logout Confirmation ── */}
      <Modal visible={showLogout} transparent animationType="fade" statusBarTranslucent>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={m.centreBackdrop} onPress={() => setShowLogout(false)}>
          <Pressable style={m.logoutCard} onPress={e => e.stopPropagation()}>
            <View style={m.logoutIcon}>
              <LogOut size={32} color={Colors.error} strokeWidth={1.8} />
            </View>
            <Text style={m.logoutTitle}>Sign Out?</Text>
            <Text style={m.logoutBody}>
              You'll be returned to the login screen. Your workout data is safely saved in the cloud.
            </Text>
            <TouchableOpacity style={m.logoutConfirm} onPress={handleLogout} activeOpacity={0.85}>
              <LogOut size={18} color="#fff" />
              <Text style={m.logoutConfirmText}>Yes, Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.logoutCancel} onPress={() => setShowLogout(false)}>
              <Text style={m.logoutCancelText}>Keep Me In</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ── Main Styles ── */
const s = StyleSheet.create({
  hero: {
    alignItems: 'center', paddingTop: 76, paddingBottom: 40,
    paddingHorizontal: 24, position: 'relative', overflow: 'hidden',
  },
  heroAvatar: { marginBottom: 20 },
  heroAvatarGrad: {
    width: 118, height: 118, borderRadius: 38,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
  },
  heroAvatarInner: {
    width: 102, height: 102, borderRadius: 32,
    backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary + '40',
  },
  heroName: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -1, lineHeight: 32 },
  heroEmail: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', marginTop: 5, letterSpacing: 0.1 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '18', paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 22, borderWidth: 1.5,
    borderColor: Colors.primary + '35', marginTop: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  heroBadgeText: { color: Colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 2.5 },
  heroSub: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 12, letterSpacing: 0.1 },

  body: { paddingHorizontal: 20 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 28 },
  sectionLabel: {
    color: Colors.textSecondary, fontSize: 10, fontWeight: '900',
    textTransform: 'uppercase', letterSpacing: 2,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#1E1E1E' },

  card: {
    backgroundColor: '#171717', borderRadius: 26, overflow: 'hidden',
    borderWidth: 1, borderColor: '#222',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 18, elevation: 12,
  },
  divider: { height: 1, backgroundColor: '#202020', marginLeft: 81 },

  versionTag: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 36, marginBottom: 12,
  },
  versionText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
});

/* ── Modal Styles ── */
const m = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  centreBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  sheet: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    padding: 32, paddingBottom: 52,
    borderWidth: 1, borderBottomWidth: 0, borderColor: '#282828',
    shadowColor: '#000', shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.6, shadowRadius: 32, elevation: 24,
  },
  handle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#2E2E2E', alignSelf: 'center', marginBottom: 28,
  },
  close: {
    position: 'absolute', top: 22, right: 22,
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: '#242424', borderWidth: 1, borderColor: '#2E2E2E',
    justifyContent: 'center', alignItems: 'center',
  },

  appIcon: {
    width: 96, height: 96, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 20,
    backgroundColor: Colors.primary + '18',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  appName: {
    color: Colors.text, fontSize: 26, fontWeight: '900',
    textAlign: 'center', letterSpacing: -0.8, lineHeight: 30,
  },
  versionPill: {
    backgroundColor: Colors.primary + '18', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'center', marginTop: 10,
    borderWidth: 1.5, borderColor: Colors.primary + '35',
  },
  versionPillText: { color: Colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 2.5 },
  appDesc: {
    color: Colors.textSecondary, fontSize: 14, textAlign: 'center',
    lineHeight: 23, marginTop: 16, marginBottom: 26,
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 26 },
  infoCell: {
    width: '47%', backgroundColor: '#1E1E1E', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#272727',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  infoCellLabel: {
    color: Colors.textSecondary, fontSize: 9, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
  },
  infoCellValue: { color: Colors.text, fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  primaryBtn: {
    height: 60, borderRadius: 20, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 18, elevation: 10,
  },
  primaryBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

  /* FAQ */
  faqTitle: {
    color: Colors.text, fontSize: 13, fontWeight: '900',
    marginBottom: 14, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  faqItem: {
    backgroundColor: '#1E1E1E', borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#272727',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  faqQ: { color: Colors.text, fontSize: 13, fontWeight: '800', marginBottom: 7, lineHeight: 18 },
  faqA: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, fontWeight: '500' },

  /* Contact */
  contactRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 18, paddingVertical: 16,
    backgroundColor: '#00D1FF0E', borderWidth: 1.5, borderColor: '#00D1FF30',
  },
  contactBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },

  /* Logout */
  logoutCard: {
    backgroundColor: '#161616', borderRadius: 32, padding: 30,
    width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: '#242424',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6, shadowRadius: 36, elevation: 24,
  },
  logoutIcon: {
    width: 84, height: 84, borderRadius: 28,
    backgroundColor: Colors.error + '12', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.error + '30', marginBottom: 22,
    shadowColor: Colors.error, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 14, elevation: 6,
  },
  logoutTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: 12, letterSpacing: -0.6 },
  logoutBody: {
    color: Colors.textSecondary, fontSize: 14, textAlign: 'center',
    lineHeight: 23, marginBottom: 32, maxWidth: 280,
  },
  logoutConfirm: {
    backgroundColor: Colors.error, borderRadius: 22, width: '100%', height: 60,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12,
    shadowColor: Colors.error, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 18, elevation: 10,
  },
  logoutConfirmText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },
  logoutCancel: {
    backgroundColor: '#1E1E1E', borderRadius: 22, width: '100%', height: 60,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  logoutCancelText: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: 0.1 },
});
