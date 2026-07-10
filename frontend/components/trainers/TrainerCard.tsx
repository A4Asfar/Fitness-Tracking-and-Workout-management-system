import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, MapPin, ShieldCheck, Video, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/Theme';

interface TrainerCardProps {
  trainer: any;
  onPress: () => void;
}

export default function TrainerCard({ trainer, onPress }: TrainerCardProps) {
  return (
    <TouchableOpacity 
      style={s.card} 
      activeOpacity={0.8} 
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
          
          <Text style={s.specialization} numberOfLines={1}>
            {trainer.specializations ? trainer.specializations.join(' • ') : trainer.specialization}
          </Text>

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
        <Text style={s.priceText}>
          PKR {trainer.hourlyPrice || '3000'}<Text style={s.priceUnit}>/hr</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  specialization: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  statDot: {
    marginHorizontal: 8,
    color: '#CBD5E1',
    fontSize: 14,
  },
  bio: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
