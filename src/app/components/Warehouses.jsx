import React, { useContext, useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  FileText,
  Euro,
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useWarehouseData } from '../hooks/useWarehouseData';
import { KPIForm } from '../components/KPIForm';
import { AppContext } from '../context/AppContext';

// Import the warehouse components
import WarehouseChartsSection from './warehouse/WarehouseChartsSection';
import WarehouseMonthlyReport from './warehouse/WarehouseMonthlyReport';
import CostTracker from './warehouse/CostTracker';
import StockIssuesTracker from './warehouse/StockIssuesTracker';

// French display names for KPI statuses
const kpiStatusDisplayFr = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Passable',
  'needs-attention': 'Attention Requise',
  'no-data': 'Aucune Donnée'
};

// Enhanced Warehouse KPI Selector Component
const WarehouseKPISelector = ({ onSelect, onCancel, isDark, departmentKPIs }) => {
  const [selectedKPI, setSelectedKPI] = useState('');

  const handleSubmit = () => {
    if (selectedKPI) {
      const kpi = departmentKPIs.find(k => k.id === selectedKPI);
      if (kpi) {
        onSelect(kpi);
      }
    }
  };

  const selectedKPIData = departmentKPIs.find(k => k.id === selectedKPI);

  return (
    <div className={`rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
    }`}>

      {/* Header */}
      <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sélectionner un Indicateur d'Entrepôt
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Choisissez l'indicateur d'entrepôt à mettre à jour
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`p-2.5 rounded-lg hover:bg-opacity-10 transition-colors ${
              isDark ? 'hover:bg-white text-slate-400' : 'hover:bg-black text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left Panel - KPI List */}
        <div className={`flex-1 p-8 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="space-y-6">

            {departmentKPIs.length > 0 ? (
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Indicateurs Disponibles ({departmentKPIs.length})
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {departmentKPIs.map((kpi, index) => (
                    <button
                      key={kpi.id}
                      onClick={() => setSelectedKPI(kpi.id)}
                      className={`w-full p-6 rounded-xl border text-left transition-all duration-200 ${
                        selectedKPI === kpi.id
                          ? isDark
                            ? 'border-violet-500 bg-violet-900/20'
                            : 'border-violet-500 bg-violet-50'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium ${
                            selectedKPI === kpi.id
                              ? 'bg-violet-600 text-white border-violet-600'
                              : isDark
                                ? 'bg-slate-700 text-slate-300 border-slate-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-semibold mb-2 ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-violet-300' : 'text-violet-700'
                                : isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {kpi.name?.fr || kpi.name?.en || kpi.id}
                            </h4>
                            <p className={`text-sm mb-3 leading-relaxed ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-violet-400' : 'text-violet-600'
                                : isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {kpi.description?.fr || kpi.description?.en || ''}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-100 text-violet-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                Cible : {kpi.target}{kpi.unit}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-100 text-violet-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {kpi.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedKPI === kpi.id && (
                          <CheckCircle2 className="w-6 h-6 text-violet-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-6`}>
                  <Package className={`w-10 h-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Aucun Indicateur Configuré
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Configurez les indicateurs d'entrepôt pour commencer le suivi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Selected KPI Details */}
        <div className="flex-1 p-8">
          <div className="h-full">
            {selectedKPIData ? (
              <div className="space-y-8">
                <div>
                  <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Indicateur Sélectionné
                  </h4>
                  <div className={`p-6 rounded-xl border ${
                    isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-violet-600 flex items-center justify-center">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {selectedKPIData.name?.fr || selectedKPIData.name?.en || selectedKPIData.id}
                        </h5>
                        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedKPIData.description?.fr || selectedKPIData.description?.en || ''}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                          }`}>
                            🎯 Cible : {selectedKPIData.target}{selectedKPIData.unit}
                          </span>
                          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                          }`}>
                            📊 Type : {selectedKPIData.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border ${
                  isDark ? 'border-slate-600 bg-violet-900/20' : 'border-violet-200 bg-violet-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Prêt à mettre à jour
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cliquez sur continuer pour saisir de nouvelles données pour cet indicateur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-6`}>
                    <Target className={`w-12 h-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Sélectionner un Indicateur
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Choisissez un indicateur dans la liste pour voir les détails et continuer
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-8 py-6 border-t ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Annuler
          </button>

          {selectedKPI && (
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Warehouse Page Component
export const WarehousesPage = () => {
  const { isDark } = useContext(AppContext);

  const [showKPIForm, setShowKPIForm] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showMonthlyReportModal, setShowMonthlyReportModal] = useState(false);
  const [warehouseAnalytics, setWarehouseAnalytics] = useState(null);

  // Use the new Supabase-based hook
  const {
    kpiData,
    updateKPIValue,
    getKPIHistory,
    getDepartmentSummary,
    getKPITrend,
    getLatestKPIValue,
    getAnalyticsData,
    isLoading,
    error,
    refreshData
  } = useWarehouseData();

  const departmentId = 'warehouses';
  const department = kpiDefinitions[departmentId];
  const departmentKPIs = department?.kpis || [];

  const departmentSummary = useMemo(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData]);

  // Load analytics data when modal is opened
  const handleOpenMonthlyReport = async () => {
    try {
      setShowMonthlyReportModal(true);
      const analyticsData = await getAnalyticsData(12);
      setWarehouseAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading warehouse analytics:', error);
      setWarehouseAnalytics({
        cost_per_formulation: [],
        stock_issues_rate: []
      });
    }
  };

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
      setShowKPIForm(true);
    } else {
      setSelectedKPI(null); 
      setShowKPIForm(true);
    }
  };

  const handleSaveKPI = async (deptId, kpiId, value, notes, additionalData) => {
    try {
      await updateKPIValue(deptId, kpiId, value, notes, additionalData);
      setShowKPIForm(false);
      setSelectedKPI(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du KPI :', error);
      alert('Échec de la sauvegarde des données KPI. Veuillez réessayer.');
    }
  };

  const handleCancelKPI = () => {
    setShowKPIForm(false);
    setSelectedKPI(null);
  };

  const getStats = () => {
    const kpisWithData = departmentKPIs.filter(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      return latestValue !== null;
    });

    const excellentKpis = departmentKPIs.filter(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      if (!latestValue) return false;
      if (kpi.id === 'cost_per_formulation') return latestValue.value === 100;
      return latestValue.value >= kpi.target;
    });

    const needsAttentionKpis = departmentKPIs.filter(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      if (!latestValue) return false;
      if (kpi.id === 'cost_per_formulation') return latestValue.value === 0;
      const tolerance = kpi.target * 0.2;
      return latestValue.value < (kpi.target - tolerance);
    });

    let efficiency = 0;
    if (kpisWithData.length > 0) {
      const costKPI = kpisWithData.find(kpi => kpi.id === 'cost_per_formulation');
      if (costKPI) {
        const latestValue = getLatestKPIValue(departmentId, costKPI.id);
        efficiency = latestValue?.value || 0;
      }
    }

    return [
      {
        title: 'Indicateurs Suivis',
        value: `${kpisWithData.length}/${departmentKPIs.length}`,
        change: kpisWithData.length,
        changeText: 'actifs',
        icon: Target,
        color: 'violet'
      },
      {
        title: 'Performance Budget',
        value: `${efficiency}%`,
        change: efficiency,
        changeText: 'contrôle',
        icon: TrendingUp,
        color: 'blue'
      },
      {
        title: 'Budget Maîtrisé',
        value: excellentKpis.length.toString(),
        change: excellentKpis.length,
        changeText: 'indicateurs',
        icon: CheckCircle,
        color: 'emerald'
      },
      {
        title: 'Dépassements',
        value: needsAttentionKpis.length.toString(),
        change: needsAttentionKpis.length,
        changeText: 'alertes',
        icon: AlertTriangle,
        color: 'red'
      }
    ];
  };

  const generateChartDataForWarehouseCharts = () => {
    const trendData = [];
    const categoryData = [];

    if (!departmentKPIs.length) return { trendData, categoryData };

    departmentKPIs.forEach(kpi => {
      const history = getKPIHistory(departmentId, kpi.id);
      if (history.length > 0) {
        const trendEntries = getKPITrend(departmentId, kpi.id, 10);
        trendData.push(...trendEntries.map(entry => ({
          ...entry,
          kpi: kpi.name?.fr || kpi.name?.en || kpi.id,
          target: kpi.target
        })));

        const latest = history[0];
        categoryData.push({
          name: kpi.name?.fr || kpi.name?.en || kpi.id,
          value: latest.value,
          target: kpi.target,
          progress: kpi.id === 'cost_per_formulation' ? latest.value : Math.min(100, (latest.value / (kpi.target || 1)) * 100)
        });
      }
    });
    return { trendData, categoryData };
  };
  
  const { trendData, categoryData } = useMemo(generateChartDataForWarehouseCharts, [
    departmentKPIs, getKPIHistory, getKPITrend, departmentId, kpiData
  ]);

  const stats = getStats();
  const deptName = department?.name?.fr || department?.name?.en || 'Entrepôts & Logistique';

  useEffect(() => {
    console.log('Page Entrepôts montée avec Supabase');
    console.log('État kpiData actuel :', kpiData);
    console.log('Résumé du département :', departmentSummary);
  }, [kpiData, departmentSummary]);

  const getKPIIcon = (kpiId) => {
    if (kpiId === 'cost_per_formulation') {
      return Euro;
    } else if (kpiId === 'stock_issues_rate') {
      return AlertTriangle;
    } else {
      return Package; 
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Chargement des données d'entrepôt...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Erreur de chargement
          </h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {error}
          </p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* KPI Form Modal Logic */}
        {showKPIForm && (
          <>
            {selectedKPI && selectedKPI.id === 'cost_per_formulation' ? (
              <CostTracker
                onSave={(deptId, kpiId, value, notes) => handleSaveKPI(deptId, kpiId, value, notes, value)}
                onCancel={handleCancelKPI}
                existingData={getLatestKPIValue(departmentId, selectedKPI.id)?.data}
                isDark={isDark}
              />
            ) : selectedKPI && selectedKPI.id === 'stock_issues_rate' ? (
              <StockIssuesTracker
                onSave={(deptId, kpiId, value, notes) => handleSaveKPI(deptId, kpiId, value, notes, value)}
                onCancel={handleCancelKPI}
                existingData={getLatestKPIValue(departmentId, selectedKPI.id)?.data}
                isDark={isDark}
              />
            ) : selectedKPI ? (
              <KPIForm
                kpi={selectedKPI}
                departmentId={departmentId}
                onSave={handleSaveKPI}
                onCancel={handleCancelKPI}
              />
            ) : (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                <div className="w-full max-w-6xl max-h-[90vh]">
                  <WarehouseKPISelector
                    onSelect={(kpi) => {
                        setSelectedKPI(kpi); 
                    }}
                    onCancel={handleCancelKPI}
                    isDark={isDark}
                    departmentKPIs={departmentKPIs}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {showMonthlyReportModal && warehouseAnalytics && (
          <WarehouseMonthlyReport 
            analytics={warehouseAnalytics}
            isDark={isDark}
            onClose={() => {
              setShowMonthlyReportModal(false);
              setWarehouseAnalytics(null);
            }}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </h1>
              <p className={`text-base mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Gestion budgétaire intelligente des matières premières et emballages avec suivi des coûts
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenMonthlyReport}
              className={`flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-200 font-medium group shadow-sm ${
                isDark 
                    ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50' 
                    : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Rapport Mensuel</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all ${
                  stat.color === 'violet' ? 'bg-violet-600' :
                  stat.color === 'blue' ? 'bg-blue-600' :
                  stat.color === 'emerald' ? 'bg-emerald-600' :
                  stat.color === 'red' ? 'bg-red-600' :
                  'bg-slate-600'
                }`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mb-3 ${
                  stat.color === 'violet' ? 'text-violet-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    stat.color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {stat.changeText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KPI Cards Section */}
        <div className={`rounded-2xl border p-8 shadow-sm ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Indicateurs Clés de Performance
              </h3>
              <p className={`text-base mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {departmentKPIs.filter(kpi => getLatestKPIValue(departmentId, kpi.id)).length || 0} / {departmentKPIs.length || 0} configurés • Gestion budgétaire des coûts matières et emballages
              </p>
            </div>
          </div>

          {departmentKPIs && departmentKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {departmentKPIs.map((kpi) => {
                const latestValue = getLatestKPIValue(departmentId, kpi.id);
                
                const getKPIStatus = (kpiDef, val) => {
                  if (!val) return 'no-data';
                  if (kpiDef.id === 'cost_per_formulation') {
                    return val.value === 100 ? 'excellent' : (val.value > 0 ? 'fair' : 'needs-attention');
                  }
                  const tolerance = kpiDef.target * 0.1;
                  if (val.value >= kpiDef.target) return 'excellent';
                  if (val.value >= kpiDef.target - tolerance) return 'good';
                  return 'needs-attention';
                };

                const status = getKPIStatus(kpi, latestValue);

                const getStatusColor = (s) => {
                  switch (s) {
                    case 'excellent': return 'text-emerald-800 bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700';
                    case 'good': return 'text-violet-800 bg-violet-200 dark:bg-violet-800 dark:text-violet-100 border border-violet-300 dark:border-violet-700';
                    case 'fair': return 'text-amber-800 bg-amber-200 dark:bg-amber-800 dark:text-amber-100 border border-amber-300 dark:border-amber-700';
                    case 'needs-attention': return 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700';
                    default: return 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
                  }
                };

                const getProgress = () => {
                  if (!latestValue) return 0;
                  if (kpi.id === 'cost_per_formulation') return latestValue.value;
                  return Math.min(100, (latestValue.value / (kpi.target || 1)) * 100);
                };

                const progress = getProgress();
                const kpiName = kpi.name?.fr || kpi.name?.en || kpi.id;
                const statusText = kpiStatusDisplayFr[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Indéfini');
                const KPIIcon = getKPIIcon(kpi.id);

                return (
                  <div
                    key={kpi.id}
                    onClick={() => handleAddData(kpi)}
                    className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isDark ? 'bg-slate-800/80 border-slate-700 hover:border-violet-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-violet-400/50 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <KPIIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {statusText}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className={`text-base font-bold mb-2 group-hover:text-violet-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {kpiName}
                      </h4>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cible : {kpi.target}{kpi.unit}
                      </p>
                    </div>

                    {latestValue ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {latestValue.value}{kpi.unit}
                          </span>
                          <div className="text-right">
                            <div className={`text-xs font-semibold ${
                              progress === 100 ? 'text-emerald-600' :
                              (kpi.id === 'cost_per_formulation' && progress === 0) ? 'text-red-600' :
                              progress < 100 && progress > 0 ? 'text-amber-600' :
                              progress === 0 && kpi.id !== 'cost_per_formulation' ? 'text-red-600' :
                              'text-amber-600'
                            }`}>
                              {progress === 100 ? '✅ Budget OK' :
                               (kpi.id === 'cost_per_formulation' && progress === 0) ? '❌ Dépassement' : 
                               `${progress.toFixed(0)}%`}
                            </div>
                            {latestValue.data?.totalCost && (
                              <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Total: {latestValue.data.totalCost.toLocaleString()}€
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`w-full rounded-full h-2 shadow-inner ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                              progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              (kpi.id === 'cost_per_formulation' && progress === 0) ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              'bg-gradient-to-r from-amber-500 to-amber-600'
                            }`}
                            style={{ width: (kpi.id === 'cost_per_formulation' && progress === 0) ? '100%' : `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        {latestValue.data?.stats && (
                          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {latestValue.data.stats.budgetedItems}/{latestValue.data.stats.totalItems} articles budgétés
                          </div>
                        )}

                        <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {new Date(latestValue.date).toLocaleDateString('fr-FR', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className={`w-12 h-12 rounded-xl ${
                          isDark ? 'bg-slate-700 group-hover:bg-violet-900/30' : 'bg-slate-100 group-hover:bg-violet-100'
                        } flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                          <Plus className={`w-6 h-6 ${
                            isDark ? 'text-slate-300 group-hover:text-violet-400' : 'text-slate-700 group-hover:text-violet-500'
                          } transition-all duration-300`} />
                        </div>
                        <p className={`text-sm font-semibold mb-1 ${
                          isDark ? 'text-slate-200 group-hover:text-violet-300' : 'text-slate-800 group-hover:text-violet-600'
                        } transition-colors`}>
                          Configurer le Budget
                        </p>
                        <p className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Cliquez pour définir les coûts
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                <Package className="w-12 h-12 text-violet-600" />
              </div>
              <h4 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Prêt à Démarrer la Gestion Budgétaire
              </h4>
              <p className={`text-lg mb-10 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Commencez à gérer les coûts de vos matières premières et emballages avec un suivi budgétaire intelligent
              </p>
              <button
                onClick={() => handleAddData()}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Configurer le Budget
              </button>
            </div>
          )}
        </div>

        {/* WarehouseChartsSection */}
        {departmentKPIs.some(kpi => getKPIHistory(departmentId, kpi.id).length > 0) && (
           <WarehouseChartsSection
              departmentKPIs={departmentKPIs}
              getKPIHistory={getKPIHistory}
              getKPITrend={getKPITrend}
              getLatestKPIValue={getLatestKPIValue}
              departmentId={departmentId}
              isDark={isDark}
              trendData={trendData}
              categoryData={categoryData}
            />
        )}

      </div>
    </div>
  );
};