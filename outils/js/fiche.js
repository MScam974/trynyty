/**
 * fiche.js
 * Point d'entrée de la feuille de personnage (outils/fiche.html).
 * Contrairement à app.js (création), cette page ne calcule rien : elle
 * lit le personnage déjà construit (localStorage) et l'affiche.
 */

import { chargerDonnees } from './loader.js';
import { chargerPersonnageStocke, sauvegarderPersonnage, exporterPersonnageJSON } from './stockage.js';
import { initOnglets } from './ui.js';
import { rendreZoneAffinite, rendreGrilleCompetences } from './fiche-competences.js';
import { initPromptIA } from './prompt-ia.js';

function rendreOngletPersonnage(personnage, donnees) {
    const champNomPerso = document.getElementById('fiche-nom-perso');
    const champNomJoueur = document.getElementById('fiche-nom-joueur');
    const champArchetype = document.getElementById('fiche-archetype');

    champNomPerso.value = personnage.profil.nom || '';
    champNomJoueur.value = personnage.profil.joueur || '';
    champArchetype.value = personnage.profil.concept || '';

    function surModificationProfil() {
        personnage.profil.nom = champNomPerso.value;
        personnage.profil.joueur = champNomJoueur.value;
        personnage.profil.concept = champArchetype.value;
        sauvegarderPersonnage(personnage);
    }
    [champNomPerso, champNomJoueur, champArchetype].forEach(champ => {
        champ.addEventListener('input', surModificationProfil);
    });

    const conteneurAffinite = document.getElementById('fiche-affinite');
    conteneurAffinite.innerHTML = donnees.affinites.map(affinite => `
        <label class="affinite-option">
            <input type="checkbox" disabled ${affinite.id === personnage.affinite ? 'checked' : ''}>
            <span>${affinite.nom}</span>
        </label>
    `).join('');
}

async function demarrer() {
    const personnage = chargerPersonnageStocke();

    if (!personnage) {
        document.body.insertAdjacentHTML('afterbegin',
            `<div class="erreur-chargement">Aucun personnage trouvé. Crée-le d'abord dans l'outil de création (index.html).</div>`);
        return;
    }

    const donnees = await chargerDonnees();

    initOnglets({
        conteneurOnglets: document.getElementById('onglets-fiche'),
        conteneurContenus: document.getElementById('contenus-fiche')
    });

    rendreOngletPersonnage(personnage, donnees);

    initPromptIA({
        conteneurItems: document.getElementById('trait-items'),
        champPrompt: document.getElementById('prompt-ia-texte'),
        personnage,
        donnees
    });

    const boutonCopier = document.getElementById('bouton-copier-prompt');
    if (boutonCopier) {
        boutonCopier.addEventListener('click', async () => {
            const texte = document.getElementById('prompt-ia-texte').value;
            try {
                await navigator.clipboard.writeText(texte);
                const libelleInitial = boutonCopier.textContent;
                boutonCopier.textContent = 'Copié !';
                setTimeout(() => { boutonCopier.textContent = libelleInitial; }, 1500);
            } catch (erreur) {
                console.error('Copie impossible :', erreur);
            }
        });
    }

    rendreZoneAffinite({
        conteneurTexte: document.getElementById('affinite-texte'),
        conteneurSchema: document.getElementById('affinite-schema'),
        personnage,
        donnees
    });
    rendreGrilleCompetences({
        conteneur: document.getElementById('grille-competences'),
        personnage,
        donnees
    });

    const boutonExport = document.getElementById('bouton-export');
    if (boutonExport) {
        boutonExport.addEventListener('click', () => exporterPersonnageJSON(personnage));
    }

    window.personnage = personnage;
}

demarrer().catch(erreur => {
    console.error('Erreur au démarrage de la fiche :', erreur);
    document.body.insertAdjacentHTML('afterbegin',
        `<div class="erreur-chargement">Erreur de chargement : ${erreur.message}</div>`);
});
