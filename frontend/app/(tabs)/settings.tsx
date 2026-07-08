import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Platform, Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ChevronRight, Bell, Shield, LogOut, Settings, 
  Sparkles, Camera, Dumbbell, TrendingUp, Ruler, Scale, Calendar, Award, Target, CheckCircle2, Flame, Heart, ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function AccountHubScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const isAdmin = user?.membershipType === 'admin';
  const isPremium = user?.membershipType === 'premium' || isAdmin;

  const weightKg = user?.weight || 70;
  const heightCm = user?.height || 175;
  const fitnessGoal = user?.fitnessGoal || 'General Fitness';
  const trainingLevel = user?.trainingLevel || 'Intermediate';
  const preferredFocus = user?.preferredWorkoutFocus || 'Strength';

  const bmi = (weightKg > 0 && heightCm > 0) 
    ? (weightKg / ((heightCm / 100) ** 2)) 
    : 22.8;

  const weightLbs = Math.round(weightKg * 2.20462);
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const heightStr = `${feet}'${inches}"`;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* --- Header --- */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerProfileRow}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/settings/edit-profile')}
              activeOpacity={0.8}
            >
              <View style={styles.avatarWrap}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <User size={36} color="#94A3B8" />
                )}
              </View>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#FFFFFF" fill="#10B981" />
              </View>
            </TouchableOpacity>

            <View style={styles.headerTextWrap}>
              <Text style={styles.userName}>{user?.name || 'Peak Athlete'}</Text>
              <View style={styles.headerBadgeRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{trainingLevel}</Text>
                </View>
                <View style={styles.goalBadge}>
                  <Text style={styles.goalBadgeText}>{fitnessGoal}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.editProfileBtn}
              onPress={() => router.push('/settings/edit-profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.editProfileBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Modern Stats Grid --- */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>Biometrics & Daily Goals</Text>
          <View style={styles.statsGrid}>
            <StatTile icon={Scale} label="Weight" value={`${weightKg} kg`} subValue={`${weightLbs} lbs`} color="#10B981" />
            <StatTile icon={Ruler} label="Height" value={`${heightCm} cm`} subValue={heightStr} color="#10B981" />
            <StatTile icon={Target} label="BMI" value={bmi.toFixed(1)} subValue="Normal range" color="#10B981" />
            <StatTile icon={Calendar} label="Age" value="26 yrs" subValue="Mocked" color="#10B981" />
            <StatTile icon={TrendingUp} label="Activity" value="Active" subValue="Daily target" color="#10B981" />
            <StatTile icon={Dumbbell} label="Workout" value={preferredFocus} subValue="Focus" color="#10B981" />
          </View>
        </View>

        {/* --- Fitness Info Section --- */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Fitness Information</Text>
          <View style={styles.chipsContainer}>
            <InfoChip label="Focus" value={preferredFocus} color="#10B981" />
            <InfoChip label="Location" value="Commercial Gym" color="#10B981" />
            <InfoChip label="Equipment" value="Full Equipment" color="#10B981" />
            <InfoChip label="Diet" value="High Protein" color="#10B981" />
            <InfoChip label="Limitations" value="None" color="#10B981" />
          </View>
        </View>

        {/* --- Progress Summary Section --- */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionLabel}>Progress Summary</Text>
          <View style={styles.widgetsGrid}>
            <WidgetCard title="Completed" value="18" subtitle="Workouts" icon={CheckCircle2} color="#10B981" />
            <WidgetCard title="Streak" value="5 days" subtitle="Current" icon={TrendingUp} color="#10B981" />
            <WidgetCard title="Active" value="12 days" subtitle="Longest streak" icon={Award} color="#10B981" />
            <WidgetCard title="Calories" value="4,850" subtitle="kcal burned" icon={Flame} color="#10B981" />
          </View>
        </View>

        {/* --- Settings Options Menu --- */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Preferences & Support</Text>
          <View style={styles.menuGroup}>
            {user && isAdmin && (
              <>
                <MenuOption 
                  icon={Shield} 
                  title="Admin Control" 
                  subtitle="System dashboard"
                  onPress={() => router.push('/admin-dashboard')} 
                />
                <Divider />
              </>
            )}
            <MenuOption 
              icon={User} 
              title="Personal Details" 
              subtitle="Weight, height & training goal"
              onPress={() => router.push('/settings/edit-profile')} 
            />
            <Divider />
            <MenuOption 
              icon={Bell} 
              title="Notification Preferences" 
              subtitle="Reminders & system alerts"
              hasSwitch={true}
              onPress={() => router.push('/settings/notifications')} 
            />
            <Divider />
            <MenuOption 
              icon={Sparkles} 
              title="Membership Tier" 
              subtitle={isPremium ? 'Premium Pro Member' : 'Standard Free Plan'}
              badge={isPremium ? 'Pro' : 'Upgrade'}
              onPress={() => router.push('/upgrade')} 
            />
          </View>

          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Logout Modal --- */}
      <Modal visible={showLogoutModal} transparent animationType="fade" statusBarTranslucent>
        <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <LogOut size={26} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm Sign Out</Text>
            <Text style={styles.modalDesc}>Are you sure you want to end your training session and sign out?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
                <Text style={styles.confirmBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatTile({ icon: Icon, label, value, subValue, color }: any) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '10' }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.statTileValue}>{value}</Text>
      <Text style={styles.statTileLabel}>{label}</Text>
      <Text style={styles.statTileSub}>{subValue}</Text>
    </View>
  );
}

function InfoChip({ label, value, color }: any) {
  return (
    <View style={[styles.infoChip, { borderColor: '#E2E8F0' }]}>
      <Text style={styles.infoChipLabel}>{label}:</Text>
      <Text style={[styles.infoChipValue, { color: color }]}>{value}</Text>
    </View>
  );
}

function WidgetCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <View style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>{title}</Text>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.widgetValue}>{value}</Text>
      <Text style={styles.widgetSubtitle}>{subtitle}</Text>
    </View>
  );
}

function MenuOption({ icon: Icon, title, subtitle, onPress, badge, hasSwitch }: any) {
  const [isEnabled, setIsEnabled] = useState(true);
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.optionIconBox}>
        <Icon size={18} color="#64748B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      
      {badge && (
        <View style={[styles.proBadge, badge === 'Pro' ? styles.badgeActive : styles.badgeUpgrade]}>
          <Text style={[styles.proBadgeText, { color: badge === 'Pro' ? '#059669' : '#10B981' }]}>{badge}</Text>
        </View>
      )}

      {hasSwitch ? (
        <TouchableOpacity 
          onPress={() => setIsEnabled(!isEnabled)}
          style={[styles.switchTrack, isEnabled ? { backgroundColor: '#10B981' } : null]}
          activeOpacity={0.9}
        >
          <View style={[styles.switchThumb, isEnabled ? { transform: [{ translateX: 20 }] } : null]} />
        </TouchableOpacity>
      ) : (
        <ChevronRight size={16} color="#94A3B8" />
      )}
    </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  goalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalBadgeText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  editProfileBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statTile: {
    width: (width - 60) / 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTileValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  statTileLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  statTileSub: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  infoChipLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  infoChipValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  widgetCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  widgetValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  widgetSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
  },
  optionIconBox: {
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
  optionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  optionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeActive: {
    backgroundColor: '#ECFDF5',
  },
  badgeUpgrade: {
    backgroundColor: '#ECFDF5',
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  switchEnabled: {
    backgroundColor: '#10B981',
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    marginBottom: 40,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalDesc: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  achieveGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achieveItem: {
    flex: 1,
    alignItems: 'center',
  },
  achieveIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  achieveValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  achieveLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
