import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Modal, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
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
              <X size={20} color="#94A3B8" />
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
                  color={star <= rating ? '#F59E0B' : '#334155'}
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: height * 0.85, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  starBtn: { padding: 4 },
  textInput: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, fontSize: 15, color: '#FFFFFF', height: 120, textAlignVertical: 'top', marginBottom: 24 },
  submitBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  errorText: { color: '#EF4444', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
