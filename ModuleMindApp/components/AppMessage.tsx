import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AppMessageProps = {
  message: string;
  title?: string;
  tone?: 'error' | 'warning' | 'success';
  compact?: boolean;
};

const TONES = {
  error: {
    backgroundColor: '#FFF1F1',
    borderColor: '#FF5F5F',
    color: '#D93232',
    icon: 'alert-circle-outline',
  },
  warning: {
    backgroundColor: '#FFF4D6',
    borderColor: '#FFA000',
    color: '#FF9900',
    icon: 'warning-outline',
  },
  success: {
    backgroundColor: '#E9FBEF',
    borderColor: '#05C925',
    color: '#05C925',
    icon: 'checkmark-circle-outline',
  },
} as const;

export default function AppMessage({ message, title, tone = 'error', compact = false }: AppMessageProps) {
  const colors = TONES[tone];

  return (
    <View
      style={[
        styles.message,
        compact ? styles.compact : styles.regular,
        { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor },
      ]}
    >
      <Ionicons name={colors.icon} size={compact ? 16 : 20} color={colors.color} />
      <View style={{ flex: 1 }}>
        {title && <Text style={[styles.title, { color: colors.color }]}>{title}</Text>}
        <Text style={[styles.text, compact && styles.compactText, { color: colors.color }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  regular: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  compact: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
