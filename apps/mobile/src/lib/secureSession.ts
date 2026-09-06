import * as SecureStore from 'expo-secure-store';

type Manifest = { revision: string; count: number };
const keyFor = (key: string) => key.replace(/[^a-zA-Z0-9_.-]/g, '_');
async function manifest(key: string): Promise<Manifest | null> {
  const value = await SecureStore.getItemAsync(keyFor(key));
  return value ? JSON.parse(value) as Manifest : null;
}
// Small chunks avoid native Keychain entry-size limits. Manifest commits last.
export const secureSessionStorage = {
  async getItem(key: string) {
    const entry = await manifest(key); if (!entry) return null;
    const chunks = await Promise.all(Array.from({ length: entry.count }, (_, i) => SecureStore.getItemAsync(`${keyFor(key)}.${entry.revision}.${i}`)));
    return chunks.some((chunk) => chunk === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string) {
    const old = await manifest(key);
    const revision = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const chunks = value.match(/[\s\S]{1,450}/g) ?? [''];
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(`${keyFor(key)}.${revision}.${i}`, chunk)));
    await SecureStore.setItemAsync(keyFor(key), JSON.stringify({ revision, count: chunks.length }));
    if (old) await Promise.allSettled(Array.from({ length: old.count }, (_, i) => SecureStore.deleteItemAsync(`${keyFor(key)}.${old.revision}.${i}`)));
  },
  async removeItem(key: string) {
    const old = await manifest(key);
    await SecureStore.deleteItemAsync(keyFor(key));
    if (old) await Promise.allSettled(Array.from({ length: old.count }, (_, i) => SecureStore.deleteItemAsync(`${keyFor(key)}.${old.revision}.${i}`)));
  },
};
