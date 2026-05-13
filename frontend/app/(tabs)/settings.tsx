import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Platform, Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, SPACING, SharedStyles } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ChevronRight, Bell, Shield, ShieldCheck,
  CircleHelp, Info, LogOut, Settings, 
  Star, Sparkles, Camera, UserCheck,
  Play, TrendingUp, Dumbbell, Target
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

  const isAdmin = user?.membershipType === 'admin' || user?.email === 'admin@peakpulse.ai';
  const isPremium = user?.membershipType === 'premium' || isAdmin;

  // Calculate real stats from user data
  const weightKg = user?.weight || 0;
  const heightCm = user?.height || 0;
  const fitnessGoal = user?.fitnessGoal || 'Not set';

  const bmi = (weightKg > 0 && heightCm > 0) 
    ? (weightKg / ((heightCm / 100) ** 2)) 
    : null;

  const weightLbs = Math.round(weightKg * 2.20462);
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const heightStr = heightCm > 0 ? `${feet}'${inches}"` : '0\'0"';

  return (
    <View style={[SharedStyles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Page Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={{ color: Colors.primary, fontSize: 10, fontWeight: 'bold' }}>DEBUG: {user?.email} | ROLE: {user?.membershipType}</Text>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your fitness journey</Text>
        </View>

        {/* ── Gradient Profile Card ── */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#33E1FF', '#4F33FF', '#CC33FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileInfo}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => router.push('/settings/edit-profile')}
              >
                <View style={styles.avatarWrap}>
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                  ) : (
                    <User size={40} color="#FFF" strokeWidth={1.5} />
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Camera size={12} color="#000" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              <View style={styles.profileText}>
                <Text style={styles.userName}>{user?.name || 'Fitness Athlete'}</Text>
                <Text style={styles.userRole}>{isPremium ? 'Premium Member' : 'Standard Member'}</Text>
                <View style={styles.proTag}>
                  <Sparkles size={10} color="#FFF" />
                  <Text style={styles.proTagText}>{isPremium ? 'Pro Plan' : 'Free Plan'}</Text>
                </View>
              </View>
            </View>

            {/* ── Stats Row ── */}
            <View style={styles.statsRow}>
              <StatItem 
                label="Weight" 
                value={weightKg > 0 ? `${weightLbs} lbs` : '--'} 
                subValue={weightKg > 0 ? `${weightKg} kg` : 'Not set'} 
              />
              <StatItem 
                label="Height" 
                value={heightCm > 0 ? heightStr : '--'} 
                subValue={heightCm > 0 ? `${heightCm} cm` : 'Not set'} 
              />
              <StatItem 
                label="Goal" 
                value={fitnessGoal !== 'Not set' ? fitnessGoal.split(' ')[0] : '--'} 
                subValue={bmi ? `BMI: ${bmi.toFixed(1)}` : 'Set stats'} 
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.body}>
          {/* ── YOUR GOALS SECTION ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
          </View>
          
          <View style={styles.goalsGrid}>
            <GoalCard 
              title="Workouts" 
              icon={Dumbbell} 
              count="12" 
              subtitle="This month" 
              color="#33E1FF"
            />
            <GoalCard 
              title="Progress" 
              icon={TrendingUp} 
              count="+4%" 
              subtitle="Weight loss" 
              color="#CC33FF"
            />
          </View>

          {/* ── MENU GROUPS ── */}
          <SectionLabel label="ACCOUNT" />
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
              label="Edit Profile" 
              onPress={() => router.push('/settings/edit-profile')} 
            />
            <Divider />
            {isPremium ? (
              <MenuOption 
                icon={Star} 
                label="Premium Status" 
                badge="Active"
                subtitle={user?.membershipExpiresAt ? `Expires: ${new Date(user.membershipExpiresAt).toLocaleDateString()}` : 'Lifetime Access'}
                onPress={() => router.push('/upgrade')} 
              />
            ) : (
              <MenuOption 
                icon={Star} 
                label="Upgrade to Premium" 
                badge="Pro"
                onPress={() => router.push('/upgrade')} 
              />
            )}
          </View>

          <SectionLabel label="PREFERENCES" />
          <View style={styles.menuGroup}>
            <MenuOption 
              icon={Bell} 
              label="Notifications" 
              hasSwitch={true}
              onPress={() => router.push('/settings/notifications')} 
            />
            <Divider />
            <MenuOption 
              icon={Settings} 
              label="Settings" 
              onPress={() => router.push('/settings/privacy')} 
            />
          </View>

          <SectionLabel label="SUPPORT" />
          <View style={styles.menuGroup}>
            <MenuOption 
              icon={CircleHelp} 
              label="Help & Support" 
              onPress={() => router.push('/help')} 
            />
          </View>

          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Floating Action Button ── */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#CC33FF', '#4F33FF']}
          style={styles.fabGradient}
        >
          <Play size={28} color="#FFF" fill="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Logout Confirmation ── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <LogOut size={32} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Confirm Sign Out</Text>
            <Text style={styles.modalDesc}>Are you sure you want to end your session?</Text>
            
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

function StatItem({ label, value, subValue }: any) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubValue}>{subValue}</Text>
    </View>
  );
}

function GoalCard({ title, icon: Icon, count, subtitle, color }: any) {
  return (
    <TouchableOpacity style={styles.goalCard}>
      <View style={[styles.goalIconBox, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={styles.goalCount}>{count}</Text>
        <Text style={styles.goalTitle}>{title}</Text>
        <Text style={styles.goalSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function MenuOption({ icon: Icon, label, onPress, badge, hasSwitch, subtitle }: any) {
  const [isEnabled, setIsEnabled] = useState(true);
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.optionIconBox}>
        <Icon size={20} color="#FFF" opacity={0.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionLabel}>{label}</Text>
        {subtitle && <Text style={styles.optionSubLabel}>{subtitle}</Text>}
      </View>
      
      {badge && (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>{badge}</Text>
        </View>
      )}

      {hasSwitch ? (
        <TouchableOpacity 
          onPress={() => setIsEnabled(!isEnabled)}
          style={[styles.switchTrack, isEnabled && styles.switchEnabled]}
        >
          <View style={[styles.switchThumb, isEnabled && styles.switchThumbEnabled]} />
        </TouchableOpacity>
      ) : (
        <ChevronRight size={18} color={Colors.textSecondary} opacity={0.3} />
      )}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 32,
    padding: 24,
    shadowColor: '#4F33FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#33E1FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F33FF',
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statSubValue: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 4,
  },
  body: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  goalsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  goalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCount: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  goalTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  goalSubtitle: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    fontWeight: '500',
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
    opacity: 0.5,
  },
  menuGroup: {
    backgroundColor: '#0A0A0A',
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    height: 72,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  proBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#222',
    padding: 2,
    justifyContent: 'center',
  },
  switchEnabled: {
    backgroundColor: '#CCFF00',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
  },
  switchThumbEnabled: {
    transform: [{ translateX: 20 }],
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 18,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 40,
    opacity: 0.8,
  },
  logoutBtnText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#CC33FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1.2,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
