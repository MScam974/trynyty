# Journal des modifications

## Commit 1 — Squelette du projet + extraction des données de référence

- Création de l'arborescence `css/ js/ data/ assets/ docs/`.
- Extraction en JSON (ids en minuscules, sans accent, sans espace) :
  `config.json`, `affinites.json`, `vocations.json`, `attributs.json`,
  `competences.json`, `specialisations.json`, `portraits.json`, `questionnaire.json`.
- Changement de règle imposé par les spécifications : le questionnaire
  n'utilise plus de codes numériques `[A,B,C]`. Chaque réponse stocke
  directement `affinite`, `vocation`, `attribut` (ids explicites).
- Écart corrigé : dans le prototype, l'Affinité était déduite d'une somme
  de points comparée à des seuils (9-15/16-21/22-27), alors que Vocation et
  Attribut étaient déjà déduits par comptage de votes. Les specs imposent
  le comptage de votes pour les trois axes ; ce sera appliqué dans le
  moteur au commit 2.
- En attente (non tranché) : le système de compétences "aspect fort /
  moyen / faible" décrit dans les specs remplace la matrice
  dé-Attribut + dé-Vocation → somme → niveau du prototype actuel.
  Conservé tel quel dans `config.json` (`niveauCompetence`) jusqu'à
  clarification, avant le commit dédié.
- Pas encore de moteur JS : ce commit ne contient que les données.
