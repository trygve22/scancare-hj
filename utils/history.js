import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'SCAN_HISTORY_V1';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export async function addScan(entry) {
  try {
    const list = await getHistory();
    const item = { id: makeId(), timestamp: Date.now(), ...entry };
    list.unshift(item);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return item;
  } catch (e) {
    console.error('Failed to add scan to history', e);
    return null;
  }
}

export async function removeScan(id) {
  try {
    const list = await getHistory();
    const filtered = list.filter((i) => i.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to remove scan', e);
    return false;
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear history', e);
    return false;
  }
}
