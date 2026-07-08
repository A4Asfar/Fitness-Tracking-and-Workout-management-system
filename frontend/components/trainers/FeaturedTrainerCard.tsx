import React from 'react';
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

export default function FeaturedTrainerCard({ trainer, onPress }: FeaturedTrainerCardProps) {
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
        style={s.image}
        resizeMode="cover"
      /> 
        style={s.imageBackground} 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={s.gradientOverlay}
      >
        <View style={s.content}>
          <View style={s.topRow}>
            <View style={s.featuredBadge}>
              <Text style={s.featuredText}>FEATURED</Text>
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
                <ShieldCheck size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
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
}

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
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
    padding: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomInfo: {
    marginTop: 'auto',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  specialization: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});
