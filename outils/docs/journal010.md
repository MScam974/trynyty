# Journal 010 — Commit 10 : prompt IA enrichi (contexte, affinité, vocations/attributs)

Fichier ajouté : `outils/data/monde.json`.
Fichiers modifiés : `outils/data/affinites.json` (+ `descriptionCourte`),
`outils/js/loader.js` (charge `monde.json`), `outils/js/prompt-ia.js`
(nouveau gabarit), `outils/js/fiche.js` (nouvelle signature d'appel).

## Nouveau gabarit de prompt

Inspiré de la structure de ton autre outil (portrait IA), adapté à notre
prompt psychologie (sans apparence physique) :

```
<contexte du monde, data/monde.json>

Décris la psychologie, les intentions et les émotions du personnage
suivant (pas son apparence physique) :
Affinité : <nom> (<descriptionCourte>)
Vocations : Exploration <Fort/Moyen/Faible>, Interaction ..., Action ...
Attributs : Habileté <Fort/Moyen/Faible>, Instinct ..., Intellect ...
Traits de caractère : <mots qualité (fort)>, <mots défaut (faible)>.
```

- `data/monde.json` contient le paragraphe de contexte que tu m'as donné
  tel quel — modifiable si tu as une version plus officielle
  (`docs/fluff/monde.md`), sans toucher au moteur.
- `descriptionCourte` ajouté aux 3 affinités (`affinites.json`), mêmes
  formulations que ton exemple.
- Vocations/Attributs : le rang Fort/Moyen/Faible vient directement des
  dés du personnage (`config.des.libellesForce`), rien de codé en dur.
- `genererPrompt()` prend maintenant l'objet `donnees` complet (au lieu
  de juste `competencesData`) — signature changée, `fiche.js` mis à jour
  en conséquence.

## Portrait (apparence physique)

Toujours hors périmètre de ce commit — sujet séparé pour plus tard,
comme convenu, en s'appuyant sur `data/portraits.json` (déjà présent
depuis le commit 1, jamais encore branché à une interface).

## Note sur le débogage de ce commit

Le bug remonté par toi juste avant celui-ci (jauges absentes) n'était
finalement pas un problème de code : `outils/js/fiche.js` sur ton dépôt
ne contenait pas l'appel à `initPromptIA` (probablement une version
antérieure pas correctement sauvegardée). Remplacé intégralement, réglé.
Retiens le réflexe pour la suite : `grep -n "nomDeLaFonction" fichier.js`
dans le terminal (pas la console du navigateur) est le moyen le plus
rapide de vérifier qu'un fichier contient bien ce qu'on attend.

## Tests

Test bout-en-bout via serveur HTTP réel (avec des délais généreux cette
fois pour éviter les faux négatifs liés au timing) : le prompt généré
contient bien le contexte, la ligne Affinité, les lignes Vocations/
Attributs avec leurs rangs, et les traits de caractère cohérents avec
les jauges. Vérifié texte complet, correspond au gabarit visé.

Prochain commit : à toi de choisir — portrait/apparence physique, onglet
Stats, ou retouche esthétique des jauges (tu as dit "pas top" mais on
avait convenu de reporter l'esthétique).
