import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, RefreshControl, Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Share, Heart, ShieldCheck, Star, MapPin, 
  Video, Clock, Award, GraduationCap, Globe, Users, TrendingUp 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import WriteReviewModal from '@/components/trainers/WriteReviewModal';
import { getMockTrainerById } from '@/constants/MockTrainers';

const { width } = Dimensions.get('window');

function DetailsSkeleton() {
  return (
    <View style={s.skeletonContainer}>
      <View style={s.skeletonHero} />
      <View style={s.skeletonBody}>
        <View style={s.skeletonTitleRow}>
          <View style={s.skeletonTitle} />
          <View style={s.skeletonTitleShort} />
        </View>
        <View style={s.skeletonChips} />
        <View style={s.skeletonTextBlock} />
      </View>
    </View>
  );
}

export default function TrainerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [reviewsData, setReviewsData] = useState<{ reviews: any[]; total: number; distribution: any }>({
    reviews: [], total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [writeModalVisible, setWriteModalVisible] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const mock = getMockTrainerById(id as string);
      if (mock && mock.reviews) {
        setReviewsData({
          reviews: mock.reviews,
          total: mock.reviews.length,
          distribution: { 1: 0, 2: 0, 3: 0, 4: Math.floor(mock.reviews.length * 0.2), 5: Math.floor(mock.reviews.length * 0.8) }
        });
        return;
      }
      const res = await api.get(`/reviews/trainers/${id}/reviews`);
      setReviewsData(res.data);
    } catch (e) {
      console.log('Error fetching reviews:', e);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const fetchCompletedBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/my');
      const filtered = res.data.filter((item: any) => {
        const itemTrainerId = item.trainerId?._id || item.trainerId;
        return itemTrainerId === id && item.bookingStatus === 'Completed';
      });
      setCompletedBookings(filtered);
    } catch (e) {
      console.log('Error fetching user bookings for review check:', e);
    }
  }, [id]);

  const fetchTrainerDetails = useCallback(async () => {
    if (!id) return;
    try {
      let data = getMockTrainerById(id as string);
      if (!data) {
        const res = await api.get(`/content/trainers/${id}`);
        data = res.data;
      }
      setTimeout(() => {
        setTrainer(data);
        setError(null);
        setLoading(false);
        setRefreshing(false);
      }, 600);
    } catch (e: any) {
      setError(e.message || 'Failed to load trainer details.');
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrainerDetails();
    fetchReviews();
    fetchCompletedBookings();
  }, [fetchTrainerDetails, fetchReviews, fetchCompletedBookings]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrainerDetails();
    fetchReviews();
    fetchCompletedBookings();
  }, [fetchTrainerDetails, fetchReviews, fetchCompletedBookings]);

  if (error) {
    return (
      <View style={s.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={s.errorTitle}>Oops!</Text>
        <Text style={s.errorSub}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={handleRefresh}>
          <Text style={s.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !trainer) {
    return (
      <View style={s.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <DetailsSkeleton />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />}
        contentContainerStyle={{ paddingBottom: 140, backgroundColor: '#0F172A' }}
        bounces={false}
      >
        <View style={s.heroContainer}>
          <Image source={{ uri: trainer.profileImage || trainer.image }} style={s.heroImage} />
          <LinearGradient colors={['rgba(15,23,42,0.6)', 'transparent', '#0F172A']} style={s.heroGradient} />
          
          <View style={[s.headerActions, { top: insets.top + 10 }]}>
            <TouchableOpacity style={s.iconButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={s.headerActionsRight}>
              <TouchableOpacity style={s.iconButton}>
                <Share size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconButton} onPress={() => setIsFavorite(!isFavorite)}>
                <Heart size={20} color={isFavorite ? '#EF4444' : '#FFF'} fill={isFavorite ? '#EF4444' : 'transparent'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.heroInfo}>
            <View style={s.badgesRow}>
              {trainer.badges?.map((b: string, i: number) => (
                <View key={i} style={s.badgeCard}>
                  <Text style={s.badgeText}>{b.toUpperCase()}</Text>
                </View>
              ))}
            </View>
            <View style={s.nameRow}>
              <Text style={s.trainerName}>{trainer.fullName || trainer.name}</Text>
              {trainer.verifiedTrainer && <ShieldCheck size={26} color="#38BDF8" style={{ marginLeft: 8 }} />}
            </View>
            <Text style={s.trainerTitle}>{trainer.specializations?.[0] || trainer.specialization || 'Fitness Coach'}</Text>
          </View>
        </View>

        <View style={s.contentContainer}>
          {/* PROFILE SUMMARY STATS */}
          <View style={s.summaryCard}>
            <View style={s.summaryItem}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.summaryValue}>{trainer.rating || '4.9'}</Text>
              <Text style={s.summaryLabel}>{reviewsData.total > 0 ? reviewsData.total : (trainer.totalReviews || 0)} Reviews</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Clock size={20} color="#38BDF8" />
              <Text style={s.summaryValue}>{trainer.stats?.yearsExperience || trainer.experienceYears || 5}</Text>
              <Text style={s.summaryLabel}>Years Exp</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              {trainer.availabilityStatus === 'Online' ? <Video size={20} color="#10B981" /> : <MapPin size={20} color="#10B981" />}
              <Text style={s.summaryValue} numberOfLines={1}>{trainer.availabilityStatus === 'Online' ? 'Online' : trainer.city}</Text>
              <Text style={s.summaryLabel}>{trainer.country || 'Pakistan'}</Text>
            </View>
          </View>

          {/* ADVANCED STATS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Track Record</Text>
            <View style={s.statsGrid}>
              <View style={s.statCard}>
                <Users size={22} color="#38BDF8" />
                <Text style={s.statCardValue}>{trainer.stats?.clientsTrained || '100+'}</Text>
                <Text style={s.statCardLabel}>Active Clients</Text>
              </View>
              <View style={s.statCard}>
                <TrendingUp size={22} color="#10B981" />
                <Text style={s.statCardValue}>{trainer.stats?.successRate || '95%'}</Text>
                <Text style={s.statCardLabel}>Success Rate</Text>
              </View>
            </View>
          </View>

          {/* ABOUT */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>About Coach</Text>
            <Text style={s.bioText} numberOfLines={bioExpanded ? undefined : 4}>
              {trainer.biography || trainer.bio || 'This trainer has not provided a detailed biography yet.'}
            </Text>
            {((trainer.biography || trainer.bio || '').length > 150) && (
              <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
                <Text style={s.readMoreBtn}>{bioExpanded ? 'Read Less' : 'Read More'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* EXPERTISE */}
          {trainer.specializations && trainer.specializations.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Expertise</Text>
              <View style={s.chipContainer}>
                {trainer.specializations.map((spec: string, i: number) => (
                  <View key={i} style={s.chip}>
                    <Text style={s.chipText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CLIENT TRANSFORMATIONS */}
          {trainer.transformations && trainer.transformations.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Client Transformations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                {trainer.transformations.map((t: any) => (
                  <View key={t.id} style={s.transformationCard}>
                    <View style={s.imagesRow}>
                      <Image source={{ uri: t.beforeImage }} style={s.transImage} />
                      <View style={s.transImageLabel}><Text style={s.transImageLabelText}>BEFORE</Text></View>
                      <Image source={{ uri: t.afterImage }} style={s.transImage} />
                      <View style={[s.transImageLabel, { left: 160 }]}><Text style={s.transImageLabelText}>AFTER</Text></View>
                    </View>
                    <View style={s.transInfo}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={s.transClientName}>{t.clientName}</Text>
                        <Text style={s.transDuration}>{t.duration}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={s.transGoal}>{t.goalAchieved}</Text>
                        <Text style={s.transWeight}>{t.weightChange}</Text>
                      </View>
                      <Text style={s.transTestimonial}>"{t.testimonial}"</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* CREDENTIALS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Credentials</Text>
            {trainer.qualifications && (
              <View style={s.qualItem}>
                <GraduationCap size={20} color="#94A3B8" />
                <Text style={s.qualText}>{trainer.qualifications}</Text>
              </View>
            )}
            {trainer.certifications && trainer.certifications.map((cert: string, i: number) => (
              <View key={`cert-${i}`} style={s.qualItem}>
                <Award size={20} color="#94A3B8" />
                <Text style={s.qualText}>{cert}</Text>
              </View>
            ))}
            {trainer.languages && trainer.languages.length > 0 && (
              <View style={s.qualItem}>
                <Globe size={20} color="#94A3B8" />
                <Text style={s.qualText}>{trainer.languages.join(', ')}</Text>
              </View>
            )}
          </View>

          {/* WEEKLY AVAILABILITY */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Weekly Schedule</Text>
            <View style={s.scheduleCard}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const time = trainer.weeklySchedule?.[day] || 'Available';
                let statusColor = '#38BDF8';
                if (time === 'Booked') statusColor = '#EF4444';
                else if (time === 'Limited Slots') statusColor = '#F59E0B';
                else if (time === 'Off') statusColor = '#64748B';
                
                return (
                  <View key={day} style={s.scheduleRow}>
                    <Text style={s.scheduleDay}>{day}</Text>
                    <Text style={[s.scheduleTime, { color: statusColor }]}>{time}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* CLIENT REVIEWS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Client Reviews</Text>
            
            {reviewsData.total > 0 && (
              <View style={s.reviewSummaryCard}>
                <View style={s.avgRatingContainer}>
                  <Text style={s.avgRatingText}>{trainer.rating || '0.0'}</Text>
                  <View style={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} color={star <= Math.round(trainer.rating || 0) ? '#F59E0B' : '#334155'} fill={star <= Math.round(trainer.rating || 0) ? '#F59E0B' : 'transparent'} />
                    ))}
                  </View>
                  <Text style={s.totalReviewsSubText}>{reviewsData.total} Reviews</Text>
                </View>
                
                <View style={s.distributionContainer}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsData.distribution?.[stars] || 0;
                    const percentage = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0;
                    return (
                      <View key={stars} style={s.distributionRow}>
                        <Text style={s.distStarLabel}>{stars} ★</Text>
                        <View style={s.distBarBg}>
                          <View style={[s.distBarFill, { width: `${percentage}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {completedBookings.length > 0 && (
              <TouchableOpacity style={s.writeReviewBtn} onPress={() => setWriteModalVisible(true)}>
                <Text style={s.writeReviewBtnText}>Write a Review</Text>
              </TouchableOpacity>
            )}

            {reviewsLoading ? (
              <ActivityIndicator color="#38BDF8" style={{ marginVertical: 16 }} />
            ) : reviewsData.reviews.length === 0 ? (
              <View style={s.reviewsEmpty}>
                <Star size={32} color="#334155" style={{ marginBottom: 12 }} />
                <Text style={s.reviewsEmptyTitle}>No reviews yet</Text>
                <Text style={s.reviewsEmptySub}>Be the first to review this trainer after completing a session.</Text>
              </View>
            ) : (
              <View style={s.reviewsList}>
                {reviewsData.reviews.map((item: any) => (
                  <View key={item.id || item._id} style={s.reviewCard}>
                    <View style={s.reviewHeader}>
                      <Image source={{ uri: item.userId?.avatar || item.avatar || 'https://via.placeholder.com/150' }} style={s.reviewerAvatar} />
                      <View style={s.reviewerInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={s.reviewerName}>{item.userId?.name || item.reviewerName || 'User'}</Text>
                          {(item.verified || item.verifiedClient) && <ShieldCheck size={14} color="#10B981" style={{ marginLeft: 6 }} />}
                        </View>
                        <View style={s.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={12} color={star <= item.rating ? '#F59E0B' : '#334155'} fill={star <= item.rating ? '#F59E0B' : 'transparent'} />
                          ))}
                        </View>
                      </View>
                      <Text style={s.reviewDate}>{item.date || new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={s.reviewText}>{item.review || item.text}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                      <TouchableOpacity style={s.helpfulBtn}>
                        <Text style={s.helpfulText}>Helpful ({item.helpfulCount || 0})</Text>
                      </TouchableOpacity>
                    </View>
                    {item.trainerReply && (
                      <View style={s.trainerReplyBox}>
                        <Text style={s.trainerReplyName}>Reply from Coach</Text>
                        <Text style={s.trainerReplyText}>{item.trainerReply}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.bottomBarPrice}>
          <Text style={s.priceLabel}>Session Price</Text>
          <Text style={s.priceValue}>PKR {trainer.hourlyPrice || 3000}<Text style={s.priceUnit}>/hr</Text></Text>
        </View>
        <TouchableOpacity style={s.bookBtn} onPress={() => router.push(`/book-session?trainerId=${trainer.id || trainer._id}`)}>
          <LinearGradient colors={['#38BDF8', '#0EA5E9']} style={s.bookBtnGradient}>
            <Text style={s.bookBtnText}>Book Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {completedBookings.length > 0 && (
        <WriteReviewModal visible={writeModalVisible} onClose={() => setWriteModalVisible(false)} trainerId={trainer._id} bookingId={completedBookings[0]._id} onReviewSubmitted={() => { fetchReviews(); fetchTrainerDetails(); fetchCompletedBookings(); }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', padding: 24 },
  errorTitle: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', marginBottom: 8 },
  errorSub: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
  retryBtn: { backgroundColor: '#38BDF8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  
  heroContainer: { width: '100%', height: 480, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: { position: 'absolute', width: '100%', height: '100%' },
  headerActions: { position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerActionsRight: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  heroInfo: { position: 'absolute', bottom: 32, left: 24, right: 24 },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  badgeCard: { backgroundColor: 'rgba(56,189,248,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' },
  badgeText: { color: '#38BDF8', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  trainerName: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 8, letterSpacing: -1 },
  trainerTitle: { color: '#38BDF8', fontSize: 18, fontWeight: '800' },

  contentContainer: { padding: 24, paddingTop: 0, backgroundColor: '#0F172A' },
  
  summaryCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 24, padding: 20, justifyContent: 'space-evenly', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 18, fontWeight: '900', color: '#F8FAFC', marginTop: 8 },
  summaryLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#334155' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#F8FAFC', marginBottom: 16, letterSpacing: -0.5 },
  
  bioText: { fontSize: 15, lineHeight: 24, color: '#CBD5E1', fontWeight: '500' },
  readMoreBtn: { color: '#38BDF8', fontWeight: '800', marginTop: 8, fontSize: 15 },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
  chipText: { color: '#38BDF8', fontWeight: '800', fontSize: 14 },

  statsGrid: { flexDirection: 'row', gap: 16 },
  statCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  statCardValue: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', marginTop: 12 },
  statCardLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700', marginTop: 4 },

  transformationCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', width: 310 },
  imagesRow: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 16 },
  transImage: { width: 140, height: 160, resizeMode: 'cover' },
  transImageLabel: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  transImageLabelText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  transInfo: { paddingHorizontal: 4 },
  transClientName: { fontSize: 16, fontWeight: '900', color: '#F8FAFC' },
  transDuration: { fontSize: 13, fontWeight: '700', color: '#38BDF8' },
  transGoal: { fontSize: 13, color: '#CBD5E1', fontWeight: '600' },
  transWeight: { fontSize: 13, color: '#10B981', fontWeight: '800' },
  transTestimonial: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginTop: 12, lineHeight: 20 },

  qualItem: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  qualText: { fontSize: 15, color: '#CBD5E1', fontWeight: '600', flex: 1 },

  scheduleCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  scheduleDay: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  scheduleTime: { fontSize: 14, fontWeight: '800' },

  reviewSummaryCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  avgRatingContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  avgRatingText: { fontSize: 48, fontWeight: '900', color: '#F8FAFC', letterSpacing: -2 },
  starsRow: { flexDirection: 'row', gap: 4, marginVertical: 8 },
  totalReviewsSubText: { fontSize: 13, color: '#94A3B8', fontWeight: '700' },
  distributionContainer: { flex: 1.5, justifyContent: 'center', gap: 6, marginLeft: 16 },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distStarLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', width: 28, textAlign: 'right' },
  distBarBg: { flex: 1, height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  distBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 4 },

  writeReviewBtn: { backgroundColor: '#1E293B', borderWidth: 1.5, borderColor: '#38BDF8', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  writeReviewBtnText: { color: '#38BDF8', fontWeight: '900', fontSize: 16 },

  reviewsEmpty: { backgroundColor: '#1E293B', borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  reviewsEmptyTitle: { fontSize: 18, fontWeight: '900', color: '#F8FAFC', marginBottom: 8 },
  reviewsEmptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },

  reviewsList: { gap: 16 },
  reviewCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  reviewerAvatar: { width: 44, height: 44, borderRadius: 22 },
  reviewerInfo: { flex: 1, marginLeft: 12 },
  reviewerName: { fontSize: 15, fontWeight: '800', color: '#F8FAFC' },
  reviewDate: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  reviewText: { fontSize: 15, color: '#CBD5E1', lineHeight: 22, fontWeight: '500' },
  helpfulBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  helpfulText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  trainerReplyBox: { marginTop: 16, backgroundColor: 'rgba(56,189,248,0.1)', padding: 16, borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#38BDF8' },
  trainerReplyName: { fontSize: 13, fontWeight: '900', color: '#38BDF8', marginBottom: 6 },
  trainerReplyText: { fontSize: 14, color: '#CBD5E1', lineHeight: 20 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.95)', flexDirection: 'row', paddingHorizontal: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  bottomBarPrice: { flex: 1 },
  priceLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700', marginBottom: 4 },
  priceValue: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', letterSpacing: -1 },
  priceUnit: { fontSize: 15, color: '#94A3B8', fontWeight: '700' },
  bookBtn: { flex: 1, marginLeft: 16 },
  bookBtnGradient: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  bookBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  skeletonContainer: { flex: 1, backgroundColor: '#0F172A' },
  skeletonHero: { width: '100%', height: 480, backgroundColor: '#1E293B' },
  skeletonBody: { padding: 24, backgroundColor: '#0F172A' },
  skeletonTitleRow: { marginBottom: 32 },
  skeletonTitle: { width: '70%', height: 36, backgroundColor: '#1E293B', borderRadius: 8, marginBottom: 12 },
  skeletonTitleShort: { width: '40%', height: 20, backgroundColor: '#1E293B', borderRadius: 8 },
  skeletonChips: { width: '100%', height: 100, backgroundColor: '#1E293B', borderRadius: 24, marginBottom: 32 },
  skeletonTextBlock: { width: '100%', height: 140, backgroundColor: '#1E293B', borderRadius: 20 },
});
