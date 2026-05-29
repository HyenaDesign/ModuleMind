import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppMessage from '../../components/AppMessage';
import CustomTabBar from '../../components/CustomTabBar';
import { useLanguage } from '../../hooks/use-language';

type Subject = {
  id: number;
  title: string;
  description: string | null;
};

type Module = {
  id: number;
  subject_id: number;
  title: string;
  description: string | null;
};

type SearchItem =
  | { type: 'subject'; id: number; title: string; description: string | null }
  | { type: 'module'; id: number; subjectId: number; subjectTitle: string; title: string; description: string | null };

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadSearchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id || user?.user_id;

      if (!userId) {
        router.replace('/signin');
        return;
      }

      const subjectsResponse = await fetch(`https://modulemindapi-production.up.railway.app/subjects/${userId}`);
      const subjectsData = await subjectsResponse.json();
      const subjects: Subject[] = Array.isArray(subjectsData) ? subjectsData : [];

      const modulesBySubject = await Promise.all(
        subjects.map(async (subject) => {
          try {
            const response = await fetch(`https://modulemindapi-production.up.railway.app/modules/${subject.id}`);
            const data = await response.json();
            const modules: Module[] = Array.isArray(data) ? data : [];
            return modules.map((module) => ({
              type: 'module' as const,
              id: module.id,
              subjectId: subject.id,
              subjectTitle: subject.title,
              title: module.title,
              description: module.description,
            }));
          } catch {
            return [];
          }
        })
      );

      setItems([
        ...subjects.map((subject) => ({
          type: 'subject' as const,
          id: subject.id,
          title: subject.title,
          description: subject.description,
        })),
        ...modulesBySubject.flat(),
      ]);
    } catch {
      setMessage(t('noInternet'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      loadSearchData();
    }, [loadSearchData])
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const haystack = [
        item.title,
        item.description,
        item.type === 'module' ? item.subjectTitle : '',
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, query]);

  const openItem = (item: SearchItem) => {
    if (item.type === 'subject') {
      router.push({ pathname: '/Modules', params: { subjectId: item.id, subjectTitle: item.title } });
      return;
    }

    router.push({
      pathname: '/quiz',
      params: {
        moduleId: item.id,
        subjectId: item.subjectId,
        subjectTitle: item.subjectTitle,
        moduleTitle: item.title,
      },
    });
  };

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
          <Text style={styles.headerText}>{t('search')}</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={21} color="#555" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="#999"
          />
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
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={(
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={42} color="#05C925" />
                <Text style={styles.emptyTitle}>{query ? t('searchEmpty') : t('searchHint')}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultCard} activeOpacity={0.85} onPress={() => openItem(item)}>
                <View style={styles.resultIcon}>
                  <Ionicons name={item.type === 'subject' ? 'folder-outline' : 'book-outline'} size={24} color="#05C925" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultType}>{item.type === 'subject' ? t('subject') : `${t('module')} - ${item.subjectTitle}`}</Text>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultDescription} numberOfLines={1}>{item.description || t('noDescription')}</Text>
                </View>
                <Ionicons name="arrow-forward" size={22} color="#444" />
              </TouchableOpacity>
            )}
          />
        )}

        <CustomTabBar activeTab="Search" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  whiteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  gradient: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1 },
  header: { marginTop: 20, padding: 20, zIndex: 10 },
  headerText: { fontSize: 28, fontWeight: '800', color: '#05C925' },
  searchBox: {
    marginHorizontal: 20,
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  messageWrap: { paddingHorizontal: 20, marginTop: 12 },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { marginTop: 12, color: '#555', fontWeight: '700', textAlign: 'center' },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    minHeight: 82,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultType: { color: '#05C925', fontSize: 12, fontWeight: '800' },
  resultTitle: { color: '#333', fontSize: 16, fontWeight: '800', marginTop: 2 },
  resultDescription: { color: '#666', fontSize: 13, marginTop: 2 },
});
