import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '.cache');
const MAPPING_FILE = path.join(CACHE_DIR, 'french-mapping.json');
const POKEDEX_FILE = path.join(__dirname, '..', 'src', 'data', 'pokedex.json');
const BACKUP_FILE = path.join(__dirname, '..', 'src', 'data', 'pokedex.json.bak');

function extractIdFromSprite(sprite) {
  if (!sprite) return null;
  const match = sprite.match(/\/official-artwork\/(\d+)\.png$/);
  return match ? parseInt(match[1], 10) : null;
}

function buildSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function loadMapping() {
  if (!fs.existsSync(MAPPING_FILE)) {
    throw new Error(`Mapping cache not found. Run: node scripts/build-french-mapping.mjs`);
  }
  const raw = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  // Build both exact and normalized indexes
  const exact = {};
  const normalized = {};
  for (const [fr, info] of Object.entries(raw)) {
    exact[fr] = info;
    normalized[normalizeName(fr)] = info;
  }
  return { exact, normalized, raw };
}

function findInMapping(name, mapping) {
  if (mapping.exact[name]) return mapping.exact[name];
  const norm = normalizeName(name);
  if (mapping.normalized[norm]) return mapping.normalized[norm];
  return null;
}

const KNOWN_TYPOS = {
  'Carmarche': 'Carmache',
  'Mamochon': 'Mammochon',
  'Boguérise': 'Boguérisse',
  'Feunec': 'Feunnec',
  'Bagguiguane': 'Baggiguane'
};

function main() {
  const mapping = loadMapping();
  const pokedex = JSON.parse(fs.readFileSync(POKEDEX_FILE, 'utf-8'));

  fs.writeFileSync(BACKUP_FILE, JSON.stringify(pokedex, null, 2));

  const fixed = [];
  const alreadyOk = [];
  const unresolved = [];
  const nameChanges = [];

  const fixedPokedex = pokedex.map((pokemon, index) => {
    const name = KNOWN_TYPOS[pokemon.name] || pokemon.name;
    const match = findInMapping(name, mapping);
    const currentId = extractIdFromSprite(pokemon.sprite);

    if (!match) {
      unresolved.push({ index, name: pokemon.name, sprite: pokemon.sprite });
      return pokemon;
    }

    if (name !== pokemon.name) {
      nameChanges.push({ index, old: pokemon.name, new: name });
    }

    if (currentId !== match.id) {
      fixed.push({
        index,
        name: pokemon.name,
        oldId: currentId,
        newId: match.id,
        en: match.en
      });
      return {
        ...pokemon,
        name,
        sprite: buildSpriteUrl(match.id)
      };
    }

    alreadyOk.push({ index, name: pokemon.name, id: match.id });
    if (name !== pokemon.name) {
      return { ...pokemon, name };
    }
    return pokemon;
  });

  fs.writeFileSync(POKEDEX_FILE, JSON.stringify(fixedPokedex, null, 2));

  console.log('\n=== Sprite fix report ===');
  console.log(`Total entries: ${pokedex.length}`);
  console.log(`Already correct: ${alreadyOk.length}`);
  console.log(`Fixed: ${fixed.length}`);
  console.log(`Unresolved: ${unresolved.length}`);
  if (nameChanges.length) {
    console.log(`Name corrections: ${nameChanges.length}`);
  }

  if (fixed.length > 0) {
    console.log('\n--- Fixed sprites ---');
    for (const item of fixed.slice(0, 50)) {
      console.log(`#${item.index + 1} ${item.name}: ${item.oldId} → ${item.newId} (${item.en})`);
    }
    if (fixed.length > 50) {
      console.log(`... and ${fixed.length - 50} more`);
    }
  }

  if (unresolved.length > 0) {
    console.log('\n--- Unresolved names (manual check needed) ---');
    for (const item of unresolved) {
      console.log(`#${item.index + 1} "${item.name}" (current sprite: ${item.sprite})`);
    }
  }

  if (nameChanges.length > 0) {
    console.log('\n--- Name corrections ---');
    for (const item of nameChanges) {
      console.log(`#${item.index + 1} "${item.old}" → "${item.new}"`);
    }
  }

  fs.writeFileSync(
    path.join(CACHE_DIR, 'sprite-fix-report.json'),
    JSON.stringify({ fixed, unresolved, nameChanges }, null, 2)
  );
}

main();
