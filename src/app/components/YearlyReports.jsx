import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  FlaskConical,
  Shield,
  Factory,
  Package,
  Users,
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
  Brain,
  Lightbulb,
  Search,
  Zap,
  AlertCircle,
  Star,
  Award,
  PieChart,
  LineChart,
  BarChart,
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
  Euro,
  Calculator,
  Wallet,
  DollarSign,
  Trash2,
  List
} from 'lucide-react';
    import { useKPIData } from '../hook/useKPIData';   // ← ADD THIS LINE

// R&D Yearly Report Component
export const RnDYearlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);

  const yearlyAnalysis = useMemo(() => {
    if (!analytics) return null;

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const productDevData = (analytics.product_development_time || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    if (productDevData.length === 0) return null;

    // Group data by quarters
    const quarters = {
      Q1: { months: [0, 1, 2], data: [], name: 'T1' },
      Q2: { months: [3, 4, 5], data: [], name: 'T2' },
      Q3: { months: [6, 7, 8], data: [], name: 'T3' },
      Q4: { months: [9, 10, 11], data: [], name: 'T4' }
    };

    productDevData.forEach(entry => {
      const month = new Date(entry.date).getMonth();
      Object.keys(quarters).forEach(quarter => {
        if (quarters[quarter].months.includes(month)) {
          quarters[quarter].data.push(entry);
        }
      });
    });

    const quarterlyBreakdown = [];
    const allDetections = [];
    const recommendations = [];

    Object.keys(quarters).forEach(quarterKey => {
      const quarter = quarters[quarterKey];
      const quarterAnalysis = {
        quarter: quarterKey,
        quarterName: quarter.name,
        productDev: {
          average: 0,
          entries: quarter.data.length,
          totalProjects: 0,
          completedProjects: 0,
          inProgressProjects: 0,
          overdueProjects: 0,
          issues: []
        },
        detectedEvents: [],
        overallStatus: 'good',
        monthlyBreakdown: []
      };

      if (quarter.data.length > 0) {
        const productDevAvg = quarter.data.reduce((sum, entry) => sum + entry.value, 0) / quarter.data.length;
        quarterAnalysis.productDev.average = Math.round(productDevAvg);

        quarter.data.forEach(entry => {
          if (entry.data && entry.data.stats) {
            quarterAnalysis.productDev.totalProjects += entry.data.stats.total || 0;
            quarterAnalysis.productDev.completedProjects += entry.data.stats.completed || 0;
            quarterAnalysis.productDev.inProgressProjects += entry.data.stats.inProgress || 0;
            quarterAnalysis.productDev.overdueProjects += entry.data.stats.overdue || 0;
          }
        });

        // Group by months within quarter
        const monthlyData = {};
        quarter.data.forEach(entry => {
          const month = new Date(entry.date).getMonth();
          if (!monthlyData[month]) monthlyData[month] = [];
          monthlyData[month].push(entry);
        });

        Object.keys(monthlyData).forEach(month => {
          const monthEntries = monthlyData[month];
          const monthAvg = monthEntries.reduce((sum, entry) => sum + entry.value, 0) / monthEntries.length;
          quarterAnalysis.monthlyBreakdown.push({
            month: parseInt(month),
            monthName: new Date(selectedYear, month, 1).toLocaleDateString('fr-FR', { month: 'long' }),
            average: Math.round(monthAvg),
            entries: monthEntries.length
          });
        });

        // Performance analysis
        if (productDevAvg < 60) {
          const severity = productDevAvg < 40 ? 'critical' : 'warning';
          const detection = {
            type: 'quarterly_performance_degradation',
            severity,
            category: 'Développement Produits',
            title: `Performance ${quarter.name} critique (${Math.round(productDevAvg)}%)`,
            description: `Performance trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Révision stratégique requise' : 'Optimisation nécessaire',
            quarter: quarterKey,
            realData: {
              totalProjects: quarterAnalysis.productDev.totalProjects,
              performanceRate: productDevAvg,
              overdueProjects: quarterAnalysis.productDev.overdueProjects
            }
          };
          allDetections.push(detection);
          quarterAnalysis.detectedEvents.push(detection);
        }

        // Project completion analysis
        if (quarterAnalysis.productDev.totalProjects > 0) {
          const completionRate = (quarterAnalysis.productDev.completedProjects / quarterAnalysis.productDev.totalProjects) * 100;
          if (completionRate < 30) {
            const detection = {
              type: 'quarterly_completion_efficiency',
              severity: completionRate < 15 ? 'critical' : 'warning',
              category: 'Développement Produits',
              title: `Taux de finalisation ${quarter.name} faible (${Math.round(completionRate)}%)`,
              description: `Seulement ${quarterAnalysis.productDev.completedProjects} projets finalisés sur ${quarterAnalysis.productDev.totalProjects}.`,
              impact: 'Révision des processus de développement',
              quarter: quarterKey,
              realData: {
                completionRate,
                completedProjects: quarterAnalysis.productDev.completedProjects,
                totalProjects: quarterAnalysis.productDev.totalProjects
              }
            };
            allDetections.push(detection);
            quarterAnalysis.detectedEvents.push(detection);
          }
        }
      }

      const criticalEvents = quarterAnalysis.detectedEvents.filter(e => e.severity === 'critical').length;
      const warningEvents = quarterAnalysis.detectedEvents.filter(e => e.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        quarterAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        quarterAnalysis.overallStatus = 'warning';
      } else if (quarterAnalysis.productDev.average >= 80) {
        quarterAnalysis.overallStatus = 'excellent';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      productDev: productDevData.length > 0 ? Math.round(productDevData.reduce((sum, entry) => sum + entry.value, 0) / productDevData.length) : 0
    };
    yearlyPerformance.overall = yearlyPerformance.productDev;

    // Generate yearly recommendations
    const generateYearlyRecommendations = () => {
      const recs = [];
      
      const quarterlyIssues = allDetections.filter(d => d.type.includes('quarterly')).length;
      const totalProjects = quarterlyBreakdown.reduce((sum, q) => sum + q.productDev.totalProjects, 0);
      const completedProjects = quarterlyBreakdown.reduce((sum, q) => sum + q.productDev.completedProjects, 0);
      
      if (quarterlyIssues > 2) {
        recs.push({
          type: 'annual_strategy_review',
          priority: 'high',
          title: 'Révision stratégique annuelle R&D',
          description: 'Revoir la stratégie de développement produits avec focus sur l\'efficacité et les délais.',
          impact: 'Amélioration de 35-45% des performances globales'
        });
      }
      
      if (totalProjects > 0 && (completedProjects / totalProjects) < 0.6) {
        recs.push({
          type: 'project_methodology',
          priority: 'medium',
          title: 'Optimiser la méthodologie de gestion de projet',
          description: 'Implémenter des frameworks agiles et améliorer le suivi des projets.',
          impact: 'Augmentation de 25-30% du taux de finalisation'
        });
      }
      
      return recs;
    };

    return {
      year: selectedYear,
      yearlyPerformance,
      quarterlyBreakdown,
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      recommendations: generateYearlyRecommendations(),
      statistics: {
        totalEntries: productDevData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentQuarters: quarterlyBreakdown.filter(q => q.overallStatus === 'excellent').length,
        quartersAnalyzed: quarterlyBreakdown.length,
        totalProjects: quarterlyBreakdown.reduce((sum, q) => sum + q.productDev.totalProjects, 0),
        completedProjects: quarterlyBreakdown.reduce((sum, q) => sum + q.productDev.completedProjects, 0),
        overdueProjects: quarterlyBreakdown.reduce((sum, q) => sum + q.productDev.overdueProjects, 0),
        inProgressProjects: quarterlyBreakdown.reduce((sum, q) => sum + q.productDev.inProgressProjects, 0)
      },
      hasData: productDevData.length > 0
    };
  }, [analytics, selectedYear]);

  if (!yearlyAnalysis || !yearlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-lg rounded-2xl shadow-lg border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-8 text-center">
            <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
              <Calendar className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune Donnée Disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée R&D pour l'année {selectedYear}.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
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
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: yearlyAnalysis.quarterlyBreakdown.map(q => q.quarterName),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Performance Développement',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.productDev.average),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 4 },
        itemStyle: { color: '#3B82F6', borderWidth: 3, borderColor: '#FFFFFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      }
    ]
  });

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport R&D Annuel - ${yearlyAnalysis.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Rapport R&D Annuel - ${yearlyAnalysis.year}</h1>
          <div class="metric">
            <h2>Performance Globale: ${yearlyAnalysis.yearlyPerformance.overall}%</h2>
            <p>Projets totaux: ${yearlyAnalysis.statistics.totalProjects}</p>
            <p>Projets terminés: ${yearlyAnalysis.statistics.completedProjects}</p>
            <p>Projets en retard: ${yearlyAnalysis.statistics.overdueProjects}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.productDev.average,
      quarter.productDev.totalProjects,
      quarter.productDev.completedProjects,
      quarter.productDev.overdueProjects,
      quarter.overallStatus,
      quarter.detectedEvents.length
    ]);
    
    const csvContent = [
      ['Trimestre', 'Performance %', 'Projets Total', 'Terminés', 'En Retard', 'Statut', 'Détections'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_rnd_annuel_${yearlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-lg flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport R&D Annuel - {yearlyAnalysis.year}
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {yearlyAnalysis.statistics.quartersAnalyzed} trimestres • {yearlyAnalysis.statistics.totalEntries} entrées
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Performance
                </div>
                <div className={`text-2xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                  {yearlyAnalysis.yearlyPerformance.overall}%
                </div>
              </div>
              <button 
                onClick={onClose} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-6 py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateYear(-1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Année {yearlyAnalysis.year}
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {yearlyAnalysis.statistics.criticalIssues} critiques
                </div>
              </div>
              
              <button
                onClick={() => navigateYear(1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'overview' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'quarterly' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Trimestriel
                </button>
              </div>
              
              <button
                onClick={exportToPDF}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportToCSV}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'overview' && (
            <div className="h-full p-5 overflow-y-auto">
              {/* Performance Summary */}
              <div className={`p-5 rounded-xl border mb-5 ${
                yearlyAnalysis.yearlyPerformance.overall >= 80 ?
                  isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                yearlyAnalysis.yearlyPerformance.overall >= 60 ?
                  isDark ? 'bg-blue-900/10 border-blue-700/30' : 'bg-blue-50 border-blue-200' :
                  isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      yearlyAnalysis.yearlyPerformance.overall >= 80 ? 'bg-emerald-500' :
                      yearlyAnalysis.yearlyPerformance.overall >= 60 ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-medium mb-1 ${
                        yearlyAnalysis.yearlyPerformance.overall >= 80 ?
                          isDark ? 'text-emerald-200' : 'text-emerald-800' :
                        yearlyAnalysis.yearlyPerformance.overall >= 60 ?
                          isDark ? 'text-blue-200' : 'text-blue-800' :
                          isDark ? 'text-red-200' : 'text-red-800'
                      }`}>
                        Performance Annuelle: {yearlyAnalysis.yearlyPerformance.overall}%
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {yearlyAnalysis.statistics.totalDetections} détections • 
                        <span className="text-red-600 dark:text-red-400 ml-1">{yearlyAnalysis.statistics.criticalIssues}</span> critiques
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                      {yearlyAnalysis.statistics.quartersAnalyzed}
                    </div>
                    <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Trimestres
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-5">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <PlayCircle className="w-4 h-4 text-blue-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Total</h4>
                    </div>
                    <div className={`text-xl font-light ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {yearlyAnalysis.statistics.totalProjects}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      projets
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Terminés</h4>
                    </div>
                    <div className="text-xl font-light text-emerald-600">
                      {yearlyAnalysis.statistics.completedProjects}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      finalisés
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>En cours</h4>
                    </div>
                    <div className="text-xl font-light text-blue-600">
                      {yearlyAnalysis.statistics.inProgressProjects}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      actifs
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>En retard</h4>
                    </div>
                    <div className="text-xl font-light text-red-600">
                      {yearlyAnalysis.statistics.overdueProjects}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      échéances
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarterly Trend Chart */}
              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <LineChart className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Évolution Trimestrielle
                    </h3>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getQuarterlyTrendChart()} 
                  style={{ height: '400px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>

              {/* AI Recommendations */}
              {yearlyAnalysis.recommendations.length > 0 && (
                <div className={`mt-5 p-5 rounded-xl border ${
                  isDark ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-700/30' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Lightbulb className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Recommandations Annuelles
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Basées sur l'analyse des tendances de l'année {yearlyAnalysis.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {yearlyAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
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
                            <p className={`text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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

          {selectedView === 'quarterly' && (
            <div className="h-full p-5 overflow-y-auto">
              <div className="mb-5">
                <h3 className={`text-base font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Sélectionner un Trimestre
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {yearlyAnalysis.quarterlyBreakdown.map((quarter, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuarterDetail(selectedQuarterDetail === quarter.quarter ? null : quarter.quarter)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        selectedQuarterDetail === quarter.quarter ?
                          isDark ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-300' :
                          quarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-green-900/10 border-green-700/30' : 'bg-green-50 border-green-200' :
                          quarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          quarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center mx-auto mb-2 ${getStatusColor(quarter.overallStatus)}`}>
                        <span className="text-white text-sm font-medium">{quarter.quarterName}</span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Trimestre {quarter.quarterName}
                      </div>
                      <div className={`text-xs mt-1 ${getPerformanceColor(quarter.productDev.average)}`}>
                        {quarter.productDev.average}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedQuarterDetail && (
                <div>
                  {(() => {
                    const selectedQuarter = yearlyAnalysis.quarterlyBreakdown.find(q => q.quarter === selectedQuarterDetail);
                    if (!selectedQuarter) return null;

                    return (
                      <div className="space-y-5">
                        <div className={`p-5 rounded-xl border ${
                          selectedQuarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                          selectedQuarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          selectedQuarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-blue-900/10 border-blue-700/30' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(selectedQuarter.overallStatus)}`}>
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Trimestre {selectedQuarter.quarterName} - {yearlyAnalysis.year}
                              </h3>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Performance: {selectedQuarter.productDev.average}% • {selectedQuarter.productDev.entries} entrées
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <FlaskConical className="w-5 h-5 text-blue-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Performance</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${getPerformanceColor(selectedQuarter.productDev.average)}`}>
                              {selectedQuarter.productDev.average}%
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Entrées données</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.productDev.entries}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <PlayCircle className="w-5 h-5 text-blue-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Projets</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {selectedQuarter.productDev.totalProjects}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Actifs</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.productDev.totalProjects}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Terminés</h4>
                            </div>
                            <div className="text-2xl font-light mb-4 text-emerald-600">
                              {selectedQuarter.productDev.completedProjects}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>En cours</span>
                                <span className="font-medium text-blue-600">{selectedQuarter.productDev.inProgressProjects}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>En Retard</h4>
                            </div>
                            <div className="text-2xl font-light mb-4 text-red-600">
                              {selectedQuarter.productDev.overdueProjects}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Échéances</span>
                                <span className="font-medium text-red-600">{selectedQuarter.productDev.overdueProjects}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Monthly Breakdown within Quarter */}
                        {selectedQuarter.monthlyBreakdown.length > 0 && (
                          <div className={`p-5 rounded-xl border ${
                            isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                                <Calendar className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Détail Mensuel
                                </h4>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {selectedQuarter.monthlyBreakdown.map((month, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${
                                  isDark ? 'bg-slate-800/20 border-slate-600/30' : 'bg-slate-50 border-slate-200'
                                }`}>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                      {month.monthName}
                                    </span>
                                  </div>
                                  <div className={`text-lg font-light mb-1 ${getPerformanceColor(month.average)}`}>
                                    {month.average}%
                                  </div>
                                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {month.entries} entrées
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedQuarter.detectedEvents.length > 0 && (
                          <div className={`p-5 rounded-xl border ${
                            isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Détections ({selectedQuarter.detectedEvents.length})
                                </h4>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {selectedQuarter.detectedEvents.map((detection, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${
                                  detection.severity === 'critical' ?
                                    isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200' :
                                    isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'
                                }`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                          detection.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                                        }`}>
                                          {detection.severity === 'critical' ? 'CRITIQUE' : 'ATTENTION'}
                                        </span>
                                        <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                          {detection.category}
                                        </span>
                                      </div>
                                      <h5 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {detection.title}
                                      </h5>
                                      <p className={`text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {detection.description}
                                      </p>
                                      <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Impact: {detection.impact}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 text-xs ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                <Gauge className="w-3 h-3" />
                <span>{yearlyAnalysis.yearlyPerformance.overall}% Performance</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToPDF}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3 h-3 mr-1 inline" /> PDF
              </button>
              
              <button
                onClick={exportToCSV}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 mr-1 inline" /> CSV
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs transition-all"
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

// Warehouses Yearly Report Component
export const WarehousesYearlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);

  const yearlyAnalysis = useMemo(() => {
    if (!analytics) return null;

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const costData = (analytics.cost_per_formulation || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    const inventoryData = (analytics.inventory_turnover || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    if (costData.length === 0 && inventoryData.length === 0) return null;

    // Group data by quarters
    const quarters = {
      Q1: { months: [0, 1, 2], cost: [], inventory: [], name: 'T1' },
      Q2: { months: [3, 4, 5], cost: [], inventory: [], name: 'T2' },
      Q3: { months: [6, 7, 8], cost: [], inventory: [], name: 'T3' },
      Q4: { months: [9, 10, 11], cost: [], inventory: [], name: 'T4' }
    };

    [costData, inventoryData].forEach((dataArray, type) => {
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
          average: 0,
          entries: quarter.cost.length,
          totalCost: 0,
          budgetedCost: 0,
          budgetVariance: 0,
          efficiencyScore: 0
        },
        inventory: {
          average: 0,
          entries: quarter.inventory.length,
          turnoverRate: 0,
          stockLevels: 0,
          optimalStock: 0
        },
        detectedEvents: [],
        overallStatus: 'good'
      };

      // Analyze Cost Performance
      if (quarter.cost.length > 0) {
        const costAvg = quarter.cost.reduce((sum, entry) => sum + entry.value, 0) / quarter.cost.length;
        quarterAnalysis.cost.average = Math.round(costAvg);

        quarter.cost.forEach(entry => {
          if (entry.data && entry.data.stats) {
            quarterAnalysis.cost.totalCost += entry.data.stats.totalCost || 0;
            quarterAnalysis.cost.budgetedCost += entry.data.stats.budgetedCost || 0;
            quarterAnalysis.cost.budgetVariance += entry.data.stats.budgetVariance || 0;
            quarterAnalysis.cost.efficiencyScore += entry.data.stats.efficiencyScore || 0;
          }
        });

        quarterAnalysis.cost.efficiencyScore = Math.round(quarterAnalysis.cost.efficiencyScore / quarter.cost.length);

        if (costAvg < 70) {
          const severity = costAvg < 50 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_cost_inefficiency',
            severity,
            category: 'Gestion Coûts',
            title: `Performance coûts ${quarter.name} critique (${Math.round(costAvg)}%)`,
            description: `Efficacité budgétaire trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Impact financier majeur' : 'Optimisation requise',
            quarter: quarterKey
          });
        }
      }

      // Analyze Inventory Performance
      if (quarter.inventory.length > 0) {
        const inventoryAvg = quarter.inventory.reduce((sum, entry) => sum + entry.value, 0) / quarter.inventory.length;
        quarterAnalysis.inventory.average = Math.round(inventoryAvg);

        quarter.inventory.forEach(entry => {
          if (entry.data && entry.data.stats) {
            quarterAnalysis.inventory.turnoverRate += entry.data.stats.turnoverRate || 0;
            quarterAnalysis.inventory.stockLevels += entry.data.stats.currentStock || 0;
            quarterAnalysis.inventory.optimalStock += entry.data.stats.optimalStock || 0;
          }
        });

        quarterAnalysis.inventory.turnoverRate = Math.round(quarterAnalysis.inventory.turnoverRate / quarter.inventory.length);

        if (inventoryAvg < 70) {
          const severity = inventoryAvg < 50 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_inventory_inefficiency',
            severity,
            category: 'Gestion Inventaire',
            title: `Performance inventaire ${quarter.name} critique (${Math.round(inventoryAvg)}%)`,
            description: `Rotation d'inventaire trimestrielle inefficace.`,
            impact: severity === 'critical' ? 'Coûts de stockage élevés' : 'Optimisation requise',
            quarter: quarterKey
          });
        }
      }

      // Determine status
      const criticalEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'critical').length;
      const warningEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        quarterAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        quarterAnalysis.overallStatus = 'warning';
      } else if (quarterAnalysis.cost.average >= 80 && quarterAnalysis.inventory.average >= 80) {
        quarterAnalysis.overallStatus = 'excellent';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      cost: costData.length > 0 ? Math.round(costData.reduce((sum, entry) => sum + entry.value, 0) / costData.length) : 0,
      inventory: inventoryData.length > 0 ? Math.round(inventoryData.reduce((sum, entry) => sum + entry.value, 0) / inventoryData.length) : 0
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
        totalEntries: costData.length + inventoryData.length,
        costEntries: costData.length,
        inventoryEntries: inventoryData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentQuarters: quarterlyBreakdown.filter(q => q.overallStatus === 'excellent').length,
        quartersAnalyzed: quarterlyBreakdown.length,
        totalCost: quarterlyBreakdown.reduce((sum, q) => sum + q.cost.totalCost, 0),
        totalBudgeted: quarterlyBreakdown.reduce((sum, q) => sum + q.cost.budgetedCost, 0),
        averageTurnover: quarterlyBreakdown.reduce((sum, q) => sum + q.inventory.turnoverRate, 0) / quarterlyBreakdown.length
      },
      hasData: costData.length > 0 || inventoryData.length > 0
    };
  }, [analytics, selectedYear]);

  if (!yearlyAnalysis || !yearlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-lg rounded-2xl shadow-lg border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-8 text-center">
            <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
              <Calendar className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune Donnée Disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée logistique pour l'année {selectedYear}.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors text-sm"
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
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' }
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
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Performance Coûts',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.cost.average),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 4 },
        itemStyle: { color: '#8B5CF6', borderWidth: 3, borderColor: '#FFFFFF' }
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

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Logistique Annuel - ${yearlyAnalysis.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Rapport Logistique Annuel - ${yearlyAnalysis.year}</h1>
          <div class="metric">
            <h2>Performance Globale: ${yearlyAnalysis.yearlyPerformance.overall}%</h2>
            <p>Performance Coûts: ${yearlyAnalysis.yearlyPerformance.cost}%</p>
            <p>Performance Inventaire: ${yearlyAnalysis.yearlyPerformance.inventory}%</p>
            <p>Coût total: ${yearlyAnalysis.statistics.totalCost.toLocaleString()}€</p>
            <p>Budget total: ${yearlyAnalysis.statistics.totalBudgeted.toLocaleString()}€</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.cost.average,
      quarter.inventory.average,
      quarter.cost.totalCost,
      quarter.cost.budgetedCost,
      quarter.inventory.turnoverRate,
      quarter.overallStatus
    ]);
    
    const csvContent = [
      ['Trimestre', 'Coûts %', 'Inventaire %', 'Coût Total', 'Budget', 'Rotation', 'Statut'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_logistique_annuel_${yearlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-lg flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Logistique Annuel - {yearlyAnalysis.year}
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {yearlyAnalysis.statistics.quartersAnalyzed} trimestres • {yearlyAnalysis.statistics.totalEntries} entrées
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Performance
                </div>
                <div className={`text-2xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                  {yearlyAnalysis.yearlyPerformance.overall}%
                </div>
              </div>
              <button 
                onClick={onClose} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-6 py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateYear(-1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Année {yearlyAnalysis.year}
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                  {yearlyAnalysis.statistics.criticalIssues} critiques
                </div>
              </div>
              
              <button
                onClick={() => navigateYear(1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'overview' 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'quarterly' 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Trimestriel
                </button>
              </div>
              
              <button
                onClick={exportToPDF}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportToCSV}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'overview' && (
            <div className="h-full p-5 overflow-y-auto">
              {/* Performance Summary */}
              <div className={`p-5 rounded-xl border mb-5 ${
                yearlyAnalysis.yearlyPerformance.overall >= 80 ?
                  isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                yearlyAnalysis.yearlyPerformance.overall >= 60 ?
                  isDark ? 'bg-violet-900/10 border-violet-700/30' : 'bg-violet-50 border-violet-200' :
                  isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      yearlyAnalysis.yearlyPerformance.overall >= 80 ? 'bg-emerald-500' :
                      yearlyAnalysis.yearlyPerformance.overall >= 60 ? 'bg-violet-500' : 'bg-red-500'
                    }`}>
                      <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-medium mb-1 ${
                        yearlyAnalysis.yearlyPerformance.overall >= 80 ?
                          isDark ? 'text-emerald-200' : 'text-emerald-800' :
                        yearlyAnalysis.yearlyPerformance.overall >= 60 ?
                          isDark ? 'text-violet-200' : 'text-violet-800' :
                          isDark ? 'text-red-200' : 'text-red-800'
                      }`}>
                        Performance Annuelle: {yearlyAnalysis.yearlyPerformance.overall}%
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {yearlyAnalysis.statistics.totalDetections} détections • 
                        <span className="text-red-600 dark:text-red-400 ml-1">{yearlyAnalysis.statistics.criticalIssues}</span> critiques
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                      {yearlyAnalysis.statistics.quartersAnalyzed}
                    </div>
                    <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Trimestres
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-5">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Euro className="w-4 h-4 text-violet-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Coûts</h4>
                    </div>
                    <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.cost)}`}>
                      {yearlyAnalysis.yearlyPerformance.cost}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {yearlyAnalysis.statistics.totalCost.toLocaleString()}€
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-cyan-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Inventaire</h4>
                    </div>
                    <div className="text-xl font-light text-cyan-600">
                      {yearlyAnalysis.yearlyPerformance.inventory}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      rotation {Math.round(yearlyAnalysis.statistics.averageTurnover)}x
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Budget</h4>
                    </div>
                    <div className="text-xl font-light text-green-600">
                      {yearlyAnalysis.statistics.totalBudgeted.toLocaleString()}€
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      alloué
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Entrées</h4>
                    </div>
                    <div className="text-xl font-light text-purple-600">
                      {yearlyAnalysis.statistics.totalEntries}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      mesures
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarterly Trend Chart */}
              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <LineChart className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Évolution Trimestrielle
                    </h3>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getQuarterlyTrendChart()} 
                  style={{ height: '400px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </div>
          )}

          {selectedView === 'quarterly' && (
            <div className="h-full p-5 overflow-y-auto">
              <div className="mb-5">
                <h3 className={`text-base font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Sélectionner un Trimestre
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {yearlyAnalysis.quarterlyBreakdown.map((quarter, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuarterDetail(selectedQuarterDetail === quarter.quarter ? null : quarter.quarter)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        selectedQuarterDetail === quarter.quarter ?
                          isDark ? 'bg-violet-900/20 border-violet-600' : 'bg-violet-50 border-violet-300' :
                          quarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-green-900/10 border-green-700/30' : 'bg-green-50 border-green-200' :
                          quarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          quarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center mx-auto mb-2 ${getStatusColor(quarter.overallStatus)}`}>
                        <span className="text-white text-sm font-medium">{quarter.quarterName}</span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Trimestre {quarter.quarterName}
                      </div>
                      <div className={`text-xs mt-1 ${getPerformanceColor((quarter.cost.average + quarter.inventory.average) / 2)}`}>
                        {Math.round((quarter.cost.average + quarter.inventory.average) / 2)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedQuarterDetail && (
                <div>
                  {(() => {
                    const selectedQuarter = yearlyAnalysis.quarterlyBreakdown.find(q => q.quarter === selectedQuarterDetail);
                    if (!selectedQuarter) return null;

                    return (
                      <div className="space-y-5">
                        <div className={`p-5 rounded-xl border ${
                          selectedQuarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                          selectedQuarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          selectedQuarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-violet-900/10 border-violet-700/30' : 'bg-violet-50 border-violet-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(selectedQuarter.overallStatus)}`}>
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Trimestre {selectedQuarter.quarterName} - {yearlyAnalysis.year}
                              </h3>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Coûts: {selectedQuarter.cost.average}% • Inventaire: {selectedQuarter.inventory.average}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <Euro className="w-5 h-5 text-violet-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Coûts</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${getPerformanceColor(selectedQuarter.cost.average)}`}>
                              {selectedQuarter.cost.average}%
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Coût total</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.cost.totalCost.toLocaleString()}€</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Budget</span>
                                <span className="font-medium text-green-600">{selectedQuarter.cost.budgetedCost.toLocaleString()}€</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <Package className="w-5 h-5 text-cyan-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventaire</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${getPerformanceColor(selectedQuarter.inventory.average)}`}>
                              {selectedQuarter.inventory.average}%
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Rotation</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.inventory.turnoverRate}x</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Mesures</span>
                                <span className="font-medium text-cyan-600">{selectedQuarter.inventory.entries}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 text-xs ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                <Gauge className="w-3 h-3" />
                <span>{yearlyAnalysis.yearlyPerformance.overall}% Performance</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToPDF}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3 h-3 mr-1 inline" /> PDF
              </button>
              
              <button
                onClick={exportToCSV}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 mr-1 inline" /> CSV
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs transition-all"
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
// Team Yearly Report Component
export const TeamYearlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);

  const yearlyAnalysis = useMemo(() => {
    if (!analytics) return null;

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const attendanceData = (analytics.team_productivity_attendance || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    const safetyData = (analytics.safety_incidents || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    const efficiencyData = (analytics.operator_efficiency || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    if (attendanceData.length === 0 && safetyData.length === 0 && efficiencyData.length === 0) {
      return null;
    }

    // Group data by quarters
    const quarters = {
      Q1: { months: [0, 1, 2], attendance: [], safety: [], efficiency: [], name: 'T1' },
      Q2: { months: [3, 4, 5], attendance: [], safety: [], efficiency: [], name: 'T2' },
      Q3: { months: [6, 7, 8], attendance: [], safety: [], efficiency: [], name: 'T3' },
      Q4: { months: [9, 10, 11], attendance: [], safety: [], efficiency: [], name: 'T4' }
    };

    [attendanceData, safetyData, efficiencyData].forEach((dataArray, type) => {
      const typeKey = ['attendance', 'safety', 'efficiency'][type];
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
        attendance: {
          average: 0,
          entries: quarter.attendance.length,
          totalEmployees: 0,
          presentEmployees: 0
        },
        safety: {
          average: 100,
          entries: quarter.safety.length,
          totalIncidents: 0,
          criticalIncidents: 0
        },
        efficiency: {
          average: 0,
          entries: quarter.efficiency.length,
          totalTasks: 0,
          completedTasks: 0,
          operators: 0
        },
        detectedEvents: [],
        overallStatus: 'good'
      };

      // Analyze attendance
      if (quarter.attendance.length > 0) {
        const attendanceAvg = quarter.attendance.reduce((sum, entry) => sum + entry.value, 0) / quarter.attendance.length;
        quarterAnalysis.attendance.average = Math.round(attendanceAvg);

        quarter.attendance.forEach(entry => {
          if (entry.data?.employees) {
            quarterAnalysis.attendance.totalEmployees += entry.data.employees.length;
            quarterAnalysis.attendance.presentEmployees += entry.data.employees.filter(emp => emp.workHours > 0).length;
          }
        });

        if (attendanceAvg < 75) {
          const severity = attendanceAvg < 60 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_attendance_degradation',
            severity,
            category: 'Productivité Équipe',
            title: `Productivité ${quarter.name} faible (${Math.round(attendanceAvg)}%)`,
            description: `Performance d'équipe trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Impact majeur sur la production' : 'Optimisation requise',
            quarter: quarterKey
          });
        }
      }

      // Analyze safety
      if (quarter.safety.length > 0) {
        const safetyAvg = quarter.safety.reduce((sum, entry) => sum + entry.value, 0) / quarter.safety.length;
        quarterAnalysis.safety.average = Math.round(safetyAvg);

        quarter.safety.forEach(entry => {
          if (entry.data) {
            quarterAnalysis.safety.totalIncidents += entry.data.totalIncidents || 0;
            if (entry.data.incidents) {
              quarterAnalysis.safety.criticalIncidents += entry.data.incidents.filter(inc => inc.severity === 'critical').length;
            }
          }
        });

        if (safetyAvg < 85) {
          const severity = safetyAvg < 70 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_safety_degradation',
            severity,
            category: 'Sécurité Workplace',
            title: `Score sécurité ${quarter.name} dégradé (${Math.round(safetyAvg)}%)`,
            description: `${quarterAnalysis.safety.totalIncidents} incidents détectés avec ${quarterAnalysis.safety.criticalIncidents} critiques.`,
            impact: severity === 'critical' ? 'Risque sécuritaire élevé' : 'Surveillance renforcée requise',
            quarter: quarterKey
          });
        }
      }

      // Analyze efficiency
      if (quarter.efficiency.length > 0) {
        const efficiencyAvg = quarter.efficiency.reduce((sum, entry) => sum + entry.value, 0) / quarter.efficiency.length;
        quarterAnalysis.efficiency.average = Math.round(efficiencyAvg);

        quarter.efficiency.forEach(entry => {
          if (entry.data?.employees) {
            quarterAnalysis.efficiency.operators += entry.data.employees.length;
            entry.data.employees.forEach(emp => {
              quarterAnalysis.efficiency.totalTasks += emp.tasks?.length || 0;
              quarterAnalysis.efficiency.completedTasks += emp.tasks?.filter(t => t.completed).length || 0;
            });
          }
        });

        if (efficiencyAvg < 70) {
          const severity = efficiencyAvg < 50 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_efficiency_loss',
            severity,
            category: 'Efficacité Opérationnelle',
            title: `Efficacité ${quarter.name} faible (${Math.round(efficiencyAvg)}%)`,
            description: `${quarterAnalysis.efficiency.completedTasks}/${quarterAnalysis.efficiency.totalTasks} tâches accomplies.`,
            impact: severity === 'critical' ? 'Perte de productivité majeure' : 'Optimisation des processus requise',
            quarter: quarterKey
          });
        }
      }

      // Determine status
      const criticalEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'critical').length;
      const warningEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        quarterAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        quarterAnalysis.overallStatus = 'warning';
      } else if (quarterAnalysis.attendance.average >= 90 && quarterAnalysis.safety.average >= 95 && quarterAnalysis.efficiency.average >= 85) {
        quarterAnalysis.overallStatus = 'excellent';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      attendance: attendanceData.length > 0 ? Math.round(attendanceData.reduce((sum, entry) => sum + entry.value, 0) / attendanceData.length) : 0,
      safety: safetyData.length > 0 ? Math.round(safetyData.reduce((sum, entry) => sum + entry.value, 0) / safetyData.length) : 100,
      efficiency: efficiencyData.length > 0 ? Math.round(efficiencyData.reduce((sum, entry) => sum + entry.value, 0) / efficiencyData.length) : 0
    };
    yearlyPerformance.overall = Math.round((yearlyPerformance.attendance + yearlyPerformance.safety + yearlyPerformance.efficiency) / 3);

    return {
      year: selectedYear,
      yearlyPerformance,
      quarterlyBreakdown,
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      statistics: {
        totalEntries: attendanceData.length + safetyData.length + efficiencyData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentQuarters: quarterlyBreakdown.filter(q => q.overallStatus === 'excellent').length,
        quartersAnalyzed: quarterlyBreakdown.length,
        totalEmployees: quarterlyBreakdown.reduce((sum, q) => Math.max(sum, q.attendance.totalEmployees), 0),
        totalIncidents: quarterlyBreakdown.reduce((sum, q) => sum + q.safety.totalIncidents, 0),
        totalTasks: quarterlyBreakdown.reduce((sum, q) => sum + q.efficiency.totalTasks, 0),
        completedTasks: quarterlyBreakdown.reduce((sum, q) => sum + q.efficiency.completedTasks, 0)
      },
      hasData: attendanceData.length > 0 || safetyData.length > 0 || efficiencyData.length > 0
    };
  }, [analytics, selectedYear]);

  if (!yearlyAnalysis || !yearlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-xl border shadow-2xl ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="text-center">
            <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée disponible
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée d'équipe trouvée pour l'année {selectedYear}.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' }
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
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Productivité',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.attendance.average),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 4 },
        itemStyle: { color: '#3B82F6', borderWidth: 3, borderColor: '#FFFFFF' }
      },
      {
        name: 'Sécurité',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.safety.average),
        smooth: true,
        lineStyle: { color: '#10B981', width: 4 },
        itemStyle: { color: '#10B981', borderWidth: 3, borderColor: '#FFFFFF' }
      },
      {
        name: 'Efficacité',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.efficiency.average),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 4 },
        itemStyle: { color: '#8B5CF6', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Équipe Annuel - ${yearlyAnalysis.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Rapport Équipe Annuel - ${yearlyAnalysis.year}</h1>
          <div class="metric">
            <h2>Performance Globale: ${yearlyAnalysis.yearlyPerformance.overall}%</h2>
            <p>Productivité: ${yearlyAnalysis.yearlyPerformance.attendance}%</p>
            <p>Sécurité: ${yearlyAnalysis.yearlyPerformance.safety}%</p>
            <p>Efficacité: ${yearlyAnalysis.yearlyPerformance.efficiency}%</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.attendance.average,
      quarter.safety.average,
      quarter.efficiency.average,
      quarter.overallStatus,
      quarter.detectedEvents?.length || 0
    ]);
    
    const csvContent = [
      ['Trimestre', 'Productivité', 'Sécurité', 'Efficacité', 'Statut', 'Détections'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_equipe_annuel_${yearlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getOverallStatus = () => {
    const score = yearlyAnalysis.yearlyPerformance.overall;
    if (score >= 90) return { status: 'excellent', color: 'green', text: 'Excellent', icon: CheckCircle };
    if (score >= 75) return { status: 'good', color: 'blue', text: 'Bon', icon: Activity };
    return { status: 'needs-attention', color: 'red', text: 'Amélioration Nécessaire', icon: AlertTriangle };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-6xl h-[85vh] flex flex-col rounded-xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Équipe Annuel - {yearlyAnalysis.year}
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {yearlyAnalysis.statistics.quartersAnalyzed} trimestres • {yearlyAnalysis.statistics.totalEntries} entrées
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Performance
                </div>
                <div className={`text-2xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                  {yearlyAnalysis.yearlyPerformance.overall}%
                </div>
              </div>
              <button 
                onClick={onClose} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-6 py-3 border-b flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateYear(-1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Année {yearlyAnalysis.year}
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                  {yearlyAnalysis.statistics.criticalIssues} critiques
                </div>
              </div>
              
              <button
                onClick={() => navigateYear(1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'overview' 
                      ? 'bg-pink-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'quarterly' 
                      ? 'bg-pink-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Trimestriel
                </button>
              </div>
              
              <button
                onClick={exportToPDF}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportToCSV}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Flex grow to take remaining space */}
        <div className="flex-1 min-h-0">
          {selectedView === 'overview' && (
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-4 pb-6">
                {/* Overall Status */}
                <div className={`p-4 rounded-xl border ${
                  overallStatus.color === 'green' ?
                    isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                  overallStatus.color === 'blue' ?
                    isDark ? 'bg-blue-900/10 border-blue-700/30' : 'bg-blue-50 border-blue-200' :
                    isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        overallStatus.color === 'green' ? 'bg-emerald-600' :
                        overallStatus.color === 'blue' ? 'bg-blue-600' : 'bg-red-600'
                      }`}>
                        <StatusIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-medium mb-1 ${
                          overallStatus.color === 'green' ? 
                            isDark ? 'text-emerald-200' : 'text-emerald-800' :
                          overallStatus.color === 'blue' ? 
                            isDark ? 'text-blue-200' : 'text-blue-800' :
                            isDark ? 'text-red-200' : 'text-red-800'
                        }`}>
                          Performance Annuelle: {overallStatus.text}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Score global: {yearlyAnalysis.yearlyPerformance.overall}% • {yearlyAnalysis.statistics.totalEmployees} employés • {yearlyAnalysis.statistics.totalIncidents} incidents
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        overallStatus.color === 'green' ? 'text-emerald-600' :
                        overallStatus.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {yearlyAnalysis.statistics.quartersAnalyzed}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Trimestres
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Productivité</h4>
                      </div>
                      <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.attendance)}`}>
                        {yearlyAnalysis.yearlyPerformance.attendance}%
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        équipe
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Sécurité</h4>
                      </div>
                      <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.safety)}`}>
                        {yearlyAnalysis.yearlyPerformance.safety}%
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        score
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Efficacité</h4>
                      </div>
                      <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.efficiency)}`}>
                        {yearlyAnalysis.yearlyPerformance.efficiency}%
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        opérationnelle
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarterly Trend Chart */}
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                      <LineChart className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Évolution Trimestrielle
                      </h3>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getQuarterlyTrendChart()} 
                    style={{ height: '350px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedView === 'quarterly' && (
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-4 pb-6">
                <div>
                  <h3 className={`text-base font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Sélectionner un Trimestre
                  </h3>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {yearlyAnalysis.quarterlyBreakdown.map((quarter, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedQuarterDetail(selectedQuarterDetail === quarter.quarter ? null : quarter.quarter)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedQuarterDetail === quarter.quarter ?
                            isDark ? 'bg-pink-900/20 border-pink-600' : 'bg-pink-50 border-pink-300' :
                            quarter.overallStatus === 'excellent' ?
                              isDark ? 'bg-green-900/10 border-green-700/30' : 'bg-green-50 border-green-200' :
                            quarter.overallStatus === 'critical' ?
                              isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                            quarter.overallStatus === 'warning' ?
                              isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                              isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center mx-auto mb-1 ${getStatusColor(quarter.overallStatus)}`}>
                          <span className="text-white text-xs font-medium">{quarter.quarterName}</span>
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Trimestre {quarter.quarterName}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedQuarterDetail && (
                  <div>
                    {(() => {
                      const selectedQuarter = yearlyAnalysis.quarterlyBreakdown.find(q => q.quarter === selectedQuarterDetail);
                      if (!selectedQuarter) return null;

                      return (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-xl border ${
                            selectedQuarter.overallStatus === 'excellent' ?
                              isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                            selectedQuarter.overallStatus === 'critical' ?
                              isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                            selectedQuarter.overallStatus === 'warning' ?
                              isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                              isDark ? 'bg-pink-900/10 border-pink-700/30' : 'bg-pink-50 border-pink-200'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(selectedQuarter.overallStatus)}`}>
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Trimestre {selectedQuarter.quarterName} - {yearlyAnalysis.year}
                                </h3>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  Productivité: {selectedQuarter.attendance.average}% • Sécurité: {selectedQuarter.safety.average}% • Efficacité: {selectedQuarter.efficiency.average}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                              <div className="flex items-center space-x-3 mb-3">
                                <Users className="w-4 h-4 text-blue-500" />
                                <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Productivité</h4>
                              </div>
                              <div className={`text-xl font-light mb-3 ${getPerformanceColor(selectedQuarter.attendance.average)}`}>
                                {selectedQuarter.attendance.average}%
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Employés totaux</span>
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.attendance.totalEmployees}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Présents</span>
                                  <span className="font-medium text-emerald-600">{selectedQuarter.attendance.presentEmployees}</span>
                                </div>
                              </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                              <div className="flex items-center space-x-3 mb-3">
                                <Shield className="w-4 h-4 text-green-500" />
                                <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Sécurité</h4>
                              </div>
                              <div className={`text-xl font-light mb-3 ${getPerformanceColor(selectedQuarter.safety.average)}`}>
                                {selectedQuarter.safety.average}%
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Incidents totaux</span>
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.safety.totalIncidents}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Critiques</span>
                                  <span className="font-medium text-red-600">{selectedQuarter.safety.criticalIncidents}</span>
                                </div>
                              </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                              <div className="flex items-center space-x-3 mb-3">
                                <Activity className="w-4 h-4 text-purple-500" />
                                <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Efficacité</h4>
                              </div>
                              <div className={`text-xl font-light mb-3 ${getPerformanceColor(selectedQuarter.efficiency.average)}`}>
                                {selectedQuarter.efficiency.average}%
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tâches totales</span>
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.efficiency.totalTasks}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Terminées</span>
                                  <span className="font-medium text-purple-600">{selectedQuarter.efficiency.completedTasks}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className={`px-6 py-3 border-t flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 text-xs ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                <Gauge className="w-3 h-3" />
                <span>{yearlyAnalysis.yearlyPerformance.overall}% Performance</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToPDF}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3 h-3 mr-1 inline" /> PDF
              </button>
              
              <button
                onClick={exportToCSV}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 mr-1 inline" /> CSV
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs transition-all"
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

// Production Yearly Report Component
export const ProductionYearlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);

  const yearlyAnalysis = useMemo(() => {
    if (!analytics) return null;

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const energyData = (analytics.energy_consumption || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    const mixingData = (analytics.mixing_time || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    if (energyData.length === 0 && mixingData.length === 0) return null;

    // Group data by quarters
    const quarters = {
      Q1: { months: [0, 1, 2], energy: [], mixing: [], name: 'T1' },
      Q2: { months: [3, 4, 5], energy: [], mixing: [], name: 'T2' },
      Q3: { months: [6, 7, 8], energy: [], mixing: [], name: 'T3' },
      Q4: { months: [9, 10, 11], energy: [], mixing: [], name: 'T4' }
    };

    [energyData, mixingData].forEach((dataArray, type) => {
      const typeKey = ['energy', 'mixing'][type];
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
        energy: {
          average: 0,
          entries: quarter.energy.length,
          totalConsumption: 0,
          totalCost: 0,
          peakConsumption: 0,
          efficiencyScore: 0
        },
        mixing: {
          average: 0,
          entries: quarter.mixing.length,
          avgTime: 0,
          optimalBatches: 0,
          totalBatches: 0
        },
        detectedEvents: [],
        overallStatus: 'good'
      };

      // Analyze Energy Performance
      if (quarter.energy.length > 0) {
        const energyAvg = quarter.energy.reduce((sum, entry) => sum + entry.value, 0) / quarter.energy.length;
        quarterAnalysis.energy.average = Math.round(energyAvg);

        quarter.energy.forEach(entry => {
          if (entry.data && entry.data.stats) {
            quarterAnalysis.energy.totalConsumption += entry.data.stats.totalConsumption || 0;
            quarterAnalysis.energy.totalCost += entry.data.stats.totalCost || 0;
            quarterAnalysis.energy.peakConsumption = Math.max(quarterAnalysis.energy.peakConsumption, entry.data.stats.peakConsumption || 0);
            quarterAnalysis.energy.efficiencyScore += entry.data.stats.efficiencyScore || 0;
          }
        });

        quarterAnalysis.energy.efficiencyScore = Math.round(quarterAnalysis.energy.efficiencyScore / quarter.energy.length);

        if (energyAvg < 70) {
          const severity = energyAvg < 50 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_energy_inefficiency',
            severity,
            category: 'Efficacité Énergétique',
            title: `Performance énergétique ${quarter.name} critique (${Math.round(energyAvg)}%)`,
            description: `Efficacité énergétique trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Coûts énergétiques élevés' : 'Optimisation nécessaire',
            quarter: quarterKey
          });
        }
      }

      // Analyze Mixing Performance
      if (quarter.mixing.length > 0) {
        const mixingAvg = quarter.mixing.reduce((sum, entry) => sum + entry.value, 0) / quarter.mixing.length;
        quarterAnalysis.mixing.average = Math.round(mixingAvg);

        quarter.mixing.forEach(entry => {
          if (entry.data && entry.data.stats) {
            quarterAnalysis.mixing.avgTime += entry.data.stats.averageTime || 0;
            quarterAnalysis.mixing.optimalBatches += entry.data.stats.optimalBatches || 0;
            quarterAnalysis.mixing.totalBatches += entry.data.stats.totalBatches || 0;
          }
        });

        quarterAnalysis.mixing.avgTime = Math.round(quarterAnalysis.mixing.avgTime / quarter.mixing.length);

        if (mixingAvg < 70) {
          const severity = mixingAvg < 50 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_mixing_inefficiency',
            severity,
            category: 'Efficacité Mélange',
            title: `Performance mélange ${quarter.name} critique (${Math.round(mixingAvg)}%)`,
            description: `Temps de mélange trimestriel excessif.`,
            impact: severity === 'critical' ? 'Retards de production majeurs' : 'Optimisation requise',
            quarter: quarterKey
          });
        }
      }

      // Determine status
      const criticalEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'critical').length;
      const warningEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        quarterAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        quarterAnalysis.overallStatus = 'warning';
      } else if (quarterAnalysis.energy.average >= 80 && quarterAnalysis.mixing.average >= 80) {
        quarterAnalysis.overallStatus = 'excellent';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      energy: energyData.length > 0 ? Math.round(energyData.reduce((sum, entry) => sum + entry.value, 0) / energyData.length) : 0,
      mixing: mixingData.length > 0 ? Math.round(mixingData.reduce((sum, entry) => sum + entry.value, 0) / mixingData.length) : 0
    };
    yearlyPerformance.overall = Math.round((yearlyPerformance.energy + yearlyPerformance.mixing) / 2);

    return {
      year: selectedYear,
      yearlyPerformance,
      quarterlyBreakdown,
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      statistics: {
        totalEntries: energyData.length + mixingData.length,
        energyEntries: energyData.length,
        mixingEntries: mixingData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentQuarters: quarterlyBreakdown.filter(q => q.overallStatus === 'excellent').length,
        quartersAnalyzed: quarterlyBreakdown.length,
        totalEnergyConsumption: quarterlyBreakdown.reduce((sum, q) => sum + q.energy.totalConsumption, 0),
        totalEnergyCost: quarterlyBreakdown.reduce((sum, q) => sum + q.energy.totalCost, 0),
        totalBatches: quarterlyBreakdown.reduce((sum, q) => sum + q.mixing.totalBatches, 0),
        optimalBatches: quarterlyBreakdown.reduce((sum, q) => sum + q.mixing.optimalBatches, 0)
      },
      hasData: energyData.length > 0 || mixingData.length > 0
    };
  }, [analytics, selectedYear]);

  if (!yearlyAnalysis || !yearlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-lg rounded-2xl shadow-lg border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-8 text-center">
            <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
              <Calendar className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune Donnée Disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée de production pour l'année {selectedYear}.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm"
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
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' }
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
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Performance Énergie',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.energy.average),
        smooth: true,
        lineStyle: { color: '#F97316', width: 4 },
        itemStyle: { color: '#F97316', borderWidth: 3, borderColor: '#FFFFFF' }
      },
      {
        name: 'Performance Mélange',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.mixing.average),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 4 },
        itemStyle: { color: '#3B82F6', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Production Annuel - ${yearlyAnalysis.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Rapport Production Annuel - ${yearlyAnalysis.year}</h1>
          <div class="metric">
            <h2>Performance Globale: ${yearlyAnalysis.yearlyPerformance.overall}%</h2>
            <p>Performance Énergie: ${yearlyAnalysis.yearlyPerformance.energy}%</p>
            <p>Performance Mélange: ${yearlyAnalysis.yearlyPerformance.mixing}%</p>
            <p>Consommation totale: ${yearlyAnalysis.statistics.totalEnergyConsumption.toLocaleString()} kWh</p>
            <p>Coût total: ${yearlyAnalysis.statistics.totalEnergyCost.toLocaleString()} TND</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.energy.average,
      quarter.mixing.average,
      quarter.energy.totalConsumption,
      quarter.energy.totalCost,
      quarter.mixing.totalBatches,
      quarter.mixing.optimalBatches,
      quarter.overallStatus
    ]);
    
    const csvContent = [
      ['Trimestre', 'Énergie %', 'Mélange %', 'Consommation kWh', 'Coût TND', 'Total Lots', 'Lots Optimaux', 'Statut'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_production_annuel_${yearlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-lg flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Production Annuel - {yearlyAnalysis.year}
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {yearlyAnalysis.statistics.quartersAnalyzed} trimestres • {yearlyAnalysis.statistics.totalEntries} entrées
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Performance
                </div>
                <div className={`text-2xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                  {yearlyAnalysis.yearlyPerformance.overall}%
                </div>
              </div>
              <button 
                onClick={onClose} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-6 py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateYear(-1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Année {yearlyAnalysis.year}
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  {yearlyAnalysis.statistics.criticalIssues} critiques
                </div>
              </div>
              
              <button
                onClick={() => navigateYear(1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'overview' 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'quarterly' 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Trimestriel
                </button>
              </div>
              
              <button
                onClick={exportToPDF}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportToCSV}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'overview' && (
            <div className="h-full p-5 overflow-y-auto">
              {/* Performance Summary */}
              <div className={`p-5 rounded-xl border mb-5 ${
                yearlyAnalysis.yearlyPerformance.overall >= 80 ?
                  isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                yearlyAnalysis.yearlyPerformance.overall >= 60 ?
                  isDark ? 'bg-orange-900/10 border-orange-700/30' : 'bg-orange-50 border-orange-200' :
                  isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      yearlyAnalysis.yearlyPerformance.overall >= 80 ? 'bg-emerald-500' :
                      yearlyAnalysis.yearlyPerformance.overall >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-medium mb-1 ${
                        yearlyAnalysis.yearlyPerformance.overall >= 80 ?
                          isDark ? 'text-emerald-200' : 'text-emerald-800' :
                        yearlyAnalysis.yearlyPerformance.overall >= 60 ?
                          isDark ? 'text-orange-200' : 'text-orange-800' :
                          isDark ? 'text-red-200' : 'text-red-800'
                      }`}>
                        Performance Annuelle: {yearlyAnalysis.yearlyPerformance.overall}%
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {yearlyAnalysis.statistics.totalDetections} détections • 
                        <span className="text-red-600 dark:text-red-400 ml-1">{yearlyAnalysis.statistics.criticalIssues}</span> critiques
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                      {yearlyAnalysis.statistics.quartersAnalyzed}
                    </div>
                    <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Trimestres
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-5">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Énergie</h4>
                    </div>
                    <div className={`text-xl font-light ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {yearlyAnalysis.yearlyPerformance.energy}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {yearlyAnalysis.statistics.totalEnergyConsumption.toLocaleString()} kWh
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Mélange</h4>
                    </div>
                    <div className="text-xl font-light text-blue-600">
                      {yearlyAnalysis.yearlyPerformance.mixing}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {yearlyAnalysis.statistics.optimalBatches}/{yearlyAnalysis.statistics.totalBatches} optimaux
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calculator className="w-4 h-4 text-green-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Coût</h4>
                    </div>
                    <div className="text-xl font-light text-green-600">
                      {yearlyAnalysis.statistics.totalEnergyCost.toLocaleString()}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      TND
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Entrées</h4>
                    </div>
                    <div className="text-xl font-light text-purple-600">
                      {yearlyAnalysis.statistics.totalEntries}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      mesures
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarterly Trend Chart */}
              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <LineChart className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Évolution Trimestrielle
                    </h3>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getQuarterlyTrendChart()} 
                  style={{ height: '400px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </div>
          )}

          {selectedView === 'quarterly' && (
            <div className="h-full p-5 overflow-y-auto">
              <div className="mb-5">
                <h3 className={`text-base font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Sélectionner un Trimestre
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {yearlyAnalysis.quarterlyBreakdown.map((quarter, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuarterDetail(selectedQuarterDetail === quarter.quarter ? null : quarter.quarter)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        selectedQuarterDetail === quarter.quarter ?
                          isDark ? 'bg-orange-900/20 border-orange-600' : 'bg-orange-50 border-orange-300' :
                          quarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-green-900/10 border-green-700/30' : 'bg-green-50 border-green-200' :
                          quarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          quarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center mx-auto mb-2 ${getStatusColor(quarter.overallStatus)}`}>
                        <span className="text-white text-sm font-medium">{quarter.quarterName}</span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Trimestre {quarter.quarterName}
                      </div>
                      <div className={`text-xs mt-1 ${getPerformanceColor((quarter.energy.average + quarter.mixing.average) / 2)}`}>
                        {Math.round((quarter.energy.average + quarter.mixing.average) / 2)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedQuarterDetail && (
                <div>
                  {(() => {
                    const selectedQuarter = yearlyAnalysis.quarterlyBreakdown.find(q => q.quarter === selectedQuarterDetail);
                    if (!selectedQuarter) return null;

                    return (
                      <div className="space-y-5">
                        <div className={`p-5 rounded-xl border ${
                          selectedQuarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                          selectedQuarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          selectedQuarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-orange-900/10 border-orange-700/30' : 'bg-orange-50 border-orange-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(selectedQuarter.overallStatus)}`}>
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Trimestre {selectedQuarter.quarterName} - {yearlyAnalysis.year}
                              </h3>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Énergie: {selectedQuarter.energy.average}% • Mélange: {selectedQuarter.mixing.average}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <Zap className="w-5 h-5 text-orange-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Énergie</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${getPerformanceColor(selectedQuarter.energy.average)}`}>
                              {selectedQuarter.energy.average}%
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Consommation</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.energy.totalConsumption.toLocaleString()} kWh</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Coût</span>
                                <span className="font-medium text-green-600">{selectedQuarter.energy.totalCost.toLocaleString()} TND</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <Timer className="w-5 h-5 text-blue-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Mélange</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${getPerformanceColor(selectedQuarter.mixing.average)}`}>
                              {selectedQuarter.mixing.average}%
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Temps moyen</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.mixing.avgTime} min</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Lots optimaux</span>
                                <span className="font-medium text-blue-600">{selectedQuarter.mixing.optimalBatches}/{selectedQuarter.mixing.totalBatches}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <Activity className="w-5 h-5 text-purple-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Activité</h4>
                            </div>
                            <div className={`text-2xl font-light mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {selectedQuarter.energy.entries + selectedQuarter.mixing.entries}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Mesures énergie</span>
                                <span className="font-medium text-orange-600">{selectedQuarter.energy.entries}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Mesures mélange</span>
                                <span className="font-medium text-blue-600">{selectedQuarter.mixing.entries}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-5 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <h4 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Problèmes</h4>
                            </div>
                            <div className="text-2xl font-light mb-4 text-red-600">
                              {selectedQuarter.detectedEvents?.length || 0}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Critiques</span>
                                <span className="font-medium text-red-600">{(selectedQuarter.detectedEvents || []).filter(e => e.severity === 'critical').length}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Attention</span>
                                <span className="font-medium text-amber-600">{(selectedQuarter.detectedEvents || []).filter(e => e.severity === 'warning').length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 text-xs ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                <Gauge className="w-3 h-3" />
                <span>{yearlyAnalysis.yearlyPerformance.overall}% Performance</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToPDF}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3 h-3 mr-1 inline" /> PDF
              </button>
              
              <button
                onClick={exportToCSV}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 mr-1 inline" /> CSV
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs transition-all"
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

// Quality Yearly Report Component
export const QualityYearlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);

  const yearlyAnalysis = useMemo(() => {
    if (!analytics) return null;

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const receptionData = (analytics.material_batch_acceptance_rate || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    const wasteData = (analytics.production_waste_rate || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    const inventoryData = (analytics.raw_materials_inventory_list || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= yearEnd;
    });

    if (receptionData.length === 0 && wasteData.length === 0 && inventoryData.length === 0) return null;

    // Group data by quarters
    const quarters = {
      Q1: { months: [0, 1, 2], reception: [], waste: [], inventory: [], name: 'T1' },
      Q2: { months: [3, 4, 5], reception: [], waste: [], inventory: [], name: 'T2' },
      Q3: { months: [6, 7, 8], reception: [], waste: [], inventory: [], name: 'T3' },
      Q4: { months: [9, 10, 11], reception: [], waste: [], inventory: [], name: 'T4' }
    };

    [receptionData, wasteData, inventoryData].forEach((dataArray, type) => {
      const typeKey = ['reception', 'waste', 'inventory'][type];
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
        reception: {
          average: 0,
          entries: quarter.reception.length,
          totalBatches: 0,
          conformeBatches: 0,
          nonConformeBatches: 0,
          suppliers: new Set()
        },
        waste: {
          average: 0,
          entries: quarter.waste.length,
          totalWasted: 0,
          processes: []
        },
        inventory: {
          average: 0,
          entries: quarter.inventory.length,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0
        },
        detectedEvents: [],
        overallStatus: 'good'
      };

      // Analyze reception
      if (quarter.reception.length > 0) {
        const receptionAvg = quarter.reception.reduce((sum, entry) => sum + entry.value, 0) / quarter.reception.length;
        quarterAnalysis.reception.average = Math.round(receptionAvg);

        quarter.reception.forEach(entry => {
          if (entry.data) {
            if (entry.data.batches) {
              quarterAnalysis.reception.totalBatches += entry.data.batches.length;
              quarterAnalysis.reception.conformeBatches += entry.data.batches.filter(b => b.status === 'Conforme').length;
              quarterAnalysis.reception.nonConformeBatches += entry.data.batches.filter(b => b.status === 'Non Conforme').length;
              entry.data.batches.forEach(batch => {
                if (batch.fournisseur) quarterAnalysis.reception.suppliers.add(batch.fournisseur);
              });
            }
            if (entry.data.stats) {
              quarterAnalysis.reception.totalBatches += entry.data.stats.total || 0;
              quarterAnalysis.reception.conformeBatches += entry.data.stats.conforme || 0;
              quarterAnalysis.reception.nonConformeBatches += entry.data.stats.nonConforme || 0;
            }
          }
        });

        if (receptionAvg < 80) {
          const severity = receptionAvg < 60 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_quality_degradation',
            severity,
            category: 'Réception Matières',
            title: `Taux d'acceptation ${quarter.name} critique (${Math.round(receptionAvg)}%)`,
            description: `Performance de réception trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Arrêt potentiel de production' : 'Retards et surcoûts',
            quarter: quarterKey
          });
        }
      }

      // Analyze waste
      if (quarter.waste.length > 0) {
        const wasteAvg = quarter.waste.reduce((sum, entry) => sum + entry.value, 0) / quarter.waste.length;
        quarterAnalysis.waste.average = Math.round(wasteAvg);

        quarter.waste.forEach(entry => {
          if (entry.data) {
            if (entry.data.processes) {
              quarterAnalysis.waste.processes.push(...entry.data.processes);
              quarterAnalysis.waste.totalWasted += entry.data.processes.reduce((sum, proc) => sum + (proc.gaspillage || 0), 0);
            }
            if (entry.data.stats) {
              quarterAnalysis.waste.totalWasted += entry.data.stats.totalGaspille || 0;
            }
          }
        });

        if (wasteAvg < 70) {
          const severity = wasteAvg < 50 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_efficiency_loss',
            severity,
            category: 'Contrôle Gaspillage',
            title: `Efficacité anti-gaspillage ${quarter.name} faible (${Math.round(wasteAvg)}%)`,
            description: `Gaspillage trimestriel excessif détecté.`,
            impact: severity === 'critical' ? 'Pertes importantes' : 'Optimisation requise',
            quarter: quarterKey
          });
        }
      }

      // Analyze inventory
      if (quarter.inventory.length > 0) {
        const inventoryAvg = quarter.inventory.reduce((sum, entry) => sum + entry.value, 0) / quarter.inventory.length;
        quarterAnalysis.inventory.average = Math.round(inventoryAvg);

        quarter.inventory.forEach(entry => {
          if (entry.data) {
            if (entry.data.tests) {
              quarterAnalysis.inventory.totalTests += entry.data.tests.length;
              quarterAnalysis.inventory.passedTests += entry.data.tests.filter(t => t.resultat === 'Réussi').length;
              quarterAnalysis.inventory.failedTests += entry.data.tests.filter(t => t.resultat === 'Échec').length;
            }
            if (entry.data.stats) {
              quarterAnalysis.inventory.totalTests += entry.data.stats.total || 0;
              quarterAnalysis.inventory.passedTests += entry.data.stats.reussis || 0;
              quarterAnalysis.inventory.failedTests += entry.data.stats.echoues || 0;
            }
          }
        });

        if (inventoryAvg < 85) {
          const severity = inventoryAvg < 70 ? 'critical' : 'warning';
          allDetections.push({
            type: 'quarterly_inventory_degradation',
            severity,
            category: 'Qualité Inventaire',
            title: `Qualité inventaire ${quarter.name} dégradée (${Math.round(inventoryAvg)}%)`,
            description: `${quarterAnalysis.inventory.failedTests} tests échoués sur ${quarterAnalysis.inventory.totalTests}.`,
            impact: severity === 'critical' ? 'Risque produits non-conformes' : 'Surveillance renforcée requise',
            quarter: quarterKey
          });
        }
      }

      // Determine status
      const criticalEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'critical').length;
      const warningEvents = allDetections.filter(d => d.quarter === quarterKey && d.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        quarterAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        quarterAnalysis.overallStatus = 'warning';
      } else if (quarterAnalysis.reception.average >= 90 && quarterAnalysis.waste.average >= 80 && quarterAnalysis.inventory.average >= 95) {
        quarterAnalysis.overallStatus = 'excellent';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      reception: receptionData.length > 0 ? Math.round(receptionData.reduce((sum, entry) => sum + entry.value, 0) / receptionData.length) : 0,
      waste: wasteData.length > 0 ? Math.round(wasteData.reduce((sum, entry) => sum + entry.value, 0) / wasteData.length) : 0,
      inventory: inventoryData.length > 0 ? Math.round(inventoryData.reduce((sum, entry) => sum + entry.value, 0) / inventoryData.length) : 0
    };
    yearlyPerformance.overall = Math.round((yearlyPerformance.reception + yearlyPerformance.waste + yearlyPerformance.inventory) / 3);

    return {
      year: selectedYear,
      yearlyPerformance,
      quarterlyBreakdown,
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      statistics: {
        totalEntries: receptionData.length + wasteData.length + inventoryData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentQuarters: quarterlyBreakdown.filter(q => q.overallStatus === 'excellent').length,
        quartersAnalyzed: quarterlyBreakdown.length,
        totalBatches: quarterlyBreakdown.reduce((sum, q) => sum + q.reception.totalBatches, 0),
        conformBatches: quarterlyBreakdown.reduce((sum, q) => sum + q.reception.conformeBatches, 0),
        totalTests: quarterlyBreakdown.reduce((sum, q) => sum + q.inventory.totalTests, 0),
        passedTests: quarterlyBreakdown.reduce((sum, q) => sum + q.inventory.passedTests, 0),
        totalWasted: quarterlyBreakdown.reduce((sum, q) => sum + q.waste.totalWasted, 0)
      },
      hasData: receptionData.length > 0 || wasteData.length > 0 || inventoryData.length > 0
    };
  }, [analytics, selectedYear]);

  if (!yearlyAnalysis || !yearlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-lg rounded-2xl shadow-lg border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-8 text-center">
            <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
              <Calendar className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune Donnée Disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée qualité pour l'année {selectedYear}.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
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
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' }
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
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Réception Matières',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.reception.average),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 4 },
        itemStyle: { color: '#3B82F6', borderWidth: 3, borderColor: '#FFFFFF' }
      },
      {
        name: 'Contrôle Gaspillage',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.waste.average),
        smooth: true,
        lineStyle: { color: '#10B981', width: 4 },
        itemStyle: { color: '#10B981', borderWidth: 3, borderColor: '#FFFFFF' }
      },
      {
        name: 'Qualité Inventaire',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.inventory.average),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 4 },
        itemStyle: { color: '#8B5CF6', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Qualité Annuel - ${yearlyAnalysis.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Rapport Qualité Annuel - ${yearlyAnalysis.year}</h1>
          <div class="metric">
            <h2>Performance Globale: ${yearlyAnalysis.yearlyPerformance.overall}%</h2>
            <p>Réception Matières: ${yearlyAnalysis.yearlyPerformance.reception}%</p>
            <p>Contrôle Gaspillage: ${yearlyAnalysis.yearlyPerformance.waste}%</p>
            <p>Qualité Inventaire: ${yearlyAnalysis.yearlyPerformance.inventory}%</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.reception.average,
      quarter.waste.average,
      quarter.inventory.average,
      quarter.overallStatus
    ]);
    
    const csvContent = [
      ['Trimestre', 'Réception', 'Gaspillage', 'Inventaire', 'Statut'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_qualite_annuel_${yearlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-lg flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Qualité Annuel - {yearlyAnalysis.year}
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {yearlyAnalysis.statistics.quartersAnalyzed} trimestres • {yearlyAnalysis.statistics.totalEntries} entrées
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Performance
                </div>
                <div className={`text-2xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                  {yearlyAnalysis.yearlyPerformance.overall}%
                </div>
              </div>
              <button 
                onClick={onClose} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-6 py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateYear(-1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Année {yearlyAnalysis.year}
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {yearlyAnalysis.statistics.criticalIssues} critiques
                </div>
              </div>
              
              <button
                onClick={() => navigateYear(1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'overview' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'quarterly' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Trimestriel
                </button>
              </div>
              
              <button
                onClick={exportToPDF}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportToCSV}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'overview' && (
            <div className="h-full p-5 overflow-y-auto">
              {/* Performance Summary */}
              <div className={`p-5 rounded-xl border mb-5 ${
                yearlyAnalysis.yearlyPerformance.overall >= 85 ?
                  isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                yearlyAnalysis.yearlyPerformance.overall >= 70 ?
                  isDark ? 'bg-indigo-900/10 border-indigo-700/30' : 'bg-indigo-50 border-indigo-200' :
                  isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      yearlyAnalysis.yearlyPerformance.overall >= 85 ? 'bg-emerald-500' :
                      yearlyAnalysis.yearlyPerformance.overall >= 70 ? 'bg-indigo-500' : 'bg-red-500'
                    }`}>
                      <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-medium mb-1 ${
                        yearlyAnalysis.yearlyPerformance.overall >= 85 ?
                          isDark ? 'text-emerald-200' : 'text-emerald-800' :
                        yearlyAnalysis.yearlyPerformance.overall >= 70 ?
                          isDark ? 'text-indigo-200' : 'text-indigo-800' :
                          isDark ? 'text-red-200' : 'text-red-800'
                      }`}>
                        Performance Annuelle: {yearlyAnalysis.yearlyPerformance.overall}%
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {yearlyAnalysis.statistics.totalDetections} détections • 
                        <span className="text-red-600 dark:text-red-400 ml-1">{yearlyAnalysis.statistics.criticalIssues}</span> critiques
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                      {yearlyAnalysis.statistics.quartersAnalyzed}
                    </div>
                    <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Trimestres
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Réception</h4>
                    </div>
                    <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.reception)}`}>
                      {yearlyAnalysis.yearlyPerformance.reception}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {yearlyAnalysis.statistics.conformBatches}/{yearlyAnalysis.statistics.totalBatches} lots
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Trash2 className="w-4 h-4 text-green-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Gaspillage</h4>
                    </div>
                    <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.waste)}`}>
                      {yearlyAnalysis.yearlyPerformance.waste}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {Math.round(yearlyAnalysis.statistics.totalWasted)}kg
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/20' : 'bg-white'} border ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <List className="w-4 h-4 text-purple-500" />
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Inventaire</h4>
                    </div>
                    <div className={`text-xl font-light ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.inventory)}`}>
                      {yearlyAnalysis.yearlyPerformance.inventory}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {yearlyAnalysis.statistics.passedTests}/{yearlyAnalysis.statistics.totalTests} tests
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarterly Trend Chart */}
              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <LineChart className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Évolution Trimestrielle
                    </h3>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getQuarterlyTrendChart()} 
                  style={{ height: '400px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </div>
          )}

          {selectedView === 'quarterly' && (
            <div className="h-full p-5 overflow-y-auto">
              <div className="mb-5">
                <h3 className={`text-base font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Sélectionner un Trimestre
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {yearlyAnalysis.quarterlyBreakdown.map((quarter, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuarterDetail(selectedQuarterDetail === quarter.quarter ? null : quarter.quarter)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        selectedQuarterDetail === quarter.quarter }`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center mx-auto mb-1 ${getStatusColor(quarter.overallStatus)}`}>
                        <span className="text-white text-xs font-medium">{quarter.quarterName}</span>
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Trimestre {quarter.quarterName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedQuarterDetail && (
                <div>
                  {(() => {
                    const selectedQuarter = yearlyAnalysis.quarterlyBreakdown.find(q => q.quarter === selectedQuarterDetail);
                    if (!selectedQuarter) return null;

                    return (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl border ${
                          selectedQuarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' :
                          selectedQuarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-900/10 border-red-700/30' : 'bg-red-50 border-red-200' :
                          selectedQuarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200' :
                            isDark ? 'bg-indigo-900/10 border-indigo-700/30' : 'bg-indigo-50 border-indigo-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(selectedQuarter.overallStatus)}`}>
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Trimestre {selectedQuarter.quarterName} - {yearlyAnalysis.year}
                              </h3>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Réception: {selectedQuarter.reception.average}% • Gaspillage: {selectedQuarter.waste.average}% • Inventaire: {selectedQuarter.inventory.average}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-3">
                              <Package className="w-4 h-4 text-blue-500" />
                              <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Réception</h4>
                            </div>
                            <div className={`text-xl font-light mb-3 ${getPerformanceColor(selectedQuarter.reception.average)}`}>
                              {selectedQuarter.reception.average}%
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Lots totaux</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.reception.totalBatches}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Conformes</span>
                                <span className="font-medium text-emerald-600">{selectedQuarter.reception.conformeBatches}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-3">
                              <AlertTriangle className="w-4 h-4 text-green-500" />
                              <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Gaspillage</h4>
                            </div>
                            <div className={`text-xl font-light mb-3 ${getPerformanceColor(selectedQuarter.waste.average)}`}>
                              {selectedQuarter.waste.average}%
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total gaspillé</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{Math.round(selectedQuarter.waste.totalWasted)}kg</span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center space-x-3 mb-3">
                              <CheckCircle className="w-4 h-4 text-purple-500" />
                              <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventaire</h4>
                            </div>
                            <div className={`text-xl font-light mb-3 ${getPerformanceColor(selectedQuarter.inventory.average)}`}>
                              {selectedQuarter.inventory.average}%
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tests totaux</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQuarter.inventory.totalTests}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Réussis</span>
                                <span className="font-medium text-purple-600">{selectedQuarter.inventory.passedTests}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 text-xs ${getPerformanceColor(yearlyAnalysis.yearlyPerformance.overall)}`}>
                <Gauge className="w-3 h-3" />
                <span>{yearlyAnalysis.yearlyPerformance.overall}% Performance</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {yearlyAnalysis.statistics.excellentQuarters} trimestres excellents
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToPDF}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3 h-3 mr-1 inline" /> PDF
              </button>
              
              <button
                onClick={exportToCSV}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 mr-1 inline" /> CSV
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs transition-all"
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
// Revamped Yearly Reports Component
export const YearlyReports = ({ isDark, onClose }) => {

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { getTeamAnalytics, getRnDAnalytics } = useKPIData();

  const departments = [
    {
      id: 'rnd',
      name: 'R&D et Innovation',
      icon: FlaskConical,
      color: '#6366F1',
      description: 'Développement produits et formulations',
      getAnalytics: getRnDAnalytics
    },
    {
      id: 'team',
      name: 'Gestion d\'Équipe',
      icon: Users,
      color: '#EC4899',
      description: 'Performance équipe et sécurité',
      getAnalytics: getTeamAnalytics
    },
    {
      id: 'production',
      name: 'Production',
      icon: Factory,
      color: '#DC2626',
      description: 'Efficacité énergétique et performance',
      getAnalytics: () => null
    },
    {
      id: 'quality',
      name: 'Contrôle Qualité',
      icon: Shield,
      color: '#059669',
      description: 'Qualité matières et processus',
      getAnalytics: () => null
    },
    {
      id: 'warehouses',
      name: 'Logistique',
      icon: Package,
      color: '#8B5CF6',
      description: 'Coûts et rotation inventaire',
      getAnalytics: () => null
    }
  ];

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
  };

  const handleCloseReport = () => {
    setSelectedDepartment(null);
  };

  const renderSelectedReport = () => {
    if (!selectedDepartment) return null;

    const analytics = selectedDepartment.getAnalytics(selectedDepartment.id);

    switch (selectedDepartment.id) {
      case 'rnd':
        return (
          <RnDYearlyReport
            analytics={analytics}
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'team':
        return (
          <TeamYearlyReport
            analytics={analytics}
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'production':
        return (
          <ProductionYearlyReport
            analytics={analytics}
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'quality':
        return (
          <QualityYearlyReport
            analytics={analytics}
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'warehouses':
        return (
          <WarehousesYearlyReport
            analytics={analytics}
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      default:
        return null;
    }
  };

  if (selectedDepartment) {
    return renderSelectedReport();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-2xl rounded-xl shadow-xl border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Compact Header */}
        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapports Annuels {new Date().getFullYear()}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Choisir un département
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Department Grid */}
        <div className="p-5">
          <div className="space-y-2">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentSelect(dept)}
                className={`w-full group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.01] text-left ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: dept.color }}
                  >
                    <dept.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {dept.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`} />
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {dept.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className={`px-5 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Données {new Date().getFullYear()}
              </span>
            </div>
            <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {departments.length} départements
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};