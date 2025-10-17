import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = 'FAVORITES_V1';

export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to get favorites', e);
    return [];
  }
}

export async function addFavorite(item) {
  try {
    const list = await getFavorites();
    // avoid duplicates by id or name
    const exists = list.find(i => i.id === item.id || i.name === item.name);
    if (exists) return list;
    list.unshift(item);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Failed to add favorite', e);
    return null;
  }
}

export async function removeFavorite(id) {
  try {
    const list = await getFavorites();
    const filtered = list.filter(i => i.id !== id);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to remove favorite', e);
    return null;
  }
}

export async function isFavorite(idOrName) {
  const list = await getFavorites();
  return list.some(i => i.id === idOrName || i.name === idOrName);
}
