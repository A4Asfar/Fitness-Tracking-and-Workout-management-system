import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Bell, Calendar, Award, Info, Trash2, 
  Search, CheckCheck, AlertTriangle, ShieldAlert
} from 'lucide-react-native';
import api from '@/services/api';
import SkeletonCard from '@/components/SkeletonCard';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      const res = await api.get('/notifications', {
        params: {
          page: pageNum,
          limit: 15,
          filter,
          search
        }
      });

      const { notifications: list, unreadCount: count, pages } = res.data;

      if (isRefresh || pageNum === 1) {
        setNotifications(list);
      } else {
        setNotifications(prev => [...prev, ...list]);
      }

      setUnreadCount(count);
      setTotalPages(pages);
      setPage(pageNum);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchNotifications(page + 1);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.log('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log('Error marking all read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Reset unread count correctly
      const res = await api.get('/notifications', { params: { limit: 1 } });
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.log('Error deleting notification:', err);
    }
  };

  const handleNotificationPress = (item: any) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id);
    }
    if (item.actionRoute) {
      router.push(item.actionRoute);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} days ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Trainer Booking':
      case 'Booking Approved':
      case 'Booking Cancelled':
        return <Calendar size={18} color={Colors.primary} />;
      case 'Premium Purchased':
      case 'Premium Approved':
        return <Award size={18} color="#D4AF37" />;
      case 'Welcome':
      case 'System Announcement':
        return <Bell size={18} color="#3B82F6" />;
      default:
        return <Info size={18} color="#64748B" />;
    }
  };

  const filters = ['All', 'Unread', 'Bookings', 'Premium', 'Workout', 'System'];

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.cardWrapper}>
      <TouchableOpacity 
        style={[s.card, !item.isRead && s.cardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
      >
        <View style={s.iconBox}>
          {getIcon(item.type)}
        </View>
        <View style={s.cardBody}>
          <Text style={[s.cardTitle, !item.isRead && s.cardTitleUnread]}>{item.title}</Text>
          <Text style={s.cardMessage}>{item.message}</Text>
          <Text style={s.cardTime}>{getRelativeTime(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={s.unreadDot} />}
      </TouchableOpacity>
      
      <TouchableOpacity style={s.deleteActionBtn} onPress={() => handleDelete(item._id)}>
        <Trash2 size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={s.emptyContainer}>
        <Bell size={64} color="#CBD5E1" style={{ marginBottom: 16 }} />
        <Text style={s.emptyTitle}>No notifications yet</Text>
        <Text style={s.emptySub}>We will notify you when workouts, meal plans, or bookings need your attention.</Text>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={[s.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={s.headerTitleContainer}>
          <Text style={s.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unreadCount} unread</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={s.readAllBtn}>
            <CheckCheck size={20} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* SEARCH */}
      <View style={s.searchContainer}>
        <Search size={18} color="#64748B" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search notifications..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={(txt) => {
            setSearch(txt);
            setLoading(true);
            fetchNotifications(1);
          }}
        />
      </View>

      {/* FILTER BAR */}
      <View style={s.filterWrapper}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[s.filterChip, filter === item && s.filterChipActive]}
              onPress={() => {
                setFilter(item);
                setLoading(true);
                fetchNotifications(1);
              }}
            >
              <Text style={[s.filterChipText, filter === item && s.filterChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ERROR */}
      {error && !loading && (
        <View style={s.errorCard}>
          <AlertTriangle size={24} color="#EF4444" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={handleRefresh}>
            <Text style={s.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIST */}
      {loading ? (
        <View style={s.listContainer}>
          {[1, 2, 3, 4].map(k => <SkeletonCard key={k} style={{ marginBottom: 16 }} />)}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={s.listContainer}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  badge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#EF4444', fontSize: 11, fontWeight: '800' },
  readAllBtn: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 24, paddingHorizontal: 16, borderRadius: 16, height: 48, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500' },

  filterWrapper: { marginBottom: 16 },
  filterContainer: { paddingHorizontal: 24, gap: 8 },
  filterChip: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#FFF', fontWeight: '800' },

  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  card: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  cardUnread: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  iconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12, alignSelf: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 4 },
  cardTitleUnread: { color: '#1E3A8A' },
  cardMessage: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 6 },
  cardTime: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6', alignSelf: 'center', marginLeft: 8 },
  
  deleteActionBtn: { width: 44, height: 56, backgroundColor: '#FEF2F2', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32, lineHeight: 22 },

  errorCard: { backgroundColor: '#FEE2E2', padding: 20, borderRadius: 20, alignItems: 'center', marginHorizontal: 24, marginBottom: 24, gap: 8 },
  errorText: { color: '#EF4444', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 }
});
