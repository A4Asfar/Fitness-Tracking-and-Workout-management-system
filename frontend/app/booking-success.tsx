import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Calendar, Clock, Video, MapPin, User, ChevronRight } from 'lucide-react-native';
import api from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingSuccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bookingId) return;

    const triggerAnimations = () => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    };

    if (bookingId.startsWith('mock-')) {
      setBooking({
        _id: bookingId,
        trainerId: { fullName: 'Mock Trainer' },
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: 'Select Time',
        duration: 60,
        sessionType: 'Online',
        totalPrice: 1500
      });
      setLoading(false);
      triggerAnimations();
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        triggerAnimations();
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
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
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ANIMATED SUCCESS HERO */}
      <View style={[s.heroSection, { paddingTop: insets.top + 60 }]}>
        <Animated.View style={[s.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <View style={s.iconInner}>
            <Check size={48} color="#10B981" strokeWidth={3} />
          </View>
        </Animated.View>
        <Animated.Text style={[s.title, { opacity: fadeAnim }]}>Booking Confirmed!</Animated.Text>
        <Animated.Text style={[s.subtitle, { opacity: fadeAnim }]}>Your session is successfully scheduled.</Animated.Text>
      </View>

      {/* RECEIPT CARD */}
      <Animated.View style={[s.receiptContainer, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <View style={s.receiptCard}>
          <View style={s.receiptHeader}>
            <Text style={s.receiptTitle}>Digital Receipt</Text>
            <Text style={s.receiptId}>#{booking._id?.substring(0, 8).toUpperCase()}</Text>
          </View>

          <View style={s.dashedLine} />

          <View style={s.detailRow}>
            <View style={s.detailIconBox}><User size={16} color="#94A3B8" /></View>
            <Text style={s.detailLabel}>Trainer</Text>
            <Text style={s.detailValue}>{booking.trainerId?.fullName || booking.trainerId?.name || 'Coach'}</Text>
          </View>

          <View style={s.detailRow}>
            <View style={s.detailIconBox}><Calendar size={16} color="#94A3B8" /></View>
            <Text style={s.detailLabel}>Date</Text>
            <Text style={s.detailValue}>{booking.bookingDate}</Text>
          </View>

          <View style={s.detailRow}>
            <View style={s.detailIconBox}><Clock size={16} color="#94A3B8" /></View>
            <Text style={s.detailLabel}>Time</Text>
            <Text style={s.detailValue}>{booking.bookingTime} ({booking.duration}m)</Text>
          </View>

          <View style={s.detailRow}>
            <View style={s.detailIconBox}>
              {booking.sessionType === 'Online' ? <Video size={16} color="#94A3B8" /> : <MapPin size={16} color="#94A3B8" />}
            </View>
            <Text style={s.detailLabel}>Format</Text>
            <Text style={s.detailValue}>{booking.sessionType}</Text>
          </View>

          <View style={s.dashedLine} />

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Payment</Text>
            <Text style={s.totalValue}>PKR {booking.totalPrice?.toLocaleString()}</Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={s.actions}>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/my-bookings')}>
            <Text style={s.primaryBtnText}>View My Bookings</Text>
            <ChevronRight size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => router.replace('/')}>
            <Text style={s.secondaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  errorText: { color: '#EF4444', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  homeBtn: { backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  homeBtnText: { color: '#F8FAFC', fontWeight: '800' },

  heroSection: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  iconInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(16,185,129,0.2)', justifyContent: 'center', alignItems: 'center' },
  title: { flexShrink: 1,  color: '#F8FAFC', fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  subtitle: { flexShrink: 1,  color: '#94A3B8', fontSize: 15, fontWeight: '500' },

  receiptContainer: { paddingHorizontal: 24 },
  receiptCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  receiptTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  receiptId: { color: '#64748B', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  dashedLine: { height: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', marginVertical: 20 },

  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailLabel: { flex: 1, color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  detailValue: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#94A3B8', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#10B981', fontSize: 24, fontWeight: '900' },

  actions: { gap: 12 },
  primaryBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 100 },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '900', marginRight: 4 },
  secondaryBtn: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 100 },
  secondaryBtnText: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
});
