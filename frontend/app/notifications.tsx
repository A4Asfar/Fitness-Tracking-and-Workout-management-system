import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Bell, ArrowLeft, Trash2, CheckCircle2, 
  Dumbbell, Utensils, User, Scale, Info
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { safeBack } from '@/utils/navigation';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'workout' | 'meal' | 'consultation' | 'weight' | 'system';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell size={20} color={Colors.primary} />;
      case 'meal': return <Utensils size={20} color="#FF6B3B" />;
      case 'consultation': return <User size={20} color="#00D1FF" />;
      case 'weight': return <Scale size={20} color="#FFD700" />;
      default: return <Info size={20} color={Colors.textSecondary} />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSecs < 60) return 'Just now';
    if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
    if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading && !refreshing) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color="#222" strokeWidth={1} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>When you have new updates, they'll appear here.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
              onPress={() => !item.isRead && markAsRead(item._id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: Colors.card }]}>
                {getIcon(item.type)}
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.textContainer}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.unreadText]}>{item.title}</Text>
                  <Text style={styles.notifTime}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          ))
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: SPACING.lg },
  
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  unreadCard: {
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.primary + '05',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  unreadText: {
    color: Colors.primary,
    fontWeight: '900',
  },
  notifTime: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  notifMessage: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 20,
  },
  emptySub: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
    lineHeight: 20,
  }
});
