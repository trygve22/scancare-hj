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
const FOCUS_KEY = 'SC_PROFILE_FOCUS_AREAS';

// Din hudtype (vælg én)
const SKIN_TYPES = ['Tør', 'Fedtet', 'Kombineret', 'Sensitiv', 'Normal'];

// Ingrediens-hensyn (vælg flere)
const INGREDIENT_OPTIONS = [
  'Parfume',
  'Alkohol',
  'Æteriske olier',
  'Parabener',
  'Ingen præference / i tvivl',
];

const NO_INGREDIENT_PREFERENCE = 'Ingen præference / i tvivl';

// Fokusområder (vælg op til 2)
const FOCUS_OPTIONS = [
  'Mere fugt',
  'Akne',
  'Rødme / irritation',
  'Anti-age',
  'Ujævn hudtone',
];

export default function ProfileScreen({ navigation }) {
  const { theme, mode, toggleTheme } = useTheme();
  const styles = makeLocalStyles(theme);

  const [user, setUser] = useState(null);
  const [skin, setSkin] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [brand, setBrand] = useState(null);
  const [focusAreas, setFocusAreas] = useState([]);
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (mounted) setUser(u);

        const s = await AsyncStorage.getItem(SKIN_KEY);
        const a = await AsyncStorage.getItem(ALLERGY_KEY);
        const b = await AsyncStorage.getItem(BRAND_KEY);
        const f = await AsyncStorage.getItem(FOCUS_KEY);
        if (!mounted) return;
        if (s) setSkin(s);
        if (a) setAllergies(JSON.parse(a));
        if (b) setBrand(b);
        if (f) setFocusAreas(JSON.parse(f));
      } catch (err) {
        console.warn('Failed loading profile prefs', err);
      } finally {
        if (mounted) setPrefsHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleAvoidPreference = (item) => {
    setAllergies(prev => {
      // Håndtér "Ingen præference / i tvivl" som en gensidig udelukkende mulighed
      if (item === NO_INGREDIENT_PREFERENCE) {
        return prev.includes(NO_INGREDIENT_PREFERENCE) ? [] : [NO_INGREDIENT_PREFERENCE];
      }

      const withoutNoPref = prev.filter(x => x !== NO_INGREDIENT_PREFERENCE);
      if (withoutNoPref.includes(item)) {
        return withoutNoPref.filter(x => x !== item);
      }
      return [...withoutNoPref, item];
    });
  };

  const toggleHelpTopic = (topic) => {
    setFocusAreas(prev => {
      if (prev.includes(topic)) {
        return prev.filter(x => x !== topic);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, topic];
    });
  };

  // Gem præferencer automatisk, når de ændrer sig
  useEffect(() => {
    if (!prefsHydrated) return;
    (async () => {
      try {
        await AsyncStorage.setItem(SKIN_KEY, skin || '');
        await AsyncStorage.setItem(ALLERGY_KEY, JSON.stringify(allergies || []));
        await AsyncStorage.setItem(BRAND_KEY, brand || '');
        await AsyncStorage.setItem(FOCUS_KEY, JSON.stringify(focusAreas || []));
      } catch (err) {
        console.warn('Save profile prefs failed', err);
      }
    })();
  }, [skin, allergies, brand, focusAreas, prefsHydrated]);

  const savePreferences = () => {
    Alert.alert('Gemte indstillinger', 'Dine præferencer bliver gemt automatisk.');
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
            <Typography variant="h3">Din hudtype</Typography>
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
            <Typography variant="h3">Undgå helst</Typography>
            <Typography variant="small" muted style={{ marginTop: 4 }}>
              Vælg de ting du helst vil undgå i produkter (hvis du er i tvivl, vælg 'Ingen præference').
            </Typography>
            <View style={styles.rowWrap}>
              {INGREDIENT_OPTIONS.map((a) => {
                const selected = allergies.includes(a);
                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => toggleAvoidPreference(a)}
                    style={[
                      styles.checkbox,
                      selected && {
                        borderColor: theme.colors.primary,
                        backgroundColor: 'rgba(31,190,149,0.12)',
                      },
                    ]}
                  >
                    <Typography variant="small">{a}</Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Typography variant="h3">Hvad vil du gerne have hjælp til?</Typography>
              <Typography variant="small" muted style={{ marginLeft: 8 }}>
                ({focusAreas.length}/2 valgt)
              </Typography>
            </View>
            <Typography variant="small" muted style={{ marginTop: 4 }}>
              Vælg op til 2 områder, så appen kan give mere relevante anbefalinger.
            </Typography>
            <View style={styles.rowWrap}>
              {FOCUS_OPTIONS.map((f) => {
                const selected = focusAreas.includes(f);
                const atLimit = !selected && focusAreas.length >= 2;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => {
                      if (atLimit) return;
                      toggleHelpTopic(f);
                    }}
                    disabled={atLimit}
                    style={[
                      styles.checkbox,
                      atLimit && !selected && styles.checkboxDisabled,
                      selected && {
                        borderColor: theme.colors.primary,
                        backgroundColor: 'rgba(31,190,149,0.12)',
                      },
                    ]}
                  >
                    <Typography variant="small">{f}</Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
            {focusAreas.length >= 2 && (
              <Typography variant="small" muted style={{ marginTop: 6 }}>
                Du kan maks vælge 2.
              </Typography>
            )}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkboxDisabled: {
    opacity: 0.6,
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

