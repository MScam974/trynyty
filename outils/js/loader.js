/**
 * loader.js
 * Chargement générique des fichiers de données du moteur.
 * Ne connaît aucune règle métier : il sait uniquement lire des JSON.
 */

const DOSSIER_DONNEES = 'data/';

/**
 * Charge un fichier JSON du dossier data/.
 * @param {string} nomFichier - nom sans extension (ex: "affinites")
 */
async function chargerJSON(nomFichier) {
    const url = `${DOSSIER_DONNEES}${nomFichier}.json`;
    const reponse = await fetch(url);
    if (!reponse.ok) {
        throw new Error(`Impossible de charger ${url} (HTTP ${reponse.status})`);
    }
    return reponse.json();
}

/**
 * Charge l'ensemble des données de référence du moteur.
 * Ajouter une nouvelle donnée (ex: "armes") ne doit nécessiter
 * qu'une ligne ici, jamais de nouvelle règle dans le moteur.
 */
export async function chargerDonnees() {
    const [
        config,
        affinites,
        vocations,
        attributs,
        competences,
        specialisations,
        portraits
    ] = await Promise.all([
        chargerJSON('config'),
        chargerJSON('affinites'),
        chargerJSON('vocations'),
        chargerJSON('attributs'),
        chargerJSON('competences'),
        chargerJSON('specialisations'),
        chargerJSON('portraits')
    ]);

    return { config, affinites, vocations, attributs, competences, specialisations, portraits };
}

/**
 * Charge un questionnaire donné (plusieurs questionnaires pourront coexister,
 * cf. specs : Classique, Rapide, Narratif...).
 * @param {string} id - identifiant du fichier, "questionnaire" par défaut
 */
export async function chargerQuestionnaire(id = 'questionnaire') {
    return chargerJSON(id);
}
