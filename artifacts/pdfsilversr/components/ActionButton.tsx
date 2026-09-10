import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface ActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'neutral' | 'danger';
  compact?: boolean;
}

export function ActionButton({ icon, label, onPress, tone = 'neutral', compact = false }: ActionButtonProps) {
  const colors = useColors();
  const palette = tone === 'primary'
    ? { backgroundColor: colors.primary, foreground: colors.primaryForeground }
    : tone === 'danger'
      ? { backgroundColor: colors.destructive, foreground: colors.destructiveForeground }
      : { backgroundColor: colors.card, foreground: colors.foreground };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: palette.backgroundColor, borderColor: tone === 'neutral' ? colors.border : palette.backgroundColor, opacity: pressed ? 0.76 : 1 },
      ]}
    >
      <Feather name={icon} size={compact ? 17 : 18} color={palette.foreground} />
      {!compact && <Text style={[styles.label, { color: palette.foreground }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 46, paddingHorizontal: 15, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  compact: { width: 46, paddingHorizontal: 0 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});