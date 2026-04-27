import { View, Pressable, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

type RouteName = 'home' | 'search' | 'notifications' | 'profile';

const icons: Record<RouteName, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  search: 'search-outline',
  notifications: 'notifications-outline',
  profile: 'person-outline',
};

export default function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const routeName = route.name as RouteName; // ✅ key fix

          const onPress = () => {
            navigation.navigate(routeName);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.activeTab]}
            >
              <Ionicons
                name={icons[routeName]}
                size={20}
                color={isFocused ? '#05C925' : '#374151'}
              />

              {isFocused && (
                <Text style={styles.activeText}>
                  {routeName}
                </Text>
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
    width: '100%',
    alignItems: 'center',
  },

  container: {
    width: 370,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 16,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,

    // 🔥 shadow (iOS + Android)
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  tab: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeTab: {
    width: 110,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#dcfce7', // light green
    borderRadius: 26,
    gap: 6,
  },

  activeText: {
    color: '#05C925',
    fontWeight: '600',
    fontSize: 14,
  },
});