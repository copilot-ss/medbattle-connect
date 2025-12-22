import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  panel: {
    backgroundColor: '#0B1220',
    borderColor: '#111827',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 28,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupLarge: {
    marginBottom: 24,
  },
  label: {
    color: '#CBD5E1',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#E2E8F0',
    backgroundColor: '#0F172A',
  },
  message: {
    color: '#FCA5A5',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: '#1D4ED8',
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  toggleText: {
    color: '#93C5FD',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 10,
  },
  socialGroup: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  guestButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  guestButtonDisabled: {
    opacity: 0.6,
  },
  guestButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  discordButton: {
    backgroundColor: '#5865F2',
  },
});

export default styles;
