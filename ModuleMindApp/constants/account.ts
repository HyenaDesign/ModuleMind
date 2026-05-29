import AsyncStorage from '@react-native-async-storage/async-storage';

export const FREE_MODULE_LIMIT = 5;

export type StoredUser = {
  id?: number;
  user_id?: number;
  name?: string;
  full_name?: string;
  email?: string;
  status?: 'free' | 'premium';
  premium?: boolean;
  premiumPlan?: 'monthly' | 'yearly';
  language?: string;
  passwordUpdatedAt?: string;
};

export const getStoredUser = async (): Promise<StoredUser | null> => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const saveStoredUser = async (updates: Partial<StoredUser>) => {
  const currentUser = await getStoredUser();
  const nextUser = {
    ...(currentUser || {}),
    ...updates,
  };

  await AsyncStorage.setItem('user', JSON.stringify(nextUser));
  return nextUser;
};

export const isPremiumUser = (user: StoredUser | null | undefined) => {
  return Boolean(user?.premium || user?.status === 'premium');
};
