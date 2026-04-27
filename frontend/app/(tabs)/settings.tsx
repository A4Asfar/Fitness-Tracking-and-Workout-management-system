import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable, Animated } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Stack } from 'expo-router';
import api from '@/services/api';
import { Colors, SharedStyles } from '@/constants/Theme';
import { User, Mail, LogOut, Save, ChevronRight, Weight, Ruler, Target, Check, ChevronDown, Bell, Shield, CircleHelp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import SuccessModal from '@/components/SuccessModal';

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Maintain Fitness'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Maintain Fitness');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { logout, user } = useAuth();
  const router = useRouter();

  const scale = new Animated.Value(1);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setWeight(user.weight?.toString() || '');
      setHeight(user.height?.toString() || '');
      setFitnessGoal(user.fitnessGoal || 'Maintain Fitness');
    }
    setLoading(false);
  }, [user]);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile', { 
        name, 
        weight: parseFloat(weight) || 0, 
        height: parseFloat(height) || 0, 
        fitnessGoal 
      });
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />

        {/* Premium Animated Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.primary + '20', 'transparent']}
            style={styles.headerBackground}
          />
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.avatarGlow}
            />
            <View style={styles.avatarInner}>
              <User size={48} color={Colors.primary} strokeWidth={1.5} />
            </View>
          </View>
          <Text style={styles.userName}>{name || 'Fitness Warrior'}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ELITE MEMBER</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Section: Personal Info */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fitness Profile</Text>
            <Text style={styles.sectionSubtitle}>Complete your stats for better tracking</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <View style={styles.iconCircle}>
                <User size={20} color={Colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  editable={!saving}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textSecondary + '80'}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldRow}>
              <View style={styles.iconCircle}>
                <Mail size={20} color={Colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <Text style={styles.readOnlyText}>{email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.card, styles.statCard]}>
              <View style={styles.statHeader}>
                <Weight size={18} color={Colors.primary} />
                <Text style={styles.statLabel}>Weight</Text>
              </View>
              <View style={styles.statInputWrapper}>
                <TextInput
                  style={styles.statInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.statUnit}>KG</Text>
              </View>
            </View>

            <View style={[styles.card, styles.statCard]}>
              <View style={styles.statHeader}>
                <Ruler size={18} color={Colors.primary} />
                <Text style={styles.statLabel}>Height</Text>
              </View>
              <View style={styles.statInputWrapper}>
                <TextInput
                  style={styles.statInput}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.statUnit}>CM</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.card, styles.goalButton]} 
            onPress={() => setShowGoalModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.goalIconCircle}>
              <Target size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.fieldLabel}>Current Fitness Goal</Text>
              <Text style={styles.goalValueText}>{fitnessGoal}</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Section: App Settings */}
          <View style={[styles.sectionHeader, { marginTop: 35 }]}>
            <Text style={styles.sectionTitle}>Account & Privacy</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#2A2A2A' }]}>
                <Bell size={20} color={Colors.text} />
              </View>
              <Text style={styles.menuItemText}>Notifications</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#2A2A2A' }]}>
                <Shield size={20} color={Colors.text} />
              </View>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#2A2A2A' }]}>
                <CircleHelp size={20} color={Colors.text} />
              </View>
              <Text style={styles.menuItemText}>Help Center</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <AnimatedPressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={saveProfile}
              disabled={saving}
              style={{ transform: [{ scale }] }}
            >
              <LinearGradient
                colors={[Colors.primary, '#9FE800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Save size={20} color="#000" strokeWidth={2.5} />
                    <Text style={styles.primaryButtonText}>SAVE CHANGES</Text>
                  </>
                )}
              </LinearGradient>
            </AnimatedPressable>

            <TouchableOpacity 
              style={styles.logoutBtn} 
              onPress={handleLogout}
              activeOpacity={0.6}
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={styles.logoutBtnText}>SIGN OUT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Improved Goal Picker Modal */}
        <Modal
          visible={showGoalModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
            <Pressable style={styles.modalCloser} onPress={() => setShowGoalModal(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalDragHandle} />
              <Text style={styles.modalTitle}>Set Your Fitness Goal</Text>
              <Text style={styles.modalSubtitle}>We'll personalize your workouts based on this</Text>
              
              {FITNESS_GOALS.map((goal) => {
                const isSelected = fitnessGoal === goal;
                return (
                  <TouchableOpacity
                    key={goal}
                    style={[styles.goalItem, isSelected && styles.goalItemActive]}
                    onPress={() => {
                      setFitnessGoal(goal);
                      setShowGoalModal(false);
                    }}
                  >
                    <View style={styles.goalItemLeft}>
                      <View style={[styles.goalRadio, isSelected && styles.goalRadioActive]}>
                        {isSelected && <View style={styles.goalRadioInner} />}
                      </View>
                      <Text style={[styles.goalItemText, isSelected && styles.goalItemTextActive]}>
                        {goal}
                      </Text>
                    </View>
                    {isSelected && <Check size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Modal>

        <SuccessModal 
          visible={showSuccess} 
          message="Profile Updated Successfully" 
          onComplete={() => setShowSuccess(false)} 
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    position: 'relative',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    opacity: 0.15,
  },
  avatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
    marginLeft: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    padding: 0,
  },
  readOnlyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
    marginLeft: 60,
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  statInputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statInput: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    padding: 0,
    minWidth: 40,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 16,
  },
  goalIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalValueText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 16,
  },
  footer: {
    marginTop: 40,
    gap: 16,
  },
  primaryButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
  },
  logoutBtn: {
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.error + '40',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.error + '08',
  },
  logoutBtnText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCloser: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#262626',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  goalItemActive: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '08',
  },
  goalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalRadioActive: {
    borderColor: Colors.primary,
  },
  goalRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  goalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  goalItemTextActive: {
    color: Colors.text,
  }
});
