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
          {/* ── ACCOUNT SECTION ── */}
          <SectionLabel label="ACCOUNT" />
          <View style={styles.group}>
            <MenuOption 
              icon={User} 
              label="Edit Profile" 
              onPress={() => router.push('/settings/edit-profile')} 
            />
            <Divider />
            <MenuOption 
              icon={Star} 
              label="Upgrade to Premium" 
              badge="Pro"
              onPress={() => router.push('/upgrade')} 
            />
          </View>

          {/* ── PREFERENCES SECTION ── */}
          <SectionLabel label="PREFERENCES" />
          <View style={styles.group}>
            <MenuOption 
              icon={Bell} 
              label="Notifications" 
              hasSwitch={true}
              onPress={() => {}} 
            />
            <Divider />
            <MenuOption 
              icon={Settings} 
              label="Settings" 
              onPress={() => {}} 
            />
          </View>

          {/* ── SUPPORT SECTION ── */}
          <SectionLabel label="SUPPORT" />
          <View style={styles.group}>
            <MenuOption 
              icon={CircleHelp} 
              label="Help & Support" 
              onPress={() => router.push('/help')} 
            />
            <Divider />
            <MenuOption 
              icon={Sparkles} 
              label="Share App" 
              onPress={() => {}} 
            />
          </View>

          {/* ── ACCOUNT ACTIONS ── */}
          <SectionLabel label="ACCOUNT ACTIONS" />
          <View style={styles.group}>
            <TouchableOpacity 
              style={styles.logoutRow}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={styles.logoutIcon}>
                <LogOut size={20} color={Colors.error} />
              </View>
              <Text style={styles.logoutLabel}>Logout</Text>
              <ChevronRight size={18} color={Colors.textSecondary} opacity={0.3} />
            </TouchableOpacity>
          </View>

          <Text style={styles.footerVersion}>Fitness Tracker Pro v2.1.0</Text>
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

function MenuOption({ icon: Icon, label, onPress, badge, hasSwitch }: any) {
  const [isEnabled, setIsEnabled] = useState(true);
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.optionIconBox}>
        <Icon size={22} color="#FFF" strokeWidth={1.5} opacity={0.8} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
      
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
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
    opacity: 0.6,
  },
  group: {
    backgroundColor: '#111118',
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#1A1A24',
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
    backgroundColor: '#1A1A24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: '#2A2A3A',
    padding: 2,
    justifyContent: 'center',
  },
  switchEnabled: {
    backgroundColor: Colors.primary,
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
    backgroundColor: '#1A1A24',
    marginHorizontal: 18,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    height: 72,
  },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FF3B3015',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutLabel: {
    flex: 1,
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  footerVersion: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 40,
    opacity: 0.3,
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
