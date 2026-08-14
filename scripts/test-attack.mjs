import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const matchupsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'matchups.json'), 'utf-8'));
const typesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'types.json'), 'utf-8'));

function computeAttackMatchups(attackerTypes) {
  return typesData.map(type => {
    const multiplier = attackerTypes.reduce((product, attacker) => {
      return product * (matchupsData[attacker]?.[type.en] ?? 1);
    }, 1);
    return {
      defender: type.en,
      defenderFr: type.fr,
      multiplier
    };
  });
}

function categorizeAttackMatchups(matchupsList) {
  const result = {
    veryStrong: [],
    strong: [],
    neutral: [],
    weak: [],
    veryWeak: [],
    noEffect: []
  };

  for (const m of matchupsList) {
    if (m.multiplier === 0) result.noEffect.push(m);
    else if (m.multiplier === 0.25) result.veryWeak.push(m);
    else if (m.multiplier === 0.5) result.weak.push(m);
    else if (m.multiplier === 1) result.neutral.push(m);
    else if (m.multiplier === 2) result.strong.push(m);
    else if (m.multiplier === 4) result.veryStrong.push(m);
  }

  return result;
}

// Test: Eau seul
let result = categorizeAttackMatchups(computeAttackMatchups(['WATER']));
console.log('Eau seul - Attaque:');
console.log('Fort ×2:', result.strong.map(m => m.defenderFr).join(', '));
console.log('Peu efficace ×0.5:', result.weak.map(m => m.defenderFr).join(', '));
console.log('Sans effet ×0:', result.noEffect.map(m => m.defenderFr).join(', '));

// Test: Plante/Fée
result = categorizeAttackMatchups(computeAttackMatchups(['GRASS', 'FAIRY']));
console.log('\nPlante/Fée - Attaque:');
console.log('Très fort ×4:', result.veryStrong.map(m => m.defenderFr).join(', '));
console.log('Fort ×2:', result.strong.map(m => m.defenderFr).join(', '));
console.log('Très peu efficace ×0.25:', result.veryWeak.map(m => m.defenderFr).join(', '));
console.log('Peu efficace ×0.5:', result.weak.map(m => m.defenderFr).join(', '));
console.log('Sans effet ×0:', result.noEffect.map(m => m.defenderFr).join(', '));
