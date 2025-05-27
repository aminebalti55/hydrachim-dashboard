import React, { useState, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Save,
  X,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Award,
  Settings,
  RefreshCw,
  TestTube,
  Package,
  Beaker,
  Droplets,
  Gauge
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

const LiveKPIDashboard = ({ onSave, onCancel, existingData = null, isDark = false, formulationData = null }) => {
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [globalTarget, setGlobalTarget] = useState(existingData?.globalTarget || 80);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 75);
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 85);
  const [autoRefresh, setAutoRefresh] = useState(existingData?.autoRefresh ?? true);

  // Get formulation data from props or existing data
  const formulas = formulationData?.formulas || existingData?.formulas || [];

  // Calculate real-time KPI metrics
  const kpiMetrics = useMemo(() => {
    if (formulas.length === 0) {
      return {
        globalSuccessRate: 0,
        totalFormulas: 0,
        activeFormulas: 0,
        totalEssais: 0,
        successfulEssais: 0,
        formulasAboveTarget: 0,
        averageEssaisPerFormula: 0,
        trendsData: [],
        formulaStats: [],
        qualityMetrics: {
          totalProducts: 0,
          totalTests: 0,
          passedTests: 0,
          emballageAvailable: 0,
          testsByType: { density: 0, ph: 0, dosage: 0 }
        }
      };
    }

    const totalFormulas = formulas.length;
    let totalEssais = 0;
    let successfulEssais = 0;
    let formulasAboveTarget = 0;

    const formulaStats = formulas.map(formula => {
      const essaisCount = formula.essais?.length || 0;
      const successCount = formula.essais?.filter(e => e.result === 'passed').length || 0;
      const successRate = essaisCount > 0 ? Math.round((successCount / essaisCount) * 100) : 0;

      totalEssais += essaisCount;
      successfulEssais += successCount;
      
      if (successRate >= globalTarget) {
        formulasAboveTarget++;
      }

      return {
        name: formula.name,
        successRate,
        essaisCount,
        successCount,
        maxEssais: formula.maxEssais || 5,
        kpi: formula.kpi || 0,
        status: successRate >= globalTarget ? 'success' : successRate >= 50 ? 'warning' : 'danger',
        createdAt: formula.createdAt,
        ingredients: formula.ingredients || []
      };
    });

    const globalSuccessRate = totalEssais > 0 ? Math.round((successfulEssais / totalEssais) * 100) : 0;
    const activeFormulas = formulas.filter(f => (f.essais?.length || 0) > 0).length;
    const averageEssaisPerFormula = totalFormulas > 0 ? Math.round(totalEssais / totalFormulas) : 0;

    // Generate trend data based on actual formula performance over time
    const trendsData = [];
    for (let i = 13; i >= 0; i--) { // 2 weeks of data
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Calculate performance based on formulas created up to that date
      const formulasAtDate = formulas.filter(f => new Date(f.createdAt) <= date);
      let daySuccessRate = 0;
      
      if (formulasAtDate.length > 0) {
        const totalSuccess = formulasAtDate.reduce((sum, formula) => {
          const essaisAtDate = (formula.essais || []).filter(e => new Date(e.date) <= date);
          if (essaisAtDate.length === 0) return sum;
          const passed = essaisAtDate.filter(e => e.result === 'passed').length;
          return sum + Math.round((passed / essaisAtDate.length) * 100);
        }, 0);
        daySuccessRate = Math.round(totalSuccess / formulasAtDate.length);
      }
      
      trendsData.push({
        date: date.toLocaleDateString('fr-FR'),
        successRate: daySuccessRate,
        target: weeklyTarget
      });
    }

    // Calculate quality metrics if available from formulation data
    let qualityMetrics = {
      totalProducts: 0,
      totalTests: 0,
      passedTests: 0,
      emballageAvailable: 0,
      testsByType: { density: 0, ph: 0, dosage: 0 }
    };

    if (formulationData?.products) {
      // Count products and tests from quality validation data
      Object.entries(formulationData.products).forEach(([category, products]) => {
        if (category === 'emballage') {
          qualityMetrics.totalProducts += products.length;
          qualityMetrics.emballageAvailable += products.filter(p => p.available).length;
        } else {
          qualityMetrics.totalProducts += products.length;
          products.forEach(product => {
            if (product.tests) {
              Object.entries(product.tests).forEach(([testType, test]) => {
                qualityMetrics.totalTests++;
                if (test.passed) {
                  qualityMetrics.passedTests++;
                  if (qualityMetrics.testsByType[testType] !== undefined) {
                    qualityMetrics.testsByType[testType]++;
                  }
                }
              });
            }
          });
        }
      });
    }

    return {
      globalSuccessRate,
      totalFormulas,
      activeFormulas,
      totalEssais,
      successfulEssais,
      formulasAboveTarget,
      averageEssaisPerFormula,
      trendsData,
      formulaStats,
      qualityMetrics
    };
  }, [formulas, globalTarget, weeklyTarget, formulationData]);

  // Get status based on performance
  const getOverallStatus = () => {
    const rate = kpiMetrics.globalSuccessRate;
    if (rate >= globalTarget) return { status: 'excellent', color: 'green', text: 'Excellent' };
    if (rate >= 60) return { status: 'good', color: 'blue', text: 'Bon' };
    return { status: 'needs-attention', color: 'red', text: 'Amélioration Nécessaire' };
  };

  const overallStatus = getOverallStatus();

  // Chart options for trends
  const getTrendChartOptions = () => ({
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
      }
    },
    legend: {
      bottom: '5%',
      textStyle: {
        color: isDark ? '#CBD5E1' : '#64748B'
      }
    },
    xAxis: {
      type: 'category',
      data: kpiMetrics.trendsData.map(item => item.date),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
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
        name: 'Taux de Réussite',
        type: 'line',
        data: kpiMetrics.trendsData.map(item => item.successRate),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10B98140' },
              { offset: 1, color: '#10B98110' }
            ]
          }
        },
        lineStyle: { color: '#10B981', width: 3 },
        itemStyle: { color: '#10B981' }
      },
      {
        name: 'Objectif',
        type: 'line',
        data: kpiMetrics.trendsData.map(item => item.target),
        lineStyle: { color: '#F59E0B', type: 'dashed', width: 2 },
        itemStyle: { color: '#F59E0B' },
        symbol: 'none'
      }
    ]
  });

  // Chart options for formula comparison
  const getFormulaComparisonOptions = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    grid: {
      left: '15%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#E2E8F0' : '#1E293B'
      }
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: kpiMetrics.formulaStats.map(item => item.name),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    series: [
      {
        name: 'KPI Formule',
        type: 'bar',
        data: kpiMetrics.formulaStats.map(item => ({
          value: item.kpi,
          itemStyle: {
            color: item.status === 'success' ? '#10B981' : 
                   item.status === 'warning' ? '#F59E0B' : '#EF4444',
            borderRadius: [0, 4, 4, 0]
          }
        })),
        barWidth: '60%'
      }
    ]
  });

  // Chart options for quality metrics
  const getQualityMetricsOptions = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#E2E8F0' : '#1E293B'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: isDark ? '#CBD5E1' : '#64748B'
      }
    },
    series: [
      {
        name: 'Tests Qualité',
        type: 'pie',
        radius: '50%',
        data: [
          { value: kpiMetrics.qualityMetrics.testsByType.density, name: 'Densité', itemStyle: { color: '#3B82F6' } },
          { value: kpiMetrics.qualityMetrics.testsByType.ph, name: 'pH', itemStyle: { color: '#10B981' } },
          { value: kpiMetrics.qualityMetrics.testsByType.dosage, name: 'Dosage', itemStyle: { color: '#8B5CF6' } },
          { 
            value: Math.max(0, kpiMetrics.qualityMetrics.totalTests - Object.values(kpiMetrics.qualityMetrics.testsByType).reduce((a, b) => a + b, 0)), 
            name: 'Non testés', 
            itemStyle: { color: '#EF4444' } 
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });

  const validateForm = () => {
    return true; // No specific validation needed for dashboard
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const dashboardData = {
      value: kpiMetrics.globalSuccessRate,
      date: selectedDate,
      globalTarget,
      weeklyTarget,
      monthlyTarget,
      metrics: kpiMetrics,
      autoRefresh,
      type: 'live_dashboard'
    };
    
    onSave('rnd', 'live_kpi_dashboard', dashboardData, '');
  };

  const baseInputClasses = `w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/30'
  }`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border-0 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-5 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Tableau de Bord KPI en Temps Réel
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Synchronisation automatique avec les formulations et tests qualité
                </p>
              </div>
              {autoRefresh && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <RefreshCw className="w-3 h-3 text-green-600 animate-spin" />
                  <span className="text-xs text-green-600 font-medium">Auto-Sync</span>
                </div>
              )}
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
            
            {/* Settings Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={baseInputClasses}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Objectif Global (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={globalTarget}
                  onChange={(e) => setGlobalTarget(Number(e.target.value))}
                  className={baseInputClasses}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Objectif Hebdo. (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className={baseInputClasses}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Objectif Mensuel (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className={baseInputClasses}
                />
              </div>
            </div>

            {/* Overall Status */}
            <div className={`p-6 rounded-xl border ${
              overallStatus.color === 'green' ? 
                isDark ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200' :
              overallStatus.color === 'blue' ? 
                isDark ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200' :
                isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    overallStatus.color === 'green' ? 'bg-green-600' :
                    overallStatus.color === 'blue' ? 'bg-blue-600' : 'bg-red-600'
                  }`}>
                    {overallStatus.color === 'green' ? <CheckCircle className="w-6 h-6 text-white" /> :
                     overallStatus.color === 'blue' ? <Activity className="w-6 h-6 text-white" /> :
                     <AlertTriangle className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      overallStatus.color === 'green' ? 
                        isDark ? 'text-green-400' : 'text-green-700' :
                      overallStatus.color === 'blue' ? 
                        isDark ? 'text-blue-400' : 'text-blue-700' :
                        isDark ? 'text-red-400' : 'text-red-700'
                    }`}>
                      Performance Globale: {overallStatus.text}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {kpiMetrics.totalFormulas} formules • {kpiMetrics.totalEssais} essais • {kpiMetrics.qualityMetrics.totalProducts} produits
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${
                    overallStatus.color === 'green' ? 'text-green-600' :
                    overallStatus.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {kpiMetrics.globalSuccessRate}%
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Taux de Réussite Global
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Formules Actives
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {kpiMetrics.activeFormulas}/{kpiMetrics.totalFormulas}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  avec données d'essai
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Essais Réussis
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {kpiMetrics.successfulEssais}/{kpiMetrics.totalEssais}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  essais totaux
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Au-dessus Objectif
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {kpiMetrics.formulasAboveTarget}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  formules ≥{globalTarget}%
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Tests Qualité Réussis
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {kpiMetrics.qualityMetrics.passedTests}/{kpiMetrics.qualityMetrics.totalTests}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  tests individuels
                </div>
              </div>
            </div>

            {/* Charts */}
            {kpiMetrics.trendsData.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Trend Chart */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Tendance Hebdomadaire
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Évolution du taux de réussite
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getTrendChartOptions()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Formula Comparison Chart or Quality Metrics */}
                {kpiMetrics.formulaStats.length > 0 ? (
                  <div className={`p-6 rounded-xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Performance Formules
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          KPI par formule
                        </p>
                      </div>
                    </div>
                    
                    <ReactECharts 
                      option={getFormulaComparisonOptions()} 
                      style={{ height: '300px' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                ) : kpiMetrics.qualityMetrics.totalTests > 0 && (
                  <div className={`p-6 rounded-xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <TestTube className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Répartition Tests Qualité
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Tests réussis par type
                        </p>
                      </div>
                    </div>
                    
                    <ReactECharts 
                      option={getQualityMetricsOptions()} 
                      style={{ height: '300px' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Formula Details Table */}
            {kpiMetrics.formulaStats.length > 0 && (
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Détails des Formules
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Statistiques complètes avec ingrédients
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Formule
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          KPI
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Taux Réussite
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Essais
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Ingrédients
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpiMetrics.formulaStats.map((formula, index) => (
                        <tr key={index} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                          <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="font-medium">{formula.name}</div>
                            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Créé le {new Date(formula.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-lg font-bold ${
                              formula.kpi >= 80 ? 'text-green-600' :
                              formula.kpi >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formula.kpi}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm font-medium ${
                              formula.status === 'success' ? 'text-green-600' :
                              formula.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formula.successRate}%
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-center text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {formula.essaisCount}/{formula.maxEssais}
                          </td>
                          <td className={`py-3 px-4 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <div className="max-w-32 truncate" title={formula.ingredients.join(', ')}>
                              {formula.ingredients.length} ingrédients
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              formula.status === 'success' ? 'bg-green-600 text-white' :
                              formula.status === 'warning' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {formula.status === 'success' ? 'Excellent' :
                               formula.status === 'warning' ? 'Moyen' : 'À Améliorer'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quality Metrics Summary */}
            {kpiMetrics.qualityMetrics.totalProducts > 0 && (
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Résumé Tests Qualité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <Beaker className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Tests Densité
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {kpiMetrics.qualityMetrics.testsByType.density}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-green-500" />
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Tests pH
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {kpiMetrics.qualityMetrics.testsByType.ph}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Gauge className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Tests Dosage
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        {kpiMetrics.qualityMetrics.testsByType.dosage}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Emballages Disponibles
                      </div>
                      <div className="text-lg font-bold text-amber-600">
                        {kpiMetrics.qualityMetrics.emballageAvailable}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-refresh Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="autoRefresh" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Actualisation automatique en temps réel
                </label>
              </div>
              
              {kpiMetrics.totalFormulas === 0 && kpiMetrics.qualityMetrics.totalProducts === 0 && (
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aucune donnée détectée. Créez des formules et effectuez des tests qualité pour voir les données en temps réel.
                </div>
              )}
            </div>
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
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-md hover:from-purple-600 hover:to-purple-700"
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

export default LiveKPIDashboard;