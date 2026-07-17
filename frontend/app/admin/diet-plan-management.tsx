import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DietPlanService, DietPlan } from '@/services/dietPlanService';
import { SharedStyles } from '@/constants/Theme';
import { ArrowLeft, Plus, Edit, Trash2, Copy, Users } from 'lucide-react-native';

export default function AdminDietPlanManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchPlans = async () => {
    try {
      const data = await DietPlanService.getAllDietPlans();
      setPlans(data);
    } catch (e) {
      console.log('Error fetching plans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Plan", "Are you sure you want to delete this Diet Plan?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await DietPlanService.deleteDietPlan(id);
          fetchPlans();
      }}
    ]);
  };

  const handleDuplicate = async (plan: DietPlan) => {
    try {
      const { _id, ...rest } = plan;
      await DietPlanService.createDietPlan({
        ...rest,
        title: `${plan.title} (Copy)`,
        assignedUserId: undefined
      } as unknown as DietPlan);
      fetchPlans();
    } catch (e) {
      Alert.alert("Error", "Could not duplicate plan");
    }
  };

  const assignToUser = async (userId: string) => {
    if (!selectedPlan) return;
    try {
      // Create a copy of the template exclusively for this user
      const { _id, createdAt, updatedAt, ...rest } = selectedPlan as any;
      await DietPlanService.createDietPlan({
        ...rest,
        title: `${selectedPlan.title} (Assigned)`,
        assignedUserId: userId
      } as unknown as DietPlan);
      
      Alert.alert("Success", "Template duplicated and assigned to user");
      setShowAssignModal(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (e) {
      Alert.alert("Error", "Could not assign plan");
    }
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}><ArrowLeft size={20} color="#F8FAFC" /></TouchableOpacity>
        <Text style={s.headerTitle}>Diet Plan Management</Text>
        <TouchableOpacity style={s.addButton} onPress={() => Alert.alert('New Plan', 'Create form would open here (UI omitted for brevity)')}>
           <Plus size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {plans.length === 0 ? (
          <Text style={s.emptyText}>No Diet Plans created yet.</Text>
        ) : (
          plans.map(plan => (
            <View key={plan._id} style={[SharedStyles.card, s.planCard]}>
               <View style={s.pcHeader}>
                 <Text style={s.planName}>{plan.title}</Text>
                 <View style={[s.statusBadge, plan.status === 'Active' ? s.activeBadge : s.draftBadge]}>
                    <Text style={s.statusText}>{plan.status}</Text>
                 </View>
               </View>
               
               <Text style={s.goalText}>Goal: {plan.goal} • {plan.durationWeeks} Weeks</Text>
               <View style={s.statsRow}>
                  <Text style={s.statText}>Cal: {plan.dailyCalories}</Text>
                  <Text style={s.statText}>P: {plan.protein}g</Text>
                  <Text style={s.statText}>C: {plan.carbs}g</Text>
                  <Text style={s.statText}>F: {plan.fat}g</Text>
               </View>
               
               <View style={s.actionsRow}>
                  <TouchableOpacity style={s.actionBtn}>
                     <Edit size={16} color="#38BDF8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionBtn} onPress={() => plan._id && handleDuplicate(plan)}>
                     <Copy size={16} color="#A855F7" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionBtn}>
                     <Users size={16} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionBtn} onPress={() => plan._id && handleDelete(plan._id)}>
                     <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
               </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#1E293B' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#38BDF8', justifyContent: 'center', alignItems: 'center' },
  
  content: { padding: 24, gap: 16 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40 },
  
  planCard: { padding: 20 },
  pcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planName: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadge: { backgroundColor: 'rgba(16,185,129,0.15)' },
  draftBadge: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statusText: { color: '#10B981', fontSize: 12, fontWeight: '800' },
  
  goalText: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(15,23,42,0.5)', padding: 12, borderRadius: 12, marginBottom: 16 },
  statText: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }
});
