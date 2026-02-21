import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AvatarView({
  uri = null,
  source = null,
  icon = null,
  color = null,
  initials = '?',
  frameStyle = null,
  circleStyle = null,
  imageStyle = null,
  iconSize = 20,
  iconColor = null,
  textStyle = null,
}) {
  const resolvedUri =
    typeof uri === 'string' && uri.trim()
      ? uri.trim()
      : null;
  const resolvedIcon =
    typeof icon === 'string' && icon.trim()
      ? icon.trim()
      : null;
  const imageSource = resolvedUri ? { uri: resolvedUri } : source;

  const content = imageSource ? (
    <Image source={imageSource} style={imageStyle} resizeMode="cover" />
  ) : resolvedIcon ? (
    <Ionicons
      name={resolvedIcon}
      size={iconSize}
      color={iconColor || color || '#9EDCFF'}
    />
  ) : (
    <Text style={textStyle}>{initials || '?'}</Text>
  );

  if (frameStyle) {
    return (
      <View style={frameStyle}>
        <View style={circleStyle}>
          {content}
        </View>
      </View>
    );
  }

  return (
    <View style={circleStyle}>
      {content}
    </View>
  );
}
