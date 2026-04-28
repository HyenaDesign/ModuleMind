import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../../components/CustomTabBar';

// Define the interface outside the component
interface Subject {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  created_at?: string;
}

export default function WhiteHeaderPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DEVELOPER BYPASS: Auto-login for testing ---
  useEffect(() => {
    const checkUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        // Manually setting user 1 so the app doesn't get stuck
        await AsyncStorage.setItem('user', JSON.stringify({ id: 1, name: 'Admin' }));
        console.log("Logged in as User 1 (Bypass)");
        fetchSubjects();
      }
    };
    checkUser();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      
      if (!userData) {
        setSubjects([]);
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`http://192.168.0.254:3000/subjects/${user.id}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        console.error("Backend Error:", data.message);
        setSubjects([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

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
          <Text style={styles.headerText}>Vakken</Text>
          <TouchableOpacity onPress={() => router.push('/create_subject')}>
            <Text style={styles.headerIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#05C925" />
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.contentContainer}>
            <Image source={require('../../assets/images/tab_inactive.png')} style={styles.contentImage} />
            <Text style={styles.contentTitle}>Nog geen vakken</Text>
            <Text style={styles.contentText}>Maak nu uw eerste vak aan</Text> 
          </View>
        ) : (
          <FlatList
  data={subjects}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={styles.listContainer}
  renderItem={({ item }) => (
    <TouchableOpacity 
      style={styles.subjectCard} 
      onPress={() => router.push({
        pathname: '/Modules', // Path to your modules file
        params: { 
          subjectId: item.id, 
          subjectTitle: item.title 
        }
      })}
    >
      <View style={styles.subjectIconPlaceholder}>
        <Text style={styles.subjectEmoji}>📚</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.subjectTitleText}>{item.title}</Text>
        <Text style={styles.subjectSubText} numberOfLines={1}>
          {item.description || "Geen beschrijving"}
        </Text>
      </View>
    </TouchableOpacity>
  )}
/>
        )}
        <CustomTabBar activeTab="Home" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#05C925',
  },
  headerIcon: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#05C925',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 20,
    color: '#05C925',
    fontWeight: '600',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
  },
  contentImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  subjectCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectIconPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#F0FFF0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  subjectEmoji: {
    fontSize: 24,
  },
  subjectTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  subjectSubText: {
    fontSize: 14,
    color: '#666',
  }
});