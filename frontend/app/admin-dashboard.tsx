import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserMinus, 
  BarChart3, 
  Activity,
  ChevronRight,
  Database,
  History,
  LayoutDashboard
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.membershipType !== 'admin') {
      router.replace('/');
    } else {
      fetchStats();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (user.membershipType !== 'admin') {
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
          <ShieldCheck size={18} color="#FF3B30" fill="#FF3B3020" />
          <Text style={styles.headerTitle}>Admin Control Center</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>System Monitoring Dashboard</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
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
                label="Premium" value={stats?.premiumCount || 0} 
                delay={100}
              />
              <StatCard 
                icon={UserMinus} color="#A855F7" 
                label="Free Users" value={stats?.freeCount || 0} 
                delay={200}
              />
              <StatCard 
                icon={Activity} color="#9FE800" 
                label="Workouts" value={stats?.totalWorkouts || 0} 
                delay={300}
              />
            </View>

            {/* ── Recent Activity ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <History size={18} color={Colors.textSecondary} />
                <Text style={styles.sectionTitle}>Recent Activity</Text>
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

            {/* ── Quick Tools ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Database size={18} color={Colors.textSecondary} />
                <Text style={styles.sectionTitle}>Admin Quick Tools</Text>
              </View>
              <ToolCard 
                icon={Users} title="View Users" 
                desc="Browse and manage user profiles & roles." 
                onPress={() => {}} 
              />
              <ToolCard 
                icon={LayoutDashboard} title="Membership Overview" 
                desc="Detailed breakdown of subscription tiers." 
                onPress={() => {}} 
              />
              <ToolCard 
                icon={BarChart3} title="Workout Data Overview" 
                desc="Global workout frequency and volume stats." 
                onPress={() => {}} 
              />
            </View>
          </>
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
});
