import { useCallback, useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getStoredLanguage, LanguageKey, translate } from '../constants/language';

const TABS = [
  { id: 'Home', icon: 'home-outline', labelKey: 'home', path: '/(tabs)/Home' },
  { id: 'Modules', icon: 'book-outline', labelKey: 'modules', path: '/(tabs)/Modules' },
  { id: 'Search', icon: 'search-outline', labelKey: 'search', path: '/(tabs)/explore' },
  { id: 'Profile', icon: 'person-outline', labelKey: 'profile', path: '/(tabs)/Profile' },
] as const;

interface Props {
  activeTab?: typeof TABS[number]['id'];
}

export default function CustomTabBar({ activeTab }: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageKey>('nl');

  useFocusEffect(
    useCallback(() => {
      getStoredLanguage().then(setLanguage);
    }, [])
  );

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
                <Text style={styles.activeText}>{translate(language, tab.labelKey)}</Text>
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
