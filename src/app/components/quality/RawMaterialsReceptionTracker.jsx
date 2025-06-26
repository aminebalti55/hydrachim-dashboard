import React, { useState } from 'react';
import {
  Package,
  Plus,
  Save,
  X,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Target,
  Beaker,
  Box
} from 'lucide-react';

const RawMaterialsReceptionTracker = ({ onSave, onCancel, existingData = null }) => {
  // Obtenir la date actuelle du système correctement
  const aujourdhui = new Date();
  
  // Fonctions utilitaires pour mois
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

  // État - initialiser avec les données existantes ou par défaut
  const [dateSelectionnee, setDateSelectionnee] = useState(
    existingData?.date || aujourdhui.toISOString().split('T')[0]
  );
  const [objectifMensuel, setObjectifMensuel] = useState(existingData?.monthlyTarget || 90);
  const [receptions, setReceptions] = useState(existingData?.receptions || []);
  const [erreurs, setErreurs] = useState({});
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [nouvelleReception, setNouvelleReception] = useState({
    date: aujourdhui.toISOString().split('T')[0],
    time: aujourdhui.toTimeString().slice(0, 5),
    productName: '',
    productType: 'matiere_premiere',
    quantity: 1,
    isConforme: null
  });

  // Calculer KPI mensuel
  const calculerKPIMensuel = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    const receptionsMois = receptions.filter(r => {
      const dateReception = new Date(r.date);
      return dateReception >= debutMois && dateReception <= finMois;
    });
    
    if (receptionsMois.length === 0) return 100;
    
    const nombreConforme = receptionsMois.filter(r => r.isConforme === true).length;
    const nombreTotal = receptionsMois.length;
    
    return Math.round((nombreConforme / nombreTotal) * 100);
  };

  // Obtenir statistiques mensuelles
  const obtenirStatistiques = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    const receptionsMois = receptions.filter(r => {
      const dateReception = new Date(r.date);
      return dateReception >= debutMois && dateReception <= finMois;
    });
    
    const total = receptionsMois.length;
    const conforme = receptionsMois.filter(r => r.isConforme === true).length;
    const nonConforme = receptionsMois.filter(r => r.isConforme === false).length;
    const attente = receptionsMois.filter(r => r.isConforme === null).length;
    
    // Détection du mois actuel système
    const dateMoisSelectionne = new Date(dateSelectionnee);
    const estMoisActuel = dateMoisSelectionne.getMonth() === aujourdhui.getMonth() && 
                         dateMoisSelectionne.getFullYear() === aujourdhui.getFullYear();
    
    return {
      total,
      conforme,
      nonConforme,
      attente,
      estMoisActuel,
      tauxConformite: total > 0 ? Math.round((conforme / total) * 100) : 0
    };
  };

  // Navigation mensuelle
  const naviguerMois = (direction) => {
    const dateActuelle = new Date(dateSelectionnee);
    const nouvelleDate = new Date(dateActuelle.setMonth(dateActuelle.getMonth() + direction));
    setDateSelectionnee(nouvelleDate.toISOString().split('T')[0]);
  };

  const ajouterReception = () => {
    if (!nouvelleReception.productName.trim()) {
      setErreurs({ productName: 'Le nom du produit est requis' });
      return;
    }

    const reception = {
      id: Date.now(),
      date: nouvelleReception.date,
      time: nouvelleReception.time,
      productName: nouvelleReception.productName.trim(),
      productType: nouvelleReception.productType,
      quantity: nouvelleReception.quantity,
      isConforme: null,
      createdAt: new Date().toISOString()
    };

    setReceptions(prev => [...prev, reception]);
    
    // Changer automatiquement vers le mois de la nouvelle réception
    const moisNouvelleReception = new Date(nouvelleReception.date);
    setDateSelectionnee(nouvelleReception.date);
    
    setNouvelleReception({
      date: aujourdhui.toISOString().split('T')[0],
      time: aujourdhui.toTimeString().slice(0, 5),
      productName: '',
      productType: 'matiere_premiere',
      quantity: 1,
      isConforme: null
    });
    setAfficherFormulaire(false);
    setErreurs({});
  };

  const supprimerReception = (receptionId) => {
    setReceptions(prev => prev.filter(r => r.id !== receptionId));
  };

  const mettreAJourStatutReception = (receptionId, isConforme) => {
    setReceptions(prev => prev.map(reception => 
      reception.id === receptionId ? { ...reception, isConforme } : reception
    ));
  };

  const gererSoumission = () => {
    if (receptions.length === 0) {
      setErreurs({ receptions: 'Ajoutez au moins une réception' });
      return;
    }
    
    const kpiMensuel = calculerKPIMensuel();
    const stats = obtenirStatistiques();
    
    const donneesReception = {
      value: kpiMensuel,
      date: dateSelectionnee,
      monthlyTarget: objectifMensuel,
      receptions: receptions,
      stats: stats,
      type: 'raw_materials_reception'
    };
    
    onSave('quality', 'material_batch_acceptance_rate', donneesReception, '');
  };

  // Obtenir réceptions du mois
  const obtenirReceptionsMois = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    return receptions.filter(r => {
      const dateReception = new Date(r.date);
      return dateReception >= debutMois && dateReception <= finMois;
    });
  };

  const stats = obtenirStatistiques();
  const kpiMensuel = calculerKPIMensuel();
  const receptionsMois = obtenirReceptionsMois();
  const moisActuel = obtenirNomMois(dateSelectionnee);
  const anneeActuelle = new Date(dateSelectionnee).getFullYear();

  // Obtenir couleur KPI basée sur l'objectif personnalisé
  const obtenirCouleurKPI = () => {
    if (kpiMensuel >= 95) return 'text-emerald-600';
    if (kpiMensuel >= objectifMensuel) return 'text-blue-600';
    if (kpiMensuel >= objectifMensuel * 0.8) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-6xl h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden border border-emerald-100">
        
        {/* En-tête moderne */}
        <div className="px-6 py-4 bg-white border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Contrôle Réception Matières Premières
                </h1>
                <p className="text-sm text-slate-700">
                  Suivi mensuel des conformités à la réception
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  KPI Mensuel
                </div>
                <div 
                  className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                  title={`📊 FORMULE KPI RÉCEPTION

🎯 CALCUL DU SCORE:
• KPI = (Réceptions Conformes ÷ Total Réceptions) × 100

📋 SITUATION ACTUELLE:
• Mois: ${moisActuel} ${anneeActuelle}
• Total réceptions: ${stats.total}
• Réceptions conformes: ${stats.conforme}
• Réceptions non-conformes: ${stats.nonConforme}
• En attente de contrôle: ${stats.attente}
• Objectif personnalisé: ${objectifMensuel}%

📈 EXEMPLE DE CALCUL:
• Si ${stats.conforme} conformes sur ${stats.total} réceptions → KPI = ${kpiMensuel}%
• Si 0 réception → KPI = 100% (aucun problème)

💡 INTERPRÉTATION:
• 95-100%: Excellence qualité
• ${objectifMensuel}-94%: Performance satisfaisante
• ${Math.round(objectifMensuel * 0.8)}-${objectifMensuel-1}%: Attention requise
• <${Math.round(objectifMensuel * 0.8)}%: Action corrective urgente

Score actuel: ${kpiMensuel}%
${kpiMensuel >= objectifMensuel ? '✅ OBJECTIF ATTEINT' : '🚨 SOUS LE SEUIL'}`}
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
        <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            
            {/* Navigation mois */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => naviguerMois(-1)}
                className="w-8 h-8 rounded-lg bg-white border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-700" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className="text-lg font-medium text-slate-900">
                  {moisActuel} {anneeActuelle}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  {stats.estMoisActuel ? 'Mois actuel' : 'Mois sélectionné'}
                </div>
              </div>
              
              <button
                onClick={() => naviguerMois(1)}
                className="w-8 h-8 rounded-lg bg-white border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>

            {/* Métriques en temps réel */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div>
                    <div className="text-lg font-semibold text-emerald-600">{stats.conforme}</div>
                    <div className="text-xs text-emerald-600 font-medium">Conformes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">{stats.nonConforme}</div>
                    <div className="text-xs text-red-600 font-medium">Non-Conformes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>
                    <div className="text-lg font-semibold text-amber-600">{stats.attente}</div>
                    <div className="text-xs text-amber-600 font-medium">En Attente</div>
                  </div>
                </div>
              </div>
              
              {/* Objectif modifiable */}
              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white border border-emerald-200">
                <Target className="w-4 h-4 text-emerald-600" />
                <div className="text-sm font-medium text-slate-700">Objectif:</div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setObjectifMensuel(Math.max(0, objectifMensuel - 5))}
                    className="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-all text-xs font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={objectifMensuel}
                    onChange={(e) => setObjectifMensuel(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-14 text-center text-sm font-semibold bg-white border border-emerald-200 rounded-md py-1 outline-none focus:border-emerald-500 text-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700">%</span>
                  <button
                    onClick={() => setObjectifMensuel(Math.min(100, objectifMensuel + 5))}
                    className="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-all text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bouton ajout */}
            <button
              onClick={() => setAfficherFormulaire(!afficherFormulaire)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                afficherFormulaire
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2">
                {afficherFormulaire ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{afficherFormulaire ? 'Annuler' : 'Nouvelle Réception'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-1 min-h-0">
          
          {/* Formulaire d'ajout (si affiché) */}
          {afficherFormulaire && (
            <div className="w-80 border-r border-emerald-100 bg-emerald-50/30 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Nouvelle Réception</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={nouvelleReception.date}
                      onChange={(e) => setNouvelleReception(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-slate-900 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={nouvelleReception.time}
                      onChange={(e) => setNouvelleReception(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-slate-900 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nom du Produit
                  </label>
                  <input
                    type="text"
                    value={nouvelleReception.productName}
                    onChange={(e) => setNouvelleReception(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Ex: Acide Citrique 25kg"
                    className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-slate-900 text-sm focus:border-emerald-500 outline-none"
                  />
                  {erreurs.productName && (
                    <p className="text-red-500 text-xs mt-1">{erreurs.productName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Type
                    </label>
                    <select
                      value={nouvelleReception.productType}
                      onChange={(e) => setNouvelleReception(prev => ({ ...prev, productType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-slate-900 text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value="matiere_premiere">Matière Première</option>
                      <option value="emballage">Emballage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nouvelleReception.quantity}
                      onChange={(e) => setNouvelleReception(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-slate-900 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={ajouterReception}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Liste des réceptions - Design épuré et élégant */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Réceptions de {moisActuel}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {receptionsMois.length} réception(s) • {stats.conforme} conforme(s)
                  </p>
                </div>
              </div>
            </div>

            {receptionsMois.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Aucune réception ce mois
                </h3>
                <p className="text-slate-600">
                  Ajoutez des réceptions pour commencer le suivi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {receptionsMois.map((reception) => {
                  const infoProduit = reception.productType === 'matiere_premiere' 
                    ? { icon: Beaker, couleur: 'bg-blue-500', label: 'Matière Première' }
                    : { icon: Box, couleur: 'bg-purple-500', label: 'Emballage' };
                  
                  const IconeProduit = infoProduit.icon;
                  
                  return (
                    <div 
                      key={reception.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar produit */}
                        <div className={`w-10 h-10 rounded-lg ${infoProduit.couleur} flex items-center justify-center flex-shrink-0`}>
                          <IconeProduit className="w-5 h-5 text-white" />
                        </div>
                        
                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 truncate">
                                {reception.productName}
                              </h4>
                              <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(reception.date).toLocaleDateString('fr-FR')}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{reception.time}</span>
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  reception.productType === 'matiere_premiere'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {infoProduit.label}
                                </span>
                                <span className="font-medium">Qté: {reception.quantity}</span>
                              </div>
                            </div>
                            
                            {/* Contrôles de statut compacts */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => mettreAJourStatutReception(reception.id, true)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  reception.isConforme === true
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                <Check className="w-3 h-3 inline mr-1" />
                                Conforme
                              </button>
                              <button
                                onClick={() => mettreAJourStatutReception(reception.id, false)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  reception.isConforme === false
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                }`}
                              >
                                <X className="w-3 h-3 inline mr-1" />
                                Non Conforme
                              </button>
                              {reception.isConforme === null && (
                                <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-700">
                                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                                  Attente
                                </div>
                              )}
                              <button
                                onClick={() => supprimerReception(reception.id)}
                                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {erreurs.receptions && (
              <div className="text-center py-4 border-2 border-dashed rounded-xl mt-6 border-red-300 bg-red-50">
                <p className="text-red-500 font-semibold text-sm">{erreurs.receptions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 bg-white border-t border-emerald-100 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpiMensuel}% KPI Mensuel</span>
              </div>
              <div className="text-sm text-slate-700 font-medium">
                {stats.conforme}/{stats.total} réceptions conformes
              </div>
              <div className="text-sm text-emerald-600 font-medium">
                {moisActuel} {anneeActuelle}
              </div>
              <div className="text-sm text-emerald-600 font-medium">
                Objectif: ≥{objectifMensuel}%
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
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all flex items-center space-x-2 shadow-sm"
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

export default RawMaterialsReceptionTracker;