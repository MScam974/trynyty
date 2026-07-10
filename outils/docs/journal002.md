# Journal 002 — Commit 2 : moteur (loader.js + personnage.js)

Fichiers ajoutés : `outils/js/loader.js`, `outils/js/personnage.js`.

- `loader.js` : chargement générique des JSON (`chargerDonnees()`,
  `chargerQuestionnaire()`). Ajouter une donnée = une ligne ici, jamais
  de règle nouvelle.
- `personnage.js` : objet `personnage` unique (profil, scores, résultat
  questionnaire, affinité, attributs, vocations, compétences,
  spécialisations, équipements, pouvoirs, portrait, historique, notes).
- Comptage de votes appliqué aux **trois** axes (affinité, vocation,
  attribut) — corrige l'écart signalé au commit 1 (l'affinité était
  calculée par somme/seuils dans le prototype).
- Testé manuellement en simulant les 9 réponses du vrai questionnaire :
  comptage correct, classement Fort/Moyen/Faible → d10/d8/d6 correct.

À valider avec toi : règle d'égalité en cas de votes ex æquo (non
précisée dans les specs). Choix actuel : le premier id à avoir reçu un
vote l'emporte. Dis-moi si tu préfères autre chose (aléatoire, ordre du
fichier de données, etc.).

Pas encore fait : rendu du questionnaire à l'écran, mode Création libre,
compétences (attend la clarification fort/moyen/faible), fiche, portrait,
stockage. Prochain commit : `questionnaire.js` (rendu + interaction).
