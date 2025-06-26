import React, { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  Calculator,
  Factory,
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
  Zap,
  Lightbulb,
  Search,
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
  Droplets,
  Power,
  Thermometer,
  Cpu,
  Loader2,
  Brain,
  Sparkles,
  Flame,
  Shield
} from 'lucide-react';

const ProductionMonthlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWeekDetail, setSelectedWeekDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedStats, setAnimatedStats] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Loading and error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!analytics) {
          throw new Error('Aucune donnée analytique disponible');
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [analytics]);

  const monthlyAnalysis = useMemo(() => {
    if (!analytics || isLoading) return null;

    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Get data for both KPIs
    const energyData = (analytics.energy_consumption || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    const mixingData = (analytics.mixing_time || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    if (energyData.length === 0 && mixingData.length === 0) {
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
    
    // Process energy and mixing data by week
    [...energyData, ...mixingData].forEach(entry => {
      const week = getWeekNumber(new Date(entry.date));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          startDate: new Date(entry.date),
          energy: [],
          mixing: [],
          detectedEvents: []
        };
      }

      if (energyData.includes(entry)) weeklyData[week].energy.push(entry);
      if (mixingData.includes(entry)) weeklyData[week].mixing.push(entry);
    });

    const weeklyBreakdown = [];
    const allDetections = [];
    const recommendations = [];

    Object.values(weeklyData).forEach(week => {
      const weekAnalysis = {
        week: week.week,
        startDate: week.startDate.toLocaleDateString('fr-FR'),
        endDate: new Date(week.startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        energy: {
          average: 0,
          entries: week.energy.length,
          totalConsumption: 0,
          totalCost: 0,
          peakConsumption: 0,
          efficiencyScore: 0,
          issues: []
        },
        mixing: {
          average: 0,
          entries: week.mixing.length,
          avgTime: 0,
          optimalBatches: 0,
          totalBatches: 0,
          issues: []
        },
        detectedEvents: [],
        overallStatus: 'good',
        rawData: {
          energy: week.energy,
          mixing: week.mixing
        }
      };

      // Analyze Energy Performance
      if (week.energy.length > 0) {
        const energyAvg = week.energy.reduce((sum, entry) => sum + entry.value, 0) / week.energy.length;
        weekAnalysis.energy.average = Math.round(energyAvg);

        week.energy.forEach(entry => {
          if (entry.data && entry.data.stats) {
            weekAnalysis.energy.totalConsumption += entry.data.stats.totalConsumption || 0;
            weekAnalysis.energy.totalCost += entry.data.stats.totalCost || 0;
            weekAnalysis.energy.peakConsumption = Math.max(weekAnalysis.energy.peakConsumption, entry.data.stats.peakConsumption || 0);
            weekAnalysis.energy.efficiencyScore += entry.data.stats.efficiencyScore || 0;
          }
        });

        weekAnalysis.energy.efficiencyScore = Math.round(weekAnalysis.energy.efficiencyScore / week.energy.length);

        // Energy efficiency detection
        if (energyAvg < 70) {
          const severity = energyAvg < 50 ? 'critical' : 'warning';
          const detection = {
            type: 'energy_inefficiency',
            severity,
            category: 'Efficacité Énergétique',
            title: `Performance énergétique critique (${Math.round(energyAvg)}%)`,
            description: `Efficacité énergétique en dessous des standards avec consommation excessive détectée.`,
            impact: severity === 'critical' ? 'Coûts énergétiques élevés' : 'Optimisation nécessaire',
            week: week.week,
            realData: {
              totalConsumption: weekAnalysis.energy.totalConsumption,
              efficiencyScore: energyAvg,
              totalCost: weekAnalysis.energy.totalCost
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.energy.issues.push(`Efficacité ${Math.round(energyAvg)}%`);
        }

        // High consumption detection
        if (weekAnalysis.energy.totalConsumption > 5000) {
          const detection = {
            type: 'high_consumption',
            severity: weekAnalysis.energy.totalConsumption > 8000 ? 'critical' : 'warning',
            category: 'Consommation Énergétique',
            title: `Consommation énergétique élevée`,
            description: `${weekAnalysis.energy.totalConsumption.toLocaleString()} kWh consommés cette semaine.`,
            impact: 'Impact budgétaire significatif',
            week: week.week,
            realData: {
              totalConsumption: weekAnalysis.energy.totalConsumption,
              totalCost: weekAnalysis.energy.totalCost,
              averageDaily: weekAnalysis.energy.totalConsumption / 7
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }

        // Peak consumption analysis
        if (weekAnalysis.energy.peakConsumption > 500) {
          const detection = {
            type: 'peak_consumption',
            severity: weekAnalysis.energy.peakConsumption > 800 ? 'critical' : 'warning',
            category: 'Efficacité Énergétique',
            title: `Pic de consommation détecté`,
            description: `Consommation maximale de ${weekAnalysis.energy.peakConsumption} kW/h enregistrée.`,
            impact: 'Révision des processus de production recommandée',
            week: week.week,
            realData: {
              peakConsumption: weekAnalysis.energy.peakConsumption,
              avgConsumption: weekAnalysis.energy.totalConsumption / week.energy.length
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
        }
      }

      // Analyze Mixing Performance
      if (week.mixing.length > 0) {
        const mixingAvg = week.mixing.reduce((sum, entry) => sum + entry.value, 0) / week.mixing.length;
        weekAnalysis.mixing.average = Math.round(mixingAvg);

        week.mixing.forEach(entry => {
          if (entry.data && entry.data.stats) {
            weekAnalysis.mixing.avgTime += entry.data.stats.averageTime || 0;
            weekAnalysis.mixing.optimalBatches += entry.data.stats.optimalBatches || 0;
            weekAnalysis.mixing.totalBatches += entry.data.stats.totalBatches || 0;
          }
        });

        weekAnalysis.mixing.avgTime = Math.round(weekAnalysis.mixing.avgTime / week.mixing.length);

        // Mixing time efficiency detection
        if (mixingAvg < 70) {
          const severity = mixingAvg < 50 ? 'critical' : 'warning';
          const detection = {
            type: 'mixing_inefficiency',
            severity,
            category: 'Efficacité Mélange',
            title: `Performance de mélange critique (${Math.round(mixingAvg)}%)`,
            description: `Temps de mélange excessive avec ${weekAnalysis.mixing.totalBatches - weekAnalysis.mixing.optimalBatches} lots non optimaux.`,
            impact: severity === 'critical' ? 'Retards de production majeurs' : 'Optimisation requise',
            week: week.week,
            realData: {
              totalBatches: weekAnalysis.mixing.totalBatches,
              performanceRate: mixingAvg,
              avgTime: weekAnalysis.mixing.avgTime
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.mixing.issues.push(`${weekAnalysis.mixing.totalBatches - weekAnalysis.mixing.optimalBatches} lots non optimaux`);
        }

        // Batch optimization analysis
        if (weekAnalysis.mixing.totalBatches > 0) {
          const optimizationRate = (weekAnalysis.mixing.optimalBatches / weekAnalysis.mixing.totalBatches) * 100;
          if (optimizationRate < 60 && weekAnalysis.mixing.totalBatches > 5) {
            const detection = {
              type: 'batch_optimization',
              severity: optimizationRate < 40 ? 'critical' : 'warning',
              category: 'Efficacité Mélange',
              title: `Taux d'optimisation faible (${Math.round(optimizationRate)}%)`,
              description: `Seulement ${weekAnalysis.mixing.optimalBatches} lots optimaux sur ${weekAnalysis.mixing.totalBatches}.`,
              impact: 'Révision des paramètres de mélange nécessaire',
              week: week.week,
              realData: {
                optimizationRate,
                optimalBatches: weekAnalysis.mixing.optimalBatches,
                totalBatches: weekAnalysis.mixing.totalBatches
              }
            };
            allDetections.push(detection);
            weekAnalysis.detectedEvents.push(detection);
          }
        }

        // Average mixing time analysis
        if (weekAnalysis.mixing.avgTime > 45) {
          const detection = {
            type: 'mixing_time_excess',
            severity: weekAnalysis.mixing.avgTime > 60 ? 'critical' : 'warning',
            category: 'Efficacité Mélange',
            title: `Temps de mélange excessif`,
            description: `Temps moyen de ${weekAnalysis.mixing.avgTime} minutes dépasse les standards.`,
            impact: 'Réduction de la productivité',
            week: week.week,
            realData: {
              avgTime: weekAnalysis.mixing.avgTime,
              targetTime: 30,
              efficiency: Math.max(0, 100 - ((weekAnalysis.mixing.avgTime - 30) / 30 * 100))
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
      } else if (weekAnalysis.energy.average >= 80 && weekAnalysis.mixing.average >= 80) {
        weekAnalysis.overallStatus = 'excellent';
      } else if (weekAnalysis.energy.average >= 60 || weekAnalysis.mixing.average >= 60) {
        weekAnalysis.overallStatus = 'good';
      }

      weeklyBreakdown.push(weekAnalysis);
    });

    // Calculate monthly performance
    const monthlyPerformance = {
      energy: energyData.length > 0 ? Math.round(energyData.reduce((sum, entry) => sum + entry.value, 0) / energyData.length) : 0,
      mixing: mixingData.length > 0 ? Math.round(mixingData.reduce((sum, entry) => sum + entry.value, 0) / mixingData.length) : 0
    };
    monthlyPerformance.overall = Math.round((monthlyPerformance.energy + monthlyPerformance.mixing) / 2);

    // Generate AI recommendations based on detected patterns
    const generateRecommendations = () => {
      const recs = [];
      
      const energyIssues = allDetections.filter(d => d.category === 'Efficacité Énergétique').length;
      const mixingIssues = allDetections.filter(d => d.category === 'Efficacité Mélange').length;
      const consumptionIssues = allDetections.filter(d => d.type === 'high_consumption').length;
      
      if (energyIssues > 2) {
        recs.push({
          type: 'energy_optimization',
          priority: 'high',
          title: 'Optimiser l\'efficacité énergétique',
          description: 'Auditer les équipements énergivores et implémenter un plan d\'optimisation énergétique.',
          impact: 'Réduction de 15-25% des coûts énergétiques'
        });
      }
      
      if (mixingIssues > 1) {
        recs.push({
          type: 'mixing_optimization',
          priority: 'medium',
          title: 'Améliorer les processus de mélange',
          description: 'Réviser les paramètres de mélange et former les équipes aux bonnes pratiques.',
          impact: 'Amélioration de 20% de la productivité'
        });
      }
      
      if (consumptionIssues > 0) {
        recs.push({
          type: 'consumption_monitoring',
          priority: 'medium',
          title: 'Surveillance renforcée de la consommation',
          description: 'Mettre en place des alertes en temps réel pour la consommation énergétique.',
          impact: 'Contrôle proactif des coûts'
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
        totalEntries: energyData.length + mixingData.length,
        energyEntries: energyData.length,
        mixingEntries: mixingData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentWeeks: weeklyBreakdown.filter(w => w.overallStatus === 'excellent').length,
        categoryBreakdown: {
          'Efficacité Énergétique': allDetections.filter(d => d.category === 'Efficacité Énergétique').length,
          'Efficacité Mélange': allDetections.filter(d => d.category === 'Efficacité Mélange').length,
          'Consommation Énergétique': allDetections.filter(d => d.category === 'Consommation Énergétique').length
        },
        weeksAnalyzed: weeklyBreakdown.length,
        totalEnergyConsumption: weeklyBreakdown.reduce((sum, week) => sum + week.energy.totalConsumption, 0),
        totalEnergyCost: weeklyBreakdown.reduce((sum, week) => sum + week.energy.totalCost, 0),
        totalBatches: weeklyBreakdown.reduce((sum, week) => sum + week.mixing.totalBatches, 0),
        optimalBatches: weeklyBreakdown.reduce((sum, week) => sum + week.mixing.optimalBatches, 0),
        daysInMonth: monthEnd.getDate()
      },
      hasData: energyData.length > 0 || mixingData.length > 0
    };
  }, [analytics, selectedMonth, selectedYear, isLoading]);

  // Loading Component
  const LoadingDisplay = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ${
        isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Génération du Rapport
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Analyse des données de production en cours...
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Error Display Component
  const ErrorDisplay = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ${
        isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Erreur de Chargement
          </h3>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {error}
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Réessayer
            </button>
            <button 
              onClick={onClose} 
              className={`px-6 py-3 rounded-xl border font-medium transition-all duration-200 ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return <LoadingDisplay />;
  }

  // Show error state
  if (error) {
    return <ErrorDisplay />;
  }

  // Show no data state
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
              Aucune donnée de production trouvée pour {new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
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
        name: 'Performance Énergie',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.energy.average),
        smooth: true,
        lineStyle: { color: '#F97316', width: 4 },
        itemStyle: { color: '#F97316', borderWidth: 3, borderColor: '#FFFFFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(249, 115, 22, 0.4)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.05)' }
            ]
          }
        }
      },
      {
        name: 'Performance Mélange',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.mixing.average),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 4 },
        itemStyle: { color: '#3B82F6', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const getEnergyDistributionChart = () => {
    const totalConsumption = monthlyAnalysis.statistics.totalEnergyConsumption;
    const data = [
      { 
        value: totalConsumption * 0.6, 
        name: 'Production', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#F97316' },
              { offset: 1, color: '#EA580C' }
            ]
          }
        } 
      },
      { 
        value: totalConsumption * 0.25, 
        name: 'Mélange', 
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#1D4ED8' }
            ]
          }
        } 
      },
      { 
        value: totalConsumption * 0.15, 
        name: 'Auxiliaires', 
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
        formatter: '{b}: {c} kWh ({d}%)'
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
        { name: 'Énergie', max: 100 },
        { name: 'Mélange', max: 100 },
        { name: 'Efficacité', max: 100 },
        { name: 'Coûts', max: 100 },
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
            'rgba(249, 115, 22, 0.05)',
            'rgba(59, 130, 246, 0.05)',
            'rgba(16, 185, 129, 0.05)'
          ]
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          monthlyAnalysis.monthlyPerformance.energy,
          monthlyAnalysis.monthlyPerformance.mixing,
          Math.max(monthlyAnalysis.monthlyPerformance.energy, monthlyAnalysis.monthlyPerformance.mixing),
          85, // Cost efficiency score
          78  // Quality score
        ],
        name: 'Performance Actuelle',
        areaStyle: {
          color: 'rgba(249, 115, 22, 0.2)'
        },
        lineStyle: {
          color: '#F97316',
          width: 3
        },
        itemStyle: {
          color: '#F97316'
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
          <title>Rapport Production - ${monthlyAnalysis.monthName} ${monthlyAnalysis.year}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
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
            <h1>🏭 Rapport Production Mensuel</h1>
            <div class="subtitle">${monthlyAnalysis.monthName} ${monthlyAnalysis.year} • Performance Globale: ${monthlyAnalysis.monthlyPerformance.overall}%</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>⚡ Performance Énergie</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.energy}%</h2>
            </div>
            <div class="stat-card">
              <h3>⏱️ Performance Mélange</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.mixing}%</h2>
            </div>
            <div class="stat-card">
              <h3>🔌 Consommation Totale</h3>
              <h2>${monthlyAnalysis.statistics.totalEnergyConsumption.toLocaleString()} kWh</h2>
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
              <li><strong>Coût énergétique total:</strong> ${monthlyAnalysis.statistics.totalEnergyCost.toLocaleString()} TND</li>
              <li><strong>Lots optimaux:</strong> ${monthlyAnalysis.statistics.optimalBatches}/${monthlyAnalysis.statistics.totalBatches}</li>
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 flex items-center justify-center shadow-md">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel de Production
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
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
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
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"></div>
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
                          { title: 'Énergie', value: monthlyAnalysis.monthlyPerformance.energy, icon: Zap, color: 'orange' },
                          { title: 'Mélange', value: monthlyAnalysis.monthlyPerformance.mixing, icon: Timer, color: 'blue' }
                        ].map((kpi, index) => (
                          <div key={index} className={`p-5 rounded-2xl ${
                            isDark ? 'bg-slate-700/20 border border-slate-600/30' : 'bg-slate-50/50 border border-slate-200/50'
                          } backdrop-blur-sm`}>
                            
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                kpi.color === 'orange' ? 'bg-orange-500/15 text-orange-600' : 'bg-blue-500/15 text-blue-600'
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
                          Consommation Totale
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.totalEnergyConsumption.toLocaleString()} kWh
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Lots Optimaux
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.optimalBatches}/{monthlyAnalysis.statistics.totalBatches}
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
                            {Math.round((week.energy.average + week.mixing.average) / 2)}%
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
                      <div className="w-3 h-3 rounded bg-orange-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Énergie</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Mélange</span>
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
                        Basées sur l'analyse des tendances de production détectées
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Tendances Hebdomadaires
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Évolution énergie et mélange par semaine
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
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
                
                {/* Energy Distribution */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Répartition Énergétique
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Distribution par processus
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getEnergyDistributionChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* Performance Summary Card */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
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
                        label: 'Performance Énergie',
                        value: `${monthlyAnalysis.monthlyPerformance.energy}%`,
                        color: 'orange',
                        progress: monthlyAnalysis.monthlyPerformance.energy
                      },
                      {
                        label: 'Performance Mélange',
                        value: `${monthlyAnalysis.monthlyPerformance.mixing}%`,
                        color: 'blue',
                        progress: monthlyAnalysis.monthlyPerformance.mixing
                      },
                      {
                        label: 'Coût Énergétique',
                        value: `${monthlyAnalysis.statistics.totalEnergyCost.toLocaleString()} TND`,
                        color: 'green',
                        progress: Math.min(100, monthlyAnalysis.statistics.totalEnergyCost / 10000 * 100)
                      },
                      {
                        label: 'Semaines Excellentes',
                        value: `${monthlyAnalysis.statistics.excellentWeeks}/${monthlyAnalysis.statistics.weeksAnalyzed}`,
                        color: 'emerald',
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
                              metric.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                              metric.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              metric.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              'bg-gradient-to-r from-emerald-500 to-green-500'
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
                            'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-300/50 shadow-lg' :
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
                            'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md' :
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
                            isDark ? 'text-orange-300' : 'text-orange-600' :
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
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-400/30"></div>
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
                              title: 'Énergie', 
                              value: selectedWeek.energy.average, 
                              icon: Zap, 
                              color: 'orange',
                              subtitle: 'Performance Énergétique',
                              details: `${selectedWeek.energy.totalConsumption.toLocaleString()} kWh consommés`
                            },
                            { 
                              title: 'Mélange', 
                              value: selectedWeek.mixing.average, 
                              icon: Timer, 
                              color: 'blue',
                              subtitle: 'Efficacité de Mélange',
                              details: `${selectedWeek.mixing.optimalBatches}/${selectedWeek.mixing.totalBatches} lots optimaux`
                            }
                          ].map((metric, index) => (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                              isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                            }`}>
                              <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  metric.color === 'orange' ? 'bg-orange-500/15 text-orange-600' : 'bg-blue-500/15 text-blue-600'
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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium transition-all duration-200 hover:from-orange-700 hover:to-red-700 shadow-lg"
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

export default ProductionMonthlyReport;