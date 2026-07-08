import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Platform, Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ChevronRight, Bell, Shield, LogOut, Settings, 
  Sparkles, Camera, Dumbbell, TrendingUp, Ruler, Scale, Calendar, Award, Target
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
        {/* --- Custom Header Area --- */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View>
            <Text style={styles.headerSubtitle}>Personal Profile</Text>
            <Text style={styles.headerTitle}>Account Hub</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => router.push('/settings/privacy')}
            activeOpacity={0.7}
          >
            <Settings size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* --- Profile Card --- */}
        <View style={styles.cardContainer}>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => router.push('/settings/edit-profile')}
                activeOpacity={0.8}
              >
                <View style={styles.avatarWrap}>
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                  ) : (
                    <User size={36} color="#64748B" />
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Camera size={10} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              <View style={styles.profileText}>
                <Text style={styles.userName}>{user?.name || 'Fitness Athlete'}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                    <Text style={styles.badgeText}>{trainingLevel}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                    <Sparkles size={10} color="#7C4DFF" style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: '#7C4DFF' }]}>{isPremium ? 'Pro Member' : 'Free Tier'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* --- Edit Button --- */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/settings/edit-profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            {/* --- Stats Summary Row --- */}
            <View style={styles.statsRow}>
              <StatItem 
                label="Weight" 
                value={`${weightKg} kg`} 
                subValue={`${weightLbs} lbs`}
                icon={Scale}
                color="#7C4DFF"
              />
              <StatItem 
                label="Height" 
                value={`${heightCm} cm`} 
                subValue={heightStr}
                icon={Ruler}
                color="#FF4B4B"
              />
              <StatItem 
                label="Goal" 
                value={fitnessGoal.split(' ')[0]} 
                subValue={`BMI: ${bmi.toFixed(1)}`}
                icon={Target}
                color="#00B0FF"
              />
            </View>
          </View>
        </View>

        {/* --- Main Dashboard Sections --- */}
        <View style={styles.body}>
          {/* --- Fitness Goal Summary --- */}
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalBadgeRow}>
                <Dumbbell size={18} color="#7C4DFF" />
                <Text style={styles.goalTitle}>{fitnessGoal}</Text>
              </View>
              <Text style={styles.goalPercentage}>80%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '80%', backgroundColor: '#7C4DFF' }]} />
            </View>
            <Text style={styles.goalMotivation}>Keep pushing! Only 2 workouts left to hit your weekly target.</Text>
          </View>

          {/* --- Achievements --- */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsCard}>
            <View style={styles.achieveGrid}>
              <AchievementItem label="Streak" value="5 Days" icon={Award} color="#FFD700" />
              <AchievementItem label="Finished" value="14 Sessions" icon={Dumbbell} color="#7C4DFF" />
              <AchievementItem label="Longest Streak" value="12 Days" icon={TrendingUp} color="#10B981" />
            </View>
          </View>

          {/* --- Account Menu List --- */}
          <Text style={styles.sectionLabel}>Account Options</Text>
          <View style={styles.menuGroup}>
            {user && isAdmin && (
              <>
                <MenuOption 
                  icon={Shield} 
                  label="Admin Control Center" 
                  onPress={() => router.push('/admin-dashboard')} 
                />
                <Divider />
              </>
            )}
            <MenuOption 
              icon={User} 
              label="Personal Details" 
              onPress={() => router.push('/settings/edit-profile')} 
            />
            <Divider />
            <MenuOption 
              icon={Bell} 
              label="Notification Preferences" 
              hasSwitch={true}
              onPress={() => router.push('/settings/notifications')} 
            />
            <Divider />
            <MenuOption 
              icon={Sparkles} 
              label="Membership Status" 
              badge={isPremium ? 'Active' : 'Upgrade'}
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
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <LogOut size={28} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm Sign Out</Text>
            <Text style={styles.modalDesc}>Are you sure you want to log out of your FitAI dashboard?</Text>
            
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

function StatItem({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '10' }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubValue}>{subValue}</Text>
    </View>
  );
}

function AchievementItem({ label, value, icon: Icon, color }: any) {
  return (
    <View style={styles.achieveItem}>
      <View style={[styles.achieveIconWrap, { backgroundColor: color + '10' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.achieveValue}>{value}</Text>
      <Text style={styles.achieveLabel}>{label}</Text>
    </View>
  );
}

function MenuOption({ icon: Icon, label, onPress, badge, hasSwitch }: any) {
  const [isEnabled, setIsEnabled] = useState(true);
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.optionIconBox}>
        <Icon size={18} color="#64748B" />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
      
      {badge && (
        <View style={[styles.proBadge, badge === 'Active' ? styles.badgeActive : styles.badgeUpgrade]}>
          <Text style={[styles.proBadgeText, { color: badge === 'Active' ? '#10B981' : '#7C4DFF' }]}>{badge}</Text>
        </View>
      )}

      {hasSwitch ? (
        <TouchableOpacity 
          onPress={() => setIsEnabled(!isEnabled)}
          style={[styles.switchTrack, isEnabled ? { backgroundColor: '#7C4DFF' } : null]}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
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
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#7C4DFF',
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  editBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  editBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  statSubValue: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 28,
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  goalPercentage: {
    color: '#7C4DFF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalMotivation: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
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
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 12,
    marginLeft: 4,
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
    height: 60,
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
  optionLabel: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: '#F5F3FF',
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  badgeTextActive: {
    color: '#10B981',
  },
  badgeTextUpgrade: {
    color: '#7C4DFF',
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
    backgroundColor: '#7C4DFF',
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
  switchThumbEnabled: {
    transform: [{ translateX: 20 }],
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
    marginTop: 24,
    marginBottom: 40,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
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
});
