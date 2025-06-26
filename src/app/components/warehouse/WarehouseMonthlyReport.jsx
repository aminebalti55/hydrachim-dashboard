import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useWarehouseData } from '../../hooks/useWarehouseData';
import {
  X,
  Calendar,
  Euro,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Download,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Activity,
  Gauge,
  RefreshCw,
  Share2,
  Settings,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Lightbulb,
  Search,
  AlertCircle,
  Star,
  Award,
  PieChart,
  LineChart,
  FileSpreadsheet,
  Mail,
  BookOpen,
  Layers,
  Timer,
  PlayCircle,
  CheckCircle2,
  Droplets,
  Power,
  Thermometer,
  Cpu,
  Wallet,
  DollarSign,
  Flame,
  Shield,
  Brain,
  Sparkles,
  Loader2
} from 'lucide-react';

const WarehouseMonthlyReport = ({ isDark = false, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWeekDetail, setSelectedWeekDetail] = useState(null);
  const [animatedStats, setAnimatedStats] = useState(false);

  // Use the warehouse data hook to get real data
  const {
    kpiData,
    isLoading,
    error,
    getKPIHistory,
    getLatestKPIValue,
    getDepartmentSummary
  } = useWarehouseData();

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const monthlyAnalysis = useMemo(() => {
    if (isLoading || !kpiData) return null;

    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Get real data from warehouse hooks - updated for correct data structure
    const costData = getKPIHistory('warehouses', 'cost_per_formulation', 50).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    const stockData = getKPIHistory('warehouses', 'stock_issues_rate', 50).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    if (costData.length === 0 && stockData.length === 0) {
      return null;
    }

    const getWeekNumber = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const weeklyData = {};
    const allDetections = [];
    
    // Process cost and stock data by week with real data structure
    [...costData, ...stockData].forEach(entry => {
      const week = getWeekNumber(new Date(entry.date));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          startDate: new Date(entry.date),
          cost: [],
          stock: [],
          detectedEvents: []
        };
      }

      if (costData.includes(entry)) weeklyData[week].cost.push(entry);
      if (stockData.includes(entry)) weeklyData[week].stock.push(entry);
    });

    const weeklyBreakdown = [];

    Object.values(weeklyData).forEach(week => {
      const weekAnalysis = {
        week: week.week,
        startDate: week.startDate.toLocaleDateString('fr-FR'),
        endDate: new Date(week.startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        cost: {
          average: 0,
          entries: week.cost.length,
          totalCost: 0,
          budgetedCost: 0,
          budgetVariance: 0,
          onBudgetItems: 0,
          totalItems: 0,
          issues: []
        },
        stock: {
          average: 100,
          entries: week.stock.length,
          totalIssues: 0,
          monthlyGoal: 0,
          issues: []
        },
        detectedEvents: [],
        overallStatus: 'good',
        rawData: {
          cost: week.cost,
          stock: week.stock
        }
      };

      // Analyze Cost Performance with real data structure
      if (week.cost.length > 0) {
        const costAvg = week.cost.reduce((sum, entry) => sum + entry.value, 0) / week.cost.length;
        weekAnalysis.cost.average = Math.round(costAvg);

        week.cost.forEach(entry => {
          if (entry.data) {
            // Map real data structure from warehouse service
            weekAnalysis.cost.totalCost += entry.data.monthlyTotal || 0;
            weekAnalysis.cost.budgetedCost += entry.data.monthlyBudget || 0;
            weekAnalysis.cost.budgetVariance += (entry.data.monthlyTotal || 0) - (entry.data.monthlyBudget || 0);
            
            if (entry.data.stats) {
              weekAnalysis.cost.onBudgetItems += entry.data.stats.budgetedItems || 0;
              weekAnalysis.cost.totalItems += entry.data.stats.totalItems || 0;
            }
          }
        });

        // Budget performance detection based on real KPI calculation
        if (costAvg === 0) {
          const detection = {
            type: 'budget_overrun',
            severity: 'critical',
            category: 'Gestion Budgétaire',
            title: `Dépassement budgétaire critique`,
            description: `Budget dépassé avec coût total de ${weekAnalysis.cost.totalCost.toLocaleString()} DT.`,
            impact: 'Impact financier significatif sur la rentabilité',
            week: week.week,
            realData: {
              totalCost: weekAnalysis.cost.totalCost,
              budgetedCost: weekAnalysis.cost.budgetedCost,
              variance: weekAnalysis.cost.budgetVariance
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.cost.issues.push(`Budget dépassé`);
        } else if (costAvg < 100) {
          const detection = {
            type: 'budget_strain',
            severity: 'warning',
            category: 'Gestion Budgétaire',
            title: `Tension budgétaire (${Math.round(costAvg)}%)`,
            description: `Performance budgétaire en tension avec variance de ${weekAnalysis.cost.budgetVariance.toLocaleString()} DT.`,
            impact: 'Surveillance renforcée recommandée',
            week: week.week,
            realData: {
              performanceRate: costAvg,
              variance: weekAnalysis.cost.budgetVariance,
              onBudgetItems: weekAnalysis.cost.onBudgetItems,
              totalItems: weekAnalysis.cost.totalItems
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }

        // High cost detection
        if (weekAnalysis.cost.totalCost > 50000) {
          const detection = {
            type: 'high_cost',
            severity: weekAnalysis.cost.totalCost > 100000 ? 'critical' : 'warning',
            category: 'Contrôle des Coûts',
            title: `Coûts élevés détectés`,
            description: `${weekAnalysis.cost.totalCost.toLocaleString()} DT de coûts cette semaine.`,
            impact: 'Révision des achats recommandée',
            week: week.week,
            realData: {
              totalCost: weekAnalysis.cost.totalCost,
              averageDaily: weekAnalysis.cost.totalCost / 7,
              budgetedCost: weekAnalysis.cost.budgetedCost
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }
      }

      // Analyze Stock Issues Performance with real data structure
      if (week.stock.length > 0) {
        const stockAvg = week.stock.reduce((sum, entry) => sum + entry.value, 0) / week.stock.length;
        weekAnalysis.stock.average = Math.round(stockAvg);

        week.stock.forEach(entry => {
          if (entry.data) {
            // Map real data structure from warehouse service
            weekAnalysis.stock.totalIssues += entry.data.currentMonthCount || 0;
            weekAnalysis.stock.monthlyGoal = entry.data.monthlyGoal || 0;
          }
        });

        // Stock issues detection based on real KPI logic
        if (weekAnalysis.stock.totalIssues > weekAnalysis.stock.monthlyGoal && weekAnalysis.stock.monthlyGoal > 0) {
          const detection = {
            type: 'stock_issues_exceeded',
            severity: weekAnalysis.stock.totalIssues > weekAnalysis.stock.monthlyGoal * 2 ? 'critical' : 'warning',
            category: 'Gestion Stock',
            title: `Objectif problèmes stock dépassé`,
            description: `${weekAnalysis.stock.totalIssues} problèmes vs objectif de ${weekAnalysis.stock.monthlyGoal}.`,
            impact: 'Optimisation des processus de stock nécessaire',
            week: week.week,
            realData: {
              totalIssues: weekAnalysis.stock.totalIssues,
              monthlyGoal: weekAnalysis.stock.monthlyGoal,
              overagePercentage: ((weekAnalysis.stock.totalIssues - weekAnalysis.stock.monthlyGoal) / weekAnalysis.stock.monthlyGoal * 100).toFixed(1)
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }
      }

      // Determine overall week status
      const criticalEvents = weekAnalysis.detectedEvents.filter(e => e.severity === 'critical').length;
      const warningEvents = weekAnalysis.detectedEvents.filter(e => e.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        weekAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        weekAnalysis.overallStatus = 'warning';
      } else if (weekAnalysis.cost.average === 100 && weekAnalysis.stock.average >= 90) {
        weekAnalysis.overallStatus = 'excellent';
      } else if (weekAnalysis.cost.average >= 80 && weekAnalysis.stock.average >= 75) {
        weekAnalysis.overallStatus = 'good';
      }

      weeklyBreakdown.push(weekAnalysis);
    });

    // Calculate monthly performance from real data
    const monthlyPerformance = {
      cost: costData.length > 0 ? Math.round(costData.reduce((sum, entry) => sum + entry.value, 0) / costData.length) : 0,
      stock: stockData.length > 0 ? Math.round(stockData.reduce((sum, entry) => sum + entry.value, 0) / stockData.length) : 100,
    };
    monthlyPerformance.overall = Math.round((monthlyPerformance.cost + monthlyPerformance.stock) / 2);

    // Generate AI recommendations based on detected patterns
    const generateRecommendations = () => {
      const recs = [];
      
      const budgetIssues = allDetections.filter(d => d.category === 'Gestion Budgétaire').length;
      const costIssues = allDetections.filter(d => d.category === 'Contrôle des Coûts').length;
      const stockIssues = allDetections.filter(d => d.category === 'Gestion Stock').length;
      
      if (budgetIssues > 2) {
        recs.push({
          type: 'budget_optimization',
          priority: 'high',
          title: 'Optimiser la gestion budgétaire',
          description: 'Réviser les processus de budgétisation et mettre en place des contrôles renforcés.',
          impact: 'Réduction de 20-30% des dépassements budgétaires'
        });
      }
      
      if (costIssues > 1) {
        recs.push({
          type: 'cost_control',
          priority: 'medium',
          title: 'Renforcer le contrôle des coûts',
          description: 'Négocier avec les fournisseurs et optimiser les achats groupés.',
          impact: 'Économies de 10-15% sur les achats'
        });
      }
      
      if (stockIssues > 0) {
        recs.push({
          type: 'stock_efficiency',
          priority: 'medium',
          title: 'Améliorer la gestion des stocks',
          description: 'Optimiser les processus de réapprovisionnement et formation des équipes.',
          impact: 'Réduction de 25% des problèmes de stock'
        });
      }
      
      return recs;
    };

    const aiRecommendations = generateRecommendations();

    // Calculate real statistics from warehouse data
    const totalCostForMonth = weeklyBreakdown.reduce((sum, week) => sum + week.cost.totalCost, 0);
    const totalBudgetForMonth = weeklyBreakdown.reduce((sum, week) => sum + week.cost.budgetedCost, 0);
    const totalVarianceForMonth = weeklyBreakdown.reduce((sum, week) => sum + week.cost.budgetVariance, 0);

    return {
      monthName: monthNames[selectedMonth],
      year: selectedYear,
      monthlyPerformance,
      weeklyBreakdown: weeklyBreakdown.sort((a, b) => a.week - b.week),
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity] || b.week - a.week;
      }),
      recommendations: aiRecommendations,
      statistics: {
        totalEntries: costData.length + stockData.length,
        costEntries: costData.length,
        stockEntries: stockData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentWeeks: weeklyBreakdown.filter(w => w.overallStatus === 'excellent').length,
        categoryBreakdown: {
          'Gestion Budgétaire': allDetections.filter(d => d.category === 'Gestion Budgétaire').length,
          'Contrôle des Coûts': allDetections.filter(d => d.category === 'Contrôle des Coûts').length,
          'Gestion Stock': allDetections.filter(d => d.category === 'Gestion Stock').length
        },
        weeksAnalyzed: weeklyBreakdown.length,
        totalCost: totalCostForMonth,
        totalBudgeted: totalBudgetForMonth,
        totalVariance: totalVarianceForMonth,
        totalItems: weeklyBreakdown.reduce((sum, week) => sum + week.cost.totalItems, 0),
        budgetedItems: weeklyBreakdown.reduce((sum, week) => sum + week.cost.onBudgetItems, 0),
        totalStockIssues: weeklyBreakdown.reduce((sum, week) => sum + week.stock.totalIssues, 0)
      },
      hasData: costData.length > 0 || stockData.length > 0
    };
  }, [kpiData, selectedMonth, selectedYear, getKPIHistory, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ${
          isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Chargement des Données
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Analyse des données d'entrepôt en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ${
          isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Erreur de Chargement
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {error}
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!monthlyAnalysis || !monthlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ${
          isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune Donnée Disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée d'entrepôt trouvée pour {new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getWeeklyTrendChart = () => ({
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
      textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 },
      itemStyle: { borderRadius: 6 }
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
      data: monthlyAnalysis.weeklyBreakdown.map(week => `S${week.week}`),
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
        name: 'Performance Budget',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.cost.average),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 4 },
        itemStyle: { color: '#8B5CF6', borderWidth: 3, borderColor: '#FFFFFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 92, 246, 0.4)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: 'Gestion Stock',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.stock.average),
        smooth: true,
        lineStyle: { color: '#06B6D4', width: 4 },
        itemStyle: { color: '#06B6D4', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const getCostDistributionChart = () => {
    const totalCost = monthlyAnalysis.statistics.totalCost;
    
    // Use real data structure based on your cost tracker
    const latestCostEntry = getLatestKPIValue('warehouses', 'cost_per_formulation');
    let materieresCost = totalCost * 0.7; // Default fallback
    let emballageCost = totalCost * 0.2;
    let autresCost = totalCost * 0.1;

    // If we have real stats, use them
    if (latestCostEntry && latestCostEntry.data && latestCostEntry.data.stats) {
      const stats = latestCostEntry.data.stats;
      materieresCost = stats.materieresPremieresTotal || materieresCost;
      emballageCost = stats.emballageTotal || emballageCost;
      autresCost = Math.max(0, totalCost - materieresCost - emballageCost);
    }

    const data = [
      { 
        value: materieresCost, 
        name: 'Matières Premières', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#8B5CF6' },
              { offset: 1, color: '#6D28D9' }
            ]
          }
        } 
      },
      { 
        value: emballageCost, 
        name: 'Emballages', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#06B6D4' },
              { offset: 1, color: '#0891B2' }
            ]
          }
        } 
      },
      { 
        value: autresCost, 
        name: 'Autres', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#10B981' },
              { offset: 1, color: '#059669' }
            ]
          }
        } 
      }
    ].filter(item => item.value > 0);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);',
        formatter: '{b}: {c} DT ({d}%)'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data,
        label: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          fontSize: 12,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }]
    };
  };

  const getPerformanceRadarChart = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
    },
    radar: {
      indicator: [
        { name: 'Budget', max: 100 },
        { name: 'Stock', max: 100 },
        { name: 'Coûts', max: 100 },
        { name: 'Efficacité', max: 100 },
        { name: 'Qualité', max: 100 }
      ],
      center: ['50%', '50%'],
      radius: '70%',
      axisName: {
        color: isDark ? '#CBD5E1' : '#64748B',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: isDark ? '#475569' : '#E2E8F0' }
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(139, 92, 246, 0.05)',
            'rgba(6, 182, 212, 0.05)',
            'rgba(16, 185, 129, 0.05)'
          ]
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          monthlyAnalysis.monthlyPerformance.cost,
          monthlyAnalysis.monthlyPerformance.stock,
          85, // Cost efficiency score
          Math.max(monthlyAnalysis.monthlyPerformance.cost, monthlyAnalysis.monthlyPerformance.stock),
          78  // Quality score
        ],
        name: 'Performance Actuelle',
        areaStyle: {
          color: 'rgba(139, 92, 246, 0.2)'
        },
        lineStyle: {
          color: '#8B5CF6',
          width: 3
        },
        itemStyle: {
          color: '#8B5CF6'
        }
      }]
    }]
  });

  const navigateMonth = (direction) => {
    const newMonth = selectedMonth + direction;
    if (newMonth < 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else if (newMonth > 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(newMonth);
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Entrepôt - ${monthlyAnalysis.monthName} ${monthlyAnalysis.year}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
            h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
            .subtitle { font-size: 1.2em; opacity: 0.9; margin-top: 10px; }
            .metric { margin: 15px 0; padding: 20px; border: 1px solid #e1e5e9; border-radius: 12px; background: #f8f9fa; }
            .metric h2 { color: #2c3e50; margin-top: 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .critical { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; }
            .warning { background: linear-gradient(135deg, #feca57, #ff9ff3); color: white; }
            .excellent { background: linear-gradient(135deg, #48dbfb, #0abde3); color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📦 Rapport Entrepôt Mensuel</h1>
            <div class="subtitle">${monthlyAnalysis.monthName} ${monthlyAnalysis.year} • Performance Globale: ${monthlyAnalysis.monthlyPerformance.overall}%</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>💰 Performance Budget</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.cost}%</h2>
            </div>
            <div class="stat-card">
              <h3>📦 Gestion Stock</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.stock}%</h2>
            </div>
            <div class="stat-card">
              <h3>💵 Coût Total</h3>
              <h2>${monthlyAnalysis.statistics.totalCost.toLocaleString()} DT</h2>
            </div>
            <div class="stat-card">
              <h3>📈 Semaines Excellentes</h3>
              <h2>${monthlyAnalysis.statistics.excellentWeeks}</h2>
            </div>
          </div>

          <div class="metric">
            <h2>📊 Statistiques Clés</h2>
            <ul>
              <li><strong>Semaines analysées:</strong> ${monthlyAnalysis.statistics.weeksAnalyzed}</li>
              <li><strong>Total entrées:</strong> ${monthlyAnalysis.statistics.totalEntries}</li>
              <li><strong>Budget alloué:</strong> ${monthlyAnalysis.statistics.totalBudgeted.toLocaleString()} DT</li>
              <li><strong>Variance budgétaire:</strong> ${monthlyAnalysis.statistics.totalVariance.toLocaleString()} DT</li>
              <li><strong>Problèmes critiques:</strong> ${monthlyAnalysis.statistics.criticalIssues}</li>
            </ul>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return { icon: Award, color: 'text-emerald-500' };
      case 'good': return { icon: CheckCircle, color: 'text-blue-500' };
      case 'warning': return { icon: AlertTriangle, color: 'text-amber-500' };
      case 'critical': return { icon: AlertCircle, color: 'text-red-500' };
      default: return { icon: Clock, color: 'text-slate-500' };
    }
  };

  const getOverallStatus = () => {
    const score = monthlyAnalysis.monthlyPerformance.overall;
    if (score >= 90) return { status: 'excellent', text: 'Excellent', color: 'emerald' };
    if (score >= 75) return { status: 'good', text: 'Bon', color: 'blue' };
    if (score >= 60) return { status: 'warning', text: 'Satisfaisant', color: 'amber' };
    return { status: 'critical', text: 'Amélioration Nécessaire', color: 'red' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-7xl h-[90vh] flex flex-col rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ${
        isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}>
        
        {/* Glassmorphism Header */}
        <div className={`px-8 py-6 border-b backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/70 border-slate-200'} rounded-t-3xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 flex items-center justify-center shadow-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel d'Entrepôt
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {monthlyAnalysis.monthName} {monthlyAnalysis.year}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {monthlyAnalysis.statistics.weeksAnalyzed} semaines analysées
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-light ${getPerformanceColor(monthlyAnalysis.monthlyPerformance.overall)}`}>
                {monthlyAnalysis.monthlyPerformance.overall}%
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

        {/* Enhanced Navigation Bar */}
        <div className={`px-8 py-4 border-b ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/70 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            
            {/* Month Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateMonth(-1)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[180px]">
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {monthlyAnalysis.monthName} {monthlyAnalysis.year}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {monthlyAnalysis.statistics.weeksAnalyzed} semaines • {monthlyAnalysis.statistics.totalEntries} entrées
                </div>
              </div>
              
              <button
                onClick={() => navigateMonth(1)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* View Selector */}
            <div className="flex items-center space-x-3">
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
                  { id: 'charts', label: 'Graphiques', icon: BarChart3 },
                  { id: 'weekly', label: 'Hebdomadaire', icon: Calendar }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setSelectedView(view.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedView === view.id 
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' 
                        : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <view.icon className="w-4 h-4" />
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Export Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToPDF}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </button>
                
                <button
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {selectedView === 'overview' && (
            <div className="h-full overflow-y-auto p-6 space-y-8">
              
              {/* Modern Performance Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Performance Hero Card */}
                <div className="lg:col-span-7">
                  <div className={`relative p-8 rounded-3xl border backdrop-blur-sm overflow-hidden ${
                    isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                  }`}>
                    
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.02]">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500"></div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <h2 className={`text-2xl font-light ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                            Performance Mensuelle
                          </h2>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Vue d'ensemble • {monthlyAnalysis.monthName} {monthlyAnalysis.year}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-5xl font-extralight ${getPerformanceColor(monthlyAnalysis.monthlyPerformance.overall)} mb-2`}>
                            {monthlyAnalysis.monthlyPerformance.overall}%
                          </div>
                          <div className={`text-xs font-medium uppercase tracking-wide ${
                            overallStatus.color === 'emerald' ? 'text-emerald-600' :
                            overallStatus.color === 'blue' ? 'text-blue-600' :
                            overallStatus.color === 'amber' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {overallStatus.text}
                          </div>
                        </div>
                      </div>

                      {/* Refined KPI Grid */}
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { title: 'Budget', value: monthlyAnalysis.monthlyPerformance.cost, icon: Wallet, color: 'violet' },
                          { title: 'Stock', value: monthlyAnalysis.monthlyPerformance.stock, icon: Package, color: 'cyan' }
                        ].map((kpi, index) => (
                          <div key={index} className={`p-5 rounded-2xl ${
                            isDark ? 'bg-slate-700/20 border border-slate-600/30' : 'bg-slate-50/50 border border-slate-200/50'
                          } backdrop-blur-sm`}>
                            
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                kpi.color === 'violet' ? 'bg-violet-500/15 text-violet-600' : 'bg-cyan-500/15 text-cyan-600'
                              }`}>
                                <kpi.icon className="w-4 h-4" />
                              </div>
                              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {kpi.title}
                              </span>
                            </div>
                            
                            <div className={`text-3xl font-light mb-4 ${getPerformanceColor(kpi.value)}`}>
                              {kpi.value}%
                            </div>
                            
                            <div className={`w-full h-1 rounded-full ${isDark ? 'bg-slate-600/30' : 'bg-slate-200/50'} overflow-hidden`}>
                              <div
                                className={`h-1 rounded-full transition-all duration-1000 ${
                                  kpi.value >= 90 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                  kpi.value >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  kpi.value >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                  'bg-gradient-to-r from-red-500 to-pink-500'
                                }`}
                                style={{ 
                                  width: animatedStats ? `${Math.min(kpi.value, 100)}%` : '0%',
                                  transition: 'width 2s ease-out'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elegant Stats Sidebar */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Key Metrics */}
                  <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                    isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                  }`}>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-5`}>
                      Métriques Clés
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Semaines Excellentes
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {monthlyAnalysis.statistics.excellentWeeks}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            /{monthlyAnalysis.statistics.weeksAnalyzed}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Alertes Critiques
                        </span>
                        <span className={`text-lg font-medium ${
                          monthlyAnalysis.statistics.criticalIssues > 0 ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {monthlyAnalysis.statistics.criticalIssues}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Coût Total
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.totalCost.toLocaleString()} DT
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Budget Alloué
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.totalBudgeted.toLocaleString()} DT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                    isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                  }`}>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-5`}>
                      Évolution
                    </h3>
                    
                    <div className="space-y-3">
                      {monthlyAnalysis.weeklyBreakdown.slice(0, 4).map((week, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                            week.overallStatus === 'excellent' ? 'bg-emerald-500/20 text-emerald-600' :
                            week.overallStatus === 'critical' ? 'bg-red-500/20 text-red-600' :
                            week.overallStatus === 'warning' ? 'bg-amber-500/20 text-amber-600' :
                            isDark ? 'bg-slate-600/20 text-slate-400' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {week.week}
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              Semaine {week.week}
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${
                            week.overallStatus === 'excellent' ? 'text-emerald-600' :
                            week.overallStatus === 'critical' ? 'text-red-600' :
                            week.overallStatus === 'warning' ? 'text-amber-600' :
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {Math.round((week.cost.average + week.stock.average) / 2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simplified Trend Visualization */}
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                      Tendances Hebdomadaires
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Évolution des performances par semaine
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-violet-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Budget</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-cyan-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Stock</span>
                    </div>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getWeeklyTrendChart()} 
                  style={{ height: '280px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>

              {/* AI Recommendations Section */}
              {monthlyAnalysis.recommendations.length > 0 && (
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-700/30' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Recommandations IA
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Basées sur l'analyse des tendances budgétaires et de stock détectées
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {monthlyAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${
                        isDark ? 'bg-slate-800/40 border-slate-600/30' : 'bg-white/80 border-slate-200'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            rec.priority === 'high' ? 'bg-red-500 text-white' :
                            rec.priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {rec.priority === 'high' ? '!' : rec.priority === 'medium' ? '~' : '✓'}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {rec.title}
                            </h4>
                            <p className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {rec.description}
                            </p>
                            <div className={`text-xs italic ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                              Impact attendu: {rec.impact}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'charts' && (
            <div className="h-full overflow-y-auto p-6 space-y-6">
              
              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Trend Chart */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Tendances Hebdomadaires
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Évolution budget et stock par semaine
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getWeeklyTrendChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Radar Chart */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Analyse Multidimensionnelle
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Performance globale en radar
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getPerformanceRadarChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>

              {/* Secondary Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Cost Distribution */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Répartition des Coûts
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Distribution par catégorie
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getCostDistributionChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Performance Summary Card */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Métriques Résumées
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Statistiques clés du mois
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Performance Budget',
                        value: `${monthlyAnalysis.monthlyPerformance.cost}%`,
                        color: 'violet',
                        progress: monthlyAnalysis.monthlyPerformance.cost
                      },
                      {
                        label: 'Gestion Stock',
                        value: `${monthlyAnalysis.monthlyPerformance.stock}%`,
                        color: 'cyan',
                        progress: monthlyAnalysis.monthlyPerformance.stock
                      },
                      {
                        label: 'Variance Budgétaire',
                        value: `${monthlyAnalysis.statistics.totalVariance.toLocaleString()} DT`,
                        color: monthlyAnalysis.statistics.totalVariance > 0 ? 'red' : 'green',
                        progress: Math.abs(monthlyAnalysis.statistics.totalVariance) / Math.max(monthlyAnalysis.statistics.totalBudgeted, 1) * 100
                      },
                      {
                        label: 'Semaines Excellentes',
                        value: `${monthlyAnalysis.statistics.excellentWeeks}/${monthlyAnalysis.statistics.weeksAnalyzed}`,
                        color: 'emerald',
                        progress: (monthlyAnalysis.statistics.excellentWeeks / Math.max(monthlyAnalysis.statistics.weeksAnalyzed, 1)) * 100
                      }
                    ].map((metric, index) => (
                      <div key={index} className={`p-4 rounded-xl ${
                        isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {metric.label}
                          </span>
                          <span className={`text-lg font-bold ${getPerformanceColor(metric.progress)}`}>
                            {metric.value}
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              metric.color === 'violet' ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
                              metric.color === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                              metric.color === 'red' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                              metric.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              'bg-gradient-to-r from-emerald-500 to-green-500'
                            }`}
                            style={{ width: `${Math.min(Math.max(metric.progress, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'weekly' && (
            <div className="h-full overflow-y-auto p-6 space-y-8">
              
              {/* Elegant Week Selector */}
              <div>
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Analyse Hebdomadaire Détaillée
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Sélectionnez une semaine pour explorer les performances en détail
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {monthlyAnalysis.weeklyBreakdown.map((week, index) => {
                    const isSelected = selectedWeekDetail === week.week;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedWeekDetail(isSelected ? null : week.week)}
                        className={`group relative p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                          isSelected ?
                            'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-300/50 shadow-lg' :
                          week.overallStatus === 'excellent' ?
                            isDark ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-emerald-50/50 border-emerald-200/50 hover:bg-emerald-50' :
                          week.overallStatus === 'critical' ?
                            isDark ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' : 'bg-red-50/50 border-red-200/50 hover:bg-red-50' :
                          week.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10' : 'bg-amber-50/50 border-amber-200/50 hover:bg-amber-50' :
                            isDark ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50' : 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-100/50'
                        }`}
                      >
                        {/* Week Number */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                          isSelected ? 
                            'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md' :
                          week.overallStatus === 'excellent' ? 
                            'bg-emerald-500/80 text-white' :
                          week.overallStatus === 'critical' ? 
                            'bg-red-500/80 text-white' :
                          week.overallStatus === 'warning' ? 
                            'bg-amber-500/80 text-white' : 
                            isDark ? 'bg-slate-600/80 text-slate-200' : 'bg-slate-400/80 text-white'
                        }`}>
                          <span className="text-xs font-medium">{week.week}</span>
                        </div>
                        
                        {/* Week Label */}
                        <div className={`text-xs font-medium transition-colors ${
                          isSelected ? 
                            isDark ? 'text-violet-300' : 'text-violet-600' :
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Sem {week.week}
                        </div>
                        
                        {/* Status Indicator */}
                        <div className={`text-xs mt-1 transition-colors ${
                          isSelected ? 
                            isDark ? 'text-slate-400' : 'text-slate-500' :
                          week.detectedEvents.length > 0 ? 
                            isDark ? 'text-amber-400' : 'text-amber-600' :
                            isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {week.detectedEvents.length === 0 ? '✓' : `${week.detectedEvents.length} alertes`}
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-2 border-violet-400/30"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Elegant Week Details */}
              {selectedWeekDetail && (
                <div className="space-y-6">
                  {(() => {
                    const selectedWeek = monthlyAnalysis.weeklyBreakdown.find(w => w.week === selectedWeekDetail);
                    if (!selectedWeek) return null;

                    return (
                      <>
                        {/* Week Overview Card */}
                        <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                          isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                selectedWeek.overallStatus === 'excellent' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                                selectedWeek.overallStatus === 'critical' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                                selectedWeek.overallStatus === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                'bg-gradient-to-br from-slate-500 to-slate-600'
                              }`}>
                                <span className="text-white font-medium">{selectedWeek.week}</span>
                              </div>
                              <div>
                                <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                                  Semaine {selectedWeek.week}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {selectedWeek.startDate} → {selectedWeek.endDate}
                                </p>
                              </div>
                            </div>
                            
                            {/* Refined Status Indicator */}
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                              isDark ? 'bg-slate-700/50' : 'bg-slate-100/70'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                selectedWeek.overallStatus === 'excellent' ? 'bg-emerald-500' :
                                selectedWeek.overallStatus === 'critical' ? 'bg-red-500' :
                                selectedWeek.overallStatus === 'warning' ? 'bg-amber-500' :
                                'bg-slate-500'
                              }`} />
                              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedWeek.overallStatus === 'excellent' ? 'Optimal' :
                                 selectedWeek.overallStatus === 'critical' ? 'Critique' :
                                 selectedWeek.overallStatus === 'warning' ? 'Attention' :
                                 'Standard'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { 
                              title: 'Budget', 
                              value: selectedWeek.cost.average, 
                              icon: Wallet, 
                              color: 'violet',
                              subtitle: 'Performance Budgétaire',
                              details: `${selectedWeek.cost.totalCost.toLocaleString()} DT / ${selectedWeek.cost.budgetedCost.toLocaleString()} DT`
                            },
                            { 
                              title: 'Stock', 
                              value: selectedWeek.stock.average, 
                              icon: Package, 
                              color: 'cyan',
                              subtitle: 'Gestion des Stocks',
                              details: `${selectedWeek.stock.totalIssues} problèmes détectés`
                            }
                          ].map((metric, index) => (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                              isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                            }`}>
                              <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  metric.color === 'violet' ? 'bg-violet-500/15 text-violet-600' : 'bg-cyan-500/15 text-cyan-600'
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
                              
                              <div className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {metric.details}
                              </div>
                              
                              <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-slate-700/50' : 'bg-slate-200/50'} overflow-hidden`}>
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    metric.value >= 90 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                    metric.value >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                    metric.value >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                    'bg-gradient-to-r from-red-500 to-pink-500'
                                  }`}
                                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Alerts & Detections */}
                        {selectedWeek.detectedEvents.length > 0 && (
                          <div className={`p-6 rounded-2xl border ${
                            isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                          }`}>
                            <div className="flex items-center space-x-3 mb-5">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Alertes de la Semaine
                                </h4>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {selectedWeek.detectedEvents.length} détection{selectedWeek.detectedEvents.length > 1 ? 's' : ''} nécessitant votre attention
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {selectedWeek.detectedEvents.map((detection, idx) => (
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
                                        Catégorie: {detection.category}
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

        {/* Enhanced Footer */}
        <div className={`px-8 py-4 border-t backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/70 border-slate-200'} rounded-b-3xl`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPerformanceColor(monthlyAnalysis.monthlyPerformance.overall).replace('text-', 'bg-')}`}></div>
                <span className={`text-sm font-semibold ${getPerformanceColor(monthlyAnalysis.monthlyPerformance.overall)}`}>
                  {monthlyAnalysis.monthlyPerformance.overall}% Performance Globale
                </span>
              </div>
              
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {monthlyAnalysis.statistics.excellentWeeks} semaines excellentes • {monthlyAnalysis.statistics.criticalIssues} critiques
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToPDF}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm transition-all duration-200 ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Exporter PDF</span>
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

export default WarehouseMonthlyReport;