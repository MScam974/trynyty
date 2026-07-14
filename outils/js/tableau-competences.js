/**
 * tableau-competences.js
 * Un seul tableau Vocation x Attribut, utilisé aux deux endroits :
 * - en Création libre (mode éditable) : choix des dés + répartition
 *   des points de compétence (fort/moyen/faible)
 * - sur la fiche (mode lecture) : mêmes informations figées, plus le
 *   choix de spécialité par compétence
 * Remplace les rendus séparés qui existaient avant (creation.js pour
 * les dés, competences.js pour la répartition, fiche-competences.js
 * pour la grille de lecture) par un seul composant visuel cohérent.
 * Réutilise la logique pure de competences.js (rangs, niveaux) sans la
 * dupliquer.
 */

import { determinerRangs, recalculerNiveaux, seuilPourNiveau } from './competences.js';
import { sauvegarderPersonnage } from './stockage.js';

/**
 * Total de points d'expérience déjà dépensés (toutes compétences confondues).
 */
export function xpDepensee(personnage) {
    return Object.values(personnage.progressionCompetences || {}).reduce((a, b) => a + b, 0);
}

/**
 * Points d'expérience gagnés mais pas encore dépensés.
 */
export function xpDisponible(personnage) {
    return (personnage.experience?.total || 0) - xpDepensee(personnage);
}

function affecterDe(cible, id, taille) {
    const dejaUtilisePar = Object.entries(cible).find(([autreId, v]) => autreId !== id && v === taille);
    const ancienneTaille = cible[id] ?? null;
    if (dejaUtilisePar) {
        cible[dejaUtilisePar[0]] = ancienneTaille;
    }
    cible[id] = taille;
}

function competenceDe(competencesData, vocationId, attributId) {
    return competencesData.find(c => c.vocation === vocationId && c.attribut === attributId);
}

function radiosDes(nomGroupe, tailles, tailleActuelle, editable) {
    return `
        <div class="des-radios">
            ${tailles.map(taille => `
                <label class="de-option">
                    <input type="radio" name="${nomGroupe}" value="${taille}"
                        ${tailleActuelle === taille ? 'checked' : ''}
                        ${editable ? '' : 'disabled'}>
                    <span>${taille}</span>
                </label>
            `).join('')}
        </div>
    `;
}

/**
 * @param {object} options
 * @param {HTMLElement} options.conteneur
 * @param {object} options.personnage
 * @param {object} options.donnees - résultat de chargerDonnees()
 * @param {boolean} [options.editable] - true en Création libre, false sur la fiche
 * @param {() => void} [options.surChangement]
 */
export function initTableauCompetences({ conteneur, personnage, donnees, editable = true, surChangement }) {
    const { attributs, vocations, competences: competencesData, config } = donnees;

    if (!personnage.selectionsCompetences) {
        personnage.selectionsCompetences = { attribut: {}, vocation: {} };
    }
    if (!personnage.choixSpecialites) {
        personnage.choixSpecialites = {};
    }
    if (!personnage.progressionCompetences) {
        personnage.progressionCompetences = {};
    }
    if (!personnage.experience) {
        personnage.experience = { total: 0 };
    }

    function normaliserSelections() {
        const nombreParRang = config.repartitionCompetences.nombreParRang;
        [['attribut', attributs, personnage.attributs], ['vocation', vocations, personnage.vocations]].forEach(([axe, axeData, des]) => {
            const rangs = determinerRangs(des, config);
            axeData.forEach(item => {
                const rang = rangs[item.id];
                const disponibles = competencesData.filter(c => c[axe] === item.id).map(c => c.id);
                const nombreAChoisir = rang ? (nombreParRang[rang] ?? 0) : 0;
                let selection = personnage.selectionsCompetences[axe][item.id] || [];
                if (rang === 'fort') {
                    selection = disponibles.slice();
                } else if (selection.length > nombreAChoisir) {
                    selection = selection.slice(0, nombreAChoisir);
                }
                personnage.selectionsCompetences[axe][item.id] = selection;
            });
        });
    }

    function notifier() {
        normaliserSelections();
        recalculerNiveaux(personnage, competencesData, config);
        sauvegarderPersonnage(personnage);
        if (typeof surChangement === 'function') surChangement();
        rendre();
    }

    function remplirSelect(select, options, valeurActuelle) {
        select.innerHTML = '<option value="">—</option>' +
            options.map(o => `<option value="${o}" ${o === valeurActuelle ? 'selected' : ''}>${o}</option>`).join('');
    }

    function rendreCelluleCompetence(competence) {
        const rangs = { attribut: determinerRangs(personnage.attributs, config), vocation: determinerRangs(personnage.vocations, config) };
        const nombreParRang = config.repartitionCompetences.nombreParRang;

        function etatCheckbox(axe, valeurAxe) {
            const rang = rangs[axe][valeurAxe];
            const selection = personnage.selectionsCompetences[axe][valeurAxe] || [];
            const nombreAChoisir = rang ? (nombreParRang[rang] ?? 0) : 0;
            const coche = selection.includes(competence.id);
            const verrouille = !editable || !rang || rang === 'fort';
            return { coche, verrouille, rang, selection, nombreAChoisir };
        }

        const etatVocation = etatCheckbox('vocation', competence.vocation);
        const etatAttribut = etatCheckbox('attribut', competence.attribut);
        const resultat = personnage.competences[competence.id] || { niveau: 0, seuil: '—' };

        let blocSpecialites = '';
        if (!editable) {
            const choixExistant = personnage.choixSpecialites[competence.id] || {};
            const progression = personnage.progressionCompetences[competence.id] || 0;
            const niveauTotal = resultat.niveau + progression;
            const seuilTotal = seuilPourNiveau(niveauTotal, config);
            const disponible = xpDisponible(personnage);

            const pipsXP = [1, 2, 3].map(n => {
                const coche = progression >= n;
                const estLeSuivant = n === progression + 1;
                const verrouille = coche ? (n !== progression) : !(estLeSuivant && disponible >= 1);
                return `
                    <label class="pip-xp" title="1 point d'expérience">
                        <input type="checkbox" class="check-xp" data-index="${n}" ${coche ? 'checked' : ''} ${verrouille ? 'disabled' : ''}>
                    </label>
                `;
            }).join('');

            blocSpecialites = `
                <div class="competence-niveau">Niveau ${niveauTotal} · Seuil ${seuilTotal}</div>
                <div class="competence-progression" title="Progression en jeu (1 case = 1 point d'expérience)">${pipsXP}</div>
                <label class="cellule-select-label">Spécialité
                    <select class="select-specialite" data-type="generique"></select>
                </label>
                <label class="cellule-select-label">Pouvoir d'affinité
                    <select class="select-specialite" data-type="affinite"></select>
                </label>
            `;
            // Remplissage différé après insertion dans le DOM (voir plus bas).
        }

        return `
            <td class="cellule-competence" data-competence-id="${competence.id}">
                <div class="competence-nom">${competence.nom}</div>
                <div class="competence-verbes">${competence.verbes || ''}</div>
                <div class="competence-checks">
                    <label class="check-option" title="Point Vocation">
                        <input type="checkbox" class="check-vocation" data-axe="vocation" data-valeur-axe="${competence.vocation}"
                            ${etatVocation.coche ? 'checked' : ''} ${etatVocation.verrouille ? 'disabled' : ''}>
                        V
                    </label>
                    <label class="check-option" title="Point Attribut">
                        <input type="checkbox" class="check-attribut" data-axe="attribut" data-valeur-axe="${competence.attribut}"
                            ${etatAttribut.coche ? 'checked' : ''} ${etatAttribut.verrouille ? 'disabled' : ''}>
                        A
                    </label>
                </div>
                ${blocSpecialites}
            </td>
        `;
    }

    function rendre() {
        normaliserSelections();
        recalculerNiveaux(personnage, competencesData, config);

        conteneur.innerHTML = `
            <table class="tableau-competences">
                <thead>
                    <tr>
                        <th class="coin"></th>
                        ${attributs.map(a => `
                            <th class="entete-axe" data-id="${a.id}">
                                ${a.nom}
                                ${radiosDes(`attribut-${a.id}`, config.des.tailles, personnage.attributs[a.id], editable)}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${vocations.map(v => `
                        <tr>
                            <th class="entete-axe" data-id="${v.id}">
                                ${v.symbole || ''} ${v.nom}
                                ${radiosDes(`vocation-${v.id}`, config.des.tailles, personnage.vocations[v.id], editable)}
                            </th>
                            ${attributs.map(a => {
                                const competence = competenceDe(competencesData, v.id, a.id);
                                return competence ? rendreCelluleCompetence(competence) : '<td></td>';
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Dés (uniquement actionnable en mode éditable)
        if (editable) {
            conteneur.querySelectorAll('.des-radios input[type="radio"]').forEach(input => {
                input.addEventListener('change', () => {
                    const th = input.closest('.entete-axe');
                    const id = th.dataset.id;
                    const estAttribut = input.name.startsWith('attribut-');
                    const cible = estAttribut ? personnage.attributs : personnage.vocations;
                    affecterDe(cible, id, input.value);
                    notifier();
                });
            });

            conteneur.querySelectorAll('.competence-checks input[type="checkbox"]').forEach(input => {
                input.addEventListener('change', () => {
                    const axe = input.dataset.axe;
                    const valeurAxe = input.dataset.valeurAxe;
                    const competenceId = input.closest('.cellule-competence').dataset.competenceId;
                    const selection = personnage.selectionsCompetences[axe][valeurAxe] || [];

                    if (input.checked) {
                        const rang = determinerRangs(axe === 'attribut' ? personnage.attributs : personnage.vocations, config)[valeurAxe];
                        const max = config.repartitionCompetences.nombreParRang[rang] ?? 0;
                        if (selection.length >= max) {
                            input.checked = false;
                            return;
                        }
                        selection.push(competenceId);
                    } else {
                        const pos = selection.indexOf(competenceId);
                        if (pos !== -1) selection.splice(pos, 1);
                    }
                    personnage.selectionsCompetences[axe][valeurAxe] = selection;
                    notifier();
                });
            });
        }

        // Sélecteurs de spécialité (uniquement en mode lecture / fiche)
        if (!editable) {
            competencesData.forEach(competence => {
                const cellule = conteneur.querySelector(`[data-competence-id="${competence.id}"]`);
                if (!cellule) return;
                const choixExistant = personnage.choixSpecialites[competence.id] || {};

                const selectGenerique = cellule.querySelector('[data-type="generique"]');
                remplirSelect(selectGenerique, competence.specialitesGeneriques || [], choixExistant.generique);
                selectGenerique.addEventListener('change', () => {
                    personnage.choixSpecialites[competence.id] = personnage.choixSpecialites[competence.id] || {};
                    personnage.choixSpecialites[competence.id].generique = selectGenerique.value;
                    sauvegarderPersonnage(personnage);
                });

                const optionAffinite = (competence.specialitesAffinite || {})[personnage.affinite];
                const selectAffinite = cellule.querySelector('[data-type="affinite"]');
                remplirSelect(selectAffinite, optionAffinite ? [optionAffinite] : [], choixExistant.affinite);
                selectAffinite.addEventListener('change', () => {
                    personnage.choixSpecialites[competence.id] = personnage.choixSpecialites[competence.id] || {};
                    personnage.choixSpecialites[competence.id].affinite = selectAffinite.value;
                    sauvegarderPersonnage(personnage);
                });

                cellule.querySelectorAll('.check-xp').forEach(input => {
                    input.addEventListener('change', () => {
                        const index = parseInt(input.dataset.index, 10);
                        const actuel = personnage.progressionCompetences[competence.id] || 0;

                        if (input.checked) {
                            if (index !== actuel + 1 || xpDisponible(personnage) < 1) {
                                input.checked = false;
                                return;
                            }
                            personnage.progressionCompetences[competence.id] = index;
                        } else {
                            if (index !== actuel) {
                                input.checked = true;
                                return;
                            }
                            personnage.progressionCompetences[competence.id] = actuel - 1;
                        }
                        sauvegarderPersonnage(personnage);
                        rendre();
                        if (typeof surChangement === 'function') surChangement();
                    });
                });
            });
        }
    }

    rendre();
    recalculerNiveaux(personnage, competencesData, config);
    sauvegarderPersonnage(personnage);

    return { rafraichir: notifier };
}