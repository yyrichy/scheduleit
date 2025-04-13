import fs from 'fs/promises';
import path from 'path';

const SECTIONS_STORE_PATH = path.join(process.cwd(), "data", "sections_store.json");

let sectionsCache: any = null;

export async function loadSectionsStore() {
  if (!sectionsCache) {
    const data = await fs.readFile(SECTIONS_STORE_PATH, "utf-8");
    sectionsCache = JSON.parse(data);
  }
  return sectionsCache;
}