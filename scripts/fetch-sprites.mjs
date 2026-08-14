import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const POKEAPI_DELAY_MS = 100;

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

async function fetchSprites() {
  const pokedexPath = path.join(DATA_DIR, 'pokedex.json');
  const pokedex = JSON.parse(fs.readFileSync(pokedexPath, 'utf-8'));

  // Build name -> national dex ID mapping (increment on first encounter)
  const nameToId = new Map();
  let nextId = 1;
  for (const pokemon of pokedex) {
    if (!nameToId.has(pokemon.name)) {
      nameToId.set(pokemon.name, nextId);
      nextId++;
    }
  }

  console.log(`Mapping created: ${nameToId.size} unique Pokémon`);

  // Fetch sprites for each unique ID
  const idToSprite = new Map();
  for (const [name, id] of nameToId) {
    try {
      const data = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const sprite =
        data.sprites?.other?.['official-artwork']?.front_default ||
        data.sprites?.front_default ||
        null;
      idToSprite.set(id, sprite);
      console.log(`✅ ${name} (id ${id}): ${sprite ? 'OK' : 'no sprite'}`);
    } catch (error) {
      console.error(`❌ ${name} (id ${id}): ${error.message}`);
      idToSprite.set(id, null);
    }
    await delay(POKEAPI_DELAY_MS);
  }

  // Add sprite URL to each entry
  const enrichedPokedex = pokedex.map(pokemon => {
    const id = nameToId.get(pokemon.name);
    return {
      ...pokemon,
      sprite: idToSprite.get(id) || null
    };
  });

  fs.writeFileSync(pokedexPath, JSON.stringify(enrichedPokedex, null, 2));

  const withSprite = enrichedPokedex.filter(p => p.sprite).length;
  console.log(`\nDone: ${withSprite}/${enrichedPokedex.length} entries have a sprite`);
}

fetchSprites().catch(error => {
  console.error('Failed to fetch sprites:', error);
  process.exit(1);
});
