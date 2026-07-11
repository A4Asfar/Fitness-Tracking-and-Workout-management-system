import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, ActivityIndicator, Image, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Video, MapPin, Target, CheckCircle2 } from 'lucide-react-native';
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
    notes: '',
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
      setError('Please select a time slot and enter your fitness goal.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      // Format Date to YYYY-MM-DD safely
      const d = selectedDate;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      const res = await api.post('/bookings', {
        trainerId: trainer._id || trainer.id,
        bookingDate: dateStr,
        bookingTime: form.time,
        duration: form.duration,
        sessionType: form.sessionType,
        fitnessGoal: form.fitnessGoal,
        notes: form.notes,
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
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={s.errorMsg}>Trainer not found.</Text>
      </View>
    );
  }

  const isOnline = form.sessionType === 'Online';

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Schedule Session</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        
        {/* TRAINER HEADER */}
        <View style={s.trainerCard}>
          <Image source={{ uri: trainer.profileImage || trainer.image }} style={s.trainerImg} />
          <View style={s.trainerInfo}>
            <Text style={s.trainerName}>{trainer.fullName || trainer.name}</Text>
            <View style={s.trainerStatsRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.statText}>{trainer.rating || 4.9}</Text>
              <Text style={s.statDot}>•</Text>
              <Text style={s.statText}>{trainer.specializations?.[0] || 'Fitness Coach'}</Text>
            </View>
          </View>
        </View>

        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

        {/* DATE SELECTOR (Calendly Style) */}
        <Text style={s.sectionTitle}>Select Date</Text>
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

        {/* SESSION TYPE */}
        <Text style={s.sectionTitle}>Session Format</Text>
        <View style={s.rowOptions}>
          <TouchableOpacity 
            style={[s.typeCard, isOnline && s.typeCardActive]}
            onPress={() => setForm(p => ({ ...p, sessionType: 'Online' }))}
          >
            <View style={[s.iconBox, isOnline && s.iconBoxActive]}>
              <Video size={20} color={isOnline ? '#FFF' : '#38BDF8'} />
            </View>
            <View>
              <Text style={[s.typeText, isOnline && s.typeTextActive]}>Virtual</Text>
              <Text style={s.typeSub}>Via Zoom or Meet</Text>
            </View>
            {isOnline && <CheckCircle2 size={20} color="#38BDF8" style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[s.typeCard, !isOnline && s.typeCardActive]}
            onPress={() => setForm(p => ({ ...p, sessionType: 'In-Person' }))}
          >
            <View style={[s.iconBox, !isOnline && s.iconBoxActive]}>
              <MapPin size={20} color={!isOnline ? '#FFF' : '#38BDF8'} />
            </View>
            <View>
              <Text style={[s.typeText, !isOnline && s.typeTextActive]}>In-Person</Text>
              <Text style={s.typeSub}>At Local Gym</Text>
            </View>
            {!isOnline && <CheckCircle2 size={20} color="#38BDF8" style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        </View>

        {/* DURATION */}
        <Text style={s.sectionTitle}>Duration</Text>
        <View style={s.durationRow}>
          {[30, 45, 60, 90].map(mins => (
            <TouchableOpacity 
              key={mins}
              style={[s.durationChip, form.duration === mins && s.durationChipActive]}
              onPress={() => setForm(p => ({ ...p, duration: mins }))}
            >
              <Text style={[s.durationChipText, form.duration === mins && s.durationChipTextActive]}>{mins} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FITNESS GOAL */}
        <Text style={s.sectionTitle}>Primary Goal</Text>
        <View style={s.inputWrapper}>
          <Target size={20} color="#38BDF8" style={s.inputIcon} />
          <TextInput 
            style={s.input} 
            placeholder="e.g. Weight Loss, Muscle Gain, Form Check"
            placeholderTextColor="#64748B"
            value={form.fitnessGoal}
            onChangeText={val => setForm(p => ({ ...p, fitnessGoal: val }))}
          />
        </View>

        {/* NOTES */}
        <Text style={s.sectionTitle}>Additional Notes</Text>
        <TextInput 
          style={[s.input, s.textArea]} 
          placeholder="Any injuries, equipment limits, or specific focus areas?"
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={4}
          value={form.notes}
          onChangeText={val => setForm(p => ({ ...p, notes: val }))}
        />
      </ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.totalBox}>
          <Text style={s.totalLabel}>Total Investment</Text>
          <Text style={s.totalPrice}>PKR {totalPrice}</Text>
        </View>
        <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={bookingLoading}>
          <LinearGradient colors={['#38BDF8', '#0EA5E9']} style={s.bookBtnGradient}>
            {bookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.bookBtnText}>Confirm Booking</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 44, height: 44, backgroundColor: '#1E293B', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  content: { padding: 24, paddingBottom: 120 },
  
  trainerCard: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32, alignItems: 'center' },
  trainerImg: { width: 64, height: 64, borderRadius: 32 },
  trainerInfo: { marginLeft: 16, flex: 1 },
  trainerName: { fontSize: 18, fontWeight: '900', color: '#F8FAFC' },
  trainerStatsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  statText: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginLeft: 4 },
  statDot: { fontSize: 14, color: '#334155', marginHorizontal: 8 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#F8FAFC', marginBottom: 16, letterSpacing: -0.5 },
  
  dateScroll: { gap: 12, marginBottom: 32 },
  dateCard: { width: 68, height: 86, backgroundColor: '#1E293B', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dateCardActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  dateName: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 4 },
  dateNumber: { fontSize: 22, fontWeight: '900', color: '#F8FAFC' },
  dateTextActive: { color: '#FFFFFF' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  timeChip: { width: (width - 48 - 24) / 3, backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  timeChipActive: { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: '#38BDF8' },
  timeChipText: { fontSize: 14, fontWeight: '800', color: '#CBD5E1' },
  timeChipTextActive: { color: '#38BDF8' },

  rowOptions: { gap: 16, marginBottom: 32 },
  typeCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, alignItems: 'center' },
  typeCardActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.05)' },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconBoxActive: { backgroundColor: '#38BDF8' },
  typeText: { fontSize: 16, fontWeight: '900', color: '#F8FAFC', marginBottom: 2 },
  typeTextActive: { color: '#38BDF8' },
  typeSub: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  durationRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  durationChip: { flex: 1, backgroundColor: '#1E293B', paddingVertical: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  durationChipActive: { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: '#38BDF8' },
  durationChipText: { fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  durationChipTextActive: { color: '#38BDF8' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 64, color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  textArea: { height: 120, paddingTop: 20, backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', color: '#F8FAFC', fontSize: 15, textAlignVertical: 'top' },

  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#EF4444', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  errorMsg: { color: '#EF4444', fontSize: 16, fontWeight: '800', textAlign: 'center' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.95)', flexDirection: 'row', paddingHorizontal: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  totalBox: { flex: 1 },
  totalLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700', marginBottom: 4 },
  totalPrice: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: -1 },
  bookBtn: { flex: 1.2, marginLeft: 16 },
  bookBtnGradient: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  bookBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
