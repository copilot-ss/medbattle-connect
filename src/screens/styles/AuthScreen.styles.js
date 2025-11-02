import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupLarge: {
    marginBottom: 24,
  },
  label: {
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  message: {
    color: '#B91C1C',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleText: {
    color: '#2563EB',
    textAlign: 'center',
    fontSize: 15,
  },
  socialGroup: {
    marginTop: 24,
    rowGap: 10,
  },
  socialButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
