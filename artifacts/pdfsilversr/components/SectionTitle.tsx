import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 15, letterSpacing: 0.2 },
});