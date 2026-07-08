import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Modal, TextInput, Dimensions, FlatList, Share, Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Check, X, Eye, Calendar, User, Mail,
  CreditCard, Sparkles, XCircle, AlertCircle, TrendingUp, Award,
  Download, Search, Filter, Plus, Trash2, ShieldAlert
} from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import api from '@/services/api';
import { hapticSuccess, hapticError } from '@/utils/haptics';

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
  adminRemarks?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface PremiumUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  membershipExpiresAt?: string;
}

interface AnalyticsData {
  totalPremium: number;
  pendingRequests: number;
  activeMonthly: number;
  lifetimePremium: number;
  estimatedRevenue: number;
  todayNewPremium: number;
  approvalRate: number;
  approvedCount: number;
  rejectedCount: number;
}

export default function PremiumManagementDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'analytics'>('verifications');

  // Verification List State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingList, setLoadingList] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Premium Users State
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modal Details State
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [rejectingItem, setRejectingItem] = useState<PaymentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Payment not received');
  const [customRemarks, setCustomRemarks] = useState('');
  const [extendingUser, setExtendingUser] = useState<PremiumUser | null>(null);
  const [extensionDays, setExtensionDays] = useState('30');
  const [isActioning, setIsActioning] = useState(false);

  // Security Check
  useEffect(() => {
    if (user && user.membershipType !== 'admin') {
      router.replace('/');
    }
  }, [user]);

  // Fetch Payments List
  const fetchPayments = useCallback(async (page = 1) => {
    setLoadingList(true);
    try {
      const res = await api.get('/admin/payments/list', {
        params: {
          page,
          limit: 10,
          search: searchQuery,
          status: statusFilter,
          plan: planFilter,
          sort: sortOrder
        }
      });
      setPayments(res.data.items);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.page);
      setTotalRecords(res.data.total);
    } catch (error) {
      console.error('Fetch payments error:', error);
      showToast('Failed to load payment requests.', 'error');
    } finally {
      setLoadingList(false);
    }
  }, [searchQuery, statusFilter, planFilter, sortOrder]);

  // Fetch Premium Users
  const fetchPremiumUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/payments/users');
      setPremiumUsers(res.data);
    } catch (error) {
      console.error('Fetch premium users error:', error);
      showToast('Failed to load premium users.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch Analytics Stats
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/admin/payments/analytics');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      showToast('Failed to load analytics metrics.', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Auto Refresh when switching tabs
  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchPayments(1);
    } else if (activeTab === 'users') {
      fetchPremiumUsers();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchPayments, fetchPremiumUsers, fetchAnalytics]);

  // Approve Verification Flow
  const handleApprove = (payment: PaymentRecord) => {
    Alert.alert(
      'Activate Premium Membership',
      `Activate Premium for ${payment.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Activate',
          onPress: async () => {
            setIsActioning(true);
            try {
              await api.post(`/admin/payments/${payment._id}/verify`, { status: 'Approved' });
              hapticSuccess();
              showToast('Premium membership activated successfully!', 'success');
              setSelectedPayment(null);
              fetchPayments(currentPage);
              fetchAnalytics();
            } catch (error) {
              console.error('Approval failed:', error);
              hapticError();
              showToast('Failed to activate premium.', 'error');
            } finally {
              setIsActioning(false);
            }
          }
        }
      ]
    );
  };

  // Reject Verification Flow
  const handleRejectSubmit = async () => {
    if (!rejectingItem) return;
    const finalRemarks = `${rejectReason}. ${customRemarks}`.trim();
    setIsActioning(true);
    try {
      await api.post(`/admin/payments/${rejectingItem._id}/verify`, {
        status: 'Rejected',
        adminRemarks: finalRemarks
      });
      hapticSuccess();
      showToast('Payment request has been rejected.', 'success');
      setRejectingItem(null);
      setSelectedPayment(null);
      setCustomRemarks('');
      fetchPayments(currentPage);
      fetchAnalytics();
    } catch (error) {
      console.error('Rejection failed:', error);
      hapticError();
      showToast('Failed to reject payment request.', 'error');
    } finally {
      setIsActioning(false);
    }
  };

  // Extend Membership Flow
  const handleExtendSubmit = async () => {
    if (!extendingUser) return;
    setIsActioning(true);
    try {
      await api.post(`/admin/payments/users/${extendingUser._id}/extend`, {
        days: parseInt(extensionDays) || 30
      });
      hapticSuccess();
      showToast('Premium membership extended successfully!', 'success');
      setExtendingUser(null);
      fetchPremiumUsers();
    } catch (error) {
      console.error('Extension failed:', error);
      hapticError();
      showToast('Failed to extend membership.', 'error');
    } finally {
      setIsActioning(false);
    }
  };

  // Deactivate Premium Flow
  const handleDeactivate = (user: PremiumUser) => {
    Alert.alert(
      'Deactivate Premium Status',
      `Are you sure you want to deactivate Premium for ${user.name}? They will lose all premium benefits.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setIsActioning(true);
            try {
              await api.post(`/admin/payments/users/${user._id}/deactivate`);
              hapticSuccess();
              showToast('Premium membership deactivated.', 'success');
              fetchPremiumUsers();
              fetchAnalytics();
            } catch (error) {
              console.error('Deactivation failed:', error);
              hapticError();
              showToast('Failed to deactivate membership.', 'error');
            } finally {
              setIsActioning(false);
            }
          }
        }
      ]
    );
  };

  // Helper: Download/Share Receipt Screenshot Url
  const handleShareReceipt = async (url: string) => {
    try {
      await Share.share({ message: url, title: 'Payment Proof Receipt' });
    } catch (error) {
      showToast('Could not share screenshot link.', 'error');
    }
  };

  // Filter lists by search
  const filteredUsers = premiumUsers.filter(u => 
    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Premium Management</Text>
          <Text style={styles.headerSubtitle}>FitAI Admin Panel</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tabs Selector ── */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('verifications')}
          style={[styles.tabButton, activeTab === 'verifications' && styles.activeTabButton]}
        >
          <CreditCard size={16} color={activeTab === 'verifications' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'verifications' && styles.activeTabButtonText]}>
            Verifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('users')}
          style={[styles.tabButton, activeTab === 'users' && styles.activeTabButton]}
        >
          <User size={16} color={activeTab === 'users' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'users' && styles.activeTabButtonText]}>
            Active Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('analytics')}
          style={[styles.tabButton, activeTab === 'analytics' && styles.activeTabButton]}
        >
          <TrendingUp size={16} color={activeTab === 'analytics' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'analytics' && styles.activeTabButtonText]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MAIN CONTENT ── */}
      {activeTab === 'verifications' && (
        <View style={{ flex: 1 }}>
          {/* Filters Area */}
          <View style={styles.filtersWrapper}>
            <View style={styles.searchRow}>
              <Search size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                placeholder="Search requests by name or email..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(text) => { setSearchQuery(text); setCurrentPage(1); }}
                style={styles.searchInput}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Status:</Text>
                {['', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => { setStatusFilter(status); setCurrentPage(1); }}
                    style={[styles.chip, statusFilter === status && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, statusFilter === status && styles.chipTextActive]}>
                      {status || 'All'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.filterGroup, { marginLeft: 16 }]}>
                <Text style={styles.filterLabel}>Plan:</Text>
                {['', 'Monthly', 'Lifetime'].map((plan) => (
                  <TouchableOpacity
                    key={plan}
                    onPress={() => { setPlanFilter(plan); setCurrentPage(1); }}
                    style={[styles.chip, planFilter === plan && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, planFilter === plan && styles.chipTextActive]}>
                      {plan || 'All'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.filterGroup, { marginLeft: 16 }]}>
                <Text style={styles.filterLabel}>Sort:</Text>
                {['newest', 'oldest'].map((order) => (
                  <TouchableOpacity
                    key={order}
                    onPress={() => { setSortOrder(order); setCurrentPage(1); }}
                    style={[styles.chip, sortOrder === order && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, sortOrder === order && styles.chipTextActive]}>
                      {order === 'newest' ? 'Newest' : 'Oldest'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* List display */}
          {loadingList ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : payments.length === 0 ? (
            <View style={styles.centerContainer}>
              <AlertCircle size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No payment requests match this criteria.</Text>
            </View>
          ) : (
            <FlatList
              data={payments}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => setSelectedPayment(item)}
                  style={styles.recordCard}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarInitials}>
                      <Text style={styles.avatarText}>{item.userName.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.recordName}>{item.userName}</Text>
                      <Text style={styles.recordEmail}>{item.userEmail}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      item.status === 'Pending' && styles.statusPending,
                      item.status === 'Approved' && styles.statusApproved,
                      item.status === 'Rejected' && styles.statusRejected
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        item.status === 'Pending' && styles.statusTextPending,
                        item.status === 'Approved' && styles.statusTextApproved,
                        item.status === 'Rejected' && styles.statusTextRejected
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recordDetails}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>PLAN</Text>
                      <Text style={styles.detailValueBold}>{item.plan}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>METHOD</Text>
                      <Text style={styles.detailValue}>{item.paymentMethod}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>DATE</Text>
                      <Text style={styles.detailValue}>{new Date(item.submittedAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={() => (
                totalPages > 1 ? (
                  <View style={styles.paginationRow}>
                    <TouchableOpacity
                      disabled={currentPage === 1}
                      onPress={() => fetchPayments(currentPage - 1)}
                      style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                    >
                      <Text style={styles.pageBtnText}>Previous</Text>
                    </TouchableOpacity>
                    <Text style={styles.paginationText}>
                      Page {currentPage} of {totalPages} ({totalRecords} records)
                    </Text>
                    <TouchableOpacity
                      disabled={currentPage === totalPages}
                      onPress={() => fetchPayments(currentPage + 1)}
                      style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                    >
                      <Text style={styles.pageBtnText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              )}
            />
          )}
        </View>
      )}

      {activeTab === 'users' && (
        <View style={{ flex: 1 }}>
          {/* User Search */}
          <View style={styles.filtersWrapper}>
            <View style={styles.searchRow}>
              <Search size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                placeholder="Search active users by name or email..."
                placeholderTextColor="#94A3B8"
                value={searchUserQuery}
                onChangeText={setSearchUserQuery}
                style={styles.searchInput}
              />
            </View>
          </View>

          {loadingUsers ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading premium users...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.centerContainer}>
              <User size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No premium users found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatarInitials, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1 }]}>
                      <Text style={[styles.avatarText, { color: '#78350F' }]}>{item.name.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.recordName}>{item.name}</Text>
                      <Text style={styles.recordEmail}>{item.email}</Text>
                    </View>
                    <View style={styles.planProBadge}>
                      <Award size={10} color="#78350F" fill="#D4AF37" />
                      <Text style={styles.planProBadgeText}>PRO</Text>
                    </View>
                  </View>

                  <View style={styles.userInfoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoColLabel}>PREMIUM SINCE</Text>
                      <Text style={styles.infoColValue}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoColLabel}>EXPIRY DATE</Text>
                      <Text style={[styles.infoColValue, { fontWeight: '700', color: item.membershipExpiresAt ? '#0F172A' : '#10B981' }]}>
                        {item.membershipExpiresAt ? new Date(item.membershipExpiresAt).toLocaleDateString() : 'Lifetime'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    <TouchableOpacity
                      onPress={() => setExtendingUser(item)}
                      style={styles.extendBtn}
                      activeOpacity={0.8}
                    >
                      <Calendar size={14} color="#0F172A" />
                      <Text style={styles.extendBtnText}>Extend</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeactivate(item)}
                      style={styles.deactivateBtn}
                      activeOpacity={0.8}
                    >
                      <XCircle size={14} color="#EF4444" />
                      <Text style={styles.deactivateBtnText}>Deactivate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {activeTab === 'analytics' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
          {loadingAnalytics ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Calculating metrics...</Text>
            </View>
          ) : analytics ? (
            <View style={{ gap: 16 }}>
              {/* Summary Cards */}
              <View style={styles.gridRow}>
                <View style={styles.analyticCard}>
                  <View style={styles.analyticHeader}>
                    <Award size={20} color="#78350F" fill="#D4AF37" />
                    <Text style={styles.analyticTitle}>Total Premium</Text>
                  </View>
                  <Text style={styles.analyticValue}>{analytics.totalPremium}</Text>
                  <Text style={styles.analyticSub}>Active memberships</Text>
                </View>

                <View style={styles.analyticCard}>
                  <View style={styles.analyticHeader}>
                    <AlertCircle size={20} color="#F59E0B" />
                    <Text style={styles.analyticTitle}>Pending Requests</Text>
                  </View>
                  <Text style={[styles.analyticValue, { color: '#F59E0B' }]}>{analytics.pendingRequests}</Text>
                  <Text style={styles.analyticSub}>Awaiting verification</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.analyticCard}>
                  <View style={styles.analyticHeader}>
                    <Calendar size={20} color="#10B981" />
                    <Text style={styles.analyticTitle}>Monthly Plans</Text>
                  </View>
                  <Text style={styles.analyticValue}>{analytics.activeMonthly}</Text>
                  <Text style={styles.analyticSub}>Recurring renewals</Text>
                </View>

                <View style={styles.analyticCard}>
                  <View style={styles.analyticHeader}>
                    <Sparkles size={20} color="#A855F7" fill="#A855F7" />
                    <Text style={styles.analyticTitle}>Lifetime Plans</Text>
                  </View>
                  <Text style={[styles.analyticValue, { color: '#A855F7' }]}>{analytics.lifetimePremium}</Text>
                  <Text style={styles.analyticSub}>One-time purchase</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.analyticCard}>
                  <View style={styles.analyticHeader}>
                    <CreditCard size={20} color="#10B981" />
                    <Text style={styles.analyticTitle}>Est. Revenue</Text>
                  </View>
                  <Text style={[styles.analyticValue, { color: '#10B981' }]}>PKR {analytics.estimatedRevenue.toLocaleString()}</Text>
                  <Text style={styles.analyticSub}>Accumulated earnings</Text>
                </View>

                <View style={styles.gridRow}>
                  <View style={[styles.analyticCard, { backgroundColor: '#F0FDFA' }]}>
                    <View style={styles.analyticHeader}>
                      <Plus size={20} color="#10B981" />
                      <Text style={styles.analyticTitle}>Today New</Text>
                    </View>
                    <Text style={[styles.analyticValue, { color: '#10B981' }]}>{analytics.todayNewPremium}</Text>
                    <Text style={styles.analyticSub}>New upgrades today</Text>
                  </View>
                </View>
              </View>

              {/* Progress Analysis details */}
              <View style={styles.analyticsDetailsCard}>
                <Text style={styles.sectionTitle}>Verification Efficiency</Text>
                
                <View style={styles.statsProgressRow}>
                  <View style={styles.statProgressItem}>
                    <Text style={styles.statProgressLabel}>Approval Rate</Text>
                    <Text style={styles.statProgressValue}>{analytics.approvalRate}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${analytics.approvalRate}%` }]} />
                  </View>
                </View>

                <View style={[styles.gridRow, { marginTop: 12 }]}>
                  <View style={styles.efficiencySubCard}>
                    <Text style={styles.subCardLabel}>Approved Receipts</Text>
                    <Text style={[styles.subCardValue, { color: '#10B981' }]}>{analytics.approvedCount}</Text>
                  </View>
                  <View style={styles.efficiencySubCard}>
                    <Text style={styles.subCardLabel}>Rejected Receipts</Text>
                    <Text style={[styles.subCardValue, { color: '#EF4444' }]}>{analytics.rejectedCount}</Text>
                  </View>
                </View>
              </View>

              {/* Security Alert panel */}
              <View style={styles.securityAlertCard}>
                <ShieldAlert size={20} color="#EF4444" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.securityTitle}>Admin Operations Secured</Text>
                  <Text style={styles.securityDesc}>
                    Every membership upgrade, extension, or deactivation action is cryptographically signed and logged on the backend ledger.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>Could not calculate analytics.</Text>
          )}
        </ScrollView>
      )}

      {/* ── MODAL: Request Details ── */}
      <Modal visible={!!selectedPayment} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {selectedPayment && (
            <View style={styles.modalDetailsCard}>
              <TouchableOpacity onPress={() => setSelectedPayment(null)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>

              <Text style={styles.modalHeading}>Payment Request</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.65 }}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>USER INFORMATION</Text>
                  <View style={styles.modalUserRow}>
                    <View style={styles.avatarInitialsLarge}>
                      <Text style={styles.avatarTextLarge}>{selectedPayment.userName.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <Text style={styles.modalUserName}>{selectedPayment.userName}</Text>
                      <Text style={styles.modalUserEmail}>{selectedPayment.userEmail}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>PAYMENT DETAILS</Text>
                  <View style={styles.modalDetailGrid}>
                    <View style={styles.modalDetailCol}>
                      <Text style={styles.modalDetailLabel}>Selected Plan</Text>
                      <Text style={styles.modalDetailValueBold}>{selectedPayment.plan}</Text>
                    </View>
                    <View style={styles.modalDetailCol}>
                      <Text style={styles.modalDetailLabel}>Payment Method</Text>
                      <Text style={styles.modalDetailValue}>{selectedPayment.paymentMethod}</Text>
                    </View>
                  </View>

                  <View style={[styles.modalDetailGrid, { marginTop: 12 }]}>
                    <View style={styles.modalDetailCol}>
                      <Text style={styles.modalDetailLabel}>Sender Mobile Number</Text>
                      <Text style={styles.modalDetailValue}>{selectedPayment.paymentNumber || 'N/A'}</Text>
                    </View>
                    <View style={styles.modalDetailCol}>
                      <Text style={styles.modalDetailLabel}>Submission Date</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedPayment.submittedAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {selectedPayment.adminRemarks && (
                    <View style={styles.remarksBlock}>
                      <Text style={styles.remarksLabel}>Admin Notes:</Text>
                      <Text style={styles.remarksText}>{selectedPayment.adminRemarks}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>TRANSACTION RECEIPT SCREENSHOT</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedPhoto(selectedPayment.screenshotUrl)}
                    style={styles.modalScreenshotWrap}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: selectedPayment.screenshotUrl }} style={styles.modalScreenshotImg} />
                    <View style={styles.modalZoomBadge}>
                      <Eye size={12} color="#FFFFFF" />
                      <Text style={styles.modalZoomText}>Tap to zoom receipt</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleShareReceipt(selectedPayment.screenshotUrl)}
                    style={styles.downloadBtn}
                    activeOpacity={0.8}
                  >
                    <Download size={14} color="#0F172A" />
                    <Text style={styles.downloadBtnText}>Share / Download Receipt Link</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Actions footer if pending */}
              {selectedPayment.status === 'Pending' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setRejectingItem(selectedPayment)}
                    style={styles.modalRejectBtn}
                    disabled={isActioning}
                  >
                    <X size={16} color="#EF4444" strokeWidth={2.5} />
                    <Text style={styles.modalRejectBtnText}>Reject Proof</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleApprove(selectedPayment)}
                    style={styles.modalApproveBtn}
                    disabled={isActioning}
                  >
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.modalApproveBtnText}>Approve & Upgrade</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* ── MODAL: Fullscreen receipt zoom ── */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.photoZoomOverlay}>
          <TouchableOpacity onPress={() => setSelectedPhoto(null)} style={styles.photoZoomClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.photoZoomImg} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* ── MODAL: Rejection Reason ── */}
      <Modal visible={!!rejectingItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rejectionCard}>
            <Text style={styles.rejectionTitle}>Reject Payment Proof</Text>
            <Text style={styles.rejectionSubtitle}>Specify the reason for rejecting this transaction screenshot.</Text>

            <View style={styles.rejectionReasonsBox}>
              {[
                'Payment not received',
                'Incorrect amount',
                'Invalid screenshot',
                'Duplicate payment'
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setRejectReason(reason)}
                  style={[styles.rejectionOption, rejectReason === reason && styles.rejectionOptionActive]}
                >
                  <View style={[styles.radioDot, rejectReason === reason && styles.radioDotActive]} />
                  <Text style={[styles.rejectionOptionText, rejectReason === reason && styles.rejectionOptionTextActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Additional remarks (optional):</Text>
            <TextInput
              placeholder="Add verification notes, bank reference issues, etc..."
              placeholderTextColor="#94A3B8"
              value={customRemarks}
              onChangeText={setCustomRemarks}
              style={styles.customRemarksInput}
              multiline
              numberOfLines={3}
            />

            <View style={styles.rejectionFooter}>
              <TouchableOpacity
                onPress={() => setRejectingItem(null)}
                style={styles.cancelBtn}
                disabled={isActioning}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRejectSubmit}
                style={styles.confirmRejectBtn}
                disabled={isActioning}
              >
                <Text style={styles.confirmRejectBtnText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Extension period ── */}
      <Modal visible={!!extendingUser} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {extendingUser && (
            <View style={styles.rejectionCard}>
              <Text style={styles.rejectionTitle}>Extend Premium Membership</Text>
              <Text style={styles.rejectionSubtitle}>
                Add premium accessibility days for <Text style={{ fontWeight: '700', color: '#0F172A' }}>{extendingUser.name}</Text>.
              </Text>

              <Text style={styles.inputLabel}>Extension period (days):</Text>
              <TextInput
                keyboardType="numeric"
                value={extensionDays}
                onChangeText={setExtensionDays}
                style={styles.daysInput}
              />

              <View style={styles.daysPresetsRow}>
                {['7', '30', '90', '365'].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => setExtensionDays(preset)}
                    style={[styles.presetChip, extensionDays === preset && styles.presetChipActive]}
                  >
                    <Text style={[styles.presetChipText, extensionDays === preset && styles.presetChipTextActive]}>
                      +{preset} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rejectionFooter}>
                <TouchableOpacity
                  onPress={() => setExtendingUser(null)}
                  style={styles.cancelBtn}
                  disabled={isActioning}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleExtendSubmit}
                  style={styles.confirmExtendBtn}
                  disabled={isActioning}
                >
                  <Text style={styles.confirmExtendBtnText}>Extend Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  tabButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabButtonText: {
    color: '#047857',
  },

  // Filters Area
  filtersWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  filterScroll: {
    marginTop: 12,
    alignItems: 'center',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Center display States
  centerContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Payments lists
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarInitials: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },
  recordName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  recordEmail: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusApproved: { backgroundColor: '#D1FAE5' },
  statusRejected: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusTextPending: { color: '#D97706' },
  statusTextApproved: { color: '#059669' },
  statusTextRejected: { color: '#DC2626' },

  recordDetails: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },
  detailValue: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  detailValueBold: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  paginationText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },

  // Premium Users tab
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  planProBadge: {
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
  planProBadgeText: {
    color: '#78350F',
    fontSize: 8,
    fontWeight: '900',
  },
  userInfoRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoCol: {
    flex: 1,
  },
  infoColLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },
  infoColValue: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  extendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  extendBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  deactivateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    gap: 6,
  },
  deactivateBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },

  // Analytics tab
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  analyticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  analyticTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  analyticValue: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  analyticSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  analyticsDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 16,
  },
  statsProgressRow: {
    gap: 6,
  },
  statProgressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statProgressLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  statProgressValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  efficiencySubCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  subCardLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  subCardValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
  securityAlertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  securityTitle: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '800',
  },
  securityDesc: {
    color: '#BE123C',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 2,
  },

  // Modal: Details
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  modalDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  modalHeading: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 20,
    paddingRight: 40,
  },
  modalSection: {
    marginBottom: 18,
  },
  modalSectionTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarInitialsLarge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '800',
  },
  modalUserName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  modalUserEmail: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalDetailGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalDetailCol: {
    flex: 1,
  },
  modalDetailLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  modalDetailValue: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  modalDetailValueBold: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  remarksBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  remarksLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  remarksText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  modalScreenshotWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  modalScreenshotImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  modalZoomBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  modalZoomText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  downloadBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    gap: 6,
  },
  modalRejectBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  modalApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 6,
  },
  modalApproveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Modal: Photo Zoom
  photoZoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoZoomClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoZoomImg: {
    width: width,
    height: height - 120,
  },

  // Modal: Rejection Form
  rejectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  rejectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  rejectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  rejectionReasonsBox: {
    gap: 8,
    marginBottom: 16,
  },
  rejectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  rejectionOptionActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF1F2',
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  radioDotActive: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  rejectionOptionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectionOptionTextActive: {
    color: '#EF4444',
  },
  inputLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  customRemarksInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    height: 60,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  rejectionFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  confirmRejectBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmRejectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Modal: Extension inputs
  daysInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    height: 44,
    marginBottom: 12,
  },
  daysPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  presetChip: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  presetChipText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  confirmExtendBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmExtendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
