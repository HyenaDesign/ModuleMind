import React, { useState, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppMessage from '../../components/AppMessage';
import CustomTabBar from '../../components/CustomTabBar';
import { getStoredUser, isPremiumUser, StoredUser } from '../../constants/account';
import { useLanguage } from '../../hooks/use-language';

const ProfileScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [userData, setUserData] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const premium = isPremiumUser(userData);

  const fetchUserData = useCallback(async () => {
    try {
        setLoading(true);
        setMessage(null);
        const data = await getStoredUser();
        if (!data) {
            console.log("No user found, redirecting to login...");
            router.replace('/signin');
            return;
        }

        if (data?.name || data?.full_name || data?.email) {
            setUserData({
                ...data,
                name: data.name || data.full_name || t('name'),
                email: data.email || t('email'),
            });
        } else {
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

    if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/signin');
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF', '#F2FFD7']}
      locations={[0, 0.72, 1]}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('profile')}</Text>
        </View>

        <View style={styles.content}>
          {message && <AppMessage tone="warning" title={t('internetWarning')} message={message} />}
          <View style={styles.profileCard}>
            <Image source={require('../../assets/images/profile-placeholder.png')} style={styles.profileImage} />
            <Text style={styles.name}>{userData?.name || t('name')}</Text>
            <Text style={styles.email}>{userData?.email || t('email')}</Text>
            <View style={[styles.badge, premium && styles.premiumBadge]}>
              <Text style={[styles.badgeIcon, premium && styles.premiumBadgeIcon]}>{premium ? '✓' : '!'}</Text>
              <Text style={[styles.badgeText, premium && styles.premiumBadgeText]}>
                {premium ? t('premiumUser') : t('freeUser')}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={() => router.push('/account-settings')}>
              <Text style={styles.editButtonText}>{t('editProfile')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuGroup}>
            <TouchableOpacity style={[styles.menuItem, styles.premiumItem]} activeOpacity={0.8} onPress={() => router.push('/premium')}>
              <MaterialCommunityIcons name="diamond-stone" size={20} color="#444444" />
              <Text style={styles.menuText}>{premium ? t('manageSubscription') : t('becomePremium')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => router.push('/scores')}
            >
              <Ionicons name="bar-chart-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>{t('scores')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/language')}>
              <Ionicons name="language-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>{t('language')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push('/account-settings')}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>{t('accountSecurity')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} activeOpacity={0.8} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#444444" />
              <Text style={styles.menuText}>{t('logout')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <CustomTabBar activeTab="Profile" />
    </LinearGradient>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginTop: 42,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#05C925',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 120,
  },
  profileCard: {
    width: '100%',
    minHeight: 208,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 38,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  email: {
    fontSize: 13,
    color: '#555555',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF4B8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 8,
  },
  badgeIcon: {
    color: '#FFB000',
    fontWeight: '900',
    fontSize: 12,
  },
  badgeText: {
    color: '#FF9900',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: '#DFFBE7',
  },
  premiumBadgeIcon: {
    color: '#05C925',
  },
  premiumBadgeText: {
    color: '#05C925',
  },
  editButton: {
    marginTop: 12,
    backgroundColor: '#05C925',
    borderRadius: 6,
    minWidth: 126,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  menuGroup: {
    marginTop: 30,
    gap: 8,
  },
  menuItem: {
    minHeight: 45,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  premiumItem: {
    borderColor: '#05C925',
    backgroundColor: '#F4FFF8',
  },
  logoutItem: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  menuText: {
    flex: 1,
    color: '#555555',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
