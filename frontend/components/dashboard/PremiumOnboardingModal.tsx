import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Easing, Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Sparkles, Check, ArrowRight, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Storage from '@/utils/storage';
import { APP_NAME, APP_PRO } from '@/constants/Brand';

interface PremiumOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function PremiumOnboardingModal({
  visible,
  onClose,
  userId
}: PremiumOnboardingModalProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad)
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1))
        })
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = async () => {
    try {
      await Storage.setItem(`hasSeenOnboarding_${userId}`, 'true');
    } catch {}
    onClose();
  };

  const handleExplore = async () => {
    try {
      await Storage.setItem(`hasSeenOnboarding_${userId}`, 'true');
    } catch {}
    onClose();
    router.push('/premium');
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,23,42,0.85)' }]} />
        )}
        
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* --- Celebratory Top Ribbon --- */}
          <View style={styles.ribbon}>
            <Sparkles size={20} color="#D4AF37" fill="#D4AF37" />
            <Text style={styles.ribbonText}>Welcome to {APP_NAME}</Text>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* --- Headline --- */}
            <Text style={styles.headline}>🎉 Account Created!</Text>
            <Text style={styles.subheadline}>
              Congratulations! Your personal fitness account is ready. All core trackers like workout loggers & history are <Text style={styles.freeHighlight}>free forever</Text>.
            </Text>

            {/* --- Premium Features Pitch --- */}
            <View style={styles.premiumBox}>
              <View style={styles.premiumTitleRow}>
                <Star size={18} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.premiumTitle}>Upgrade to {APP_PRO}</Text>
              </View>
              <Text style={styles.premiumDesc}>
                Take your athletic journey to the absolute peak with our elite AI coach features.
              </Text>

              {/* --- Benefits List --- */}
              <View style={styles.benefitsList}>
                <BenefitItem text="🧠 Unlimited AI Coach chats & prompt tips" />
                <BenefitItem text="🏋 Personalized training & workout programs" />
                <BenefitItem text="🥗 Advanced meal plan & nutrition tracking" />
                <BenefitItem text="📈 Extended weight history & BMI analytics" />
                <BenefitItem text="🎨 Custom styling themes and layout settings" />
                <BenefitItem text="🚀 Priority access to all future releases" />
              </View>
            </View>
          </ScrollView>

          {/* --- Buttons footer --- */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.exploreBtn} 
              onPress={handleExplore}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore Premium Features</Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.freeBtn} 
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.freeBtnText}>Continue with Free Version</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.checkCircle}>
        <Check size={12} color="#D4AF37" strokeWidth={3} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create<Record<string, any>>({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '90%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  ribbonText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headline: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheadline: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  freeHighlight: {
    color: '#10B981',
    fontWeight: '800',
  },
  premiumBox: {
    backgroundColor: '#FAF7EE',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  premiumTitle: {
    color: '#78350F',
    fontSize: 15,
    fontWeight: '800',
  },
  premiumDesc: {
    color: '#92400E',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  benefitText: {
    color: '#78350F',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  exploreBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  freeBtn: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
