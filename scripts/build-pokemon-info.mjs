import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
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

// Parse localisation markdown into structured data
function parseLocations(markdown) {
  const locations = {}; // name -> [{ zone, method, note }]
  const lines = markdown.split('\n');
  let currentZone = null;
  let currentMethod = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) {
      // Empty line can reset method if next is a new zone/heading
      continue;
    }

    // Zone heading: ## Zone Name
    const zoneMatch = line.match(/^##\s+(.+)$/);
    if (zoneMatch) {
      currentZone = zoneMatch[1].trim();
      currentMethod = null;
      continue;
    }

    // Sub-zone heading: ### Sub-zone Name
    const subZoneMatch = line.match(/^###\s+(.+)$/);
    if (subZoneMatch) {
      currentZone = `${currentZone || ''} — ${subZoneMatch[1].trim()}`.replace(/^ — /, '');
      currentMethod = null;
      continue;
    }

    // Method heading: **Method**
    const methodMatch = line.match(/^\*\*([^*]+)\*\*$/);
    if (methodMatch) {
      currentMethod = methodMatch[1].trim();
      continue;
    }

    // Pokemon entry: - Pokemon Name (note)
    const pokemonMatch = line.match(/^[-*]\s+(.+?)(?:\s+\(([^)]+)\))?\s*$/);
    if (pokemonMatch && currentZone && currentMethod) {
      const name = pokemonMatch[1].trim();
      const note = pokemonMatch[2] ? pokemonMatch[2].trim() : null;
      if (!locations[name]) locations[name] = [];
      locations[name].push({ zone: currentZone, method: currentMethod, note });
    }
  }

  return locations;
}

function loadFrenchMapping() {
  const mappingPath = path.join(__dirname, '.cache', 'french-mapping.json');
  if (fs.existsSync(mappingPath)) {
    const cached = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    // Validate that cached names are lowercase PokeAPI slugs; otherwise rebuild.
    const sample = Object.values(cached)[0];
    if (sample && typeof sample.en === 'string' && sample.en === sample.en.toLowerCase()) {
      return cached;
    }
    console.log('Cached French mapping has invalid casing, rebuilding...');
  }
  return null;
}

async function buildFrenchMapping() {
  console.log('Building French name -> ID mapping from PokeAPI...');
  const mapping = {};
  const list = await fetchWithRetry('https://pokeapi.co/api/v2/pokemon-species?limit=10000');
  for (let i = 0; i < list.results.length; i++) {
    const species = list.results[i];
    try {
      const data = await fetchWithRetry(species.url);
      const frName = data.names.find(n => n.language.name === 'fr')?.name;
      if (frName) {
        mapping[frName] = { id: i + 1, en: species.name, fr: frName };
      }
      if ((i + 1) % 50 === 0) {
        console.log(`  ${i + 1}/${list.results.length}...`);
      }
    } catch (error) {
      console.error(`  ❌ species #${i + 1}: ${error.message}`);
    }
    await delay(POKEAPI_DELAY_MS);
  }
  fs.mkdirSync(path.join(__dirname, '.cache'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '.cache', 'french-mapping.json'), JSON.stringify(mapping, null, 2));
  console.log(`Cached ${Object.keys(mapping).length} French names`);
  return mapping;
}

async function loadMovesCache() {
  const cachePath = path.join(__dirname, '.cache', 'moves-mapping.json');
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }

  console.log('Building moves name cache from PokeAPI...');
  const mapping = {};
  const list = await fetchWithRetry('https://pokeapi.co/api/v2/move?limit=10000');
  for (let i = 0; i < list.results.length; i++) {
    const move = list.results[i];
    try {
      const data = await fetchWithRetry(move.url);
      const frName = data.names.find(n => n.language.name === 'fr')?.name;
      mapping[data.name] = frName || data.name;
      if ((i + 1) % 50 === 0) {
        console.log(`  ${i + 1}/${list.results.length}...`);
      }
    } catch (error) {
      console.error(`  ❌ move ${move.name}: ${error.message}`);
    }
    await delay(POKEAPI_DELAY_MS);
  }

  fs.mkdirSync(path.join(__dirname, '.cache'), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(mapping, null, 2));
  console.log(`Cached ${Object.keys(mapping).length} moves`);
  return mapping;
}

function parseMoves(pokemonData, movesCache) {
  const levelUpMap = new Map();
  const eggSet = new Set();

  for (const moveEntry of pokemonData.moves || []) {
    const enName = moveEntry.move.name;
    const frName = movesCache[enName] || enName;

    for (const detail of moveEntry.version_group_details) {
      const method = detail.move_learn_method.name;
      const level = detail.level_learned_at;

      if (method === 'level-up') {
        const existing = levelUpMap.get(frName);
        if (!existing || (level && existing.level && level < existing.level)) {
          levelUpMap.set(frName, { name: frName, en: enName, level: level || null });
        }
      } else if (method === 'egg') {
        eggSet.add(frName);
      }
    }
  }

  return {
    level_up: Array.from(levelUpMap.values()).sort((a, b) => (a.level || 0) - (b.level || 0)),
    egg: Array.from(eggSet).map(name => ({ name }))
  };
}

function parseEvolutionMethod(detail) {
  if (!detail) return { method: 'unknown', condition: null };

  const parts = [];
  if (detail.min_level) {
    parts.push(`Niveau ${detail.min_level}`);
  }
  if (detail.item) {
    parts.push(`Utiliser ${detail.item.name}`);
  }
  if (detail.held_item) {
    parts.push(`Tient ${detail.held_item.name}`);
  }
  if (detail.known_move) {
    parts.push(`Connaît ${detail.known_move.name}`);
  }
  if (detail.known_move_type) {
    parts.push(`Connaît une capacité ${detail.known_move_type.name}`);
  }
  if (detail.location) {
    parts.push(`À ${detail.location.name}`);
  }
  if (detail.min_affection) {
    parts.push(`Affection ≥ ${detail.min_affection}`);
  }
  if (detail.min_happiness) {
    parts.push(`Bonheur ≥ ${detail.min_happiness}`);
  }
  if (detail.min_beauty) {
    parts.push(`Beauté ≥ ${detail.min_beauty}`);
  }
  if (detail.gender) {
    parts.push(`Genre ${detail.gender === 1 ? '♀' : '♂'}`);
  }
  if (detail.relative_physical_stats !== null && detail.relative_physical_stats !== undefined) {
    parts.push(detail.relative_physical_stats > 0 ? 'Attaque > Défense' : 'Attaque < Défense');
  }
  if (detail.needs_overworld_weather) {
    parts.push(`Météo : ${detail.needs_overworld_weather}`);
  }
  if (detail.time_of_day) {
    parts.push(`Période : ${detail.time_of_day}`);
  }
  if (detail.turn_upside_down) {
    parts.push('Console à l\'envers');
  }
  if (detail.trigger && detail.trigger.name === 'trade') {
    parts.unshift('Échange');
  }

  if (parts.length === 0) {
    parts.push('Évolution spéciale');
  }

  return {
    method: detail.trigger?.name || 'unknown',
    condition: parts.join(', ')
  };
}

function buildEvolutionInfo(chain, enToFr, targetFr) {
  const result = { from: null, to: [] };

  function walk(node, parentFr = null) {
    const currentEn = node.species.name;
    const currentFr = enToFr.get(currentEn);

    if (currentFr === targetFr) {
      result.from = parentFr;
      for (const child of node.evolves_to) {
        const childEn = child.species.name;
        const childFr = enToFr.get(childEn);
        if (!childFr) continue;
        const method = parseEvolutionMethod(child.evolution_details?.[0]);
        result.to.push({
          name: childFr,
          method: method.method,
          condition: method.condition
        });
      }
      return true;
    }

    for (const child of node.evolves_to) {
      const found = walk(child, currentFr);
      if (found) return true;
    }

    return false;
  }

  walk(chain);
  return result;
}

async function buildPokemonInfo() {
  const pokedex = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pokedex.json'), 'utf-8'));
  const uniqueNames = [...new Set(pokedex.map(p => p.name))];

  let frenchMapping = loadFrenchMapping();
  if (!frenchMapping) {
    frenchMapping = await buildFrenchMapping();
  }

  const frToData = new Map();
  for (const name of uniqueNames) {
    if (frenchMapping[name]) {
      frToData.set(name, frenchMapping[name]);
    }
  }

  console.log(`Mapped ${frToData.size}/${uniqueNames.length} names`);
  const missing = uniqueNames.filter(name => !frToData.has(name));
  if (missing.length) {
    console.warn('Missing mapping for:', missing.join(', '));
  }

  const enToFr = new Map();
  for (const [fr, data] of frToData) {
    enToFr.set(data.en, fr);
  }

  // Parse Excel
  const excelPath = path.join(ROOT_DIR, 'Pokedex Kanto Reforged .xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['Feuille 1'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const excelInfo = {};
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    const name = row[0];
    const heldItem = row[3];
    const addedMoves = row[4];
    if (!name) continue;
    const nameStr = String(name).trim();
    excelInfo[nameStr] = {
      heldItems: heldItem ? String(heldItem).split(/[,;]/).map(s => s.trim()).filter(Boolean) : [],
      addedMoves: addedMoves ? String(addedMoves).split('/').map(s => s.trim()).filter(Boolean) : []
    };
  }

  // Parse locations
  const locationsMd = fs.readFileSync(path.join(PUBLIC_DIR, 'Localisation Pokémon .md'), 'utf-8');
  const locations = parseLocations(locationsMd);

  // Load moves cache
  const movesCache = await loadMovesCache();

  // Fetch PokeAPI data and build info
  const info = {};
  const chainCache = new Map();

  for (const [frName, data] of frToData) {
    try {
      console.log(`Fetching info for ${frName}...`);
      const pokemonData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${data.id}`);
      const speciesData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`);

      // Evolution
      let evolution = { from: null, to: [] };
      if (speciesData.evolution_chain?.url) {
        let chainData = chainCache.get(speciesData.evolution_chain.url);
        if (!chainData) {
          chainData = await fetchWithRetry(speciesData.evolution_chain.url);
          chainCache.set(speciesData.evolution_chain.url, chainData);
        }
        evolution = buildEvolutionInfo(chainData.chain, enToFr, frName);
      }

      // Moves
      const moves = parseMoves(pokemonData, movesCache);

      info[frName] = {
        evolution,
        moves,
        heldItems: excelInfo[frName]?.heldItems || [],
        addedMoves: excelInfo[frName]?.addedMoves || [],
        locations: locations[frName] || []
      };

      console.log(`✅ ${frName}`);
    } catch (error) {
      console.error(`❌ ${frName}: ${error.message}`);
      info[frName] = {
        evolution: { from: null, to: [] },
        moves: { level_up: [], egg: [] },
        heldItems: excelInfo[frName]?.heldItems || [],
        addedMoves: excelInfo[frName]?.addedMoves || [],
        locations: locations[frName] || []
      };
    }
    await delay(POKEAPI_DELAY_MS);
  }

  // Ensure all unique names have an entry
  for (const name of uniqueNames) {
    if (!info[name]) {
      info[name] = {
        evolution: { from: null, to: [] },
        moves: { level_up: [], egg: [] },
        heldItems: excelInfo[name]?.heldItems || [],
        addedMoves: excelInfo[name]?.addedMoves || [],
        locations: locations[name] || []
      };
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, 'pokemon-info.json'), JSON.stringify(info, null, 2));
  console.log(`\nDone: ${Object.keys(info).length} entries written to src/data/pokemon-info.json`);
}

buildPokemonInfo().catch(error => {
  console.error('Failed to build pokemon info:', error);
  process.exit(1);
});
