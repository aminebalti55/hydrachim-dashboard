import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  Calculator,
  Info,
  Save,
  TestTube,
  Zap,
  Activity,
  Eye,
  Calendar,
  FileText,
  Package,
  Beaker,
  Droplets,
  Gauge,
  Trophy,
  TrendingDown,
  Users,
  Timer,
  PlayCircle,
  LineChart,
  PieChart,
  BarChart
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useRnDData } from '../hooks/useRnDData';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';
import ProductDevelopmentTracker from '../components/RnD/ProductQualityValidation';
import ReactECharts from 'echarts-for-react';
import RnDMonthlyReport from '../components/RnD/RnDMonthlyReport';

// French display names for KPI statuses
const kpiStatusDisplayFr = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Passable',
  'needs-attention': 'Attention Requise',
  'no-data': 'Aucune Donnée'
};

// Main R&D Page Component
export const RnDPage = () => {
  const { isDark } = useContext(AppContext);

  const [activeForm, setActiveForm] = useState(null);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [departmentSummary, setDepartmentSummary] = useState(null);
  const [latestKPIValues, setLatestKPIValues] = useState({});
  const [kpiStatuses, setKpiStatuses] = useState({});
  const [kpiHistories, setKpiHistories] = useState({});

  const {
    updateKPIValue,
    getLatestKPIValue,
    getKPIValueForMonth,
    getKPIHistory,
    getKPIStatus,
    getDepartmentSummary,
    getKPITrend,
    getRnDAnalytics,
    hasDataForMonth,
    loadMonthData,
    isLoading
  } = useRnDData();

  const departmentId = 'rnd';
  const department = kpiDefinitions[departmentId];
  
  // Keep reference stable
  const interactiveKPIs = useMemo(() => ([
    {
      id: 'product_development_time',
      name: { fr: 'Temps de Développement de Nouveaux Produits' },
      description: { fr: 'Suivi intelligent avec détection des retards d\'échéance et calcul de performance globale' },
      unit: '%',
      target: 80,
      icon: Clock,
      color: 'bg-blue-600'
    }
  ]), []);

  // Expose service to window for component access
  useEffect(() => {
    // Make the service methods available to the ProductDevelopmentTracker
    window.RnDService = {
      getKPIValueForMonth,
      hasDataForMonth,
      loadMonthData
    };
    
    return () => {
      // Cleanup
      delete window.RnDService;
    };
  }, [getKPIValueForMonth, hasDataForMonth, loadMonthData]);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      // Load department summary
      const summary = await getDepartmentSummary(departmentId);
      setDepartmentSummary(summary);

      // Load latest KPI values and statuses
      const kpiPromises = interactiveKPIs.map(async (kpi) => {
        const [latestValue, status, history] = await Promise.all([
          getLatestKPIValue(departmentId, kpi.id),
          getKPIStatus(departmentId, kpi.id),
          getKPIHistory(departmentId, kpi.id)
        ]);

        return {
          id: kpi.id,
          latestValue,
          status,
          history
        };
      });

      const kpiResults = await Promise.all(kpiPromises);
      
      const newLatestValues = {};
      const newStatuses = {};
      const newHistories = {};
      
      kpiResults.forEach(({ id, latestValue, status, history }) => {
        newLatestValues[id] = latestValue;
        newStatuses[id] = status;
        newHistories[id] = history;
      });

      setLatestKPIValues(newLatestValues);
      setKpiStatuses(newStatuses);
      setKpiHistories(newHistories);

    } catch (error) {
      console.error('Error loading R&D data:', error);
    }
  }, [getDepartmentSummary, getLatestKPIValue, getKPIStatus, getKPIHistory, departmentId, interactiveKPIs]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper functions that use the loaded data
  const getLatestKPIValueSync = useCallback((departmentId, kpiId) => {
    return latestKPIValues[kpiId] || null;
  }, [latestKPIValues]);

  const getKPIHistorySync = useCallback((departmentId, kpiId) => {
    return kpiHistories[kpiId] || [];
  }, [kpiHistories]);

  const getKPIStatusSync = useCallback((departmentId, kpiId) => {
    return kpiStatuses[kpiId] || 'no-data';
  }, [kpiStatuses]);

  const getKPITrendSync = useCallback(async (departmentId, kpiId, limit = 10) => {
    try {
      return await getKPITrend(departmentId, kpiId, limit);
    } catch (error) {
      console.error('Error getting KPI trend:', error);
      return [];
    }
  }, [getKPITrend]);

  const getRnDAnalyticsData = useCallback(async () => {
    try {
      return await getRnDAnalytics();
    } catch (error) {
      console.error('Error getting R&D analytics:', error);
      return { product_development_time: [] };
    }
  }, [getRnDAnalytics]);

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
      if (specificKPI.id === 'product_development_time') {
        setActiveForm('product_development_tracker');
      }
    }
  };

  // Enhanced save function with proper database integration
  const handleSaveKPI = async (departmentId, kpiId, dataObject, notes) => {
    try {
      await updateKPIValue(departmentId, kpiId, dataObject, notes);
      
      // Reload data after successful save
      await loadData();
      
      // Show success message
      setTimeout(() => {
        console.log('✅ KPI sauvegardé avec succès :', { departmentId, kpiId, value: dataObject.value });
      }, 100);
      
      setActiveForm(null);
      setSelectedKPI(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du KPI :', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const handleCancelKPI = () => {
    setActiveForm(null);
    setSelectedKPI(null);
  };

  const getStats = () => {
    // Get the actual saved data using the correct KPI IDs
    const productDevKPI = getLatestKPIValueSync(departmentId, 'product_development_time');

    const kpisWithData = productDevKPI ? 1 : 0;

    // Extract detailed stats from the saved data
    const productDevStats = productDevKPI?.data?.stats;
    
    // Calculate total projects from product development data
    const totalProjects = productDevStats?.total || 0;
    const completedProjects = productDevStats?.terminesATemps || 0;

    return [
      {
        title: 'KPIs Interactifs',
        value: `${kpisWithData}/1`,
        change: kpisWithData === 1 ? '+100%' : `${Math.round((kpisWithData / 1) * 100)}%`,
        changeText: 'configurés',
        icon: Target,
        color: 'blue',
        status: kpisWithData === 1 ? 'excellent' : 'needs-attention'
      },
      {
        title: 'Performance Globale',
        value: `${productDevKPI?.value || 0}%`,
        change: productDevKPI?.value >= 80 ? '+Excellent' : productDevKPI?.value >= 60 ? '~Moyen' : '-Faible',
        changeText: 'développement',
        icon: Zap,
        color: 'violet',
        status: (productDevKPI?.value || 0) >= 80 ? 'excellent' : (productDevKPI?.value || 0) >= 60 ? 'good' : 'needs-attention'
      },
      {
        title: 'Projets Actifs',
        value: `${totalProjects}`,
        change: completedProjects > 0 ? `${completedProjects} terminés` : 'En cours',
        changeText: 'projets suivis',
        icon: PlayCircle,
        color: 'indigo',
        status: totalProjects > 0 ? 'good' : 'needs-attention'
      }
    ];
  };

  const generateChartData = () => {
    const trendData = [];
    const categoryData = [];

    if (!interactiveKPIs.length) return { trendData, categoryData };

    interactiveKPIs.forEach(kpi => {
      const history = getKPIHistorySync(departmentId, kpi.id);
      if (history.length > 0) {
        const latest = history[0];
        categoryData.push({
          name: kpi.name?.fr || kpi.name?.en,
          value: latest.value,
          target: kpi.target,
          progress: (latest.value / kpi.target) * 100
        });
      }
    });

    return { trendData, categoryData };
  };

  const { trendData, categoryData } = useMemo(() => generateChartData(), [
    interactiveKPIs,
    getKPIHistorySync,
    departmentId,
    latestKPIValues
  ]);

  const stats = getStats();
  const deptName = 'Laboratoire R&D';

  const renderSpecializedKPICard = (kpi) => {
    const latestValue = getLatestKPIValueSync(departmentId, kpi.id);
    const status = getKPIStatusSync(departmentId, kpi.id);

    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-emerald-800 bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700';
        case 'good': return 'text-blue-800 bg-blue-200 dark:bg-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700';
        case 'fair': return 'text-amber-800 bg-amber-200 dark:bg-amber-800 dark:text-amber-100 border border-amber-300 dark:border-amber-700';
        case 'needs-attention': return 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700';
        default: return 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
      }
    };

    const KPIIcon = kpi.icon;

    const getProgress = () => {
      if (!latestValue || !kpi.target) return 0;
      return Math.min(100, (latestValue.value / kpi.target) * 100);
    };

    const progress = getProgress();
    const statusText = kpiStatusDisplayFr[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Indéfini');

    const getDetailedMetrics = () => {
      if (!latestValue?.data) return null;

      if (kpi.id === 'product_development_time' && latestValue.data.stats) {
        const stats = latestValue.data.stats;
        return (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.terminesATemps || 0} terminés
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Timer className="w-3 h-3 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.enCours || 0} en cours
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.enRetard || 0} retard
              </span>
            </div>
          </div>
        );
      }

      return null;
    };

    return (
      <div
        key={kpi.id}
        onClick={() => handleAddData(kpi)}
        className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
          isDark ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-blue-400/50 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ${kpi.color}`}>
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
            {kpi.name.fr}
          </h4>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {kpi.description.fr}
          </p>
        </div>

        {latestValue ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {latestValue.value}{kpi.unit}
              </span>
              <div className="text-right">
                <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Objectif: {kpi.target}%
                </div>
                <div className={`text-xs font-semibold whitespace-nowrap ${
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

            <div className="flex items-center justify-between">
              <div className="flex-1">
                {getDetailedMetrics()}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {new Date(latestValue.date).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
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
              <kpi.icon className="w-5 h-5 text-white" />
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
  const EnhancedOverviewChart = ({ interactiveKPIs, getLatestKPIValueSync, departmentId, isDark }) => {
    const kpiData = interactiveKPIs.map(kpi => {
      const latestValue = getLatestKPIValueSync(departmentId, kpi.id);
      return {
        name: kpi.name?.fr || kpi.name?.en || kpi.id,
        value: latestValue?.value || 0,
        target: kpi.target,
        status: latestValue?.value >= kpi.target ? 'success' : 'warning',
        icon: kpi.icon
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Modals */}
        {activeForm === 'product_development_tracker' && (
          <ProductDevelopmentTracker
            onSave={handleSaveKPI}
            onCancel={handleCancelKPI}
            existingData={selectedKPI?.latestValue?.data}
            isDark={isDark}
            rndService={{ getKPIValueForMonth, hasDataForMonth, loadMonthData }}
          />
        )}

        {showReports && (
          <RnDMonthlyReport 
            analytics={getRnDAnalyticsData}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </h1>
              <p className={`text-base mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Suivi intelligent du développement produits avec gestion des échéances et base de données intégrée
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
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showReportsMenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Backdrop for click outside */}
              {showReportsMenu && (
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowReportsMenu(false)}
                />
              )}
              
              {/* Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl z-20 transition-all duration-200 transform ${
                showReportsMenu 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible translate-y-2'
              } ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                
                {/* Menu Header */}
                <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Rapports de R&D
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Analyses et synthèses des performances laboratoire
                  </p>
                </div>
                
                {/* Menu Items */}
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
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Rapport Mensuel
                      </div>
                      <div className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Vue d'ensemble et tendances du mois
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  stat.color === 'blue' ? 'bg-blue-600' :
                  stat.color === 'violet' ? 'bg-violet-600' :
                  stat.color === 'indigo' ? 'bg-indigo-600' :
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
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    stat.status === 'excellent' ? 'text-emerald-600 dark:text-emerald-400' :
                    stat.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                    'text-amber-600 dark:text-amber-400'
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

        {/* Interactive KPIs Section */}
        <div className={`rounded-2xl border p-8 shadow-sm ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                KPIs Interactifs R&D
              </h3>
              <p className={`text-base mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Suivi en temps réel du développement avec gestion intelligente des échéances et base de données
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {interactiveKPIs.map(renderSpecializedKPICard)}
          </div>
        </div>

        {/* Charts Section */}
        {interactiveKPIs.some(kpi => getKPIHistorySync(departmentId, kpi.id).length > 0) && (
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
              {interactiveKPIs.map(kpi => {
                const history = getKPIHistorySync(departmentId, kpi.id);
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
              interactiveKPIs={interactiveKPIs}
              getLatestKPIValueSync={getLatestKPIValueSync}
              departmentId={departmentId}
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </div>
  );
};