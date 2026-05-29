import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getStoredLanguage, LanguageKey, translate } from '../constants/language';

export const useLanguage = () => {
  const [language, setLanguage] = useState<LanguageKey>('nl');

  useFocusEffect(
    useCallback(() => {
      getStoredLanguage().then(setLanguage);
    }, [])
  );

  return {
    language,
    setLanguage,
    t: useCallback((key: Parameters<typeof translate>[1]) => translate(language, key), [language]),
  };
};
