const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, '..', 'Pokedex Kanto Reforged .xlsx');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const TYPES = [
  { en: 'NORMAL',   fr: 'Normal',    color: '#A8A77A' },
  { en: 'FIRE',     fr: 'Feu',       color: '#EE8130' },
  { en: 'WATER',    fr: 'Eau',       color: '#6390F0' },
  { en: 'ELECTRIC', fr: 'Electrik',  color: '#F7D02C' },
  { en: 'GRASS',    fr: 'Plante',    color: '#7AC74C' },
  { en: 'ICE',      fr: 'Glace',     color: '#96D9D6' },
  { en: 'FIGHTING', fr: 'Combat',    color: '#C22E28' },
  { en: 'POISON',   fr: 'Poison',    color: '#A33EA1' },
  { en: 'GROUND',   fr: 'Sol',       color: '#E2BF65' },
  { en: 'FLYING',   fr: 'Vol',       color: '#A98FF3' },
  { en: 'PSYCHIC',  fr: 'Psy',       color: '#F95587' },
  { en: 'BUG',      fr: 'Insecte',   color: '#A6B91A' },
  { en: 'ROCK',     fr: 'Roche',     color: '#B6A136' },
  { en: 'GHOST',    fr: 'Spectre',   color: '#735797' },
  { en: 'DRAGON',   fr: 'Dragon',    color: '#6F35FC' },
  { en: 'DARK',     fr: 'Ténèbres',  color: '#705746' },
  { en: 'STEEL',    fr: 'Acier',     color: '#B7B7CE' },
  { en: 'FAIRY',    fr: 'Fée',       color: '#D685AD' }
];

// Tableau des efficacités : clé = attaquant, valeur = { défenseur: multiplicateur }
// Seuls les effets non-neutres (différents de 1) sont stockés.
const TYPE_MATCHUPS = {
  NORMAL:   { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:     { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER:    { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC: { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS:    { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ICE:      { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
  POISON:   { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
  GROUND:   { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING:   { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:  { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:      { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5 },
  ROCK:     { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:    { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON:   { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK:     { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL:    { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5, FAIRY: 2 },
  FAIRY:    { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 }
};

const FR_TO_EN = {
  'Normal': 'NORMAL',
  'Feu': 'FIRE',
  'Eau': 'WATER',
  'Electrik': 'ELECTRIC',
  'Plante': 'GRASS',
  'Glace': 'ICE',
  'Combat': 'FIGHTING',
  'Poison': 'POISON',
  'Sol': 'GROUND',
  'Vol': 'FLYING',
  'Psy': 'PSYCHIC',
  'Insecte': 'BUG',
  'Roche': 'ROCK',
  'Spectre': 'GHOST',
  'Dragon': 'DRAGON',
  'Ténèbres': 'DARK',
  'Acier': 'STEEL',
  'Fée': 'FAIRY'
};

function normalizeType(frName) {
  const normalized = frName.trim();
  const en = FR_TO_EN[normalized];
  if (!en) {
    throw new Error(`Type français inconnu : "${normalized}"`);
  }
  return en;
}

function buildData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Générer types.json
  const typesJson = TYPES.map((t, index) => ({
    id: index + 1,
    en: t.en,
    fr: t.fr,
    color: t.color
  }));
  fs.writeFileSync(path.join(DATA_DIR, 'types.json'), JSON.stringify(typesJson, null, 2));

  // Générer matchups.json (complet avec valeurs implicites 1)
  const matchupsJson = {};
  for (const attacker of TYPES) {
    matchupsJson[attacker.en] = {};
    for (const defender of TYPES) {
      const explicit = TYPE_MATCHUPS[attacker.en]?.[defender.en];
      matchupsJson[attacker.en][defender.en] = explicit !== undefined ? explicit : 1;
    }
  }
  fs.writeFileSync(path.join(DATA_DIR, 'matchups.json'), JSON.stringify(matchupsJson, null, 2));

  // Générer pokedex.json
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets['Feuille 1'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const pokemons = [];
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    const name = row[0];
    const type1Fr = row[1];
    const type2Fr = row[2];

    if (!name || !type1Fr) continue;

    pokemons.push({
      name: String(name).trim(),
      type1: normalizeType(type1Fr),
      type2: type2Fr ? normalizeType(type2Fr) : null
    });
  }

  fs.writeFileSync(path.join(DATA_DIR, 'pokedex.json'), JSON.stringify(pokemons, null, 2));

  console.log('Données générées avec succès :');
  console.log(`- types.json : ${typesJson.length} types`);
  console.log(`- matchups.json : ${Object.keys(matchupsJson).length} attaquants`);
  console.log(`- pokedex.json : ${pokemons.length} Pokémon`);
}

buildData();
