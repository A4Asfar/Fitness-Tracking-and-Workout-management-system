import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, MapPin, ShieldCheck, Video, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/Theme';

interface TrainerCardProps {
  trainer: any;
  onPress: () => void;
}

const TrainerCard = memo(({ trainer, onPress }: TrainerCardProps) => {
  return (
    <TouchableOpacity 
      style={s.card} 
      activeOpacity={0.9} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View profile of ${trainer.fullName || trainer.name}`}
    >
      <View style={s.topRow}>
        <Image 
          source={{ uri: trainer.profileImage || trainer.image }} 
          style={s.image}
          resizeMode="cover"
        />
        <View style={s.infoContainer}>
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={1}>{trainer.fullName || trainer.name}</Text>
            {trainer.verifiedTrainer && (
              <ShieldCheck size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          
          <View style={s.chipRow}>
            <View style={s.chip}>
              <Text style={s.chipText} numberOfLines={1}>
                {trainer.specializations ? trainer.specializations[0] : trainer.specialization}
              </Text>
            </View>
            {trainer.featuredTrainer && (
              <View style={[s.chip, s.featuredChip]}>
                <Text style={s.featuredChipText}>PRO</Text>
              </View>
            )}
          </View>

          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.statText}>
                {trainer.rating || 'New'} {trainer.totalReviews ? `(${trainer.totalReviews})` : ''}
              </Text>
            </View>
            <Text style={s.statDot}>•</Text>
            <View style={s.statItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={s.statText}>{trainer.experienceYears || trainer.experience || '1'} Yrs</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={s.bio} numberOfLines={2}>
        {trainer.biography || trainer.bio || 'Professional fitness coach ready to help you reach your goals.'}
      </Text>

      <View style={s.divider} />

      <View style={s.footerRow}>
        <View style={s.locationContainer}>
          {trainer.availabilityStatus === 'Online' ? (
            <Video size={16} color={Colors.primary} />
          ) : (
            <MapPin size={16} color={Colors.textSecondary} />
          )}
          <Text style={s.locationText}>
            {trainer.availabilityStatus === 'Online' ? 'Online Sessions' : trainer.city || 'Local'}
          </Text>
        </View>
        
        <View style={s.priceRow}>
          <Text style={s.priceText}>
            PKR {trainer.hourlyPrice || '3000'}<Text style={s.priceUnit}>/hr</Text>
          </Text>
          <View style={s.bookBtn}>
            <Text style={s.bookBtnText}>Book</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default TrainerCard;

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  image: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  infoContainer: { flex: 1, marginLeft: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { flexShrink: 1,  fontSize: 18, fontWeight: '800', color: '#FFFFFF', flexShrink: 1, letterSpacing: -0.5 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  featuredChip: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  featuredChipText: { color: '#FDE68A', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  statDot: { color: '#334155', marginHorizontal: 8, fontSize: 12 },
  bio: { fontSize: 13, color: '#CBD5E1', lineHeight: 18, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  priceUnit: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  bookBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
