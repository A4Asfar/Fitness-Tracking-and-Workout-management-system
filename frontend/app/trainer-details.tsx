import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, RefreshControl, Dimensions, Animated 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Share, Heart, ShieldCheck, Star, MapPin, 
  Video, Clock, Award, GraduationCap, Globe, Users, TrendingUp 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import WriteReviewModal from '@/components/trainers/WriteReviewModal';

const { width } = Dimensions.get('window');

// Custom Skeleton Component for Details
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

  // Review states
  const [reviewsData, setReviewsData] = useState<{ reviews: any[]; total: number; distribution: any }>({
    reviews: [],
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [writeModalVisible, setWriteModalVisible] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
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
      // Filter bookings that match this trainer ID and status 'Completed'
      // The bookings array from the backend will populate trainerId as an object, check item.trainerId._id or item.trainerId
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
      const res = await api.get(`/content/trainers/${id}`);
      setTimeout(() => {
        setTrainer(res.data);
        setError(null);
        setLoading(false);
        setRefreshing(false);
      }, 600); // simulate premium loading skeleton
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 120 }} // space for bottom bar
      >
        {/* HERO HEADER */}
        <View style={s.heroContainer}>
          <Image source={{ uri: trainer.profileImage || trainer.image }} style={s.heroImage} />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']} style={s.heroGradient} />
          
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
            {trainer.featuredTrainer && (
              <View style={s.featuredBadge}>
                <Text style={s.featuredText}>FEATURED</Text>
              </View>
            )}
            <View style={s.nameRow}>
              <Text style={s.trainerName}>{trainer.fullName || trainer.name}</Text>
              {trainer.verifiedTrainer && <ShieldCheck size={22} color={Colors.primary} style={{ marginLeft: 8 }} />}
            </View>
            <Text style={s.trainerTitle}>{trainer.specializations?.[0] || trainer.specialization || 'Fitness Coach'}</Text>
          </View>
        </View>

        <View style={s.contentContainer}>
          {/* PROFILE SUMMARY STATS */}
          <View style={s.summaryCard}>
            <View style={s.summaryItem}>
              <Star size={18} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.summaryValue}>{trainer.rating || '4.9'}</Text>
              <Text style={s.summaryLabel}>{trainer.totalReviews || 0} Reviews</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Clock size={18} color={Colors.primary} />
              <Text style={s.summaryValue}>{trainer.experienceYears || parseInt(trainer.experience) || 5}</Text>
              <Text style={s.summaryLabel}>Years Exp</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              {trainer.availabilityStatus === 'Online' ? <Video size={18} color={Colors.secondary} /> : <MapPin size={18} color={Colors.secondary} />}
              <Text style={s.summaryValue} numberOfLines={1}>{trainer.availabilityStatus === 'Online' ? 'Online' : trainer.city}</Text>
              <Text style={s.summaryLabel}>{trainer.country || 'Pakistan'}</Text>
            </View>
          </View>

          {/* BIOGRAPHY */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>About Trainer</Text>
            <Text style={s.bioText} numberOfLines={bioExpanded ? undefined : 3}>
              {trainer.biography || trainer.bio || 'This trainer has not provided a detailed biography yet.'}
            </Text>
            {((trainer.biography || trainer.bio || '').length > 150) && (
              <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
                <Text style={s.readMoreBtn}>{bioExpanded ? 'Read Less' : 'Read More'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SPECIALIZATIONS */}
          {trainer.specializations && trainer.specializations.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Specializations</Text>
              <View style={s.chipContainer}>
                {trainer.specializations.map((spec: string, i: number) => (
                  <View key={i} style={s.chip}>
                    <Text style={s.chipText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* STATS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Track Record</Text>
            <View style={s.statsGrid}>
              <View style={s.statCard}>
                <Users size={20} color={Colors.primary} />
                <Text style={s.statCardValue}>200+</Text>
                <Text style={s.statCardLabel}>Clients</Text>
              </View>
              <View style={s.statCard}>
                <TrendingUp size={20} color={Colors.primary} />
                <Text style={s.statCardValue}>98%</Text>
                <Text style={s.statCardLabel}>Success Rate</Text>
              </View>
            </View>
          </View>

          {/* QUALIFICATIONS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Qualifications</Text>
            {trainer.qualifications && (
              <View style={s.qualItem}>
                <GraduationCap size={20} color={Colors.textSecondary} />
                <Text style={s.qualText}>{trainer.qualifications}</Text>
              </View>
            )}
            {trainer.certifications && trainer.certifications.map((cert: string, i: number) => (
              <View key={`cert-${i}`} style={s.qualItem}>
                <Award size={20} color={Colors.textSecondary} />
                <Text style={s.qualText}>{cert}</Text>
              </View>
            ))}
            {trainer.languages && trainer.languages.length > 0 && (
              <View style={s.qualItem}>
                <Globe size={20} color={Colors.textSecondary} />
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
                const isOff = time === 'Off' || time === 'Busy';
                return (
                  <View key={day} style={s.scheduleRow}>
                    <Text style={s.scheduleDay}>{day}</Text>
                    <Text style={[s.scheduleTime, isOff && s.scheduleTimeOff]}>{time}</Text>
                  </View>
                );
              })}
            </View>
          </View>

                  {/* CLIENT REVIEWS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Client Reviews</Text>
            
            {/* Rating summary & distribution */}
            {reviewsData.total > 0 && (
              <View style={s.reviewSummaryCard}>
                <View style={s.avgRatingContainer}>
                  <Text style={s.avgRatingText}>{trainer.rating || '0.0'}</Text>
                  <View style={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        color={star <= Math.round(trainer.rating || 0) ? '#F59E0B' : '#E2E8F0'}
                        fill={star <= Math.round(trainer.rating || 0) ? '#F59E0B' : 'transparent'}
                      />
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
                        <Text style={s.distPercentageLabel}>{Math.round(percentage)}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Completed Booking Review Button */}
            {completedBookings.length > 0 && (
              <TouchableOpacity
                style={s.writeReviewBtn}
                onPress={() => setWriteModalVisible(true)}
              >
                <Text style={s.writeReviewBtnText}>Write a Review</Text>
              </TouchableOpacity>
            )}

            {reviewsLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : reviewsData.reviews.length === 0 ? (
              <View style={s.reviewsEmpty}>
                <Star size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
                <Text style={s.reviewsEmptyTitle}>No reviews yet</Text>
                <Text style={s.reviewsEmptySub}>Be the first to review this trainer after completing a session.</Text>
              </View>
            ) : (
              <View style={s.reviewsList}>
                {reviewsData.reviews.map((item: any) => (
                  <View key={item._id} style={s.reviewCard}>
                    <View style={s.reviewHeader}>
                      <Image
                        source={{ uri: item.userId?.avatar || 'https://via.placeholder.com/150' }}
                        style={s.reviewerAvatar}
                      />
                      <View style={s.reviewerInfo}>
                        <Text style={s.reviewerName}>{item.userId?.name || 'User'}</Text>
                        <View style={s.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              color={star <= item.rating ? '#F59E0B' : '#E2E8F0'}
                              fill={star <= item.rating ? '#F59E0B' : 'transparent'}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={s.reviewDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={s.reviewText}>{item.review}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.bottomBarPrice}>
          <Text style={s.priceLabel}>Session Price</Text>
          <Text style={s.priceValue}>PKR {trainer.hourlyPrice || 3000}<Text style={s.priceUnit}>/hr</Text></Text>
        </View>
        <TouchableOpacity style={s.bookBtn} onPress={() => router.push(`/book-session?trainerId=${trainer._id}`)}>
          <Text style={s.bookBtnText}>Book Session</Text>
        </TouchableOpacity>
      </View>

      {/* Write Review Modal */}
      {completedBookings.length > 0 && (
        <WriteReviewModal
          visible={writeModalVisible}
          onClose={() => setWriteModalVisible(false)}
          trainerId={trainer._id}
          bookingId={completedBookings[0]._id} // Selects the completed booking that needs a review
          onReviewSubmitted={() => {
            fetchReviews();
            fetchTrainerDetails();
            fetchCompletedBookings();
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 24 },
  errorTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  errorSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  
  heroContainer: { width: '100%', height: 380, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: { position: 'absolute', width: '100%', height: '100%' },
  headerActions: { position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerActionsRight: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' },
  
  heroInfo: { position: 'absolute', bottom: 32, left: 24, right: 24 },
  featuredBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  featuredText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  trainerName: { color: '#FFF', fontSize: 32, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  trainerTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },

  contentContainer: { padding: 24, paddingTop: 16, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#F8FAFC', marginTop: -24 },
  
  summaryCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 16, justifyContent: 'space-evenly', alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 32 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 4 },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 16 },
  
  bioText: { fontSize: 15, lineHeight: 24, color: '#475569', fontWeight: '500' },
  readMoreBtn: { color: Colors.primary, fontWeight: '700', marginTop: 8, fontSize: 14 },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: Colors.primary + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  chipText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },

  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'flex-start' },
  statCardValue: { fontSize: 24, fontWeight: '900', color: Colors.text, marginTop: 12 },
  statCardLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },

  qualItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  qualText: { fontSize: 15, color: '#475569', fontWeight: '600', flex: 1 },

  scheduleCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  scheduleDay: { fontSize: 15, fontWeight: '600', color: Colors.text },
  scheduleTime: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  scheduleTimeOff: { color: Colors.textSecondary, fontWeight: '500' },

  reviewSummaryCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  avgRatingContainer: { justifyContent: 'center', alignItems: 'center', flex: 1.2 },
  avgRatingText: { fontSize: 36, fontWeight: '900', color: '#0F172A' },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 6 },
  totalReviewsSubText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  distributionContainer: { flex: 2, justifyContent: 'center', gap: 4 },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distStarLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', width: 24, textAlign: 'right' },
  distBarBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  distBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 },
  distPercentageLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', width: 30 },

  writeReviewBtn: { backgroundColor: '#FFF', borderVertical: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 16, height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  writeReviewBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 15 },

  reviewsEmpty: { backgroundColor: '#FFF', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  reviewsEmptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  reviewsEmptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  reviewsList: { gap: 16 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewerInfo: { flex: 1, marginLeft: 12 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  reviewDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  reviewText: { fontSize: 14, color: '#475569', lineHeight: 20 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', alignItems: 'center' },
  bottomBarPrice: { flex: 1 },
  priceLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  priceValue: { fontSize: 24, fontWeight: '900', color: Colors.text },
  priceUnit: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  skeletonContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  skeletonHero: { width: '100%', height: 380, backgroundColor: '#E2E8F0' },
  skeletonBody: { padding: 24, marginTop: -24, backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  skeletonTitleRow: { marginBottom: 32 },
  skeletonTitle: { width: '70%', height: 32, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 8 },
  skeletonTitleShort: { width: '40%', height: 20, backgroundColor: '#E2E8F0', borderRadius: 8 },
  skeletonChips: { width: '100%', height: 80, backgroundColor: '#E2E8F0', borderRadius: 20, marginBottom: 32 },
  skeletonTextBlock: { width: '100%', height: 100, backgroundColor: '#E2E8F0', borderRadius: 16, marginBottom: 24 },
});
