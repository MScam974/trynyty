# Journal 023 — Commit 23 : mode Jeu / Édition

Fichier ajouté : `outils/js/vue-synthetique.js` (⚠️ à placer dans
`docs/outils/js/` sur ton dépôt, comme tout le reste depuis le
déplacement).
Fichiers modifiés : `outils/fiche.html`, `outils/js/fiche.js`,
`outils/css/base.css`.

## Principe

Un bouton dans l'en-tête ("🎮 Jeu" / "✏️ Édition") bascule toute la
fiche entre deux vues, **Jeu par défaut** à chaque ouverture.

**Reste interactif dans les deux modes** : jauges de vie, équipement
(ajout d'objet trouvé en jeu, notes) — comme convenu.

**Verrouillé en mode Jeu** (visible seulement en Édition) : dés
Vocation/Attribut, cases V/A de répartition, spécialités/pouvoirs
d'affinité, points d'expérience (saisie du total + dépense), portrait,
prompt IA. En mode Jeu, l'XP affiche juste un résumé texte (gagnés ·
dépensés · disponibles), sans possibilité de le modifier.

## Vue synthétique (Compétences + Stats, mode Jeu)

Remplace le tableau complet par : une grille compacte 4×4 (logo du dé
en rond coloré + pips `O`/`OO`/`OOO`...), puis une liste texte groupée
par Vocation (`Athlétisme d10+d10 OOO Seuil 6+`). Purement en lecture,
aucun champ. Le même composant (`vue-synthetique.js`) sert pour les
compétences actives et les passives — seule la source de niveau et la
table de seuils changent.

La vue synthétique se recalcule automatiquement dès qu'un changement
est fait côté Édition (dés, cases, dépense d'XP) — testé : dépenser un
point d'XP sur Athlétisme fait immédiatement passer sa ligne de
"OO Seuil 7+" à "OOO Seuil 6+", sans recharger la page ni changer de
mode.

## Tests

Bout-en-bout : mode Jeu actif par défaut, bascule vers Édition
vérifiée, 9 lignes synthétiques actives + 9 passives affichées,
répercussion en temps réel d'une dépense d'XP sur la vue synthétique
vérifiée, aucune régression sur les jauges de vie ni l'équipement.
Tout est passé.

Prochain commit : à toi de tester en vrai et de me dire ce qui manque
ou ce qui gêne encore.