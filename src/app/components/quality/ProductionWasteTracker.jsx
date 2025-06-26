import React, { useState } from 'react';
import {
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  Target,
  Package,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Edit3
} from 'lucide-react';

const ProductionWasteTracker = ({ onSave, onCancel, existingData = null }) => {
  // Obtenir la date actuelle du système
  const aujourdhui = new Date();
  
  // Helper function to get local date string (YYYY-MM-DD format)
  const obtenirDateLocaleString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Get first day of current month in local timezone
  const moisActuelDebut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
  const moisActuelDebutString = obtenirDateLocaleString(moisActuelDebut);
  
  // Fonctions utilitaires
  const obtenirPremierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const obtenirDernierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const obtenirNomMois = (date) => {
    const mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois[new Date(date).getMonth()];
  };

  // Par défaut au mois actuel du système - initialiser avec données existantes
  const [dateSelectionnee, setDateSelectionnee] = useState(
    existingData?.date || moisActuelDebutString
  );
  const [objectifMensuel, setObjectifMensuel] = useState(existingData?.monthlyTarget || 15);
  const [produitsGaspilles, setProduitsGaspilles] = useState(existingData?.wastedProducts || []);
  const [estEnTrainDeTrainer, setEstEnTrainDeTrainer] = useState(false);
  const [afficherTousProduits, setAfficherTousProduits] = useState(false);

  // Liste des produits finis
  const produitsFinis = [
    'Dégraissant alimentaire', 'Agita', 'Atom EC 25', 'Airfresh good vibes',
    'CAM 1501', 'CAM 4102', 'CAM 4260', 'CIP 1073', 'CIP 1273', 'CIP 1500',
    'CIP 2040', 'Crème mains bactéricides', 'Décap Force Four', 'Décasol', 'DEGR MS'
  ];

  const produitsAffiches = afficherTousProduits ? produitsFinis : produitsFinis.slice(0, 9);

  // Codage couleur intelligent pour les produits
  const obtenirStyleProduit = (produit) => {
    if (produit.toLowerCase().includes('cam')) {
      return 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200';
    } else if (produit.toLowerCase().includes('cip')) {
      return 'bg-purple-500 text-white hover:bg-purple-600 shadow-purple-200';
    } else if (produit.toLowerCase().includes('déc') || produit.toLowerCase().includes('degr')) {
      return 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200';
    } else if (produit.toLowerCase().includes('crème') || produit.toLowerCase().includes('airfresh')) {
      return 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200';
    } else if (produit.toLowerCase().includes('atom') || produit.toLowerCase().includes('agita')) {
      return 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200';
    } else {
      return 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200';
    }
  };

  // Calculer le KPI mensuel
  const calculerKPIMensuel = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    const produitsGaspillesMois = produitsGaspilles.filter(item => {
      const dateItem = new Date(item.date);
      return dateItem >= debutMois && dateItem <= finMois;
    });
    
    const totalGaspille = produitsGaspillesMois.length;
    
    if (totalGaspille === 0) return 100;
    if (totalGaspille >= objectifMensuel) return 0;
    
    const ratioGaspillage = totalGaspille / objectifMensuel;
    return Math.round((1 - ratioGaspillage) * 100);
  };

  // Obtenir les statistiques mensuelles
  const obtenirStatistiquesMensuelles = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    const produitsGaspillesMois = produitsGaspilles.filter(item => {
      const dateItem = new Date(item.date);
      return dateItem >= debutMois && dateItem <= finMois;
    });
    
    const totalGaspille = produitsGaspillesMois.length;
    const objectifRestant = Math.max(0, objectifMensuel - totalGaspille);
    
    // Détection du mois actuel système
    const dateMoisSelectionne = new Date(dateSelectionnee);
    const estMoisActuel = dateMoisSelectionne.getMonth() === aujourdhui.getMonth() && 
                         dateMoisSelectionne.getFullYear() === aujourdhui.getFullYear();
    
    return {
      totalGaspille,
      objectifRestant,
      produitsGaspillesMois,
      estMoisActuel,
      statut: totalGaspille >= objectifMensuel ? 'critique' : 
              totalGaspille >= objectifMensuel * 0.8 ? 'attention' : 
              totalGaspille >= objectifMensuel * 0.6 ? 'prudence' : 'excellent'
    };
  };

  // Navigation mensuelle
  const naviguerMois = (direction) => {
    const dateActuelle = new Date(dateSelectionnee + 'T00:00:00'); // Force local interpretation
    const nouvelleDate = new Date(dateActuelle.setMonth(dateActuelle.getMonth() + direction));
    setDateSelectionnee(obtenirDateLocaleString(nouvelleDate));
  };

  // Gestionnaires de glisser-déposer
  const gererDebutTrainee = (e, produit) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', produit); // Use DataTransfer for payload
    setEstEnTrainDeTrainer(true); // Highlight only
  };

  const gererSurvol = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const gererDepot = (e) => {
    e.preventDefault();

    const produit = e.dataTransfer.getData('text/plain');
    if (!produit) return;

    // Use today's date in local timezone, not the selected month date
    const aujourdhuiString = obtenirDateLocaleString(new Date());
    
    const elementGaspille = {
      id: crypto.randomUUID(),
      product: produit,
      date: aujourdhuiString, // Use today's actual date
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    };

    setProduitsGaspilles(prev => [...prev, elementGaspille]);
    setEstEnTrainDeTrainer(false);
    
    // Debug log to verify the date
    console.log('Waste item added:', elementGaspille.date, 'Selected month:', dateSelectionnee);
  };

  const supprimerElementGaspille = (itemId) => {
    setProduitsGaspilles(prev => prev.filter(item => item.id !== itemId));
  };

  const gererSoumission = () => {
    const kpiMensuel = calculerKPIMensuel();
    const stats = obtenirStatistiquesMensuelles();
    
    const donneesGaspillage = {
      value: kpiMensuel,
      date: dateSelectionnee,
      monthlyTarget: objectifMensuel,
      wastedProducts: produitsGaspilles,
      stats: stats,
      type: 'production_waste_rate'
    };
    
    onSave('quality', 'production_waste_rate', donneesGaspillage, '');
  };

  const stats = obtenirStatistiquesMensuelles();
  const kpiMensuel = calculerKPIMensuel();
  const moisActuel = obtenirNomMois(dateSelectionnee);
  const anneeActuelle = new Date(dateSelectionnee).getFullYear();

  // Obtenir la couleur du KPI
  const obtenirCouleurKPI = () => {
    if (kpiMensuel >= 90) return 'text-emerald-600';
    if (kpiMensuel >= 70) return 'text-blue-600';
    if (kpiMensuel >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const obtenirCouleurStatut = () => {
    if (stats.statut === 'excellent') return 'bg-emerald-500';
    if (stats.statut === 'prudence') return 'bg-blue-500';
    if (stats.statut === 'attention') return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Couleur de la barre de progression basée sur le KPI
  const obtenirCouleurProgression = () => {
    if (kpiMensuel >= 90) return 'bg-emerald-500';
    if (kpiMensuel >= 70) return 'bg-blue-500';
    if (kpiMensuel >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-6xl h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden border border-blue-100">
        
        {/* En-tête compact */}
        <div className="px-6 py-4 bg-white border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Contrôle Gaspillage Production
                </h1>
                <p className="text-sm text-slate-700">
                  Suivi mensuel des produits finis
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Efficacité
                </div>
                <div 
                  className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                  title={`📊 FORMULE EFFICACITÉ

🎯 OBJECTIF MENSUEL: ${objectifMensuel} produits max

📈 CALCUL:
• Aucun gaspillage = 100% (performance parfaite)
• Gaspillage ≥ ${objectifMensuel} = 0% (échec immédiat)
• Sinon: Score = 100 - (gaspillage / objectif × 100)

📋 SITUATION ACTUELLE:
• Mois: ${moisActuel} ${anneeActuelle}
• Gaspillé: ${stats.totalGaspille} produits
• Limite: ${objectifMensuel} produits
• Restant: ${stats.objectifRestant} produits

💡 INTERPRÉTATION:
• 90-100%: Excellence opérationnelle
• 70-89%: Performance satisfaisante  
• 50-69%: Attention requise
• <50%: Action corrective urgente

Score actuel: ${kpiMensuel}%`}
                >
                  {kpiMensuel}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Panneau de contrôle intelligent */}
        <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            
            {/* Navigateur de mois */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => naviguerMois(-1)}
                className="w-8 h-8 rounded-lg bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-blue-700" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className="text-lg font-medium text-slate-900">
                  {moisActuel} {anneeActuelle}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {stats.estMoisActuel ? 'Mois actuel' : 'Mois sélectionné'}
                </div>
              </div>
              
              <button
                onClick={() => naviguerMois(1)}
                className="w-8 h-8 rounded-lg bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4 text-blue-700" />
              </button>
            </div>

            {/* Progression KPI */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                  Performance KPI
                </div>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${obtenirCouleurProgression()}`}
                    style={{ width: `${kpiMensuel}%` }}
                  />
                </div>
                <div className="text-xs text-slate-700 mt-1 font-medium">
                  {kpiMensuel}%
                </div>
              </div>
            </div>

            {/* Saisie objectif */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Objectif Mensuel
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {stats.totalGaspille} / {objectifMensuel} produits
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setObjectifMensuel(Math.max(1, objectifMensuel - 1))}
                  className="w-7 h-7 rounded-md bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center text-blue-700 transition-all text-sm font-medium"
                >
                  −
                </button>
                <div className="w-12 text-center">
                  <input
                    type="number"
                    value={objectifMensuel}
                    onChange={(e) => setObjectifMensuel(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-sm font-medium bg-white border border-blue-200 rounded-md py-1 outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>
                <button
                  onClick={() => setObjectifMensuel(objectifMensuel + 1)}
                  className="w-7 h-7 rounded-md bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center text-blue-700 transition-all text-sm font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${obtenirCouleurStatut()}`}></div>
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {stats.statut === 'excellent' ? 'Excellent' :
                   stats.statut === 'prudence' ? 'Prudence' :
                   stats.statut === 'attention' ? 'Attention' : 'Critique'}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {stats.objectifRestant} restants
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal - Hauteur fixe */}
        <div className="flex flex-1 min-h-0">
          
          {/* Zone produits */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-3 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900">
                  Produits Finis
                </h2>
                {produitsFinis.length > 9 && (
                  <button
                    onClick={() => setAfficherTousProduits(!afficherTousProduits)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all shadow-sm"
                  >
                    {afficherTousProduits ? 'Réduire' : `Voir tous (${produitsFinis.length})`}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-3">
                {produitsAffiches.map((produit, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => gererDebutTrainee(e, produit)}
                    className={`p-3 rounded-xl cursor-move transition-all hover:scale-105 hover:shadow-lg ${obtenirStyleProduit(produit)}`}
                    title={`Glisser vers corbeille: ${produit}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{produit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zone de gaspillage - Largeur fixe et mise en page appropriée */}
          <div className="w-80 border-l border-blue-100 flex flex-col bg-blue-50/30">
            
            {/* Zone de dépôt - Hauteur fixe */}
            <div className="p-6 flex-shrink-0">
              <div
                onDragOver={gererSurvol}
                onDrop={gererDepot}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all duration-300 ${
                  estEnTrainDeTrainer
                    ? 'border-red-500 bg-red-50 scale-105 shadow-lg'
                    : 'border-orange-300 bg-white hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                  estEnTrainDeTrainer 
                    ? 'bg-red-500 scale-110' 
                    : 'bg-orange-200 hover:bg-orange-300'
                }`}>
                  <Trash2 className={`w-6 h-6 ${
                    estEnTrainDeTrainer ? 'text-white' : 'text-orange-700'
                  }`} />
                </div>
                <h3 className={`text-sm font-medium mb-1 ${
                  estEnTrainDeTrainer ? 'text-red-600' : 'text-slate-900'
                }`}>
                  Zone de Gaspillage
                </h3>
                <p className={`text-xs ${
                  estEnTrainDeTrainer ? 'text-red-500' : 'text-orange-700'
                }`}>
                  {estEnTrainDeTrainer ? 'Relâcher pour signaler' : 'Glisser les produits ici'}
                </p>
              </div>
            </div>

            {/* Liste de gaspillage - Défilement avec hauteur appropriée */}
            <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-sm font-medium text-slate-900">
                  Gaspillage ce Mois
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.produitsGaspillesMois.length === 0 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.produitsGaspillesMois.length}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {stats.produitsGaspillesMois.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                    <h4 className="text-sm font-medium text-slate-900 mb-1">
                      Aucun Gaspillage ! 🎉
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium">
                      Performance parfaite
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.produitsGaspillesMois.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white border border-red-100 hover:border-red-200 transition-all group shadow-sm"
                        title={`Ajouté le: ${item.date} | Stocké: ${item.date}`} // Debug tooltip
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate mb-1">
                              {item.product}
                            </div>
                            <div className="text-xs text-slate-600 flex items-center space-x-2">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.date + 'T00:00:00').toLocaleDateString('fr-FR')}</span>
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => supprimerElementGaspille(item.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'action - Toujours visible */}
        <div className="px-6 py-4 bg-white border-t border-blue-100 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpiMensuel}% Efficacité</span>
              </div>
              + <div className="text-sm text-slate-700 font-medium">
+   {stats.totalGaspille} sur {objectifMensuel} utilisés
+ </div>
              <div className="text-sm text-blue-600 font-medium">
                {moisActuel} {anneeActuelle}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 text-sm font-medium transition-all"
              >
                Annuler
              </button>
              <button
                onClick={gererSoumission}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all flex items-center space-x-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionWasteTracker;