import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Helper function to open product detail screen
export function openProductDetail(navigation, product) {
  // Always target the nested Search stack where ProductDetail lives.
  // This avoids "NAVIGATE not handled" when called from Camera/MainStack.
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'Søg',
      params: {
        screen: 'ProductDetail',
        params: { product },
      },
    });
    return;
  }

  // If for some reason the global ref is not ready yet, fall back to
  // the local navigation object (works when already inside SearchStack).
  if (navigation && typeof navigation.navigate === 'function') {
    try {
      navigation.navigate('ProductDetail', { product });
    } catch (e) {
      console.warn('openProductDetail: navigation failed and ref not ready', e);
    }
  }
}

export default navigationRef;
