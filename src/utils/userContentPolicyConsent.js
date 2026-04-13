import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_CONTENT_POLICY_KEY = 'medbattle_user_content_policy_v1';

export async function loadUserContentPolicyAccepted() {
  try {
    const value = await AsyncStorage.getItem(USER_CONTENT_POLICY_KEY);
    return value === 'accepted';
  } catch (error) {
    console.warn('Konnte User-Policy-Zustimmung nicht laden:', error);
    return false;
  }
}

export async function saveUserContentPolicyAccepted(accepted) {
  try {
    if (accepted) {
      await AsyncStorage.setItem(USER_CONTENT_POLICY_KEY, 'accepted');
    } else {
      await AsyncStorage.removeItem(USER_CONTENT_POLICY_KEY);
    }
    return true;
  } catch (error) {
    console.warn('Konnte User-Policy-Zustimmung nicht speichern:', error);
    return false;
  }
}
