import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  Bell, 
  Activity,
  Crown,
  ShieldCheck,
  Rocket
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const { width } = Dimensions.get('window');

function BenefitItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIconBox}>
        <Icon size={20} color={Colors.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function PremiumDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [isUpgrading, setIsUpgrading] = React.useState(false);

  const handleUpgrade = () => {
    Alert.alert(
      'Ready to Upgrade?',
      'You are about to unlock the full potential of FitPro AI.',
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Get Started', 
          onPress: async () => {
            setIsUpgrading(true);
            try {
              const res = await api.put('/profile/upgrade');
              updateUser(res.data);
              Alert.alert('Success', 'Welcome to Premium! You now have unrestricted access.');
            } catch (error) {
              Alert.alert('Error', 'Failed to upgrade. Please try again later.');
            } finally {
              setIsUpgrading(false);
            }
          }
        }
      ]
    );
  };

  const isPremium = user?.membershipType === 'premium' || user?.membershipType === 'admin';

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity 
          onPress={() => safeBack()} 
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Premium Status Card ── */}
        <LinearGradient
          colors={isPremium ? ['#FFD700', '#B8860B'] : ['#1A1A1A', '#0D0D0D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.statusCard, !isPremium && styles.statusCardBorder]}
        >
          <View style={styles.statusContent}>
            <View style={[styles.crownIconWrap, isPremium && styles.crownIconActive]}>
              <Crown size={32} color={isPremium ? '#000' : Colors.textSecondary} fill={isPremium ? '#000' : 'transparent'} />
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.statusLabel, isPremium && { color: '#000' }]}>
                {isPremium ? 'PREMIUM ACTIVE' : 'FREE ACCOUNT'}
              </Text>
              <Text style={[styles.statusValue, isPremium && { color: 'rgba(0,0,0,0.7)' }]}>
                {isPremium ? 'Unrestricted Access' : 'Limited Features'}
              </Text>
            </View>

            {isPremium && (
              <View style={styles.activeBadge}>
                <ShieldCheck size={12} color="#000" />
                <Text style={styles.activeBadgeText}>ACTIVE SUBSCRIPTION</Text>
              </View>
            )}
          </View>
          <Sparkles size={140} color={isPremium ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'} style={styles.bgSparkle} />
        </LinearGradient>

        {/* ── Why Go Premium Section ── */}
        <View style={styles.benefitsHeader}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>
          <Text style={styles.sectionSub}>Unlock the full AI-driven training ecosystem.</Text>
        </View>

        <View style={styles.benefitsContainer}>
          <BenefitItem 
            icon={TrendingUp} 
            title="Advanced Progress Insights" 
            desc="Deep-dive into volume trends, 1RM projections, and muscle-group balance charts." 
          />
          <BenefitItem 
            icon={Zap} 
            title="AI Training Recommendations" 
            desc="Get daily suggestions for intensity and recovery based on your biometric history." 
          />
          <BenefitItem 
            icon={Bell} 
            title="Smart Workout Reminders" 
            desc="Set custom alerts for different workout types and never miss a session again." 
          />
          <BenefitItem 
            icon={Activity} 
            title="Detailed Performance Metrics" 
            desc="Track velocity, intensity distribution, and metabolic demand across all exercises." 
          />
        </View>

        {/* ── Action Button ── */}
        {!isPremium ? (
          <View style={styles.actionBox}>
            <TouchableOpacity 
              style={styles.upgradeBtn}
              onPress={handleUpgrade}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeBtnGrad}
              >
                <Rocket size={20} color="#000" />
                <Text style={styles.upgradeBtnText}>UPGRADE TO PREMIUM</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.pricingNote}>$9.99 / month • Cancel anytime</Text>
          </View>
        ) : (
          <View style={styles.premiumFooter}>
            <CheckCircle2 size={24} color={Colors.primary} />
            <Text style={styles.premiumFooterText}>You're all set! Enjoy the elite experience.</Text>
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
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  statusCard: {
    height: 220,
    borderRadius: 36,
    marginBottom: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      }
    })
  },
  statusCardBorder: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: 'transparent',
  },
  statusContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  crownIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  crownIconActive: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  statusValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
  },
  activeBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bgSparkle: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.8,
  },
  benefitsHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  benefitsContainer: {
    gap: 24,
    marginBottom: 40,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 16,
  },
  benefitIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  benefitTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  benefitDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionBox: {
    alignItems: 'center',
  },
  upgradeBtn: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  upgradeBtnGrad: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  upgradeBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pricingNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 16,
    fontWeight: '600',
    opacity: 0.6,
  },
  premiumFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.primary + '10',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  premiumFooterText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
