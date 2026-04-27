import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* These screens will NOT have a navbar */}
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      
      {/* This name matches the folder (tabs) */}
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}