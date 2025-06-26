// WarehousesYearlyReport.js
import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  Package,
  Euro,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Gauge,
  LineChart,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Truck,
  Zap,
  Award
} from 'lucide-react';
import { 
  getStatusColor, 
  getPerformanceColor, 
  exportToPDF, 
  exportToCSV,
  groupDataByQuarters,
  calculateQuarterlyAverage,
  generateCommonChartOptions,
  getNoDataComponent
} from './SharedUtils';
import { useWarehouseData } from '../../hooks/useWarehouseData';

export const WarehousesYearlyReport = ({ isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);

  // Use Supabase warehouse data
  const { 
    kpiData, 
    isLoading, 
    error, 
    getAnalyticsData,
    refreshData 
  } = useWarehouseData();

  const yearlyAnalysis = useMemo(() => {
    if (!kpiData || isLoading) return null;

    const costData = kpiData.cost_per_formulation || [];
    const inventoryData = kpiData.stock_issues_rate || [];

    const { filteredData: filteredCost } = groupDataByQuarters(costData, selectedYear);
    const { filteredData: filteredInventory } = groupDataByQuarters(inventoryData, selectedYear);

    if (filteredCost.length === 0 && filteredInventory.length === 0) return null;

    const quarters = {
      Q1: { months: [0, 1, 2], cost: [], inventory: [], name: 'T1' },
      Q2: { months: [3, 4, 5], cost: [], inventory: [], name: 'T2' },
      Q3: { months: [6, 7, 8], cost: [], inventory: [], name: 'T3' },
      Q4: { months: [9, 10, 11], cost: [], inventory: [], name: 'T4' }
    };

    [filteredCost, filteredInventory].forEach((dataArray, type) => {
      const typeKey = ['cost', 'inventory'][type];
      dataArray.forEach(entry => {
        const month = new Date(entry.date).getMonth();
        Object.keys(quarters).forEach(quarter => {
          if (quarters[quarter].months.includes(month)) {
            quarters[quarter][typeKey].push(entry);
          }
        });
      });
    });

    const quarterlyBreakdown = [];
    const allDetections = [];

    Object.keys(quarters).forEach(quarterKey => {
      const quarter = quarters[quarterKey];
      const quarterAnalysis = {
        quarter: quarterKey,
        quarterName: quarter.name,
        cost: {
          average: calculateQuarterlyAverage(quarter.cost),
          entries: quarter.cost.length,
          totalCost: 0,
          budgetedCost: 0,
          budgetVariance: 0,
          efficiencyScore: 0
        },
        inventory: {
          average: calculateQuarterlyAverage(quarter.inventory),
          entries: quarter.inventory.length,
          turnoverRate: 0,
          stockLevels: 0,
          optimalStock: 0,
          issuesCount: 0
        },
        detectedEvents: [],
        overallStatus: 'good'
      };

      // Analyze Cost Performance
      if (quarter.cost.length > 0) {
        quarter.cost.forEach(entry => {
          if (entry.data) {
            quarterAnalysis.cost.totalCost += entry.data.monthlyTotal || entry.data.totalCost || 0;
            quarterAnalysis.cost.budgetedCost += entry.data.monthlyBudget || entry.data.budgetedCost || 0;
            quarterAnalysis.cost.budgetVariance += entry.data.budgetVariance || 0;
            quarterAnalysis.cost.efficiencyScore += entry.data.efficiencyScore || entry.value || 0;
          }
        });

        quarterAnalysis.cost.efficiencyScore = Math.round(quarterAnalysis.cost.efficiencyScore / quarter.cost.length);
        quarterAnalysis.cost.budgetVariance = quarterAnalysis.cost.totalCost - quarterAnalysis.cost.budgetedCost;

        if (quarterAnalysis.cost.average < 70) {
          const severity = quarterAnalysis.cost.average < 50 ? 'critical' : 'warning';
          const detection = {
            type: 'quarterly_cost_inefficiency',
            severity,
            category: 'Gestion Coûts',
            title: `Performance coûts ${quarter.name} critique (${quarterAnalysis.cost.average}%)`,
            description: `Efficacité budgétaire trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Impact financier majeur' : 'Optimisation requise',
            quarter: quarterKey
          };
          allDetections.push(detection);
          quarterAnalysis.detectedEvents.push(detection);
        }
      }

      // Analyze Inventory Performance  
      if (quarter.inventory.length > 0) {
        quarter.inventory.forEach(entry => {
          if (entry.data) {
            quarterAnalysis.inventory.turnoverRate += entry.data.turnoverRate || 0;
            quarterAnalysis.inventory.stockLevels += entry.data.currentStock || entry.data.stockLevels || 0;
            quarterAnalysis.inventory.optimalStock += entry.data.optimalStock || 0;
            quarterAnalysis.inventory.issuesCount += entry.data.currentMonthCount || entry.data.stockIssues?.length || 0;
          }
        });

        quarterAnalysis.inventory.turnoverRate = Math.round(quarterAnalysis.inventory.turnoverRate / quarter.inventory.length);

        if (quarterAnalysis.inventory.average < 70) {
          const severity = quarterAnalysis.inventory.average < 50 ? 'critical' : 'warning';
          const detection = {
            type: 'quarterly_inventory_inefficiency',
            severity,
            category: 'Gestion Inventaire',
            title: `Performance inventaire ${quarter.name} critique (${quarterAnalysis.inventory.average}%)`,
            description: `Rotation d'inventaire trimestrielle inefficace.`,
            impact: severity === 'critical' ? 'Coûts de stockage élevés' : 'Optimisation requise',
            quarter: quarterKey
          };
          allDetections.push(detection);
          quarterAnalysis.detectedEvents.push(detection);
        }
      }

      // Determine status
      const criticalEvents = quarterAnalysis.detectedEvents.filter(e => e.severity === 'critical').length;
      const warningEvents = quarterAnalysis.detectedEvents.filter(e => e.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        quarterAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        quarterAnalysis.overallStatus = 'warning';
      } else if (quarterAnalysis.cost.average >= 90 && quarterAnalysis.inventory.average >= 90) {
        quarterAnalysis.overallStatus = 'excellent';
      } else if (quarterAnalysis.cost.average >= 80 && quarterAnalysis.inventory.average >= 80) {
        quarterAnalysis.overallStatus = 'good';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      cost: filteredCost.length > 0 ? calculateQuarterlyAverage(filteredCost) : 0,
      inventory: filteredInventory.length > 0 ? calculateQuarterlyAverage(filteredInventory) : 0
    };
    yearlyPerformance.overall = Math.round((yearlyPerformance.cost + yearlyPerformance.inventory) / 2);

    return {
      year: selectedYear,
      yearlyPerformance,
      quarterlyBreakdown,
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      statistics: {
        totalEntries: filteredCost.length + filteredInventory.length,
        costEntries: filteredCost.length,
        inventoryEntries: filteredInventory.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentQuarters: quarterlyBreakdown.filter(q => q.overallStatus === 'excellent').length,
        quartersAnalyzed: quarterlyBreakdown.length,
        totalCost: quarterlyBreakdown.reduce((sum, q) => sum + q.cost.totalCost, 0),
        totalBudgeted: quarterlyBreakdown.reduce((sum, q) => sum + q.cost.budgetedCost, 0),
        averageTurnover: quarterlyBreakdown.length > 0 ? Math.round(quarterlyBreakdown.reduce((sum, q) => sum + q.inventory.turnoverRate, 0) / quarterlyBreakdown.length) : 0,
        totalIssues: quarterlyBreakdown.reduce((sum, q) => sum + q.inventory.issuesCount, 0)
      },
      hasData: filteredCost.length > 0 || filteredInventory.length > 0
    };
  }, [kpiData, selectedYear, isLoading]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-lg rounded-2xl shadow-lg border backdrop-blur-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="p-8 text-center">
            <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
              <RefreshCw className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Chargement des données...
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Récupération des données logistique depuis Supabase
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-lg rounded-2xl shadow-lg border backdrop-blur-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="p-8 text-center">
            <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} flex items-center justify-center mx-auto mb-4`}>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Erreur de chargement
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Impossible de charger les données depuis Supabase
            </p>
            <div className="flex space-x-2 justify-center">
              <button 
                onClick={refreshData}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Réessayer
              </button>
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!yearlyAnalysis || !yearlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-2xl border shadow-2xl backdrop-blur-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée logistique trouvée pour l'année {selectedYear}.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getQuarterlyTrendChart = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: isDark ? '#64748B' : '#94A3B8' }
      }
    },
    legend: {
      bottom: '5%',
      textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: yearlyAnalysis.quarterlyBreakdown.map(q => q.quarterName),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Performance Coûts',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.cost.average),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 4 },
        itemStyle: { color: '#8B5CF6', borderWidth: 3, borderColor: '#FFFFFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: 'Performance Inventaire',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.inventory.average),
        smooth: true,
        lineStyle: { color: '#06B6D4', width: 4 },
        itemStyle: { color: '#06B6D4', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const getQuarterlyComparisonChart = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
    },
    legend: {
      bottom: '5%',
      textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true
    },
    xAxis: {
      type: 'category',
      data: yearlyAnalysis.quarterlyBreakdown.map(q => q.quarterName),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Coûts',
        type: 'bar',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.cost.average),
        itemStyle: { 
          color: '#8B5CF6',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Inventaire',
        type: 'bar',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.inventory.average),
        itemStyle: { 
          color: '#06B6D4',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  });

  const handleExportToPDF = () => {
    const data = {
      overall: yearlyAnalysis.yearlyPerformance.overall,
      details: `
        <p><strong>Performance Coûts:</strong> ${yearlyAnalysis.yearlyPerformance.cost}%</p>
        <p><strong>Performance Inventaire:</strong> ${yearlyAnalysis.yearlyPerformance.inventory}%</p>
        <p><strong>Coût total:</strong> ${yearlyAnalysis.statistics.totalCost.toLocaleString()} DT</p>
        <p><strong>Budget total:</strong> ${yearlyAnalysis.statistics.totalBudgeted.toLocaleString()} DT</p>
        <p><strong>Problèmes inventaire:</strong> ${yearlyAnalysis.statistics.totalIssues}</p>
        <p><strong>Rotation moyenne:</strong> ${yearlyAnalysis.statistics.averageTurnover}x</p>
      `
    };
    exportToPDF(`Rapport Logistique Annuel`, yearlyAnalysis.year, data);
  };

  const handleExportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.cost.average,
      quarter.inventory.average,
      quarter.cost.totalCost,
      quarter.cost.budgetedCost,
      quarter.inventory.turnoverRate,
      quarter.inventory.issuesCount,
      quarter.overallStatus
    ]);
    
    exportToCSV(
      `rapport_logistique_annuel_${yearlyAnalysis.year}.csv`,
      ['Trimestre', 'Coûts %', 'Inventaire %', 'Coût Total', 'Budget', 'Rotation', 'Problèmes', 'Statut'],
      csvData
    );
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getOverallStatus = () => {
    const score = yearlyAnalysis.yearlyPerformance.overall;
    if (score >= 90) return { status: 'excellent', color: 'violet', text: 'Excellent', icon: CheckCircle };
    if (score >= 75) return { status: 'good', color: 'violet', text: 'Bon', icon: Activity };
    return { status: 'needs-attention', color: 'red', text: 'Amélioration Nécessaire', icon: AlertTriangle };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border backdrop-blur-sm ${
        isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/70 border-slate-200'} rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Logistique Annuel
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Année {yearlyAnalysis.year}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {yearlyAnalysis.statistics.quartersAnalyzed} trimestres • {yearlyAnalysis.statistics.totalEntries} entrées
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`text-2xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                {yearlyAnalysis.yearlyPerformance.overall}%
              </div>
              <button 
                onClick={onClose} 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-8 py-4 border-b ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/70 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateYear(-1)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[180px]">
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Année {yearlyAnalysis.year}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {yearlyAnalysis.statistics.criticalIssues} critiques • {yearlyAnalysis.statistics.excellentQuarters} excellents
                </div>
              </div>
              
              <button
                onClick={() => navigateYear(1)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedView === 'overview' 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Vue d'ensemble</span>
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedView === 'quarterly' 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Trimestriel</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshData}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Actualiser les données"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleExportToPDF}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleExportToCSV}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'overview' && (
            <div className="h-full p-6 overflow-y-auto space-y-6">
              
              {/* Modern Performance Summary */}
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      overallStatus.color === 'violet' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-red-500 to-pink-600'
                    }`}>
                      <StatusIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Performance Annuelle: {overallStatus.text}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {yearlyAnalysis.statistics.totalDetections} détections • {yearlyAnalysis.statistics.criticalIssues} critiques • {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                      {yearlyAnalysis.yearlyPerformance.overall}%
                    </div>
                    <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Performance Globale
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { title: 'Coûts', value: yearlyAnalysis.yearlyPerformance.cost, icon: Euro, color: 'violet', subtitle: `${yearlyAnalysis.statistics.totalCost.toLocaleString()} DT` },
                    { title: 'Inventaire', value: yearlyAnalysis.yearlyPerformance.inventory, icon: Package, color: 'cyan', subtitle: `rotation ${yearlyAnalysis.statistics.averageTurnover}x` },
                    { title: 'Budget', value: yearlyAnalysis.statistics.totalBudgeted, icon: Target, color: 'green', subtitle: 'DT alloué', isCount: true },
                    { title: 'Problèmes', value: yearlyAnalysis.statistics.totalIssues, icon: Activity, color: 'orange', subtitle: 'inventaire', isCount: true }
                  ].map((metric, index) => (
                    <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      isDark ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50/50 border-slate-200/50'
                    }`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          metric.color === 'violet' ? 'bg-violet-500/15 text-violet-600' :
                          metric.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-600' :
                          metric.color === 'green' ? 'bg-green-500/15 text-green-600' :
                          'bg-orange-500/15 text-orange-600'
                        }`}>
                          <metric.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {metric.title}
                        </span>
                      </div>
                      
                      <div className={`text-2xl font-light mb-2 ${
                        metric.isCount ? 
                          (metric.color === 'green' ? 'text-green-600' : 'text-orange-600') : 
                          getPerformanceColor(metric.value)
                      }`}>
                        {metric.isCount ? metric.value.toLocaleString() : `${metric.value}%`}
                      </div>
                      
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {metric.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Quarterly Trend Chart */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Évolution Trimestrielle
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Tendances des performances par trimestre
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getQuarterlyTrendChart()} 
                    style={{ height: '320px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Quarterly Comparison Chart */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Comparaison Trimestrielle
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Performances par KPI et trimestre
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getQuarterlyComparisonChart()} 
                    style={{ height: '320px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedView === 'quarterly' && (
            <div className="h-full p-6 overflow-y-auto space-y-6">
              
              {/* Quarter Selector */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Analyse Détaillée par Trimestre
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {yearlyAnalysis.quarterlyBreakdown.map((quarter, index) => {
                    const isSelected = selectedQuarterDetail === quarter.quarter;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedQuarterDetail(isSelected ? null : quarter.quarter)}
                        className={`p-4 rounded-xl border text-center transition-all duration-300 transform hover:scale-105 ${
                          isSelected ?
                            'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-400/50 shadow-lg' :
                          quarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-violet-500/5 border-violet-500/20 hover:bg-violet-500/10' : 'bg-violet-50/50 border-violet-200/50 hover:bg-violet-50' :
                          quarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' : 'bg-red-50/50 border-red-200/50 hover:bg-red-50' :
                          quarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10' : 'bg-amber-50/50 border-amber-200/50 hover:bg-amber-50' :
                            isDark ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50' : 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                          isSelected ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' :
                          quarter.overallStatus === 'excellent' ? 'bg-violet-500/80 text-white' :
                          quarter.overallStatus === 'critical' ? 'bg-red-500/80 text-white' :
                          quarter.overallStatus === 'warning' ? 'bg-amber-500/80 text-white' : 
                          isDark ? 'bg-slate-600/80 text-slate-200' : 'bg-slate-400/80 text-white'
                        }`}>
                          <span className="text-sm font-medium">{quarter.quarterName}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          isSelected ? isDark ? 'text-violet-300' : 'text-violet-600' :
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Trimestre {quarter.quarterName}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {Math.round((quarter.cost.average + quarter.inventory.average) / 2)}% global
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quarter Details */}
              {selectedQuarterDetail && (
                <div className="space-y-6">
                  {(() => {
                    const selectedQuarter = yearlyAnalysis.quarterlyBreakdown.find(q => q.quarter === selectedQuarterDetail);
                    if (!selectedQuarter) return null;

                    return (
                      <>
                        {/* Quarter Header */}
                        <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                          isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                selectedQuarter.overallStatus === 'excellent' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                                selectedQuarter.overallStatus === 'critical' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                                selectedQuarter.overallStatus === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                'bg-gradient-to-br from-slate-500 to-slate-600'
                              }`}>
                                <span className="text-white font-medium">{selectedQuarter.quarterName}</span>
                              </div>
                              <div>
                                <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                                  Trimestre {selectedQuarter.quarterName} - {yearlyAnalysis.year}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {selectedQuarter.detectedEvents.length} détections • {selectedQuarter.cost.entries + selectedQuarter.inventory.entries} entrées
                                </p>
                              </div>
                            </div>
                            
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                              isDark ? 'bg-slate-700/50' : 'bg-slate-100/70'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                selectedQuarter.overallStatus === 'excellent' ? 'bg-violet-500' :
                                selectedQuarter.overallStatus === 'critical' ? 'bg-red-500' :
                                selectedQuarter.overallStatus === 'warning' ? 'bg-amber-500' :
                                'bg-slate-500'
                              }`} />
                              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedQuarter.overallStatus === 'excellent' ? 'Excellent' :
                                 selectedQuarter.overallStatus === 'critical' ? 'Critique' :
                                 selectedQuarter.overallStatus === 'warning' ? 'Attention' :
                                 'Standard'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quarter Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { 
                              title: 'Coûts', 
                              value: selectedQuarter.cost.average, 
                              icon: Euro, 
                              color: 'violet',
                              subtitle: `${selectedQuarter.cost.totalCost.toLocaleString()} / ${selectedQuarter.cost.budgetedCost.toLocaleString()} DT`
                            },
                            { 
                              title: 'Inventaire', 
                              value: selectedQuarter.inventory.average, 
                              icon: Package, 
                              color: 'cyan',
                              subtitle: `${selectedQuarter.inventory.issuesCount} problèmes • rotation ${selectedQuarter.inventory.turnoverRate}x`
                            }
                          ].map((metric, index) => (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                              isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                            }`}>
                              <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  metric.color === 'violet' ? 'bg-violet-500/15 text-violet-600' :
                                  'bg-cyan-500/15 text-cyan-600'
                                }`}>
                                  <metric.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {metric.title}
                                  </h4>
                                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {metric.subtitle}
                                  </p>
                                </div>
                              </div>
                              
                              <div className={`text-2xl font-light mb-3 ${getPerformanceColor(metric.value)}`}>
                                {metric.value}%
                              </div>
                              
                              <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-slate-700/50' : 'bg-slate-200/50'} overflow-hidden`}>
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    metric.value >= 90 ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
                                    metric.value >= 75 ? 'bg-gradient-to-r from-violet-500 to-cyan-500' :
                                    metric.value >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                    'bg-gradient-to-r from-red-500 to-pink-500'
                                  }`}
                                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quarter Detections */}
                        {selectedQuarter.detectedEvents.length > 0 && (
                          <div className={`p-6 rounded-2xl border ${
                            isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                          }`}>
                            <div className="flex items-center space-x-3 mb-5">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Détections du Trimestre
                                </h4>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {selectedQuarter.detectedEvents.length} alerte{selectedQuarter.detectedEvents.length > 1 ? 's' : ''} identifiée{selectedQuarter.detectedEvents.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {selectedQuarter.detectedEvents.map((detection, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${
                                  detection.severity === 'critical' ?
                                    isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/50 border-red-200/50' :
                                    isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/50 border-amber-200/50'
                                }`}>
                                  <div className="flex items-start space-x-3">
                                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      detection.severity === 'critical' ? 
                                        'bg-red-500/20 text-red-700 dark:text-red-300' : 
                                        'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                    }`}>
                                      {detection.severity === 'critical' ? 'Critique' : 'Attention'}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {detection.title}
                                      </h5>
                                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {detection.description}
                                      </p>
                                      <div className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Impact: {detection.impact}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 border-t backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/70 border-slate-200'} rounded-b-2xl`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall).replace('text-', 'bg-')}`}></div>
                <span className={`text-sm font-semibold ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                  {yearlyAnalysis.yearlyPerformance.overall}% Performance Annuelle
                </span>
              </div>
              
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents • {yearlyAnalysis.statistics.criticalIssues} critiques
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportToPDF}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm transition-all duration-200 ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
              
              <button
                onClick={handleExportToCSV}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm transition-all duration-200 ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium transition-all duration-200 hover:from-violet-700 hover:to-purple-700 shadow-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};