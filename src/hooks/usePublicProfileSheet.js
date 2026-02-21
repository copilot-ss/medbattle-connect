import { useCallback, useMemo, useState } from 'react';

export default function usePublicProfileSheet() {
  const [selectedProfile, setSelectedProfile] = useState(null);

  const openProfile = useCallback((profile) => {
    if (!profile) {
      return;
    }
    setSelectedProfile(profile);
  }, []);

  const closeProfile = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  const sheetProps = useMemo(
    () => ({
      visible: Boolean(selectedProfile),
      profile: selectedProfile,
      onClose: closeProfile,
    }),
    [closeProfile, selectedProfile]
  );

  return {
    selectedProfile,
    setSelectedProfile,
    openProfile,
    closeProfile,
    sheetProps,
  };
}
