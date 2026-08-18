import { Stack } from 'expo-router';
import { Text, TextInput } from 'react-native';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = [{ fontFamily: 'DMSans_400Regular' }, (Text as any).defaultProps.style];
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = [{ fontFamily: 'DMSans_400Regular' }, (TextInput as any).defaultProps.style];

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* These screens will NOT have a navbar */}
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="scores" />
      <Stack.Screen name="account-settings" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="streak-celebration" />
      <Stack.Screen name="reward-interstitial" />
      
      {/* This name matches the folder (tabs) */}
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}

