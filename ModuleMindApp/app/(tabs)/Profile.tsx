import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppMessage from '../../components/AppMessage';
import CustomTabBar from '../../components/CustomTabBar';
import { getStoredUser, isPremiumUser, isTeacherUser, StoredUser } from '../../constants/account';
import { calculateXp, getLevelStats } from '../../constants/progress';
import { useLanguage } from '../../hooks/use-language';

type QuizScore = {
  correct: number;
  total: number;
  percentage: number;
  completedAt: string;
};

type LeaderboardItem = {
  id: string;
  name: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
};

const ProfileScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [userData, setUserData] = useState<StoredUser | null>(null);
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [showAccountOptions, setShowAccountOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const premium = isPremiumUser(userData);
  const teacher = isTeacherUser(userData);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const data = await getStoredUser();
      if (!data) {
        router.replace('/signin');
        return;
      }

      const normalizedUser = {
        ...data,
        name: data.name || data.full_name || t('name'),
        email: data.email || t('email'),
      };
      setUserData(normalizedUser);

      const userId = String(data.id || data.user_id || 'guest');
      const storedScores = await AsyncStorage.getItem(`quizScores:${userId}`);
      const parsedScores: QuizScore[] = storedScores ? JSON.parse(storedScores) : [];
      setScores(parsedScores);

      const keys = await AsyncStorage.getAllKeys();
      const scoreKeys = keys.filter((key) => key.startsWith('quizScores:'));
      const scorePairs = await AsyncStorage.multiGet(scoreKeys);
      const localLeaderboard = scorePairs.map(([key, value]) => {
        const id = key.replace('quizScores:', '');
        const userScores: QuizScore[] = value ? JSON.parse(value) : [];
        const xp = calculateXp(userScores);
        return {
          id,
          name: id === userId ? normalizedUser.name : `Student ${id}`,
          xp,
          level: getLevelStats(xp).level,
          isCurrentUser: id === userId,
        };
      });

      setLeaderboard(localLeaderboard.sort((a, b) => b.xp - a.xp).slice(0, 5));
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

  const xp = useMemo(() => calculateXp(scores), [scores]);
  const levelStats = useMemo(() => getLevelStats(xp), [xp]);
  const facebookFriends = userData?.authProvider === 'facebook' ? userData.facebookFriends || [] : [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05C925" />
      </View>
    );
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/signin');
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF', '#F2FFD7']} locations={[0, 0.72, 1]} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{t('profile')}</Text>
          </View>

          {message && <AppMessage tone="warning" title={t('internetWarning')} message={message} />}

          <View style={styles.profileCard}>
            <Image source={require('../../assets/images/profile-placeholder.png')} style={styles.profileImage} />
            <Text style={styles.name}>{userData?.name || t('name')}</Text>
            <Text style={styles.email}>{userData?.email || t('email')}</Text>
            <View style={[styles.badge, premium && styles.premiumBadge]}>
              <Ionicons name={premium ? 'checkmark' : 'alert'} size={12} color={premium ? '#05C925' : '#FFB000'} />
              <Text style={[styles.badgeText, premium && styles.premiumBadgeText]}>
                {premium ? t('premiumUser') : t('freeUser')}
              </Text>
            </View>

            <View style={styles.levelBox}>
              <View style={styles.levelTopRow}>
                <Text style={styles.levelText}>{t('level')} {levelStats.level}</Text>
                <Text style={styles.xpText}>{xp} XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${levelStats.progress}%` }]} />
              </View>
              <Text style={styles.xpMeta}>{levelStats.xpToNextLevel} {t('xpToNextLevel')}</Text>
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

            {teacher && (
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push('/(tabs)/Teacher')}>
                <Ionicons name="people-outline" size={20} color="#555555" />
                <Text style={styles.menuText}>{t('teacherDashboard')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#333333" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push('/scores')}>
              <Ionicons name="bar-chart-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>{t('scores')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push('/(tabs)/language')}>
              <Ionicons name="language-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>{t('language')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('leaderboard')}</Text>
            {leaderboard.length === 0 ? (
              <Text style={styles.sectionHint}>{t('finishQuizForScores')}</Text>
            ) : leaderboard.map((item, index) => (
              <View key={item.id} style={[styles.rankRow, item.isCurrentUser && styles.currentRankRow]}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{item.name}</Text>
                  <Text style={styles.rankMeta}>{t('level')} {item.level}</Text>
                </View>
                <Text style={styles.rankXp}>{item.xp} XP</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('facebookFriends')}</Text>
            {facebookFriends.length > 0 ? facebookFriends.map((friend) => (
              <View key={friend.id} style={styles.friendRow}>
                <View style={styles.friendAvatar}><Text style={styles.friendInitial}>{friend.name.slice(0, 1)}</Text></View>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.rankXp}>{friend.xp || 0} XP</Text>
              </View>
            )) : (
              <Text style={styles.sectionHint}>{t('facebookFriendsHint')}</Text>
            )}
          </View>

          <View style={styles.menuGroupCompact}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => setShowAccountOptions((current) => !current)}>
              <Ionicons name="settings-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>{t('accountOptions')}</Text>
              <Ionicons name={showAccountOptions ? 'chevron-up' : 'chevron-down'} size={20} color="#333333" />
            </TouchableOpacity>

            {showAccountOptions && (
              <View style={styles.hiddenOptions}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push('/account-settings')}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#555555" />
                  <Text style={styles.menuText}>{t('accountSecurity')}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#333333" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutTextButton} activeOpacity={0.8} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#777777" />
                  <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <CustomTabBar activeTab="Profile" />
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingBottom: 14 },
  headerText: { fontSize: 28, fontWeight: '700', color: '#05C925' },
  content: { paddingHorizontal: 22, paddingTop: 42, paddingBottom: 135 },
  profileCard: {
    width: '100%',
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
  profileImage: { width: 60, height: 60, borderRadius: 38, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '800', color: '#111111' },
  email: { fontSize: 13, color: '#555555', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF4B8', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, marginTop: 8 },
  badgeIcon: { color: '#FFB000', fontWeight: '900', fontSize: 12 },
  badgeText: { color: '#FF9900', fontSize: 12, fontWeight: '600' },
  premiumBadge: { backgroundColor: '#DFFBE7' },
  premiumBadgeIcon: { color: '#05C925' },
  premiumBadgeText: { color: '#05C925' },
  levelBox: { width: '100%', marginTop: 15, borderRadius: 10, borderWidth: 1, borderColor: '#D8F8E2', backgroundColor: '#F7FFF9', padding: 12 },
  levelTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelText: { color: '#05C925', fontSize: 16, fontWeight: '900' },
  xpText: { color: '#333', fontSize: 13, fontWeight: '900' },
  xpTrack: { marginTop: 9, height: 10, borderRadius: 999, backgroundColor: '#E5E5E5', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 999, backgroundColor: '#05C925' },
  xpMeta: { marginTop: 6, color: '#666', fontSize: 12, fontWeight: '700' },
  editButton: { marginTop: 12, backgroundColor: '#05C925', borderRadius: 6, minWidth: 126, height: 42, alignItems: 'center', justifyContent: 'center' },
  editButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  menuGroup: { marginTop: 30, gap: 8 },
  menuGroupCompact: { marginTop: 12, gap: 8 },
  menuItem: { minHeight: 45, borderWidth: 2, borderColor: '#DDDDDD', borderRadius: 6, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 16, shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  premiumItem: { borderColor: '#05C925', backgroundColor: '#F4FFF8' },
  menuText: { flex: 1, color: '#555555', fontSize: 12, fontWeight: '500' },
  sectionCard: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E8E8E8', padding: 14 },
  sectionTitle: { color: '#05C925', fontSize: 17, fontWeight: '900', marginBottom: 10 },
  sectionHint: { color: '#666', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  currentRankRow: { backgroundColor: '#F4FFF8', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8 },
  rankNumber: { width: 24, color: '#05C925', fontWeight: '900' },
  rankName: { color: '#333', fontWeight: '800' },
  rankMeta: { color: '#777', fontSize: 11, marginTop: 1 },
  rankXp: { color: '#333', fontSize: 12, fontWeight: '900' },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  friendAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E9FBEF', alignItems: 'center', justifyContent: 'center' },
  friendInitial: { color: '#05C925', fontWeight: '900' },
  friendName: { flex: 1, color: '#333', fontWeight: '800' },
  hiddenOptions: { gap: 8 },
  logoutTextButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 4 },
  logoutText: { color: '#777777', fontSize: 12, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
});

