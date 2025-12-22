import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { logClientError } from '../services/loggingService';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('GlobalErrorBoundary caught:', error, info);
    logClientError({
      level: 'error',
      message: error?.message ?? String(error),
      stack: error?.stack,
      context: { componentStack: info?.componentStack },
    });
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oops, etwas ist schiefgelaufen.</Text>
        <Text style={styles.subtitle}>Bitte Screenshot teilen, damit wir den Crash beheben.</Text>
        <ScrollView style={styles.box}>
          <Text style={styles.errorText}>{String(error)}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  box: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#f87171',
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
