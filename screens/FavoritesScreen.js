import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../components/Typography';
import { useTheme } from '../styles/ThemeContext';
import { getFavorites, removeFavorite } from '../utils/favorites';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { openProductDetail } from '../utils/navigationRef';

export default function FavoritesScreen({ navigation }) {
  const { theme } = useTheme();
  const [list, setList] = useState([]);

  const load = async () => {
    const l = await getFavorites();
    setList(l);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handleRemove = async (id) => {
    await removeFavorite(id);
    load();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }] }>
        <Typography variant="h2" style={[styles.headerTitle, { color: theme.colors.text }]}>Favoritter</Typography>
      </View>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.colors.surface }] }>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openProductDetail(navigation, item)}>
              <Typography variant="small">{item.name}</Typography>
              <Typography variant="small" muted>{item.category}</Typography>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.delete}>
              <Ionicons name="trash" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Typography muted style={{ marginTop: 20 }}>Ingen favoritter endnu</Typography>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
  },
  headerTitle: {
    textAlign: 'center',
  },
  item: { flexDirection: 'row', padding: 12, borderRadius: 8, marginHorizontal: 12, marginBottom: 10, alignItems: 'center', backgroundColor: '#fff' },
  delete: { padding: 8 }
});
