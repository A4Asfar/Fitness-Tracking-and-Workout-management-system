import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
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
      showToast('Profile updated successfully!', 'success');
      router.back();
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      showToast(error.response?.data?.message || 'Update failed. Check connection.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={SharedStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              <View style={styles.avatarWrap}>
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} style={styles.avatarImg} />
                ) : (
                  <User size={48} color={Colors.textSecondary} />
                )}
                <View style={styles.cameraIcon}>
                  <Camera size={14} color="#000" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Tap to change avatar</Text>
          </View>

          <SectionTitle title="GENERAL INFORMATION" />
          <View style={styles.formGroup}>
            <InputLabel label="FULL NAME" icon={User} required />
            <TextInput 
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(t) => { setFormData(p => ({ ...p, name: t })); if (errors.name) setErrors({...errors, name: null}); }}
              placeholder="Your Name"
              placeholderTextColor="#555"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.formGroup}>
            <InputLabel label="EMAIL ADDRESS (READ-ONLY)" icon={Mail} />
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputLabel label="WEIGHT (KG)" icon={Scale} required />
              <TextInput 
                style={[styles.input, errors.weight && styles.inputError]}
                value={formData.weight}
                onChangeText={(t) => { setFormData(p => ({ ...p, weight: t })); if (errors.weight) setErrors({...errors, weight: null}); }}
                keyboardType="numeric"
                placeholder="00.0"
                placeholderTextColor="#555"
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              <InputLabel label="HEIGHT (CM)" icon={Ruler} required />
              <TextInput 
                style={[styles.input, errors.height && styles.inputError]}
                value={formData.height}
                onChangeText={(t) => { setFormData(p => ({ ...p, height: t })); if (errors.height) setErrors({...errors, height: null}); }}
                keyboardType="numeric"
                placeholder="000"
                placeholderTextColor="#555"
              />
              {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
            </View>
          </View>

          <SectionTitle title="FITNESS FOCUS" />
          <InputLabel label="PRIMARY TRAINING GOAL" icon={Target} required />
          <View style={styles.chipGrid}>
            {GOALS.map(g => (
              <TouchableOpacity 
                key={g}
                style={[styles.chip, formData.fitnessGoal === g && styles.chipActive]}
                onPress={() => { setFormData(p => ({ ...p, fitnessGoal: g })); if (errors.fitnessGoal) setErrors({...errors, fitnessGoal: null}); }}
              >
                <Text style={[styles.chipText, formData.fitnessGoal === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.fitnessGoal && <Text style={[styles.errorText, { marginTop: -14, marginBottom: 20 }]}>{errors.fitnessGoal}</Text>}

          <InputLabel label="CURRENT EXPERIENCE LEVEL" icon={Award} />
          <View style={styles.chipGrid}>
            {LEVELS.map(l => (
              <TouchableOpacity 
                key={l}
                style={[styles.chip, formData.trainingLevel === l && styles.chipActive]}
                onPress={() => setFormData(p => ({ ...p, trainingLevel: l }))}
              >
                <Text style={[styles.chipText, formData.trainingLevel === l && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[Colors.primary, '#9FE800']}
              style={styles.saveGrad}
            >
              {isSaving ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Check size={20} color="#000" strokeWidth={3} />
                  <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
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
      <Icon size={12} color={Colors.primary} />
      <Text style={styles.labelText}>{label}</Text>
      {required && <Text style={styles.asterisk}>*</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.background,
  },
  avatarLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 16,
    marginBottom: 20,
    opacity: 0.8,
  },
  formGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginLeft: 4,
  },
  labelText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 20,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: '#FF4B4B',
    backgroundColor: '#FF4B4B08',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 8,
  },
  asterisk: {
    color: '#FF4B4B',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  disabledInput: {
    opacity: 0.5,
    justifyContent: 'center',
  },
  disabledText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  saveBtn: {
    marginTop: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  saveGrad: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
