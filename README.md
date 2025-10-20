# ScanCare 



Inden installation:

- **Node.js** (v16 eller nyere)
- **npm** eller **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go app** på din telefon (iOS/Android)

## ⚡ Installation & Setup

### 1. Clone repository
```bash
git clone https://github.com/trygve22/scancare.git
cd scancare
```

### 2. Installer alle dependencies
```bash
npm install
```

### 3. Installer required navigation packages
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

### 4. Installer camera functionality
```bash
npx expo install expo-camera
```

### 5. Start development server
```bash
npx expo start
```

### 6. Test på din enhed
- **iOS**: Scan QR-koden med kamera appen
- **Android**: Scan QR-koden med Expo Go appen
- **Simulator**: Tryk `i` (iOS) eller `a` (Android) i terminalen

## 📱 App Struktur

```
scancare/
├── App.js                 # Hovedfil med providers
├── navigation/
│   └── AppNavigation.js   # Navigation setup (tabs + stacks)
├── screens/
│   ├── HomeScreen.js       # Hovedskærm med app oversigt
│   ├── SearchScreen.js     # Produktsøgning med FlatList
│   ├── ReviewScreen.js     # Produktanmeldelser
│   ├── CameraScreen.js     # Kamera scanning interface
│   ├── ProductDetailScreen.js # Detaljeret produktvisning
│   ├── ChatScreen.js       # AI chat interface
│   ├── FavoritesScreen.js  # Favorit produkter
│   └── HistoryScreen.js    # Scan historik
├── components/
│   ├── Typography.js       # Genanvendelig tekst komponent
│   ├── ErrorBoundary.js    # Fejlhåndtering
│   └── ChatBox.js          # Chat interface komponent
├── styles/
│   ├── theme.js           # Farver og design tokens
│   ├── ThemeContext.js    # Global tema management (dark/light mode)
│   └── *.styles.js        # Screen-specifikke stylesheets
├── utils/
│   ├── navigation.js      # Navigation helpers
│   ├── favorites.js       # Favorit management
│   ├── history.js         # Historik management
│   └── openai.js          # OpenAI integration
└── data/
    ├── moisturizers.js    # Produktdatabase
    └── barcodes.js        # Stregkode database
```


### Common Issues

**Kamera virker ikke:**
```bash
npx expo install expo-camera
# Genstart Expo server
npx expo start --clear
```

**Navigation fejl:**
```bash
npm install @react-navigation/stack react-native-gesture-handler
npx expo start --clear
```

**Bundle fejl:**
```bash
# Clear cache og genstart
npx expo start --clear
```



## 🎬 Demo Video




https://github.com/user-attachments/assets/7b6d9386-3cb5-4184-9db5-805dd530d590


---




