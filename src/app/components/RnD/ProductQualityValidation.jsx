import React, { useState } from 'react';
import {
  TestTube,
  Plus,
  Save,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  BarChart3,
  Trash2,
  FlaskConical,
  Package,
  TestTube2,
  Edit3,
  Beaker,
  Droplets,
  Gauge
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

const ProductQualityValidation = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [activeTab, setActiveTab] = useState('matiere_premiere');
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState(existingData?.products || {
    matiere_premiere: [],
    produit_fini: [],
    emballage: []
  });
  const [globalTargets, setGlobalTargets] = useState(existingData?.globalTargets || {
    matiere_premiere: 95,
    produit_fini: 98,
    emballage: 90
  });
  const [errors, setErrors] = useState({});

  // Test types for matiere_premiere and produit_fini
  const testTypes = [
    { id: 'density', name: 'Densité', icon: Gauge, color: 'text-blue-500' },
    { id: 'ph', name: 'pH', icon: Droplets, color: 'text-green-500' },
    { id: 'dosage', name: 'Dosage', icon: Beaker, color: 'text-purple-500' }
  ];

  // Listes prédéfinies
  const predefinedProducts = {
    matiere_premiere: [
      'Acide citrique', 'Acticide DDQ 50', 'Acticide GDA 50', 'Amidét B112', 'BAC 50 Bactéricide Fangicide',
      'Butyl glycol', 'Chimisol 13 LH FD', 'Chlorhexidine gluconate 20%', 'Colorant bleu acide', 'Colorant jaune tartracina E-102',
      'Colorant marron SAV 648', 'Colorant rose rodhamine', 'Colorant vert olive', 'Colorant violet acide 17', 'Décapant carrelage',
      'Dehscofix CO 125', 'DPG', 'Eau déminéralisée', 'EDTA-Masqual EDTA Na', 'Eltesol SC 93',
      'Empicol OP 301', 'Empigen BAC 80', 'Empigen BS/FA', 'Empigen OB', 'Empilan KR6',
      'Formol', 'Glutaraldéhyde 50%', 'Glyoxal 40%', 'Gomme xanthane', 'Green Apple LEV',
      'Hydroxypropylméthylcellulose HPMC', 'Isopropyl alcohol IPA', 'Linear Alkyl Benzene Sulfonic Acid LABSA 96%', 'MP Acide nitrique 58%', 'MP Acide phosphorique 85%',
      'MP Extrait de Javel 50°', 'MP Lessive de soude caustique 50%', 'MP Premix Alcalin', 'MP Premix Alcalin Chlore', 'MP Premix CAM 4260',
      'MP Premix CIP 1500', 'MP Premix Dégraissant alimentaire', 'Musk Nokhba', 'Nansa LSS 38/AS', 'NP9',
      'Parfum vanille oude', 'Parfum citron vert', 'Parfum extra lavender', 'Parfum jasmin', 'Parfum lavande',
      'Parfum lemon', 'Parfum MAR', 'Parfum océan bleu', 'Parfum oud cannelle', 'Parfum pear & rose',
      'Parfum pêche', 'Parfum pin parasol', 'Parfum pink comfort', 'Parfum pretty lemon', 'Parfum softinella',
      'Potasse caustique', 'Producto 2000', 'Sel', 'Sinebact CG', 'Sodium Lauryl Ether Sulfate SLES 70%', 'TEA'
    ],
    produit_fini: [
      'Dégraissant alimentaire', 'Agita', 'Atom EC 25', 'Airfresh good vibes', 'CAM 1501',
      'CAM 4102', 'CAM 4260', 'CIP 1073', 'CIP 1273', 'CIP 1500',
      'CIP 2040', 'Crème mains bactéricides', 'Décap Force Four', 'Décasol', 'DEGR MS'
    ],
    emballage: [
      'BIDON JAUNE 20L BM 900 G', 'BIDON 20L BLANC BM 900 G', 'BIDON 20L BLEU BM 900 G', 'BIDON 20L NOIR BM 900 G', 'BIDON 20L ROUGE BM 900 G',
      'BIDON 20L VERT BM 1200 KG', 'BIDON 5L BLANC', 'BIDON TRANSPARENT /20 L', 'BIDON TRANSPARENT 5L', 'BOUCHON DESK-TOP 24',
      'BOUTEILLE 0.5 L', 'BOUTEILLE 100 ML', 'BOUTEILLE 250 ML', 'BOUTEILLE 250ML BLANC LAIT', 'BOUTEILLE 5L 9RAM',
      'BOUTEILLE 750 ML', 'CARTON 275180250', 'CARTON 400270260', 'CARTON pour 4 bid 5l TL/TL 400260300', 'FLACON 1L BLANC AMP',
      'FLACON 1L CARRE-SOTUPROC', 'FLACON 1L/ BLANC', 'FLACON 200 ML-24', 'FLACON 200ML-28', 'FLACON TRANSPARENT 1L AM',
      'LOTION PUMP FP 314 38/400 WHITE', 'MINI TRIGGER 28/410', 'MIST SPRAYER FP601', 'POMPE BEC LONG G28', 'POMPE BLANC DIAM 28'
    ]
  };

  const tabs = [
    { id: 'matiere_premiere', label: 'Matières Premières', icon: FlaskConical, color: 'blue' },
    { id: 'produit_fini', label: 'Produits Finis', icon: TestTube, color: 'green' },
    { id: 'emballage', label: 'Emballage', icon: Package, color: 'purple' }
  ];

  const addProductFromList = (productName) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    let newProduct;
    
    if (activeTab === 'emballage') {
      // For emballage: simple availability check
      newProduct = {
        id: Date.now(),
        name: productName,
        available: false,
        dateChecked: currentDate,
        notes: ''
      };
    } else {
      // For matiere_premiere and produit_fini: 3 test types
      newProduct = {
        id: Date.now(),
        name: productName,
        tests: {
          density: { passed: false, date: currentDate },
          ph: { passed: false, date: currentDate },
          dosage: { passed: false, date: currentDate }
        },
        target: globalTargets[activeTab],
        notes: ''
      };
    }
    
    setProducts(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newProduct]
    }));
  };

  const removeProduct = (productId) => {
    setProducts(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(p => p.id !== productId)
    }));
  };

  const updateProduct = (productId, field, value) => {
    setProducts(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(product => 
        product.id === productId ? { ...product, [field]: value } : product
      )
    }));
  };

  const updateProductTest = (productId, testType, field, value) => {
    setProducts(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(product => 
        product.id === productId ? {
          ...product,
          tests: {
            ...product.tests,
            [testType]: {
              ...product.tests[testType],
              [field]: value,
              date: field === 'passed' ? new Date().toISOString().split('T')[0] : product.tests[testType].date
            }
          }
        } : product
      )
    }));
  };

  const updateGlobalTarget = (category, target) => {
    setGlobalTargets(prev => ({
      ...prev,
      [category]: target
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(products).forEach(category => {
      if (products[category].length === 0) {
        newErrors[`${category}_empty`] = "Ajoutez au moins un produit dans cette catégorie.";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Updated KPI calculation for new structure
  const calculateKPIValue = () => {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Calculate for each category
    Object.keys(products).forEach(category => {
      const categoryProducts = products[category];
      let categoryScore = 0;
      
      if (category === 'emballage') {
        // For emballage: simple availability check
        const availableCount = categoryProducts.filter(p => p.available).length;
        categoryScore = categoryProducts.length > 0 ? (availableCount / categoryProducts.length) * 100 : 0;
      } else {
        // For matiere_premiere and produit_fini: test-based calculation
        let totalTests = 0;
        let passedTests = 0;
        
        categoryProducts.forEach(product => {
          if (product.tests) {
            Object.values(product.tests).forEach(test => {
              totalTests++;
              if (test.passed) passedTests++;
            });
          }
        });
        
        categoryScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      }
      
      totalScore += categoryScore * categoryProducts.length;
      totalWeight += categoryProducts.length;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  // Calculate KPI per category with new logic
  const calculateCategoryKPI = (category) => {
    const categoryProducts = products[category] || [];
    if (categoryProducts.length === 0) return 0;
    
    if (category === 'emballage') {
      const availableCount = categoryProducts.filter(p => p.available).length;
      return Math.round((availableCount / categoryProducts.length) * 100);
    } else {
      let totalTests = 0;
      let passedTests = 0;
      
      categoryProducts.forEach(product => {
        if (product.tests) {
          Object.values(product.tests).forEach(test => {
            totalTests++;
            if (test.passed) passedTests++;
          });
        }
      });
      
      return totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const kpiValue = calculateKPIValue();
    
    const qualityData = {
      value: kpiValue,
      date: selectedDate,
      products: products,
      globalTargets: globalTargets,
      categoryKPIs: {
        matiere_premiere: calculateCategoryKPI('matiere_premiere'),
        produit_fini: calculateCategoryKPI('produit_fini'),
        emballage: calculateCategoryKPI('emballage')
      },
      type: 'product_quality'
    };
    
    onSave('rnd', 'product_quality_validation', qualityData, '');
  };

  // Chart data for current tab
  const getChartData = () => {
    const currentProducts = products[activeTab] || [];
    
    if (activeTab === 'emballage') {
      return currentProducts.map(product => ({
        name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
        fullName: product.name,
        available: product.available ? 100 : 0,
        target: 100
      }));
    } else {
      return currentProducts.map(product => {
        const tests = product.tests || {};
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        const totalTests = Object.keys(tests).length;
        const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        
        return {
          name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
          fullName: product.name,
          successRate: successRate,
          target: product.target || globalTargets[activeTab],
          testDetails: {
            density: tests.density?.passed || false,
            ph: tests.ph?.passed || false,
            dosage: tests.dosage?.passed || false
          }
        };
      });
    }
  };

  const getChartOptions = () => {
    const data = getChartData();
    
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#475569',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#E2E8F0' : '#1E293B'
        },
        formatter: function(params) {
          const dataIndex = params[0].dataIndex;
          const item = data[dataIndex];
          
          if (activeTab === 'emballage') {
            return `${item.fullName}<br/>
                    Disponible: ${item.available > 0 ? 'Oui' : 'Non'}`;
          } else {
            return `${item.fullName}<br/>
                    Taux de Réussite: ${item.successRate.toFixed(0)}%<br/>
                    Densité: ${item.testDetails.density ? '✓' : '✗'}<br/>
                    pH: ${item.testDetails.ph ? '✓' : '✗'}<br/>
                    Dosage: ${item.testDetails.dosage ? '✓' : '✗'}<br/>
                    Cible: ${item.target}%`;
          }
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 11,
          rotate: data.length > 5 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series: [
        {
          name: activeTab === 'emballage' ? 'Disponibilité' : 'Taux de Réussite',
          type: 'bar',
          data: data.map(item => activeTab === 'emballage' ? item.available : item.successRate),
          itemStyle: { 
            color: function(params) {
              const value = activeTab === 'emballage' ? data[params.dataIndex].available : data[params.dataIndex].successRate;
              const target = data[params.dataIndex].target;
              return value >= target ? '#10B981' : value >= target * 0.7 ? '#F59E0B' : '#EF4444';
            },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '60%'
        },
        {
          name: 'Cible',
          type: 'line',
          data: data.map(item => item.target),
          lineStyle: { color: '#F59E0B', type: 'dashed', width: 2 },
          itemStyle: { color: '#F59E0B' },
          symbol: 'none'
        }
      ]
    };
  };

  const baseInputClasses = `w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30'
  }`;

  const getAvailableProducts = () => {
    const used = products[activeTab].map(p => p.name);
    return predefinedProducts[activeTab].filter(name => !used.includes(name));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border-0 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-5 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Temps de Développement de Nouveaux Produits
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Suivi du temps de développement optimisé de l'idée à la validation laboratoire
                </p>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-8 space-y-8">
            
            {/* Date Selection */}
            <div className="max-w-md">
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date des Tests</span>
                </div>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={baseInputClasses}
              />
            </div>

            {/* Improved Tab Navigation */}
            <div className={`flex space-x-2 p-2 rounded-xl ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? `${
                            tab.color === 'blue' 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                              : tab.color === 'green' 
                              ? 'bg-green-600 text-white shadow-lg shadow-green-600/25' 
                              : 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                          }`
                        : `${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-white'}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {products[tab.id]?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Target Configuration */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Objectif pour {tabs.find(t => t.id === activeTab)?.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={globalTargets[activeTab]}
                    onChange={(e) => updateGlobalTarget(activeTab, Number(e.target.value))}
                    className={`w-20 px-2 py-1 rounded text-sm ${baseInputClasses}`}
                  />
                  <span className="text-sm text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* Available Products Selection */}
            <div className="space-y-4">
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Produits Disponibles - {tabs.find(t => t.id === activeTab)?.label}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2">
                {getAvailableProducts().map((productName) => (
                  <button
                    key={productName}
                    onClick={() => addProductFromList(productName)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all hover:shadow-md ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-blue-500 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{productName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Products List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Produits Sélectionnés ({products[activeTab]?.length || 0})
                </h4>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  KPI Catégorie: {calculateCategoryKPI(activeTab)}%
                </div>
              </div>

              <div className="space-y-4">
                {(products[activeTab] || []).map((product) => (
                  <div 
                    key={product.id}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      isDark 
                        ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Product Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {product.name}
                        </h5>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {activeTab === 'emballage' 
                            ? `Vérifié le: ${new Date(product.dateChecked).toLocaleDateString('fr-FR')}`
                            : `Tests effectués le: ${new Date().toLocaleDateString('fr-FR')}`
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Different interfaces for different categories */}
                    {activeTab === 'emballage' ? (
                      // Emballage: Simple availability check
                      <div className={`p-4 rounded-lg border ${
                        product.available 
                          ? isDark ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'
                          : isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              product.available ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {product.available ? 
                                <CheckCircle className="w-5 h-5 text-white" /> : 
                                <XCircle className="w-5 h-5 text-white" />
                              }
                            </div>
                            <div>
                              <h6 className={`text-sm font-medium ${
                                product.available 
                                  ? isDark ? 'text-green-400' : 'text-green-700'
                                  : isDark ? 'text-red-400' : 'text-red-700'
                              }`}>
                                Disponibilité Emballage
                              </h6>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {product.available ? 'Emballage disponible' : 'Emballage non disponible'}
                              </p>
                            </div>
                          </div>
                          
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              Disponible
                            </span>
                            <input
                              type="checkbox"
                              checked={product.available}
                              onChange={(e) => updateProduct(product.id, 'available', e.target.checked)}
                              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      // Matiere premiere and Produit fini: Test-based interface
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {testTypes.map((testType) => {
                            const test = product.tests?.[testType.id] || { passed: false, date: selectedDate };
                            const TestIcon = testType.icon;
                            
                            return (
                              <div 
                                key={testType.id}
                                className={`p-4 rounded-lg border ${
                                  test.passed 
                                    ? isDark ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'
                                    : isDark ? 'bg-slate-800/50 border-slate-700/30' : 'bg-slate-100 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    test.passed ? 'bg-green-600' : isDark ? 'bg-slate-600' : 'bg-slate-400'
                                  }`}>
                                    <TestIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h6 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                      {testType.name}
                                    </h6>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                      {new Date(test.date).toLocaleDateString('fr-FR')}
                                    </p>
                                  </div>
                                </div>
                                
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={test.passed}
                                    onChange={(e) => updateProductTest(product.id, testType.id, 'passed', e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                  <span className={`text-sm font-medium ${
                                    test.passed 
                                      ? isDark ? 'text-green-400' : 'text-green-700'
                                      : isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    {test.passed ? 'Réussi' : 'Non testé'}
                                  </span>
                                </label>
                              </div>
                            );
                          })}
                        </div>

                        {/* Overall Test Status */}
                        <div className={`p-3 rounded-lg border ${
                          isDark ? 'bg-slate-800/30 border-slate-700/30' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              Statut Global des Tests
                            </span>
                            <div className="flex space-x-1">
                              {testTypes.map((testType) => {
                                const test = product.tests?.[testType.id] || { passed: false };
                                return (
                                  <div 
                                    key={testType.id}
                                    className={`w-3 h-3 rounded-full ${
                                      test.passed ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                                    title={`${testType.name}: ${test.passed ? 'Réussi' : 'Non testé'}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="mt-4">
                      <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Notes
                      </label>
                      <textarea
                        value={product.notes}
                        onChange={(e) => updateProduct(product.id, 'notes', e.target.value)}
                        placeholder={activeTab === 'emballage' ? "Remarques sur la disponibilité..." : "Remarques sur les tests effectués..."}
                        rows="2"
                        className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${baseInputClasses}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {(products[activeTab] || []).length === 0 && (
                <div className={`text-center py-8 border-2 border-dashed rounded-xl ${
                  isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-500'
                }`}>
                  <TestTube2 className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className="text-sm font-medium">Aucun produit sélectionné dans cette catégorie</p>
                  <p className="text-xs mt-1">
                    {activeTab === 'emballage' 
                      ? "Sélectionnez des emballages pour vérifier leur disponibilité"
                      : "Sélectionnez des produits pour effectuer les tests (Densité, pH, Dosage)"
                    }
                  </p>
                </div>
              )}

              {/* Tab Chart */}
              {(products[activeTab] || []).length > 0 && (
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'matiere_premiere' ? 'bg-blue-600' :
                      activeTab === 'produit_fini' ? 'bg-green-600' : 'bg-purple-600'
                    }`}>
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {activeTab === 'emballage' ? 'Disponibilité' : 'Résultats Tests'} - {tabs.find(t => t.id === activeTab)?.label}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {activeTab === 'emballage' ? 'Suivi de la disponibilité' : 'Suivi des tests par produit'}
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getChartOptions()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              )}
            </div>

            {/* Global KPI Summary */}
            <div className={`p-5 rounded-xl border ${
              isDark 
                ? calculateKPIValue() >= 90 
                  ? 'bg-green-900/20 border-green-700/30' 
                  : 'bg-red-900/20 border-red-700/30'
                : calculateKPIValue() >= 90 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    calculateKPIValue() >= 90 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    <TestTube className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isDark 
                      ? calculateKPIValue() >= 90 ? 'text-green-400' : 'text-red-400'
                      : calculateKPIValue() >= 90 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Performance Qualité Globale
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl font-bold ${
                    calculateKPIValue() >= 90 
                      ? isDark ? 'text-green-400' : 'text-green-600' 
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {calculateKPIValue()}%
                  </span>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    calculateKPIValue() >= 90 
                      ? isDark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'
                      : isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    {calculateKPIValue() >= 90 ? 'Conforme' : 'Non-Conforme'}
                  </div>
                </div>
              </div>
            </div>

            {errors[`${activeTab}_empty`] && (
              <div className={`text-center py-4 border-2 border-dashed rounded-xl ${
                isDark ? 'border-red-700/50 bg-red-900/20' : 'border-red-300 bg-red-50'
              }`}>
                <p className="text-red-600 font-medium">{errors[`${activeTab}_empty`]}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-md hover:from-indigo-600 hover:to-indigo-700"
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
  );
};

export default ProductQualityValidation;