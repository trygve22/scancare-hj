import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeContext';
import Typography from '../components/Typography';
import { moisturizerSections } from '../data/moisturizers';
import { resolveProductByBarcode } from '../data/barcodes';
import { addScan } from '../utils/history';
import { openProductDetail } from '../utils/navigationRef';

export default function CameraScreen({ navigation }) {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedValue, setScannedValue] = useState(null);
  const cameraRef = useRef(null);
  const scanningRef = useRef(false);

  const safeClose = () => {
    // unlock scanning first
    scanningRef.current = false;
    setIsScanning(false);
    try {
      if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
        navigation.goBack();
      } else if (navigation) {
        navigation.navigate('MainTabs', { screen: 'Hjem' });
      }
    } catch (e) {
      console.warn('Failed to safely close camera screen:', e);
    }
  };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onBarcodeScanned = useCallback(({ data, type }) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setIsScanning(true);
    setScannedValue(data);

    const product = resolveProductByBarcode(data, moisturizerSections);
    if (product) {
      try {
        // Use helper to open product detail robustly (keeps tabs visible)
        openProductDetail(navigation, product);
        // gem i historik
        addScan({ barcode: data, name: product.name, category: product.category, found: true });
      } catch (e) {
        console.warn('Navigation failed after scanning:', e);
      }
      // genaktiver efter kort tid
      setTimeout(() => {
        scanningRef.current = false;
        setIsScanning(false);
      }, 1000);
    } else {
      // gem som ikke-fundet i historik
      addScan({ barcode: data, type, found: false });
      Alert.alert(
        'Ukendt stregkode',
        `Stregkode: ${data}\nType: ${type}\n\nDette produkt blev ikke fundet i den lokale database.`,
        [
          { text: 'Scan igen', onPress: () => {
              // genaktiver scanning
              scanningRef.current = false;
              setIsScanning(false);
            } },
          { text: 'Luk', onPress: () => {
              // Luk alert og bliv på kameraet: genaktiver scanning
              scanningRef.current = false;
              setIsScanning(false);
            }, style: 'cancel' },
        ],
        { cancelable: false }
      );
    }
  }, [navigation]);

  const flipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Typography variant="body" style={{ color: theme.colors.text }}>
          Anmoder om kamera tilladelse...
        </Typography>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Typography variant="h2" style={{ color: theme.colors.text, marginBottom: 16 }}>
          Ingen Kamera Adgang
        </Typography>
        <Typography variant="body" style={{ color: theme.colors.textMuted, textAlign: 'center', marginBottom: 20 }}>
          ScanCare har brug for kamera adgang for at scanne produkter
        </Typography>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={requestPermission}
        >
          <Typography variant="body" style={{ color: '#fff' }}>Giv Tilladelse</Typography>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView 
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39']
        }}
        onBarcodeScanned={onBarcodeScanned}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
                try {
                  if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
                    navigation.goBack();
                  } else if (navigation) {
                    navigation.navigate('MainTabs', { screen: 'Hjem' });
                  }
                } catch (e) { console.warn('Failed to handle header close:', e); }
              }} style={styles.headerButton}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Typography variant="h3" style={styles.headerTitle}>Scan Produkt</Typography>
            <TouchableOpacity onPress={flipCamera} style={styles.headerButton}>
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
            <Typography variant="body" style={styles.scanText}>
              {isScanning ? "Scannner..." : "Placer produktet i rammen"}
            </Typography>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
              onPress={() => setIsScanning(false)}
              disabled={!isScanning}
            >
              <Ionicons 
                name={isScanning ? 'hourglass' : 'checkmark'}
                size={40}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerTopRight: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '30%',
    left: '20%',
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '30%',
    right: '20%',
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  scanText: {
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 100,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,150,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  scanButtonDisabled: {
    backgroundColor: 'rgba(100,100,100,0.8)',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
});
