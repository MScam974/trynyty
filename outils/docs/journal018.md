# Journal 018 — Commit 18 : interface Équipement

Fichier ajouté : `outils/js/equipement.js`.
Fichiers modifiés : `outils/js/personnage.js` (champs `note` et
`emplacementCreation` documentés), `outils/js/fiche.js`,
`outils/fiche.html`, `outils/css/base.css`.

## Ce qui est livré

Onglet Équipement de la fiche :
- **Encombrement affiché** : "X / Y" + une ligne de pips (●○○○) — Y est
  calculé automatiquement (bonus Exploration + bonus Habileté + bonus
  des contenants portés, ex: sac à dos), X = somme de l'encombrement
  réellement porté.
- **3 emplacements de création fixes**, toujours présents, qualité
  verrouillée par l'emplacement (1/2/3 — non modifiable) : Objet
  fragile, Objet ordinaire, Objet de qualité. Le joueur choisit
  librement le type d'objet (menu déroulant, toutes catégories
  mélangées avec la compétence associée affichée).
- **Objets trouvés en jeu** : bouton "+ Ajouter un objet trouvé en
  jeu", qualité éditable (0 à 5, toutes les valeurs disponibles y
  compris 4/5 — la restriction "pas de 4/5 à la création" ne s'applique
  qu'aux 3 emplacements fixes), bouton retirer.
- **Note libre** à côté de chaque objet, sauvegardée à la frappe.

## Choix d'implémentation (intuition, à valider)

- Pas de blocage strict en cas de surcharge (encombrement utilisé >
  max) : juste un texte en rouge "surcharge !". Bloquer aurait pu
  gêner en cours de partie (le MJ peut vouloir autoriser un dépassement
  temporaire) — dis-moi si tu préfères un vrai blocage.
- Le champ `affiniteObjet` (0-3, pouvoirs d'affinité) existe dans la
  structure de données mais n'a pas d'interface pour l'instant — pas
  demandé, pas ajouté, pour rester "basique" comme convenu.
- Le nom personnalisé d'objet ("Dard") : pas de champ dédié, mais rien
  n'empêche de l'écrire dans la note libre pour l'instant.

## Tests

Bout-en-bout : encombrement max correctement calculé depuis les rangs
réels du personnage (Habileté fort + Exploration fort → 4), 3
emplacements toujours présents avec qualité en lecture seule, ajout
d'une épée dans l'emplacement "Objet de qualité" → encombrement mis à
jour, note persistée en localStorage, ajout d'un objet trouvé en jeu
(qualité éditable, bouton retirer présent), sac à dos qui augmente
bien la capacité max (4→7), retrait qui fait revenir à 3 lignes. Tout
est passé.

Prochain commit : à toi de choisir.