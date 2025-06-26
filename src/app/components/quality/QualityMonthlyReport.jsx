import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Download,
  FileText,
  Package,
  Trash2,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Clock,
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
  FlaskConical,
  Package2,
  ShieldCheck,
  Plus,
  Sparkles,
  Bookmark,
  MapPin,
  Timer,
  Flame,
  Heart
} from 'lucide-react';

const QualityMonthlyReport = ({ analytics, isDark, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWeekDetail, setSelectedWeekDetail] = useState(null);
  const [animatedStats, setAnimatedStats] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const monthlyAnalysis = useMemo(() => {
    if (!analytics) return null;

    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Process reception data
    const receptionData = (analytics.material_batch_acceptance_rate || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // Process waste data
    const wasteData = (analytics.production_waste_rate || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // Process inventory data
    const inventoryData = (analytics.raw_materials_inventory_list || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    if (receptionData.length === 0 && wasteData.length === 0 && inventoryData.length === 0) {
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
    
    // Process reception data by week
    receptionData.forEach(entry => {
      const week = getWeekNumber(new Date(entry.date));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          startDate: new Date(entry.date),
          reception: [],
          waste: [],
          inventory: [],
          detectedEvents: []
        };
      }
      weeklyData[week].reception.push(entry);
    });

    // Process waste data by week
    wasteData.forEach(entry => {
      const week = getWeekNumber(new Date(entry.date));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          startDate: new Date(entry.date),
          reception: [],
          waste: [],
          inventory: [],
          detectedEvents: []
        };
      }
      weeklyData[week].waste.push(entry);
    });

    // Process inventory data by week
    inventoryData.forEach(entry => {
      const week = getWeekNumber(new Date(entry.date));
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          startDate: new Date(entry.date),
          reception: [],
          waste: [],
          inventory: [],
          detectedEvents: []
        };
      }
      weeklyData[week].inventory.push(entry);
    });

    const weeklyBreakdown = [];
    const allDetections = [];

    Object.values(weeklyData).forEach(week => {
      const weekAnalysis = {
        week: week.week,
        startDate: week.startDate.toLocaleDateString('fr-FR'),
        endDate: new Date(week.startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        reception: {
          average: 0,
          entries: week.reception.length,
          totalBatches: 0,
          conformeBatches: 0,
          nonConformeBatches: 0,
          suppliers: new Set(),
          issues: []
        },
        waste: {
          average: 0,
          entries: week.waste.length,
          totalWasted: 0,
          processes: [],
          issues: []
        },
        inventory: {
          average: 0,
          entries: week.inventory.length,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          issues: []
        },
        detectedEvents: [],
        overallStatus: 'good',
        rawData: {
          reception: week.reception,
          waste: week.waste,
          inventory: week.inventory
        }
      };

      // Process reception analysis
      if (week.reception.length > 0) {
        const receptionAvg = week.reception.reduce((sum, entry) => sum + entry.value, 0) / week.reception.length;
        weekAnalysis.reception.average = Math.round(receptionAvg);

        week.reception.forEach(entry => {
          if (entry.receptions) {
            weekAnalysis.reception.totalBatches += entry.receptions.length;
            weekAnalysis.reception.conformeBatches += entry.receptions.filter(r => r.isConforme === true).length;
            weekAnalysis.reception.nonConformeBatches += entry.receptions.filter(r => r.isConforme === false).length;
            
            entry.receptions.forEach(reception => {
              if (reception.productName) {
                weekAnalysis.reception.suppliers.add(reception.productName);
              }
            });
          }
          
          if (entry.stats) {
            weekAnalysis.reception.totalBatches += entry.stats.total || 0;
            weekAnalysis.reception.conformeBatches += entry.stats.conforme || 0;
            weekAnalysis.reception.nonConformeBatches += entry.stats.nonConforme || 0;
          }
        });

        if (receptionAvg < 80) {
          const severity = receptionAvg < 60 ? 'critical' : 'warning';
          const detection = {
            type: 'quality_degradation',
            severity,
            category: 'Réception Matières',
            title: `Taux d'acceptation critique (${Math.round(receptionAvg)}%)`,
            description: `Performance de réception en dessous des standards avec ${weekAnalysis.reception.nonConformeBatches} lots non-conformes.`,
            impact: severity === 'critical' ? 'Arrêt potentiel de production' : 'Retards et surcoûts',
            week: week.week,
            realData: {
              totalBatches: weekAnalysis.reception.totalBatches,
              conformRate: weekAnalysis.reception.totalBatches > 0 ? (weekAnalysis.reception.conformeBatches / weekAnalysis.reception.totalBatches * 100) : 0,
              suppliers: Array.from(weekAnalysis.reception.suppliers)
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.reception.issues.push(`${weekAnalysis.reception.nonConformeBatches} lots non-conformes`);
        }
      }

      // Process waste analysis
      if (week.waste.length > 0) {
        const wasteAvg = week.waste.reduce((sum, entry) => sum + entry.value, 0) / week.waste.length;
        weekAnalysis.waste.average = Math.round(wasteAvg);

        week.waste.forEach(entry => {
          if (entry.wastedProducts) {
            weekAnalysis.waste.totalWasted += entry.wastedProducts.length;
            weekAnalysis.waste.processes.push(...entry.wastedProducts.map(wp => ({
              nom: wp.product,
              gaspillage: 1
            })));
          }
          
          if (entry.stats) {
            weekAnalysis.waste.totalWasted += entry.stats.totalGaspille || 0;
          }
        });

        if (wasteAvg < 70) {
          const severity = wasteAvg < 50 ? 'critical' : 'warning';
          const detection = {
            type: 'efficiency_loss',
            severity,
            category: 'Contrôle Gaspillage',
            title: `Efficacité anti-gaspillage faible (${Math.round(wasteAvg)}%)`,
            description: `Gaspillage excessif détecté avec ${Math.round(weekAnalysis.waste.totalWasted)} produits perdus.`,
            impact: severity === 'critical' ? 'Pertes importantes' : 'Optimisation requise',
            week: week.week,
            realData: {
              totalWasted: weekAnalysis.waste.totalWasted,
              processes: weekAnalysis.waste.processes.length,
              worstProcess: weekAnalysis.waste.processes.reduce((worst, proc) => 
                (proc.gaspillage || 0) > (worst.gaspillage || 0) ? proc : worst, {})
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.waste.issues.push(`${Math.round(weekAnalysis.waste.totalWasted)} produits gaspillés`);
        }
      }

      // Process inventory analysis
      if (week.inventory.length > 0) {
        const inventoryAvg = week.inventory.reduce((sum, entry) => sum + entry.value, 0) / week.inventory.length;
        weekAnalysis.inventory.average = Math.round(inventoryAvg);

        week.inventory.forEach(entry => {
          if (entry.productTests) {
            const tests = Object.values(entry.productTests);
            weekAnalysis.inventory.totalTests += tests.length;
            weekAnalysis.inventory.passedTests += tests.filter(t => t.reussiteGlobale === true).length;
            weekAnalysis.inventory.failedTests += tests.filter(t => t.reussiteGlobale === false).length;
          }
          
          if (entry.stats) {
            weekAnalysis.inventory.totalTests += entry.stats.total || 0;
            weekAnalysis.inventory.passedTests += entry.stats.reussis || 0;
            weekAnalysis.inventory.failedTests += entry.stats.echoues || 0;
          }
        });

        if (inventoryAvg < 85) {
          const severity = inventoryAvg < 70 ? 'critical' : 'warning';
          const detection = {
            type: 'inventory_degradation',
            severity,
            category: 'Qualité Inventaire',
            title: `Qualité inventaire dégradée (${Math.round(inventoryAvg)}%)`,
            description: `${weekAnalysis.inventory.failedTests} tests échoués sur ${weekAnalysis.inventory.totalTests} effectués.`,
            impact: severity === 'critical' ? 'Risque produits non-conformes' : 'Surveillance renforcée requise',
            week: week.week,
            realData: {
              totalTests: weekAnalysis.inventory.totalTests,
              failureRate: weekAnalysis.inventory.totalTests > 0 ? (weekAnalysis.inventory.failedTests / weekAnalysis.inventory.totalTests * 100) : 0,
              passedTests: weekAnalysis.inventory.passedTests
            }
          };
          allDetections.push(detection);
          weekAnalysis.detectedEvents.push(detection);
          weekAnalysis.inventory.issues.push(`${weekAnalysis.inventory.failedTests} tests échoués`);
        }
      }

      // Determine overall status
      const criticalEvents = weekAnalysis.detectedEvents.filter(e => e.severity === 'critical').length;
      const warningEvents = weekAnalysis.detectedEvents.filter(e => e.severity === 'warning').length;
      
      if (criticalEvents > 0) {
        weekAnalysis.overallStatus = 'critical';
      } else if (warningEvents > 0) {
        weekAnalysis.overallStatus = 'warning';
      } else if (weekAnalysis.reception.average >= 90 && weekAnalysis.waste.average >= 80 && weekAnalysis.inventory.average >= 95) {
        weekAnalysis.overallStatus = 'excellent';
      } else if (weekAnalysis.reception.average >= 85 && weekAnalysis.waste.average >= 75 && weekAnalysis.inventory.average >= 90) {
        weekAnalysis.overallStatus = 'good';
      }

      weeklyBreakdown.push(weekAnalysis);
    });

    // Calculate monthly performance
    const monthlyPerformance = {
      reception: receptionData.length > 0 ? Math.round(receptionData.reduce((sum, entry) => sum + entry.value, 0) / receptionData.length) : 0,
      waste: wasteData.length > 0 ? Math.round(wasteData.reduce((sum, entry) => sum + entry.value, 0) / wasteData.length) : 0,
      inventory: inventoryData.length > 0 ? Math.round(inventoryData.reduce((sum, entry) => sum + entry.value, 0) / inventoryData.length) : 0
    };
    monthlyPerformance.overall = Math.round((monthlyPerformance.reception + monthlyPerformance.waste + monthlyPerformance.inventory) / 3);

    return {
      monthName: monthNames[selectedMonth],
      year: selectedYear,
      monthlyPerformance,
      weeklyBreakdown: weeklyBreakdown.sort((a, b) => a.week - b.week),
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity] || b.week - a.week;
      }),
      statistics: {
        totalEntries: receptionData.length + wasteData.length + inventoryData.length,
        totalDetections: allDetections.length,
        criticalIssues: allDetections.filter(d => d.severity === 'critical').length,
        warningIssues: allDetections.filter(d => d.severity === 'warning').length,
        excellentWeeks: weeklyBreakdown.filter(w => w.overallStatus === 'excellent').length,
        categoryBreakdown: {
          'Réception Matières': allDetections.filter(d => d.category === 'Réception Matières').length,
          'Contrôle Gaspillage': allDetections.filter(d => d.category === 'Contrôle Gaspillage').length,
          'Qualité Inventaire': allDetections.filter(d => d.category === 'Qualité Inventaire').length
        },
        weeksAnalyzed: weeklyBreakdown.length,
        totalBatches: weeklyBreakdown.reduce((sum, week) => sum + week.reception.totalBatches, 0),
        conformBatches: weeklyBreakdown.reduce((sum, week) => sum + week.reception.conformeBatches, 0),
        totalTests: weeklyBreakdown.reduce((sum, week) => sum + week.inventory.totalTests, 0),
        passedTests: weeklyBreakdown.reduce((sum, week) => sum + week.inventory.passedTests, 0),
        totalWasted: weeklyBreakdown.reduce((sum, week) => sum + week.waste.totalWasted, 0),
        daysInMonth: monthEnd.getDate()
      },
      hasData: receptionData.length > 0 || wasteData.length > 0 || inventoryData.length > 0
    };
  }, [analytics, selectedMonth, selectedYear]);

  if (!monthlyAnalysis || !monthlyAnalysis.hasData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl backdrop-blur-sm ${
          isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée qualité disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée qualité trouvée pour {new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:from-emerald-700 hover:to-teal-800 transition-all duration-200 font-medium shadow-lg"
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
        name: 'Réception Matières',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.reception.average),
        smooth: true,
        lineStyle: { color: '#10B981', width: 4 },
        itemStyle: { color: '#10B981', borderWidth: 3, borderColor: '#FFFFFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        }
      },
      {
        name: 'Contrôle Gaspillage',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.waste.average),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 4 },
        itemStyle: { color: '#3B82F6', borderWidth: 3, borderColor: '#FFFFFF' }
      },
      {
        name: 'Qualité Inventaire',
        type: 'line',
        data: monthlyAnalysis.weeklyBreakdown.map(week => week.inventory.average),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 4 },
        itemStyle: { color: '#8B5CF6', borderWidth: 3, borderColor: '#FFFFFF' }
      }
    ]
  });

  const getKPIDistributionChart = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);',
      formatter: '{b}: {c}%'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        { 
          value: monthlyAnalysis.monthlyPerformance.reception, 
          name: 'Réception', 
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
          value: monthlyAnalysis.monthlyPerformance.waste, 
          name: 'Gaspillage', 
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
          value: monthlyAnalysis.monthlyPerformance.inventory, 
          name: 'Inventaire', 
          itemStyle: { 
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 1,
              colorStops: [
                { offset: 0, color: '#8B5CF6' },
                { offset: 1, color: '#7C3AED' }
              ]
            }
          }
        }
      ],
      label: {
        color: isDark ? '#E2E8F0' : '#1E293B',
        fontSize: 12,
        formatter: '{b}\n{c}%'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }]
  });

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

  const getCategoryBreakdownChart = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Object.keys(monthlyAnalysis.statistics.categoryBreakdown),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } }
    },
    series: [{
      type: 'bar',
      data: Object.values(monthlyAnalysis.statistics.categoryBreakdown).map((value, index) => ({
        value,
        itemStyle: {
          color: ['#10B981', '#3B82F6', '#8B5CF6'][index]
        }
      })),
      barWidth: '60%'
    }]
  });

  const getOverviewChart = () => {
    const kpiData = [
      {
        name: 'Réception',
        value: monthlyAnalysis.monthlyPerformance.reception,
        target: 90,
        itemStyle: { color: '#10B981' }
      },
      {
        name: 'Gaspillage',
        value: monthlyAnalysis.monthlyPerformance.waste,
        target: 80,
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: 'Inventaire',
        value: monthlyAnalysis.monthlyPerformance.inventory,
        target: 95,
        itemStyle: { color: '#8B5CF6' }
      }
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);',
        formatter: function(params) {
          const item = kpiData[params.dataIndex];
          return `<strong>${params.name}</strong><br/>Valeur: ${params.value}%<br/>Cible: ${item.target}%`;
        }
      },
      legend: {
        bottom: '5%',
        textStyle: { color: isDark ? '#CBD5E1' : '#64748B' }
      },
      series: [{
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '45%'],
        data: kpiData,
        label: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          formatter: '{b}: {c}%'
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
          <title>Rapport Qualité - ${monthlyAnalysis.monthName} ${monthlyAnalysis.year}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
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
            <h1>🧪 Rapport Qualité Mensuel</h1>
            <div class="subtitle">${monthlyAnalysis.monthName} ${monthlyAnalysis.year} • Performance Globale: ${monthlyAnalysis.monthlyPerformance.overall}%</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>📦 Réception Matières</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.reception}%</h2>
            </div>
            <div class="stat-card">
              <h3>♻️ Contrôle Gaspillage</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.waste}%</h2>
            </div>
            <div class="stat-card">
              <h3>📋 Qualité Inventaire</h3>
              <h2>${monthlyAnalysis.monthlyPerformance.inventory}%</h2>
            </div>
            <div class="stat-card">
              <h3>⭐ Semaines Excellentes</h3>
              <h2>${monthlyAnalysis.statistics.excellentWeeks}</h2>
            </div>
          </div>

          <div class="metric">
            <h2>📊 Statistiques Clés</h2>
            <ul>
              <li><strong>Semaines analysées:</strong> ${monthlyAnalysis.statistics.weeksAnalyzed}</li>
              <li><strong>Total entrées:</strong> ${monthlyAnalysis.statistics.totalEntries}</li>
              <li><strong>Lots conformes:</strong> ${monthlyAnalysis.statistics.conformBatches}/${monthlyAnalysis.statistics.totalBatches}</li>
              <li><strong>Tests réussis:</strong> ${monthlyAnalysis.statistics.passedTests}/${monthlyAnalysis.statistics.totalTests}</li>
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
      week.reception.average,
      week.waste.average,
      week.inventory.average,
      week.overallStatus,
      week.detectedEvents.length
    ]);
    
    const csvContent = [
      ['Semaine', 'Date', 'Réception', 'Gaspillage', 'Inventaire', 'Statut', 'Détections'],
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_qualite_${monthlyAnalysis.monthName.toLowerCase()}_${monthlyAnalysis.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-md">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Qualité Mensuel
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
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
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
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"></div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <h2 className={`text-2xl font-light ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                            Performance Qualité
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
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { title: 'Réception', value: monthlyAnalysis.monthlyPerformance.reception, icon: Package2, color: 'emerald', subtitle: 'Lots conformes' },
                          { title: 'Gaspillage', value: monthlyAnalysis.monthlyPerformance.waste, icon: Trash2, color: 'blue', subtitle: 'Contrôle efficace' },
                          { title: 'Inventaire', value: monthlyAnalysis.monthlyPerformance.inventory, icon: List, color: 'purple', subtitle: 'Tests qualité' }
                        ].map((kpi, index) => (
                          <div key={index} className={`p-5 rounded-2xl ${
                            isDark ? 'bg-slate-700/20 border border-slate-600/30' : 'bg-slate-50/50 border border-slate-200/50'
                          } backdrop-blur-sm`}>
                            
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                kpi.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600' :
                                kpi.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                                'bg-purple-500/15 text-purple-600'
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
                                  kpi.value >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
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
                          Lots Conformes
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.conformBatches}/{monthlyAnalysis.statistics.totalBatches}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Tests Réussis
                        </span>
                        <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {monthlyAnalysis.statistics.passedTests}/{monthlyAnalysis.statistics.totalTests}
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
                            {Math.round((week.reception.average + week.waste.average + week.inventory.average) / 3)}%
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
                      Tendances Qualité Hebdomadaires
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Évolution des métriques qualité par semaine
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-emerald-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Réception</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Gaspillage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-purple-500"></div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Inventaire</span>
                    </div>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getWeeklyTrendChart()} 
                  style={{ height: '280px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Tendances Hebdomadaires
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Évolution des KPIs qualité par semaine
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getWeeklyTrendChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* KPI Distribution */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Distribution Qualité
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Répartition des performances moyennes
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getKPIDistributionChart()} 
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
                        Répartition des Détections
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

                {/* Category Breakdown */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <BarChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Problèmes par Catégorie
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Volume des alertes par domaine
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getCategoryBreakdownChart()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
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
                    Analyse Qualité Hebdomadaire
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Sélectionnez une semaine pour explorer les métriques qualité en détail
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
                            'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-300/50 shadow-lg' :
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
                            'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' :
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
                            isDark ? 'text-emerald-300' : 'text-emerald-600' :
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
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-400/30"></div>
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
                                selectedWeek.overallStatus === 'excellent' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { 
                              title: 'Réception Matières', 
                              value: selectedWeek.reception.average, 
                              icon: Package2, 
                              color: 'emerald',
                              subtitle: `${selectedWeek.reception.conformeBatches}/${selectedWeek.reception.totalBatches} lots`
                            },
                            { 
                              title: 'Contrôle Gaspillage', 
                              value: selectedWeek.waste.average, 
                              icon: Trash2, 
                              color: 'blue',
                              subtitle: `${Math.round(selectedWeek.waste.totalWasted)} produits`
                            },
                            { 
                              title: 'Qualité Inventaire', 
                              value: selectedWeek.inventory.average, 
                              icon: List, 
                              color: 'purple',
                              subtitle: `${selectedWeek.inventory.passedTests}/${selectedWeek.inventory.totalTests} tests`
                            }
                          ].map((metric, index) => (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                              isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                            }`}>
                              <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  metric.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600' :
                                  metric.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                                  'bg-purple-500/15 text-purple-600'
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
                                    metric.value >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
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
                                  Alertes Qualité
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
                  {monthlyAnalysis.monthlyPerformance.overall}% Performance Qualité
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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
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

export default QualityMonthlyReport;