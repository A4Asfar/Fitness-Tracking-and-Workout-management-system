import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput, ImageBackground, Dimensions, useWindowDimensions } from 'react-native';
import { 
  Dumbbell, Flame, Zap, Heart, Search, Plus, Play, Clock, TrendingUp, Activity, History as HistoryIcon, Bookmark, Target
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/services/api';
import SkeletonCard from '@/components/SkeletonCard';
import { LinearGradient } from 'expo-linear-gradient';

const PREMIUM_PROGRAMS = [
  { id: 'strength', title: 'Full Body Power', focus: 'Total Body Hypertrophy', type: 'Strength', difficulty: 'Intermediate', duration: '45 min', calories: '450 cal', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', accent: '#10B981' },
  { id: 'hiit', title: 'HIIT Burnout', focus: 'Maximum Fat Loss', type: 'HIIT', difficulty: 'Advanced', duration: '30 min', calories: '600 cal', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', accent: '#38BDF8' },
  { id: 'core', title: 'Core Crusher', focus: 'Abdominal Definition', type: 'Core', difficulty: 'Beginner', duration: '20 min', calories: '200 cal', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', accent: '#F59E0B' },
  { id: 'yoga', title: 'Morning Flow', focus: 'Flexibility & Mobility', type: 'Yoga', difficulty: 'Beginner', duration: '15 min', calories: '120 cal', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', accent: '#A855F7' },
  { id: 'cardio', title: 'Endurance Build', focus: 'Cardiovascular Health', type: 'Cardio', difficulty: 'Intermediate', duration: '60 min', calories: '700 cal', image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&q=80', accent: '#EF4444' },
];

export default function WorkoutsScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<'Library' | 'History'>('Library');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(['strength', 'core']);

  const fetchHistory = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (err: any) {
      if (__DEV__) console.error('Failed to fetch workouts', err);
      setError('Failed to fetch workouts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'History') fetchHistory();
      else setLoading(false);
    }, [activeTab, fetchHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'History') fetchHistory();
    else setTimeout(() => setRefreshing(false), 800);
  };

  const handleDeleteWorkout = async (id: string) => {
    Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/workouts/${id}`);
            fetchHistory();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete workout.');
          }
        }
      }
    ]);
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(f => f !== id));
    else setFavorites([...favorites, id]);
  };

  const filteredLibrary = PREMIUM_PROGRAMS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.focus.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || (selectedCategory === 'Favorites' ? favorites.includes(p.id) : p.type === selectedCategory);
    return matchesSearch && matchesCat;
  });

  const renderLibrary = () => (
    <View style={s.tabContent}>
      {/* Search & Filters */}
      <View style={s.searchBox}>
        <Search size={20} color="#64748B" />
        <TextInput 
          style={s.searchInput}
          placeholder="Find a workout program..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryScroll}>
        {['All', 'Favorites', 'Strength', 'HIIT', 'Yoga', 'Core', 'Cardio'].map(cat => {
          const isSel = selectedCategory === cat;
          return (
            <TouchableOpacity key={cat} style={[s.catChip, isSel && s.catChipActive]} onPress={() => setSelectedCategory(cat)}>
              {cat === 'Favorites' && <Bookmark size={14} color={isSel ? '#FFF' : '#94A3B8'} style={{ marginRight: 6 }} />}
              <Text style={[s.catChipText, isSel && s.catChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.libraryGrid}>
        {filteredLibrary.map(prog => (
          <TouchableOpacity 
            key={prog.id} 
            activeOpacity={0.9} 
            style={s.programCard}
            onPress={() => router.push(`/create-workout?type=${encodeURIComponent(prog.type === 'Core' ? 'Strength' : prog.type)}&exercise=${encodeURIComponent(prog.title)}`)}
          >
            <ImageBackground source={{ uri: prog.image }} style={s.progBg} imageStyle={{ borderRadius: 24 }}>
              <LinearGradient colors={['rgba(15,23,42,0.1)', 'rgba(15,23,42,0.95)']} style={s.progGradient}>
                
                <View style={s.progHeader}>
                  <View style={[s.typeBadge, { backgroundColor: prog.accent }]}>
                    <Text style={s.typeBadgeText}>{prog.type.toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity style={s.favBtn} onPress={() => toggleFavorite(prog.id)}>
                    <Bookmark size={20} color={favorites.includes(prog.id) ? '#38BDF8' : '#FFF'} fill={favorites.includes(prog.id) ? '#38BDF8' : 'transparent'} />
                  </TouchableOpacity>
                </View>

                <View style={s.progFooter}>
                  <Text style={s.progTitle}>{prog.title}</Text>
                  <Text style={s.progFocus}>{prog.focus}</Text>
                  
                  <View style={s.progStatsRow}>
                    <View style={s.progStat}>
                      <Clock size={14} color="#94A3B8" />
                      <Text style={s.progStatText}>{prog.duration}</Text>
                    </View>
                    <View style={s.progStat}>
                      <Flame size={14} color="#94A3B8" />
                      <Text style={s.progStatText}>{prog.calories}</Text>
                    </View>
                    <View style={s.progStat}>
                      <TrendingUp size={14} color="#94A3B8" />
                      <Text style={s.progStatText}>{prog.difficulty}</Text>
                    </View>
                  </View>
                </View>

              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
        {filteredLibrary.length === 0 && (
          <View style={s.emptyBox}>
            <Search size={32} color="#334155" style={{ marginBottom: 12 }} />
            <Text style={s.emptyTitle}>No Programs Found</Text>
            <Text style={s.emptySub}>Try adjusting your search or category filters.</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={s.tabContent}>
      {loading ? (
        <View style={{ gap: 16 }}><SkeletonCard /><SkeletonCard /></View>
      ) : workouts.length === 0 ? (
        <View style={s.emptyBox}>
          <HistoryIcon size={32} color="#334155" style={{ marginBottom: 12 }} />
          <Text style={s.emptyTitle}>No History</Text>
          <Text style={s.emptySub}>You haven't logged any workouts yet.</Text>
          <TouchableOpacity style={s.logBtnEmpty} onPress={() => router.push('/create-workout')}>
            <Text style={s.logBtnEmptyText}>Log a Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.historyList}>
          {workouts.map(w => (
            <View key={w._id} style={s.historyCard}>
              <View style={s.histIconBox}><Dumbbell size={20} color="#38BDF8" /></View>
              <View style={s.histInfo}>
                <Text style={s.histTitle}>{w.exercise}</Text>
                <Text style={s.histMeta}>{w.type} • {w.duration || 30} min</Text>
                <Text style={s.histDate}>{new Date(w.date).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity style={s.histDelBtn} onPress={() => handleDeleteWorkout(w._id)}>
                <Text style={s.histDelText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={s.headerSubtitle}>Training Center</Text>
          <Text style={s.headerTitle}>Workouts</Text>
        </View>
        <TouchableOpacity style={s.logBtn} onPress={() => router.push('/create-workout')}>
          <Plus size={20} color="#0F172A" />
          <Text style={s.logBtnText}>Log New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        <TouchableOpacity style={[s.tab, activeTab === 'Library' && s.tabActive]} onPress={() => setActiveTab('Library')}>
          <Text style={[s.tabText, activeTab === 'Library' && s.tabTextActive]}>Programs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'History' && s.tabActive]} onPress={() => setActiveTab('History')}>
          <Text style={[s.tabText, activeTab === 'History' && s.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 , maxWidth: 1000, width: '100%', alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {activeTab === 'Library' ? renderLibrary() : renderHistory()}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerSubtitle: { flexShrink: 1,  color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  logBtn: { flexDirection: 'row', backgroundColor: '#38BDF8', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, alignItems: 'center' },
  logBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '900', marginLeft: 6 },
  
  tabRow: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#38BDF8' },
  tabText: { color: '#64748B', fontSize: 15, fontWeight: '700' },
  tabTextActive: { color: '#38BDF8', fontWeight: '900' },

  tabContent: { padding: 24 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 12, color: '#F8FAFC', fontSize: 15, fontWeight: '500' },
  
  categoryScroll: { gap: 8, marginBottom: 24 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center' },
  catChipActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  catChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  catChipTextActive: { color: '#0F172A', fontWeight: '900' },

  libraryGrid: { gap: 20 },
  programCard: { height: 260, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  progBg: { width: '100%', height: '100%' },
  progGradient: { flex: 1, padding: 20, justifyContent: 'space-between' },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: '#0F172A', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  favBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center' },
  
  progFooter: {},
  progTitle: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  progFocus: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  progStatsRow: { flexDirection: 'row', gap: 16 },
  progStat: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  progStatText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  historyList: { gap: 12 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  histIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(56,189,248,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  histInfo: { flex: 1 },
  histTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  histMeta: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  histDate: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  histDelBtn: { padding: 8 },
  histDelText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },

  emptyBox: { backgroundColor: '#1E293B', padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', marginTop: 20 },
  emptyTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptySub: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  logBtnEmpty: { backgroundColor: '#38BDF8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, marginTop: 24 },
  logBtnEmptyText: { color: '#0F172A', fontSize: 14, fontWeight: '900' },
});
