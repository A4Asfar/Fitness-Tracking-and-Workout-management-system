import React from 'react';
import { View, StyleSheet, ScrollView, Text, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedStyles } from '@/constants/Theme';
import { Users, TrendingUp, TrendingDown, Flame, AlertCircle, ShieldAlert, Award, Coffee, Activity } from 'lucide-react-native';

const MOCK_USERS = [
  { id: 1, name: 'Alex Johnson', hbi: 94, trend: '+4', status: 'Highest Performing', risk: 'None', avatar: 'AJ', missing: null },
  { id: 2, name: 'Sarah Williams', hbi: 88, trend: '+2', status: 'High Performing', risk: 'None', avatar: 'SW', missing: null },
  { id: 3, name: 'Mike Chen', hbi: 42, trend: '-12', status: 'Lowest Performing', risk: 'Burnout Risk', avatar: 'MC', missing: 'Skipping Workouts' },
  { id: 4, name: 'Emma Davis', hbi: 71, trend: '0', status: 'Plateauing', risk: 'Metabolic Stall', avatar: 'ED', missing: 'Missing Breakfast' },
  { id: 5, name: 'James Wilson', hbi: 55, trend: '-8', status: 'Declining', risk: 'Undereating', avatar: 'JW', missing: 'Missing Protein Goals' },
  { id: 6, name: 'Lisa Taylor', hbi: 82, trend: '+5', status: 'Improving', risk: 'Rapid Weight Loss', avatar: 'LT', missing: null },
];

export default function TrainerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const getRiskColor = (risk: string) => {
    if (risk.includes('Burnout')) return '#EF4444';
    if (risk.includes('Stall') || risk.includes('Undereating')) return '#F59E0B';
    if (risk.includes('Rapid')) return '#38BDF8';
    return '#10B981';
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top + 20, maxWidth: 1200, width: '100%', alignSelf: 'center', paddingHorizontal: 24 }}>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
           <View>
              <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Global Intelligence</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>Trainer Dashboard</Text>
           </View>
           <View style={{ backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' }}>
              <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '800' }}>Platform Health: 84%</Text>
           </View>
        </View>

        {/* TOP LEVEL METRICS */}
        <View style={[isWide ? { flexDirection: 'row', gap: 16 } : { gap: 16 }, { marginBottom: 32 }]}>
           <View style={[SharedStyles.card, { padding: 20, flex: 1 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Users size={24} color="#38BDF8" />
                 <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>+12 This Week</Text>
              </View>
              <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '900', marginTop: 12 }}>1,402</Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }}>Active Users</Text>
           </View>
           
           <View style={[SharedStyles.card, { padding: 20, flex: 1 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Flame size={24} color="#EF4444" />
                 <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800' }}>3.2% of Users</Text>
              </View>
              <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '900', marginTop: 12 }}>45</Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }}>Critical Burnout Risk</Text>
           </View>

           <View style={[SharedStyles.card, { padding: 20, flex: 1 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Activity size={24} color="#F59E0B" />
                 <Text style={{ color: '#F59E0B', fontSize: 14, fontWeight: '800' }}>14% of Users</Text>
              </View>
              <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: '900', marginTop: 12 }}>196</Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }}>Currently Plateauing</Text>
           </View>
        </View>

        {/* AI CLIENT TRIAGE LIST */}
        <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 }}>AI Client Triage List</Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 16 }}>Automatically identifying critical clients requiring intervention based on their V5 Intelligence Engines.</Text>

        <View style={SharedStyles.card}>
           {MOCK_USERS.map((u, i) => (
              <TouchableOpacity activeOpacity={0.8} key={u.id} style={{ padding: 20, borderBottomWidth: i === MOCK_USERS.length - 1 ? 0 : 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: isWide ? 'row' : 'column', alignItems: isWide ? 'center' : 'flex-start', gap: 16 }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 2 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }}>
                       <Text style={{ color: '#38BDF8', fontSize: 16, fontWeight: '900' }}>{u.avatar}</Text>
                    </View>
                    <View>
                       <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '900' }}>{u.name}</Text>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <Text style={{ color: u.trend.includes('+') ? '#10B981' : (u.trend === '0' ? '#94A3B8' : '#EF4444'), fontSize: 13, fontWeight: '800' }}>{u.trend}</Text>
                          <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>HBI Trend</Text>
                       </View>
                    </View>
                 </View>

                 <View style={{ flex: 1 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Health Balance Index</Text>
                    <Text style={{ color: u.hbi >= 80 ? '#10B981' : (u.hbi >= 60 ? '#F59E0B' : '#EF4444'), fontSize: 24, fontWeight: '900' }}>{u.hbi}</Text>
                 </View>

                 <View style={{ flex: 2, gap: 4 }}>
                    {u.risk !== 'None' ? (
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <ShieldAlert size={14} color={getRiskColor(u.risk)} />
                          <Text style={{ color: getRiskColor(u.risk), fontSize: 13, fontWeight: '800' }}>{u.risk}</Text>
                       </View>
                    ) : (
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Award size={14} color="#10B981" />
                          <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '800' }}>Optimized</Text>
                       </View>
                    )}
                    {u.missing && (
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <AlertCircle size={14} color="#94A3B8" />
                          <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>{u.missing}</Text>
                       </View>
                    )}
                 </View>

                 <TouchableOpacity style={{ backgroundColor: '#38BDF8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                    <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '800' }}>View Report</Text>
                 </TouchableOpacity>
              </TouchableOpacity>
           ))}
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
});
