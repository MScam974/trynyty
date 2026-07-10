/**
 * questionnaire.js
 * Construit et gère le questionnaire à l'écran à partir des données
 * (data/questionnaire.json). Ne connaît aucun nom d'affinité, de
 * vocation ou d'attribut : il transmet simplement les réponses à
 * personnage.js, qui fait le comptage de votes.
 */

import { enregistrerReponseQuestionnaire, calculerResultatQuestionnaire } from './personnage.js';

function melanger(tableau) {
    const copie = tableau.slice();
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
}

function echapper(texte) {
    return texte.replace(/"/g, '&quot;');
}

/**
 * Initialise le questionnaire dans un conteneur DOM donné.
 *
 * @param {object} options
 * @param {HTMLElement} options.conteneur - élément qui recevra les questions
 * @param {object} options.questionnaire - contenu de data/questionnaire.json
 * @param {object} options.personnage - objet personnage (voir personnage.js)
 * @param {(etat: {nombreReponses:number, totalQuestions:number, complet:boolean, resultat:object|null}) => void} [options.surChangement]
 *        callback appelé après chaque réponse (sélection ou changement)
 * @returns {{ reponsesSelectionnees: object, recalculerScores: () => void }}
 */
export function initQuestionnaire({ conteneur, questionnaire, personnage, surChangement }) {
    const reponsesSelectionnees = {}; // { [questionId]: reponse }
    const reponsesMelangees = {};     // { [questionId]: reponse[] } - ordre d'affichage figé une fois pour toutes

    questionnaire.questions.forEach(question => {
        reponsesMelangees[question.id] = melanger(question.reponses);
    });

    function recalculerScores() {
        // On repart de zéro et on réapplique tous les choix actuels :
        // permet de changer une réponse sans fausser le comptage de votes.
        personnage.scores = { affinite: {}, vocation: {}, attribut: {} };
        Object.values(reponsesSelectionnees).forEach(reponse => {
            enregistrerReponseQuestionnaire(personnage, reponse);
        });
    }

    function notifier() {
        if (typeof surChangement !== 'function') return;

        const nombreReponses = Object.keys(reponsesSelectionnees).length;
        const totalQuestions = questionnaire.questions.length;
        const complet = nombreReponses === totalQuestions;
        const resultat = complet ? calculerResultatQuestionnaire(personnage) : null;

        surChangement({ nombreReponses, totalQuestions, complet, resultat });
    }

    function selectionnerReponse(question, reponse, carteQuestion, optionEl) {
        reponsesSelectionnees[question.id] = reponse;

        carteQuestion.classList.add('repondue');
        carteQuestion.querySelectorAll('.reponse-option').forEach(el => {
            el.classList.toggle('selectionnee', el === optionEl);
        });

        recalculerScores();
        notifier();
    }

    conteneur.innerHTML = questionnaire.questions.map((question, index) => `
        <div class="question-carte" id="question-${question.id}" data-question-id="${question.id}">
            <div class="question-numero">Question ${index + 1}/${questionnaire.questions.length}</div>
            <div class="question-texte">${question.texte}</div>
            <div class="reponses">
                ${reponsesMelangees[question.id].map(reponse => `
                    <label class="reponse-option">
                        <input type="radio" name="question-${question.id}">
                        <span class="reponse-texte">${echapper(reponse.texte)}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    questionnaire.questions.forEach(question => {
        const carteQuestion = conteneur.querySelector(`#question-${question.id}`);
        const options = carteQuestion.querySelectorAll('.reponse-option');
        options.forEach((optionEl, i) => {
            optionEl.addEventListener('click', () => {
                const reponse = reponsesMelangees[question.id][i];
                optionEl.querySelector('input').checked = true;
                selectionnerReponse(question, reponse, carteQuestion, optionEl);
            });
        });
    });

    return { reponsesSelectionnees, recalculerScores };
}
