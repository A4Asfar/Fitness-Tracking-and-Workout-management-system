import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, ActivityIndicator, Image
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Calendar, Video, MapPin, Target } from 'lucide-react-native';
import api from '@/services/api';

export default function BookSessionScreen() {
  const { trainerId } = useLocalSearchParams<{ trainerId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [trainer, setTrainer] = useState<any>(null);
  const [loadingTrainer, setLoadingTrainer] = useState(true);
  
  const [form, setForm] = useState({
    sessionType: 'Online',
    date: '',
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
        const res = await api.get(`/content/trainers/${trainerId}`);
        setTrainer(res.data);
      } catch (err) {
        setError('Failed to load trainer info.');
      } finally {
        setLoadingTrainer(false);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  const rate = trainer?.hourlyPrice || 1500;
  const totalPrice = trainer ? (rate * (form.duration / 60)) : 0;

  const handleBook = async () => {
    if (!form.date || !form.time || !form.fitnessGoal) {
      setError('Please fill in all required fields (Date, Time, Goal).');
      return;
    }
    
    // Quick past date check
    const today = new Date().toISOString().split('T')[0];
    if (form.date < today) {
      setError('Cannot book a session in the past.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        trainerId: trainer._id,
        bookingDate: form.date,
        bookingTime: form.time,
        duration: form.duration,
        sessionType: form.sessionType,
        fitnessGoal: form.fitnessGoal,
        notes: form.notes,
      });

      // Push to success screen
      router.push(`/booking-success?bookingId=${res.data._id}`);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to book session.');
      setBookingLoading(false);
    }
  };

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (loadingTrainer) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={s.errorText}>Trainer not found.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Book Session</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        
        {/* TRAINER INFO */}
        <View style={s.trainerCard}>
          <Image source={{ uri: trainer.profileImage || trainer.image }} style={s.trainerImg} />
          <View style={s.trainerInfo}>
            <Text style={s.trainerName}>{trainer.fullName || trainer.name}</Text>
            <View style={s.trainerStatsRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.statText}>{trainer.rating}</Text>
              <Text style={s.statDot}>•</Text>
              <Text style={s.statText}>{trainer.experienceYears} Yrs Exp</Text>
            </View>
            <Text style={s.priceText}>PKR {trainer.hourlyPrice || 1500}<Text style={s.priceUnit}>/hr</Text></Text>
          </View>
        </View>

        {error ? <Text style={s.errorMsg}>{error}</Text> : null}

        {/* SESSION TYPE */}
        <Text style={s.sectionTitle}>Session Type</Text>
        <View style={s.rowOptions}>
          {['Online', 'In-Person'].map(type => (
            <TouchableOpacity 
              key={type} 
              style={[s.typeCard, form.sessionType === type && s.typeCardActive]}
              onPress={() => setField('sessionType', type)}
            >
              {type === 'Online' ? <Video size={20} color={form.sessionType === type ? '#FFF' : '#64748B'} /> : <MapPin size={20} color={form.sessionType === type ? '#FFF' : '#64748B'} />}
              <Text style={[s.typeText, form.sessionType === type && s.typeTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATE & TIME (Using simple text inputs for now to avoid large dependencies, assuming user uses valid YYYY-MM-DD or standard picker) */}
        <Text style={s.sectionTitle}>Date & Time</Text>
        <View style={s.rowInputs}>
          <View style={s.inputWrapper}>
            <Calendar size={20} color="#64748B" style={s.inputIcon} />
            <TextInput 
              style={s.input} 
              placeholder="YYYY-MM-DD"
              value={form.date}
              onChangeText={val => setField('date', val)}
            />
          </View>
        </View>
        
        <View style={s.chipRow}>
          {['Morning', 'Afternoon', 'Evening'].map(time => (
            <TouchableOpacity 
              key={time}
              style={[s.chip, form.time === time && s.chipActive]}
              onPress={() => setField('time', time)}
            >
              <Text style={[s.chipText, form.time === time && s.chipTextActive]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DURATION */}
        <Text style={s.sectionTitle}>Duration</Text>
        <View style={s.chipRow}>
          {[30, 45, 60, 90].map(mins => (
            <TouchableOpacity 
              key={mins}
              style={[s.chip, form.duration === mins && s.chipActive]}
              onPress={() => setField('duration', mins)}
            >
              <Text style={[s.chipText, form.duration === mins && s.chipTextActive]}>{mins} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FITNESS GOAL */}
        <Text style={s.sectionTitle}>Fitness Goal</Text>
        <View style={s.inputWrapper}>
          <Target size={20} color="#64748B" style={s.inputIcon} />
          <TextInput 
            style={s.input} 
            placeholder="e.g. Weight Loss, Muscle Gain..."
            value={form.fitnessGoal}
            onChangeText={val => setField('fitnessGoal', val)}
          />
        </View>

        {/* NOTES */}
        <Text style={s.sectionTitle}>Notes (Optional)</Text>
        <TextInput 
          style={[s.input, s.textArea]} 
          placeholder="Any injuries, preferences, or questions?"
          multiline
          numberOfLines={3}
          value={form.notes}
          onChangeText={val => setField('notes', val)}
        />
      </ScrollView>

      {/* FOOTER */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.totalBox}>
          <Text style={s.totalLabel}>Total Price</Text>
          <Text style={s.totalPrice}>PKR {totalPrice}</Text>
        </View>
        <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={bookingLoading}>
          {bookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.bookBtnText}>Confirm Booking</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { padding: 24, paddingBottom: 100 },
  
  trainerCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 24, alignItems: 'center' },
  trainerImg: { width: 64, height: 64, borderRadius: 32 },
  trainerInfo: { marginLeft: 16, flex: 1 },
  trainerName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  trainerStatsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  statText: { fontSize: 13, fontWeight: '600', color: '#64748B', marginLeft: 4 },
  statDot: { fontSize: 14, color: '#CBD5E1', marginHorizontal: 6 },
  priceText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  priceUnit: { fontSize: 12, color: '#94A3B8' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12, marginTop: 8 },
  
  rowOptions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeCard: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  typeCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  typeTextActive: { color: '#FFF' },

  rowInputs: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, height: 56, marginBottom: 24 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0F172A' },
  textArea: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, height: 100, textAlignVertical: 'top', marginBottom: 24 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  chip: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  chipActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },

  errorMsg: { backgroundColor: '#FEE2E2', color: '#EF4444', padding: 12, borderRadius: 12, fontSize: 14, fontWeight: '600', marginBottom: 20 },
  errorText: { fontSize: 16, color: '#EF4444', fontWeight: '600' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' },
  totalBox: { flex: 1 },
  totalLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  totalPrice: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
