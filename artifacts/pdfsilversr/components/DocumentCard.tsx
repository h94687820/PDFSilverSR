import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DocumentRecord } from '@/types/library';
import { useColors } from '@/hooks/useColors';

export function DocumentCard({ document, onPress }: { document: DocumentRecord; onPress: () => void }) {
  const colors = useColors();
  const date = new Date(document.lastOpenedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${document.name}`} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}>
      <View style={[styles.thumbnail, { backgroundColor: colors.accent }]}>
        <Feather name={document.pages[0]?.kind === 'image' ? 'image' : 'file-text'} size={22} color={colors.accentForeground} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>{document.name}</Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>{document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'} · Opened {date}</Text>
      </View>
      <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 76 },
  thumbnail: { width: 48, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 5 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
});