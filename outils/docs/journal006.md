# Journal 006 — Commit 6 : app.js d'assemblage + index.html + base.css

Fichiers ajoutés : `outils/index.html`, `outils/js/app.js`, `outils/css/base.css`.
Fichier modifié : `outils/js/creation.js` (ajout mineur : `initSelecteursDes`
retourne désormais `{ synchroniser }` pour permettre à `app.js` de
resynchroniser l'affichage des dés après application du résultat du
questionnaire — aucun changement de comportement, juste une méthode
exposée en plus).

## Ce que fait app.js

Point d'entrée unique. Charge toutes les données (`loader.js`), crée
l'objet `personnage` (`personnage.js`), puis initialise dans l'ordre :
onglets (`ui.js`), répartition des compétences (`competences.js`),
sélecteurs de dés (`creation.js`), questionnaire (`questionnaire.js`).

Câblage clé : quand le questionnaire est complet, `app.js` appelle
`appliquerResultatQuestionnaire()`, puis resynchronise les dés et la
répartition des compétences — concrétise la règle des specs "les deux
méthodes produisent exactement le même objet personnage".

`app.js` ne contient aucune règle de jeu : uniquement du câblage entre
modules déjà testés individuellement.

## index.html

Volontairement minimal : uniquement des zones de rendu (`<div>`/`<section>`
avec des ids), un `<nav>` d'onglets, et le `<script type="module">`.
Aucune donnée de jeu dans le HTML.

## css/base.css

Provisoire, juste pour la lisibilité pendant qu'on développe. Le vrai
découpage par composants (layout/questionnaire/fiche/responsive) reste
prévu dans un commit CSS dédié, comme prévu dans l'architecture des specs.

## Test réalisé

Test d'intégration bout-en-bout via un vrai serveur HTTP local (pas de
simulation) :
- chargement de toutes les données JSON via fetch réel,
- rendu des 9 questions,
- clic simulé sur une réponse par question,
- calcul du résultat ("Affinité : Pureté" dans ce test),
- application automatique aux dés Attribut/Vocation,
- resynchronisation des sélecteurs de dés et de la répartition des
  compétences,
- bascule d'onglet Questionnaire -> Création libre.

Tout est passé correctement. Seule limite du test : jsdom n'exécute pas
les `<script type="module">` (limitation connue de jsdom, pas du code) —
contourné en import direct du module dans le script de test. À valider
une fois en conditions réelles dans un navigateur / sur Forge Éducation.

Prochain commit : fiche de personnage (affichage récapitulatif complet),
portrait, ou stockage JSON — à toi de choisir.
