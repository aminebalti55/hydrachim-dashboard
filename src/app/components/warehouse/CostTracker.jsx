import React, { useState, useMemo } from 'react';
import {
  Package,
  Save,
  X,
  Search,
  TestTube,
  Target,
  Banknote,
  TrendingUp,
  TrendingDown,
  Coins
} from 'lucide-react';

const CostTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Product categories and items
  const productCategories = {
    matieres_premieres: {
      name: 'Matières premières',
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
    emballage: {
      name: 'Emballage',
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

  // State management
  const [activeCategory, setActiveCategory] = useState('matieres_premieres');
  const [searchTerm, setSearchTerm] = useState('');
  const [budget, setBudget] = useState(existingData?.budget || 150000);
  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || new Date().toISOString().split('T')[0]
  );
  const [productCosts, setProductCosts] = useState(existingData?.productCosts || {});

  // Calculate total cost
  const getTotalCost = () => {
    return Object.values(productCosts).reduce((total, item) => {
      return total + (parseFloat(item.cost) || 0) * (parseFloat(item.quantity) || 1);
    }, 0);
  };

  // Calculate KPI
  const calculateKPI = () => {
    const totalCost = getTotalCost();
    return totalCost <= budget ? 100 : 0;
  };

  // Update cost for a product
  const updateProductCost = (productName, category, field, value) => {
    const costKey = `${category}_${productName}`;
    
    setProductCosts(prev => ({
      ...prev,
      [costKey]: {
        ...prev[costKey],
        productName,
        category,
        [field]: parseFloat(value) || (field === 'unit' ? value : 0),
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Get filtered products
  const getFilteredProducts = (category) => {
    let items = productCategories[category].items;
    if (searchTerm) {
      items = items.filter(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return items;
  };

  // Get cost statistics
  const getCostStats = () => {
    const totalCost = getTotalCost();
    const remainingBudget = budget - totalCost;
    const budgetedItems = Object.keys(productCosts).filter(key => productCosts[key]?.cost > 0).length;
    const totalItems = Object.values(productCategories).reduce((acc, cat) => acc + cat.items.length, 0);
    
    return {
      totalCost,
      remainingBudget,
      budgetedItems,
      totalItems,
      budgetUtilization: budget > 0 ? Math.round((totalCost / budget) * 100) : 0
    };
  };

  const handleSubmit = () => {
    const kpi = calculateKPI();
    const stats = getCostStats();
    
    const costData = {
      value: kpi,
      date: selectedDate,
      budget: budget,
      productCosts: productCosts,
      stats: stats,
      totalCost: getTotalCost(),
      type: 'cost_tracking'
    };
    
    onSave('warehouses', 'cost_per_formulation', costData, `Budget: ${budget.toLocaleString()} DT - Total: ${getTotalCost().toLocaleString()} DT`);
  };

  const baseInputClasses = `w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
    isDark 
      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
  }`;

  const kpi = calculateKPI();
  const stats = getCostStats();
  const isOverBudget = stats.totalCost > budget;
  const filteredItems = getFilteredProducts(activeCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl border flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Coût des Matières Premières et Emballage
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Gestion simple et directe des coûts en Dinars Tunisiens
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  KPI Budget
                </div>
                <div className={`text-3xl font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                  {kpi}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`p-3 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            
            {/* Left Panel - Configuration */}
            <div className={`w-80 border-r p-6 space-y-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              
              {/* Configuration */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Configuration
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Date d'évaluation
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={baseInputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Budget total (DT)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                      className={baseInputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Budget Summary */}
              <div className={`p-4 rounded-xl ${
                isOverBudget 
                  ? isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                  : isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Budget
                    </span>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {budget.toLocaleString()} DT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Utilisé
                    </span>
                    <span className={`text-lg font-bold ${
                      isOverBudget ? 'text-red-600' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {stats.totalCost.toLocaleString()} DT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {stats.remainingBudget >= 0 ? 'Restant' : 'Dépassement'}
                    </span>
                    <span className={`text-lg font-bold ${
                      stats.remainingBudget >= 0 
                        ? 'text-emerald-600' 
                        : 'text-red-600'
                    }`}>
                      {Math.abs(stats.remainingBudget).toLocaleString()} DT
                    </span>
                  </div>
                  <div className={`text-center py-2 px-3 rounded-lg text-sm font-semibold ${
                    isOverBudget
                      ? isDark ? 'bg-red-800 text-red-200' : 'bg-red-200 text-red-800'
                      : isDark ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-200 text-emerald-800'
                  }`}>
                    {isOverBudget ? '⚠️ BUDGET DÉPASSÉ' : '✅ BUDGET RESPECTÉ'}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                    placeholder="Tapez pour rechercher..."
                    className={`${baseInputClasses} pl-10`}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="text-center space-y-2">
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {stats.budgetedItems}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    articles sur {stats.totalItems} budgétés
                  </div>
                  <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2`}>
                    <div
                      className="h-2 rounded-full bg-violet-600"
                      style={{ width: `${(stats.budgetedItems / stats.totalItems) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Products */}
            <div className="flex-1 overflow-hidden flex flex-col">
              
              {/* Category Tabs */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex space-x-1">
                  {Object.entries(productCategories).map(([categoryKey, category]) => (
                    <button
                      key={categoryKey}
                      onClick={() => setActiveCategory(categoryKey)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === categoryKey
                          ? 'bg-violet-600 text-white'
                          : isDark 
                            ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <category.icon className="w-4 h-4" />
                      <span>{category.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeCategory === categoryKey
                          ? 'bg-white/20'
                          : isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}>
                        {category.items.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              <div className="flex-1 overflow-auto">
                {filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Search className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Aucun produit trouvé
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Modifiez votre terme de recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="space-y-2">
                      {/* Header */}
                      <div className={`grid grid-cols-12 gap-4 p-3 rounded-lg text-sm font-semibold ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <div className="col-span-5">Produit</div>
                        <div className="col-span-2 text-center">Prix (DT)</div>
                        <div className="col-span-2 text-center">Quantité</div>
                        <div className="col-span-1 text-center">Unité</div>
                        <div className="col-span-2 text-center">Total (DT)</div>
                      </div>

                      {/* Product Rows */}
                      {filteredItems.map((item, index) => {
                        const costKey = `${activeCategory}_${item}`;
                        const productCost = productCosts[costKey] || { cost: 0, quantity: 1, unit: 'kg' };
                        const totalCost = productCost.cost * productCost.quantity;

                        return (
                          <div
                            key={item}
                            className={`grid grid-cols-12 gap-4 p-3 rounded-lg border transition-colors ${
                              isDark 
                                ? 'border-slate-700 hover:bg-slate-800/50' 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="col-span-5 flex items-center">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item}
                              </span>
                            </div>
                            
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={productCost.cost || ''}
                                onChange={(e) => updateProductCost(item, activeCategory, 'cost', e.target.value)}
                                className={`${baseInputClasses} text-center`}
                                placeholder="0.0"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={productCost.quantity || ''}
                                onChange={(e) => updateProductCost(item, activeCategory, 'quantity', e.target.value)}
                                className={`${baseInputClasses} text-center`}
                                placeholder="1"
                              />
                            </div>
                            
                            <div className="col-span-1">
                              <select
                                value={productCost.unit || 'kg'}
                                onChange={(e) => updateProductCost(item, activeCategory, 'unit', e.target.value)}
                                className={`${baseInputClasses} text-center text-xs`}
                              >
                                <option value="kg">kg</option>
                                <option value="L">L</option>
                                <option value="pcs">pcs</option>
                                <option value="box">boîte</option>
                                <option value="m">m</option>
                                <option value="m²">m²</option>
                              </select>
                            </div>
                            
                            <div className="col-span-2 flex items-center justify-center">
                              <span className={`text-sm font-bold ${
                                totalCost > 0 
                                  ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                  : isDark ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                {totalCost > 0 ? totalCost.toLocaleString() : '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Total: <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.totalCost.toLocaleString()} DT
              </span> sur {budget.toLocaleString()} DT budget • {stats.budgetedItems} articles budgétés
            </div>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors bg-violet-600 hover:bg-violet-700"
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

export default CostTracker;