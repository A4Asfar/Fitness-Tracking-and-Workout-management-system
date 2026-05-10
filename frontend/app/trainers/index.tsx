import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, FlatList, Modal
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, Star, Award, 
  ChevronRight, Sparkles, User, Users
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trainer } from '@/constants/TrainersData';
import { TrainerAvatar } from '@/components/TrainerAvatar';
import { ConsultationService } from '@/services/consultationService';
import { ContentService } from '@/services/contentService';
import { useToast } from '@/components/Toast';

const { width } = Dimensions.get('window');
const PAD = 24;

export default function TrainersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [trainers, setTrainers] = React.useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = React.useState<Trainer | null>(null);
  const [isConsulting, setIsConsulting] = React.useState(false);

  React.useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await ContentService.getTrainers();
        setTrainers(data);
      } catch (err) {
        showToast('Failed to load trainers', 'error');
      }
    };
    fetchTrainers();
  }, []);

  const handleConsult = async () => {
    if (!selectedTrainer) return;
    setIsConsulting(true);
    try {
      await ConsultationService.logConsultation({
        trainerName: selectedTrainer.name,
        trainerSpecialization: selectedTrainer.specialization,
      });
      showToast(`Trainer consultation request saved for ${selectedTrainer.name}.`, 'success');
      setSelectedTrainer(null);
    } catch (error: any) {
      showToast('Failed to save consultation. Please try again.', 'error');
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient 
        colors={[Colors.primary + '15', 'transparent']} 
        style={styles.headerGlow} 
      />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Trainers</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={trainers}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        renderItem={({ item }) => (
          <TrainerCard 
            trainer={item} 
            onPress={() => router.push(`/trainers/${item.id}` as any)} 
            onConsult={() => setSelectedTrainer(item)}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.introSection}>
            <Text style={styles.title}>Professional Support</Text>
            <Text style={styles.subtitle}>Connect with certified experts to elevate your training performance.</Text>
            
            <TouchableOpacity 
              style={styles.aiBanner}
              onPress={() => router.push('/ai-chat')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary + '20', Colors.primary + '05']}
                style={styles.aiBannerGrad}
              >
                <View style={styles.aiIconBox}>
                  <Sparkles size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiBannerTitle}>Need Instant Advice?</Text>
                  <Text style={styles.aiBannerSub}>Ask our AI Fitness Assistant anything</Text>
                </View>
                <ChevronRight size={18} color={Colors.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Consultation Modal */}
      <Modal
        visible={!!selectedTrainer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTrainer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Consultation</Text>
              <TouchableOpacity onPress={() => setSelectedTrainer(null)}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {selectedTrainer && (
              <View style={styles.modalBody}>
                <View style={styles.trainerPreview}>
                  <TrainerAvatar 
                    uri={selectedTrainer.image} 
                    name={selectedTrainer.name} 
                    size={70} 
                    accentColor={selectedTrainer.accentColor} 
                    borderRadius={18}
                  />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.modalTrainerName}>{selectedTrainer.name}</Text>
                    <Text style={styles.modalTrainerSpec}>{selectedTrainer.specialization}</Text>
                    <Text style={styles.modalTrainerExp}>{selectedTrainer.experience} Experience</Text>
                  </View>
                </View>

                <View style={styles.supportBox}>
                  <Text style={styles.supportTitle}>What to expect:</Text>
                  <Text style={styles.supportDesc}>{selectedTrainer.expertise}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.confirmBtn}
                  onPress={handleConsult}
                  disabled={isConsulting}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#9FE800']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.confirmBtnGrad}
                  >
                    <Text style={styles.confirmBtnText}>{isConsulting ? 'SAVING...' : 'CONFIRM CONSULTATION'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TrainerCard({ trainer, onPress, onConsult }: { trainer: Trainer, onPress: () => void, onConsult: () => void }) {
  const isAvailable = trainer.status === 'Available';

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          <TrainerAvatar 
            uri={trainer.image} 
            name={trainer.name} 
            size={85} 
            accentColor={trainer.accentColor} 
            borderRadius={22}
          />
          <View style={[styles.statusBadge, { backgroundColor: isAvailable ? '#39FF14' : '#FFD700' }]}>
            <Text style={styles.statusText}>{trainer.status}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.trainerName}>{trainer.name}</Text>
            <View style={styles.genderBadge}>
              <Text style={styles.genderText}>{trainer.gender}</Text>
            </View>
          </View>
          
          <Text style={styles.specialization}>{trainer.specialization}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Award size={13} color={Colors.primary} />
              <Text style={styles.metaText}>{trainer.experience}</Text>
            </View>
            <View style={styles.metaItem}>
              <Star size={13} color="#FFD700" fill="#FFD700" />
              <Text style={styles.metaText}>4.9</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.expertiseLine} numberOfLines={2}>{trainer.expertise}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity onPress={onConsult}>
          <LinearGradient
            colors={[Colors.primary, '#9FE800']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.consultBtn}
          >
            <Text style={styles.consultBtnText}>Consult Trainer</Text>
            <ChevronRight size={16} color="#000" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: PAD, paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.card, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  listContent: { padding: PAD },
  introSection: { marginBottom: 32 },
  title: { color: Colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginTop: 8, fontWeight: '500', lineHeight: 22, marginBottom: 20 },

  aiBanner: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.primary + '30' },
  aiBannerGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  aiIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  aiBannerTitle: { color: Colors.text, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  aiBannerSub: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 },

  card: {
    backgroundColor: Colors.card, borderRadius: 28, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border, elevation: 8,
  },
  cardHeader: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  imageContainer: { width: 85, height: 85, position: 'relative' },
  trainerImage: { width: '100%', height: '100%', borderRadius: 22, backgroundColor: '#222' },
  imagePlaceholder: { width: '100%', height: '100%', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  initials: { color: Colors.primary, fontSize: 30, fontWeight: '900' },
  statusBadge: {
    position: 'absolute', bottom: -4, alignSelf: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.card,
  },
  statusText: { color: '#000', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },

  infoContainer: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trainerName: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  genderBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  genderText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800' },
  specialization: { color: Colors.primary, fontSize: 12, fontWeight: '800', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },

  expertiseLine: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '500', marginBottom: 18 },
  cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  consultBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  consultBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#161616', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderTopWidth: 1, borderTopColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  modalBody: { gap: 24 },
  trainerPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: Colors.border },
  modalTrainerName: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  modalTrainerSpec: { color: Colors.primary, fontSize: 12, fontWeight: '800', marginTop: 2, textTransform: 'uppercase' },
  modalTrainerExp: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 4 },
  supportBox: { gap: 8 },
  supportTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  supportDesc: { color: Colors.text, fontSize: 15, fontWeight: '500', lineHeight: 22 },
  confirmBtn: { borderRadius: 18, overflow: 'hidden' },
  confirmBtnGrad: { height: 58, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});
