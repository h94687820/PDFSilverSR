import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { IconTone, ThemeMode } from '@/types/library';

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.choiceText, { color: active ? colors.primaryForeground : colors.secondaryForeground }]}>{label}</Text>{active && <Feather name="check" size={15} color={colors.primaryForeground} />}</Pressable>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, setTheme, setIconTone, deleteAllData } = useApp();
  const confirmDelete = () => Alert.alert('Delete local data?', 'This removes imported documents, notebook pages, and saved preferences from this device. It cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete everything', style: 'destructive', onPress: () => deleteAllData() }]);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 14 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View style={styles.brand}><AppIcon size={38} /><View><Text style={[styles.eyebrow, { color: colors.primary }]}>PDFSILVERSR</Text><Text style={[styles.title, { color: colors.foreground }]}>Settings</Text></View></View></View>
        <View style={[styles.localCard, { backgroundColor: colors.navy }]}><Feather name="shield" size={20} color={colors.silver} /><View style={styles.copy}><Text style={styles.localTitle}>Private by design</Text><Text style={styles.localText}>No accounts, sync, analytics, or document uploads.</Text></View></View>
        <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Appearance</Text><Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>Choose how PDFSilverSR looks on this device.</Text><View style={styles.choices}>{(['system', 'light', 'dark'] as ThemeMode[]).map((theme) => <Choice key={theme} label={theme[0].toUpperCase() + theme.slice(1)} active={settings.theme === theme} onPress={() => setTheme(theme)} />)}</View></View>
        <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Icon color</Text><View style={styles.choices}>{(['amber', 'blue', 'sage'] as IconTone[]).map((tone) => <Choice key={tone} label={tone[0].toUpperCase() + tone.slice(1)} active={settings.iconTone === tone} onPress={() => setIconTone(tone)} />)}</View></View>
        <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Data & terms</Text><Pressable onPress={confirmDelete} style={({ pressed }) => [styles.row, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.rowIcon, { backgroundColor: '#F8E5E5' }]}><Feather name="trash-2" size={17} color={colors.destructive} /></View><View style={styles.copy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>Delete local data</Text><Text style={[styles.rowText, { color: colors.mutedForeground }]}>Remove all documents and notes</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable><Pressable onPress={() => router.push('/terms')} style={({ pressed }) => [styles.row, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.rowIcon, { backgroundColor: colors.accent }]}><Feather name="file-text" size={17} color={colors.accentForeground} /></View><View style={styles.copy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>Terms & conditions</Text><Text style={[styles.rowText, { color: colors.mutedForeground }]}>Read how the app works</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable></View>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>PDFSilverSR · Offline edition · v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  header: { flexDirection: 'row', alignItems: 'center' },
  brand: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  eyebrow: { fontFamily: 'Inter_700Bold', letterSpacing: 1.7, fontSize: 10, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.5 },
  localCard: { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  localTitle: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 4 },
  localText: { color: '#B7C2D0', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  copy: { flex: 1 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  sectionCaption: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: -4 },
  choices: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  choice: { borderWidth: 1, minHeight: 40, borderRadius: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  choiceText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  row: { minHeight: 70, borderWidth: 1, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  rowText: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  version: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
});