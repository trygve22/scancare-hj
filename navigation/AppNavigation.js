import React from 'react';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { navigationRef } from '../utils/navigationRef';
import { useTheme } from '../styles/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ReviewScreen from '../screens/ReviewScreen';
import CameraScreen from '../screens/CameraScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SearchStack = createStackNavigator();
const AuthStack = createStackNavigator();

// Auth stack for login/register
function AuthNavigator({ onLoginSuccess }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => <RegisterScreen {...props} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

// Main stack navigator
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

// Search stack navigator
function SearchStackScreen({ navigation }) {
  const { theme } = useTheme();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      const state = navigation.getState();
      
      if (state && state.routes) {
        const sogRoute = state.routes.find(route => route.name === 'Søg');
        
        if (sogRoute && sogRoute.state && sogRoute.state.index > 0) {
          e.preventDefault();
          navigation.navigate('Søg', { screen: 'SearchMain' });
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SearchStack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: theme.colors.background } 
      }}
    >
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </SearchStack.Navigator>
  );
}

// Tab navigator
function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: theme.colors.surfaceAlt || theme.colors.background, 
          borderTopColor: theme.colors.border 
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Hjem') iconName = 'home';
          else if (route.name === 'Søg') iconName = 'search';
          else if (route.name === 'Favoritter') iconName = 'heart';
          else if (route.name === 'Reviews') iconName = 'chatbubbles';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      })}
    >
      <Tab.Screen name="Hjem" component={HomeScreen} />
      <Tab.Screen name="Søg" component={SearchStackScreen} />
      <Tab.Screen name="Favoritter" component={FavoritesScreen} />
      <Tab.Screen name="Reviews" component={ReviewScreen} />
    </Tab.Navigator>
  );
}

// Main navigation component
export default function AppNavigation({ isAuthenticated, onLoginSuccess }) {
  const { theme, mode } = useTheme();

  const navTheme = React.useMemo(() => {
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
    };
  }, [theme, mode]);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      {isAuthenticated ? <MainStack /> : <AuthNavigator onLoginSuccess={onLoginSuccess} />}
    </NavigationContainer>
  );
}
