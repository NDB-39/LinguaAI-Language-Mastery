import { get, set, del, update } from 'idb-keyval';

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const val = await get(key);
    return val as T || null;
  } catch (error) {
    console.error('getCache error:', error);
    return null;
  }
}

export async function setCache(key: string, value: any): Promise<void> {
  try {
    await set(key, value);
  } catch (error) {
    console.error('setCache error:', error);
  }
}

export async function removeCache(key: string): Promise<void> {
  try {
    await del(key);
  } catch (error) {
    console.error('removeCache error:', error);
  }
}
