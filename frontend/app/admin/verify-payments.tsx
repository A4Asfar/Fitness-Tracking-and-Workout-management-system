import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Modal, TextInput, Dimensions, FlatList
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Check, X, Eye, Calendar, User, Mail,
  CreditCard, Sparkles, XCircle, AlertCircle
} from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import api from '@/services/api';

const { width, height } = Dimensions.get('window');

interface PaymentRecord {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  paymentMethod: string;
  paymentNumber?: string;
  screenshotUrl: string;
  status: string;
  submittedAt: string;
}

export default function AdminVerifyPaymentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [rejectingItem, setRejectingItem] = useState<PaymentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments/pending');
      setPayments(res.data);
    } catch (error) {
      console.error('Fetch pending error:', error);
      showToast('Failed to load pending payments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.membershipType !== 'admin') {
      router.replace('/');
      return;
    }
    fetchPending();
  }, [user]);

  const handleVerify = async (id: string, status: 'Approved' | 'Rejected', remarks = '') => {
    setIsActioning(true);
    try {
      await api.post(`/admin/payments/${id}/verify`, { status, adminRemarks: remarks });
      showToast(`Payment successfully ${status.toLowerCase()}`, 'success');
      setRejectingItem(null);
      setRejectReason('');
      fetchPending();
    } catch (error) {
      console.error('Verification action error:', error);
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setIsActioning(false);
    }
  };

  const renderItem = ({ item }: { item: PaymentRecord }) => {
    return (
      <View style={styles.paymentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userInitialsBox}>
            <Text style={styles.userInitials}>{item.userName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userEmail}>{item.userEmail}</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{item.plan}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>METHOD</Text>
            <Text style={styles.detailValue}>{item.paymentMethod}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>SENDER NO.</Text>
            <Text style={styles.detailValue}>{item.paymentNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>
              {new Date(item.submittedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Screenshot preview */}
        <TouchableOpacity 
          style={styles.screenshotPreviewWrap}
          onPress={() => setSelectedPhoto(item.screenshotUrl)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: item.screenshotUrl }} style={styles.screenshotImg} />
          <View style={styles.viewBadge}>
            <Eye size={12} color="#FFFFFF" />
            <Text style={styles.viewBadgeText}>Zoom Receipt</Text>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.rejectBtn}
            onPress={() => setRejectingItem(item)}
            disabled={isActioning}
            activeOpacity={0.8}
          >
            <X size={16} color="#EF4444" strokeWidth={2.5} />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.approveBtn}
            onPress={() => handleVerify(item._id, 'Approved')}
            disabled={isActioning}
            activeOpacity={0.8}
          >
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loaderText}>Loading pending logs...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyDesc}>
            No pending premium membership verification uploads found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- Image Zoom Modal --- */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.zoomOverlay}>
          <TouchableOpacity 
            style={styles.zoomCloseBtn}
            onPress={() => setSelectedPhoto(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.zoomImg} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* --- Rejection Remarks Modal --- */}
      <Modal visible={!!rejectingItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rejection Reason</Text>
            <Text style={styles.modalDesc}>
              State the reason why payment verification failed for {rejectingItem?.userName}.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Invalid receipt number or fake screenshot."
              placeholderTextColor="#94A3B8"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => { setRejectingItem(null); setRejectReason(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmBtn, !rejectReason.trim() && styles.modalConfirmDisabled]}
                onPress={() => rejectingItem && handleVerify(rejectingItem._id, 'Rejected', rejectReason)}
                disabled={!rejectReason.trim() || isActioning}
              >
                <Text style={styles.modalConfirmText}>Reject Proof</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create<Record<string, any>>({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  userInitialsBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  userInitials: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '800',
  },
  userName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  userEmail: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  planBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  planBadgeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '900',
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  screenshotPreviewWrap: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  screenshotImg: {
    width: '100%',
    height: '100%',
  },
  viewBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  zoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  zoomImg: {
    width: width,
    height: height * 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  modalDesc: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  modalInput: {
    height: 80,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
