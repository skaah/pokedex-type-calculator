import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'french-mapping.json');
const POKEAPI_DELAY_MS = 50;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(500 * (i + 1));
    }
  }
}

async function buildFrenchMapping() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  if (fs.existsSync(CACHE_FILE)) {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    console.log(`Using cached mapping: ${Object.keys(cached).length} entries`);
    return cached;
  }

  console.log('Fetching species list from PokeAPI...');
  const list = await fetchWithRetry('https://pokeapi.co/api/v2/pokemon-species?limit=10000');
  console.log(`Found ${list.results.length} species`);

  const mapping = {};
  for (let i = 0; i < list.results.length; i++) {
    const species = list.results[i];
    const id = i + 1;
    try {
      const data = await fetchWithRetry(species.url);
      const frenchName = data.names.find(n => n.language.name === 'fr')?.name;
      const englishName = data.names.find(n => n.language.name === 'en')?.name;
      if (frenchName) {
        mapping[frenchName] = { id, en: englishName, fr: frenchName };
      }
      if ((i + 1) % 50 === 0) {
        console.log(`  ${i + 1}/${list.results.length}...`);
      }
    } catch (error) {
      console.error(`  ❌ species #${id}: ${error.message}`);
    }
    await delay(POKEAPI_DELAY_MS);
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(mapping, null, 2));
  console.log(`Cached ${Object.keys(mapping).length} French names to ${CACHE_FILE}`);
  return mapping;
}

buildFrenchMapping().catch(error => {
  console.error('Failed to build French mapping:', error);
  process.exit(1);
});
