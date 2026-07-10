# Journal 003 — Commit 3 : questionnaire.js (rendu + interaction)

Fichier ajouté : `outils/js/questionnaire.js`.

- `initQuestionnaire({ conteneur, questionnaire, personnage, surChangement })` :
  rend les 9 questions dans un conteneur DOM fourni, à partir de
  `data/questionnaire.json` uniquement (aucune question codée en dur).
- Réponses mélangées à l'affichage par question (comme le prototype).
- Chaque clic recalcule entièrement les scores du personnage à partir
  de toutes les réponses actuellement sélectionnées : on peut changer
  une réponse sans fausser le comptage de votes (testé).
- `surChangement` renvoie l'état courant (nb de réponses, complet ou
  non, résultat si complet) — permettra à `ui.js` (commit à venir)
  d'activer un bouton "Valider" sans que questionnaire.js connaisse
  l'existence de ce bouton.
- Testé fonctionnellement avec jsdom (pas juste une vérification de
  syntaxe) : rendu de 9 cartes x 3 options, clic simulé sur chaque
  question, changement de réponse, calcul du résultat final —
  tout est correct.

Prochain commit : mode Création libre (matrice dés Attribut x Vocation)
+ début de `ui.js` (onglets, bascule entre les deux modes).
