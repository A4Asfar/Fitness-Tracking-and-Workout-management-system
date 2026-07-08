import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Platform, Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ChevronRight, Bell, Shield, LogOut, Settings, 
  Sparkles, Camera, Dumbbell, TrendingUp, Ruler, Scale, 
  Award, Target, CheckCircle2, Heart, ShieldCheck, Mail, Lock, Languages, Eye, HelpCircle
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import api from '@/services/api';
import PremiumBadge from '@/components/PremiumBadge';

const { width } = Dimensions.get('window');

export default function SettingsCenterScreen() {
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
  const fitnessGoal = user?.fitnessGoal || 'General Fitness';

  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/premium/my');
        setStatusInfo(res.data);
      } catch (e) {
        console.log('Error fetching premium status:', e);
      } finally {
        setLoadingPayment(false);
      }
    };
    fetchStatus();
  }, [user]);

  const latestPurchase = statusInfo?.latestPurchase;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* --- Header --- */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* --- Profile Summary Card --- */}
        <View style={styles.profileCardWrap}>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <User size={30} color="#94A3B8" />
                )}
              </View>
              <View style={styles.profileText}>
                <Text style={styles.userName}>{user?.name || 'Peak Athlete'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@fitai.com'}</Text>
                
                <View style={styles.goalRow}>
                  <View style={styles.goalBadge}>
                    <Text style={styles.goalBadgeText}>{fitnessGoal}</Text>
                  </View>
                  {isPremium && <PremiumBadge />}
                </View>
              </View>
            </View>

            <View style={styles.profileDivider} />

            <TouchableOpacity 
              style={styles.editShortcut}
              onPress={() => router.push('/settings/edit-profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.editShortcutText}>Edit Profile Details</Text>
              <ChevronRight size={14} color="#10B981" />
            </TouchableOpacity>

            {/* Premium Status Card */}
            {(latestPurchase || statusInfo?.membershipType === 'premium') && (
              <View style={styles.premiumStatusCard}>
                <View style={styles.statusRowHeader}>
                  <Text style={styles.statusLabelText}>Membership Status</Text>
                  <View style={[
                    styles.statusBadge, 
                    statusInfo?.membershipType === 'premium' ? styles.statusBadgeApproved : 
                    latestPurchase?.status === 'Rejected' ? styles.statusBadgeRejected : 
                    styles.statusBadgePending
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      statusInfo?.membershipType === 'premium' ? { color: '#059669' } : 
                      latestPurchase?.status === 'Rejected' ? { color: '#EF4444' } : 
                      { color: '#B45309' }
                    ]}>
                      {statusInfo?.membershipType === 'premium' ? 'Active Pro' : 
                       latestPurchase?.status === 'Rejected' ? 'Rejected' : 
                       'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusMetaGrid}>
                  <Text style={styles.statusMetaText}>Current Plan: {statusInfo?.membershipType === 'premium' ? (latestPurchase?.plan || 'Premium') : 'Free'}</Text>
                  {statusInfo?.membershipExpiresAt && (
                    <Text style={styles.statusMetaText}>
                      Expires: {new Date(statusInfo.membershipExpiresAt).toLocaleDateString()}
                    </Text>
                  )}
                  {latestPurchase && latestPurchase.status === 'Pending' && (
                    <Text style={styles.statusMetaText}>
                      Payment Verification Pending...
                    </Text>
                  )}
                </View>

                <View style={styles.statusActions}>
                  <TouchableOpacity 
                    style={styles.statusActionBtn}
                    onPress={() => router.push('/premium')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.statusActionBtnText}>Renew Membership</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* --- Settings Groups --- */}
        
        {/* 1. Account */}
        <SettingsSection title="Account">
          <SettingsRow 
            icon={User} 
            title="Edit Profile" 
            subtitle="Change name, height, weight & goals"
            onPress={() => router.push('/settings/edit-profile')} 
          />
          <Divider />
          <SettingsRow 
            icon={Lock} 
            title="Security & Password" 
            subtitle="Update authentication password credentials"
            onPress={() => router.push('/forgot-password')} 
          />
          <Divider />
          <SettingsRow 
            icon={Eye} 
            title="Privacy Settings" 
            subtitle="Configure compliance & tracking details"
            onPress={() => router.push('/settings/privacy')} 
          />
        </SettingsSection>

        {/* 2. Fitness */}
        <SettingsSection title="Fitness & Goals">
          <SettingsRow 
            icon={Dumbbell} 
            title="Workout Preferences" 
            subtitle="Strength, cardio, and locations"
            onPress={() => router.push('/settings/edit-profile')} 
          />
          <Divider />
          <SettingsRow 
            icon={Target} 
            title="Daily Nutrition Goals" 
            subtitle="Calorie budget and target macros"
            onPress={() => router.push('/diet')} 
          />
          <Divider />
          <SettingsRow 
            icon={Scale} 
            title="Units of Measure" 
            subtitle="Metric (kg, cm) selected"
            badgeText="Metric"
          />
        </SettingsSection>

        {/* 3. Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow 
            icon={Bell} 
            title="Push Notifications" 
            subtitle="Alerts for workout reminders & schedules"
            hasSwitch={true}
          />
          <Divider />
          <SettingsRow 
            icon={Sparkles} 
            title="Daily Workout Reminders" 
            subtitle="Keep your training streaks active"
            hasSwitch={true}
            defaultSwitchValue={true}
          />
          <Divider />
          <SettingsRow 
            icon={Heart} 
            title="Meal & Hydration Tracker" 
            subtitle="Log meals and daily target reminders"
            hasSwitch={true}
            defaultSwitchValue={true}
          />
        </SettingsSection>

        {/* 4. Application */}
        <SettingsSection title="Application">
          <SettingsRow 
            icon={Languages} 
            title="Language" 
            subtitle="English (US) selected"
            badgeText="English"
          />
          <Divider />
          <SettingsRow 
            icon={HelpCircle} 
            title="Help & Support" 
            subtitle="FAQs, support tickets and troubleshooting"
            onPress={() => router.push('/ai-chat')} 
          />
          <Divider />
          <SettingsRow 
            icon={ShieldCheck} 
            title="Privacy Policy" 
            subtitle="View legal disclosures and data protection policies"
            onPress={() => router.push('/settings/privacy')} 
          />
        </SettingsSection>

        {/* --- Danger Zone / Logout --- */}
        <View style={styles.dangerZoneWrap}>
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Sign Out of FitAI</Text>
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

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({ icon: Icon, title, subtitle, onPress, badgeText, hasSwitch, defaultSwitchValue = false }: any) {
  const [isEnabled, setIsEnabled] = useState(defaultSwitchValue);
  
  const content = (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Icon size={18} color="#64748B" />
      </View>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      {badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
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
        onPress && <ChevronRight size={16} color="#94A3B8" />
      )}
    </View>
  );

  if (hasSwitch || !onPress) {
    return <View style={styles.rowContainer}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.rowContainer} onPress={onPress} activeOpacity={0.7}>
      {content}
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  profileCardWrap: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
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
  profileText: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  userEmail: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  goalBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  proBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  profileDivider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  editShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  editShortcutText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionWrap: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  rowContainer: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
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
  rowSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  badgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
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
  dangerZoneWrap: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  premiumStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 16,
  },
  statusRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabelText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeApproved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusMetaGrid: {
    gap: 4,
    marginBottom: 14,
  },
  statusMetaText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 10,
  },
  statusActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSupportBtn: {
    backgroundColor: '#FFFFFF',
  },
  statusActionBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
});
