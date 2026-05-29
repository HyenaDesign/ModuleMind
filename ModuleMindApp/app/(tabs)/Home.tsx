import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../../components/CustomTabBar';
import AppMessage from '../../components/AppMessage';
import { useLanguage } from '../../hooks/use-language';

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
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const userData = await AsyncStorage.getItem('user');
      
      if (!userData) {
        setSubjects([]);
        router.replace('/signin');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user.user_id;
      if (!userId) {
        setSubjects([]);
        router.replace('/signin');
        return;
      }

      const response = await fetch(`https://modulemindapi-production.up.railway.app/subjects/${userId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        setMessage(data.message || t('somethingWentWrong'));
        setSubjects([]);
      }
    } catch {
      setMessage(t('noInternet'));
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [fetchSubjects])
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
          <Text style={styles.headerText}>{t('subjects')}</Text>
          <TouchableOpacity onPress={() => router.push('/create_subject')}>
            <Text style={styles.headerIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {message && (
          <View style={styles.messageWrap}>
            <AppMessage tone="warning" title={t('internetWarning')} message={message} />
          </View>
        )}

        {loading ? (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#05C925" />
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.contentContainer}>
            <Image source={require('../../assets/images/tab_inactive.png')} style={styles.contentImage} />
            <Text style={styles.contentTitle}>{t('noSubjects')}</Text>
            <Text style={styles.contentText}>{t('createFirstSubject')}</Text> 
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
          {item.description || t('noDescription')}
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
  messageWrap: {
    paddingHorizontal: 20,
    marginBottom: 8,
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
