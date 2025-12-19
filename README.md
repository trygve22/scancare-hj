# ScanCare (Expo / React Native)

En beslutningsstøtte‑app til hudpleje i butikken. Brugeren kan scanne produkter, søge, læse/skriv anmeldelser, sætte personlige præferencer og få AI‑hjælp til at vurdere produkter.

Appen er bygget med **Expo**, **React Native** og **Firebase** (Auth + Firestore) og kører uden ekstra konfiguration – alle nøgler ligger hårdkodet i koden og der er ingen `.env` filer, der skal oprettes.

## 1. Forudsætninger

- **Node.js**: anbefalet LTS (v18+)
- **npm** (eller `yarn`, men README bruger `npm`)
- **Expo Go** app på telefonen (iOS/Android)
- Internetforbindelse (Firebase Auth + Firestore bruges til login og anmeldelser)

> Bemærk: `node_modules` ligger i `.gitignore` og skal ikke pushes til GitHub. Selve kildekoden og `package.json`/`package-lock.json` skal med.

## 2. Installation & kørsel

1. **Clone repository**
     ```bash
     git clone <URL til dette repository>
     cd scancare-hj
     ```

2. **Installer dependencies**
     ```bash
     npm install
     ```

     Alle nødvendige pakker (React Navigation, Firebase, Expo Camera osv.) ligger allerede i `package.json`, så ingen ekstra manuelle `npm install ...` kommandoer er nødvendige.

3. **Start Expo udviklingsserver**
     ```bash
     npx expo start
     ```

4. **Kør appen**
     - **Fysisk enhed**: scan QR‑koden i terminalen/browseren med Expo Go.
     - **iOS simulator**: tryk `i` i Expo‑terminalen.
     - **Android emulator**: tryk `a` i Expo‑terminalen.

Appen burde starte uden ekstra opsætning.

## 3. Kort om funktionalitet (til underviser)

- **Login & bruger**
    - Firebase Auth (e‑mail + password).
    - Lokalt cachet bruger (id, navn, e‑mail) i AsyncStorage.

- **Profil & præferencer**
    - Hudtype (single‑select).
    - “Undgå helst”: Parfume, Alkohol, Æteriske olier, Parabener + speciel “Ingen præference / i tvivl” (gensidigt udelukkende).
    - “Hvad vil du gerne have hjælp til?”: fokusområder (max 2, med tæller og begrænsning).
    - Yndlingsbrand (valg via logoer).
    - Dark/Light‑mode toggle.
    - Alle præferencer gemmes **kun lokalt** i AsyncStorage (ikke i Firebase).

- **For you (personlige anbefalinger)**
    - Viser op til 8 anbefalede produkter baseret på hudtype + ingrediens‑hensyn.
    - Hvis brugeren har yndlingsbrand, sorteres produkter fra dette brand øverst.

- **Scan (kamera)**
    - Scanner stregkoder med `expo-camera`.
    - Matcher mod lokal stregkode→produkt‑database og åbner produktdetaljer (via Søg‑stacken).
    - Gemmer alle scans (fundne/ikke fundne) i lokal scanhistorik i AsyncStorage.

- **Søg produkter**
    - Tekstsøgning i lokal produktdatabase (navn + kategori/brand).
    - Tryk på resultat åbner produktdetaljer.

- **Produktdetaljer**
    - Viser produktinfo + billede (lokalt asset eller fallback‑billede).
    - Favorit‑toggle (gemmes lokalt i AsyncStorage).
    - Viser anmeldelser fra Firestore eller mock‑data.
    - Bruger kan skrive/slette egne anmeldelser (kræver login + at produktet er scannet).
    - Viser AI‑sammendrag af produktet ift. brugerens profil (OpenAI API).

- **Favoritter & historik**
    - Favoritter: lokal liste med produkter, som brugeren har markeret som favorit.
    - Scanhistorik: lokal log over alle scans (tidspunkt, barcode, fundet/ikke fundet) med mulighed for at slette/tømme.

- **AI‑chat**
    - Dedikeret chat‑skærm, hvor brugeren kan stille spørgsmål til en AI‑assistent om produkter/hudpleje.

## 4. Projektstruktur (overblik)

```text
scancare-hj/
├── App.js                  # App root m. ThemeProvider, ErrorBoundary, navigation
├── navigation/
│   └── AppNavigation.js    # Bottom tabs (For you, Søg, Scan, AI, Profil) + stacks
├── screens/
│   ├── HomeScreen.js       # "For you" anbefalinger
│   ├── SearchScreen.js     # Produktsøgning
│   ├── CameraScreen.js     # Scan stregkoder
│   ├── ProductDetailScreen.js # Detaljer, favorit, reviews, AI-sammendrag
│   ├── ChatScreen.js       # AI-chat
│   ├── FavoritesScreen.js  # Favoritliste (lokal)
│   ├── HistoryScreen.js    # Scanhistorik (lokal)
│   ├── ProfileScreen.js    # Profil + præferencer + tema
│   ├── LoginScreen.js      # Login (Firebase Auth)
│   └── RegisterScreen.js   # Opret bruger
├── components/
│   ├── Typography.js       # Genanvendelig tekstkomponent
│   ├── ChatBox.js          # Chat UI til AI-skærmen
│   └── ErrorBoundary.js    # Simpel fejlgrænse
├── styles/
│   ├── theme.js            # Farver, spacing, typografi
│   ├── ThemeContext.js     # Light/Dark theme provider
│   └── *.styles.js         # Screen-specifikke styles
├── utils/
│   ├── auth.js             # Firebase login/register/logout + current user cache
│   ├── favorites.js        # AsyncStorage-favoritter
│   ├── history.js          # AsyncStorage-scanhistorik
│   ├── reviews.js          # Firestore-reviews
│   ├── openai.js           # OpenAI-kald
│   ├── navigation.js       # Navigation helpers
│   └── navigationRef.js    # Global navigation ref (til Scan m.m.)
├── database/
│   └── firebase.js         # Firebase config + init Auth/Firestore
└── data/
        ├── moisturizers.js     # Produktdata
        ├── barcodes.js         # Stregkode→produkt mapping
        ├── brandLogos.js       # Brand-logoer
        └── productImages.js    # Produktbilleder
```

## 5. Typiske problemer

**Kamera virker ikke**
```bash
npx expo start --clear
```

**Fejl med navigation/gesture handler**
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

**Bundling/caching-fejl**
```bash
npx expo start --clear
```

## 6. Bemærkninger til bedømmelse

- Ingen `.env` eller hemmelige nøgler skal opsættes for at køre appen.
- Firebase bruges kun til **login** og **anmeldelser**; alle præferencer, favoritter og scanhistorik ligger kun lokalt i AsyncStorage.
- Koden er klar til at blive pushed til GitHub; `node_modules` er udelukket via `.gitignore` og bør ikke med i repoet.




