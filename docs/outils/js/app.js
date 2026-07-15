/**
 * app.js
 * Point d'entrée du moteur. Charge les données, crée l'objet personnage,
 * puis initialise les modules d'interface. Ne contient aucune règle de
 * jeu : c'est uniquement le câblage entre les modules.
 */

import { chargerDonnees, chargerQuestionnaire } from './loader.js';
import { creerPersonnage, appliquerResultatQuestionnaire } from './personnage.js';
import { initOnglets } from './ui.js';
import { initQuestionnaire } from './questionnaire.js';
import { initTableauCompetences } from './tableau-competences.js';
import { sauvegarderPersonnage, chargerPersonnageStocke, effacerPersonnageStocke, importerPersonnageJSON } from './stockage.js';

async function demarrer() {
    const donnees = await chargerDonnees();
    const questionnaireData = await chargerQuestionnaire();

    // Si un personnage existe déjà dans ce navigateur, on repart dessus
    // plutôt que d'en créer un nouveau — sauf si une action explicite
    // (relancer questionnaire/création libre) a été demandée juste avant.
    const actionForcee = sessionStorage.getItem('trynyty-action-forcee');
    sessionStorage.removeItem('trynyty-action-forcee');

    const personnageExistant = chargerPersonnageStocke();
    const personnage = (personnageExistant && !actionForcee) ? personnageExistant : creerPersonnage();

    const idsVocations = donnees.vocations.map(v => v.id);
    const idsAttributs = donnees.attributs.map(a => a.id);

    // Panneau de gestion : affiché seulement si un personnage existait déjà
    // et qu'aucune méthode de création n'a été explicitement relancée.
    const afficherGestion = !!personnageExistant && !actionForcee;
    const panneauGestion = document.getElementById('gestion-personnage');
    const zoneOnglets = document.getElementById('onglets-methode');
    const zoneContenus = document.getElementById('contenus-methode');
    panneauGestion.hidden = !afficherGestion;
    zoneOnglets.hidden = afficherGestion;
    zoneContenus.hidden = afficherGestion;

    document.getElementById('bouton-sauvegarder')?.addEventListener('click', (e) => {
        sauvegarderPersonnage(personnage);
        const bouton = e.currentTarget;
        const libelle = bouton.textContent;
        bouton.textContent = '✓ Sauvegardé';
        setTimeout(() => { bouton.textContent = libelle; }, 1200);
    });

    document.getElementById('bouton-reset-total')?.addEventListener('click', () => {
        if (!confirm('Effacer entièrement ce personnage ? Cette action est irréversible.')) return;
        effacerPersonnageStocke();
        location.reload();
    });

    document.getElementById('bouton-relancer-questionnaire')?.addEventListener('click', () => {
        if (!confirm('Repartir de zéro avec le questionnaire ? Le personnage actuel sera remplacé.')) return;
        sauvegarderPersonnage(creerPersonnage());
        sessionStorage.setItem('trynyty-action-forcee', 'questionnaire');
        location.reload();
    });

    document.getElementById('bouton-relancer-libre')?.addEventListener('click', () => {
        if (!confirm('Repartir de zéro en création libre ? Le personnage actuel sera remplacé.')) return;
        sauvegarderPersonnage(creerPersonnage());
        sessionStorage.setItem('trynyty-action-forcee', 'creation-libre');
        location.reload();
    });

    const champFichier = document.getElementById('fichier-charger');
    document.getElementById('bouton-charger')?.addEventListener('click', () => champFichier.click());
    champFichier?.addEventListener('change', async () => {
        const fichier = champFichier.files[0];
        if (!fichier) return;
        try {
            const personnageCharge = await importerPersonnageJSON(fichier);
            sauvegarderPersonnage(personnageCharge);
            location.reload();
        } catch (erreur) {
            alert('Fichier invalide : ' + erreur.message);
        }
    });

    // Onglets : bascule entre les deux méthodes de création
    const onglets = initOnglets({
        conteneurOnglets: document.getElementById('onglets-methode'),
        conteneurContenus: document.getElementById('contenus-methode')
    });
    if (actionForcee === 'creation-libre') {
        onglets.activer('creation-libre');
    }

    // Affinité (sélectionnable directement en Création libre, ou fixée
    // automatiquement par le résultat du questionnaire — les deux modes
    // doivent produire le même personnage).
    function rendreSelecteurAffinite() {
        const conteneur = document.getElementById('selecteur-affinite');
        conteneur.innerHTML = donnees.affinites.map(affinite => `
            <label class="affinite-option">
                <input type="radio" name="affinite" value="${affinite.id}" ${personnage.affinite === affinite.id ? 'checked' : ''}>
                <span>${affinite.nom}</span>
            </label>
        `).join('');
        conteneur.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                personnage.affinite = input.value;
            });
        });
    }
    rendreSelecteurAffinite();

    // Tableau unifié : dés (Attributs x Vocations) + répartition des
    // compétences, en un seul composant partagé avec la fiche.
    const tableauCompetences = initTableauCompetences({
        conteneur: document.getElementById('tableau-competences'),
        personnage,
        donnees,
        editable: true
    });

    function rafraichirRepartitions() {
        tableauCompetences.rafraichir();
    }

    // Questionnaire
    initQuestionnaire({
        conteneur: document.getElementById('questionnaire-conteneur'),
        questionnaire: questionnaireData,
        personnage,
        surChangement: (etat) => {
            const progression = document.getElementById('questionnaire-progression');
            if (progression) {
                progression.textContent = `${etat.nombreReponses} / ${etat.totalQuestions}`;
            }

            if (!etat.complet) return;

            // Le questionnaire produit exactement le même objet personnage
            // que la Création libre : on applique le résultat aux dés,
            // puis on resynchronise les deux vues qui en dépendent.
            appliquerResultatQuestionnaire(personnage, idsVocations, idsAttributs);
            rafraichirRepartitions();
            rendreSelecteurAffinite();

            const resultat = document.getElementById('questionnaire-resultat');
            if (resultat) {
                const affiniteNom = (donnees.affinites.find(a => a.id === personnage.affinite) || {}).nom || personnage.affinite;
                resultat.textContent = `Affinité : ${affiniteNom}`;
            }
        }
    });

    // Utile en console tant qu'il n'y a pas encore de fiche/export.
    window.personnage = personnage;

    // Fin de la création : sauvegarde et ouvre la fiche dans un nouvel onglet.
    const boutonTerminer = document.getElementById('bouton-terminer');
    if (boutonTerminer) {
        boutonTerminer.addEventListener('click', () => {
            sauvegarderPersonnage(personnage);
            window.open('fiche.html', '_blank');
        });
    }
}

demarrer().catch(erreur => {
    console.error('Erreur au démarrage du moteur Trynyty :', erreur);
    document.body.insertAdjacentHTML('afterbegin',
        `<div class="erreur-chargement">Erreur de chargement : ${erreur.message}</div>`);
});