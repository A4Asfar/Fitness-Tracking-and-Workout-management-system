import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, Video, MapPin, CalendarOff } from 'lucide-react-native';
import api from '@/services/api';
import SkeletonCard from '@/components/SkeletonCard';

export default function MyBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('Upcoming'); // Upcoming, Completed, Cancelled

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load your bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (activeTab === 'Upcoming') return ['Pending', 'Confirmed'].includes(b.bookingStatus);
      if (activeTab === 'Completed') return b.bookingStatus === 'Completed';
      if (activeTab === 'Cancelled') return b.bookingStatus === 'Cancelled';
      return false;
    });
  }, [bookings, activeTab]);

  const getStatusBadge = (status: string) => {
    let bgColor = '#F1F5F9';
    let textColor = '#64748B';

    if (status === 'Pending') { bgColor = '#FEF3C7'; textColor = '#D97706'; }
    if (status === 'Confirmed') { bgColor = '#DCFCE7'; textColor = '#15803D'; }
    if (status === 'Completed') { bgColor = Colors.primary + '20'; textColor = Colors.primary; }
    if (status === 'Cancelled') { bgColor = '#FEE2E2'; textColor = '#EF4444'; }

    return (
      <View style={[s.badge, { backgroundColor: bgColor }]}>
        <Text style={[s.badgeText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const renderBookingCard = ({ item }: { item: any }) => {
    const trainer = item.trainerId;
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Image source={{ uri: trainer?.profileImage || trainer?.image }} style={s.trainerImage} />
          <View style={s.cardHeaderInfo}>
            <Text style={s.trainerName}>{trainer?.fullName || trainer?.name || 'Trainer'}</Text>
            <Text style={s.trainerSpec}>{trainer?.specializations?.[0] || trainer?.specialization || 'Fitness Coach'}</Text>
          </View>
          {getStatusBadge(item.bookingStatus)}
        </View>

        <View style={s.cardDivider} />

        <View style={s.cardDetailsRow}>
          <View style={s.detailItem}>
            <Calendar size={16} color="#64748B" />
            <Text style={s.detailText}>{item.bookingDate}</Text>
          </View>
          <View style={s.detailItem}>
            <Clock size={16} color="#64748B" />
            <Text style={s.detailText}>{item.bookingTime} ({item.duration}m)</Text>
          </View>
        </View>

        <View style={s.cardDetailsRow}>
          <View style={s.detailItem}>
            {item.sessionType === 'Online' ? <Video size={16} color="#64748B" /> : <MapPin size={16} color="#64748B" />}
            <Text style={s.detailText}>{item.sessionType}</Text>
          </View>
          <Text style={s.priceText}>PKR {item.totalPrice}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={s.emptyContainer}>
        <CalendarOff size={64} color="#CBD5E1" style={{ marginBottom: 16 }} />
        <Text style={s.emptyTitle}>No {activeTab} Bookings</Text>
        <Text style={s.emptySub}>You don't have any {activeTab.toLowerCase()} sessions at the moment.</Text>
        {activeTab !== 'Upcoming' && (
          <TouchableOpacity style={s.exploreBtn} onPress={() => router.push('/(tabs)/trainers')}>
            <Text style={s.exploreBtnText}>Find a Coach</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Bookings</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={s.tabContainer}>
        {['Upcoming', 'Completed', 'Cancelled'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && !loading ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh}><Text style={s.retryText}>Retry</Text></TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <View style={s.listContainer}>
          {[1, 2, 3].map(k => <SkeletonCard key={k} style={{ marginBottom: 16 }} />)}
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          keyExtractor={item => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={s.listContainer}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#F8FAFC' },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },

  listContainer: { padding: 24, paddingTop: 8, paddingBottom: 100, maxWidth: 800, width: '100%', alignSelf: 'center' },
  
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  trainerImage: { width: 48, height: 48, borderRadius: 24 },
  cardHeaderInfo: { flex: 1, marginLeft: 12 },
  trainerName: { fontSize: 16, fontWeight: '800', color: '#F8FAFC' },
  trainerSpec: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 12 },
  
  cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  priceText: { fontSize: 15, fontWeight: '800', color: Colors.primary },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.1)', marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 24, lineHeight: 22, marginBottom: 24 },
  exploreBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  exploreBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 15 },

  errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', margin: 24, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  errorText: { color: '#EF4444', fontWeight: '600', flex: 1 },
  retryText: { color: '#EF4444', fontWeight: '800', textDecorationLine: 'underline', marginLeft: 12 },
});
