import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Alert, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { getCurrentUser, logoutUser } from '../utils/auth';
import brandLogos from '../data/brandLogos';

const SKIN_KEY = 'SC_PROFILE_SKIN';
const ALLERGY_KEY = 'SC_PROFILE_ALLERGIES';
const BRAND_KEY = 'SC_PROFILE_BRAND';

const SKIN_TYPES = ['Normal', 'Tør', 'Fedt', 'Kombineret', 'Følsom'];
const ALLERGIES = ['Parfume', 'Parabener', 'Sulfater', 'Lanolin', 'Nikkel'];

export default function ProfileScreen({ navigation }) {
  const { theme, mode, toggleTheme } = useTheme();
  const styles = makeLocalStyles(theme);

  const [user, setUser] = useState(null);
  const [skin, setSkin] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);

      try {
        const s = await AsyncStorage.getItem(SKIN_KEY);
        const a = await AsyncStorage.getItem(ALLERGY_KEY);
        const b = await AsyncStorage.getItem(BRAND_KEY);
        if (s) setSkin(s);
        if (a) setAllergies(JSON.parse(a));
        if (b) setBrand(b);
      } catch (err) {
        console.warn('Failed loading profile prefs', err);
      }
    })();
  }, []);

  const toggleAllergy = (item) => {
    setAllergies(prev => {
      if (prev.includes(item)) return prev.filter(x => x !== item);
      return [...prev, item];
    });
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(SKIN_KEY, skin || '');
      await AsyncStorage.setItem(ALLERGY_KEY, JSON.stringify(allergies || []));
      await AsyncStorage.setItem(BRAND_KEY, brand || '');
      Alert.alert('Gemte indstillinger', 'Dine præferencer er gemt');
    } catch (err) {
      console.error('Save profile prefs failed', err);
      Alert.alert('Fejl', 'Kunne ikke gemme præferencer');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log ud', 'Er du sikker?', [
      { text: 'Annuller', style: 'cancel' },
      { text: 'Log ud', style: 'destructive', onPress: async () => { await logoutUser(); } }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Typography variant="h2" style={styles.headerTitle}>Profil</Typography>
      </View>
      <ScrollView contentContainerStyle={styles.container}>

      {user ? (
        <View style={{ width: '100%', marginTop: 18 }}>
          <Typography variant="body" weight="600">{user.name}</Typography>
          <Typography variant="small" muted style={{ marginTop: 6 }}>{user.email}</Typography>

          <View style={styles.section}>
            <Typography variant="h3">Hudtype</Typography>
            <View style={styles.row}>
              {SKIN_TYPES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSkin(s)}
                  style={[styles.chip, skin === s && { backgroundColor: theme.colors.primary }]}
                >
                  <Typography variant="small" style={skin === s ? { color: '#fff' } : {}}>{s}</Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="h3">Allergier</Typography>
            <View style={styles.rowWrap}>
              {ALLERGIES.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => toggleAllergy(a)}
                  style={[styles.checkbox, allergies.includes(a) && { borderColor: theme.colors.primary, backgroundColor: allergies.includes(a) ? 'rgba(31,190,149,0.12)' : 'transparent' }]}
                >
                  <Typography variant="small">{a}</Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="h3">Yndlingsbrand</Typography>
            <View style={styles.brandRow}>
              {Object.keys(brandLogos).map((b) => (
                <TouchableOpacity key={b} onPress={() => setBrand(b)} style={[styles.brandItem, brand === b && { borderColor: theme.colors.primary }]}> 
                  <Image source={brandLogos[b]} style={styles.brandImage} resizeMode="contain" />
                  <Typography variant="small" style={{ marginTop: 6 }}>{b}</Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={savePreferences} style={[styles.button, { backgroundColor: theme.colors.primary }]}> 
              <Typography variant="small" weight="600" style={{ color: '#fff' }}>Gem</Typography>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={[styles.button, { backgroundColor: '#eee' }]}> 
              <Typography variant="small" weight="600">Log ud</Typography>
            </TouchableOpacity>
          </View>
            <View style={{ height: 16 }} />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Toggle dark mode"
              onPress={toggleTheme}
              style={styles.toggleButton}
            >
              <Typography variant="small" weight="500" style={{ color: theme.colors.text }}>
                {mode === 'light' ? 'Skift til mørk tilstand' : 'Skift til lys tilstand'}
              </Typography>
            </TouchableOpacity>
        </View>
      ) : (
        <Typography variant="body" muted style={{ marginTop: 24 }}>Ingen bruger logget ind</Typography>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeLocalStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    textAlign: 'center',
    color: theme.colors.text,
  },
  container: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'flex-start',
  },
  section: {
    marginTop: 20,
    width: '100%'
  },
  row: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  rowWrap: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f4f4f4'
  },
  checkbox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
    marginBottom: 8
  },
  brandRow: { flexDirection: 'row', marginTop: 12, gap: 12 },
  brandItem: { alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  brandImage: { width: 48, height: 32 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }
  ,
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
  }
});

