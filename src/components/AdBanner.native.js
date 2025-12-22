import { StyleSheet, View } from 'react-native';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { usePreferences } from '../context/PreferencesContext';
import { getAdsModule, getBannerAdUnitId } from '../services/adsService';

export default function AdBanner({ style, requestOptions }) {
  const { premium, loading: premiumLoading } = usePremiumStatus();
  const { energy, loading: energyLoading } = usePreferences();
  const adUnitId = getBannerAdUnitId();
  const adsModule = getAdsModule();
  const BannerAd = adsModule?.BannerAd;
  const BannerAdSize = adsModule?.BannerAdSize;
  const showEnergyAd = !energyLoading && energy <= 0;

  if (
    premiumLoading ||
    energyLoading ||
    premium ||
    !showEnergyAd ||
    !adUnitId ||
    !BannerAd ||
    !BannerAdSize
  ) {
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
