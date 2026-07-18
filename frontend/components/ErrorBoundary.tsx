import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { SharedStyles } from '@/constants/Theme';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={[SharedStyles.card, styles.container]}>
          <ShieldAlert color="#EF4444" size={32} style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Widget Render Failed</Text>
          <Text style={styles.subtitle}>{this.props.fallbackMessage || 'A rendering error occurred in this module.'}</Text>
          <Text style={styles.errorText} numberOfLines={3}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  title: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8
  },
  errorText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
    opacity: 0.5
  }
});
