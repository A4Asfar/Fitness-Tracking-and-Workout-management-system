import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  User, ArrowLeft, Target, Scale, Ruler, Camera, Check,
  Mail, Award
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '@/components/Toast';
import { hapticSuccess, hapticError, hapticWarning } from '@/utils/haptics';

const GOALS = ['Weight Loss', 'Muscle Gain', 'Maintain Fitness', 'Endurance', 'General Fitness'] as const;
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    weight: user?.weight?.toString() || '',
    height: user?.height?.toString() || '',
    fitnessGoal: user?.fitnessGoal || 'General Fitness',
    trainingLevel: user?.trainingLevel || 'Beginner',
    avatar: user?.avatar || ''
  });

  const [errors, setErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        fitnessGoal: user.fitnessGoal || 'General Fitness',
        trainingLevel: user.trainingLevel || 'Beginner',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Gallery access needed to update avatar.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFormData(prev => ({ ...prev, avatar: `data:image/jpeg;base64,${result.assets[0].base64}` }));
    }
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.weight.trim()) newErrors.weight = 'Weight is required';
    if (!formData.height.trim()) newErrors.height = 'Height is required';
    if (!formData.fitnessGoal) newErrors.fitnessGoal = 'Fitness goal is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      hapticWarning();
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
      };
      
      const response = await api.put('/profile', payload);
      updateUser(response.data);
      hapticSuccess();
      showToast('Profile updated successfully!', 'success');
      router.back();
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      hapticError();
      showToast(error.response?.data?.message || 'We couldn\'t complete your request right now. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* --- Header --- */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- Avatar Selection Section --- */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              <View style={styles.avatarWrap}>
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} style={styles.avatarImg} />
                ) : (
                  <User size={36} color="#64748B" />
                )}
                <View style={styles.cameraIcon}>
                  <Camera size={12} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Tap to change avatar</Text>
          </View>

          {/* --- Form Details --- */}
          <SectionTitle title="General Information" />
          
          <View style={styles.formGroup}>
            <InputLabel label="Full Name" icon={User} required />
            <TextInput 
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(t) => {
                setFormData(p => ({ ...p, name: t }));
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              placeholder="e.g. John Doe"
              placeholderTextColor="#94A3B8"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.formGroup}>
            <InputLabel label="Email Address (Read-Only)" icon={Mail} />
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputLabel label="Weight (KG)" icon={Scale} required />
              <TextInput 
                style={[styles.input, errors.weight && styles.inputError]}
                value={formData.weight}
                onChangeText={(t) => {
                  setFormData(p => ({ ...p, weight: t }));
                  if (errors.weight) setErrors({ ...errors, weight: null });
                }}
                keyboardType="numeric"
                placeholder="e.g. 72"
                placeholderTextColor="#94A3B8"
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              <InputLabel label="Height (CM)" icon={Ruler} required />
              <TextInput 
                style={[styles.input, errors.height && styles.inputError]}
                value={formData.height}
                onChangeText={(t) => {
                  setFormData(p => ({ ...p, height: t }));
                  if (errors.height) setErrors({ ...errors, height: null });
                }}
                keyboardType="numeric"
                placeholder="e.g. 175"
                placeholderTextColor="#94A3B8"
              />
              {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
            </View>
          </View>

          {/* --- Fitness Goals Section --- */}
          <SectionTitle title="Fitness Focus" />
          
          <InputLabel label="Primary Training Goal" icon={Target} required />
          <View style={styles.chipGrid}>
            {GOALS.map(g => {
              const isSelected = formData.fitnessGoal === g;
              return (
                <TouchableOpacity 
                  key={g}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => {
                    setFormData(p => ({ ...p, fitnessGoal: g }));
                    if (errors.fitnessGoal) setErrors({ ...errors, fitnessGoal: null });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.fitnessGoal && <Text style={[styles.errorText, { marginTop: -14, marginBottom: 20 }]}>{errors.fitnessGoal}</Text>}

          <InputLabel label="Current Experience Level" icon={Award} />
          <View style={styles.chipGrid}>
            {LEVELS.map(l => {
              const isSelected = formData.trainingLevel === l;
              return (
                <TouchableOpacity 
                  key={l}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setFormData(p => ({ ...p, trainingLevel: l }))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* --- Action Buttons --- */}
          <TouchableOpacity 
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGrad}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" strokeWidth={3} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function InputLabel({ label, icon: Icon, required }: any) {
  return (
    <View style={styles.labelRow}>
      <Icon size={12} color="#10B981" />
      <Text style={styles.labelText}>{label}</Text>
      {required && <Text style={styles.asterisk}>*</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginLeft: 4,
  },
  labelText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 8,
  },
  asterisk: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  disabledInput: {
    opacity: 0.6,
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  disabledText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#10B981',
  },
  saveBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  saveGrad: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
