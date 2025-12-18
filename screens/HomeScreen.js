import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Button, Alert, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
// ChatBox was moved to a dedicated ChatScreen; no direct import needed here
import { useTheme } from '../styles/ThemeContext';
import { makeStyles } from '../styles/HomeScreen.styles';
import Typography from '../components/Typography';
import { getCurrentUser, logoutUser } from '../utils/auth';
import { moisturizerSections } from '../data/moisturizers';
import { productImages } from '../data/productImages';
import { navigate } from '../utils/navigationRef';

const SKIN_KEY = 'SC_PROFILE_SKIN';
const ALLERGY_KEY = 'SC_PROFILE_ALLERGIES';
const BRAND_KEY = 'SC_PROFILE_BRAND';

export default function HomeScreen({ navigation }) {
    const { theme, mode, toggleTheme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const [currentUser, setCurrentUser] = useState(null);
    const [skin, setSkin] = useState(null);
    const [allergies, setAllergies] = useState([]);
    const [favoriteBrand, setFavoriteBrand] = useState(null);
    const [loadingPrefs, setLoadingPrefs] = useState(true);

    const [recommended, setRecommended] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Reload user + prefs every time the For you screen gains focus,
    // so changes from the Profile screen are reflected immediately.
    useFocusEffect(
        useCallback(() => {
            loadUserAndPrefs();
        }, [])
    );

    const loadUserAndPrefs = async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);

        try {
            const s = await AsyncStorage.getItem(SKIN_KEY);
            const a = await AsyncStorage.getItem(ALLERGY_KEY);
            const b = await AsyncStorage.getItem(BRAND_KEY);
            setSkin(s || null);
            setAllergies(a ? JSON.parse(a) : []);
            setFavoriteBrand(b || null);
        } catch (e) {
            console.warn('Failed loading For you prefs', e);
        } finally {
            setLoadingPrefs(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Log ud',
            'Er du sikker på at du vil logge ud?',
            [
                { text: 'Annuller', style: 'cancel' },
                {
                    text: 'Log ud',
                    style: 'destructive',
                    onPress: async () => {
                        await logoutUser();
                        // The app will automatically show login screen
                        // because App.js checks auth state
                    }
                }
            ]
        );
    };

    const safeNavigate = (route) => {
        if (navigation && navigation.navigate) {
            try { navigation.navigate(route); } catch (e) { /* route not registered yet */ }
        }
    };

    // Flatten alle produkter fra moisturizerSections, samme struktur som i SearchScreen
    const flatProducts = useMemo(() => {
        return moisturizerSections.flatMap(section => 
            (section.data || []).map(raw => {
                if (typeof raw === 'string') {
                    return {
                        name: raw,
                        category: section.title,
                        id: `${section.title}-${raw}`,
                    };
                }
                return {
                    ...raw,
                    category: section.title,
                    id: raw.id || `${section.title}-${raw.name}`,
                };
            })
        );
    }, []);

    // Udregn anbefalede produkter baseret på hudtype og ingrediens-hensyn
    useEffect(() => {
        if (loadingPrefs) return;
        setLoadingProducts(true);

        const filtered = flatProducts.filter(product => {
            const productSkinTypes = product.skinTypes || [];
            const productContains = product.contains || [];

            const effectiveAllergies = (allergies || []).filter(a => a !== 'Ingen præference / i tvivl');

            let okSkin = true;
            if (skin && productSkinTypes.length) {
                okSkin = productSkinTypes.includes(skin);
            }

            let okAllergy = true;
            if (effectiveAllergies.length && productContains.length) {
                okAllergy = !effectiveAllergies.some(a => productContains.includes(a));
            }

            return okSkin && okAllergy;
        });

        // Hvis intet matcher strengt, fald tilbage til alle produkter
        let base = filtered.length ? filtered : flatProducts;

        // Hvis brugeren har valgt et yndlingsbrand, så prioriter produkter fra dette brand øverst
        if (favoriteBrand) {
            const fav = [];
            const others = [];
            base.forEach((p) => {
                const pBrand = (p.brand || '').trim();
                if (pBrand && pBrand === favoriteBrand) fav.push(p);
                else others.push(p);
            });
            base = [...fav, ...others];
        }
        // Vis kun de første 8 produkter på For you
        setRecommended(base.slice(0, 8));
        setLoadingProducts(false);
    }, [flatProducts, skin, allergies, favoriteBrand, loadingPrefs]);

    const renderProduct = ({ item }) => {
        const img = productImages[item.name];

        return (
            <TouchableOpacity
                onPress={() => {
                    // Fra For you vil vi blive på For you-tabben og bruge en standalone route
                    navigate('ProductDetailFromForYou', { product: item, fromTab: 'For you' });
                }}
                style={local.productCard}
                activeOpacity={0.8}
            >
                {img ? (
                    <Image source={img} style={local.productImage} resizeMode="contain" />
                ) : (
                    <View style={[local.productImage, local.productLogoPlaceholder]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* User profile header */}
            {currentUser && (
                <View style={local.userHeader}>
                    <View style={local.userInfo}>
                        <View style={[local.avatar, { backgroundColor: theme.colors.primary }]}>
                            <Typography variant="h2" style={{ color: '#fff' }}>
                                {currentUser.name?.charAt(0).toUpperCase()}
                            </Typography>
                        </View>
                        <View>
                            <Typography variant="body" weight="600">Hej, {currentUser.name}</Typography>
                            <Typography variant="small" muted>{currentUser.email}</Typography>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={local.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Header og hurtige genveje */}
            <View style={local.heroRow}>
                <View style={{ flex: 1 }}>
                    <Typography variant="h1" style={local.title}>For you</Typography>
                    <Typography variant="body" muted style={local.subtitle}>
                        Produkter udvalgt til din hudprofil.
                    </Typography>
                </View>
                <Image source={require('../assets/logo.png')} style={local.logo} resizeMode="contain" />
            </View>

            {/* Liste over anbefalede produkter */}
            <View style={{ flex: 1, width: '100%', marginTop: theme.spacing.lg }}>
                <Typography variant="h3" style={{ marginBottom: theme.spacing.sm, color: theme.colors.text }}>
                    Anbefalet til dig
                </Typography>

                {loadingPrefs || loadingProducts ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={recommended}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProduct}
                        numColumns={2}
                        columnWrapperStyle={recommended.length > 1 ? { justifyContent: 'space-between' } : undefined}
                        contentContainerStyle={recommended.length ? { paddingBottom: theme.spacing.lg } : { flexGrow: 1, justifyContent: 'center' }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', padding: theme.spacing.lg }}>
                                <Typography variant="body" muted style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}>
                                    Ingen produkter matcher dine præferencer endnu.
                                </Typography>
                                <TouchableOpacity onPress={() => safeNavigate('Profil')} style={[local.button, { backgroundColor: theme.colors.primary }]}>
                                    <Typography variant="small" weight="600" style={local.buttonText}>Opdatér din profil</Typography>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const local = StyleSheet.create({
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButton: {
        padding: 8,
    },
    heroRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    logo: { width: 72, height: 72, marginLeft: 16 },
    title: { marginBottom: 4 },
    subtitle: { marginTop: 2 },
    button: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, marginBottom: 16 },
    buttonText: { color: '#fff' },
    secondaryButton: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 8 },
    secondaryButtonText: { fontSize: 16 },
    toggleButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1 },
    productCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
        flexBasis: '48%',
        maxWidth: '48%',
    },
    productLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    productLogo: {
        width: 40,
        height: 28,
        borderRadius: 6,
        marginRight: 10,
    },
    productLogoPlaceholder: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    productTextWrapper: {
        flex: 1,
    },
    productImage: {
        width: 100,
        height: 120,
        borderRadius: 12,
    },
});