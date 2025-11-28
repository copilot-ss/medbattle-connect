import { Pressable, Text, View } from 'react-native';
import CampaignPathMap from './campaign/CampaignPathMap';
import useCampaignPath from './campaign/useCampaignPath';
import styles from './styles/CampaignPathScreen.styles';

export default function CampaignPathScreen({ navigation, route }) {
  const {
    bodyWidth,
    bodyHeight,
    nodeLayouts,
    unlockedKeys,
    focusedStage,
    completedStage,
    setFocusedStage,
  } = useCampaignPath(route);

  function handleStartStage(stage, nextStageKey) {
    setFocusedStage(stage.key);
    navigation.navigate('Quiz', {
      mode: 'campaign',
      campaignStage: stage.key,
      campaignLabel: `${stage.title} - ${stage.difficultyLabel}`,
      campaignNextStage: nextStageKey,
      difficulty: stage.difficulty,
      questionLimit: stage.questionLimit,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </Pressable>
      </View>

      <CampaignPathMap
        bodyWidth={bodyWidth}
        bodyHeight={bodyHeight}
        nodeLayouts={nodeLayouts}
        unlockedKeys={unlockedKeys}
        focusedStage={focusedStage}
        completedStage={completedStage}
        onPressStage={handleStartStage}
      />
    </View>
  );
}
