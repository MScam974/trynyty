/**
 * fiche-competences.js
 * Rendu de l'onglet Compétences de la fiche (outils/fiche.html) :
 * - zone Affinité : texte + schéma cliquable (triangle.js)
 * - grille des 9 compétences : niveau déjà acquis (pips X/O), et choix
 *   d'une spécialité (générique + liée à l'affinité).
 * Contrairement à competences.js (utilisé à la création), ce module ne
 * calcule aucun niveau : il affiche ce qui a déjà été décidé.
 */

import { initSchemaPoints } from './triangle.js';
import { sauvegarderPersonnage } from './stockage.js';

export function rendreZoneAffinite({ conteneurTexte, conteneurSchema, personnage, donnees }) {
    const affiniteNom = (donnees.affinites.find(a => a.id === personnage.affinite) || {}).nom || '—';
    conteneurTexte.textContent = `Votre affinité de départ est ${affiniteNom}.`;

    initSchemaPoints({
        conteneur: conteneurSchema,
        donneesSchema: donnees.triangleAffinite
    });
}

function texteEnPips(niveau, maximum) {
    const acquis = Array(niveau).fill('X');
    const potentiel = Array(Math.max(0, maximum - niveau)).fill('O');
    return acquis.concat(potentiel).join(' ');
}

function remplirSelect(select, options, valeurActuelle) {
    select.innerHTML = '<option value="">—</option>' +
        options.map(option => `<option value="${option}" ${option === valeurActuelle ? 'selected' : ''}>${option}</option>`).join('');
}

export function rendreGrilleCompetences({ conteneur, personnage, donnees }) {
    const maximum = donnees.config.seuilsReussite.table.length - 1; // niveaux 0..5

    if (!personnage.choixSpecialites) {
        personnage.choixSpecialites = {};
    }

    conteneur.innerHTML = `
        <div class="competences-grille" style="--nb-attributs:${donnees.attributs.length}">
            <div class="grille-coin"></div>
            ${donnees.attributs.map(a => `<div class="grille-entete">${a.nom}</div>`).join('')}
            ${donnees.vocations.map(vocation => `
                <div class="grille-entete">${vocation.symbole || ''} ${vocation.nom}</div>
                ${donnees.attributs.map(attribut => {
                    const competence = donnees.competences.find(c => c.vocation === vocation.id && c.attribut === attribut.id);
                    if (!competence) return '<div class="grille-cellule"></div>';
                    const resultat = personnage.competences[competence.id] || { niveau: 0 };
                    return `
                        <div class="grille-cellule" data-competence-id="${competence.id}">
                            <div class="cellule-nom">${competence.nom}</div>
                            <div class="cellule-pips">${texteEnPips(resultat.niveau, maximum)}</div>
                            <label class="cellule-select-label">Spécialité
                                <select class="select-specialite" data-type="generique"></select>
                            </label>
                            <label class="cellule-select-label">Pouvoir d'affinité
                                <select class="select-specialite" data-type="affinite"></select>
                            </label>
                        </div>
                    `;
                }).join('')}
            `).join('')}
        </div>
    `;

    donnees.competences.forEach(competence => {
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

        const specialitesAffinite = competence.specialitesAffinite || {};
        const optionAffinite = specialitesAffinite[personnage.affinite];
        const selectAffinite = cellule.querySelector('[data-type="affinite"]');
        remplirSelect(selectAffinite, optionAffinite ? [optionAffinite] : [], choixExistant.affinite);
        selectAffinite.addEventListener('change', () => {
            personnage.choixSpecialites[competence.id] = personnage.choixSpecialites[competence.id] || {};
            personnage.choixSpecialites[competence.id].affinite = selectAffinite.value;
            sauvegarderPersonnage(personnage);
        });
    });
}
