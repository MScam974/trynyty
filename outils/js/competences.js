/**
 * competences.js
 * Applique le système Fort/Moyen/Faible des spécifications :
 * - Aspect fort  -> les 3 compétences liées reçoivent +1 automatiquement.
 * - Aspect moyen -> le joueur choisit 2 compétences parmi les 3 (+1 chacune).
 * - Aspect faible -> le joueur choisit 1 compétence parmi les 3 (+1).
 * Chaque compétence est à l'intersection d'un Attribut et d'une Vocation :
 * elle reçoit deux contributions indépendantes (0 ou 1 par axe) qui
 * s'additionnent pour former son niveau final.
 * Aucun nom de compétence, d'attribut ou de vocation n'est codé en dur.
 */

/**
 * Déduit le rang (fort/moyen/faible) de chaque valeur d'un axe à partir
 * des tailles de dé du personnage, en lisant la correspondance dans config.json.
 * @param {object} dictionnaireDe - personnage.attributs ou personnage.vocations
 */
export function determinerRangs(dictionnaireDe, config) {
    const rangs = {};
    Object.entries(dictionnaireDe).forEach(([id, taille]) => {
        rangs[id] = config.des.rangParTaille[taille] || null;
    });
    return rangs;
}

function competencesParValeurAxe(competencesData, axe) {
    const groupes = {};
    competencesData.forEach(c => {
        const valeur = c[axe];
        if (!groupes[valeur]) groupes[valeur] = [];
        groupes[valeur].push(c.id);
    });
    return groupes;
}

export function seuilPourNiveau(niveau, config) {
    const table = config.seuilsReussite.table;
    return (table.find(s => s.niveau === niveau) || table[0]).seuil;
}

/**
 * Recalcule le niveau final de toutes les compétences à partir des
 * sélections courantes (personnage.selectionsCompetences).
 */
export function recalculerNiveaux(personnage, competencesData, config) {
    competencesData.forEach(c => {
        const parAttribut = (personnage.selectionsCompetences.attribut[c.attribut] || []).includes(c.id) ? 1 : 0;
        const parVocation = (personnage.selectionsCompetences.vocation[c.vocation] || []).includes(c.id) ? 1 : 0;
        const niveau = parAttribut + parVocation;
        personnage.competences[c.id] = { niveau, seuil: seuilPourNiveau(niveau, config) };
    });
    return personnage.competences;
}

/**
 * Initialise l'interface de répartition des compétences pour un axe donné
 * (Attributs ou Vocations) : rendu des groupes fort/moyen/faible avec
 * cases à cocher (automatiques pour "fort", limitées au bon nombre pour
 * "moyen"/"faible"), et mise à jour de personnage.selectionsCompetences.
 *
 * @param {object} options
 * @param {HTMLElement} options.conteneur
 * @param {'attribut'|'vocation'} options.axe
 * @param {object[]} options.axeData - data/attributs.json ou data/vocations.json
 * @param {object[]} options.competencesData - data/competences.json
 * @param {object} options.personnage
 * @param {object} options.config
 * @param {() => void} [options.surChangement] - appelé après tout recalcul
 */
export function initRepartitionAxe(options) {
    const { conteneur, axe, axeData, competencesData, personnage, config, surChangement } = options;
    const dictionnaireDe = axe === 'attribut' ? personnage.attributs : personnage.vocations;
    const groupes = competencesParValeurAxe(competencesData, axe);
    const nombreParRang = config.repartitionCompetences.nombreParRang;

    if (!personnage.selectionsCompetences) {
        personnage.selectionsCompetences = { attribut: {}, vocation: {} };
    }

    function nomCompetence(id) {
        return (competencesData.find(c => c.id === id) || {}).nom || id;
    }

    function recalculerToutEtNotifier() {
        recalculerNiveaux(personnage, competencesData, config);
        if (typeof surChangement === 'function') surChangement();
    }

    function rendre() {
        const rangs = determinerRangs(dictionnaireDe, config);

        axeData.forEach(item => {
            const rang = rangs[item.id];
            const disponibles = groupes[item.id] || [];
            const nombreAChoisir = rang ? (nombreParRang[rang] ?? 0) : 0;

            let selection = personnage.selectionsCompetences[axe][item.id] || [];

            if (rang === 'fort') {
                selection = disponibles.slice();
            } else if (selection.length > nombreAChoisir) {
                selection = selection.slice(0, nombreAChoisir);
            }
            personnage.selectionsCompetences[axe][item.id] = selection;
        });

        conteneur.innerHTML = axeData.map(item => {
            const rang = rangs[item.id];
            const disponibles = groupes[item.id] || [];
            const nombreAChoisir = rang ? (nombreParRang[rang] ?? 0) : 0;
            const selection = personnage.selectionsCompetences[axe][item.id] || [];
            const verrouille = !rang || rang === 'fort';

            return `
                <div class="repartition-groupe" data-item-id="${item.id}">
                    <div class="repartition-titre">
                        ${item.nom}
                        <span class="repartition-rang">${rang ? rang : '—'}</span>
                        ${rang ? `<span class="repartition-compte">${selection.length}/${nombreAChoisir}</span>` : ''}
                    </div>
                    <div class="repartition-options">
                        ${disponibles.map(id => `
                            <label class="repartition-option">
                                <input type="checkbox" value="${id}"
                                    ${selection.includes(id) ? 'checked' : ''}
                                    ${verrouille ? 'disabled' : ''}>
                                <span>${nomCompetence(id)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        conteneur.querySelectorAll('.repartition-groupe').forEach(bloc => {
            const itemId = bloc.dataset.itemId;
            bloc.querySelectorAll('input[type="checkbox"]').forEach(input => {
                input.addEventListener('change', () => {
                    const rangs2 = determinerRangs(dictionnaireDe, config);
                    const rang = rangs2[itemId];
                    const nombreAChoisir = rang ? (nombreParRang[rang] ?? 0) : 0;
                    const selectionActuelle = personnage.selectionsCompetences[axe][itemId] || [];

                    if (input.checked) {
                        if (selectionActuelle.length >= nombreAChoisir) {
                            // Limite atteinte : on refuse la coche supplémentaire.
                            input.checked = false;
                            return;
                        }
                        selectionActuelle.push(input.value);
                    } else {
                        const pos = selectionActuelle.indexOf(input.value);
                        if (pos !== -1) selectionActuelle.splice(pos, 1);
                    }
                    personnage.selectionsCompetences[axe][itemId] = selectionActuelle;

                    rendre();
                    recalculerToutEtNotifier();
                });
            });
        });
    }

    rendre();
    recalculerToutEtNotifier();

    return { rafraichir: () => { rendre(); recalculerToutEtNotifier(); } };
}