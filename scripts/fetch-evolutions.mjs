import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const POKEAPI_DELAY_MS = 80;
const MAX_NATIONAL_DEX_ID = 1025;

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

function findNode(chain, targetName, parent = null) {
  if (chain.species.name === targetName) {
    return { ...chain, parent };
  }
  for (const child of chain.evolves_to) {
    const found = findNode(child, targetName, chain);
    if (found) return found;
  }
  return null;
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]/g, '');
}

async function fetchEvolutions() {
  const pokedexPath = path.join(DATA_DIR, 'pokedex.json');
  const pokedex = JSON.parse(fs.readFileSync(pokedexPath, 'utf-8'));

  // Unique French names present in our Pokédex
  const ourNames = new Set(pokedex.map(p => p.name));
  console.log(`Our Pokédex contains ${ourNames.size} unique French names`);

  // Manual overrides for names that cannot be resolved by normalization alone
  // (e.g. gendered forms with identical base name)
  const MANUAL_OVERRIDES = {
    'Nidoran♀': { en: 'nidoran-f', id: 29 },
    'Nidoran♂': { en: 'nidoran-m', id: 32 }
  };

  // Build French name -> { english name, national dex id } by scanning PokeAPI
  const frToData = new Map();

  // Apply manual overrides first
  for (const [name, data] of Object.entries(MANUAL_OVERRIDES)) {
    if (ourNames.has(name)) {
      frToData.set(name, { ...data, apiFrName: name });
      console.log(`✅ mapped ${name} (manual override / ${data.en}) = ${data.id}`);
    }
  }

  // Prepare normalized lookup for remaining names
  const remainingNames = new Map();
  for (const name of ourNames) {
    if (frToData.has(name)) continue;
    remainingNames.set(normalizeName(name), name);
  }

  for (let id = 1; id <= MAX_NATIONAL_DEX_ID; id++) {
    // Skip IDs already handled by manual overrides
    if (Object.values(MANUAL_OVERRIDES).some(o => o.id === id)) continue;

    try {
      const species = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      const frName = species.names.find(n => n.language.name === 'fr')?.name;
      if (!frName) continue;

      const normalizedFrName = normalizeName(frName);
      const ourName = remainingNames.get(normalizedFrName);

      if (ourName) {
        frToData.set(ourName, { en: species.name, id, apiFrName: frName });
        console.log(`✅ mapped ${ourName} (${frName} / ${species.name}) = ${id}`);
        if (frToData.size === ourNames.size) {
          console.log('All names mapped, stopping scan.');
          break;
        }
      }
    } catch (error) {
      console.error(`❌ species ${id}: ${error.message}`);
    }
    await delay(POKEAPI_DELAY_MS);
  }

  console.log(`\nMapped ${frToData.size}/${ourNames.size} names`);
  if (frToData.size < ourNames.size) {
    const missing = Array.from(ourNames).filter(name => !frToData.has(name));
    console.warn('Missing names:', missing.join(', '));
  }

  // Build English name -> French name reverse lookup
  const enToFr = new Map();
  for (const [fr, data] of frToData) {
    enToFr.set(data.en, fr);
  }

  // Fetch evolution chains and compute previous/next links
  const chainCache = new Map();
  const evolutions = {};

  for (const [frName, data] of frToData) {
    try {
      const species = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`);
      const chainUrl = species.evolution_chain.url;
      let chainData = chainCache.get(chainUrl);
      if (!chainData) {
        chainData = await fetchWithRetry(chainUrl);
        chainCache.set(chainUrl, chainData);
      }

      const node = findNode(chainData.chain, data.en);
      if (!node) {
        console.warn(`⚠️ ${frName} (${data.en}) not found in its evolution chain`);
        evolutions[frName] = { previous: [], next: [] };
        await delay(POKEAPI_DELAY_MS);
        continue;
      }

      const previous = [];
      if (node.parent) {
        const parentFr = enToFr.get(node.parent.species.name);
        if (parentFr) previous.push(parentFr);
      }

      const next = [];
      for (const child of node.evolves_to) {
        const childFr = enToFr.get(child.species.name);
        if (childFr) next.push(childFr);
      }

      evolutions[frName] = { previous, next };
      console.log(`✅ ${frName}: prev=[${previous.join(', ')}] next=[${next.join(', ')}]`);
    } catch (error) {
      console.error(`❌ ${frName}: ${error.message}`);
    }
    await delay(POKEAPI_DELAY_MS);
  }

  // Ensure every unique name has an entry (even if mapping failed)
  for (const name of ourNames) {
    if (!evolutions[name]) {
      evolutions[name] = { previous: [], next: [] };
    }
  }

  const outputPath = path.join(DATA_DIR, 'evolutions.json');
  fs.writeFileSync(outputPath, JSON.stringify(evolutions, null, 2));

  const withLink = Object.values(evolutions).filter(e => e.previous.length > 0 || e.next.length > 0).length;
  console.log(`\nDone: ${Object.keys(evolutions).length} entries written to ${outputPath}`);
  console.log(`${withLink} Pokémon have at least one evolution link`);
}

fetchEvolutions().catch(error => {
  console.error('Failed to fetch evolutions:', error);
  process.exit(1);
});
