/**
 * prompt-ia.js
 * Construit un prompt texte destiné à un assistant IA externe, pour
 * décrire la psychologie/les intentions/les émotions du personnage
 * (pas son apparence physique — prévue ailleurs, cf. spec "mode Fallout").
 * Se base sur les 9 compétences (intersections Vocation×Attribut) :
 * chacune a des mots-clés "qualité" (trait fort) et "défaut" (trait
 * faible) dans competences.json. Aucun mot n'est codé en dur ici.
 */

import { sauvegarderPersonnage } from './stockage.js';

const INTRODUCTION = "Décris la psychologie, les intentions et les émotions d'un personnage de fiction (pas son apparence physique), à partir des traits de caractère suivants, classés par intensité : \"faible\" signifie un trait peu présent, \"moyen\" est neutre et n'apporte pas d'indication, \"fort\" signifie un trait marqué chez le personnage.";

function niveauVersJauge(niveau) {
    if (niveau >= 2) return 'fort';
    if (niveau === 1) return 'moyen';
    return 'faible';
}

/**
 * Assemble le texte du prompt à partir des réglages faible/moyen/fort
 * actuellement choisis (personnage.traitsPsychologiques).
 */
export function genererPrompt(personnage, competencesData) {
    const traits = [];

    competencesData.forEach(competence => {
        const jauge = personnage.traitsPsychologiques[competence.id];
        if (jauge === 'fort' && competence.traitsQualite && competence.traitsQualite.length) {
            traits.push(`${competence.traitsQualite.join(' / ')} (fort)`);
        } else if (jauge === 'faible' && competence.traitsDefaut && competence.traitsDefaut.length) {
            traits.push(`${competence.traitsDefaut.join(' / ')} (faible)`);
        }
        // "moyen" : rien n'est ajouté, comme convenu.
    });

    if (traits.length === 0) {
        return INTRODUCTION;
    }

    return `${INTRODUCTION}\n\nTraits : ${traits.join(', ')}.`;
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
 * @param {object[]} options.competencesData
 */
export function initPromptIA({ conteneurItems, champPrompt, personnage, competencesData }) {
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
        champPrompt.value = genererPrompt(personnage, competencesData);
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
}
