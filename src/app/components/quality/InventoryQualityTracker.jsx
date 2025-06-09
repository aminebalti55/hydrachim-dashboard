import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Save,
  X,
  Search,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit3,
  Filter,
  BarChart3,
  Target,
  TrendingDown,
  Clock,
  List,
  ChevronRight,
  ChevronDown,
  Beaker,
  Droplets,
  Activity,
  FlaskConical,
  Zap
} from 'lucide-react';

const InventoryQualityTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Product categories and items
  const productCategories = {
    matieres_premieres: {
      name: '🧪 Matières premières',
      icon: TestTube,
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
      name: '🧴 Produits finis',
      icon: Beaker,
      items: [
        'Dégraissant alimentaire', 'Agita', 'Atom EC 25', 'Airfresh good vibes',
        'CAM 1501', 'CAM 4102', 'CAM 4260', 'CIP 1073', 'CIP 1273', 'CIP 1500',
        'CIP 2040', 'Crème mains bactéricides', 'Décap Force Four', 'Décasol', 'DEGR MS'
      ]
    },
    emballage: {
      name: '📦 Emballage',
      icon: Package,
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

  // Test types for materials and finished products
  const testTypes = [
    { id: 'ph', name: 'pH', icon: Droplets, unit: '', color: 'blue' },
    { id: 'dosage', name: 'Dosage', icon: TestTube, unit: '%', color: 'indigo' },
    { id: 'densite', name: 'Densité', icon: Activity, unit: 'g/cm³', color: 'purple' }
  ];

  // State management
  const [activeCategory, setActiveCategory] = useState('matieres_premieres');
  const [searchTerm, setSearchTerm] = useState('');
  const [kpiThreshold, setKpiThreshold] = useState(existingData?.kpiThreshold || 90);
  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || new Date().toISOString().split('T')[0]
  );
  const [productTests, setProductTests] = useState(existingData?.productTests || {});
  const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed, pending

  // Calculate total testable products
  const getTotalTestableProducts = () => {
    return productCategories.matieres_premieres.items.length + productCategories.produits_finis.items.length;
  };

  // Calculate KPI with correct logic
  const calculateKPI = () => {
    const totalTestableProducts = getTotalTestableProducts();
    let failedProducts = 0;

    // Check matières premières
    productCategories.matieres_premieres.items.forEach(item => {
      const testKey = `matieres_premieres_${item}`;
      const productTest = productTests[testKey];
      
      if (productTest && productTest.lastTested && productTest.overallPassed === false) {
        failedProducts++;
      }
    });

    // Check produits finis
    productCategories.produits_finis.items.forEach(item => {
      const testKey = `produits_finis_${item}`;
      const productTest = productTests[testKey];
      
      if (productTest && productTest.lastTested && productTest.overallPassed === false) {
        failedProducts++;
      }
    });

    // Calculate KPI: Start at 100%, deduct percentage for each failed product
    const deductionPerProduct = 100 / totalTestableProducts;
    const kpi = Math.max(0, 100 - (failedProducts * deductionPerProduct));
    
    return Math.round(kpi * 100) / 100; // Round to 2 decimal places
  };

  // Update test result for a product
  const updateTestResult = (productName, category, testId, passed) => {
    const testKey = `${category}_${productName}`;
    
    setProductTests(prev => {
      const updated = { ...prev };
      
      if (!updated[testKey]) {
        updated[testKey] = {
          productName,
          category,
          tests: testTypes.reduce((acc, test) => ({
            ...acc,
            [test.id]: { passed: null, tested: false }
          }), {}),
          lastTested: null,
          overallPassed: null
        };
      }

      // Update specific test
      updated[testKey].tests[testId] = {
        passed: passed,
        tested: true
      };

      // Check if all tests are completed and calculate overall pass
      const allTests = Object.values(updated[testKey].tests);
      const allTested = allTests.every(test => test.tested);
      
      if (allTested) {
        const allPassed = allTests.every(test => test.passed === true);
        updated[testKey].overallPassed = allPassed;
        updated[testKey].lastTested = new Date().toISOString();
      } else {
        updated[testKey].overallPassed = null;
      }

      return updated;
    });
  };

  // Get filtered products based on search and status
  const getFilteredProducts = (category) => {
    let items = productCategories[category].items;

    // Filter by search term
    if (searchTerm) {
      items = items.filter(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by test status (only for testable categories)
    if (filterStatus !== 'all' && ['matieres_premieres', 'produits_finis'].includes(category)) {
      items = items.filter(item => {
        const testKey = `${category}_${item}`;
        const productTest = productTests[testKey];
        
        switch (filterStatus) {
          case 'passed':
            return productTest?.overallPassed === true;
          case 'failed':
            return productTest?.overallPassed === false;
          case 'pending':
            return !productTest?.lastTested;
          default:
            return true;
        }
      });
    }

    return items;
  };

  // Get status statistics
  const getStatusStats = () => {
    const testableCategories = ['matieres_premieres', 'produits_finis'];
    let total = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;

    testableCategories.forEach(category => {
      productCategories[category].items.forEach(item => {
        const testKey = `${category}_${item}`;
        const productTest = productTests[testKey];
        
        total++;
        if (productTest?.overallPassed === true) {
          passed++;
        } else if (productTest?.overallPassed === false) {
          failed++;
        } else {
          pending++;
        }
      });
    });

    return { total, passed, failed, pending };
  };

  // Quick test functions
  const quickTestPass = (productName, category) => {
    testTypes.forEach(test => {
      updateTestResult(productName, category, test.id, true);
    });
  };

  const quickTestFail = (productName, category) => {
    testTypes.forEach(test => {
      updateTestResult(productName, category, test.id, false);
    });
  };

  const handleSubmit = () => {
    const kpi = calculateKPI();
    const stats = getStatusStats();
    
    const inventoryData = {
      value: kpi,
      date: selectedDate,
      kpiThreshold: kpiThreshold,
      productTests: productTests,
      stats: stats,
      type: 'inventory_quality'
    };
    
    onSave('quality', 'raw_materials_inventory_list', inventoryData, '');
  };

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20'
  }`;

  const kpi = calculateKPI();
  const stats = getStatusStats();
  const isKpiLost = kpi < kpiThreshold;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl border flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <List className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Liste des Produits Matières Première et Emballage
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Gestion et suivi qualité de l'inventaire laboratoire
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-sm font-medium">KPI Global</div>
                <div className={`text-3xl font-bold ${
                  isKpiLost ? 'text-red-600' : 
                  kpi >= 95 ? 'text-emerald-600' : 
                  kpi >= kpiThreshold ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {kpi}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`p-3 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            
            {/* Left Column - Controls & Overview */}
            <div className={`w-2/5 border-r p-8 overflow-y-auto ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            }`}>
              
              {/* Configuration */}
              <div className={`p-6 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Target className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Configuration
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Date de contrôle
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={baseInputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Seuil KPI minimum (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kpiThreshold}
                      onChange={(e) => setKpiThreshold(parseInt(e.target.value) || 90)}
                      className={baseInputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* KPI Overview */}
              <div className="space-y-4 mb-6">
                {/* Main KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Performance Globale
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Total: {getTotalTestableProducts()} produits
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      isKpiLost ? 'text-red-600' : 
                      kpi >= 95 ? 'text-emerald-600' : 
                      kpi >= kpiThreshold ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {kpi}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs px-2 py-1 rounded-lg font-semibold inline-block ${
                      isKpiLost
                        ? isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                        : kpi >= 95
                        ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isKpiLost ? '❌ KPI PERDU' : '✅ KPI OK'} - Seuil: ≥ {kpiThreshold}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {stats.passed}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        Tests Réussis
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {stats.failed}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                        Tests Échoués
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-amber-900 border-amber-800' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        {stats.pending}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                        En Attente
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {stats.total}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        Total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Search className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Recherche & Filtres
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Rechercher un produit
                    </label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nom du produit..."
                        className={`${baseInputClasses} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Filtrer par statut
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={baseInputClasses}
                    >
                      <option value="all">Tous les produits</option>
                      <option value="passed">Tests réussis</option>
                      <option value="failed">Tests échoués</option>
                      <option value="pending">En attente</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Lists */}
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Category Tabs */}
              <div className="flex space-x-4 mb-6">
                {Object.entries(productCategories).map(([categoryKey, category]) => (
                  <button
                    key={categoryKey}
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      activeCategory === categoryKey
                        ? 'bg-emerald-600 text-white'
                        : isDark 
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <category.icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="space-y-6">
                {Object.entries(productCategories)
                  .filter(([categoryKey]) => categoryKey === activeCategory)
                  .map(([categoryKey, category]) => {
                    const filteredItems = getFilteredProducts(categoryKey);
                    const isTestable = ['matieres_premieres', 'produits_finis'].includes(categoryKey);
                    
                    return (
                      <div key={categoryKey}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              categoryKey === 'matieres_premieres' ? 'bg-emerald-600' :
                              categoryKey === 'produits_finis' ? 'bg-blue-600' : 'bg-purple-600'
                            }`}>
                              <category.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {category.name}
                              </h3>
                              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {filteredItems.length} produit(s) 
                                {isTestable && ` • Tests requis: pH, Dosage, Densité`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {filteredItems.length === 0 ? (
                          <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'
                          }`}>
                            <Search className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                            <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Aucun produit trouvé
                            </p>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              Modifiez vos critères de recherche
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredItems.map((item) => {
                              const testKey = `${categoryKey}_${item}`;
                              const productTest = productTests[testKey];
                              const hasTests = productTest?.lastTested;
                              const allPassed = productTest?.overallPassed;
                              
                              return (
                                <div key={item} className={`p-6 rounded-xl border transition-colors ${
                                  isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}>
                                  <div className="space-y-4">
                                    {/* Product Header */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                          {item}
                                        </h4>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {categoryKey === 'matieres_premieres' ? '🧪 Matière première' :
                                             categoryKey === 'produits_finis' ? '🧴 Produit fini' : '📦 Emballage'}
                                          </div>
                                          
                                          {isTestable && (
                                            <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                                              hasTests
                                                ? allPassed === true
                                                  ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                  : allPassed === false
                                                  ? isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                                                  : isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                                                : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                              {hasTests
                                                ? allPassed === true ? '✅ CONFORME' 
                                                  : allPassed === false ? '❌ NON CONFORME' 
                                                  : '⏳ PARTIEL'
                                                : '⚪ NON TESTÉ'
                                              }
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {isTestable && (
                                        <div className="flex items-center space-x-3">
                                          <button
                                            onClick={() => quickTestPass(item, categoryKey)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                              isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            }`}
                                          >
                                            <CheckCircle className="w-4 h-4 inline mr-2" />
                                            RÉUSSIR TOUT
                                          </button>
                                          
                                          <button
                                            onClick={() => quickTestFail(item, categoryKey)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                              isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                          >
                                            <XCircle className="w-4 h-4 inline mr-2" />
                                            ÉCHOUER TOUT
                                          </button>
                                        </div>
                                      )}

                                      {!isTestable && (
                                        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                          isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                                          Tests à définir
                                        </div>
                                      )}
                                    </div>

                                    {/* Individual Tests */}
                                    {isTestable && (
                                      <div className={`p-4 rounded-lg border-2 border-dashed ${
                                        isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-300 bg-slate-50'
                                      }`}>
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center space-x-2">
                                            <TestTube className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                                            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                              Tests Individuels
                                            </span>
                                          </div>
                                          {hasTests && (
                                            <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                              Testé le {new Date(productTest.lastTested).toLocaleDateString('fr-FR')}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4">
                                          {testTypes.map((test) => {
                                            const currentTests = productTest?.tests || {};
                                            const currentTest = currentTests[test.id] || { passed: null, tested: false };
                                            
                                            return (
                                              <div key={test.id} className={`p-3 rounded-lg border ${
                                                isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
                                              }`}>
                                                <div className="flex items-center space-x-2 mb-3">
                                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                    test.color === 'blue' ? 'bg-blue-600' :
                                                    test.color === 'indigo' ? 'bg-indigo-600' : 'bg-purple-600'
                                                  }`}>
                                                    <test.icon className="w-3 h-3 text-white" />
                                                  </div>
                                                  <div>
                                                    <h6 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                      {test.name}
                                                    </h6>
                                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                      {test.unit || 'Unité'}
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                  <button
                                                    onClick={() => updateTestResult(item, categoryKey, test.id, true)}
                                                    className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                                                      currentTest.passed === true
                                                        ? isDark ? 'bg-emerald-700 text-emerald-100 ring-2 ring-emerald-500' : 'bg-emerald-200 text-emerald-800 ring-2 ring-emerald-400'
                                                        : isDark ? 'bg-slate-700 text-slate-400 hover:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
                                                    }`}
                                                  >
                                                    <CheckCircle className="w-3 h-3 mx-auto" />
                                                  </button>

                                                  <button
                                                    onClick={() => updateTestResult(item, categoryKey, test.id, false)}
                                                    className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                                                      currentTest.passed === false
                                                        ? isDark ? 'bg-red-700 text-red-100 ring-2 ring-red-500' : 'bg-red-200 text-red-800 ring-2 ring-red-400'
                                                        : isDark ? 'bg-slate-700 text-slate-400 hover:bg-red-900/30' : 'bg-slate-100 text-slate-600 hover:bg-red-100'
                                                    }`}
                                                  >
                                                    <XCircle className="w-3 h-3 mx-auto" />
                                                  </button>
                                                </div>

                                                {currentTest.tested && (
                                                  <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${
                                                    currentTest.passed === true
                                                      ? isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                      : currentTest.passed === false
                                                      ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                                      : isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                                                  }`}>
                                                    {currentTest.passed === true ? '✅' : 
                                                     currentTest.passed === false ? '❌' : '⏳'}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              KPI Global: <span className={`text-lg ${
                isKpiLost ? 'text-red-600' : 
                kpi >= 95 ? 'text-emerald-600' : 
                kpi >= kpiThreshold ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {kpi}%
              </span> • {stats.passed}/{stats.total} produits conformes • Seuil: ≥ {kpiThreshold}%
              {isKpiLost && <span className="text-red-500 ml-2">⚠️ KPI PERDU</span>}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors bg-emerald-600 hover:bg-emerald-700"
              >
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryQualityTracker;