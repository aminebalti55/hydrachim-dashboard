import React, { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  FlaskConical,
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
  Users,
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
  Package,
  Beaker,
  Sparkles,
  Plus,
  Bookmark,
  MapPin,
  Flame,
  Heart,
  Rocket,
  Code,
  Cpu
} from 'lucide-react';

const RnDMonthlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWeekDetail, setSelectedWeekDetail] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [animatedStats, setAnimatedStats] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoadingAnalytics(true);
      try {
        let data;
        if (typeof analytics === 'function') {
          data = await analytics();
        } else {
          data = analytics;
        }
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setAnalyticsData({ product_development_time: [] });
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    loadAnalyticsData();
  }, [analytics]);

  const monthlyAnalysis = useMemo(() => {
    if (!analyticsData) return null;

    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const productDevData = (analyticsData.product_development_time || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    if (productDevData.length === 0) {
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
    
    productDevData.forEach(entry => {
      const week = getWeekNumber(new Date(entry.date));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          startDate: new Date(entry.date),
          productDev: [],
          detectedEvents: []
        };
      }
      weeklyData[week].productDev.push(entry);
    });

    const weeklyBreakdown = [];
    const allDetections = [];
    const recommendations = [];

    Object.values(weeklyData).forEach(week => {
      const weekAnalysis = {
        week: week.week,
        startDate: week.startDate.toLocaleDateString('fr-FR'),
        endDate: new Date(week.startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        productDev: {
          average: 0,
          entries: week.productDev.length,
          totalProjects: 0,
          completedProjects: 0,
          inProgressProjects: 0,
          overdueProjects: 0,
          issues: []
        },
        detectedEvents: [],
        overallStatus: 'good',
        rawData: {
          productDev: week.productDev
        }
      };

      if (week.productDev.length > 0) {
        const productDevAvg = week.productDev.reduce((sum, entry) => sum + entry.value, 0) / week.productDev.length;
        weekAnalysis.productDev.average = Math.round(productDevAvg);

        week.productDev.forEach(entry => {
          if (entry.data && entry.data.stats) {
            weekAnalysis.productDev.totalProjects += entry.data.stats.total || 0;
            weekAnalysis.productDev.completedProjects += entry.data.stats.completed || 0;
            weekAnalysis.productDev.inProgressProjects += entry.data.stats.inProgress || 0;
            weekAnalysis.productDev.overdueProjects += entry.data.stats.overdue || 0;
          }
        });

        // Performance degradation detection
        if (productDevAvg < 60) {
          const severity = productDevAvg < 40 ? 'critical' : 'warning';
          const detection = {
            type: 'performance_degradation',
            severity,
            category: 'Développement Produits',
            title: `Performance développement critique (${Math.round(productDevAvg)}%)`,
            description: `Performance de développement en dessous des standards avec ${weekAnalysis.productDev.overdueProjects} projets en retard.`,
            impact: severity === 'critical' ? 'Retards majeurs dans le pipeline' : 'Risque de retards',
            week: week.week,
            realData: {
              totalProjects: weekAnalysis.productDev.totalProjects,
              performanceRate: productDevAvg,
              overdueProjects: weekAnalysis.productDev.overdueProjects
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.productDev.issues.push(`${weekAnalysis.productDev.overdueProjects} projets en retard`);
        }

        // Overdue projects detection
        if (weekAnalysis.productDev.overdueProjects > 2) {
          const detection = {
            type: 'deadline_management',
            severity: weekAnalysis.productDev.overdueProjects > 4 ? 'critical' : 'warning',
            category: 'Développement Produits',
            title: `Gestion des échéances problématique`,
            description: `${weekAnalysis.productDev.overdueProjects} projets dépassent les échéances prévues.`,
            impact: 'Révision de la planification requise',
            week: week.week,
            realData: {
              overdueProjects: weekAnalysis.productDev.overdueProjects,
              totalProjects: weekAnalysis.productDev.totalProjects,
              overdueRatio: weekAnalysis.productDev.totalProjects > 0 ? (weekAnalysis.productDev.overdueProjects / weekAnalysis.productDev.totalProjects * 100) : 0
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }

        // Project completion rate analysis
        if (weekAnalysis.productDev.totalProjects > 0) {
          const completionRate = (weekAnalysis.productDev.completedProjects / weekAnalysis.productDev.totalProjects) * 100;
          if (completionRate < 20 && weekAnalysis.productDev.totalProjects > 3) {
            const detection = {
              type: 'completion_efficiency',
              severity: completionRate < 10 ? 'critical' : 'warning',
              category: 'Développement Produits',
              title: `Taux de finalisation faible (${Math.round(completionRate)}%)`,
              description: `Seulement ${weekAnalysis.productDev.completedProjects} projets finalisés sur ${weekAnalysis.productDev.totalProjects}.`,
              impact: 'Optimisation des processus nécessaire',
              week: week.week,
              realData: {
                completionRate,
                completedProjects: weekAnalysis.productDev.completedProjects,
                totalProjects: weekAnalysis.productDev.totalProjects
              }
            };
            allDetections.push(detection);
            weekAnalysis.detectedEvents.push(detection);
          }
        }

        // Innovation velocity tracking
        if (weekAnalysis.productDev.inProgressProjects > weekAnalysis.productDev.totalProjects * 0.8) {
          const detection = {
            type: 'innovation_bottleneck',
            severity: 'warning',
            category: 'Développement Produits',
            title: `Goulot d'étranglement innovation détecté`,
            description: `${weekAnalysis.productDev.inProgressProjects} projets en cours simultanément, risque de surcharge.`,
            impact: 'Priorisation des projets recommandée',
            week: week.week,
            realData: {
              inProgressProjects: weekAnalysis.productDev.inProgressProjects,
              totalProjects: weekAnalysis.productDev.totalProjects,
              workloadRatio: (weekAnalysis.productDev.inProgressProjects / weekAnalysis.productDev.totalProjects * 100)
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }
      }

      const criticalEvents = weekAnalysis.detectedEvents.filter(e => e.severity === 'critical').length;
      const warningEvents = weekAnalysis.detectedEvents.filter(e => e.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        weekAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        weekAnalysis.overallStatus = 'warning';
      } else if (weekAnalysis.productDev.average >= 80) {
        weekAnalysis.overallStatus = 'excellent';
      } else if (weekAnalysis.productDev.average >= 60) {
        weekAnalysis.overallStatus = 'good';
      }

      weeklyBreakdown.push(weekAnalysis);
    });

    const monthlyPerformance = {
      productDev: productDevData.length > 0 ? Math.round(productDevData.reduce((sum, entry) => sum + entry.value, 0) / productDevData.length) : 0
    };
    monthlyPerformance.overall = monthlyPerformance.productDev;

    // Generate AI recommendations based on detected patterns
    const generateRecommendations = () => {
      const recs = [];
      
      const overdueIssues = allDetections.filter(d => d.type === 'deadline_management').length;
      const performanceIssues = allDetections.filter(d => d.type === 'performance_degradation').length;
      const bottleneckIssues = allDetections.filter(d => d.type === 'innovation_bottleneck').length;
      
      if (overdueIssues > 2) {
        recs.push({
          type: 'process_optimization',
          priority: 'high',
          title: 'Optimiser la gestion des échéances',
          description: 'Implémenter un système de suivi proactif des délais avec alertes préventives.',
          impact: 'Réduction de 40% des retards'
        });
      }
      
      if (performanceIssues > 1) {
        recs.push({
          type: 'resource_allocation',
          priority: 'medium',
          title: 'Revoir l\'allocation des ressources R&D',
          description: 'Analyser la charge de travail et redistribuer les équipes sur les projets critiques.',
          impact: 'Amélioration de 25% des performances'
        });
      }
      
      if (bottleneckIssues > 0) {
        recs.push({
          type: 'project_prioritization',
          priority: 'medium',
          title: 'Prioriser le portefeuille de projets',
          description: 'Mettre en place une matrice de priorisation basée sur l\'impact et la faisabilité.',
          impact: 'Focus sur les projets à forte valeur'
        });
      }
      
      return recs;
    };

    const aiRecommendations = generateRecommendations();

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
        totalEntries: productDevData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentWeeks: weeklyBreakdown.filter(w => w.overallStatus === 'excellent').length,
        categoryBreakdown: {
          'Développement Produits': allDetections.filter(d => d.category === 'Développement Produits').length
        },
        weeksAnalyzed: weeklyBreakdown.length,
        totalProjects: weeklyBreakdown.reduce((sum, week) => sum + week.productDev.totalProjects, 0),
        completedProjects: weeklyBreakdown.reduce((sum, week) => sum + week.productDev.completedProjects, 0),
        overdueProjects: weeklyBreakdown.reduce((sum, week) => sum + week.productDev.overdueProjects, 0),
        inProgressProjects: weeklyBreakdown.reduce((sum, week) => sum + week.productDev.inProgressProjects, 0),
        daysInMonth: monthEnd.getDate()
      },
      hasData: productDevData.length > 0
    };
  }, [analyticsData, selectedMonth, selectedYear]);

  // Show loading state while analytics data is being loaded
  if (isLoadingAnalytics) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Chargement des Données R&D
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Préparation du rapport de développement en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!monthlyAnalysis || !monthlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée R&D disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée R&D trouvée pour {new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced chart configurations
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
        name: 'Performance Développement',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.productDev.average),
        smooth: true,
        lineStyle: { color: '#6366F1', width: 4 },
        itemStyle: { color: '#6366F1', borderWidth: 3, borderColor: '#FFFFFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.4)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
            ]
          }
        }
      }
    ]
  });

  const getProjectStatusChart = () => {
    const data = [
      { 
        value: monthlyAnalysis.statistics.completedProjects, 
        name: 'Terminés', 
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
      },
      { 
        value: monthlyAnalysis.statistics.inProgressProjects, 
        name: 'En cours', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#4338CA' }
            ]
          }
        }
      },
      { 
        value: monthlyAnalysis.statistics.overdueProjects, 
        name: 'En retard', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#EF4444' },
              { offset: 1, color: '#DC2626' }
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
        extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data,
        label: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          fontSize: 12,
          formatter: '{b}\n{c}'
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

  const getDetectionDistributionChart = () => {
    const data = [
      { value: monthlyAnalysis.statistics.criticalIssues, name: 'Critique', itemStyle: { color: '#EF4444' } },
      { value: monthlyAnalysis.statistics.warningIssues, name: 'Attention', itemStyle: { color: '#F59E0B' } },
      { value: monthlyAnalysis.statistics.excellentWeeks, name: 'Excellence', itemStyle: { color: '#10B981' } }
    ].filter(item => item.value > 0);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
      },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        data,
        label: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          fontSize: 12,
          formatter: '{b}: {c}'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

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
          <title>Rapport R&D - ${monthlyAnalysis.monthName} ${monthlyAnalysis.year}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
            h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
            .subtitle { font-size: 1.2em; opacity: 0.9; margin-top: 10px; }
            .metric { margin: 15px 0; padding: 20px; border: 1px solid #e1e5e9; border-radius: 12px; background: #f8f9fa; }
            .metric h2 { color: #2c3e50; margin-top: 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Rapport R&D Mensuel</h1>
            <div class="subtitle">${monthlyAnalysis.monthName} ${monthlyAnalysis.year} • Performance Globale: ${monthlyAnalysis.monthlyPerformance.overall}%</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>🎯 Performance Développement</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.overall}%</h2>
            </div>
            <div class="stat-card">
              <h3>📊 Projets Totaux</h3>
              <h2>${monthlyAnalysis.statistics.totalProjects}</h2>
            </div>
            <div class="stat-card">
              <h3>✅ Projets Terminés</h3>
              <h2>${monthlyAnalysis.statistics.completedProjects}</h2>
            </div>
            <div class="stat-card">
              <h3>⏰ Projets en Retard</h3>
              <h2>${monthlyAnalysis.statistics.overdueProjects}</h2>
            </div>
          </div>

          <div class="metric">
            <h2>📈 Statistiques Clés</h2>
            <ul>
              <li><strong>Semaines analysées:</strong> ${monthlyAnalysis.statistics.weeksAnalyzed}</li>
              <li><strong>Total entrées:</strong> ${monthlyAnalysis.statistics.totalEntries}</li>
              <li><strong>Projets en cours:</strong> ${monthlyAnalysis.statistics.inProgressProjects}</li>
              <li><strong>Problèmes critiques:</strong> ${monthlyAnalysis.statistics.criticalIssues}</li>
            </ul>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    const csvData = monthlyAnalysis.weeklyBreakdown.map(week => [
      week.week,
      week.startDate,
      week.productDev.average,
      week.productDev.totalProjects,
      week.productDev.completedProjects,
      week.productDev.overdueProjects,
      week.overallStatus,
      week.detectedEvents.length
    ]);
    
    const csvContent = [
      ['Semaine', 'Date', 'Performance', 'Projets Total', 'Terminés', 'En Retard', 'Statut', 'Détections'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_rnd_${monthlyAnalysis.monthName.toLowerCase()}_${monthlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
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
    if (score >= 80) return { status: 'excellent', text: 'Excellent', color: 'emerald' };
    if (score >= 60) return { status: 'good', text: 'Bon', color: 'blue' };
    if (score >= 40) return { status: 'warning', text: 'Satisfaisant', color: 'amber' };
    return { status: 'critical', text: 'Amélioration Nécessaire', color: 'red' };
  };

  const overallStatus = getOverallStatus();

  const filteredDetections = monthlyAnalysis.detections.filter(detection => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'critical') return detection.severity === 'critical';
    if (selectedCategory === 'warning') return detection.severity === 'warning';
    return detection.category === selectedCategory;
  });

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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport R&D Mensuel
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
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
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
                  onClick={exportToCSV}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
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
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500"></div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <h2 className={`text-2xl font-light ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                            Performance R&D
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
                            overallStatus.color === 'emerald' ? 'text-indigo-600' :
                            overallStatus.color === 'blue' ? 'text-indigo-600' :
                            overallStatus.color === 'amber' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {overallStatus.text}
                          </div>
                        </div>
                      </div>

                      {/* Refined KPI Grid */}
                      <div className="grid grid-cols-4 gap-6">
                        {[
                          { title: 'Total', value: monthlyAnalysis.statistics.totalProjects, icon: Rocket, color: 'indigo', subtitle: 'projets' },
                          { title: 'Terminés', value: monthlyAnalysis.statistics.completedProjects, icon: CheckCircle, color: 'emerald', subtitle: 'finalisés' },
                          { title: 'En cours', value: monthlyAnalysis.statistics.inProgressProjects, icon: Clock, color: 'blue', subtitle: 'actifs' },
                          { title: 'En retard', value: monthlyAnalysis.statistics.overdueProjects, icon: AlertTriangle, color: 'red', subtitle: 'échéances' }
                        ].map((kpi, index) => (
                          <div key={index} className={`p-5 rounded-2xl ${
                            isDark ? 'bg-slate-700/20 border border-slate-600/30' : 'bg-slate-50/50 border border-slate-200/50'
                          } backdrop-blur-sm`}>
                            
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                kpi.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-600' :
                                kpi.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600' :
                                kpi.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                                'bg-red-500/15 text-red-600'
                              }`}>
                                <kpi.icon className="w-4 h-4" />
                              </div>
                              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {kpi.title}
                              </span>
                            </div>
                            
                            <div className={`text-3xl font-light mb-2 ${
                              kpi.color === 'indigo' ? 'text-indigo-600' :
                              kpi.color === 'emerald' ? 'text-emerald-600' :
                              kpi.color === 'blue' ? 'text-blue-600' :
                              'text-red-600'
                            }`}>
                              {kpi.value}
                            </div>
                            
                            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {kpi.subtitle}
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
                      Métriques Innovation
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
                          Taux de Réussite
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.totalProjects > 0 ? Math.round((monthlyAnalysis.statistics.completedProjects / monthlyAnalysis.statistics.totalProjects) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Jours Analysés
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.daysInMonth}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                    isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
                  }`}>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-5`}>
                      Évolution Hebdomadaire
                    </h3>
                    
                    <div className="space-y-3">
                      {monthlyAnalysis.weeklyBreakdown.slice(0, 4).map((week, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                            week.overallStatus === 'excellent' ? 'bg-indigo-500/20 text-indigo-600' :
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
                            week.overallStatus === 'excellent' ? 'text-indigo-600' :
                            week.overallStatus === 'critical' ? 'text-red-600' :
                            week.overallStatus === 'warning' ? 'text-amber-600' :
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {week.productDev.average}%
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
                      Tendances Développement R&D
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Évolution des performances de développement par semaine
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-indigo-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Performance Développement</span>
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
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Recommandations IA
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Basées sur l'analyse des tendances R&D détectées
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {monthlyAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                        isDark ? 'bg-slate-800/40 border-slate-600/30' : 'bg-white/80 border-slate-200'
                      }`}>
                        <div className="flex items-start space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            rec.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                            rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-600' : 'bg-green-500/20 text-green-600'
                          }`}>
                            {rec.priority === 'high' ? '!' : rec.priority === 'medium' ? '~' : '✓'}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {rec.title}
                            </h4>
                            <p className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {rec.description}
                            </p>
                            <div className={`text-sm italic ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Performance Hebdomadaire
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Évolution des performances R&D par semaine
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getWeeklyTrendChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Project Status Distribution */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Statut des Projets
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Répartition par état d'avancement
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getProjectStatusChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Detection Distribution */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Répartition des Problèmes
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Types d'alertes détectées
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getDetectionDistributionChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Performance Metrics Summary */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
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
                        label: 'Performance Développement',
                        value: `${monthlyAnalysis.monthlyPerformance.overall}%`,
                        color: 'indigo',
                        progress: monthlyAnalysis.monthlyPerformance.overall
                      },
                      {
                        label: 'Taux de Finalisation',
                        value: `${monthlyAnalysis.statistics.totalProjects > 0 ? Math.round((monthlyAnalysis.statistics.completedProjects / monthlyAnalysis.statistics.totalProjects) * 100) : 0}%`,
                        color: 'emerald',
                        progress: monthlyAnalysis.statistics.totalProjects > 0 ? (monthlyAnalysis.statistics.completedProjects / monthlyAnalysis.statistics.totalProjects) * 100 : 0
                      },
                      {
                        label: 'Projets en Cours',
                        value: `${monthlyAnalysis.statistics.inProgressProjects}`,
                        color: 'blue',
                        progress: monthlyAnalysis.statistics.totalProjects > 0 ? (monthlyAnalysis.statistics.inProgressProjects / monthlyAnalysis.statistics.totalProjects) * 100 : 0
                      },
                      {
                        label: 'Semaines Excellentes',
                        value: `${monthlyAnalysis.statistics.excellentWeeks}/${monthlyAnalysis.statistics.weeksAnalyzed}`,
                        color: 'purple',
                        progress: (monthlyAnalysis.statistics.excellentWeeks / monthlyAnalysis.statistics.weeksAnalyzed) * 100
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
                              metric.color === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                              metric.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                              metric.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${Math.min(metric.progress, 100)}%` }}
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
                    Analyse R&D Hebdomadaire
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Sélectionnez une semaine pour explorer les performances R&D en détail
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
                            'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-300/50 shadow-lg' :
                          week.overallStatus === 'excellent' ?
                            isDark ? 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10' : 'bg-indigo-50/50 border-indigo-200/50 hover:bg-indigo-50' :
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
                            'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' :
                          week.overallStatus === 'excellent' ? 
                            'bg-indigo-500/80 text-white' :
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
                            isDark ? 'text-indigo-300' : 'text-indigo-600' :
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
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-400/30"></div>
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
                                selectedWeek.overallStatus === 'excellent' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
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
                                selectedWeek.overallStatus === 'excellent' ? 'bg-indigo-500' :
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { 
                              title: 'Performance', 
                              value: selectedWeek.productDev.average, 
                              icon: Brain, 
                              color: 'indigo',
                              subtitle: `${selectedWeek.productDev.entries} entrées`,
                              unit: '%'
                            },
                            { 
                              title: 'Total Projets', 
                              value: selectedWeek.productDev.totalProjects, 
                              icon: Rocket, 
                              color: 'blue',
                              subtitle: 'actifs',
                              unit: ''
                            },
                            { 
                              title: 'Terminés', 
                              value: selectedWeek.productDev.completedProjects, 
                              icon: CheckCircle, 
                              color: 'emerald',
                              subtitle: `${selectedWeek.productDev.inProgressProjects} en cours`,
                              unit: ''
                            },
                            { 
                              title: 'En Retard', 
                              value: selectedWeek.productDev.overdueProjects, 
                              icon: AlertTriangle, 
                              color: 'red',
                              subtitle: 'échéances',
                              unit: ''
                            }
                          ].map((metric, index) => (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                              isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                            }`}>
                              <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  metric.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-600' :
                                  metric.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                                  metric.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600' :
                                  'bg-red-500/15 text-red-600'
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
                              
                              <div className={`text-2xl font-light mb-3 ${
                                metric.color === 'indigo' ? getPerformanceColor(metric.value) :
                                metric.color === 'blue' ? 'text-blue-600' :
                                metric.color === 'emerald' ? 'text-emerald-600' :
                                'text-red-600'
                              }`}>
                                {metric.value}{metric.unit}
                              </div>
                              
                              {metric.color === 'indigo' && (
                                <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-slate-700/50' : 'bg-slate-200/50'} overflow-hidden`}>
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-purple-500"
                                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                                  />
                                </div>
                              )}
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
                                  Alertes R&D
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
                                      <div className="flex items-center space-x-3 mt-2">
                                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                          Catégorie: {detection.category}
                                        </div>
                                        <div className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                          Impact: {detection.impact}
                                        </div>
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
                  {monthlyAnalysis.monthlyPerformance.overall}% Performance R&D
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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
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

export default RnDMonthlyReport;