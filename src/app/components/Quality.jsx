import React, { useContext, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  ShieldCheck,
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  CheckCircle2,
  X,
  Eye,
  Calendar,
  FileText,
  Package,
  Activity,
  Award,
  Trash2,
  List,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Printer,
  Share2
} from 'lucide-react';

// Import your existing components
import QualityMonthlyReport from './quality/QualityMonthlyReport';
import RawMaterialsReceptionTracker from './quality/RawMaterialsReceptionTracker';
import ProductionWasteTracker from './quality/ProductionWasteTracker';
import InventoryQualityTracker from './quality/InventoryQualityTracker';
import { useQualityData } from '../hooks/useQualityData';
import { AppContext } from '../context/AppContext';

// KPI definitions for demo
const kpiDefinitions = {
  quality: {
    name: { fr: 'Contrôle Qualité', en: 'Quality Control' },
    kpis: [
      {
        id: 'material_batch_acceptance_rate',
        name: { fr: 'Taux des Matières Premières et Emballage Non Conforme à la Réception', en: 'Material Acceptance Rate' },
        description: { fr: 'Pourcentage de lots de matières premières acceptés', en: 'Percentage of accepted raw material batches' },
        target: 90,
        unit: '%',
        type: 'percentage'
      },
      {
        id: 'production_waste_rate',
        name: { fr: 'Taux de Déchet de Production', en: 'Waste Efficiency Rate' },
        description: { fr: 'Efficacité du contrôle des déchets de production', en: 'Production waste control efficiency' },
        target: 80,
        unit: '%',
        type: 'percentage'
      },
      {
        id: 'raw_materials_inventory_list',
        name: { fr: 'Liste des Produits Matières Première et Emballage', en: 'Inventory Quality' },
        description: { fr: 'Taux de conformité de l\'inventaire des matières', en: 'Raw materials inventory compliance rate' },
        target: 95,
        unit: '%',
        type: 'percentage'
      }
    ]
  }
};

// Enhanced Quality KPI Selector Component
const QualityKPISelector = ({ onSelect, onCancel, isDark, departmentKPIs }) => {
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
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sélectionner un Indicateur Qualité
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Choisissez l'indicateur qualité à mettre à jour
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
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium ${
                            selectedKPI === kpi.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isDark
                                ? 'bg-slate-700 text-slate-300 border-slate-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-semibold mb-2 ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-blue-300' : 'text-blue-700'
                                : isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {kpi.name?.fr || kpi.name?.en || kpi.id}
                            </h4>
                            <p className={`text-sm mb-3 leading-relaxed ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-blue-400' : 'text-blue-600'
                                : isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {kpi.description?.fr || kpi.description?.en || ''}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                Cible : {kpi.target}{kpi.unit}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {kpi.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedKPI === kpi.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-6`}>
                  <ShieldCheck className={`w-10 h-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Aucun Indicateur Configuré
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Configurez les indicateurs qualité pour commencer le suivi
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
                      <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center">
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
                  isDark ? 'border-blue-200 bg-blue-900/20' : 'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
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
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Chart Components
const EnhancedKPIChart = ({ kpi, history, isDark }) => {
  if (!history || history.length === 0) return null;

  const chartData = history.slice(-20); // Last 20 entries
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      formatter: function(params) {
        const point = params[0];
        const entry = chartData[point.dataIndex];
        let tooltip = `<strong>${new Date(entry.date).toLocaleDateString('fr-FR')}</strong><br/>`;
        tooltip += `Valeur: ${point.value}${kpi.unit}<br/>`;
        tooltip += `Cible: ${kpi.target}${kpi.unit}<br/>`;
        
        if (entry.notes) {
          tooltip += `<br/><em>"${entry.notes}"</em>`;
        }
        
        return tooltip;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(entry => new Date(entry.date).toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      })),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 11,
        formatter: '{value}' + kpi.unit
      },
      splitLine: { 
        lineStyle: { 
          color: isDark ? '#374151' : '#E5E7EB', 
          type: 'dashed' 
        } 
      }
    },
    series: [
      {
        type: 'line',
        data: chartData.map(entry => entry.value),
        smooth: true,
        lineStyle: { 
          color: '#3B82F6', 
          width: 3,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 3
        },
        itemStyle: { 
          color: '#3B82F6',
          borderColor: '#FFFFFF',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        },
        markLine: {
          data: [
            {
              name: 'Cible',
              yAxis: kpi.target,
              lineStyle: {
                color: '#EF4444',
                type: 'dashed',
                width: 2
              },
              label: {
                formatter: 'Cible: {c}' + kpi.unit,
                color: '#EF4444'
              }
            }
          ]
        }
      }
    ]
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
      isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
            {kpi.id === 'material_batch_acceptance_rate' && <Package className="w-5 h-5 text-white" />}
            {kpi.id === 'production_waste_rate' && <Trash2 className="w-5 h-5 text-white" />}
            {kpi.id === 'raw_materials_inventory_list' && <List className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kpi.name?.fr || kpi.name?.en}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {chartData.length} dernières entrées • Cible: {kpi.target}{kpi.unit}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            chartData[chartData.length - 1]?.value >= kpi.target
              ? isDark 
                ? 'bg-emerald-900/30 text-emerald-200 border-emerald-700' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isDark
                ? 'bg-red-900/30 text-red-200 border-red-700'
                : 'bg-red-50 text-red-800 border-red-300'
          }`}>
            {chartData[chartData.length - 1]?.value >= kpi.target ? 'Objectif Atteint' : 'En dessous'}
          </div>
        </div>
      </div>

      {/* Enhanced Chart */}
      <div className="h-80 mb-4">
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>

      {/* Chart Footer with Enhanced Stats */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {chartData[chartData.length - 1]?.value || 0}{kpi.unit}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Dernière valeur
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Math.round(chartData.reduce((sum, entry) => sum + entry.value, 0) / chartData.length)}{kpi.unit}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Moyenne
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Math.max(...chartData.map(entry => entry.value))}{kpi.unit}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Maximum
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            chartData.length >= 2 
              ? (chartData[chartData.length - 1]?.value > chartData[chartData.length - 2]?.value ? 'text-emerald-600' : 'text-red-600')
              : isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {chartData.length >= 2 
              ? (chartData[chartData.length - 1]?.value > chartData[chartData.length - 2]?.value ? '+' : '') +
                (chartData[chartData.length - 1]?.value - chartData[chartData.length - 2]?.value).toFixed(1)
              : '0'}{kpi.unit}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Évolution
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Overview Chart Component
const EnhancedOverviewChart = ({ departmentKPIs, getLatestKPIValue, departmentId, isDark }) => {
  const kpiData = departmentKPIs.map(kpi => {
    const latestValue = getLatestKPIValue(departmentId, kpi.id);
    return {
      name: kpi.name?.fr || kpi.name?.en || kpi.id,
      value: latestValue?.value || 0,
      target: kpi.target,
      status: latestValue?.value >= kpi.target ? 'success' : 'warning',
      icon: kpi.id === 'material_batch_acceptance_rate' ? Package :
            kpi.id === 'production_waste_rate' ? Trash2 :
            kpi.id === 'raw_materials_inventory_list' ? List : ShieldCheck
    };
  }).filter(item => item.value > 0);

  if (kpiData.length === 0) return null;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      formatter: function(params) {
        return `<strong>${params.name}</strong><br/>Valeur: ${params.value}%<br/>Cible: ${params.data.target}%`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: { 
        color: isDark ? '#94A3B8' : '#64748B',
        fontSize: 12
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '45%'],
        data: kpiData.map(item => ({
          name: item.name,
          value: item.value,
          target: item.target,
          itemStyle: {
            color: item.status === 'success' ? '#10B981' : '#F59E0B',
            borderColor: '#FFFFFF',
            borderWidth: 2
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c}%',
          color: isDark ? '#E2E8F0' : '#1E293B'
        }
      }
    ]
  };

  return (
    <div className={`p-6 rounded-2xl border ${
      isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Répartition des Performances
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Distribution des KPIs par performance
            </p>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  );
};

// Main Quality Page Component
export const QualityPage = () => {
  const { isDark } = useContext(AppContext);

  const [showKPIForm, setShowKPIForm] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);

  const {
    updateKPIValue,
    getKPIHistory,
    getLatestKPIValue,
    getKPIStatus,
    getQualityAnalytics,
    getQualityStats,
    isLoading
  } = useQualityData();

  const departmentId = 'quality';
  const department = kpiDefinitions[departmentId];
  const departmentKPIs = department?.kpis || [];

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
      setShowKPIForm(true);
    } else {
      setSelectedKPI(null);
      setShowKPIForm(true);
    }
  };

  const handleSaveKPI = async (deptId, kpiId, data, notes) => {
    try {
      await updateKPIValue(deptId, kpiId, data, notes);
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

  const stats = getQualityStats();

  const getStatsData = () => {
    return [
      {
        title: 'Indicateurs Suivis',
        value: `${stats.kpisWithData}/${stats.totalKPIs}`,
        change: stats.kpisWithData,
        changeText: 'actifs',
        icon: Target,
        color: 'blue'
      },
      {
        title: 'Performance Globale',
        value: `${stats.efficiency}%`,
        change: stats.efficiency,
        changeText: 'efficacité',
        icon: TrendingUp,
        color: 'violet'
      },
      {
        title: 'Excellent',
        value: stats.excellentKPIs.toString(),
        change: stats.excellentKPIs,
        changeText: 'indicateurs',
        icon: CheckCircle,
        color: 'emerald'
      },
      {
        title: 'Attention Requise',
        value: stats.needsAttentionKPIs.toString(),
        change: stats.needsAttentionKPIs,
        changeText: 'alertes',
        icon: AlertTriangle,
        color: 'red'
      }
    ];
  };

  const deptName = department?.name?.fr || department?.name?.en || 'Contrôle Qualité';
  const statsData = getStatsData();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* KPI Form Modal */}
        {showKPIForm && (
          <>
            {selectedKPI && selectedKPI.id === 'material_batch_acceptance_rate' ? (
              <RawMaterialsReceptionTracker
                onSave={handleSaveKPI}
                onCancel={handleCancelKPI}
                existingData={getLatestKPIValue(departmentId, selectedKPI.id)?.data}
                isDark={isDark}
              />
            ) : selectedKPI && selectedKPI.id === 'production_waste_rate' ? (
              <ProductionWasteTracker
                onSave={handleSaveKPI}
                onCancel={handleCancelKPI}
                existingData={getLatestKPIValue(departmentId, selectedKPI.id)?.data}
                isDark={isDark}
              />
            ) : selectedKPI && selectedKPI.id === 'raw_materials_inventory_list' ? (
              <InventoryQualityTracker
                onSave={handleSaveKPI}
                onCancel={handleCancelKPI}
                existingData={getLatestKPIValue(departmentId, selectedKPI.id)?.data}
                isDark={isDark}
              />
            ) : selectedKPI ? (
              <div className={`p-8 rounded-2xl shadow-xl ${
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
              }`}>
                <div className="text-center">
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    KPI non configuré
                  </h3>
                  <p className={`text-sm mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Ce KPI n'a pas encore de tracker spécialisé configuré.
                  </p>
                  <button
                    onClick={handleCancelKPI}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                <div className="w-full max-w-6xl max-h-[90vh]">
                  <QualityKPISelector
                    onSelect={(kpi) => setSelectedKPI(kpi)}
                    onCancel={handleCancelKPI}
                    isDark={isDark}
                    departmentKPIs={departmentKPIs}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Reports Modal - Monthly Report Only */}
        {showReports && (
          <QualityMonthlyReport
            analytics={getQualityAnalytics()}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </h1>
              <p className={`text-base mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Assurance qualité des matières premières et produits finis avec suivi intelligent des conformités
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Reports Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowReportsMenu(!showReportsMenu)}
                className={`flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-200 font-medium group shadow-sm ${
                  showReportsMenu
                    ? isDark 
                      ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300 shadow-indigo-500/20' 
                      : 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-indigo-500/20'
                    : isDark 
                      ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50' 
                      : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Rapports</span>
              </button>
              
              {showReportsMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowReportsMenu(false)}
                  />
                  
                  <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl z-20 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Rapports de Qualité Intelligents
                      </h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Analyses automatisées avec détection d'événements et recommandations IA
                      </p>
                    </div>
                    
                    <div className="p-3">
                      <button
                        onClick={() => { 
                          setShowReports(true); 
                          setShowReportsMenu(false);
                        }}
                        className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                          isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Rapport Mensuel Intelligent
                          </div>
                          <div className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Détection automatique d'événements, analyse hebdomadaire détaillée et recommandations IA
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
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
                  stat.color === 'blue' ? 'bg-blue-600' :
                  stat.color === 'violet' ? 'bg-violet-600' :
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
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'violet' ? 'text-violet-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
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
                {stats.kpisWithData} / {stats.totalKPIs} configurés • Suivi intelligent des normes qualité et conformité
              </p>
            </div>
          </div>

          {departmentKPIs && departmentKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {departmentKPIs.map((kpi) => {
                const latestValue = getLatestKPIValue(departmentId, kpi.id);
                
                const getKPIStatusLocal = (kpi, latestValue) => {
                  if (!latestValue) return 'no-data';
                  
                  if (getKPIStatus) {
                    return getKPIStatus(departmentId, kpi.id);
                  }
                  
                  const tolerance = kpi.target * 0.1;
                  if (latestValue.value >= kpi.target) return 'excellent';
                  if (latestValue.value >= kpi.target - tolerance) return 'good';
                  return 'needs-attention';
                };

                const status = getKPIStatusLocal(kpi, latestValue);

                const getStatusColor = (status) => {
                  switch (status) {
                    case 'excellent': return 'text-emerald-800 bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700';
                    case 'good': return 'text-blue-800 bg-blue-200 dark:bg-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700';
                    case 'needs-attention': return 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700';
                    default: return 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
                  }
                };

                const getProgress = () => {
                  if (!latestValue || !kpi.target || kpi.target === 0) return 0;
                  return Math.min(100, (latestValue.value / kpi.target) * 100);
                };

                const progress = getProgress();
                const kpiName = kpi.name?.fr || kpi.name?.en || kpi.id;
                const statusText = status === 'excellent' ? 'Excellent' :
                                 status === 'good' ? 'Bon' :
                                 status === 'needs-attention' ? 'Attention' : 'Aucune Donnée';

                const getKPIIcon = (kpiId) => {
                  if (kpiId === 'material_batch_acceptance_rate') return Package;
                  if (kpiId === 'production_waste_rate') return Trash2;
                  if (kpiId === 'raw_materials_inventory_list') return List;
                  return ShieldCheck;
                };

                const KPIIcon = getKPIIcon(kpi.id);

                return (
                  <div
                    key={kpi.id}
                    onClick={() => handleAddData(kpi)}
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isDark ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-blue-400/50 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <KPIIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {statusText}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className={`text-base font-bold mb-2 group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                              progress >= 100 ? 'text-emerald-600' :
                              progress >= 80 ? 'text-blue-600' :
                              progress >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {progress.toFixed(0)}% atteint
                            </div>
                          </div>
                        </div>

                        <div className={`w-full rounded-full h-2 shadow-inner ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                              progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              progress >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              progress >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        {latestValue.notes && (
                          <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            "{latestValue.notes}"
                          </p>
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
                          isDark ? 'bg-slate-700 group-hover:bg-blue-900/30' : 'bg-slate-100 group-hover:bg-blue-100'
                        } flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                          <Plus className={`w-6 h-6 ${
                            isDark ? 'text-slate-300 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-500'
                          } transition-all duration-300`} />
                        </div>
                        <p className={`text-sm font-semibold mb-1 ${
                          isDark ? 'text-slate-200 group-hover:text-blue-300' : 'text-slate-800 group-hover:text-blue-600'
                        } transition-colors`}>
                          Configurer ce KPI
                        </p>
                        <p className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Cliquez pour commencer le suivi
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
                <ShieldCheck className="w-12 h-12 text-indigo-600" />
              </div>
              <h4 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Prêt à Démarrer le Contrôle Qualité
              </h4>
              <p className={`text-lg mb-10 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Commencez à ajouter des données d'indicateurs pour votre contrôle qualité afin de suivre les normes et la conformité avec intelligence
              </p>
              <button
                onClick={() => handleAddData()}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Ajouter le Premier Indicateur
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Charts Section with Real Data */}
        {departmentKPIs.some(kpi => getKPIHistory(departmentId, kpi.id).length > 0) && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Analyse Détaillée des Performances
              </h3>
              <div className="flex items-center space-x-2 text-sm">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Données en temps réel avec historique complet</span>
              </div>
            </div>
            
            {/* Individual KPI Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {departmentKPIs.map(kpi => {
                const history = getKPIHistory(departmentId, kpi.id);
                return history.length > 0 ? (
                  <EnhancedKPIChart
                    key={kpi.id}
                    kpi={kpi}
                    history={history}
                    isDark={isDark}
                  />
                ) : null;
              }).filter(Boolean)}
            </div>
            
            {/* Overview Chart */}
            <EnhancedOverviewChart
              departmentKPIs={departmentKPIs}
              getLatestKPIValue={getLatestKPIValue}
              departmentId={departmentId}
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </div>
  );
};