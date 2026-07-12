import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Star, ShieldCheck } from 'lucide-react-native';
import { Colors } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

interface FeaturedTrainerCardProps {
  trainer: any;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const FeaturedTrainerCard = memo(({ trainer, onPress }: FeaturedTrainerCardProps) => {
  return (
    <TouchableOpacity 
      style={s.card} 
      activeOpacity={0.9} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View featured trainer ${trainer.fullName || trainer.name}`}
    >
      <Image 
        source={{ uri: trainer.profileImage || trainer.image }}
        style={s.imageBackground}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(15,23,42,0.6)', 'rgba(15,23,42,0.95)']}
        style={s.gradientOverlay}
      >
        <View style={s.content}>
          <View style={s.topRow}>
            <View style={s.featuredBadge}>
              <Text style={s.featuredText}>PRO</Text>
            </View>
            <View style={s.ratingBadge}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={s.ratingText}>{trainer.rating || 'New'}</Text>
            </View>
          </View>

          <View style={s.bottomInfo}>
            <View style={s.nameRow}>
              <Text style={s.name} numberOfLines={1}>{trainer.fullName || trainer.name}</Text>
              {trainer.verifiedTrainer && (
                <ShieldCheck size={18} color="#38BDF8" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={s.specialization} numberOfLines={1}>
              {trainer.specializations ? trainer.specializations.join(' • ') : trainer.specialization}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

export default FeaturedTrainerCard;

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 260, // taller for more dramatic hero effect
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#1E293B',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  featuredText: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomInfo: {
    marginTop: 'auto',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { flexShrink: 1, 
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  specialization: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
