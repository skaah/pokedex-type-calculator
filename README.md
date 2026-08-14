# Poké-type

Application web statique permettant de connaître les faiblesses, résistances et immunités d'un Pokémon selon ses types.

## Fonctionnalités

- **Recherche par Pokémon** : autocomplétion sur les 446 Pokémon du Pokédex Kanto Reforged avec navigation clavier.
- **Sélection manuelle des types** : grille des 18 types, sélection de 1 ou 2 types.
- **Calcul des efficacités** : produit des multiplicateurs pour les Pokémon à double type.
- **Affichage clair** : faiblesses (×4, ×2), résistances (×0.5, ×0.25), immunités (×0) et dégâts neutres (×1).

## Stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Prérequis

- [Node.js](https://nodejs.org/) >= 18

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Build

```bash
npm run build
```

Le dossier de sortie est `dist/`.

## Regénérer les données

Les données du Pokédex sont extraites du fichier Excel source :

```bash
node scripts/build-data.js
```

Cela génère :
- `src/data/pokedex.json`
- `src/data/types.json`
- `src/data/matchups.json`

## Déploiement

### Netlify

1. Pousse le dépôt sur GitHub/GitLab.
2. Connecte le dépôt à [Netlify](https://www.netlify.com/).
3. Laisse la configuration par défaut ou vérifie :
   - Build command : `npm run build`
   - Publish directory : `dist`
4. Déploie.

Le fichier `netlify.toml` est déjà inclus.

### Vercel

1. Pousse le dépôt sur GitHub/GitLab.
2. Importe le projet sur [Vercel](https://vercel.com/).
3. Vérifie les paramètres :
   - Framework Preset : `Vite`
   - Build Command : `npm run build`
   - Output Directory : `dist`
4. Déploie.

Le fichier `vercel.json` est déjà inclus.

## Structure du projet

```
Poke-type/
├── public/
│   └── pokeball.svg
├── scripts/
│   └── build-data.js
├── src/
│   ├── components/
│   │   ├── MatchupSection.tsx
│   │   ├── PokemonSearch.tsx
│   │   ├── TypeBadge.tsx
│   │   └── TypeGrid.tsx
│   ├── data/
│   │   ├── matchups.json
│   │   ├── pokedex.json
│   │   └── types.json
│   ├── hooks/
│   │   └── usePokemonSearch.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── matchups.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── netlify.toml
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## Licence

Projet personnel basé sur les données Pokémon.
