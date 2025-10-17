import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Typography from '../components/Typography';
import { useTheme } from '../styles/ThemeContext';
import { getHistory, removeScan, clearHistory } from '../utils/history';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [list, setList] = useState([]);

  const load = async () => {
    const h = await getHistory();
    setList(h);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = (id) => {
    Alert.alert('Slet scan', 'Vil du slette denne scan fra historikken?', [
      { text: 'Annuller', style: 'cancel' },
      { text: 'Slet', style: 'destructive', onPress: async () => { await removeScan(id); load(); } }
    ]);
  };

  const handleClear = () => {
    Alert.alert('Ryd historik', 'Er du sikker på du vil tømme hele historikken?', [
      { text: 'Annuller', style: 'cancel' },
      { text: 'Tøm', style: 'destructive', onPress: async () => { await clearHistory(); load(); } }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Typography variant="h2">Scanhistorik</Typography>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Typography variant="small" style={{ color: theme.colors.primary }}>Tøm</Typography>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.colors.surface }] }>
            <View style={{ flex: 1 }}>
              <Typography variant="small">{item.name || item.barcode || 'Ukendt'}</Typography>
              <Typography variant="small" muted>{item.category || (item.found === false ? 'Ikke fundet' : '')}</Typography>
              <Typography variant="small" muted>{new Date(item.timestamp).toLocaleString()}</Typography>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.delete}>
              <Ionicons name="trash" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Typography muted style={{ textAlign: 'center', marginTop: 20 }}>Ingen scanhistorik</Typography>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearButton: { padding: 8 },
  item: { flexDirection: 'row', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  delete: { padding: 8 },
});
