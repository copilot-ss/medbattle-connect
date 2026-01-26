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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingTop: 6,
    paddingBottom: 12,
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
});

export default styles;
