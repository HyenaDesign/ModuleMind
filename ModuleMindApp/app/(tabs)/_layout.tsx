import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="Modules" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="Teacher" />
      <Tabs.Screen name="Profile" />
    </Tabs>
  );
}
