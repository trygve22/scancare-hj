import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ChatBox was moved to a dedicated ChatScreen; no direct import needed here
import { useTheme } from '../styles/ThemeContext';
import { makeStyles } from '../styles/HomeScreen.styles';
import Typography from '../components/Typography';
import { getCurrentUser, logoutUser } from '../utils/auth';

export default function HomeScreen({ navigation }) {
    const { theme, mode, toggleTheme } = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State til skin care tips
    const [showTip, setShowTip] = useState(false);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);
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
    
    // Liste af skin care tips
    const skinCareTips = [
        "💧 Husk at drikke vand for hydreret hud",
        "🌞 Brug altid solcreme - selv på skydage",
        "🧴 Mindre er mere - brug ikke for mange produkter",
        "😴 God søvn giver naturlig glød",
        "🥒 Spis grøntsager for sund hud indefra"
    ];

    const safeNavigate = (route) => {
        if (navigation && navigation.navigate) {
            try { navigation.navigate(route); } catch (e) { /* route not registered yet */ }
        }
    };

    const handleTipButton = () => {
        if (showTip) {
            // Hvis tip allerede vises, skift til næste tip
            setCurrentTipIndex((prev) => (prev + 1) % skinCareTips.length);
        } else {
            // Hvis intet tip vises, vis første tip
            setShowTip(true);
        }
    };

    return (
        <View style={styles.container}>
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
            
            {/* Use the project's assets/logo.png so Metro can resolve the asset */}
            <Image source={require('../assets/logo.png')} style={local.logo} resizeMode="contain" />
            <Typography variant="h1" style={local.title}>ScanCare</Typography>
            <Typography variant="body" muted style={local.subtitle}>Your health, scanned and cared for.</Typography>
            <View style={{ height: theme.spacing.xl }} />
            <TouchableOpacity style={[local.button, { backgroundColor: theme.colors.primary }]} onPress={() => safeNavigate('Camera')}>
                <Typography variant="small" weight="600" style={local.buttonText}>Start Scan</Typography>
            </TouchableOpacity>
            <View style={{ height: theme.spacing.sm }} />
            <Button
                title="View History"
                onPress={() => safeNavigate('History')}
                color={theme.colors.primary}
            />
            <View style={{ height: theme.spacing.lg }} />
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Toggle dark mode"
                onPress={toggleTheme}
                style={[local.toggleButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            >
                <Typography variant="small" weight="500" style={{ color: theme.colors.text }}>
                    {mode === 'light' ? 'Skift til mørk tilstand' : 'Skift til lys tilstand'}
                </Typography>
            </TouchableOpacity>
            
            <View style={{ height: theme.spacing.lg }} />
            <TouchableOpacity style={[local.button, { backgroundColor: theme.colors.primary }]} onPress={() => safeNavigate('Chat')}>
                <Typography variant="small" weight="600" style={local.buttonText}>Chat med AI</Typography>
            </TouchableOpacity>
        </View>
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
    logo: { width: 200, height: 200, marginBottom: 32 },
    title: { marginBottom: 8 },
    subtitle: { textAlign: 'center', marginTop: 4 },
    button: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, marginBottom: 16 },
    buttonText: { color: '#fff' },
    secondaryButton: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 8 },
    secondaryButtonText: { fontSize: 16 },
    toggleButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1 },
    tipContainer: { 
        padding: 16, 
        borderRadius: 12, 
        backgroundColor: 'rgba(0,0,0,0.05)', 
        marginTop: 8,
        minHeight: 120,
        justifyContent: 'center' 
    },
});