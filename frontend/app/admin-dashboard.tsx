import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, ActivityIndicator, TextInput, 
  Animated, Easing, useWindowDimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, ArrowLeft, Users, Activity, Search,
  LayoutDashboard, CreditCard, Calendar, Settings as SettingsIcon, LogOut,
  Trash2, Mail, Crown, ShieldAlert, CheckCircle2, Edit3
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { isAdminUser } from '@/utils/isAdmin';
import { APP_NAME, SUPPORT_EMAIL } from '@/constants/Brand';
import { safeBack } from '@/utils/navigation';

// ── Components ──

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <View style={s.statCardWrapper}>
      <View style={s.statCard}>
        <View style={s.statCardHeader}>
          <View style={[s.statIconBox, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} />
          </View>
        </View>
        <Text style={s.statValue}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isPremium = role === 'premium';
  const isAdmin = role === 'admin';
  return (
    <View style={[s.badge, isPremium ? s.badgeGold : isAdmin ? s.badgeRed : s.badgeBlue]}>
      {isPremium && <Crown size={12} color="#D4AF37" style={{ marginRight: 4 }} />}
      {isAdmin && <ShieldAlert size={12} color="#EF4444" style={{ marginRight: 4 }} />}
      <Text style={[s.badgeTextRed, isPremium ? s.badgeTextGold : isAdmin ? s.badgeTextRed : s.badgeTextBlue]}>
        {role.toUpperCase()}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const stat = status || 'Unknown';
  let color = '#38BDF8';
  let bg = 'rgba(56,189,248,0.1)';
  if (stat === 'Confirmed' || stat === 'Completed') {
    color = '#10B981'; bg = 'rgba(16,185,129,0.1)';
  } else if (stat === 'Cancelled') {
    color = '#EF4444'; bg = 'rgba(239,68,68,0.1)';
  }

  return (
    <View style={[s.badge, { backgroundColor: bg, borderColor: color + '30' }]}>
      <Text style={[s.badgeTextRed, { color }]}>{stat.toUpperCase()}</Text>
    </View>
  );
}

// ── Main Screen ──

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'Home' | 'Users' | 'Bookings' | 'Settings'>('Home');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ appName: APP_NAME, supportEmail: SUPPORT_EMAIL, maintenanceMode: false, premiumPricing: 2999 });

  const [userSearch, setUserSearch] = useState('');
  
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  const fetchData = async () => {
    try {
      const [st, us, bk, se] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/bookings'),
        api.get('/admin/settings')
      ]);
      setStats(st.data);
      setUsersList(us.data.users);
      setBookingsList(bk.data.bookings);
      setSettings(se.data);
    } catch (e) {
      console.log('Admin Fetch Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && !isAdminUser(user)) {
      router.replace('/');
    } else if (user) {
      fetchData();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'user' ? 'premium' : 'user';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateBooking = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'Confirmed' });
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await api.put('/admin/settings', settings);
      alert('System Settings updated successfully!');
    } catch (e) {
      console.log(e);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch) return usersList;
    return usersList.filter(u => 
      (u.fullName || u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [usersList, userSearch]);

  if (!user || (!isAdminUser(user) && !loading)) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }


  const tabs = [
    { id: 'Home', icon: LayoutDashboard },
    { id: 'Users', icon: Users },
    { id: 'Bookings', icon: Calendar },
    { id: 'Settings', icon: SettingsIcon },
  ];

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <LinearGradient colors={['#1E293B', '#0F172A']} style={[s.headerGradient, { paddingTop: insets.top + 16 }]}>
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => safeBack()} style={s.iconBtn}>
            <ArrowLeft size={22} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={s.headerTitleWrap}>
            <Shield size={20} color="#38BDF8" />
            <Text style={s.headerTitle}>Admin Portal</Text>
          </View>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/(auth)/login' as any); }} style={[s.iconBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <TouchableOpacity 
                key={t.id} 
                style={[s.tabPill, isActive && s.tabPillActive]}
                onPress={() => setActiveTab(t.id as any)}
                activeOpacity={0.8}
              >
                <Icon size={16} color={isActive ? '#0F172A' : '#94A3B8'} style={{ marginRight: 6 }} />
                <Text style={[s.tabText, isActive && s.tabTextActive]}>{t.id}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* CONTENT */}
      <ScrollView 
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40, maxWidth: 1000, width: '100%', alignSelf: 'center' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.skeletonWrapper}>
            {[1,2,3,4].map(i => (
              <Animated.View key={i} style={[s.skeletonCard, { opacity: pulseAnim }]} />
            ))}
          </View>
        ) : activeTab === 'Home' ? (
          <View>
            <Text style={s.sectionTitle}>System Overview</Text>
            <View style={s.statsGrid}>
              <StatCard icon={Users} color="#38BDF8" label="Total Users" value={stats?.totalUsers || 0} />
              <StatCard icon={Crown} color="#D4AF37" label="Premium Users" value={stats?.premiumUsers || 0} />
              <StatCard icon={Calendar} color="#10B981" label="Total Bookings" value={stats?.totalBookings || 0} />
              <StatCard icon={Activity} color="#8B5CF6" label="Active Plans" value={stats?.totalWorkoutPlans || 0} />
            </View>
            
            <View style={s.recentCard}>
              <View style={s.recentHeader}>
                <Text style={s.recentTitle}>System Health</Text>
                <CheckCircle2 size={20} color="#10B981" />
              </View>
              <Text style={s.recentSub}>All services are operational. APIs are responding within nominal parameters.</Text>
            </View>
          </View>

        ) : activeTab === 'Users' ? (
          <View>
            <View style={s.searchContainer}>
              <Search size={20} color="#64748B" style={s.searchIcon} />
              <TextInput
                style={s.searchInput}
                placeholder="Search users by name or email..."
                placeholderTextColor="#64748B"
                value={userSearch}
                onChangeText={setUserSearch}
              />
            </View>

            <Text style={s.sectionTitle}>User Directory ({filteredUsers.length})</Text>
            {filteredUsers.map((u: any) => (
              <View key={u._id || u.id} style={s.dataRow}>
                <View style={s.dataInfo}>
                  <Text style={s.dataTitle}>{u.fullName || u.name}</Text>
                  <Text style={s.dataSub}>{u.email}</Text>
                  <RoleBadge role={u.role || 'user'} />
                </View>
                <View style={s.dataActions}>
                  <TouchableOpacity onPress={() => handleUpdateRole(u._id || u.id, u.role)} style={s.actionBtn}>
                    <Edit3 size={18} color="#38BDF8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteUser(u._id || u.id)} style={[s.actionBtn, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }]}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {filteredUsers.length === 0 && <Text style={s.emptyText}>No users found.</Text>}
          </View>

        ) : activeTab === 'Bookings' ? (
          <View>
            <Text style={s.sectionTitle}>Recent Bookings</Text>
            {bookingsList.map((b: any) => (
              <View key={b._id} style={s.dataRow}>
                <View style={s.dataInfo}>
                  <Text style={s.dataTitle}>Session with {b.trainerId?.fullName || 'Trainer'}</Text>
                  <Text style={s.dataSub}>{b.bookingDate} at {b.bookingTime}</Text>
                  <Text style={s.dataMeta}>Client: {b.userId?.fullName || b.userId?.email || 'Unknown'}</Text>
                  <View style={{ marginTop: 8 }}><StatusBadge status={b.bookingStatus} /></View>
                </View>
                <View style={s.dataActions}>
                  {b.bookingStatus === 'Pending' && (
                    <TouchableOpacity onPress={() => handleUpdateBooking(b._id)} style={[s.actionBtn, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', width: 'auto', paddingHorizontal: 16 }]}>
                      <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 13 }}>CONFIRM</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            {bookingsList.length === 0 && <Text style={s.emptyText}>No bookings available.</Text>}
          </View>

        ) : (
          <View>
            <Text style={s.sectionTitle}>Platform Configuration</Text>
            
            <View style={s.formCard}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Platform Name</Text>
                <View style={s.inputWrapper}>
                  <Shield size={18} color="#64748B" style={s.inputIcon} />
                  <TextInput
                    style={s.inputField}
                    value={settings.appName}
                    onChangeText={(t) => setSettings({...settings, appName: t})}
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Support Email</Text>
                <View style={s.inputWrapper}>
                  <Mail size={18} color="#64748B" style={s.inputIcon} />
                  <TextInput
                    style={s.inputField}
                    value={settings.supportEmail}
                    onChangeText={(t) => setSettings({...settings, supportEmail: t})}
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Premium Price (PKR/mo)</Text>
                <View style={s.inputWrapper}>
                  <CreditCard size={18} color="#64748B" style={s.inputIcon} />
                  <TextInput
                    style={s.inputField}
                    value={String(settings.premiumPricing)}
                    onChangeText={(t) => setSettings({...settings, premiumPricing: parseInt(t) || 0})}
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleUpdateSettings}>
              <LinearGradient colors={['#38BDF8', '#0284C7']} style={s.saveBtnGrad}>
                <Text style={s.saveBtnText}>Save Configuration</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  
  headerGradient: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 0 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  
  tabScroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  tabPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabPillActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  tabText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#0F172A', fontWeight: '900' },

  content: { padding: 24 },
  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 },

  skeletonWrapper: { gap: 16 },
  skeletonCard: { height: 120, backgroundColor: '#1E293B', borderRadius: 20 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 },
  statCardWrapper: { width: '48%', marginBottom: 16 },
  statCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { color: '#F8FAFC', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  recentCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  recentTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  recentSub: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 15, fontWeight: '500' },

  dataRow: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12, alignItems: 'center' },
  dataInfo: { flex: 1, alignItems: 'flex-start' },
  dataTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  dataSub: { color: '#94A3B8', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  dataMeta: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  dataActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeBlue: { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' },
  badgeTextBlue: { color: '#38BDF8', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  badgeGold: { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.2)' },
  badgeTextGold: { color: '#D4AF37', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  badgeRed: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' },
  badgeTextRed: { color: '#EF4444', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  formCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 12 },
  inputField: { flex: 1, color: '#F8FAFC', fontSize: 15, fontWeight: '600' },

  saveBtn: { borderRadius: 100, overflow: 'hidden' },
  saveBtnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },

  emptyText: { color: '#64748B', fontSize: 14, textAlign: 'center', marginTop: 40, fontWeight: '500' }
});
