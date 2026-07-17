import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SectionList, TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Bell, Calendar, Award, Trash2, 
  CheckCheck, HeartPulse
} from 'lucide-react-native';
import api from '@/services/api';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rawNotifications, setRawNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      const res = await api.get('/notifications', {
        params: { page: 1, limit: 50 } // Fetch more to allow good grouping
      });

      const { notifications: list, unreadCount: count } = res.data;
      setRawNotifications(list);
      setUnreadCount(count);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setRawNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.log('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setRawNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log('Error marking all read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setRawNotifications(prev => prev.filter(n => n._id !== id));
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

  // Grouping logic
  const groupNotifications = (notifs: any[]) => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const thisWeek: any[] = [];
    const older: any[] = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    notifs.forEach(n => {
      const d = new Date(n.createdAt);
      d.setHours(0, 0, 0, 0);
      const diffTime = now.getTime() - d.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        today.push(n);
      } else if (diffDays === 1) {
        yesterday.push(n);
      } else if (diffDays <= 7) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    const sections = [];
    if (today.length > 0) sections.push({ title: 'Today', data: today });
    if (yesterday.length > 0) sections.push({ title: 'Yesterday', data: yesterday });
    if (thisWeek.length > 0) sections.push({ title: 'This Week', data: thisWeek });
    if (older.length > 0) sections.push({ title: 'Older', data: older });

    return sections;
  };

  const getRelativeTimeStr = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getIconProps = (type: string) => {
    switch (type) {
      case 'Trainer Booking':
      case 'Booking Approved':
      case 'Booking Cancelled':
        return { Icon: Calendar, color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' };
      case 'Premium Purchased':
      case 'Premium Approved':
        return { Icon: Award, color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' };
      case 'Workout':
        return { Icon: HeartPulse, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
      default:
        return { Icon: Bell, color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  const sections = groupNotifications(rawNotifications);

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={s.titleRow}>
          <Text style={s.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleMarkAllRead} style={s.readAllBtn}>
          <CheckCheck size={20} color={unreadCount > 0 ? '#38BDF8' : '#334155'} />
        </TouchableOpacity>
      </View>

      {/* ERROR */}
      {error && (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      {/* LIST */}
      <SectionList
        sections={sections}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ maxWidth: 800, width: '100%', alignSelf: 'center',  paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38BDF8" />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={s.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={() => (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconRing}>
              <Bell size={48} color="#334155" />
            </View>
            <Text style={s.emptyTitle}>All caught up!</Text>
            <Text style={s.emptySub}>You have no new notifications. We'll alert you when there is an update.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const { Icon, color, bg } = getIconProps(item.type);
          return (
            <View style={s.cardWrapper}>
              <TouchableOpacity 
                style={[s.card, !item.isRead && s.cardUnread]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.8}
              >
                {!item.isRead && <View style={s.unreadDot} />}
                
                <View style={[s.iconBox, { backgroundColor: bg }]}>
                  <Icon size={20} color={color} />
                </View>

                <View style={s.cardBody}>
                  <View style={s.cardHeaderRow}>
                    <Text style={[s.cardTitle, !item.isRead && s.cardTitleUnread]}>{item.title}</Text>
                    <Text style={s.cardTime}>{getRelativeTimeStr(item.createdAt)}</Text>
                  </View>
                  <Text style={s.cardMessage} numberOfLines={2}>{item.message}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={s.deleteActionBtn} onPress={() => handleDelete(item._id)}>
                <Trash2 size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#0F172A', zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  badge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  readAllBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  errorBox: { marginHorizontal: 24, marginBottom: 16, backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  sectionHeader: { color: '#94A3B8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12, backgroundColor: '#0F172A', paddingVertical: 4 },

  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  card: { flex: 1, flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  cardUnread: { backgroundColor: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.2)' },
  
  unreadDot: { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: '#38BDF8', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },

  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardBody: { flex: 1, justifyContent: 'center' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: '#CBD5E1', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 12 },
  cardTitleUnread: { color: '#F8FAFC', fontWeight: '800' },
  cardTime: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  cardMessage: { color: '#94A3B8', fontSize: 13, lineHeight: 20, paddingRight: 8 },

  deleteActionBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySub: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 32 },
});
