import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, Modal, Alert 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/utils/navigation';
import { 
  ArrowLeft, Star, Clock, UserCheck, ShieldCheck, Sparkles, AlertTriangle 
} from 'lucide-react-native';
import api from '@/services/api';
import { useToast } from '@/components/Toast';
import { TrainerAvatar } from '@/components/TrainerAvatar';

export default function TrainerConsultationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);
  const [booking, setBooking] = useState(false);

  const fetchTrainers = async () => {
    setError(null);
    try {
      const res = await api.get('/content/trainers');
      setTrainers(res.data);
    } catch (e: any) {
      console.log('Trainers fetch error:', e.message);
      setError(e.message || 'Failed to fetch trainers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleBookConsultation = async (trainer: any) => {
    setBooking(true);
    try {
      await api.post('/consultations', {
        trainerName: trainer.name,
        trainerSpecialization: trainer.specialization
      });
      showToast(`Consultation with ${trainer.name} booked successfully!`, 'success');
      setSelectedTrainer(null);
      // Optional: Refresh local notifications or consultations
    } catch (e: any) {
      showToast(e.message || 'Failed to book consultation', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.loaderText}>Finding active coaches…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.errorContainer}>
        <LinearGradient colors={['#FF4B4B15', 'transparent']} style={StyleSheet.absoluteFill} />
        <AlertTriangle size={48} color="#FF4B4B" style={{ marginBottom: 16 }} />
        <Text style={s.errorTitle}>CONNECTION FAILURE</Text>
        <Text style={s.errorSub}>{error}</Text>
        <TouchableOpacity 
          onPress={() => { setLoading(true); fetchTrainers(); }} 
          style={s.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={s.retryBtnText}>RETRY SYNC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => safeBack()} style={s.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Fitness Coaches</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={s.intro}>
          <Text style={s.introTitle}>Personal Coaching</Text>
          <Text style={s.introSub}>Book consultations with world-class specialists for custom training advice.</Text>
        </View>

        {trainers.length === 0 ? (
          <View style={s.emptyContainer}>
            <UserCheck size={48} color={Colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={s.emptyTitle}>No Coaches Available</Text>
            <Text style={s.emptySub}>All coaches are currently booked out. Please check back later.</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {trainers.map((trainer) => (
              <TouchableOpacity 
                key={trainer._id || trainer.id} 
                style={s.card}
                activeOpacity={0.9}
                onPress={() => setSelectedTrainer(trainer)}
              >
                <LinearGradient colors={['#1A1D24', '#12141A']} style={s.cardGrad}>
                  <View style={s.cardTop}>
                    <TrainerAvatar 
                      uri={trainer.image} 
                      name={trainer.name} 
                      size={64} 
                      accentColor={trainer.accentColor || Colors.primary} 
                    />
                    <View style={s.cardInfo}>
                      <Text style={s.trainerName}>{trainer.name}</Text>
                      <Text style={[s.trainerSpec, { color: trainer.accentColor || Colors.primary }]}>{trainer.specialization}</Text>
                      <View style={s.ratingRow}>
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        <Text style={s.ratingText}>{trainer.rating || 4.9}</Text>
                        <Text style={s.expText}>• {trainer.experience}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={s.trainerBio} numberOfLines={2}>{trainer.bio}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Trainer Detail / Booking Modal ── */}
      <Modal
        visible={selectedTrainer !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTrainer(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {selectedTrainer && (
              <>
                <View style={s.modalHeader}>
                  <TrainerAvatar 
                    uri={selectedTrainer.image} 
                    name={selectedTrainer.name} 
                    size={80} 
                    accentColor={selectedTrainer.accentColor || Colors.primary} 
                  />
                  <Text style={s.modalTrainerName}>{selectedTrainer.name}</Text>
                  <Text style={[s.modalTrainerSpec, { color: selectedTrainer.accentColor || Colors.primary }]}>
                    {selectedTrainer.specialization}
                  </Text>
                </View>

                <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={s.modalSectionTitle}>BIOGRAPHY</Text>
                  <Text style={s.modalText}>{selectedTrainer.bio}</Text>

                  <Text style={s.modalSectionTitle}>EXPERTISE</Text>
                  <Text style={s.modalText}>{selectedTrainer.expertise}</Text>

                  <Text style={s.modalSectionTitle}>RECOMMENDED FOR</Text>
                  <Text style={s.modalText}>{selectedTrainer.recommendedFor}</Text>

                  {selectedTrainer.supportNote && (
                    <View style={[s.noteBox, { borderColor: (selectedTrainer.accentColor || Colors.primary) + '40' }]}>
                      <Sparkles size={18} color={selectedTrainer.accentColor || Colors.primary} />
                      <Text style={s.noteText}>{selectedTrainer.supportNote}</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={s.modalActions}>
                  <TouchableOpacity 
                    onPress={() => setSelectedTrainer(null)} 
                    style={s.cancelBtn}
                    disabled={booking}
                  >
                    <Text style={s.cancelBtnText}>Close</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleBookConsultation(selectedTrainer)} 
                    style={s.bookBtn}
                    disabled={booking}
                  >
                    <LinearGradient
                      colors={[selectedTrainer.accentColor || Colors.primary, '#9FE800']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={s.bookBtnGrad}
                    >
                      {booking ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={s.bookBtnText}>Book Session</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FF4B4B',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  errorSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  retryBtn: {
    height: 54,
    width: 160,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '900',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  content: { paddingHorizontal: SPACING.lg },
  intro: { marginTop: 10, marginBottom: 28 },
  introTitle: { color: Colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  introSub: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', lineHeight: 21 },
  grid: { gap: 16 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border },
  cardGrad: { padding: 20 },
  cardTop: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 14 },
  cardInfo: { flex: 1 },
  trainerName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  trainerSpec: { fontSize: 13, fontWeight: '700', marginTop: 2, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  expText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  trainerBio: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: Colors.card, borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, maxHeight: '85%',
    borderWidth: 1.5, borderColor: Colors.border, borderBottomWidth: 0,
  },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalTrainerName: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 12, letterSpacing: -0.5 },
  modalTrainerSpec: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  modalBody: { marginBottom: 24 },
  modalSectionTitle: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  modalText: { color: Colors.text, fontSize: 14, lineHeight: 21, fontWeight: '500', marginBottom: 20 },
  noteBox: {
    flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20, alignItems: 'center'
  },
  noteText: { flex: 1, color: Colors.text, fontSize: 13, fontWeight: '500', fontStyle: 'italic', lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, height: 60, borderRadius: 20, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center'
  },
  cancelBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  bookBtn: { flex: 1.5, height: 60, borderRadius: 20, overflow: 'hidden' },
  bookBtnGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bookBtnText: { color: '#000', fontSize: 15, fontWeight: '900' }
});
