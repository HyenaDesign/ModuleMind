import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Define the 4 buttons you want
const TABS = [
  { id: 'Home', icon: 'home-outline', label: 'Home', path: '/(tabs)/Home' },
  { id: 'Modules', icon: 'book-outline', label: 'Modules', path: '/(tabs)/Modules' },
  { id: 'Search', icon: 'search-outline', label: 'Search', path: '/(tabs)/explore' }, // Mapping Search to explore.tsx
  { id: 'Profile', icon: 'person-outline', label: 'Profile', path: '/(tabs)/Profile' },
];

interface Props {
  activeTab?: 'Home' | 'Modules' | 'Search' | 'Profile';
}

export default function CustomTabBar({ activeTab }: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isFocused = activeTab === tab.id;

          return (
            <Pressable
              key={tab.id}
              onPress={() => router.push(tab.path as any)}
              style={[styles.tab, isFocused && styles.activeTab]}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={isFocused ? '#05C925' : '#374151'}
              />
              {isFocused && (
                <Text style={styles.activeText}>{tab.label}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    width: '90%',
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeTab: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    gap: 6,
  },
  activeText: {
    color: '#05C925',
    fontWeight: '700',
    fontSize: 14,
  },
});