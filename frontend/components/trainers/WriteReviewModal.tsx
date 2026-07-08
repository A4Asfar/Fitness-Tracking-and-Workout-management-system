import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Modal, ActivityIndicator, Dimensions 
} from 'react-native';
import { Colors } from '@/constants/Theme';
import { Star, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';

const { height } = Dimensions.get('window');

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  trainerId: string;
  bookingId: string;
  onReviewSubmitted: () => void;
}

export default function WriteReviewModal({
  visible,
  onClose,
  trainerId,
  bookingId,
  onReviewSubmitted
}: WriteReviewModalProps) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError('Please write some comments for your review.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/reviews/trainers/${trainerId}/reviews`, {
        bookingId,
        rating,
        review: reviewText.trim()
      });
      onReviewSubmitted();
      setReviewText('');
      setRating(5);
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
    >
      <View style={s.modalOverlay}>
        <View style={[s.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Write a Review</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Text style={s.label}>Tap to Rate</Text>
          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={s.starBtn}
              >
                <Star
                  size={36}
                  color={star <= rating ? '#F59E0B' : '#E2E8F0'}
                  fill={star <= rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Your Review Comments</Text>
          <TextInput
            style={s.textInput}
            placeholder="Share your experience working with this trainer..."
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={(text) => {
              setReviewText(text);
              setError(null);
            }}
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.submitBtnText}>Submit Review</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starBtn: {
    padding: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#0F172A',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
