import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, ImageBackground, useWindowDimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ChevronRight, Bell, LogOut, Sparkles, Dumbbell, 
  Target, ShieldCheck, Lock, Eye, HelpCircle, Activity, Medal, Flame, Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { isAdminUser } from '@/utils/isAdmin';
import SkeletonCard from '@/components/SkeletonCard';

const ACHIEVEMENTS = [
  { id: '1', title: '7-Day Streak', icon: Flame, color: '#FF4D4D', unlocked: true },
  { id: '2', title: 'Heavy Lifter', icon: Dumbbell, color: '#38BDF8', unlocked: true },
  { id: '3', title: 'Early Bird', icon: Sparkles, color: '#F59E0B', unlocked: false },
  { id: '4', title: '10k Cal Club', icon: Zap, color: '#A855F7', unlocked: false },
];

export default function ProfileSettingsScreen() {
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminUser(user);
  const isPremium = user?.membershipType === 'premium' || isAdmin;
  const fitnessGoal = user?.fitnessGoal || 'General Fitness';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [statusRes, analyticsRes] = await Promise.all([
          api.get('/premium/my').catch(() => ({ data: null })),
          api.get('/workouts/analytics').catch(() => ({ data: null }))
        ]);
        if (statusRes.data) setStatusInfo(statusRes.data);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
      } catch (e) {
        console.log('Error fetching profile data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View>
      </View>
    );
  }

  const bmiValue = analytics?.bmi ? Number(analytics.bmi).toFixed(1) : '22.5';
  const fitnessLevel = 'Intermediate'; 

  const SettingRow = ({ icon: Icon, title, subtitle, color, onPress }: any) => (
    <TouchableOpacity style={s.settingCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.settingIconBox, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={s.settingInfo}>
        <Text style={s.settingTitle}>{title}</Text>
        <Text style={s.settingSub}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color="#475569" />
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 , maxWidth: 1000, width: '100%', alignSelf: 'center' }}
      >
        {/* MASSIVE PROFILE HEADER */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.heroSection, { paddingTop: insets.top + 20 }]}>
          <View style={s.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={s.avatarImg} />
            ) : (
              <View style={s.avatarFallback}>
                <User size={48} color="#F8FAFC" />
              </View>
            )}
            <View style={s.editAvatarBtn}>
              <Text style={s.editAvatarText}>EDIT</Text>
            </View>
          </View>
          
          <Text style={s.userName}>{user?.name || 'Athlete'}</Text>
          <Text style={s.userEmail}>{user?.email || 'Welcome back to Elevate'}</Text>

          {/* VITAL STATS PILLS */}
          <View style={s.vitalsRow}>
            <View style={s.vitalPill}>
              <Target size={14} color="#38BDF8" />
              <Text style={s.vitalText}>{fitnessGoal}</Text>
            </View>
            <View style={s.vitalPill}>
              <Activity size={14} color="#10B981" />
              <Text style={s.vitalText}>BMI {bmiValue}</Text>
            </View>
            <View style={s.vitalPill}>
              <Zap size={14} color="#F59E0B" />
              <Text style={s.vitalText}>{fitnessLevel}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          {/* PREMIUM MEMBERSHIP CARD */}
          <TouchableOpacity style={s.premiumCardWrapper} activeOpacity={0.9} onPress={() => router.push('/premium')}>
            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80' }} style={s.premiumBg} imageStyle={{ borderRadius: 24 }}>
              <LinearGradient colors={['rgba(15,23,42,0.8)', 'rgba(15,23,42,0.95)']} style={s.premiumGrad}>
                <View style={s.premHeader}>
                  <Text style={s.premTitle}>Elevate PRO</Text>
                  <View style={s.premBadge}>
                    <Text style={s.premBadgeText}>{isPremium ? 'ACTIVE' : 'FREE'}</Text>
                  </View>
                </View>
                
                <View style={s.premFooter}>
                  <View>
                    <Text style={s.premLabel}>MEMBER SINCE</Text>
                    <Text style={s.premVal}>{new Date().getFullYear()}</Text>
                  </View>
                  <View>
                    <Text style={s.premLabel}>STATUS</Text>
                    <Text style={[s.premVal, { color: isPremium ? '#10B981' : '#94A3B8' }]}>{isPremium ? 'Premium Access' : 'Basic Tier'}</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* ACCOUNT STATISTICS GRID */}
          <Text style={s.sectionTitle}>Account Statistics</Text>
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <Dumbbell size={20} color="#38BDF8" style={{ marginBottom: 8 }} />
              <Text style={s.statNum}>{analytics?.totalWorkouts || 0}</Text>
              <Text style={s.statLab}>Workouts</Text>
            </View>
            <View style={s.statBox}>
              <Flame size={20} color="#EF4444" style={{ marginBottom: 8 }} />
              <Text style={s.statNum}>{analytics?.totalCalories || 0}</Text>
              <Text style={s.statLab}>Calories</Text>
            </View>
            <View style={s.statBox}>
              <Activity size={20} color="#10B981" style={{ marginBottom: 8 }} />
              <Text style={s.statNum}>{analytics?.streak || 0}</Text>
              <Text style={s.statLab}>Day Streak</Text>
            </View>
            <View style={s.statBox}>
              <Medal size={20} color="#F59E0B" style={{ marginBottom: 8 }} />
              <Text style={s.statNum}>{ACHIEVEMENTS.filter(a=>a.unlocked).length}</Text>
              <Text style={s.statLab}>Trophies</Text>
            </View>
          </View>

          {/* ACHIEVEMENTS */}
          <View style={s.headerRow}>
            <Text style={s.sectionTitle}>Achievements</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.achieveScroll}>
            {ACHIEVEMENTS.map(ach => (
              <View key={ach.id} style={[s.achieveCard, !ach.unlocked && s.achieveLocked]}>
                <View style={[s.achieveIconBox, { backgroundColor: ach.unlocked ? `${ach.color}20` : '#334155' }]}>
                  <ach.icon size={24} color={ach.unlocked ? ach.color : '#64748B'} />
                </View>
                <Text style={s.achieveTitle}>{ach.title}</Text>
              </View>
            ))}
          </ScrollView>

          {/* SETTINGS SHORTCUTS */}
          <Text style={s.sectionTitle}>Preferences</Text>
          <View style={s.settingsGroup}>
            <SettingRow icon={User} title="Edit Profile" subtitle="Name, weight, and fitness goals" color="#38BDF8" onPress={() => router.push('/settings/edit-profile')} />
            <SettingRow icon={Bell} title="Notifications" subtitle="Push alerts and reminders" color="#A855F7" />
            <SettingRow icon={Lock} title="Security" subtitle="Password and authentication" color="#10B981" onPress={() => router.push('/forgot-password')} />
          </View>

          <Text style={s.sectionTitle}>Support & About</Text>
          <View style={s.settingsGroup}>
            <SettingRow icon={HelpCircle} title="Help Center" subtitle="FAQ and contact support" color="#F59E0B" onPress={() => router.push('/help')} />
            <SettingRow icon={ShieldCheck} title="Privacy Policy" subtitle="Data usage and compliance" color="#64748B" onPress={() => router.push('/settings/privacy')} />
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  heroSection: { alignItems: 'center', paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  
  avatarWrapper: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#1E293B', marginBottom: 16, position: 'relative' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 60 },
  avatarFallback: { flex: 1, backgroundColor: '#334155', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  editAvatarBtn: { position: 'absolute', bottom: -10, alignSelf: 'center', backgroundColor: '#38BDF8', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 2, borderColor: '#0F172A' },
  editAvatarText: { color: '#0F172A', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  userName: { color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  userEmail: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 20 },

  vitalsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  vitalPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  vitalText: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', marginLeft: 6 },

  content: { padding: 24, marginTop: -20 },

  premiumCardWrapper: { height: 160, borderRadius: 24, overflow: 'hidden', marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  premiumBg: { width: '100%', height: '100%' },
  premiumGrad: { flex: 1, padding: 24, justifyContent: 'space-between' },
  premHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  premTitle: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  premBadge: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  premBadgeText: { color: '#0F172A', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  premFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  premLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  premVal: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  statBox: { flex: 1, minWidth: 100, backgroundColor: '#1E293B', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  statNum: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', marginBottom: 2 },
  statLab: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  achieveScroll: { gap: 12, marginBottom: 32, paddingRight: 24 },
  achieveCard: { width: 120, backgroundColor: '#1E293B', padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  achieveLocked: { opacity: 0.5 },
  achieveIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  achieveTitle: { color: '#F8FAFC', fontSize: 12, fontWeight: '800', textAlign: 'center' },

  settingsGroup: { gap: 12, marginBottom: 32 },
  settingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  settingIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingInfo: { flex: 1 },
  settingTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  settingSub: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginBottom: 20 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '800', marginLeft: 8 },
});
