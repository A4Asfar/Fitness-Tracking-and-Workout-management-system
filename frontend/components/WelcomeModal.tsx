import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Theme';
import { Trophy, ArrowRight, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>
              {isNewUser ? "Let's Start Training" : "Go to Dashboard"}
            </Text>
            <ArrowRight size={20} color="#000" style={{ marginLeft: 10 }} />
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
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
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
    backgroundColor: Colors.primary,
    width: '100%',
    padding: 18,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
