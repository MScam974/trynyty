# Journal 024 — Commit 24 : pips ■/⬚, gestion d'un personnage existant

Fichiers modifiés : `outils/js/vue-synthetique.js`, `outils/js/app.js`,
`outils/index.html`, `outils/css/base.css`.

⚠️ Rappel : destination réelle `docs/outils/` sur ton dépôt.

## 1. Pips ■/⬚

`OO` remplacé par `■■⬚⬚⬚` — 5 cases toujours affichées (le max), pleines
= niveau acquis, vides = potentiel restant. Grille et liste synthétique
concernées.

## 2. Personnage existant : panneau de gestion sur index.html

Au chargement d'`index.html` :
- **Aucun personnage en localStorage** → comportement inchangé (onglets
  Questionnaire/Création libre visibles, comme avant).
- **Un personnage existe déjà** → les onglets Questionnaire/Création
  libre sont masqués par défaut ; à la place, un panneau "Personnage en
  cours" avec 5 actions :
  - 💾 **Sauvegarder** — sauvegarde immédiate (la plupart des actions se
    sauvegardent déjà automatiquement, ce bouton rassure/force la
    sauvegarde à la demande).
  - 📂 **Charger un JSON** — réutilise `importerPersonnageJSON` (déjà
    présent dans `stockage.js` depuis le commit 7, jamais branché à un
    bouton jusqu'ici).
  - 🔁 **Relancer le questionnaire** / 🔁 **Relancer la création
    libre** — remplace le personnage actuel par un neuf et rouvre la
    méthode choisie (confirmation demandée avant, action destructrice).
  - 🗑️ **Reset total** — efface tout (confirmation demandée).
  - Les 3 dernières sont stylées en rouge (destructrices) ; Sauvegarder/
    Charger restent neutres. Tu avais dit "deux gros boutons rouges"
    mais décrit 3 actions clairement destructrices en plus — j'ai
    stylé les 3 en rouge plutôt que d'en choisir arbitrairement 2,
    dis-moi si tu voulais vraiment limiter à 2.
- Le tableau Attributs x Vocations et le bouton "Terminer" restent
  toujours visibles en dessous, quel que soit l'état du panneau — c'est
  eux qui servent à continuer à modifier le personnage existant.

Techniquement : les actions "relancer"/"reset"/"charger" font un vrai
rechargement de page (`location.reload()`) plutôt que de essayer de
tout re-synchroniser en direct — plus simple, plus fiable, pas de
risque d'incohérence entre modules. Un flag `sessionStorage` fait
survivre l'action demandée à travers ce rechargement (pour rouvrir sur
le bon onglet).

## Tests

3 scénarios bout-en-bout : premier passage sans personnage (comportement
inchangé, panneau caché) ; second passage avec un personnage existant
(panneau visible, onglets cachés, données bien conservées, sauvegarde
manuelle fonctionnelle, "relancer questionnaire" vide bien le
personnage) ; troisième passage avec l'action forcée "questionnaire"
(panneau caché malgré un personnage existant, onglet Questionnaire
actif). Tout est passé.

Prochain commit : à toi de tester, et de me dire si tu veux vraiment
limiter à 2 boutons rouges ou garder les 3.