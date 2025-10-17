import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { navigationRef } from './utils/navigationRef';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './styles/ThemeContext';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ReviewScreen from './screens/ReviewScreen';
import CameraScreen from './screens/CameraScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ErrorBoundary from './components/ErrorBoundary';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const HomeStack = createStackNavigator();

// Create stack navigator for screens that need stack navigation
function MainStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

// Create tab navigator
function MainTabs() {
  const { theme } = useTheme();
  
  function HomeStackScreen() {
    return (
      <HomeStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.background } }}>
        <HomeStack.Screen name="HomeMain" component={HomeScreen} />
        <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      </HomeStack.Navigator>
    );
  }
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.surfaceAlt || theme.colors.background, borderTopColor: theme.colors.border },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Hjem') iconName = 'home';
          else if (route.name === 'Søg') iconName = 'search';
          else if (route.name === 'Reviews') iconName = 'chatbubbles';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      })}
    >
  <Tab.Screen name="Hjem" component={HomeStackScreen} />
  <Tab.Screen name="Søg" component={SearchScreen} />
  <Tab.Screen name="Favoritter" component={FavoritesScreen} />
  <Tab.Screen name="Reviews" component={ReviewScreen} />
    </Tab.Navigator>
  );
}

function ThemedNavigator() {
  const { theme, mode } = useTheme();
  const [ready, setReady] = useState(true);
  const navTheme = useMemo(() => {
    const base = mode === 'dark' ? NavDarkTheme : NavDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        border: theme.colors.border,
        card: theme.colors.surface || theme.colors.background,
        primary: theme.colors.primary,
        text: theme.colors.text,
        notification: theme.colors.primary,
      },
      fonts: base.fonts || { regular: { fontFamily: 'System', fontWeight: '400' }, medium: { fontFamily: 'System', fontWeight: '500' }, bold: { fontFamily: 'System', fontWeight: '700' }, heavy: { fontFamily: 'System', fontWeight: '800' } },
    };
  }, [theme, mode]);

  if (!ready) {
    return (
      <>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <MainStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ThemedNavigator />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
