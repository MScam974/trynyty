/**
 * creation.js
 * Mode "Création libre" : le joueur choisit la taille de dé de chaque
 * Attribut et de chaque Vocation (d10 = Fort, d8 = Moyen, d6 = Faible).
 * Ce module ne calcule plus le niveau des compétences : c'est le rôle
 * de competences.js, qui applique le système Fort/Moyen/Faible.
 */

function affecterDe(cible, id, taille) {
    const dejaUtilisePar = Object.entries(cible).find(([autreId, v]) => autreId !== id && v === taille);
    const ancienneTaille = cible[id] ?? null;
    if (dejaUtilisePar) {
        cible[dejaUtilisePar[0]] = ancienneTaille;
    }
    cible[id] = taille;
}

/**
 * Initialise les sélecteurs de dés (Attributs et Vocations).
 *
 * @param {object} options
 * @param {HTMLElement} options.conteneurAttributs
 * @param {HTMLElement} options.conteneurVocations
 * @param {object} options.personnage
 * @param {object[]} options.attributsData - data/attributs.json
 * @param {object[]} options.vocationsData - data/vocations.json
 * @param {object} options.config - data/config.json
 * @param {(personnage: object) => void} [options.surChangement] - appelé après chaque changement de dé
 */
export function initSelecteursDes(options) {
    const { conteneurAttributs, conteneurVocations, personnage, attributsData, vocationsData, config, surChangement } = options;
    const tailles = config.des.tailles;

    function rendre(conteneur, items, cible, prefixeGroupe) {
        conteneur.innerHTML = items.map(item => `
            <div class="selecteur-de" data-id="${item.id}">
                <div class="selecteur-de-titre">${item.nom} <span class="hint">— ${item.indice || ''}</span></div>
                <div class="selecteur-de-options">
                    ${tailles.map(taille => `
                        <label class="de-option">
                            <input type="radio" name="${prefixeGroupe}-${item.id}" value="${taille}">
                            <span class="de-icone">${taille.toUpperCase()}</span>
                            <span class="de-libelle">${config.des.libellesForce[taille] || ''}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        conteneur.querySelectorAll('.selecteur-de').forEach(bloc => {
            const id = bloc.dataset.id;
            bloc.querySelectorAll('input[type="radio"]').forEach(input => {
                input.addEventListener('change', () => {
                    affecterDe(cible, id, input.value);
                    synchroniser();
                    if (typeof surChangement === 'function') surChangement(personnage);
                });
            });
        });
    }

    function synchroniser() {
        [
            [conteneurAttributs, personnage.attributs],
            [conteneurVocations, personnage.vocations]
        ].forEach(([conteneur, cible]) => {
            conteneur.querySelectorAll('.selecteur-de').forEach(bloc => {
                const id = bloc.dataset.id;
                const taille = cible[id];
                bloc.querySelectorAll('input[type="radio"]').forEach(input => {
                    input.checked = !!taille && input.value === taille;
                });
            });
        });
    }

    rendre(conteneurAttributs, attributsData, personnage.attributs, 'attribut');
    rendre(conteneurVocations, vocationsData, personnage.vocations, 'vocation');
    synchroniser();

    return { synchroniser };
}