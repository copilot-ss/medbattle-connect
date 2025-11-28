import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 12,
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  closeButtonText: {
    color: '#E2E8F0',
    fontWeight: '800',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 0,
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  outerScroll: {
    flex: 1,
  },
  outerContent: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  innerScroll: {
    flex: 1,
  },
  innerContent: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  panZoomContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  zoomableContent: {
    position: 'relative',
  },
  bodyWrapper: {
    flex: 1,
    position: 'relative',
  },
  bodyBackground: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
    alignSelf: 'stretch',
    resizeMode: 'cover',
  },
  nodeLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bodyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.35)',
  },
  nodeContainer: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 6,
    left: 0,
  },
  nodeContent: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  nodeRow: {
    position: 'absolute',
  },
  nodeLeft: {
    alignSelf: 'flex-start',
  },
  nodeRight: {
    alignSelf: 'flex-end',
  },
  nodeCenter: {
    alignSelf: 'center',
  },
  nodeLine: {
    position: 'absolute',
    height: 100,
    width: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.32)',
  },
  nodeAnimationWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeAnimation: {
    width: 120,
    height: 120,
  },
});

export function getNodeStyle({ accent, active, completed, focused }) {
  return StyleSheet.compose(
    {
      borderRadius: 999,
      borderWidth: 2,
      borderColor: active ? accent : 'rgba(96, 165, 250, 0.6)',
      backgroundColor: completed
        ? 'rgba(34, 197, 94, 0.9)'
        : active
        ? accent
        : 'rgba(15, 23, 42, 0.45)',
      shadowColor: accent,
      shadowOpacity: focused ? 0.5 : active ? 0.25 : 0,
      shadowRadius: focused ? 20 : active ? 12 : 0,
      shadowOffset: { width: 0, height: focused ? 12 : active ? 8 : 0 },
      elevation: focused ? 10 : active ? 6 : 0,
      opacity: active ? 1 : 0.6,
      width: 72,
      height: 72,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    null
  );
}

export function getNodeTextStyle(accent) {
  return StyleSheet.compose(
    {
      color: '#0B1120',
      fontSize: 13,
      fontWeight: '800',
    },
    null
  );
}

export function getPathLineStyle(customStyle = {}) {
  return StyleSheet.compose(styles.nodeLine, customStyle);
}

export function getBodyGlowStyle(color, top) {
  return StyleSheet.compose(
    {
      position: 'absolute',
      left: 10,
      right: 10,
      top,
      height: 120,
      borderRadius: 80,
      backgroundColor: color,
      opacity: 0.16,
    },
    null
  );
}

export default styles;
