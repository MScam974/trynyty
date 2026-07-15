/**
 * equipement.js
 * Onglet Équipement de la fiche : inventaire façon "case par point
 * d'encombrement" (inspiré des livres-jeux). 3 emplacements fixes à la
 * création (qualité imposée par l'emplacement, cf.
 * config.equipement.emplacementsCreation), plus des objets ajoutés
 * librement en jeu. Aucune règle de jeu codée en dur : tout vient de
 * data/config.json et des 3 catalogues (armes/armures/equipements).
 */

import { sauvegarderPersonnage } from './stockage.js';

function genererId() {
    return `obj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function catalogueComplet(donnees) {
    return [
        ...donnees.armes.map(item => ({ ...item, typeCatalogue: 'arme' })),
        ...donnees.armures.map(item => ({ ...item, typeCatalogue: 'armure' })),
        ...donnees.equipements.map(item => ({ ...item, typeCatalogue: 'equipement' }))
    ];
}

function trouverDansCatalogue(instance, catalogue) {
    if (!instance.catalogueId) return null;
    return catalogue.find(item => item.typeCatalogue === instance.typeCatalogue && item.id === instance.catalogueId) || null;
}

function rangDe(taille, config) {
    return taille ? (config.des.rangParTaille[taille] || null) : null;
}

/**
 * Encombrement maximum que le personnage peut porter :
 * bonus(Vocation Exploration) + bonus(Attribut Habileté) + somme des
 * bonusEncombrement des objets possédés (ex: un sac à dos).
 */
export function calculerEncombrementMax(personnage, donnees) {
    const { bonusParRang } = donnees.config.equipement.encombrementMax;
    const catalogue = catalogueComplet(donnees);

    const bonusExploration = bonusParRang[rangDe(personnage.vocations.exploration, donnees.config)] || 0;
    const bonusHabilete = bonusParRang[rangDe(personnage.attributs.habilete, donnees.config)] || 0;
    const bonusContenants = personnage.inventaire
        .map(instance => trouverDansCatalogue(instance, catalogue))
        .filter(Boolean)
        .reduce((somme, item) => somme + (item.bonusEncombrement || 0), 0);

    return bonusExploration + bonusHabilete + bonusContenants;
}

/**
 * Encombrement actuellement utilisé par l'inventaire.
 */
export function calculerEncombrementUtilise(personnage, donnees) {
    const catalogue = catalogueComplet(donnees);
    return personnage.inventaire
        .map(instance => trouverDansCatalogue(instance, catalogue))
        .filter(Boolean)
        .reduce((somme, item) => somme + (item.encombrement || 0), 0);
}

/**
 * Malus au seuil de réussite en cas de surcharge (cf. config.equipement.surcharge).
 */
export function calculerMalusSurcharge(personnage, donnees) {
    const { malusInitial, palierInitial } = donnees.config.equipement.surcharge;
    const depassement = calculerEncombrementUtilise(personnage, donnees) - calculerEncombrementMax(personnage, donnees);

    if (depassement <= 0) return 0;
    if (depassement <= palierInitial) return malusInitial;
    return malusInitial + (depassement - palierInitial);
}

function optionsCatalogue(catalogue, valeurActuelle) {
    const groupes = [
        { titre: 'Armes', type: 'arme' },
        { titre: 'Armures', type: 'armure' },
        { titre: 'Équipements', type: 'equipement' }
    ];
    return '<option value="">—</option>' + groupes.map(groupe => `
        <optgroup label="${groupe.titre}">
            ${catalogue.filter(i => i.typeCatalogue === groupe.type).map(item => {
                const valeur = `${item.typeCatalogue}:${item.id}`;
                return `<option value="${valeur}" ${valeur === valeurActuelle ? 'selected' : ''}>${item.nom} (${item.competence})</option>`;
            }).join('')}
        </optgroup>
    `).join('');
}

export function initEquipement({ conteneur, personnage, donnees, surChangement }) {
    if (!Array.isArray(personnage.inventaire)) {
        personnage.inventaire = [];
    }

    const emplacementsCreation = donnees.config.equipement.emplacementsCreation.emplacements;
    const niveauxQualite = donnees.config.equipement.qualite.niveaux;

    // S'assure que les 3 emplacements de création existent toujours (créés vides au premier affichage).
    emplacementsCreation.forEach(emplacement => {
        const existe = personnage.inventaire.some(i => i.emplacementCreation === emplacement.id);
        if (!existe) {
            personnage.inventaire.push({
                id: genererId(),
                catalogueId: null,
                typeCatalogue: null,
                qualite: emplacement.qualite,
                affiniteObjet: 0,
                note: '',
                origine: 'creation',
                emplacementCreation: emplacement.id
            });
        }
    });

    function notifier() {
        sauvegarderPersonnage(personnage);
        if (typeof surChangement === 'function') surChangement();
        rendre();
    }

    function nomQualite(niveau) {
        const entree = niveauxQualite.find(n => n.niveau === niveau);
        return entree ? entree.nom : niveau;
    }

    function rendreLigne(instance, catalogue) {
        const item = trouverDansCatalogue(instance, catalogue);
        const emplacement = emplacementsCreation.find(e => e.id === instance.emplacementCreation);
        const libelleEmplacement = emplacement ? emplacement.nom : 'Trouvé en jeu';

        return `
            <tr class="ligne-inventaire" data-instance-id="${instance.id}">
                <td class="colonne-emplacement">${libelleEmplacement}</td>
                <td>
                    <select class="select-objet">${optionsCatalogue(catalogue, instance.catalogueId ? `${instance.typeCatalogue}:${instance.catalogueId}` : '')}</select>
                </td>
                <td class="colonne-qualite">
                    ${instance.origine === 'creation'
                        ? `${instance.qualite} · ${nomQualite(instance.qualite)}`
                        : `<select class="select-qualite">${niveauxQualite.map(n => `<option value="${n.niveau}" ${n.niveau === instance.qualite ? 'selected' : ''}>${n.niveau} · ${n.nom}</option>`).join('')}</select>`
                    }
                </td>
                <td class="colonne-encombrement">${item ? item.encombrement : '—'}</td>
                <td><input type="text" class="champ-note" placeholder="Note libre..." value="${(instance.note || '').replace(/"/g, '&quot;')}"></td>
                <td>${instance.origine === 'jeu' ? '<button class="bouton-retirer" title="Retirer">✕</button>' : ''}</td>
            </tr>
        `;
    }

    function rendre() {
        const catalogue = catalogueComplet(donnees);
        const max = calculerEncombrementMax(personnage, donnees);
        const utilise = calculerEncombrementUtilise(personnage, donnees);
        const malus = calculerMalusSurcharge(personnage, donnees);

        const instancesTriees = [
            ...emplacementsCreation.map(e => personnage.inventaire.find(i => i.emplacementCreation === e.id)),
            ...personnage.inventaire.filter(i => i.origine === 'jeu')
        ];

        conteneur.innerHTML = `
            <p class="texte-info ${malus > 0 ? 'texte-alerte' : ''}">
                Encombrement : <strong>${utilise} / ${max}</strong>
                ${malus > 0 ? ` — surcharge : +${malus} au seuil de réussite` : ''}
            </p>
            <div class="encombrement-pips">${Array.from({ length: Math.max(max, utilise) }, (_, i) => i < utilise ? '●' : '○').join(' ') || '—'}</div>

            <table class="tableau-inventaire">
                <thead>
                    <tr><th>Emplacement</th><th>Objet</th><th>Qualité</th><th>Enc.</th><th>Note</th><th></th></tr>
                </thead>
                <tbody>
                    ${instancesTriees.map(instance => rendreLigne(instance, catalogue)).join('')}
                </tbody>
            </table>
            <button id="bouton-ajouter-objet">+ Ajouter un objet trouvé en jeu</button>
        `;

        conteneur.querySelectorAll('.ligne-inventaire').forEach(ligne => {
            const instanceId = ligne.dataset.instanceId;
            const instance = personnage.inventaire.find(i => i.id === instanceId);

            const selectObjet = ligne.querySelector('.select-objet');
            selectObjet.addEventListener('change', () => {
                const [type, id] = selectObjet.value.split(':');
                instance.typeCatalogue = type || null;
                instance.catalogueId = id || null;
                notifier();
            });

            const selectQualite = ligne.querySelector('.select-qualite');
            if (selectQualite) {
                selectQualite.addEventListener('change', () => {
                    instance.qualite = parseInt(selectQualite.value, 10);
                    notifier();
                });
            }

            const champNote = ligne.querySelector('.champ-note');
            champNote.addEventListener('input', () => {
                instance.note = champNote.value;
                sauvegarderPersonnage(personnage);
            });

            const boutonRetirer = ligne.querySelector('.bouton-retirer');
            if (boutonRetirer) {
                boutonRetirer.addEventListener('click', () => {
                    personnage.inventaire = personnage.inventaire.filter(i => i.id !== instanceId);
                    notifier();
                });
            }
        });

        const boutonAjouter = conteneur.querySelector('#bouton-ajouter-objet');
        boutonAjouter.addEventListener('click', () => {
            personnage.inventaire.push({
                id: genererId(),
                catalogueId: null,
                typeCatalogue: null,
                qualite: 2,
                affiniteObjet: 0,
                note: '',
                origine: 'jeu',
                emplacementCreation: null
            });
            notifier();
        });
    }

    rendre();

    return { rafraichir: notifier };
}