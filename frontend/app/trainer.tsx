import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  RefreshControl, TextInput, Modal, ScrollView, Animated, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, UserX, AlertCircle, X, ChevronDown, Check } from 'lucide-react-native';
import api from '@/services/api';

import TrainerCard from '@/components/trainers/TrainerCard';
import FeaturedTrainerCard from '@/components/trainers/FeaturedTrainerCard';
import SkeletonCard from '@/components/SkeletonCard';

export default function TrainersListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    featuredOnly: false,
    availability: 'All', // All, Online, Offline
    sortBy: 'Highest Rated', // Highest Rated, Most Experienced, Lowest Price
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchTrainers = useCallback(async () => {
    try {
      const res = await api.get('/content/trainers');
      // Simulated delay to show beautiful skeletons
      setTimeout(() => {
        setTrainers(res.data);
        setError(null);
        setLoading(false);
        setRefreshing(false);
      }, 800);
    } catch (e: any) {
      setError(e.message || 'Failed to connect to servers.');
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchTrainers();
  }, [fetchTrainers]);

  // Derived Data
  const filteredAndSortedTrainers = useMemo(() => {
    let result = [...trainers];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.fullName || t.name || '').toLowerCase().includes(q) ||
        (t.city || '').toLowerCase().includes(q) ||
        (t.specializations || []).some((s: string) => s.toLowerCase().includes(q)) ||
        (t.specialization || '').toLowerCase().includes(q)
      );
    }

    // Filters
    if (filters.verifiedOnly) {
      result = result.filter(t => t.verifiedTrainer);
    }
    if (filters.featuredOnly) {
      result = result.filter(t => t.featuredTrainer);
    }
    if (filters.availability !== 'All') {
      result = result.filter(t => t.availabilityStatus === filters.availability);
    }

    // Sort
    if (filters.sortBy === 'Highest Rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'Most Experienced') {
      result.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else if (filters.sortBy === 'Lowest Price') {
      result.sort((a, b) => (a.hourlyPrice || 0) - (b.hourlyPrice || 0));
    }

    return result;
  }, [trainers, searchQuery, filters]);

  const featuredTrainers = useMemo(() => {
    return filteredAndSortedTrainers.filter(t => t.featuredTrainer).slice(0, 5);
  }, [filteredAndSortedTrainers]);

  // Pagination Slice
  const paginatedTrainers = useMemo(() => {
    return filteredAndSortedTrainers.slice(0, page * PAGE_SIZE);
  }, [filteredAndSortedTrainers, page]);

  const handleLoadMore = () => {
    if (paginatedTrainers.length < filteredAndSortedTrainers.length) {
      setPage(prev => prev + 1);
    }
  };

  const handleTrainerPress = (trainerId: string) => {
    // router.push(`/trainer/${trainerId}`);
    // DO NOT IMPLEMENT DETAILS YET per instructions
  };

  // --- RENDERS ---

  const renderHeader = () => (
    <View style={s.headerContainer}>
      <Text style={s.mainTitle}>Find Your Trainer</Text>
      <Text style={s.subtitle}>Elite coaching tailored to your goals</Text>

      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput 
            style={s.searchInput}
            placeholder="Search name, city, or specialty..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[s.filterBtn, (filters.verifiedOnly || filters.featuredOnly || filters.availability !== 'All') && s.filterBtnActive]} 
          onPress={() => setShowFilterModal(true)}
        >
          <SlidersHorizontal size={20} color={(filters.verifiedOnly || filters.featuredOnly || filters.availability !== 'All') ? '#FFFFFF' : Colors.text} />
        </TouchableOpacity>
      </View>

      {featuredTrainers.length > 0 && !searchQuery && (
        <View style={s.featuredSection}>
          <Text style={s.sectionTitle}>Featured Coaches</Text>
          <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredTrainers}
            keyExtractor={item => 'feat-' + (item.id || item._id)}
            renderItem={({ item }) => (
              <FeaturedTrainerCard 
                trainer={item} 
                onPress={() => handleTrainerPress(item.id || item._id)} 
              />
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
            snapToInterval={280 + 16} // CARD_WIDTH + marginRight
            decelerationRate="fast"
          />
        </View>
      )}

      <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>All Trainers</Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={s.emptyContainer}>
        <UserX size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
        <Text style={s.emptyTitle}>No Coaches Found</Text>
        <Text style={s.emptySub}>We couldn't find any trainers matching your current filters or search.</Text>
        <TouchableOpacity style={s.clearBtn} onPress={() => {
          setSearchQuery('');
          setFilters({ verifiedOnly: false, featuredOnly: false, availability: 'All', sortBy: 'Highest Rated' });
        }}>
          <Text style={s.clearBtnText}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal visible={showFilterModal} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={[s.bottomSheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)} style={s.closeIcon}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.sheetBody} showsVerticalScrollIndicator={false}>
            {/* Sort Section */}
            <Text style={s.filterSectionTitle}>SORT BY</Text>
            <View style={s.chipRow}>
              {['Highest Rated', 'Most Experienced', 'Lowest Price'].map(opt => (
                <TouchableOpacity 
                  key={opt}
                  style={[s.chip, filters.sortBy === opt && s.chipActive]}
                  onPress={() => setFilters(p => ({ ...p, sortBy: opt }))}
                >
                  <Text style={[s.chipText, filters.sortBy === opt && s.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Availability Section */}
            <Text style={s.filterSectionTitle}>AVAILABILITY</Text>
            <View style={s.chipRow}>
              {['All', 'Online', 'Offline'].map(opt => (
                <TouchableOpacity 
                  key={opt}
                  style={[s.chip, filters.availability === opt && s.chipActive]}
                  onPress={() => setFilters(p => ({ ...p, availability: opt }))}
                >
                  <Text style={[s.chipText, filters.availability === opt && s.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Toggles */}
            <Text style={s.filterSectionTitle}>PREFERENCES</Text>
            <TouchableOpacity 
              style={s.toggleRow} 
              activeOpacity={0.7}
              onPress={() => setFilters(p => ({ ...p, verifiedOnly: !p.verifiedOnly }))}
            >
              <Text style={s.toggleLabel}>Verified Trainers Only</Text>
              <View style={[s.checkbox, filters.verifiedOnly && s.checkboxActive]}>
                {filters.verifiedOnly && <Check size={14} color="#FFF" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.toggleRow} 
              activeOpacity={0.7}
              onPress={() => setFilters(p => ({ ...p, featuredOnly: !p.featuredOnly }))}
            >
              <Text style={s.toggleLabel}>Featured Trainers Only</Text>
              <View style={[s.checkbox, filters.featuredOnly && s.checkboxActive]}>
                {filters.featuredOnly && <Check size={14} color="#FFF" />}
              </View>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={s.applyBtn} onPress={() => setShowFilterModal(false)}>
            <Text style={s.applyBtnText}>Show Results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Main Render
  if (error) {
    return (
      <View style={s.errorContainer}>
        <AlertCircle size={48} color={Colors.error} style={{ marginBottom: 16 }} />
        <Text style={s.errorTitle}>Connection Failed</Text>
        <Text style={s.errorSub}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={handleRefresh}>
          <Text style={s.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top }} />

      {loading ? (
        <ScrollView style={{ padding: SPACING.lg }} showsVerticalScrollIndicator={false}>
          <Text style={s.mainTitle}>Find Your Trainer</Text>
          <View style={{ height: 60 }} />
          {[1, 2, 3, 4].map(k => <SkeletonCard key={k} style={{ marginBottom: 16 }} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={paginatedTrainers}
          keyExtractor={(item) => (item.id || item._id).toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 100 }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => (
            <TrainerCard 
              trainer={item} 
              onPress={() => handleTrainerPress(item.id || item._id)} 
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              tintColor={Colors.primary} 
              colors={[Colors.primary]} 
            />
          }
        />
      )}

      {renderFilterModal()}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  featuredSection: {
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  clearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
  },
  clearBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeIcon: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  sheetBody: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

