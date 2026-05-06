import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../../components/CustomTabBar';

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
    try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            console.log("No token found, redirecting to login...");
            router.replace('/signin');
            return;
        }
        const response = await fetch('https://modulemindapi-production.up.railway.app/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.status === 200) {
            setUserData(data);
        } else {
            console.error("Failed to fetch profile:", data.message);
            Alert.alert("Fout", "Kan gebruikersgegevens niet ophalen. Probeer opnieuw in te loggen.");
            router.replace('/signin');
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Netwerkfout", "Kan geen verbinding maken met de server.");
    } finally {
        setLoading(false);
    }
};

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

    if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

    return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
        resizeMode="cover"
    >
      <View style={styles.whiteOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.profileContainer}>
          <Image source={require('../../assets/images/profile-placeholder.png')} style={styles.profileImage} />
          <Text style={styles.name}>{userData?.name || "Naam niet beschikbaar"}</Text>
            <Text style={styles.email}>{userData?.email || "Email niet beschikbaar"}</Text>
        </View>
      </SafeAreaView>
      <CustomTabBar />
    </ImageBackground>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    },
    whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    },
    profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    },
    profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    },
    name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    },
    email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    },
});