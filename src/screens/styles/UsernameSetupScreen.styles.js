import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    color: '#E2E8F0',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  message: {
    marginTop: 10,
    color: '#FBBF24',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default styles;
