import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getStoredLanguage, LanguageKey, translate } from '../constants/language';

export const useLanguage = () => {
  const [language, setLanguage] = useState<LanguageKey>('nl');

  const updateLanguage = useCallback(async () => {
    const stored = await getStoredLanguage();
    setLanguage(stored);
  }, []);

  // Sync on mount and focus
  useFocusEffect(
    useCallback(() => {
      updateLanguage();
    }, [updateLanguage])
  );

  return {
    language,
    setLanguage,
    t: useCallback((key: Parameters<typeof translate>[1]) => translate(language, key), [language]),
  };
};
