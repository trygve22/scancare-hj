import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Helper function to open product detail screen
export function openProductDetail(navigation, product) {
  try {
    // Direct navigation since we're already in the SearchStack
    navigation.navigate('ProductDetail', { product });
  } catch (e) {
    // Fallback: Use global navigation ref
    if (navigationRef.isReady()) {
      navigationRef.navigate('MainTabs', { 
        screen: 'Søg', 
        params: { screen: 'ProductDetail', params: { product } } 
      });
    }
  }
}

export default navigationRef;
