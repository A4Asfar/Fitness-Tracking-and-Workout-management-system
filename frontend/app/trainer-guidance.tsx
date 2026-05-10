import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, Sparkles, Dumbbell, Zap, 
  Moon, Utensils, Award, Info, ChevronRight,
  TrendingUp, Activity, Brain
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { ContentService } from '@/services/contentService';
import { 
  NutritionSuggestion, 
  WorkoutSuggestion
} from '@/services/recommendations';

const { width } = Dimensions.get('window');
const PAD = 24;

export default function TrainerGuidanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [workouts, setWorkouts] = useState<WorkoutSuggestion[]>([]);
  const [nutrition, setNutrition] = useState<NutritionSuggestion[]>([]);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plan = await ContentService.getDailyPlan({
          goal: user?.fitnessGoal,
          level: user?.trainingLevel,
          focus: user?.preferredWorkoutFocus
        });
        setWorkouts(plan.workoutSuggestions || []);
        setNutrition(plan.nutritionPlan ? Object.values(plan.nutritionPlan) : []);
        setMotivation(plan.motivation || '');
      } catch (err) {
        console.error('Failed to fetch guidance');
      } finally {
        // Simulate loading for premium feel
        setTimeout(() => {
          setLoading(false);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]).start();
        }, 400);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textSecondary, marginTop: 16, fontWeight: '600' }}>AI Assistant Initializing...</Text>
      </View>
    );
  }

  const guidanceData = [
    {
      id: 'focus',
      title: "Today's Focus Advice",
      description: workouts[0]?.reason || "Target compound movements today for maximum metabolic impact.",
      action: workouts[0]?.exercise || "Strength Training",
      icon: Dumbbell,
      color: Colors.primary,
      accent: '#9FE800'
    },
    {
      id: 'recovery',
      title: "Recovery Recommendation",
      description: motivation.includes('Recovery') ? motivation : "Sleep and hydration are your best recovery tools. Aim for 8 hours tonight.",
      action: "Optimal Recovery",
      icon: Moon,
      color: '#A855F7',
      accent: '#D8B4FE'
    },
    {
      id: 'nutrition',
      title: "Nutrition Reminder",
      description: nutrition[0]?.benefit || "Ensure you have adequate protein intake to support muscle protein synthesis.",
      action: nutrition[0]?.name || "High Protein Fuel",
      icon: Utensils,
      color: '#00D1FF',
      accent: '#67E8F9'
    },
    {
      id: 'performance',
      title: "Performance Tip",
      description: "Focus on the mind-muscle connection. Slower reps with better form beat fast reps with poor technique.",
      action: "Refine Form",
      icon: Activity,
      color: '#FF6B3B',
      accent: '#FCA5A1'
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient 
        colors={[Colors.primary + '15', 'transparent']} 
        style={styles.headerGlow} 
      />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trainer Guidance</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          <LinearGradient
            colors={[Colors.primary, '#9FE800']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerText}>
                <View style={styles.badge}>
                  <Brain size={12} color="#000" fill="#000" />
                  <Text style={styles.badgeText}>AI-DRIVEN</Text>
                </View>
                <Text style={styles.bannerTitle}>Your Smart Fitness Assistant</Text>
                <Text style={styles.bannerSub}>Personalized coaching for your journey</Text>
              </View>
              <View style={styles.bannerIcon}>
                <Sparkles size={40} color="#000" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>PERSONALIZED GUIDANCE</Text>
            <View style={styles.line} />
          </View>

          {guidanceData.map((item, index) => (
            <GuidanceCard key={item.id} {...item} delay={index * 100} />
          ))}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

function GuidanceCard({ title, description, action, icon: Icon, color, accent, delay }: any) {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.card}
    >
      <LinearGradient
        colors={[color + '15', 'transparent']}
        style={styles.cardGrad}
      />
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <Icon size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={[styles.cardAction, { color: accent }]}>{action}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc}>{description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.footerLink}>Deep Dive Insight</Text>
        <ChevronRight size={14} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: PAD },
  
  banner: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bannerText: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 10,
  },
  badgeText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  bannerTitle: { color: '#000', fontSize: 24, fontWeight: '900', letterSpacing: -0.6, lineHeight: 28 },
  bannerSub: { color: 'rgba(0,0,0,0.6)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  bannerIcon: {},

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border, opacity: 0.5 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardGrad: { ...StyleSheet.absoluteFillObject },
  cardHeader: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardAction: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  cardDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  footerLink: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
});
