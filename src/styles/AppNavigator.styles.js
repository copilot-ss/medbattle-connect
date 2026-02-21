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
  tabBarBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    textAlignVertical: 'center',
  },
  tabBarDotBadge: {
    minWidth: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    top: 4,
  },
});

export default styles;
