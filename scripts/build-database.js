const Database = require('better-sqlite3');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const OUTPUT_DB = path.join(__dirname, 'poke-type.db');
const EXCEL_FILE = path.join(__dirname, 'Pokedex Kanto Reforged .xlsx');

// Types dans l'ordre du tableau de matchups (génération 6+)
const TYPES = [
  { id: 1,  fr: 'Normal',    en: 'Normal',   abbr: 'NOR' },
  { id: 2,  fr: 'Feu',       en: 'Fire',     abbr: 'FIR' },
  { id: 3,  fr: 'Eau',       en: 'Water',    abbr: 'WAT' },
  { id: 4,  fr: 'Electrik',  en: 'Electric', abbr: 'ELE' },
  { id: 5,  fr: 'Plante',    en: 'Grass',    abbr: 'GRA' },
  { id: 6,  fr: 'Glace',     en: 'Ice',      abbr: 'ICE' },
  { id: 7,  fr: 'Combat',    en: 'Fighting', abbr: 'FIG' },
  { id: 8,  fr: 'Poison',    en: 'Poison',   abbr: 'POI' },
  { id: 9,  fr: 'Sol',       en: 'Ground',   abbr: 'GRO' },
  { id: 10, fr: 'Vol',       en: 'Flying',   abbr: 'FLY' },
  { id: 11, fr: 'Psy',       en: 'Psychic',  abbr: 'PSY' },
  { id: 12, fr: 'Insecte',   en: 'Bug',      abbr: 'BUG' },
  { id: 13, fr: 'Roche',     en: 'Rock',     abbr: 'ROC' },
  { id: 14, fr: 'Spectre',   en: 'Ghost',    abbr: 'GHO' },
  { id: 15, fr: 'Dragon',    en: 'Dragon',   abbr: 'DRA' },
  { id: 16, fr: 'Ténèbres',  en: 'Dark',     abbr: 'DAR' },
  { id: 17, fr: 'Acier',     en: 'Steel',    abbr: 'STE' },
  { id: 18, fr: 'Fée',       en: 'Fairy',    abbr: 'FAI' }
];

// Tableau des matchups : ligne = type attaquant, colonne = type défenseur
// Valeurs : 0 = immunisé, 0.5 = résiste, 1 = neutre, 2 = faible
const TYPE_MATCHUPS = [
  // NOR  FIR  WAT  ELE  GRA  ICE  FIG  POI  GRO  FLY  PSY  BUG  ROC  GHO  DRA  DAR  STE  FAI
  [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0.5, 0,   1,   1,   0.5, 1  ], // Normal
  [1,   0.5, 0.5, 1,   2,   2,   1,   1,   1,   1,   1,   2,   0.5, 1,   0.5, 1,   2,   1  ], // Fire
  [1,   2,   0.5, 1,   0.5, 1,   1,   1,   2,   1,   1,   1,   2,   1,   0.5, 1,   1,   1  ], // Water
  [1,   1,   2,   0.5, 0.5, 1,   1,   1,   0,   2,   1,   1,   1,   1,   0.5, 1,   1,   1  ], // Electric
  [1,   0.5, 2,   1,   0.5, 1,   1,   0.5, 2,   0.5, 1,   0.5, 2,   1,   0.5, 1,   0.5, 1  ], // Grass
  [1,   0.5, 0.5, 1,   2,   0.5, 1,   1,   2,   2,   1,   1,   1,   1,   2,   1,   0.5, 1  ], // Ice
  [2,   1,   1,   1,   1,   2,   1,   0.5, 1,   0.5, 0.5, 0.5, 2,   0,   1,   2,   2,   0.5], // Fighting
  [1,   1,   1,   1,   2,   1,   1,   0.5, 0.5, 1,   1,   1,   0.5, 0.5, 1,   1,   0,   2  ], // Poison
  [1,   2,   1,   2,   0.5, 1,   1,   2,   1,   0,   1,   0.5, 2,   1,   1,   1,   2,   1  ], // Ground
  [1,   1,   1,   0.5, 2,   1,   2,   1,   1,   1,   1,   2,   0.5, 1,   1,   1,   0.5, 1  ], // Flying
  [1,   1,   1,   1,   1,   1,   2,   2,   1,   1,   0.5, 1,   1,   1,   1,   0,   0.5, 1  ], // Psychic
  [1,   0.5, 1,   1,   2,   1,   0.5, 0.5, 1,   0.5, 2,   1,   1,   0.5, 1,   2,   0.5, 0.5], // Bug
  [1,   2,   1,   1,   1,   2,   0.5, 1,   0.5, 2,   1,   2,   1,   1,   1,   1,   0.5, 1  ], // Rock
  [0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   1,   2,   1,   0.5, 1,   1  ], // Ghost
  [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   0.5, 0  ], // Dragon
  [1,   1,   1,   1,   1,   1,   0.5, 1,   1,   1,   2,   1,   1,   2,   1,   0.5, 1,   0.5], // Dark
  [1,   0.5, 0.5, 0.5, 1,   2,   1,   1,   1,   1,   1,   1,   2,   1,   1,   1,   0.5, 2  ], // Steel
  [1,   0.5, 1,   1,   1,   1,   2,   0.5, 1,   1,   1,   1,   1,   1,   2,   2,   0.5, 0.5]  // Fairy
];

function buildDatabase() {
  if (fs.existsSync(OUTPUT_DB)) {
    fs.unlinkSync(OUTPUT_DB);
  }

  const db = new Database(OUTPUT_DB);

  db.exec(`
    CREATE TABLE types (
      id INTEGER PRIMARY KEY,
      name_fr TEXT NOT NULL,
      name_en TEXT NOT NULL,
      abbreviation TEXT NOT NULL
    );

    CREATE TABLE type_matchups (
      attacker_type_id INTEGER NOT NULL,
      defender_type_id INTEGER NOT NULL,
      multiplier REAL NOT NULL,
      PRIMARY KEY (attacker_type_id, defender_type_id),
      FOREIGN KEY (attacker_type_id) REFERENCES types(id),
      FOREIGN KEY (defender_type_id) REFERENCES types(id)
    );

    CREATE TABLE pokemons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type1_id INTEGER NOT NULL,
      type2_id INTEGER,
      held_items TEXT,
      added_moves TEXT,
      FOREIGN KEY (type1_id) REFERENCES types(id),
      FOREIGN KEY (type2_id) REFERENCES types(id)
    );

    CREATE INDEX idx_pokemons_name ON pokemons(name);
    CREATE INDEX idx_pokemons_type1 ON pokemons(type1_id);
    CREATE INDEX idx_pokemons_type2 ON pokemons(type2_id);
  `);

  const insertType = db.prepare('INSERT INTO types (id, name_fr, name_en, abbreviation) VALUES (?, ?, ?, ?)');
  const insertMatchup = db.prepare('INSERT INTO type_matchups (attacker_type_id, defender_type_id, multiplier) VALUES (?, ?, ?)');
  const insertPokemon = db.prepare('INSERT INTO pokemons (name, type1_id, type2_id, held_items, added_moves) VALUES (?, ?, ?, ?, ?)');

  const insertTypesTransaction = db.transaction(() => {
    for (const type of TYPES) {
      insertType.run(type.id, type.fr, type.en, type.abbr);
    }
  });
  insertTypesTransaction();

  const insertMatchupsTransaction = db.transaction(() => {
    for (let attackerIdx = 0; attackerIdx < 18; attackerIdx++) {
      for (let defenderIdx = 0; defenderIdx < 18; defenderIdx++) {
        const multiplier = TYPE_MATCHUPS[attackerIdx][defenderIdx];
        insertMatchup.run(attackerIdx + 1, defenderIdx + 1, multiplier);
      }
    }
  });
  insertMatchupsTransaction();

  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets['Feuille 1'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const typeByFr = new Map(TYPES.map(t => [t.fr, t.id]));

  const insertPokemonsTransaction = db.transaction(() => {
    let skipped = 0;
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const name = row[0];
      const type1Name = row[1];
      const type2Name = row[2];
      const heldItems = row[3] || null;
      const addedMoves = row[4] || null;

      if (!name || !type1Name) {
        skipped++;
        continue;
      }

      const type1Id = typeByFr.get(type1Name);
      if (!type1Id) {
        console.warn(`Type inconnu pour ${name}: "${type1Name}"`);
        skipped++;
        continue;
      }

      const type2Id = type2Name ? typeByFr.get(type2Name) : null;
      if (type2Name && !type2Id) {
        console.warn(`Type 2 inconnu pour ${name}: "${type2Name}"`);
      }

      insertPokemon.run(name, type1Id, type2Id, heldItems, addedMoves);
    }
    console.log(`Pokémon ignorés ou incomplets: ${skipped}`);
  });
  insertPokemonsTransaction();

  const stats = db.prepare('SELECT (SELECT COUNT(*) FROM types) AS types, (SELECT COUNT(*) FROM type_matchups) AS matchups, (SELECT COUNT(*) FROM pokemons) AS pokemons').get();
  console.log('Base de données créée avec succès:', stats);

  db.close();
}

buildDatabase();
