import { forwardRef } from 'react';
import { Image as ExpoImage } from 'expo-image';

function withCacheKey(source, cacheKey) {
  if (!cacheKey || !source || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }

  if (typeof source.uri !== 'string' || !source.uri.trim()) {
    return source;
  }

  return {
    ...source,
    cacheKey,
  };
}

const AppImage = forwardRef(function AppImage({
  source,
  contentFit = 'cover',
  cachePolicy = 'disk',
  cacheKey = null,
  accessibilityLabel = null,
  ...props
}, ref) {
  return (
    <ExpoImage
      ref={ref}
      source={withCacheKey(source, cacheKey)}
      contentFit={contentFit}
      cachePolicy={cachePolicy}
      allowDownscaling
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel || undefined}
      {...props}
    />
  );
});

export default AppImage;
