import AsyncStorage from '@react-native-async-storage/async-storage';

export const FREE_MODULE_LIMIT = 5;

export type StoredUser = {
  id?: number;
  user_id?: number;
  admin_id?: string;
  teacher_id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
  status?: 'free' | 'premium';
  premium?: boolean;
  premiumPlan?: 'monthly' | 'yearly';
  authProvider?: 'email' | 'facebook' | 'google' | 'twitter' | 'microsoft';
  facebookFriends?: { id: string; name: string; xp?: number; level?: number }[];
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

export const TEACHER_ACCESS_IDS = ['MODULEMIND-TEACHER', 'LEERKRACHT-001', 'ADMIN-001'];

export const normalizeTeacherAccessId = (value: string | null | undefined) => value?.trim().toUpperCase() || '';

export const isTeacherAccessId = (value: string | null | undefined) => {
  const normalizedValue = normalizeTeacherAccessId(value);
  return Boolean(normalizedValue && TEACHER_ACCESS_IDS.includes(normalizedValue));
};

export const isTeacherUser = (user: StoredUser | null | undefined) => {
  return Boolean(
    user?.role === 'teacher'
    || user?.role === 'admin'
    || isTeacherAccessId(user?.teacher_id)
    || isTeacherAccessId(user?.admin_id)
  );
};

