# Journal 015 — Commit 15 : nettoyage, prompt scindé, progression XP

Fichiers modifiés : `outils/js/tableau-competences.js`, `outils/js/competences.js`
(export de `seuilPourNiveau`), `outils/js/fiche.js`, `outils/fiche.html`,
`outils/css/base.css`.

## 1. Fichiers à supprimer manuellement

`competences.js` reste utile (ses fonctions `determinerRangs`/
`recalculerNiveaux`/`seuilPourNiveau` sont réutilisées par
`tableau-competences.js`) — **garde-le**. En revanche `creation.js`
n'est plus utilisé nulle part (sa logique de dés a été absorbée par
`tableau-competences.js`). Tu peux supprimer :

```bash
rm outils/js/creation.js
```

## 2. Prompt IA scindé en deux

Le bloc "Prompt IA" contient maintenant :
- le texte généré + les boutons (toujours visible)
- un panneau imbriqué "Données détaillées" (repliable) contenant les 9
  jauges — exactement ce que tu voulais ("le prompt seul visible, les
  données en div visible/invisible").

## 3. Progression par points d'expérience (XP)

- Encart "Points d'expérience" sur l'onglet Personnage de la fiche :
  total gagné (saisie libre), dépensés, disponibles (calculés).
- Sur chaque compétence de la fiche (mode lecture du tableau) : 3
  cases à cocher supplémentaires, en plus des 2 cases V/A de la
  création. Chaque case = 1 point d'expérience dépensé. Remplissage
  dans l'ordre obligatoire (impossible de cocher la case 3 avant la 2),
  décocher rend le point.
- Le niveau affiché sur la fiche est maintenant "niveau de création +
  points XP dépensés" (jusqu'à 5, plafond naturel puisqu'il y a
  toujours exactement 3 cases XP quel que soit le niveau de départ —
  0+3=3 pour une compétence faible, 2+3=5 pour une compétence forte,
  conforme à ta règle).
- Le "niveau de création" (celui utilisé par `personnage.competences`,
  qui sert aussi de pré-remplissage aux jauges du prompt IA) n'est PAS
  modifié par la progression — seul l'affichage sur la fiche montre le
  total. Dis-moi si tu veux au contraire que les jauges psychologiques
  du prompt évoluent aussi avec l'XP.

## Bug trouvé et corrigé en cours de route

`seuilPourNiveau()` retournait déjà directement la chaîne ("7+"), pas
un objet — mon premier essai appelait `.seuil` dessus en trop, ce qui
affichait "Seuil undefined". Corrigé et vérifié par test.

## Tests

Bout-en-bout : refus de cocher sans XP disponible, dépense correcte,
remplissage séquentiel imposé, décoche qui rend le point, affichage
"XP disponibles" qui se répercute en temps réel après un clic sur une
case de compétence (pas seulement après une modification du total),
persistance en localStorage vérifiée. Tout est passé.

Prochain commit : à toi de choisir.