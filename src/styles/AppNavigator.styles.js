import { StyleSheet } from 'react-native';
import { colors, fonts } from './theme';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.accent,
    borderTopWidth: 2,
    height: 64,
    paddingTop: 4,
    paddingBottom: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  tabBarItem: {
    paddingVertical: 0,
  },
});

export default styles;
