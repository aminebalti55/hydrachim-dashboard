import React, { useState } from 'react';
import {
  Package,
  Save,
  X,
  Search,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Target,
  List,
  Beaker,
  Activity,
  FlaskConical,
  TrendingUp
} from 'lucide-react';

const InventoryQualityTracker = ({ onSave, onCancel, existingData = null }) => {
  // Catégories de produits
  const categoriesProduits = {
    matieres_premieres: {
      name: 'Matières Premières',
      icon: TestTube,
      color: 'blue',
      items: [
        'Acide citrique', 'Acticide DDQ 50', 'Acticide GDA 50', 'Amidét B112',
        'BAC 50 Bactéricide Fangicide', 'Butyl glycol', 'Chimisol 13 LH FD',
        'Chlorhexidine gluconate 20%', 'Colorant bleu acide', 'Colorant jaune tartracina E-102',
        'Colorant marron SAV 648', 'Colorant rose rodhamine', 'Colorant vert olive',
        'Colorant violet acide 17', 'Décapant carrelage', 'Dehscofix CO 125', 'DPG',
        'Eau déminéralisée', 'EDTA-Masqual EDTA Na', 'Eltesol SC 93', 'Empicol OP 301',
        'Empigen BAC 80', 'Empigen BS/FA', 'Empigen OB', 'Empilan KR6', 'Formol',
        'Glutaraldéhyde 50%', 'Glyoxal 40%', 'Gomme xanthane', 'Green Apple LEV',
        'Hydroxypropylméthylcellulose HPMC', 'Isopropyl alcohol IPA',
        'Linear Alkyl Benzene Sulfonic Acid LABSA 96%', 'MP Acide nitrique 58%',
        'MP Acide phosphorique 85%', 'MP Extrait de Javel 50°', 'MP Lessive de soude caustique 50%',
        'MP Premix Alcalin', 'MP Premix Alcalin Chlore', 'MP Premix CAM 4260',
        'MP Premix CIP 1500', 'MP Premix Dégraissant alimentaire', 'Musk Nokhba',
        'Nansa LSS 38/AS', 'NP9', 'Parfum vanille oude', 'Parfum citron vert',
        'Parfum extra lavender', 'Parfum jasmin', 'Parfum lavande', 'Parfum lemon',
        'Parfum MAR', 'Parfum océan bleu', 'Parfum oud cannelle', 'Parfum pear & rose',
        'Parfum pêche', 'Parfum pin parasol', 'Parfum pink comfort', 'Parfum pretty lemon',
        'Parfum softinella', 'Potasse caustique', 'Producto 2000', 'Sel', 'Sinebact CG',
        'Sodium Lauryl Ether Sulfate SLES 70%', 'TEA'
      ]
    },
    produits_finis: {
      name: 'Produits Finis',
      icon: Beaker,
      color: 'purple',
      items: [
        'Dégraissant alimentaire', 'Agita', 'Atom EC 25', 'Airfresh good vibes',
        'CAM 1501', 'CAM 4102', 'CAM 4260', 'CIP 1073', 'CIP 1273', 'CIP 1500',
        'CIP 2040', 'Crème mains bactéricides', 'Décap Force Four', 'Décasol', 'DEGR MS'
      ]
    },
    emballage: {
      name: 'Emballage',
      icon: Package,
      color: 'orange',
      items: [
        'BIDON JAUNE 20L BM 900 G', 'BIDON 20L BLANC BM 900 G', 'BIDON 20L BLEU BM 900 G',
        'BIDON 20L NOIR BM 900 G', 'BIDON 20L ROUGE BM 900 G', 'BIDON 20L VERT BM 1200 KG',
        'BIDON 5L BLANC', 'BIDON TRANSPARENT /20 L', 'BIDON TRANSPARENT 5L',
        'BOUCHON DESK-TOP 24', 'BOUTEILLE 0.5 L', 'BOUTEILLE 100 ML', 'BOUTEILLE 250 ML',
        'BOUTEILLE 250ML BLANC LAIT', 'BOUTEILLE 5L 9RAM', 'BOUTEILLE 750 ML',
        'CARTON 275180250', 'CARTON 400270260', 'CARTON pour 4 bid 5l TL/TL 400260300',
        'FLACON 1L BLANC AMP', 'FLACON 1L CARRE-SOTUPROC', 'FLACON 1L/ BLANC',
        'FLACON 200 ML-24', 'FLACON 200ML-28', 'FLACON TRANSPARENT 1L AM',
        'LOTION PUMP FP 314 38/400 WHITE', 'MINI TRIGGER 28/410', 'MIST SPRAYER FP601',
        'POMPE BEC LONG G28', 'POMPE BLANC DIAM 28'
      ]
    }
  };

  // Types de tests par catégorie
  const typesTests = {
    matieres_premieres: [
      { id: 'ph', name: 'pH', icon: TestTube, color: 'blue' },
      { id: 'dosage', name: 'Dosage', icon: FlaskConical, color: 'indigo' },
      { id: 'densite', name: 'Densité', icon: Activity, color: 'purple' }
    ],
    produits_finis: [
      { id: 'ph', name: 'pH', icon: TestTube, color: 'blue' },
      { id: 'dosage', name: 'Dosage', icon: FlaskConical, color: 'indigo' },
      { id: 'densite', name: 'Densité', icon: Activity, color: 'purple' }
    ],
    emballage: [
      { id: 'aspect_visuel', name: 'Aspect Visuel', icon: Eye, color: 'emerald' }
    ]
  };

  // État - initialiser avec données existantes
  const [categorieActive, setCategorieActive] = useState('matieres_premieres');
  const [termeRecherche, setTermeRecherche] = useState('');
  const [seuilKPI, setSeuilKPI] = useState(existingData?.kpiThreshold || 90);
  const [testsProduits, setTestsProduits] = useState(existingData?.productTests || {});
  const [filtreStatut, setFiltreStatut] = useState('all');

  // Obtenir le total des produits testables
  const obtenirTotalProduitsTestables = () => {
    return Object.values(categoriesProduits).reduce((total, cat) => total + cat.items.length, 0);
  };

  // Calculer le KPI
  const calculerKPI = () => {
    const totalProduits = obtenirTotalProduitsTestables();
    let produitsEchoues = 0;

    Object.entries(categoriesProduits).forEach(([categorieKey, categorie]) => {
      categorie.items.forEach(item => {
        const cleTest = `${categorieKey}_${item}`;
        const testProduit = testsProduits[cleTest];
        
        if (testProduit && testProduit.dernierTest && testProduit.reussiteGlobale === false) {
          produitsEchoues++;
        }
      });
    });

    const deductionParProduit = 100 / totalProduits;
    const kpi = Math.max(0, 100 - (produitsEchoues * deductionParProduit));
    
    return Math.round(kpi * 100) / 100;
  };

  // Mettre à jour résultat de test
  const mettreAJourResultatTest = (nomProduit, categorie, testId, reussi) => {
    const cleTest = `${categorie}_${nomProduit}`;
    
    setTestsProduits(prev => {
      const miseAJour = { ...prev };
      
      if (!miseAJour[cleTest]) {
        const testsCategorie = typesTests[categorie] || [];
        miseAJour[cleTest] = {
          nomProduit,
          categorie,
          tests: testsCategorie.reduce((acc, test) => ({
            ...acc,
            [test.id]: { reussi: null, teste: false }
          }), {}),
          dernierTest: null,
          reussiteGlobale: null
        };
      }

      // Mettre à jour test spécifique
      miseAJour[cleTest].tests[testId] = {
        reussi: reussi,
        teste: true
      };

      // Vérifier si tous les tests sont terminés
      const tousTests = Object.values(miseAJour[cleTest].tests);
      const tousTestes = tousTests.every(test => test.teste);
      
      if (tousTestes) {
        const tousReussis = tousTests.every(test => test.reussi === true);
        miseAJour[cleTest].reussiteGlobale = tousReussis;
        miseAJour[cleTest].dernierTest = new Date().toISOString();
      } else {
        miseAJour[cleTest].reussiteGlobale = null;
      }

      return miseAJour;
    });
  };

  // Obtenir produits filtrés
  const obtenirProduitsFiltres = (categorie) => {
    let items = categoriesProduits[categorie].items;

    if (termeRecherche) {
      items = items.filter(item => 
        item.toLowerCase().includes(termeRecherche.toLowerCase())
      );
    }

    if (filtreStatut !== 'all') {
      items = items.filter(item => {
        const cleTest = `${categorie}_${item}`;
        const testProduit = testsProduits[cleTest];
        
        switch (filtreStatut) {
          case 'reussi':
            return testProduit?.reussiteGlobale === true;
          case 'echec':
            return testProduit?.reussiteGlobale === false;
          case 'attente':
            return !testProduit?.dernierTest;
          default:
            return true;
        }
      });
    }

    return items;
  };

  // Obtenir statistiques
  const obtenirStatistiques = () => {
    let total = 0;
    let reussis = 0;
    let echoues = 0;
    let attente = 0;

    Object.entries(categoriesProduits).forEach(([categorieKey, categorie]) => {
      categorie.items.forEach(item => {
        const cleTest = `${categorieKey}_${item}`;
        const testProduit = testsProduits[cleTest];
        
        total++;
        if (testProduit?.reussiteGlobale === true) {
          reussis++;
        } else if (testProduit?.reussiteGlobale === false) {
          echoues++;
        } else {
          attente++;
        }
      });
    });

    return { total, reussis, echoues, attente };
  };

  // Tests rapides
  const testRapideReussite = (nomProduit, categorie) => {
    const testsCategorie = typesTests[categorie] || [];
    testsCategorie.forEach(test => {
      mettreAJourResultatTest(nomProduit, categorie, test.id, true);
    });
  };

  const testRapideEchec = (nomProduit, categorie) => {
    const testsCategorie = typesTests[categorie] || [];
    testsCategorie.forEach(test => {
      mettreAJourResultatTest(nomProduit, categorie, test.id, false);
    });
  };

  const gererSoumission = () => {
    const kpi = calculerKPI();
    const stats = obtenirStatistiques();
    
    const donneesInventaire = {
      value: kpi,
      date: new Date().toISOString().split('T')[0],
      kpiThreshold: seuilKPI,
      productTests: testsProduits,
      stats: stats,
      type: 'inventory_quality'
    };
    
    onSave('quality', 'raw_materials_inventory_list', donneesInventaire, '');
  };

  const kpi = calculerKPI();
  const stats = obtenirStatistiques();
  const kpiPerdu = kpi < seuilKPI;

  // Obtenir couleur KPI
  const obtenirCouleurKPI = () => {
    if (kpi >= 95) return 'text-emerald-600';
    if (kpi >= seuilKPI) return 'text-blue-600';
    if (kpi >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  // Obtenir couleur catégorie
  const obtenirCouleurCategorie = (categorie) => {
    const couleurs = {
      blue: 'bg-blue-500 hover:bg-blue-600 border-blue-500',
      purple: 'bg-purple-500 hover:bg-purple-600 border-purple-500',
      orange: 'bg-orange-500 hover:bg-orange-600 border-orange-500'
    };
    return couleurs[categoriesProduits[categorie].color] || 'bg-slate-500 hover:bg-slate-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-6xl h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden border border-blue-100">
        
        {/* En-tête moderne */}
        <div className="px-6 py-4 bg-white border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                <List className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Contrôle Qualité Inventaire
                </h1>
                <p className="text-sm text-slate-700">
                  Suivi complet matières, produits et emballages
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Performance KPI
                </div>
                <div 
                  className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                  title={`📊 FORMULE KPI QUALITÉ

🎯 CALCUL DU SCORE:
• Base: 100% (performance parfaite)
• Déduction: 100 ÷ ${obtenirTotalProduitsTestables()} = ${(100/obtenirTotalProduitsTestables()).toFixed(2)}% par produit échoué

📋 SITUATION ACTUELLE:
• Total produits: ${stats.total}
• Produits conformes: ${stats.reussis}
• Produits non-conformes: ${stats.echoues}
• En attente de test: ${stats.attente}
• Seuil minimum: ${seuilKPI}%

🧪 TESTS PAR CATÉGORIE:
• Matières Premières: pH, Dosage, Densité
• Produits Finis: pH, Dosage, Densité
• Emballage: Aspect Visuel

💡 INTERPRÉTATION:
• 95-100%: Excellence qualité
• ${seuilKPI}-94%: Performance satisfaisante
• 50-${seuilKPI-1}%: Attention requise
• <50%: Action corrective urgente

Score actuel: ${kpi}%
${kpiPerdu ? '🚨 SEUIL NON ATTEINT' : '✅ OBJECTIF ATTEINT'}`}
                >
                  {kpi}%
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

        {/* Panneau de contrôle optimisé */}
        <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            
            {/* Métriques simplifiées */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <div className="text-xl font-bold text-emerald-600">{stats.reussis}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <div className="text-xl font-bold text-red-600">{stats.echoues}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <div className="text-xl font-bold text-amber-600">{stats.attente}</div>
                </div>
              </div>
              
              {/* Seuil KPI avec espacement */}
              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white border border-blue-200 ml-8">
                <Target className="w-4 h-4 text-blue-600" />
                <div className="text-sm font-medium text-slate-700">Seuil:</div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSeuilKPI(Math.max(0, seuilKPI - 5))}
                    className="w-6 h-6 rounded-md bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-700 transition-all text-xs font-bold"
                  >
                    −
                  </button>
                  <div className="w-12 text-center text-sm font-semibold text-slate-900">
                    {seuilKPI}%
                  </div>
                  <button
                    onClick={() => setSeuilKPI(Math.min(100, seuilKPI + 5))}
                    className="w-6 h-6 rounded-md bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-700 transition-all text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Recherche et filtres avec espacement */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={termeRecherche}
                  onChange={(e) => setTermeRecherche(e.target.value)}
                  placeholder="Rechercher produit..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-blue-200 bg-white text-slate-900 text-sm focus:border-blue-500 outline-none w-56"
                />
              </div>
              
              <div className="flex items-center space-x-1 bg-white rounded-lg border border-blue-200 p-1">
                <button
                  onClick={() => setFiltreStatut('all')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    filtreStatut === 'all' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-blue-50'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFiltreStatut('reussi')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    filtreStatut === 'reussi' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-emerald-50'
                  }`}
                >
                  Conformes
                </button>
                <button
                  onClick={() => setFiltreStatut('echec')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    filtreStatut === 'echec' ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-red-50'
                  }`}
                >
                  Non-Conformes
                </button>
                <button
                  onClick={() => setFiltreStatut('attente')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    filtreStatut === 'attente' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  En Attente
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-1 min-h-0">
          
          {/* Onglets catégories */}
          <div className="w-60 border-r border-blue-100 bg-blue-50/30 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Catégories</h3>
            <div className="space-y-3">
              {Object.entries(categoriesProduits).map(([categorieKey, categorie]) => (
                <button
                  key={categorieKey}
                  onClick={() => setCategorieActive(categorieKey)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    categorieActive === categorieKey
                      ? `${obtenirCouleurCategorie(categorieKey)} text-white shadow-lg`
                      : 'bg-white hover:bg-blue-50 text-slate-700 border border-blue-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      categorieActive === categorieKey ? 'bg-white/20' : 'bg-blue-100'
                    }`}>
                      <categorie.icon className={`w-4 h-4 ${
                        categorieActive === categorieKey ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{categorie.name}</div>
                      <div className={`text-xs ${
                        categorieActive === categorieKey ? 'text-white/80' : 'text-slate-500'
                      }`}>
                        {categorie.items.length} produits
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Liste des produits */}
          <div className="flex-1 overflow-y-auto p-6">
            {(() => {
              const categorieActuelle = categoriesProduits[categorieActive];
              const produitsFiltres = obtenirProduitsFiltres(categorieActive);
              const testsCategorie = typesTests[categorieActive] || [];
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${obtenirCouleurCategorie(categorieActive)}`}>
                        <categorieActuelle.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          {categorieActuelle.name}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {produitsFiltres.length} produit(s) • Tests: {testsCategorie.map(t => t.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {produitsFiltres.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-slate-600">
                        Modifiez vos critères de recherche
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {produitsFiltres.map((item) => {
                        const cleTest = `${categorieActive}_${item}`;
                        const testProduit = testsProduits[cleTest];
                        const aTests = testProduit?.dernierTest;
                        const tousReussis = testProduit?.reussiteGlobale;
                        
                        return (
                          <div key={item} className="p-5 rounded-xl bg-white border border-blue-100 hover:border-blue-200 transition-all shadow-sm">
                            
                            {/* En-tête produit */}
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-slate-900 mb-1">
                                  {item}
                                </h4>
                                <div className="flex items-center space-x-4">
                                  <div className="text-sm text-slate-600 font-medium">
                                    {categorieActuelle.name}
                                  </div>
                                  
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    aTests
                                      ? tousReussis === true
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : tousReussis === false
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {aTests
                                      ? tousReussis === true ? 'Conforme' 
                                        : tousReussis === false ? 'Non Conforme' 
                                        : 'Partiel'
                                      : 'Non Testé'
                                    }
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => testRapideReussite(item, categorieActive)}
                                  className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium transition-all"
                                >
                                  <CheckCircle className="w-4 h-4 inline mr-1" />
                                  Tout Valider
                                </button>
                                
                                <button
                                  onClick={() => testRapideEchec(item, categorieActive)}
                                  className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition-all"
                                >
                                  <XCircle className="w-4 h-4 inline mr-1" />
                                  Tout Rejeter
                                </button>
                              </div>
                            </div>

                            {/* Interface de test révolutionnaire - Switch Toggle Style */}
                            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <TestTube className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Tests Qualité
                                  </span>
                                </div>
                                {aTests && (
                                  <div className="text-xs text-slate-600 font-medium">
                                    {new Date(testProduit.dernierTest).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                              </div>
                              
                              {/* Tests side-by-side améliorés */}
                              <div className={`grid gap-4 ${testsCategorie.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                {testsCategorie.map((test) => {
                                  const testsActuels = testProduit?.tests || {};
                                  const testActuel = testsActuels[test.id] || { reussi: null, teste: false };
                                  
                                  return (
                                    <div key={test.id} className="bg-white rounded-lg p-4 border border-blue-100">
                                      {/* En-tête test */}
                                      <div className="flex items-center space-x-2 mb-4">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                          test.color === 'blue' ? 'bg-blue-500' :
                                          test.color === 'indigo' ? 'bg-indigo-500' :
                                          test.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'
                                        }`}>
                                          <test.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h6 className="text-sm font-medium text-slate-900">
                                            {test.name}
                                          </h6>
                                          {testActuel.teste && (
                                            <div className={`text-xs font-medium ${
                                              testActuel.reussi === true ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                              {testActuel.reussi === true ? 'Validé' : 'Rejeté'}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Toggle Switch Style */}
                                      <div className="space-y-2">
                                        <button
                                          onClick={() => mettreAJourResultatTest(item, categorieActive, test.id, true)}
                                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                            testActuel.reussi === true
                                              ? 'bg-emerald-500 text-white shadow-md scale-105'
                                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                          }`}
                                        >
                                          <CheckCircle className="w-4 h-4 inline mr-2" />
                                          Valider
                                        </button>

                                        <button
                                          onClick={() => mettreAJourResultatTest(item, categorieActive, test.id, false)}
                                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                            testActuel.reussi === false
                                              ? 'bg-red-500 text-white shadow-md scale-105'
                                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                          }`}
                                        >
                                          <XCircle className="w-4 h-4 inline mr-2" />
                                          Rejeter
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 bg-white border-t border-blue-100 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpi}% Performance KPI</span>
              </div>
              <div className="text-sm text-slate-700 font-medium">
                {stats.reussis}/{stats.total} produits conformes
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Seuil: ≥{seuilKPI}%
              </div>
              {kpiPerdu && (
                <div className="text-sm text-red-600 font-medium">
                  Objectif non atteint
                </div>
              )}
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

export default InventoryQualityTracker;