import { ImageBackground, Pressable, View, useWindowDimensions } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { getNodeStyle, getPathLineStyle, default as mapStyles } from '../styles/CampaignPathScreen.styles';

const BODY_IMAGE = require('../../../assets/koeprer_bilder/body_full.jpg');
const PULSE_ANIMATION = require('../../../assets/animations/pulse.json');

export default function CampaignPathMap({
  bodyWidth,
  bodyHeight,
  nodeLayouts,
  unlockedKeys,
  focusedStage,
  completedStage,
  onPressStage,
}) {
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const [viewportSize, setViewportSize] = useState({
    width: viewportWidth,
    height: viewportHeight,
  });
  const zoom = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const NODE_SIZE = 72;
  const PATH_THICKNESS = 6;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const clampValue = (value, min, max) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  const clampOffsets = (scale) => {
    'worklet';
    const scaledWidth = bodyWidth * scale;
    const scaledHeight = bodyHeight * scale;
    const maxX = Math.max(0, scaledWidth - viewportSize.width);
    const maxY = Math.max(0, scaledHeight - viewportSize.height);
    // Wenn die skalierte Fläche kleiner als der Viewport ist, zentrieren.
    const centerX = maxX === 0 ? (viewportSize.width - scaledWidth) / 2 : 0;
    const centerY = maxY === 0 ? (viewportSize.height - scaledHeight) / 2 : 0;

    return {
      minX: maxX === 0 ? centerX : -maxX,
      maxX: maxX === 0 ? centerX : 0,
      minY: maxY === 0 ? centerY : -maxY,
      maxY: maxY === 0 ? centerY : 0,
    };
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseScale.value = zoom.value;
    })
    .onUpdate((event) => {
      const nextScale = clampValue(baseScale.value * event.scale, 0.75, 3.5);
      zoom.value = nextScale;
      const bounds = clampOffsets(nextScale);
      translateX.value = clampValue(translateX.value, bounds.minX, bounds.maxX);
      translateY.value = clampValue(translateY.value, bounds.minY, bounds.maxY);
    })
    .onEnd(() => {
      baseScale.value = zoom.value;
    });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10])
    .onChange((event) => {
      const bounds = clampOffsets(zoom.value);
      translateX.value = clampValue(translateX.value + event.changeX, bounds.minX, bounds.maxX);
      translateY.value = clampValue(translateY.value + event.changeY, bounds.minY, bounds.maxY);
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  useEffect(() => {
    const bounds = clampOffsets(zoom.value);
    translateX.value = clamp(translateX.value, bounds.minX, bounds.maxX);
    translateY.value = clamp(translateY.value, bounds.minY, bounds.maxY);
  }, [bodyHeight, bodyWidth, viewportSize.height, viewportSize.width]);

  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setViewportSize((prev) => {
      if (prev.width === width && prev.height === height) {
        return prev;
      }
      return { width, height };
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: bodyWidth,
    height: bodyHeight,
    transform: [{ scale: zoom.value }, { translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const positionedNodes = useMemo(() => {
    const fallback = (align) => {
      if (align === 'flex-start') return 0.32;
      if (align === 'flex-end') return 0.68;
      return 0.5;
    };
    return nodeLayouts.map((node) => {
      const leftFraction = Number.isFinite(node.leftFraction) ? clamp(node.leftFraction, 0.2, 0.8) : fallback(node.align);
      const centerX = bodyWidth * leftFraction;
      return {
        ...node,
        centerX,
        nodeLeft: centerX - NODE_SIZE / 2,
      };
    });
  }, [bodyWidth, nodeLayouts]);

  return (
    <View style={mapStyles.panZoomContainer} onLayout={handleLayout}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[mapStyles.zoomableContent, animatedStyle]}>
          <ImageBackground source={BODY_IMAGE} resizeMode="contain" style={mapStyles.bodyBackground} imageStyle={mapStyles.bodyImage}>
            <View style={mapStyles.nodeLayer}>
              {positionedNodes.map((node, index) => {
                const isUnlocked = unlockedKeys.has(node.stage.key);
                const isCompleted = completedStage === node.stage.key;
                const isFocused = focusedStage === node.stage.key;
                const prevNode = index > 0 ? positionedNodes[index - 1] : null;

                const pathLine =
                  prevNode && node.top != null
                    ? (() => {
                        const fromY = prevNode.top + NODE_SIZE * 0.55;
                        const toY = node.top;
                        const lineTop = Math.min(fromY, toY);
                        const lineHeight = Math.max(28, Math.abs(toY - fromY));
                        const lineLeft = (prevNode.centerX + node.centerX) / 2 - PATH_THICKNESS / 2;
                        return (
                          <View
                            key={`${node.stage.key}-line`}
                            style={getPathLineStyle({
                              left: lineLeft,
                              top: lineTop,
                              height: lineHeight,
                              width: PATH_THICKNESS,
                              opacity: isUnlocked ? 1 : 0.5,
                            })}
                          />
                        );
                      })()
                    : null;

                return (
                  <View key={node.stage.key} style={[mapStyles.nodeRow, { top: node.top, left: node.nodeLeft }]}>
                    {pathLine}
                    <Pressable
                      disabled={!isUnlocked}
                      onPress={() => onPressStage(node.stage, node.nextStageKey)}
                      style={getNodeStyle({
                        accent: node.stage.accent,
                        active: isUnlocked,
                        completed: isCompleted,
                        focused: isFocused,
                      })}
                    >
                      {isFocused ? (
                        <View style={mapStyles.nodeAnimationWrap}>
                          <LottieView source={PULSE_ANIMATION} autoPlay loop style={mapStyles.nodeAnimation} />
                        </View>
                      ) : null}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ImageBackground>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
