// Helpers for robust nested navigation across different navigator contexts
import { navigationRef } from './navigationRef';

export function openProductDetail(navigation, product) {
  // attempt to open product detail; reduce noisy logging in normal flow
  // prefer using global navigationRef when available
  if (navigationRef && navigationRef.isReady()) {
    try {
      navigationRef.navigate('MainTabs', { screen: 'Hjem', params: { screen: 'ProductDetail', params: { product } } });
      return;
    } catch (e) { console.warn('[nav] navigationRef MainTabs failed', e?.message || e); }
  }
  try {
    // try direct navigate first
      try {
      navigation.navigate('MainTabs', { screen: 'Hjem', params: { screen: 'ProductDetail', params: { product } } });
      return;
    } catch (e) {
      console.warn('[nav] MainTabs navigate failed:', e?.message || e);
    }

    // try going to Hjem directly
    try {
      navigation.navigate('Hjem', { screen: 'ProductDetail', params: { product } });
      return;
    } catch (e) {
      console.warn('[nav] Hjem navigate failed:', e?.message || e);
    }

    // climb parents
    if (navigation && typeof navigation.getParent === 'function') {
      const parent = navigation.getParent();
      if (parent) {
        try {
          parent.navigate('MainTabs', { screen: 'Hjem', params: { screen: 'ProductDetail', params: { product } } });
          return;
        } catch (e) { console.warn('[nav] parent MainTabs failed', e?.message || e); }
      }
    }

    // fallback to direct ProductDetail
  try { navigation.navigate('ProductDetail', { product }); return; } catch (e) { console.warn('[nav] fallback ProductDetail failed', e?.message || e); }
  } catch (err) {
    console.warn('[nav] openProductDetail failed overall', err);
  }
}
