import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Helper function to open product detail screen
export function openProductDetail(navigation, product) {
  // Prefer using the provided navigation instance so we push onto the
  // current stack (this preserves the Search screen state/scroll position).
  if (navigation && typeof navigation.navigate === 'function') {
    try {
      navigation.navigate('ProductDetail', { product });
      return;
    } catch (e) {
      // Fall through to global navigation ref if local navigation fails
      console.warn('openProductDetail: local navigation failed, falling back to global ref', e);
    }
  }

  // Fallback: use the global navigation ref to target the nested Search stack.
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'Søg',
      params: { screen: 'ProductDetail', params: { product } },
    });
  }
}

export default navigationRef;
