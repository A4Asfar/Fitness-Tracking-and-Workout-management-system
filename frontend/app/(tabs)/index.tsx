import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Text, TouchableOpacity
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Theme';
import api from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlusCircle, History as HistoryIcon, TrendingUp, Users, Sparkles, Bell,
  HeartPulse, Scale, Target, Bot, Dumbbell, Flame, Zap
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SkeletonCard, { SkeletonItem } from '@/components/SkeletonCard';

// Extracted Premium Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import HeroCard from '@/components/dashboard/HeroCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import WorkoutPreview from '@/components/dashboard/WorkoutPreview';
import NutritionCard from '@/components/dashboard/NutritionCard';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import SectionHeader from '@/components/dashboard/SectionHeader';
import EmptyState from '@/components/workout/EmptyState';
import Storage from '@/utils/storage';
import PremiumOnboardingModal from '@/components/dashboard/PremiumOnboardingModal';
import FloatingChatButton from '@/components/dashboard/FloatingChatButton';

const QUICK_ACTIONS_CONFIG = [
  {
    title: 'Log Workout',
    desc: 'Log training logs',
    icon: PlusCircle,
    route: '/create-workout',
    color: '#10B981',
  },
  {
    title: 'Find Trainer',
    desc: 'Hire an expert',
    icon: Users,
    route: '/(tabs)/trainers',
    color: '#00B0FF',
  },
  {
    title: 'My Bookings',
    desc: 'View sessions',
    icon: HistoryIcon,
    route: '/my-bookings',
    color: '#A855F7',
  },
  {
    title: 'Weight Logger',
    desc: 'Record body weight',
    icon: Scale,
    route: '/weight-logger',
    color: '#10B981',
  },
  {
    title: 'Body Health',
    desc: 'Track BMI & status',
    icon: HeartPulse,
    route: '/body-health',
    color: '#00B0FF',
  },
];

export default function HomeDashboard() {
  const { user, isNewUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const flag = await Storage.getItem(`hasSeenOnboarding_${user.id}`);
        if (!flag && isNewUser) {
          setShowOnboarding(true);
        }
      }
    };
    checkOnboarding();
  }, [user, isNewUser]);

  const fetchData = async () => {
    setError(null);
    try {
      const [analyticsRes, workoutsRes] = await Promise.all([
        api.get('/workouts/analytics'),
        api.get('/workouts'),
      ]);
      
      setStats(analyticsRes.data);
      setRecent(workoutsRes.data.slice(0, 3)); // Get top 3 recent workouts

      // Fetch premium insights if applicable
      if (user?.membershipType === 'premium' || user?.membershipType === 'admin') {
        const insightsRes = await api.get('/workouts/home-insights');
        setInsights(insightsRes.data);
      } else {
        setInsights({
          advice: "Upgrade to PRO to unlock advanced AI-driven training insights and personalized recovery scores."
        });
      }
    } catch (e: any) {
      if (__DEV__) console.log('Home fetch error:', e);
      setError(e.message || 'Failed to sync dashboard. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const fmt = (d: string) => {
    if (!d) return 'Never';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingHorizontal: 20 }]}>
        <View style={{ marginBottom: 24 }}>
          <SkeletonItem width="40%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonItem width="60%" height={16} />
        </View>
        <SkeletonCard style={{ height: 180, marginBottom: 20 }} />
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <SkeletonCard style={{ flex: 1, height: 100 }} />
          <SkeletonCard style={{ flex: 1, height: 100 }} />
        </View>
        <SkeletonCard style={{ height: 120 }} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>SYNC ERROR</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => { setLoading(true); fetchData(); }} 
          style={styles.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>RETRY SYNC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPremium = user?.membershipType === 'premium' || user?.membershipType === 'admin';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* Dynamic header welcome */}
        <DashboardHeader 
          userName={user?.name || 'Athlete'}
          streakCount={stats?.streak || 0}
          onNotificationPress={() => router.push('/notifications' as any)}
          onSettingsPress={() => router.push('/settings' as any)}
        />

        <View style={styles.content}>
          {/* Main Hero Card stats */}
          <HeroCard 
            steps={stats?.todaySteps || 0}
            calories={stats?.weeklyStats?.[6]?.calories || 0}
            activeMinutes={stats?.weeklyStats?.[6]?.duration || 0}
            streak={stats?.streak || 0}
          />

          {/* Quick Actions Shortcuts */}
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            <View style={styles.gridRow}>
              <QuickActionCard 
                title={QUICK_ACTIONS_CONFIG[0].title}
                desc={QUICK_ACTIONS_CONFIG[0].desc}
                icon={QUICK_ACTIONS_CONFIG[0].icon}
                accentColor={QUICK_ACTIONS_CONFIG[0].color}
                onPress={() => router.push(QUICK_ACTIONS_CONFIG[0].route as any)}
              />
              <QuickActionCard 
                title={QUICK_ACTIONS_CONFIG[1].title}
                desc={QUICK_ACTIONS_CONFIG[1].desc}
                icon={QUICK_ACTIONS_CONFIG[1].icon}
                accentColor={QUICK_ACTIONS_CONFIG[1].color}
                onPress={() => router.push(QUICK_ACTIONS_CONFIG[1].route as any)}
              />
            </View>
            <View style={styles.gridRow}>
              <QuickActionCard 
                title={QUICK_ACTIONS_CONFIG[2].title}
                desc={QUICK_ACTIONS_CONFIG[2].desc}
                icon={QUICK_ACTIONS_CONFIG[2].icon}
                accentColor={QUICK_ACTIONS_CONFIG[2].color}
                onPress={() => router.push(QUICK_ACTIONS_CONFIG[2].route as any)}
              />
              <QuickActionCard 
                title={QUICK_ACTIONS_CONFIG[3].title}
                desc={QUICK_ACTIONS_CONFIG[3].desc}
                icon={QUICK_ACTIONS_CONFIG[3].icon}
                accentColor={QUICK_ACTIONS_CONFIG[3].color}
                onPress={() => router.push(QUICK_ACTIONS_CONFIG[3].route as any)}
              />
            </View>
            <View style={styles.gridRow}>
              <QuickActionCard 
                title={QUICK_ACTIONS_CONFIG[4].title}
                desc={QUICK_ACTIONS_CONFIG[4].desc}
                icon={QUICK_ACTIONS_CONFIG[4].icon}
                accentColor={QUICK_ACTIONS_CONFIG[4].color}
                onPress={() => router.push(QUICK_ACTIONS_CONFIG[4].route as any)}
              />
              <QuickActionCard 
                title={QUICK_ACTIONS_CONFIG[5].title}
                desc={QUICK_ACTIONS_CONFIG[5].desc}
                icon={QUICK_ACTIONS_CONFIG[5].icon}
                accentColor={QUICK_ACTIONS_CONFIG[5].color}
                onPress={() => router.push(QUICK_ACTIONS_CONFIG[5].route as any)}
              />
            </View>
          </View>

          {/* AI Coach Insights */}
          <AIInsightCard 
            insightText={stats?.insight || insights?.advice || 'Upgrade to PRO to unlock advanced AI-driven training insights and recovery scores.'}
            isPremium={isPremium}
            onPress={() => router.push(isPremium ? '/insights' : '/premium' as any)}
          />

          {/* Today's Recommended Routine */}
          <WorkoutPreview 
            workoutName="Full Body Strength Routine"
            duration="45 min"
            calories={350}
            difficulty="Intermediate"
            targetMuscles="Chest, Legs, Back, Core"
            onPress={() => router.push('/create-workout?type=Strength' as any)}
          />

          {/* Energy balance & Macros */}
          <NutritionCard 
            consumed={stats?.caloriesSummary?.consumed || 0}
            burned={stats?.caloriesSummary?.burned || 0}
            target={stats?.caloriesSummary?.target || 2000}
          />

          {/* Recent sessions tracker */}
          <SectionHeader 
            title="Recent Sessions" 
            actionLabel="View All"
            onActionPress={() => router.push('/(tabs)/workouts' as any)}
          />

          <View style={styles.timelineList}>
            {recent && recent.length > 0 ? (
              recent.map((item: any, index: number) => {
                const getAccent = (typeStr: string) => {
                  switch (typeStr) {
                    case 'Strength': return '#10B981';
                    case 'Cardio': return '#FF4B4B';
                    case 'HIIT': return '#00B0FF';
                    case 'Yoga': return '#BD00FF';
                    default: return '#10B981';
                  }
                };
                return (
                  <RecentActivityCard 
                    key={item._id || index}
                    title={item.exercise}
                    time={fmt(item.date)}
                    calories={Math.round((item.duration || 30) * 8.5)}
                    duration={`${item.duration || 30} min`}
                    accentColor={getAccent(item.type)}
                    onPress={() => router.push(`/workout/${item._id}` as any)}
                  />
                );
              })
            ) : (
              <EmptyState 
                title="No Workouts Logged"
                description="Your activity history is clean. Tap below to log your first training session!"
                buttonLabel="Start Workout"
                onButtonPress={() => router.push('/create-workout' as any)}
                accentColor="#10B981"
              />
            )}
          </View>
        </View>
      </ScrollView>
      {user && (
        <PremiumOnboardingModal
          visible={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userId={user.id}
        />
      )}
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loaderText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FF4D4D',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  retryBtn: {
    height: 52,
    width: 160,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineList: {
    marginTop: 4,
  },
});
