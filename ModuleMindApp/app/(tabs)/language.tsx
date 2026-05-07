import React, {useState, useCallback} from "react";
import { StyleSheet, View, SafeAreaView, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomTabBar from '../../components/CustomTabBar';

const LanguageScreen = () => {
    const router = useRouter();
    const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const languages = [
  { key: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { key: 'en', label: 'Engels', flag: '🇬🇧' },
  { key: 'fr', label: 'Frans', flag: '🇫🇷' },
  { key: 'de', label: 'Duits', flag: '🇩🇪' },
];
const [selectedLanguage, setSelectedLanguage] = useState('nl');

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

    return (
        <ImageBackground
              source={require('../../assets/images/background.jpg')}
              style={styles.background}
              resizeMode="cover"
            >
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
                <Text style={styles.headerText}>Taal configureren</Text>
            </View>
            <View style={styles.menuGroup}>
  {languages.map((lang) => {
    const isActive = selectedLanguage === lang.key;

    return (
      <TouchableOpacity
        key={lang.key}
        style={[
          styles.menuItem,
          isActive && styles.activeItem
        ]}
        activeOpacity={0.8}
        onPress={() => setSelectedLanguage(lang.key)}
      >
        <Text style={styles.flag}>{lang.flag}</Text>

        <Text
          style={[
            styles.menuText,
            isActive && styles.activeText
          ]}
        >
          {lang.label}
        </Text>

        <Ionicons
          name="arrow-forward"
          size={20}
          color={isActive ? '#05C925' : '#999999'}
        />
      </TouchableOpacity>
    );
  })}
</View>
            <CustomTabBar />
        </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    whiteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
    gradient: { ...StyleSheet.absoluteFillObject },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
    marginTop: 42,
    paddingHorizontal: 20,
    paddingBottom: 14,
    marginBottom: 20,
    },
     headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#05C925',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    menuGroup: {
        marginBottom: 30,
        alignItems: 'center',
        gap: 10,
    },
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
    menuText: {
        flex: 1,
        fontSize: 18,
        marginLeft: 15,
    },
    infoText: {
        fontSize: 18,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeItem: {
    backgroundColor: '#E9FBEF',
    borderColor: '#05C925',
    },

    activeText: {
    color: '#05C925',
    fontWeight: '600',
    },
    flag: {
    fontSize: 20,
    },
});

export default LanguageScreen;