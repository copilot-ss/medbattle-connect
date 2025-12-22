import { StyleSheet, View } from 'react-native';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { getAdsModule, getBannerAdUnitId } from '../services/adsService';

export default function AdBanner({ style, requestOptions }) {
  const { premium, loading } = usePremiumStatus();
  const adUnitId = getBannerAdUnitId();
  const adsModule = getAdsModule();
  const BannerAd = adsModule?.BannerAd;
  const BannerAdSize = adsModule?.BannerAdSize;

  if (loading || premium || !adUnitId || !BannerAd || !BannerAdSize) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          ...requestOptions,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
