import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, ActivityIndicator, Image, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Video, MapPin, CheckCircle2, Clock, Map, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { getMockTrainerById } from '@/constants/MockTrainers';

const { width } = Dimensions.get('window');

const getNext14Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '13:00 PM', '15:00 PM', '17:00 PM', '19:00 PM'];

export default function BookSessionScreen() {
  const { trainerId } = useLocalSearchParams<{ trainerId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [trainer, setTrainer] = useState<any>(null);
  const [loadingTrainer, setLoadingTrainer] = useState(true);
  
  const availableDates = getNext14Days();
  const [selectedDate, setSelectedDate] = useState<Date>(availableDates[0]);
  
  const [form, setForm] = useState({
    sessionType: 'Online',
    time: '',
    duration: 60,
    fitnessGoal: '',
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!trainerId) return;
    const fetchTrainer = async () => {
      try {
        let data = getMockTrainerById(trainerId as string);
        if (!data) {
          const res = await api.get(`/content/trainers/${trainerId}`);
          data = res.data;
        }
        setTrainer(data);
      } catch (err) {
        setError('Failed to load trainer info.');
      } finally {
        setLoadingTrainer(false);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  const rate = trainer?.hourlyPrice || 3000;
  const totalPrice = trainer ? Math.round(rate * (form.duration / 60)) : 0;

  const handleBook = async () => {
    if (!form.time || !form.fitnessGoal) {
      setError('Please select a time slot and enter your primary goal.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const d = selectedDate;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      const res = await api.post('/bookings', {
        trainerId: trainer._id || trainer.id,
        bookingDate: dateStr,
        bookingTime: form.time,
        duration: form.duration,
        sessionType: form.sessionType,
        fitnessGoal: form.fitnessGoal,
        notes: '',
      });

      router.push(`/booking-success?bookingId=${res.data._id}`);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to book session.');
      setBookingLoading(false);
    }
  };

  if (loadingTrainer) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#F8FAFC' }}>Trainer not found.</Text>
      </View>
    );
  }

  const isOnline = form.sessionType === 'Online';

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Schedule Session</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        
        {/* TRAINER PREVIEW */}
        <View style={s.trainerCard}>
          <Image source={{ uri: trainer.profileImage || trainer.image }} style={s.trainerImg} />
          <View style={s.trainerInfo}>
            <Text style={s.trainerName}>{trainer.fullName || trainer.name}</Text>
            <Text style={s.trainerSpec}>{trainer.specializations?.[0] || 'Fitness Coach'}</Text>
            <View style={s.trainerStatsRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.statText}>{trainer.rating || 4.9} ({trainer.totalReviews || 120} reviews)</Text>
            </View>
          </View>
        </View>

        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

        {/* DATE SELECTOR */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Select Date</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dateScroll}>
          {availableDates.map((date, idx) => {
            const isSelected = selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dayNumber = date.getDate();
            return (
              <TouchableOpacity 
                key={idx} 
                style={[s.dateCard, isSelected && s.dateCardActive]}
                onPress={() => { setSelectedDate(date); setError(''); }}
              >
                <Text style={[s.dateName, isSelected && s.dateTextActive]}>{dayName}</Text>
                <Text style={[s.dateNumber, isSelected && s.dateTextActive]}>{dayNumber}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TIME SLOTS */}
        <Text style={s.sectionTitle}>Available Times</Text>
        <View style={s.timeGrid}>
          {TIME_SLOTS.map(time => (
            <TouchableOpacity 
              key={time}
              style={[s.timeChip, form.time === time && s.timeChipActive]}
              onPress={() => { setForm(p => ({ ...p, time })); setError(''); }}
            >
              <Text style={[s.timeChipText, form.time === time && s.timeChipTextActive]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DURATION & FORMAT */}
        <View style={s.formatContainer}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Duration</Text>
            <View style={s.optionList}>
              <TouchableOpacity style={[s.optBtn, form.duration === 30 && s.optBtnActive]} onPress={() => setForm(p => ({...p, duration: 30}))}>
                <Clock size={16} color={form.duration === 30 ? '#0F172A' : '#94A3B8'} style={{ marginRight: 6 }}/>
                <Text style={[s.optText, form.duration === 30 && s.optTextActive]}>30 Min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.optBtn, form.duration === 60 && s.optBtnActive]} onPress={() => setForm(p => ({...p, duration: 60}))}>
                <Clock size={16} color={form.duration === 60 ? '#0F172A' : '#94A3B8'} style={{ marginRight: 6 }}/>
                <Text style={[s.optText, form.duration === 60 && s.optTextActive]}>60 Min</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Format</Text>
            <View style={s.optionList}>
              <TouchableOpacity style={[s.optBtn, isOnline && s.optBtnActive]} onPress={() => setForm(p => ({...p, sessionType: 'Online'}))}>
                <Video size={16} color={isOnline ? '#0F172A' : '#94A3B8'} style={{ marginRight: 6 }}/>
                <Text style={[s.optText, isOnline && s.optTextActive]}>Virtual</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.optBtn, !isOnline && s.optBtnActive]} onPress={() => setForm(p => ({...p, sessionType: 'In-Person'}))}>
                <MapPin size={16} color={!isOnline ? '#0F172A' : '#94A3B8'} style={{ marginRight: 6 }}/>
                <Text style={[s.optText, !isOnline && s.optTextActive]}>In-Person</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* GOAL INPUT */}
        <Text style={s.sectionTitle}>Session Goal</Text>
        <View style={s.inputWrapper}>
          <Target size={20} color="#64748B" style={s.inputIcon} />
          <TextInput
            style={s.textInput}
            placeholder="What do you want to focus on?"
            placeholderTextColor="#64748B"
            value={form.fitnessGoal}
            onChangeText={(t) => { setForm(p => ({...p, fitnessGoal: t})); setError(''); }}
          />
        </View>

      </ScrollView>

      {/* FLOATING BOTTOM BAR */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.priceSummary}>
          <Text style={s.priceLabel}>Total Price</Text>
          <Text style={s.priceValue}>PKR {totalPrice.toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity 
          style={[s.bookBtn, (!form.time || !form.fitnessGoal || bookingLoading) && s.bookBtnDisabled]} 
          onPress={handleBook}
          disabled={!form.time || !form.fitnessGoal || bookingLoading}
          activeOpacity={0.8}
        >
          {bookingLoading ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Text style={s.bookBtnText}>Confirm & Book</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#0F172A' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  
  content: { padding: 24, paddingBottom: 120 },

  trainerCard: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  trainerImg: { width: 64, height: 64, borderRadius: 20, marginRight: 16 },
  trainerInfo: { flex: 1, justifyContent: 'center' },
  trainerName: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  trainerSpec: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  trainerStatsRow: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', marginLeft: 6 },

  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 },
  
  dateScroll: { gap: 12, marginBottom: 32 },
  dateCard: { width: 68, height: 84, backgroundColor: '#1E293B', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dateCardActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  dateName: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  dateNumber: { color: '#F8FAFC', fontSize: 22, fontWeight: '900' },
  dateTextActive: { color: '#0F172A' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  timeChip: { width: (width - 60) / 3, paddingVertical: 14, backgroundColor: '#1E293B', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  timeChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  timeChipText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  timeChipTextActive: { color: '#0F172A', fontWeight: '900' },

  formatContainer: { flexDirection: 'row', marginBottom: 32 },
  optionList: { gap: 12 },
  optBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  optBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  optText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  optTextActive: { color: '#0F172A', fontWeight: '900' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#F8FAFC', fontSize: 15, fontWeight: '600' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceSummary: { flex: 1 },
  priceLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  priceValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  
  bookBtn: { backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100 },
  bookBtnDisabled: { backgroundColor: '#334155' },
  bookBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '900' },
});
