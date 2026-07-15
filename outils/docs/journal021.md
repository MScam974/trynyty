# Journal 021 — Commit 21 : plancher d'encombrement minimum

Fichiers modifiés : `outils/data/config.json`, `outils/js/equipement.js`.

Corrige le bug remonté (encombrement max = 0 pour un personnage
Habileté faible + Exploration faible, forcé en surcharge dès la
création). `config.equipement.encombrementMax.plancherMinimum = 5` :
le max ne descend jamais sous 5, quels que soient les rangs. Les
contenants (sac à dos +3 etc.) s'ajoutent toujours par-dessus ce
plancher, pas remplacés par lui.

Formule de malus (commit 19) inchangée — voir ma remarque dans le fil :
avec le nouveau plancher à 5, elle donne 0-5 rien / 6-10 → +1 / 11 →
+2 / 12 → +3... Dis-moi si tu voulais vraiment +1 pile à 11 (formule
légèrement différente), sinon rien à changer.

## Tests

Vérifié : Habileté faible + Exploration faible → max=5 (au lieu de 0).
Ajout d'un sac à dos (+3) → max passe à 8 (le plancher et le bonus de
contenant s'additionnent correctement, pas de double-plancher).

Prochain commit : à toi de choisir — confirmation sur le point de
malus à 11, ou on enchaîne sur la restructuration de la création.