import { promises as fs } from 'fs';
import path from 'path';

const storageFilePath = path.resolve(process.cwd(), 'storage.json');

// Helper function to read the storage file
const readStorage = async () => {
  try {
    const data = await fs.readFile(storageFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, return an empty object
      await writeStorage({});
      return {};
    } else {
      throw err;
    }
  }
};

// Helper function to write to the storage file
const writeStorage = async (data) => {
  await fs.writeFile(storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Storage object using async functions
export const storage = {
  get: async (key, _default) => {
    const data = await readStorage();
    let value = data['web5:' + key];
    if (value !== undefined) return value;
    if (_default !== undefined) {
      await storage.set(key, _default);
      return _default;
    }
  },
  set: async (key, value) => {
    const data = await readStorage();
    data['web5:' + key] = value;
    await writeStorage(data);
    return value;
  },
  modify: async (key, fn) => {
    const value = await storage.get(key);
    return await storage.set(key, fn(value));
  },
};
