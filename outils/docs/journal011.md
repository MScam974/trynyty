# Journal 011 — Commit 11 : portrait optionnel (panneaux repliables) + affinité en Création libre

Fichier ajouté : `outils/js/portrait.js`.
Fichiers modifiés : `outils/js/app.js`, `outils/index.html` (affinité en
Création libre) ; `outils/js/prompt-ia.js`, `outils/js/fiche.js`,
`outils/fiche.html`, `outils/css/base.css`, `outils/data/monde.json`
(portrait + style d'image).

## Correctif : affinité absente en Création libre

Bug remonté par toi : en passant uniquement par les dés (sans
questionnaire), `personnage.affinite` restait vide — les deux modes de
création ne produisaient pas le même objet. Ajouté : 3 boutons radio
dans l'onglet Création libre d'`index.html`, resynchronisés
automatiquement si le questionnaire est complété après coup (l'un
n'écrase pas silencieusement l'autre, le dernier choix gagne, comme
pour les dés).

## Portrait optionnel (panneaux repliables)

Utilise enfin `data/portraits.json` (construit au commit 1, jamais
branché). 6 panneaux `<details>` natifs dans l'onglet Personnage de la
fiche, tous facultatifs, chacun avec un "voyant" (point vert) dans son
titre dès qu'il contient une sélection :
- **Genre** (choix unique)
- **Traits de caractère** (jusqu'à `config.portrait.traitsCaracterMax`,
  soit 3 — ces mots-là sont différents des 9 traits qualité/défaut liés
  aux compétences ; ce sont les 16 archétypes façon "Farouche/Loyal/
  Cynique..." de `portraits.json`)
- **Carrure / Visage / Marques particulières / Tenue** — les 4 se
  partagent le même quota global (`traitsPhysiquesMax`, soit 4), pas un
  quota séparé chacune. Les "Marques particulières" ne montrent que les
  3 options correspondant à l'affinité du personnage.
- **Style d'image** (texte libre, pré-rempli depuis
  `data/monde.json.styleImageDefaut`)

Les options de traits physiques suggérées par les traits de caractère
choisis (champ `suggere` dans `portraits.json`) sont marquées d'une
étiquette "suggéré" — comme dans ton autre outil.

## Prompt final

Reformulé pour clarifier l'objectif (générer une image) et l'ordre de
priorité : psychologie/compétences d'abord (l'IA en déduit le
physique), puis un encart "indices physiques" **seulement s'il y a eu
au moins une sélection** dans les panneaux portrait, puis le style en
dernier. Rien de tout ça n'est obligatoire — un personnage sans aucun
panneau rempli produit un prompt purement psychologique, comme avant.

## Tests

Test bout-en-bout via serveur HTTP réel : sélection manuelle d'affinité
en Création libre → vérifiée écrasée par le résultat du questionnaire
(vote majoritaire) → sélecteur resynchronisé. Côté fiche : 3 panneaux
comptés correctement (genre=3, traits-caractère=16, marques filtrées=3
pour l'affinité du personnage), voyant qui s'allume, étiquette
"suggéré" qui apparaît correctement, quota partagé entre les 4
catégories physiques vérifié (compteur cohérent après coches dans deux
catégories différentes), prompt final contenant bien toutes les
sections attendues dans le bon ordre, persistance en localStorage
vérifiée. Tout est passé.

Prochain commit : à toi de choisir.
