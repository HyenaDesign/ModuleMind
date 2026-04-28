import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarStyle: { display: 'none' } // Hide the native bar
      }}
    >
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="Modules" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}