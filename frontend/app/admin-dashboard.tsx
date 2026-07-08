import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserMinus, 
  BarChart3, 
  Activity,
  ChevronRight,
  Database,
  History,
  LayoutDashboard,
  CreditCard,
  Trash2
} from 'lucide-react-native';
import { isAdminUser } from '@/utils/isAdmin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_NAME, SUPPORT_EMAIL } from '@/constants/Brand';
import { safeBack } from '@/utils/navigation';

const { width } = Dimensions.get('window');

function StatCard({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string | number; color: string; delay: number }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
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
      <ChevronRight size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
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
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAdminUser(user)) {
    return null;
  }

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Shield size={18} color="#FF3B30" fill="#FF3B3020" />
          <Text style={styles.headerTitle}>Admin Control Center ({activeSubTab})</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* ── Navigation Tabs ── */}
      <View style={styles.tabBar}>
        {['Home', 'Users', 'Bookings', 'Settings'].map((t: any) => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tabItem, activeSubTab === t && styles.tabItemActive]}
            onPress={() => setActiveSubTab(t)}
          >
            <Text style={[styles.tabText, activeSubTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
            {/* ── Stat Cards ── */}
            <View style={styles.statsGrid}>
              <StatCard 
                icon={Users} color="#00D1FF" 
                label="Total Users" value={stats?.totalUsers || 0} 
                delay={0}
              />
              <StatCard 
                icon={UserCheck} color="#FFD700" 
                label="Premium" value={stats?.premiumUsers || 0} 
                delay={100}
              />
              <StatCard 
                icon={Database} color="#A855F7" 
                label="Trainers" value={stats?.totalTrainers || 0} 
                delay={200}
              />
              <StatCard 
                icon={Activity} color="#9FE800" 
                label="Active Bookings" value={stats?.activeBookings || 0} 
                delay={300}
              />
              <StatCard 
                icon={LayoutDashboard} color="#059669" 
                label="Workouts Logged" value={stats?.workoutsLogged || 0} 
                delay={400}
              />
              <StatCard 
                icon={CreditCard} color="#F59E0B" 
                label="Revenue (PKR)" value={stats?.totalRevenue || 0} 
                delay={500}
              />
            </View>

            {/* ── Recent Activity ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <History size={18} color={Colors.textSecondary} />
                <Text style={styles.sectionTitle}>Recent Registrations</Text>
              </View>
              <View style={styles.activityBox}>
                {stats?.recentActivity?.users?.map((u: any, i: number) => (
                  <View key={u._id} style={[styles.activityRow, i === 0 && { borderTopWidth: 0 }]}>
                    <View style={styles.activityDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityText}>
                        New user <Text style={styles.activityHighlight}>{u.name}</Text> joined as {u.membershipType}
                      </Text>
                      <Text style={styles.activityTime}>{new Date(u.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Legacy Verify Payments Hook ── */}
            <View style={styles.section}>
              <ToolCard 
                icon={CreditCard} title="Verify Premium Invoices" 
                desc="Go to Premium Membership payment audit interface." 
                onPress={() => router.push('/admin/verify-payments' as any)} 
              />
            </View>
          </>
        ) : activeSubTab === 'Users' ? (
          <View style={styles.listSection}>
            <Text style={styles.sectionHeaderTitle}>User Directory</Text>
            {usersList.map((u) => (
              <View key={u._id} style={styles.adminItemCard}>
                <View style={styles.adminItemInfo}>
                  <Text style={styles.adminItemName}>{u.name}</Text>
                  <Text style={styles.adminItemSub}>{u.email} ({u.membershipType})</Text>
                </View>
                <View style={styles.adminActionsRow}>
                  {u.membershipType !== 'admin' ? (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateRole(u._id, 'admin')}>
                      <Text style={styles.actionBtnText}>Make Admin</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSec]} onPress={() => handleUpdateRole(u._id, 'free')}>
                      <Text style={styles.actionBtnTextSec}>Remove Admin</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteUser(u._id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : activeSubTab === 'Bookings' ? (
          <View style={styles.listSection}>
            <Text style={styles.sectionHeaderTitle}>All Schedule Requests</Text>
            {bookingsList.map((b) => (
              <View key={b._id} style={styles.adminItemCard}>
                <View style={styles.adminItemInfo}>
                  <Text style={styles.adminItemName}>Client: {b.userId?.name || 'User'}</Text>
                  <Text style={styles.adminItemSub}>Coach: {b.trainerId?.fullName || b.trainerId?.name || 'Coach'}</Text>
                  <Text style={styles.adminItemMeta}>{b.bookingDate} at {b.bookingTime} ({b.bookingStatus})</Text>
                </View>
                {b.bookingStatus === 'Pending' && (
                  <View style={styles.adminActionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateBooking(b._id, 'Confirmed')}>
                      <Text style={styles.actionBtnText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSec]} onPress={() => handleUpdateBooking(b._id, 'Cancelled')}>
                      <Text style={styles.actionBtnTextSec}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.sectionHeaderTitle}>Global Platform Config</Text>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>App Title Name</Text>
              <TextInput 
                style={styles.formInput} 
                value={settings.appName} 
                onChangeText={(val) => setSettings((prev: any) => ({ ...prev, appName: val }))}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Support Helpdesk Email</Text>
              <TextInput 
                style={styles.formInput} 
                value={settings.supportEmail} 
                onChangeText={(val) => setSettings((prev: any) => ({ ...prev, supportEmail: val }))}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Premium Plan Price (PKR)</Text>
              <TextInput 
                style={styles.formInput} 
                value={String(settings.premiumPricing)} 
                onChangeText={(val) => setSettings((prev: any) => ({ ...prev, premiumPricing: Number(val) }))}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.saveSettingsBtn} onPress={handleUpdateSettings}>
              <Text style={styles.saveSettingsBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 28,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  loadingBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - SPACING.lg * 2 - 12) / 2,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  activityBox: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  activityText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  activityHighlight: {
    color: Colors.text,
    fontWeight: '700',
  },
  activityTime: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  toolCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  toolDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Subtabs Navigation Style
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  // Management Views Style
  listSection: {
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 16,
  },
  adminItemCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  adminItemInfo: {
    marginBottom: 12,
  },
  adminItemName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  adminItemSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  adminItemMeta: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '700',
  },
  adminActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800' as const,
  },
  actionBtnSec: {
    backgroundColor: '#F1F5F9',
  },
  actionBtnTextSec: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form Fields Style
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveSettingsBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveSettingsBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800' as const,
  },
});
