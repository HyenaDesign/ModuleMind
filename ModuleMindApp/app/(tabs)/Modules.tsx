import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../../components/CustomTabBar';

// Define the interface for Modules
interface Module {
  id: number;
  subject_id: number;
  title: string;
  description: string | null;
  questions?: unknown;
}

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const getCachedModule = async (module: Module) => {
  const cachedById = await AsyncStorage.getItem(`moduleQuestionsById:${module.id}`);
  const cachedByTitle = await AsyncStorage.getItem(
    `moduleQuestions:${module.subject_id}:${module.title.trim().toLowerCase()}`
  );
  const cachedModule = cachedById || cachedByTitle;

  if (!cachedModule) return module;

  try {
    return {
      ...module,
      ...JSON.parse(cachedModule),
      id: module.id,
      subject_id: module.subject_id,
      title: module.title,
      description: module.description,
    };
  } catch {
    return module;
  }
};

export default function ModulesScreen() {
  const router = useRouter();
  // 1. Get the subject info passed from the Home screen
  const { subjectId, subjectTitle } = useLocalSearchParams();
  const selectedSubjectTitle = getParam(subjectTitle);
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      
      // 2. Fetch modules specifically for THIS subject
      const response = await fetch(`https://modulemindapi-production.up.railway.app/modules/${subjectId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const hydratedModules = await Promise.all(data.map(getCachedModule));
        setModules(hydratedModules);
      } else {
        console.error("Backend Error:", data.message);
        setModules([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useFocusEffect(
    useCallback(() => {
      if (subjectId) {
        fetchModules();
      } else {
        setModules([]);
        setLoading(false);
      }
    }, [fetchModules, subjectId])
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
          <View>
            <Text style={styles.headerText}>{subjectTitle || 'Modules'}</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/create_module',
              params: {
                subjectId,
                subjectTitle,
              },
            })}
          >
            <Text style={styles.headerIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#05C925" />
          </View>
        ) : modules.length === 0 ? (
          <View style={styles.contentContainer}>
            <Image source={require('../../assets/images/tab_inactive.png')} style={styles.contentImage} />
            <Text style={styles.contentTitle}>Nog geen modules</Text>
            <Text style={styles.contentText}>Maak nu de eerste module voor dit vak aan</Text> 
          </View>
        ) : (
          <FlatList
            data={modules}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.moduleCard}
                onPress={async () => {
                  await AsyncStorage.setItem('selectedModule', JSON.stringify({
                    ...item,
                    subjectTitle: selectedSubjectTitle,
                  }));
                  router.push({
                    pathname: '/quiz',
                    params: {
                      moduleId: item.id,
                      moduleTitle: item.title,
                      subjectId: item.subject_id,
                      subjectTitle: selectedSubjectTitle,
                    },
                  });
                }}
              >
                <View style={styles.moduleIconPlaceholder}>
                  <Text style={styles.moduleEmoji}>🧩</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitleText}>{item.title}</Text>
                  <Text style={styles.moduleSubText} numberOfLines={1}>
                    {item.description || "Geen beschrijving beschikbaar"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        <CustomTabBar activeTab="Modules" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  whiteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  gradient: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1 },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backText: { color: '#666', fontSize: 14, marginBottom: 5 },
  headerText: { fontSize: 28, fontWeight: 'bold', color: '#05C925' },
  headerIcon: { fontSize: 34, fontWeight: 'bold', color: '#05C925' },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentTitle: { fontSize: 20, color: '#05C925', fontWeight: '600' },
  contentText: { fontSize: 16, color: '#333', textAlign: 'center', paddingHorizontal: 40 },
  contentImage: { width: 100, height: 100, marginBottom: 10 },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  moduleCard: {
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
  moduleIconPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#F0FFF0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  moduleEmoji: { fontSize: 24 },
  moduleTitleText: { fontSize: 18, fontWeight: '700', color: '#333' },
  moduleSubText: { fontSize: 14, color: '#666' }
});
