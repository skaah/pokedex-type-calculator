# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.3.2] - 2026-08-16

### Modifié
- Le champ de recherche est désormais vidé automatiquement après la sélection d'un Pokémon, permettant de lancer une nouvelle recherche sans action manuelle.

### Corrigé
- Correction du vidage effectif du champ de recherche dans `PokemonSearch.tsx` (l'état local écrasait précédemment la valeur avec le nom du Pokémon sélectionné).

## [1.3.1] - 2026-08-15

### Ajouté
- Intégration de **Vercel Analytics** (`@vercel/analytics`) pour suivre les visites et les pages vues.

## [1.3.0] - 2026-08-15

### Ajouté
- Bouton "Info" sur la carte du Pokémon sélectionné, ouvrant une fenêtre popup scrollable fermable par une croix en haut à droite.
- Affichage dans la popup des informations détaillées d'un Pokémon :
  - **Évolution** : niveau d'évolution, objet spécial ou autre condition (données [Poképedia](https://www.pokepedia.fr/) / [PokeAPI](https://pokeapi.co/)).
  - **Capacités** : capacités apprises par niveau, CT/Capsules et Tuteur, complétées par les attaques ajoutées par les développeurs depuis le fichier Excel.
  - **Objets tenus** : objets que le Pokémon peut porter en sauvage (colonne D du fichier Excel).
  - **Localisation** : zones de rencontre et méthode d'acquisition (surf, pêche, etc.) depuis `public/Localisation Pokémon .md`.
- Script `scripts/build-pokemon-info.mjs` pour générer `src/data/pokemon-info.json` à partir de PokeAPI, du fichier Excel et du Markdown de localisation.

### Corrigé
- Correction d'un bug où la section Évolution affichait "Ce Pokémon n'évolue pas" pour des Pokémon possédant pourtant une évolution (problème de casse dans le cache de mapping français PokeAPI).

### Modifié
- Suppression des catégories "CT / Capsules" et "Tuteur" dans la popup d'informations ; seules les capacités par niveau, les capacités par Oeuf et les attaques ajoutées par les développeurs sont affichées.

## [1.2.2] - 2026-08-15

### Ajouté
- Section "Journal des mises à jour" affichant le contenu de `CHANGELOG.md` directement sur le site.
- Bouton fixe en bas de page ouvrant le changelog dans un panneau bottom-sheet qui s'expand vers le haut.
- Backdrop sombre permettant de fermer le changelog en cliquant à l'extérieur du panneau.

### Modifié
- Le changelog n'est plus affiché en permanence ; il est désormais accessible via le bouton dédié.
- Amélioration de la visibilité du dropdown de suggestions Pokémon (meilleure opacité, z-index plus élevé, ombre renforcée).
- Sens des flèches du bottom-sheet ajusté pour refléter logiquement l'expansion vers le haut et le collapse vers le bas.

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
