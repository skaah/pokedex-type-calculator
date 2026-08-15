# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.2.1] - 2026-08-15

### Corrigé
- Correction de 59 sprites incorrects dans `src/data/pokedex.json` en recroisant les noms français avec les IDs officiels de [Poképedia](https://www.pokepedia.fr/) / [PokeAPI](https://pokeapi.co/).
- Correction de 5 fautes d'orthographe dans les noms Pokémon :
  - `Carmarche` → `Carmache` (#444)
  - `Mamochon` → `Mammochon` (#473)
  - `Boguérise` → `Boguérisse` (#651)
  - `Feunec` → `Feunnec` (#653)
  - `Bagguiguane` → `Baggiguane` (#559)

## [1.2.0] - 2024-08-14

### Ajouté
- Animation de sprites Pokémon en arrière-plan (`FloatingSprites`).
- Les sprites apparaissent de façon aléatoire sur tout l’écran, en dehors du cadre principal.
- Animation CSS douce : fade-in, flottement vertical, fade-out.

### Modifié
- Augmentation de l’opacité des sprites flottants pour une meilleure visibilité.

## [1.1.0] - 2024-08-14

### Ajouté
- Navigation par évolutions et variantes.
- Affichage de la pré-évolution à gauche et de l’évolution suivante à droite.
- Affichage des variantes de type (ex. Dracaufeu Feu/Dragon ↔ Feu/Vol) en dessous du Pokémon sélectionné.
- Cartes d’évolution cliquables pour naviguer dans les familles d’évolution.
- Script `scripts/fetch-evolutions.mjs` pour générer `src/data/evolutions.json` via PokeAPI.
- Composant `EvolutionNav` et utilitaires `src/utils/evolutions.ts`.

### Modifié
- Les sprites sont désormais affichés directement, sans cadre intermédiaire, dans la recherche, le Pokémon sélectionné, les évolutions et les variantes.
- Agrandissement du cadre principal (`max-w-2xl` → `max-w-4xl`).
- Bordure du Pokémon sélectionné passée au blanc pour le distinguer des sections Défense/Attaque.
- Bordures des résultats : bleues en mode Défense, rouges en mode Attaque.
- Onglets d’entrée : « Recherche Pokémon » en bleu, « Sélection manuelle » en vert.

## [1.0.0] - 2024-08-14

### Ajouté
- Version initiale de **Poké-type**.
- Calculateur de faiblesses, résistances et immunités Pokémon.
- Modes Défense et Attaque.
- Recherche de Pokémon avec suggestions.
- Sélection manuelle de types.
- Génération de la base de données depuis le fichier Excel `Pokedex Kanto Reforged .xlsx`.
