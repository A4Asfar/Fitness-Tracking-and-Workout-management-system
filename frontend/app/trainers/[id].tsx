import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, Star, Award, Target, 
  MessageCircle, ShieldCheck, Sparkles,
  ChevronRight, Heart, Info
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trainer } from '@/constants/TrainersData';
import { TrainerAvatar } from '@/components/TrainerAvatar';
import { ConsultationService } from '@/services/consultationService';
import { ContentService } from '@/services/contentService';
import { useToast } from '@/components/Toast';

const { width } = Dimensions.get('window');

export default function TrainerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  
  const trainerId = Array.isArray(id) ? id[0] : id;
  const [trainer, setTrainer] = React.useState<Trainer | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const data = await ContentService.getTrainerById(trainerId);
        setTrainer(data);
      } catch (err) {
        showToast('Failed to load trainer details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  if (loading) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: Colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Stack.Screen options={{ title: 'Error', headerShown: true, headerTintColor: Colors.primary }} />
        <Info size={48} color={Colors.textSecondary} opacity={0.5} />
        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '800', marginTop: 20 }}>Trainer Profile Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
          <Text style={{ color: '#000', fontWeight: '900' }}>BACK TO TRAINERS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConsult = async () => {
    try {
      await ConsultationService.logConsultation({
        trainerName: trainer.name,
        trainerSpecialization: trainer.specialization,
      });
      Alert.alert('Consultation Sent', `You have requested a consultation with ${trainer.name}. They will reach out to you shortly.`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to request consultation. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={styles.heroContainer}>
          <TrainerAvatar 
            uri={trainer.image} 
            name={trainer.name} 
            size={width} 
            accentColor={trainer.accentColor} 
            borderRadius={0}
          />
          
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.heroOverlay}
          />

          <View style={[styles.headerActions, { top: insets.top + SPACING.sm }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.actionBtn}>
              <ArrowLeft size={22} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Heart size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.tagRow}>
                <Text style={styles.specialization}>{trainer.specialization}</Text>
                <View style={styles.genderBadge}><Text style={styles.genderText}>{trainer.gender}</Text></View>
              </View>
              <Text style={styles.name}>{trainer.name}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={16} color="#000" fill="#000" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <StatBox icon={Award} label="Experience" value={trainer.experience} />
            <StatBox icon={ShieldCheck} label="Certified" value="Verified" />
            <StatBox icon={MessageCircle} label="Response" value="< 2 hrs" />
          </View>
        </View>

        <DetailSection title="Trainer Bio" icon={Sparkles}>
          <Text style={styles.bioText}>{trainer.bio}</Text>
        </DetailSection>

        <DetailSection title="Core Expertise" icon={Target}>
          <View style={styles.expertiseCard}>
            <Text style={styles.expertiseText}>{trainer.recommendedFor}</Text>
          </View>
        </DetailSection>

        <DetailSection title="Guidance Note" icon={MessageCircle}>
          <LinearGradient
            colors={[Colors.primary + '15', Colors.primary + '05']}
            style={styles.noteCard}
          >
            <Text style={styles.noteText}>"{trainer.supportNote}"</Text>
          </LinearGradient>
        </DetailSection>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={styles.mainAction} 
          activeOpacity={0.8}
          onPress={handleConsult}
        >
          <LinearGradient
            colors={[Colors.primary, '#9FE800']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.actionGrad}
          >
            <Text style={styles.actionText}>CONSULT TRAINER NOW</Text>
            <ChevronRight size={18} color="#000" strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatBox({ icon: Icon, label, value }: any) {
  return (
    <View style={styles.statBox}>
      <Icon size={18} color={Colors.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DetailSection({ title, icon: Icon, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={16} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 380, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroInitials: { color: Colors.primary, fontSize: 100, fontWeight: '900', opacity: 0.15 },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
  headerActions: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },

  profileHeader: { paddingHorizontal: 24, marginTop: -60 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  specialization: { color: Colors.primary, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  genderBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  genderText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  name: { color: Colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  ratingBadge: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4,
  },
  ratingText: { color: '#000', fontSize: 14, fontWeight: '900' },

  statGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBox: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 20,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  statLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 8, letterSpacing: 0.5 },
  statValue: { color: Colors.text, fontSize: 13, fontWeight: '800', marginTop: 2 },

  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  bioText: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24, fontWeight: '500' },

  expertiseCard: {
    backgroundColor: Colors.card, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  expertiseText: { color: Colors.text, fontSize: 15, fontWeight: '600', lineHeight: 22 },

  noteCard: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.primary + '30' },
  noteText: { color: Colors.text, fontSize: 16, fontStyle: 'italic', fontWeight: '600', textAlign: 'center', lineHeight: 24 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background + 'F8', paddingHorizontal: 24,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  mainAction: { borderRadius: 20, overflow: 'hidden' },
  actionGrad: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1 },

  errorBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 30 },
});
