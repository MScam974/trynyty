/**
 * prompt-ia.js
 * Construit un prompt texte destiné à un assistant IA externe, pour
 * décrire la psychologie/les intentions/les émotions du personnage
 * (pas son apparence physique — prévue ailleurs, cf. futur générateur
 * de portrait basé sur data/portraits.json).
 * Se base sur : le contexte du monde (data/monde.json), l'affinité,
 * les rangs fort/moyen/faible des Vocations/Attributs, et les mots-clés
 * qualité/défaut des 9 compétences (competences.json). Aucun texte de
 * jeu n'est codé en dur ici.
 */

import { sauvegarderPersonnage } from './stockage.js';

function niveauVersJauge(niveau) {
    if (niveau >= 2) return 'fort';
    if (niveau === 1) return 'moyen';
    return 'faible';
}

function rangDe(taille, config) {
    return config.des.libellesForce[taille] || '—';
}

/**
 * Assemble le texte du prompt à partir des réglages faible/moyen/fort
 * actuellement choisis (personnage.traitsPsychologiques) et des données
 * de référence (contexte du monde, affinité, vocations, attributs).
 */
export function genererPrompt(personnage, donnees) {
    const { monde, affinites, vocations, attributs, competences, config } = donnees;

    const affinite = affinites.find(a => a.id === personnage.affinite);
    const ligneAffinite = affinite
        ? `Affinité : ${affinite.nom}${affinite.descriptionCourte ? ` (${affinite.descriptionCourte})` : ''}`
        : 'Affinité : non définie';

    const ligneVocations = 'Vocations : ' + vocations
        .map(v => `${v.nom} ${rangDe(personnage.vocations[v.id], config)}`)
        .join(', ');

    const ligneAttributs = 'Attributs : ' + attributs
        .map(a => `${a.nom} ${rangDe(personnage.attributs[a.id], config)}`)
        .join(', ');

    const traits = [];
    competences.forEach(competence => {
        const jauge = personnage.traitsPsychologiques[competence.id];
        if (jauge === 'fort' && competence.traitsQualite && competence.traitsQualite.length) {
            traits.push(`${competence.traitsQualite.join(' / ')} (fort)`);
        } else if (jauge === 'faible' && competence.traitsDefaut && competence.traitsDefaut.length) {
            traits.push(`${competence.traitsDefaut.join(' / ')} (faible)`);
        }
        // "moyen" : rien n'est ajouté, comme convenu.
    });
    const ligneTraits = traits.length
        ? `Traits de caractère : ${traits.join(', ')}.`
        : "Traits de caractère : (aucun trait marqué pour l'instant).";

    const lignes = [
        monde.contexte,
        '',
        "Décris ce personnage de fiction en vue de générer une image (portrait). Déduis d'abord sa psychologie, ses intentions et son apparence physique probable à partir de sa description ci-dessous (compétences, capacités). Si des indices physiques explicites sont fournis en fin de texte, respecte-les en priorité sur ce qui serait déduit.",
        ligneAffinite,
        ligneVocations,
        ligneAttributs,
        ligneTraits
    ];

    const portrait = personnage.portrait || {};
    const genre = donnees.portraits.genres.find(g => g.id === portrait.genre);
    const traitsCaractereChoisis = (portrait.traitsCaractere || [])
        .map(id => donnees.portraits.traitsCaractere.find(t => t.id === id))
        .filter(Boolean);
    const traitsPhysiquesChoisis = (portrait.traitsPhysiques || [])
        .map(id => trouverTraitPhysique(id, donnees.portraits))
        .filter(Boolean);

    const indices = [];
    if (genre) indices.push(`Genre : ${genre.nom}`);
    if (traitsCaractereChoisis.length) {
        indices.push(`Traits de caractère complémentaires : ${traitsCaractereChoisis.map(t => `${t.nom} (${t.description})`).join(', ')}`);
    }
    if (traitsPhysiquesChoisis.length) {
        indices.push(`Indices physiques : ${traitsPhysiquesChoisis.map(t => t.nom).join(', ')}`);
    }

    if (indices.length) {
        lignes.push('', ...indices);
    }

    if (personnage.styleImage) {
        lignes.push('', `Style : ${personnage.styleImage}`);
    }

    return lignes.join('\n');
}

function trouverTraitPhysique(id, portraits) {
    const { carrure, visage, marques, tenue } = portraits.traitsPhysiques;
    const toutesLesCategories = [...carrure, ...visage, ...Object.values(marques).flat(), ...tenue];
    return toutesLesCategories.find(t => t.id === id);
}

/**
 * Initialise les jauges faible/moyen/fort des 9 items et le texte du
 * prompt qui en découle. Pré-remplit chaque jauge à partir du niveau de
 * compétence déjà calculé à la création, mais reste modifiable.
 *
 * @param {object} options
 * @param {HTMLElement} options.conteneurItems
 * @param {HTMLTextAreaElement} options.champPrompt
 * @param {object} options.personnage
 * @param {object} options.donnees - résultat complet de chargerDonnees()
 */
export function initPromptIA({ conteneurItems, champPrompt, personnage, donnees }) {
    const competencesData = donnees.competences;

    if (!personnage.traitsPsychologiques) {
        personnage.traitsPsychologiques = {};
    }

    competencesData.forEach(competence => {
        if (!personnage.traitsPsychologiques[competence.id]) {
            const resultat = personnage.competences[competence.id] || { niveau: 0 };
            personnage.traitsPsychologiques[competence.id] = niveauVersJauge(resultat.niveau);
        }
    });

    function regenerer() {
        champPrompt.value = genererPrompt(personnage, donnees);
        sauvegarderPersonnage(personnage);
    }

    conteneurItems.innerHTML = competencesData.map(competence => `
        <div class="trait-item" data-competence-id="${competence.id}">
            <span class="trait-nom">${competence.nom}</span>
            <div class="trait-jauge">
                ${['faible', 'moyen', 'fort'].map(niveau => `
                    <label>
                        <input type="radio" name="trait-${competence.id}" value="${niveau}"
                            ${personnage.traitsPsychologiques[competence.id] === niveau ? 'checked' : ''}>
                        ${niveau}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    conteneurItems.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            const bloc = input.closest('.trait-item');
            personnage.traitsPsychologiques[bloc.dataset.competenceId] = input.value;
            regenerer();
        });
    });

    regenerer();

    return { regenerer };
}
