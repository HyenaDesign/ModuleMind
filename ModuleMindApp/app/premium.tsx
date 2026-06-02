import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';
import AppMessage from '../components/AppMessage';
import { getStoredUser, saveStoredUser } from '../constants/account';
import { getStoredLanguage, LanguageKey, translate } from '../constants/language';

type Plan = 'monthly' | 'yearly';

export default function PremiumScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageKey>('nl');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLanguage(await getStoredLanguage());
        const user = await getStoredUser();
        if (user?.premiumPlan === 'yearly') setSelectedPlan('yearly');
      };
      load();
    }, [])
  );

  const handleContinue = async () => {
    setSaving(true);
    try {
      await saveStoredUser({
        premium: true,
        status: 'premium',
        premiumPlan: selectedPlan,
      });
      setMessage(t('premiumSaved'));
      router.replace('/(tabs)/Profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF', '#F2FFD7']} locations={[0, 0.76, 1]} style={styles.background}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('premiumTitle')}</Text>
          <Text style={styles.description}>
            Onbeperkte AI-oefeningen, persoonlijke feedback en diepgaande analyse om slimmer en sneller te studeren.
          </Text>

          {message && <AppMessage tone="success" message={message} />}

          <View style={styles.featuresGrid}>
            <View style={styles.featurePill}>
              <Ionicons name="infinite-outline" size={20} color="#444" />
              <Text style={styles.featureText}>Onbeperkt</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="sync-outline" size={20} color="#444" />
              <Text style={styles.featureText}>Prioritaire updates</Text>
            </View>
            <View style={styles.featurePill}>
              <MaterialCommunityIcons name="comment-quote-outline" size={20} color="#444" />
              <Text style={styles.featureText}>Personal feedback</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="bar-chart-outline" size={20} color="#444" />
              <Text style={styles.featureText}>Studieanalyses</Text>
            </View>
          </View>

          <View style={styles.planGroup}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioActive]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planPrice}>9 EUR/maand</Text>
                <Text style={styles.planSub}>Standaard keuze</Text>
              </View>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAIR</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioActive]}>
                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planPrice}>108 EUR/jaar</Text>
                <Text style={styles.planSub}>Beste keuze</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>30% OFF</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.continueText}>{t('continue')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <CustomTabBar activeTab="Profile" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  content: { flexGrow: 1, padding: 22, paddingTop: 58, paddingBottom: 120 },
  title: { color: '#05C925', fontSize: 22, fontWeight: '900', lineHeight: 28, maxWidth: 240 },
  description: { marginTop: 16, color: '#444', fontSize: 12, lineHeight: 16, maxWidth: 280 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  featurePill: {
    width: '48%',
    minHeight: 35,
    borderWidth: 1,
    borderColor: '#05C925',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
    backgroundColor: '#F7FFF9',
  },
  featureText: { flex: 1, color: '#555', fontSize: 12, fontWeight: '600' },
  planGroup: { marginTop: 58, gap: 14 },
  planCard: {
    minHeight: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  selectedPlan: { borderColor: '#05C925', backgroundColor: '#F7FFF9' },
  radio: { width: 15, height: 15, borderRadius: 8, borderWidth: 3, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#05C925' },
  radioInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#05C925' },
  planPrice: { color: '#333', fontSize: 16, fontWeight: '800' },
  planSub: { color: '#666', fontSize: 12, marginTop: 2 },
  popularBadge: { position: 'absolute', right: 0, top: 0, backgroundColor: '#05C925', paddingHorizontal: 14, paddingVertical: 10, borderBottomLeftRadius: 6 },
  popularText: { color: '#111', fontSize: 11, fontWeight: '900' },
  discountBadge: { position: 'absolute', right: 0, top: 0, backgroundColor: '#E6E6E6', paddingHorizontal: 18, paddingVertical: 10, borderBottomLeftRadius: 6 },
  discountText: { color: '#444', fontSize: 11, fontWeight: '900' },
  spacer: { flex: 1, minHeight: 120 },
  continueButton: { alignSelf: 'flex-end', width: 132, height: 54, borderRadius: 6, backgroundColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  continueText: { color: '#FFF', fontWeight: '800' },
});
