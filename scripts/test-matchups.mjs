import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const matchups = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'matchups.json'), 'utf-8'));
const pokedex = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pokedex.json'), 'utf-8'));
const types = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'types.json'), 'utf-8'));

function getMultiplier(attacker, defenderTypes) {
  return defenderTypes.reduce((product, defender) => {
    return product * (matchups[attacker][defender] ?? 1);
  }, 1);
}

function runTest(pokemon, expectedMultipliers) {
  const defenderTypes = [pokemon.type1, pokemon.type2].filter(Boolean);
  console.log(`\n${pokemon.name} (${defenderTypes.join('/')})`);

  let allOk = true;
  for (const [attacker, expected] of Object.entries(expectedMultipliers)) {
    const actual = getMultiplier(attacker, defenderTypes);
    const status = actual === expected ? '✅' : '❌';
    if (actual !== expected) allOk = false;
    console.log(`  ${status} ${attacker}: ${actual}x (attendu ${expected}x)`);
  }
  return allOk;
}

console.log('Types connus:', types.length);
console.log('Pokémon connus:', pokedex.length);

let ok = true;

// Bulbizarre (GRASS/FAIRY)
ok = runTest(
  pokedex.find(p => p.name === 'Bulbizarre'),
  {
    POISON: 4,   // 2 × 2
    FIRE: 2,     // 2 × 1
    GROUND: 0.5, // 0.5 × 1
    DRAGON: 0,   // 0.5 × 0
    DARK: 0.5,   // 1 × 0.5
    STEEL: 2     // 1 × 2
  }
) && ok;

// Dracaufeu Feu/Dragon
ok = runTest(
  pokedex.find(p => p.name === 'Dracaufeu' && p.type2 === 'DRAGON'),
  {
    GROUND: 2,   // 2 × 1
    ROCK: 2,     // 2 × 1
    FAIRY: 1,    // 0.5 × 2
    STEEL: 0.5,  // 0.5 × 0.5
    FIRE: 0.25   // 0.5 × 0.5
  }
) && ok;

// Dracaufeu Feu/Vol
ok = runTest(
  pokedex.find(p => p.name === 'Dracaufeu' && p.type2 === 'FLYING'),
  {
    GROUND: 0,  // 2 × 0
    ROCK: 4,    // 2 × 2
    ELECTRIC: 2 // 1 × 2
  }
) && ok;

// Carapuce (WATER/STEEL)
ok = runTest(
  pokedex.find(p => p.name === 'Carapuce'),
  {
    ICE: 0.25,   // 0.5 × 0.5
    FIRE: 1,     // 0.5 × 2
    ELECTRIC: 2, // 2 × 1
    FIGHTING: 2, // 1 × 2
    GROUND: 2    // 1 × 2
  }
) && ok;

console.log('\n' + (ok ? '✅ Tous les tests sont validés' : '❌ Certains tests ont échoué'));
