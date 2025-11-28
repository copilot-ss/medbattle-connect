import { useEffect, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';
import { CAMPAIGN_STAGES } from '../../data/campaignQuestions';
import { calculateMatchPoints } from '../../services/quizService';
import { BODY_PATH_LAYOUT } from './campaignLayout';

function findStage(key) {
  return CAMPAIGN_STAGES.find((stage) => stage.key === key) ?? CAMPAIGN_STAGES[0];
}

export default function useCampaignPath(route) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const zoomScale = 1.2;
  const bodyWidth = screenWidth * zoomScale;
  const bodyHeight = screenHeight * zoomScale;
  const [unlockedKeys, setUnlockedKeys] = useState(() => new Set([CAMPAIGN_STAGES[0].key]));
  const [focusedStage, setFocusedStage] = useState(CAMPAIGN_STAGES[0].key);
  const completedStage = route?.params?.completedStage ?? null;
  const nextStageFromResult = route?.params?.nextStage ?? null;

  useEffect(() => {
    if (!completedStage) {
      return;
    }
    const currentIndex = CAMPAIGN_STAGES.findIndex((stage) => stage.key === completedStage);
    const nextKey =
      nextStageFromResult ??
      (currentIndex >= 0 && currentIndex < CAMPAIGN_STAGES.length - 1
        ? CAMPAIGN_STAGES[currentIndex + 1].key
        : null);

    if (!nextKey) {
      return;
    }

    setUnlockedKeys((prev) => {
      const next = new Set(prev);
      next.add(nextKey);
      return next;
    });
    setFocusedStage((current) => current ?? nextKey);
  }, [completedStage, nextStageFromResult]);

  const nodeLayouts = useMemo(
    () =>
      BODY_PATH_LAYOUT.map((node, index) => {
        const stage = findStage(node.key);
        const maxPoints = calculateMatchPoints({
          correct: stage.questionLimit,
          total: stage.questionLimit,
          difficulty: stage.difficulty,
        });
        const nextStage = CAMPAIGN_STAGES[index + 1];
        return {
          ...node,
          top: Math.round(bodyHeight * node.topFraction),
          stage,
          maxPoints,
          nextStageKey: nextStage?.key ?? null,
        };
      }),
    [bodyHeight]
  );

  return {
    bodyWidth,
    bodyHeight,
    nodeLayouts,
    unlockedKeys,
    focusedStage,
    completedStage,
    setFocusedStage,
  };
}
