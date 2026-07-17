import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  RefreshControl, TextInput, Modal, ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, AlertCircle, X, Check } from 'lucide-react-native';
import api from '@/services/api';

import TrainerCard from '@/components/trainers/TrainerCard';
import FeaturedTrainerCard from '@/components/trainers/FeaturedTrainerCard';
import SkeletonCard from '@/components/SkeletonCard';
import { MOCK_TRAINERS } from '@/constants/MockTrainers';

export default function TrainersListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
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
        const backendTrainers = Array.isArray(res.data) ? res.data : [];
        const combinedTrainers = [...MOCK_TRAINERS, ...backendTrainers];
        
        setTrainers(combinedTrainers);
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

    // Specialty Filter
    if (selectedSpecialty !== 'All') {
      result = result.filter(t => 
        (t.specializations || []).some((s: string) => s.toLowerCase().includes(selectedSpecialty.toLowerCase())) || 
        (t.specialization || '').toLowerCase().includes(selectedSpecialty.toLowerCase())
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
  }, [trainers, searchQuery, filters, selectedSpecialty]);

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
    router.push({ pathname: '/trainer-details', params: { id: trainerId } });
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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24, paddingHorizontal: 4 }}>
        {['All', 'Strength', 'Yoga', 'HIIT', 'Cardio', 'CrossFit', 'Pilates', 'Functional'].map(spec => (
          <TouchableOpacity 
            key={spec}
            style={[s.specialtyChip, selectedSpecialty === spec && s.specialtyChipActive]}
            onPress={() => {
              setSelectedSpecialty(spec);
              setPage(1);
            }}
          >
            <Text style={[s.specialtyChipText, selectedSpecialty === spec && s.specialtyChipTextActive]}>{spec}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {featuredTrainers.length > 0 && !searchQuery && (
        <View style={s.featuredSection}>
          <Text style={s.sectionTitle}>Featured Coaches</Text>
          <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredTrainers}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            keyExtractor={item => 'feat-' + (item.id || item._id)}
            renderItem={({ item }) => (
              <FeaturedTrainerCard 
                trainer={item} 
                onPress={() => handleTrainerPress(item.id || item._id)} 
              />
            )}
            contentContainerStyle={{ maxWidth: 800, width: '100%', alignSelf: 'center',  paddingVertical: 8 }}
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
        <View style={s.emptyIconBox}>
          <Search size={32} color="#94A3B8" />
        </View>
        <Text style={s.emptyTitle}>No Coaches Found</Text>
        <Text style={s.emptySub}>We couldn't find any elite trainers matching your specific filters or search query.</Text>
        <TouchableOpacity style={s.clearBtn} onPress={() => {
          setSearchQuery('');
          setSelectedSpecialty('All');
          setFilters({ verifiedOnly: false, featuredOnly: false, availability: 'All', sortBy: 'Highest Rated' });
        }}>
          <Text style={s.clearBtnText}>Reset All Filters</Text>
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
          extraData={{ selectedSpecialty, searchQuery, filters, page }}
          keyExtractor={(item) => (item.id || item._id).toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 100 , maxWidth: 1000, width: '100%', alignSelf: 'center' }}
          ListHeaderComponent={renderHeader()}
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerContainer: { marginBottom: 8 },
  mainTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  subtitle: { flexShrink: 1,  fontSize: 15, color: '#94A3B8', fontWeight: '500', marginTop: 4, marginBottom: 24 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  filterBtn: { width: 56, height: 56, backgroundColor: '#1E293B', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  featuredSection: { marginBottom: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 24 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 12 },
  emptySub: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  clearBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  clearBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  specialtyChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  specialtyChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  specialtyChipText: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  specialtyChipTextActive: { color: '#FFFFFF' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#0F172A' },
  errorTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  errorSub: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20 },
  retryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#1E293B', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24, paddingHorizontal: 24, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  closeIcon: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  sheetBody: { marginBottom: 24 },
  filterSectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  toggleLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  applyBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

