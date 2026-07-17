import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Theme';
import { Trophy, ArrowRight, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  isNewUser?: boolean;
}

export default function WelcomeModal({ visible, onClose, userName, isNewUser = true }: WelcomeModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            {isNewUser ? (
              <Trophy size={60} color={Colors.primary} />
            ) : (
              <Zap size={60} color={Colors.primary} />
            )}
          </View>
          
          <Text style={styles.title}>
            {isNewUser ? `Welcome to the Team, ${userName}!` : `Welcome Back, ${userName}!`}
          </Text>
          <Text style={styles.subtitle}>
            {isNewUser 
              ? "Your transformation starts now. We're here to help you reach your peak performance."
              : "Great to see you again! Your progress is waiting. Ready for another session?"}
          </Text>

          <View style={styles.tipContainer}>
            <Zap size={20} color={Colors.primary} />
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: 'bold' }}>{isNewUser ? "Pro Tip: " : "Daily Reminder: "}</Text>
              {isNewUser 
                ? "Logging your first workout today increases consistency by 50%!"
                : "Consistency is key. Small efforts today lead to massive results tomorrow!"}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <LinearGradient
              colors={['#10B981', '#BD00FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.buttonText}>
              {isNewUser ? "LET'S START TRAINING" : "GO TO DASHBOARD"}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { flexShrink: 1, 
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: { flexShrink: 1, 
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  tipText: {
    color: Colors.text,
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
