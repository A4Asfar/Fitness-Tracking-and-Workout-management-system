import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, Calendar, Clock, Video, MapPin, User } from 'lucide-react-native';
import api from '@/services/api';

export default function BookingSuccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={s.errorText}>Could not load booking details.</Text>
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/')}>
          <Text style={s.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={s.successHeader}>
        <CheckCircle size={80} color={Colors.primary} />
        <Text style={s.title}>Session Confirmed!</Text>
        <Text style={s.subtitle}>Your booking has been successfully secured.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Booking Summary</Text>
        
        <View style={s.detailRow}>
          <User size={20} color="#64748B" />
          <Text style={s.detailLabel}>Trainer</Text>
          <Text style={s.detailValue}>{booking.trainerId?.fullName || booking.trainerId?.name || 'Coach'}</Text>
        </View>

        <View style={s.detailRow}>
          <Calendar size={20} color="#64748B" />
          <Text style={s.detailLabel}>Date</Text>
          <Text style={s.detailValue}>{booking.bookingDate}</Text>
        </View>

        <View style={s.detailRow}>
          <Clock size={20} color="#64748B" />
          <Text style={s.detailLabel}>Time</Text>
          <Text style={s.detailValue}>{booking.bookingTime} ({booking.duration} min)</Text>
        </View>

        <View style={s.detailRow}>
          {booking.sessionType === 'Online' ? <Video size={20} color="#64748B" /> : <MapPin size={20} color="#64748B" />}
          <Text style={s.detailLabel}>Location</Text>
          <Text style={s.detailValue}>{booking.sessionType}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Total Price</Text>
          <Text style={s.priceValue}>PKR {booking.totalPrice}</Text>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/my-bookings')}>
          <Text style={s.primaryBtnText}>View My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => router.replace('/')}>
          <Text style={s.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 24 },
  successHeader: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginTop: 24, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center' },
  
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 40 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailLabel: { fontSize: 15, color: '#64748B', marginLeft: 12, flex: 1 },
  detailValue: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  priceValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },

  actions: { gap: 16, marginTop: 'auto' },
  primaryBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#F1F5F9', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },

  errorText: { fontSize: 16, color: '#EF4444', fontWeight: '600', marginBottom: 20 },
  homeBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  homeBtnText: { color: '#FFF', fontWeight: '700' },
});
