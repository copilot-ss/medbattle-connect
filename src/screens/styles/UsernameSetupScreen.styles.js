import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  message: {
    marginTop: 10,
    color: colors.highlight,
    fontFamily: fonts.medium,
  },
  button: {
    marginTop: 18,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#081019',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});

export default styles;
