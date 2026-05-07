import React, { useState, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomTabBar from '../../components/CustomTabBar';

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
        setLoading(true);
        const user = await AsyncStorage.getItem('user');
        if (!user) {
            console.log("No user found, redirecting to login...");
            router.replace('/signin');
            return;
        }

        const data = JSON.parse(user);
        if (data?.name || data?.full_name || data?.email) {
            setUserData({
                name: data.name || data.full_name || 'Naam niet beschikbaar',
                email: data.email || 'Email niet beschikbaar',
            });
        } else {
            console.error("Stored user data is incomplete:", data);
            Alert.alert("Fout", "Kan gebruikersgegevens niet ophalen.");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Netwerkfout", "Kan geen verbinding maken met de server.");
    } finally {
        setLoading(false);
    }
  }, [router]);

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
          <Text style={styles.headerText}>Profiel</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Image source={require('../../assets/images/profile-placeholder.png')} style={styles.profileImage} />
            <Text style={styles.name}>{userData?.name || 'Naam niet beschikbaar'}</Text>
            <Text style={styles.email}>{userData?.email || 'Email niet beschikbaar'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>!</Text>
              <Text style={styles.badgeText}>Gratis gebruiker</Text>
            </View>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
              <Text style={styles.editButtonText}>Bewerk profiel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuGroup}>
            <TouchableOpacity style={[styles.menuItem, styles.premiumItem]} activeOpacity={0.8}>
              <MaterialCommunityIcons name="diamond-stone" size={20} color="#444444" />
              <Text style={styles.menuText}>Wordt premium student</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <Ionicons name="bar-chart-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>Scores bekijken</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/language')}>
              <Ionicons name="language-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>Taal configureren</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#555555" />
              <Text style={styles.menuText}>Accountbeveiliging</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} activeOpacity={0.8} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#444444" />
              <Text style={styles.menuText}>Log uit</Text>
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
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
