# Journal 019 — Commit 19 : malus de surcharge chiffré

Fichiers modifiés : `outils/data/config.json`, `outils/js/equipement.js`.

Remplace le simple texte "surcharge !" par le vrai chiffre : "surcharge :
+X au seuil de réussite". Formule dans `config.equipement.surcharge`
(`malusInitial`, `palierInitial`), vérifiée avec tes propres paliers
(max=9 → 10-14:+1, 15:+2, 16:+3...).

Prochain commit : Stats — voir la discussion ci-dessous, rien codé pour
l'instant.