import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  Crown, Sparkles, Lock, Check, X, AlertCircle
} from 'lucide-react-native';
import api from '@/services/api';

/**
 * Premium state helper hook.
 * Returns { isPremium, isPending, isRejected, isFree } from user + payment status.
 */
export function usePremiumStatus() {
  const { user } = useAuth();
  const [paymentLog, setPaymentLog] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/premium/my');
        setPaymentLog(res.data.latestPurchase);
      } catch {
        // No payment record exists
      } finally {
        setLoaded(true);
      }
    };
    if (user) fetch();
  }, [user]);

  const isPremium = user?.membershipType === 'premium' || user?.membershipType === 'admin';
  const isPending = !isPremium && paymentLog?.status === 'Pending';
  const isRejected = !isPremium && paymentLog?.status === 'Rejected';
  const isFree = !isPremium && !isPending;

  return { isPremium, isPending, isRejected, isFree, loaded, paymentLog };
}

// ──────────────────────────────────────────────────────
// PremiumLockCard
// Shows a locked feature card with icon, description,
// and triggers PremiumModal on press.
// ──────────────────────────────────────────────────────
interface PremiumLockCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  style?: any;
}

export function PremiumLockCard({ title, description, icon, style }: PremiumLockCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { isPending } = usePremiumStatus();

  return (
    <>
      <TouchableOpacity
        style={[styles.lockCard, style]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.lockIconRow}>
          {icon || <Lock size={20} color="#D4AF37" />}
          <View style={styles.lockBadge}>
            <Crown size={8} color="#78350F" fill="#D4AF37" />
            <Text style={styles.lockBadgeText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.lockTitle}>{title}</Text>
        <Text style={styles.lockDesc}>{description}</Text>
        <View style={styles.lockUnlockHint}>
          <Sparkles size={12} color="#D4AF37" />
          <Text style={styles.lockHintText}>Tap to unlock</Text>
        </View>
      </TouchableOpacity>

      <PremiumModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        isPending={isPending}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────
// PremiumGate
// Wraps children. Shows children if premium,
// otherwise shows PremiumLockCard inline.
// ──────────────────────────────────────────────────────
interface PremiumGateProps {
  children: React.ReactNode;
  featureTitle: string;
  featureDescription: string;
  featureIcon?: React.ReactNode;
  style?: any;
}

export function PremiumGate({ children, featureTitle, featureDescription, featureIcon, style }: PremiumGateProps) {
  const { isPremium } = usePremiumStatus();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <PremiumLockCard
      title={featureTitle}
      description={featureDescription}
      icon={featureIcon}
      style={style}
    />
  );
}

// ──────────────────────────────────────────────────────
// PremiumModal
// Beautiful upgrade prompt OR pending status display.
// ──────────────────────────────────────────────────────
const BENEFITS = [
  'Unlimited AI Coach consultations',
  'Personalized workout programs',
  'Advanced meal & nutrition plans',
  'Deep progress analytics & insights',
  'Priority AI response speed',
  'All future premium features'
];

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  isPending?: boolean;
}

export function PremiumModal({ visible, onClose, isPending = false }: PremiumModalProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>

          {isPending ? (
            /* ── Pending State ── */
            <View style={styles.pendingContainer}>
              <View style={styles.pendingIconBox}>
                <AlertCircle size={28} color="#D4AF37" strokeWidth={2.5} />
              </View>
              <Text style={styles.pendingTitle}>Verification In Progress</Text>
              <Text style={styles.pendingDesc}>
                Your payment proof is under review by our admin team. Estimated approval within 24 hours.
              </Text>
              <TouchableOpacity
                style={styles.pendingBtn}
                onPress={() => { onClose(); router.push('/premium'); }}
                activeOpacity={0.8}
              >
                <Text style={styles.pendingBtnText}>View Payment Status</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Upgrade Prompt ── */
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalCrownBox}>
                  <Crown size={24} color="#D4AF37" fill="#D4AF37" />
                </View>
                <Text style={styles.modalTitle}>Unlock Premium</Text>
                <Text style={styles.modalSubtitle}>
                  Get unrestricted access to every AI coaching tool.
                </Text>
              </View>

              <View style={styles.benefitsBox}>
                {BENEFITS.map((b, i) => (
                  <View key={i} style={styles.benefitItem}>
                    <View style={styles.checkBox}>
                      <Check size={10} color="#D4AF37" strokeWidth={3} />
                    </View>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Lifetime</Text>
                <Text style={styles.priceValue}>PKR 2,999</Text>
              </View>

              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => { onClose(); router.push('/premium'); }}
                activeOpacity={0.9}
              >
                <Crown size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
                <Text style={styles.laterBtnText}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Lock Card
  lockCard: {
    backgroundColor: '#FFFDF6',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    opacity: 0.9,
  },
  lockIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  lockBadgeText: {
    color: '#78350F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lockTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  lockDesc: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  lockUnlockHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockHintText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCrownBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalSubtitle: { flexShrink: 1, 
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  benefitsBox: {
    gap: 10,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  benefitText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDF6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  priceLabel: {
    color: '#78350F',
    fontSize: 13,
    fontWeight: '700',
  },
  priceValue: {
    color: '#78350F',
    fontSize: 18,
    fontWeight: '900',
  },
  upgradeBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  laterBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },

  // Pending
  pendingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pendingIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  pendingTitle: {
    color: '#78350F',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  pendingDesc: {
    color: '#92400E',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  pendingBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBtnText: {
    color: '#78350F',
    fontSize: 13,
    fontWeight: '800',
  },
});
