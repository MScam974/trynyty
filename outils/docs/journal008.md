# Journal 008 — Commit 8 : onglet Compétences (zone Affinité + grille)

Fichiers ajoutés : `outils/js/triangle.js`, `outils/js/fiche-competences.js`,
`outils/data/triangle-affinite.json`.
Fichiers modifiés : `outils/js/loader.js` (charge le nouveau JSON),
`outils/js/fiche.js` (appelle les nouveaux rendus), `outils/fiche.html`
(zones de l'onglet Compétences), `outils/css/base.css`,
`outils/data/competences.json` (+ spécialités), `outils/data/vocations.json`
(+ symbole).

## Zone Affinité

- Texte : "Votre affinité de départ est [Nom]." — lit `personnage.affinite`.
- Schéma : ton script HTML repris et corrigé, extrait en donnée pure
  (`data/triangle-affinite.json` : points + liens + point de départ) et
  moteur générique (`triangle.js`, ne connaît aucun nom d'affinité).
- **Bug corrigé** : ton point `H` avait exactement les mêmes coordonnées
  que `J` (`[180,250]`) → supprimé (le schéma a bien 10 points visibles,
  comme sur ton image, pas 11).
- Point pré-sélectionné à l'ouverture : le centre (`personnage` "au
  milieu" à la création, selon ta règle). **Hypothèse posée, pas encore
  confirmée par toi** — dis-moi si ce n'est pas ce que tu voulais.
- La mécanique d'évolution (avancer vers un sommet en jeu) n'est **pas**
  implémentée : cliquer sur un point le sélectionne visuellement, rien
  d'autre. Décoratif/préparatoire pour l'instant, comme convenu.

## Grille des compétences

- Grille CSS (visuellement 4x4 avec les en-têtes, 3x3 de compétences
  en contenu) — en-têtes Vocations avec leur symbole (🧭/🗣️/⚔️, dans
  `vocations.json`), en-têtes Attributs en texte.
- Chaque cellule : nom, pips `X`/`O` (X = niveau déjà acquis à la
  création, O = potentiel jusqu'à 5 — la table `seuilsReussite` de
  `config.json` fixe ce maximum, pas de valeur codée en dur), et deux
  menus déroulants :
  - **Spécialité générique** : `competence.specialitesGeneriques`
    (rempli pour Combat : Arc/Épée/Lance, en exemple ; vide pour les
    8 autres, en attente de contenu de ta part).
  - **Pouvoir d'affinité** : `competence.specialitesAffinite`, filtré
    pour n'afficher que l'option correspondant à `personnage.affinite`
    (rempli pour Combat : Griffes/Crocs, Poings du Chi, Technogreffe ;
    vide pour les 8 autres).
- Les choix sont sauvegardés dans `personnage.choixSpecialites[idCompetence]`
  et persistés en localStorage à chaque changement (même mécanisme que
  les champs de profil du commit 7).

## Responsive (approximatif, à affiner)

Sous 640px de large, la grille passe en une seule colonne (chaque
compétence empilée). Ce n'est pas encore "joli/fun" comme convenu — juste
fonctionnel.

## Tests

Test bout-en-bout via serveur HTTP réel : création complète (questionnaire)
→ fiche → vérifications : 10 points affichés (pas 11), centre pré-sélectionné,
pips cohérents avec le niveau réel de la compétence, options de spécialité
correctement filtrées par affinité, persistance du choix en localStorage,
un seul point sélectionné à la fois après clic. Tout est passé.

## En attente de ta part

1. Confirmation du point de départ pré-sélectionné (centre).
2. Contenu des `specialitesGeneriques` / `specialitesAffinite` pour les
   8 compétences autres que Combat, quand tu les auras.
3. Retracé des lignes du schéma ("mal pensées" selon toi) — non touché
   ce commit, dis-moi ce qui ne va pas quand tu veux t'y pencher.

Prochain commit : à toi de choisir.
