import { useEffect, useState } from 'react';

export default function useResultScoreAnimations({
  showZeroScoreAnimation,
}) {
  const [showZeroGhostOverlay, setShowZeroGhostOverlay] = useState(false);

  useEffect(() => {
    if (!showZeroScoreAnimation) {
      setShowZeroGhostOverlay(false);
      return undefined;
    }

    setShowZeroGhostOverlay(true);
    const timeoutId = setTimeout(() => {
      setShowZeroGhostOverlay(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [showZeroScoreAnimation]);

  return {
    showZeroGhostOverlay,
  };
}
