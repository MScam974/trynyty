# Journal 009 — Commit 9 : bouton prompt IA (psychologie du personnage)

Fichier ajouté : `outils/js/prompt-ia.js`.
Fichiers modifiés : `outils/js/fiche.js`, `outils/fiche.html`,
`outils/css/base.css`, `outils/data/competences.json` (+ `traitsQualite` /
`traitsDefaut` pour les 9 compétences, à partir de tes deux tableaux).

## Principe

Dans l'onglet Personnage : 9 jauges faible/moyen/fort (une par compétence
= intersection Vocation×Attribut), **pré-remplies automatiquement** à
partir du niveau déjà calculé à la création (0→faible, 1→moyen, 2→fort),
modifiables par le joueur. À chaque changement, le prompt se régénère
et se sauvegarde (localStorage).

Le prompt : une phrase d'intro qui explique à l'IA l'échelle
faible/moyen/fort, suivie des mots-clés retenus — `traitsQualite` pour
chaque item "fort", `traitsDefaut` pour chaque item "faible", **rien**
pour "moyen" (confirmé). Ne mentionne jamais l'apparence physique.

Bouton "Copier le prompt" (`navigator.clipboard`) + 4 liens qui ouvrent
ChatGPT / Claude / Copilot / Kimi dans un nouvel onglet, **sans tentative
de pré-remplissage automatique** (confirmé) : ces sites ne supportent pas
ça de façon fiable, le joueur colle lui-même.

## Portée (rappel de ce qui est volontairement exclu)

- Uniquement les 9 items Vocation×Attribut pour l'instant (comme demandé).
  Les autres catégories d'items (apparence physique "mode Fallout",
  équipement...) viendront plus tard, avec leur propre zone dans le
  prompt ou un prompt séparé.
- Spécialités/verbes étendus (les ~20 compétences façon D&D/Pathfinder +
  véhicules à 3 paliers technologiques) : mis en attente, pas traité
  ce commit.
- Tracé des lignes du triangle affinité : toujours en attente.

## Tests

Test bout-en-bout via serveur HTTP réel : création complète →
vérification que les 9 jauges sont pré-remplies exactement comme les
niveaux de compétence calculés → lecture du prompt initial → réglage
manuel de deux jauges (Combat → fort, Survie → faible) → vérification
que les bons mots-clés apparaissent dans le texte régénéré → vérification
de la persistance en localStorage → présence du bouton copier et des
4 liens. Tout est passé.

Prochain commit : à toi de choisir.
