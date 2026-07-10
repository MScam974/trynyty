/**
 * personnage.js
 * Gère l'unique objet `personnage` et les règles génériques de comptage
 * de votes (questionnaire). Ne contient aucun nom de compétence, de
 * vocation ou d'affinité codé en dur : tout est passé en paramètre
 * depuis les données JSON.
 */

/**
 * Crée un objet personnage vide, structure unique manipulée par tout le moteur.
 */
export function creerPersonnage() {
    return {
        profil: { nom: '', joueur: '', concept: '' },
        scores: { affinite: {}, vocation: {}, attribut: {} },
        resultatQuestionnaire: { affinite: null, vocation: null, attribut: null },
        affinite: null,
        attributs: {},
        vocations: {},
        competences: {},
        specialisations: [],
        equipements: [],
        pouvoirs: [],
        portrait: { genre: null, traitsCaractere: [], traitsPhysiques: [] },
        historique: { relique: '', histoire: '', liens: '' },
        notes: ''
    };
}

function incrementer(compteur, id) {
    compteur[id] = (compteur[id] || 0) + 1;
}

/**
 * Enregistre une réponse du questionnaire dans les scores du personnage.
 * Comptage de votes uniquement (aucune somme, aucune moyenne).
 * @param {object} personnage
 * @param {{affinite:string, vocation:string, attribut:string}} reponse
 */
export function enregistrerReponseQuestionnaire(personnage, reponse) {
    incrementer(personnage.scores.affinite, reponse.affinite);
    incrementer(personnage.scores.vocation, reponse.vocation);
    incrementer(personnage.scores.attribut, reponse.attribut);
}

/**
 * Retourne l'id ayant reçu le plus de votes dans un compteur.
 * En cas d'égalité : le premier id à avoir reçu un vote l'emporte
 * (ordre d'insertion). Hypothèse à valider avec toi, les specs ne
 * précisent pas de règle d'égalité.
 */
export function categorieMajoritaire(compteur) {
    let meilleurId = null;
    let meilleurScore = -1;
    for (const [id, score] of Object.entries(compteur)) {
        if (score > meilleurScore) {
            meilleurScore = score;
            meilleurId = id;
        }
    }
    return meilleurId;
}

/**
 * Classe une liste d'ids connus par nombre de votes décroissant.
 * Les ids sans vote sont inclus avec un score de 0.
 * @param {object} compteur
 * @param {string[]} idsConnus - tous les ids possibles pour cet axe
 */
export function classerParVotes(compteur, idsConnus) {
    return idsConnus
        .map(id => ({ id, score: compteur[id] || 0 }))
        .sort((a, b) => b.score - a.score)
        .map(entree => entree.id);
}

/**
 * Calcule le résultat du questionnaire (catégorie majoritaire par axe)
 * et le stocke dans personnage.resultatQuestionnaire.
 */
export function calculerResultatQuestionnaire(personnage) {
    personnage.resultatQuestionnaire = {
        affinite: categorieMajoritaire(personnage.scores.affinite),
        vocation: categorieMajoritaire(personnage.scores.vocation),
        attribut: categorieMajoritaire(personnage.scores.attribut)
    };
    return personnage.resultatQuestionnaire;
}

/**
 * Applique le résultat du questionnaire au personnage :
 * - l'affinité retenue est la catégorie majoritaire
 * - vocations et attributs sont classés (Fort/Moyen/Faible -> d10/d8/d6)
 *   selon leur nombre de votes, comme dans le prototype d'origine.
 * @param {object} personnage
 * @param {string[]} idsVocations - ids de toutes les vocations (data/vocations.json)
 * @param {string[]} idsAttributs - ids de tous les attributs (data/attributs.json)
 */
export function appliquerResultatQuestionnaire(personnage, idsVocations, idsAttributs) {
    const taillesDe = ['d10', 'd8', 'd6'];

    classerParVotes(personnage.scores.vocation, idsVocations).forEach((id, rang) => {
        personnage.vocations[id] = taillesDe[rang];
    });

    classerParVotes(personnage.scores.attribut, idsAttributs).forEach((id, rang) => {
        personnage.attributs[id] = taillesDe[rang];
    });

    personnage.affinite = categorieMajoritaire(personnage.scores.affinite);

    return personnage;
}
