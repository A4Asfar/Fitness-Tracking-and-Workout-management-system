import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Modal, Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, SPACING, SharedStyles } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ChevronRight, Bell, Shield, 
  CircleHelp, Info, LogOut, Settings, 
  Star, Sparkles, CreditCard, Camera,
  UserCheck, ShieldAlert, Heart, MessageSquare
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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

  const isPremium = user?.membershipType === 'premium' || user?.membershipType === 'admin';

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Hero Profile Header ── */}
        <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
          <LinearGradient
            colors={[Colors.primary + '20', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/settings/edit-profile')}
            >
              <View style={styles.avatarWrap}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <User size={32} color={Colors.primary} strokeWidth={2} />
                )}
              </View>
              <View style={styles.avatarBadge}>
                <Camera size={10} color="#000" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileMeta}>
              <Text style={styles.userName}>{user?.name || 'Fitness Athlete'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email linked'}</Text>
              
              <View style={styles.statusRow}>
                <View style={[styles.membershipBadge, isPremium && styles.premiumBadge]}>
                  <Star size={10} color={isPremium ? '#000' : Colors.primary} fill={isPremium ? '#000' : Colors.primary} />
                  <Text style={[styles.membershipText, isPremium && styles.premiumText]}>
                    {(user?.membershipType || 'FREE').toUpperCase()}
                  </Text>
                </View>
                {isPremium && (
                  <View style={styles.verifiedBadge}>
                    <UserCheck size={10} color={Colors.primary} />
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.manageBtn}
            onPress={() => router.push('/settings/edit-profile')}
          >
            <Settings size={16} color="#000" strokeWidth={2.5} />
            <Text style={styles.manageBtnText}>MANAGE PROFILE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* ── Premium Promotion ── */}
          {!isPremium && (
            <TouchableOpacity 
              style={styles.upgradeCard}
              onPress={() => router.push('/upgrade')}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={[Colors.primary, '#9FE800']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
                style={styles.upgradeGrad}
              >
                <View style={styles.upgradeIconBox}>
                  <Sparkles size={24} color="#000" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.upgradeTitle}>Unlock Premium</Text>
                  <Text style={styles.upgradeSub}>Get AI insights & unlimited logs</Text>
                </View>
                <ChevronRight size={20} color="#000" strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ── Account Settings ── */}
          <SectionLabel label="ACCOUNT SETTINGS" />
          <View style={styles.menuBox}>
            <MenuOption 
              icon={Bell} 
              label="Notifications" 
              sub="Alerts & reminders"
              onPress={() => router.push('/settings/notifications')} 
            />
            <Divider />
            <MenuOption 
              icon={Shield} 
              label="Security & Privacy" 
              sub="Password & data"
              onPress={() => router.push('/settings/privacy')} 
            />
            <Divider />
            <MenuOption 
              icon={CreditCard} 
              label="Subscription" 
              sub="Manage billing"
              onPress={() => router.push('/upgrade')} 
            />
          </View>

          {/* ── Preferences & Support ── */}
          <SectionLabel label="SUPPORT & ABOUT" />
          <View style={styles.menuBox}>
            <MenuOption 
              icon={CircleHelp} 
              label="Help Center" 
              sub="FAQ & support"
              onPress={() => router.push('/help')} 
            />
            <Divider />
            <MenuOption 
              icon={Heart} 
              label="Feedback" 
              sub="Rate your experience"
              onPress={() => Alert.alert('Feedback', 'Thank you for your support!')} 
            />
            <Divider />
            <MenuOption 
              icon={Info} 
              label="About FitPro" 
              sub="App version & terms"
              onPress={() => router.push('/about')} 
            />
          </View>

          {/* ── Danger Zone ── */}
          <SectionLabel label="DANGER ZONE" />
          <TouchableOpacity 
            style={styles.logoutRow}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.logoutIcon}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text style={styles.logoutLabel}>Sign Out of Session</Text>
            <ShieldAlert size={18} color={Colors.error} opacity={0.5} />
          </TouchableOpacity>

          <Text style={styles.footerVersion}>FITPRO AI • VERSION 1.5.2 (BETA)</Text>
        </View>
      </ScrollView>

      {/* ── Logout Confirmation ── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <BlurView intensity={Platform.OS === 'ios' ? 30 : 100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <LogOut size={32} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Confirm Sign Out</Text>
            <Text style={styles.modalDesc}>Are you sure you want to end your session? Your training data is safely synced to the cloud.</Text>
            
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

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function MenuOption({ icon: Icon, label, sub, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.optionIconBox}>
        <Icon size={20} color={Colors.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionSub}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={Colors.border} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  profileMeta: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  premiumBadge: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  membershipText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  premiumText: {
    color: '#000',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  manageBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  body: {
    padding: 24,
  },
  upgradeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  upgradeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  upgradeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  upgradeSub: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuBox: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  optionSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    opacity: 0.5,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '08',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error + '20',
    gap: 16,
  },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutLabel: {
    flex: 1,
    color: Colors.error,
    fontSize: 15,
    fontWeight: '800',
  },
  footerVersion: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 40,
    letterSpacing: 1.5,
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  modalDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  confirmBtn: {
    flex: 1.2,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
