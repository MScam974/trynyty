/**
 * portrait.js
 * Panneaux optionnels et repliables (genre, traits de caractère "à la
 * Fallout", apparence physique, style d'image). Rien n'est obligatoire :
 * ce qui n'est pas coché ici n'apparaît pas dans le prompt, qui se
 * repose alors sur la psychologie/les compétences pour induire le
 * physique (cf. prompt-ia.js). Aucune règle de jeu codée en dur : tout
 * vient de data/portraits.json et data/config.json.
 */

import { sauvegarderPersonnage } from './stockage.js';

function rafraichirVoyant(panneau, actif) {
    const voyant = panneau.querySelector('.voyant');
    if (voyant) voyant.classList.toggle('voyant-actif', actif);
}

/**
 * Panneau à choix unique (genre) : de simples radios.
 */
function initPanneauChoixUnique({ panneau, options, valeurActuelle, onChange }) {
    const conteneurOptions = panneau.querySelector('.panneau-options');
    conteneurOptions.innerHTML = options.map(option => `
        <label class="choix-option">
            <input type="radio" name="portrait-genre" value="${option.id}" ${option.id === valeurActuelle ? 'checked' : ''}>
            <span>${option.nom}</span>
        </label>
    `).join('');
    conteneurOptions.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            onChange(input.value);
            rafraichirVoyant(panneau, true);
        });
    });
    rafraichirVoyant(panneau, !!valeurActuelle);
}

/**
 * Panneau à choix multiple avec un maximum (traits de caractère,
 * traits physiques). Refuse la coche au-delà du maximum. Les options
 * dont l'id figure dans `suggeres` reçoivent une étiquette "suggéré".
 */
function initPanneauChoixMultiple({ panneau, options, selectionActuelle, maximum, suggeres, onChange }) {
    const conteneurOptions = panneau.querySelector('.panneau-options');
    const compteur = panneau.querySelector('.panneau-compteur');

    function rendre() {
        conteneurOptions.innerHTML = options.map(option => `
            <label class="choix-option">
                <input type="checkbox" value="${option.id}" ${selectionActuelle.includes(option.id) ? 'checked' : ''}>
                <span>${option.nom}</span>
                ${suggeres && suggeres.includes(option.id) ? '<span class="etiquette-suggere">suggéré</span>' : ''}
            </label>
        `).join('');

        conteneurOptions.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                if (input.checked) {
                    if (selectionActuelle.length >= maximum) {
                        input.checked = false;
                        return;
                    }
                    selectionActuelle.push(input.value);
                } else {
                    const pos = selectionActuelle.indexOf(input.value);
                    if (pos !== -1) selectionActuelle.splice(pos, 1);
                }
                onChange(selectionActuelle);
                if (compteur) compteur.textContent = `${selectionActuelle.length}/${maximum}`;
                rafraichirVoyant(panneau, selectionActuelle.length > 0);
            });
        });
    }

    if (compteur) compteur.textContent = `${selectionActuelle.length}/${maximum}`;
    rafraichirVoyant(panneau, selectionActuelle.length > 0);
    rendre();
}

/**
 * Initialise l'ensemble des panneaux du portrait (genre, traits de
 * caractère, apparence physique par catégorie, style d'image).
 *
 * @param {object} options
 * @param {HTMLElement} options.conteneur - contient les panneaux (voir fiche.html)
 * @param {object} options.personnage
 * @param {object} options.donnees - résultat de chargerDonnees()
 * @param {() => void} [options.surChangement]
 */
export function initPortrait({ conteneur, personnage, donnees, surChangement }) {
    const portraits = donnees.portraits;
    const config = donnees.config.portrait;

    if (!personnage.portrait) {
        personnage.portrait = { genre: null, traitsCaractere: [], traitsPhysiques: [] };
    }
    if (!personnage.styleImage) {
        personnage.styleImage = donnees.monde.styleImageDefaut || '';
    }

    function notifier() {
        sauvegarderPersonnage(personnage);
        if (typeof surChangement === 'function') surChangement();
    }

    // Genre
    initPanneauChoixUnique({
        panneau: conteneur.querySelector('[data-panneau="genre"]'),
        options: portraits.genres,
        valeurActuelle: personnage.portrait.genre,
        onChange: (valeur) => { personnage.portrait.genre = valeur; notifier(); }
    });

    // Traits de caractère (avec suggestions de traits physiques)
    initPanneauChoixMultiple({
        panneau: conteneur.querySelector('[data-panneau="traits-caractere"]'),
        options: portraits.traitsCaractere,
        selectionActuelle: personnage.portrait.traitsCaractere,
        maximum: config.traitsCaracterMax,
        onChange: () => {
            notifier();
            rafraichirSuggestions();
        }
    });

    // Traits physiques : 3 catégories fixes (carrure/visage/tenue) + une
    // catégorie "marques" filtrée par l'affinité du personnage. Tous
    // partagent le même quota global (config.traitsPhysiquesMax).
    const categoriesPhysiques = [
        { cle: 'carrure', options: portraits.traitsPhysiques.carrure },
        { cle: 'visage', options: portraits.traitsPhysiques.visage },
        { cle: 'marques', options: portraits.traitsPhysiques.marques[personnage.affinite] || [] },
        { cle: 'tenue', options: portraits.traitsPhysiques.tenue }
    ];

    function idsSuggeres() {
        const suggeres = new Set();
        personnage.portrait.traitsCaractere.forEach(id => {
            const trait = portraits.traitsCaractere.find(t => t.id === id);
            (trait?.suggere || []).forEach(s => suggeres.add(s));
        });
        return suggeres;
    }

    const panneauxPhysiques = [];
    function rafraichirSuggestions() {
        const suggeres = idsSuggeres();
        panneauxPhysiques.forEach(init => init(suggeres));
    }

    categoriesPhysiques.forEach(({ cle, options }) => {
        const panneau = conteneur.querySelector(`[data-panneau="physique-${cle}"]`);
        if (!panneau) return;
        const init = (suggeres) => initPanneauChoixMultiple({
            panneau,
            options,
            selectionActuelle: personnage.portrait.traitsPhysiques,
            maximum: config.traitsPhysiquesMax,
            suggeres: [...suggeres],
            onChange: () => { notifier(); rafraichirSuggestions(); }
        });
        panneauxPhysiques.push(init);
        init(idsSuggeres());
    });

    // Style d'image (texte libre, pré-rempli)
    const champStyle = conteneur.querySelector('#portrait-style');
    if (champStyle) {
        champStyle.value = personnage.styleImage;
        champStyle.addEventListener('input', () => {
            personnage.styleImage = champStyle.value;
            notifier();
        });
    }
}
