import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import AppMessage from '../../components/AppMessage';
import CustomTabBar from '../../components/CustomTabBar';
import { saveStoredUser } from '../../constants/account';
import { getStoredLanguage, LANGUAGES, LanguageKey, setStoredLanguage, translate } from '../../constants/language';

const LanguageScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('nl');
  const [message, setMessage] = useState<string | null>(null);
  const t = useCallback((key: Parameters<typeof translate>[1]) => translate(selectedLanguage, key), [selectedLanguage]);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const storedLanguage = await getStoredLanguage();
      setSelectedLanguage(storedLanguage);
      const user = await AsyncStorage.getItem('user');

      if (!user) {
        router.replace('/signin');
        return;
      }

      const data = JSON.parse(user);
      if (!data?.name && !data?.full_name && !data?.email) {
        setMessage(t('somethingWentWrong'));
      }
    } catch {
      setMessage(t('noInternet'));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleLanguageChange = async (language: LanguageKey) => {
    setSelectedLanguage(language);
    await setStoredLanguage(language);
    await saveStoredUser({ language });
    // Force a small delay or router refresh if needed,
    // but the useFocusEffect in hooks should handle it when navigating back.
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05C925" />
      </View>
    );
  }

  return (
    <ImageBackground source={require('../../assets/images/background.jpg')} style={styles.background} resizeMode="cover">
      <View style={styles.whiteOverlay} />
      <LinearGradient
        colors={['white', 'white', 'transparent']}
        locations={[0, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('language')}</Text>
        </View>
        {message && (
          <View style={styles.messageWrap}>
            <AppMessage tone="warning" title={t('internetWarning')} message={message} />
          </View>
        )}
        <View style={styles.menuGroup}>
          {LANGUAGES.map((lang) => {
            const isActive = selectedLanguage === lang.key;

            return (
              <TouchableOpacity
                key={lang.key}
                style={[styles.menuItem, isActive && styles.activeItem]}
                activeOpacity={0.8}
                onPress={() => handleLanguageChange(lang.key)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[styles.menuText, isActive && styles.activeText]}>{lang.label}</Text>
                <Ionicons name={isActive ? 'checkmark' : 'arrow-forward'} size={20} color={isActive ? '#05C925' : '#999999'} />
              </TouchableOpacity>
            );
          })}
        </View>
        <CustomTabBar activeTab="Profile" />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  whiteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  gradient: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { marginTop: 42, paddingHorizontal: 20, paddingBottom: 14, marginBottom: 20 },
  headerText: { fontSize: 28, fontWeight: '700', color: '#05C925' },
  messageWrap: { paddingHorizontal: 25, marginBottom: 14 },
  menuGroup: { marginBottom: 30, alignItems: 'center', gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    width: '85%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    minHeight: 45,
    borderWidth: 2,
    borderColor: '#E6E6E6',
    borderRadius: 6,
  },
  menuText: { flex: 1, fontSize: 18, marginLeft: 15, color: '#555' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  activeItem: { backgroundColor: '#E9FBEF', borderColor: '#05C925' },
  activeText: { color: '#05C925', fontWeight: '600' },
  flag: { fontSize: 14, fontWeight: '800', color: '#444' },
});

export default LanguageScreen;
