import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  Activity,
  ChevronRight,
  Database,
  History,
  LayoutDashboard,
  CreditCard,
  Trash2,
  Calendar,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react-native';
import { isAdminUser } from '@/utils/isAdmin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { APP_NAME, SUPPORT_EMAIL } from '@/constants/Brand';
import { safeBack } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statCardWrap}>
      <LinearGradient colors={[color + '15', color + '05']} style={styles.statCard}>
        <View style={[styles.statIconWrap, { backgroundColor: color + '25' }]}>
          <Icon size={22} color={color} />
        </View>
        <View style={styles.statTextWrap}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function ToolCard({ icon: Icon, title, desc, onPress }: { icon: any; title: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.toolIcon}>
        <Icon size={24} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolDesc}>{desc}</Text>
      </View>
      <View style={styles.toolChevron}>
        <ChevronRight size={18} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (e) {
      console.log('Error fetching stats:', e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'Home' | 'Users' | 'Bookings' | 'Settings'>('Home');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ appName: APP_NAME, supportEmail: SUPPORT_EMAIL, maintenanceMode: false, premiumPricing: 2999 });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data.users);
    } catch (e) {
      console.log('Error fetching users:', e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookingsList(res.data.bookings);
    } catch (e) {
      console.log('Error fetching bookings:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data);
    } catch (e) {
      console.log('Error fetching settings:', e);
    }
  };

  useEffect(() => {
    if (user && !isAdminUser(user)) {
      router.replace('/');
    } else if (user) {
      fetchStats();
      fetchUsers();
      fetchBookings();
      fetchSettings();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
    fetchUsers();
    fetchBookings();
    fetchSettings();
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (e) {
      console.log('Error updating role:', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (e) {
      console.log('Error deleting user:', e);
    }
  };

  const handleUpdateBooking = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings();
    } catch (e) {
      console.log('Error updating booking:', e);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await api.put('/admin/settings', settings);
      alert('System Settings updated successfully!');
    } catch (e) {
      console.log('Error updating settings:', e);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAdminUser(user)) {
    return null;
  }

  const tabs = [
    { id: 'Home', icon: LayoutDashboard },
    { id: 'Users', icon: Users },
    { id: 'Bookings', icon: Calendar },
    { id: 'Settings', icon: SettingsIcon },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Modern Header ── */}
      <LinearGradient colors={['#1E293B', '#0F172A']} style={[styles.headerGradient, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Shield size={20} color="#38BDF8" />
            <Text style={styles.headerTitle}>Admin Center</Text>
          </View>
          <TouchableOpacity 
            onPress={async () => {
              await logout();
              router.replace('/login');
            }} 
            style={[styles.backButton, { backgroundColor: '#EF444420' }]}
          >
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* ── Pill Navigation Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((t: any) => {
            const Icon = t.icon;
            const isActive = activeSubTab === t.id;
            return (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.pillTab, isActive && styles.pillTabActive]}
                onPress={() => setActiveSubTab(t.id as any)}
                activeOpacity={0.7}
              >
                <Icon size={16} color={isActive ? '#FFF' : '#94A3B8'} style={{ marginRight: 6 }} />
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{t.id}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : activeSubTab === 'Home' ? (
          <>
            {/* ── Stat Cards Grid ── */}
            <View style={styles.statsGrid}>
              <StatCard icon={Users} color="#0EA5E9" label="Total Users" value={stats?.totalUsers || 0} />
              <StatCard icon={UserCheck} color="#F59E0B" label="Premium" value={stats?.premiumUsers || 0} />
              <StatCard icon={Database} color="#8B5CF6" label="Trainers" value={stats?.totalTrainers || 0} />
              <StatCard icon={Activity} color="#10B981" label="Bookings" value={stats?.activeBookings || 0} />
              <StatCard icon={LayoutDashboard} color="#14B8A6" label="Workouts" value={stats?.workoutsLogged || 0} />
              <StatCard icon={CreditCard} color="#F43F5E" label="Revenue (PKR)" value={stats?.totalRevenue || 0} />
            </View>

            {/* ── Verify Premium Box ── */}
            <View style={styles.section}>
              <ToolCard 
                icon={CreditCard} title="Verify Premium Invoices" 
                desc="Review and approve user bank transfer receipts." 
                onPress={() => router.push('/admin/verify-payments' as any)} 
              />
            </View>

            {/* ── Recent Activity Timeline ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Registrations</Text>
              <View style={styles.timelineBox}>
                {stats?.recentActivity?.users?.map((u: any, i: number) => (
                  <View key={u._id} style={styles.timelineRow}>
                    <View style={styles.timelineLineWrapper}>
                      <View style={styles.timelineDot} />
                      {i !== (stats.recentActivity.users.length - 1) && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineText}>
                        New user <Text style={styles.timelineHighlight}>{u.name}</Text> joined as <Text style={styles.timelineHighlight}>{u.membershipType}</Text>
                      </Text>
                      <Text style={styles.timelineDate}>{new Date(u.createdAt).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
                {(!stats?.recentActivity?.users || stats.recentActivity.users.length === 0) && (
                  <Text style={styles.emptyText}>No recent activity</Text>
                )}
              </View>
            </View>
          </>
        ) : activeSubTab === 'Users' ? (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitleDark}>User Directory</Text>
            {usersList.map((u) => (
              <View key={u._id} style={styles.modernCard}>
                <View style={styles.modernCardHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.modernCardInfo}>
                    <Text style={styles.modernCardName}>{u.name}</Text>
                    <Text style={styles.modernCardSub}>{u.email}</Text>
                  </View>
                  <View style={[styles.badge, u.membershipType === 'premium' ? styles.badgePremium : (u.membershipType === 'admin' ? styles.badgeAdmin : styles.badgeFree)]}>
                    <Text style={[styles.badgeText, u.membershipType === 'premium' ? styles.badgeTextPremium : (u.membershipType === 'admin' ? styles.badgeTextAdmin : styles.badgeTextFree)]}>
                      {u.membershipType.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modernActions}>
                  {u.membershipType !== 'admin' ? (
                    <TouchableOpacity style={[styles.pillBtn, { backgroundColor: '#1E293B' }]} onPress={() => handleUpdateRole(u._id, 'admin')}>
                      <Shield size={14} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.pillBtnText, { color: '#FFF' }]}>Make Admin</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.pillBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => handleUpdateRole(u._id, 'free')}>
                      <UserCheck size={14} color="#475569" style={{ marginRight: 6 }} />
                      <Text style={[styles.pillBtnText, { color: '#475569' }]}>Remove Admin</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.iconBtnDanger} onPress={() => handleDeleteUser(u._id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : activeSubTab === 'Bookings' ? (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitleDark}>Schedule Requests</Text>
            {bookingsList.map((b) => (
              <View key={b._id} style={styles.modernCard}>
                <View style={styles.bookingHeader}>
                  <View>
                    <Text style={styles.bookingRoleLabel}>Client</Text>
                    <Text style={styles.bookingName}>{b.userId?.name || 'Unknown User'}</Text>
                  </View>
                  <View style={styles.bookingDivider} />
                  <View>
                    <Text style={styles.bookingRoleLabel}>Trainer</Text>
                    <Text style={styles.bookingName}>{b.trainerId?.fullName || b.trainerId?.name || 'Unknown Trainer'}</Text>
                  </View>
                </View>
                
                <View style={styles.bookingDetails}>
                  <Calendar size={14} color="#64748B" />
                  <Text style={styles.bookingTimeText}>{b.bookingDate} at {b.bookingTime}</Text>
                  <View style={[styles.badge, { marginLeft: 'auto' }, b.bookingStatus === 'Pending' ? styles.badgePending : styles.badgeConfirmed]}>
                    <Text style={[styles.badgeText, b.bookingStatus === 'Pending' ? styles.badgeTextPending : styles.badgeTextConfirmed]}>
                      {b.bookingStatus}
                    </Text>
                  </View>
                </View>

                {b.bookingStatus === 'Pending' && (
                  <View style={styles.modernActions}>
                    <TouchableOpacity style={[styles.pillBtn, { backgroundColor: '#10B981', flex: 1 }]} onPress={() => handleUpdateBooking(b._id, 'Confirmed')}>
                      <Text style={[styles.pillBtnText, { color: '#FFF' }]}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pillBtn, { backgroundColor: '#EF4444', flex: 1 }]} onPress={() => handleUpdateBooking(b._id, 'Cancelled')}>
                      <Text style={[styles.pillBtnText, { color: '#FFF' }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitleDark}>Global Configuration</Text>
            <View style={styles.settingsForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>App Title Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.modernInput} 
                    value={settings.appName} 
                    onChangeText={(val) => setSettings((prev: any) => ({ ...prev, appName: val }))}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Support Helpdesk Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.modernInput} 
                    value={settings.supportEmail} 
                    onChangeText={(val) => setSettings((prev: any) => ({ ...prev, supportEmail: val }))}
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Premium Plan Price (PKR)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputPrefix}>Rs.</Text>
                  <TextInput 
                    style={[styles.modernInput, { paddingLeft: 40 }]} 
                    value={String(settings.premiumPricing)} 
                    onChangeText={(val) => setSettings((prev: any) => ({ ...prev, premiumPricing: Number(val) }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <TouchableOpacity onPress={handleUpdateSettings} activeOpacity={0.8}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tabScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  pillTabActive: {
    backgroundColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 24,
  },
  loadingBox: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCardWrap: {
    width: (width - SPACING.lg * 2 - 12) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statCard: {
    padding: 16,
    flexDirection: 'column',
    gap: 12,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextWrap: {
    marginTop: 4,
  },
  statValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionTitleDark: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  toolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  toolDesc: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  toolChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLineWrapper: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  timelineHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  timelineDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listSection: {
    paddingBottom: 40,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  modernCardInfo: {
    flex: 1,
  },
  modernCardName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  modernCardSub: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePremium: { backgroundColor: '#FEF3C7' },
  badgeTextPremium: { color: '#D97706', fontSize: 10, fontWeight: '800' },
  badgeAdmin: { backgroundColor: '#E0E7FF' },
  badgeTextAdmin: { color: '#4338CA', fontSize: 10, fontWeight: '800' },
  badgeFree: { backgroundColor: '#F1F5F9' },
  badgeTextFree: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  modernActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtnDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookingRoleLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bookingName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  bookingDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingTimeText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  badgePending: { backgroundColor: '#FFF7ED' },
  badgeTextPending: { color: '#EA580C', fontSize: 11, fontWeight: '700' },
  badgeConfirmed: { backgroundColor: '#ECFDF5' },
  badgeTextConfirmed: { color: '#059669', fontSize: 11, fontWeight: '700' },
  settingsForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  modernInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  inputPrefix: {
    position: 'absolute',
    left: 16,
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
    zIndex: 1,
  },
  saveBtnGradient: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
