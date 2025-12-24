import React, { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  Users,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Gauge,
  LineChart,
  CheckCircle,
  AlertTriangle,
  Brain,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useTeamsKPIData } from '../../hooks/useTeamsKPIData'; // Import the real hook

// Utility functions
const groupDataByQuarters = (data, year) => {
  const filteredData = data.filter(entry => {
    const entryYear = new Date(entry.kpi_date).getFullYear();
    return entryYear === year;
  });

  const quarters = {
    Q1: { months: [0, 1, 2], data: [], name: 'T1' },
    Q2: { months: [3, 4, 5], data: [], name: 'T2' },
    Q3: { months: [6, 7, 8], data: [], name: 'T3' },
    Q4: { months: [9, 10, 11], data: [], name: 'T4' }
  };

  filteredData.forEach(entry => {
    const month = new Date(entry.kpi_date).getMonth();
    Object.keys(quarters).forEach(quarter => {
      if (quarters[quarter].months.includes(month)) {
        quarters[quarter].data.push(entry);
      }
    });
  });

  return { filteredData, quarters };
};

const groupDataByMonths = (data, year) => {
  const filteredData = data.filter(entry => {
    const entryYear = new Date(entry.kpi_date).getFullYear();
    return entryYear === year;
  });

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const months = {};

  for (let i = 0; i < 12; i++) {
    months[i] = {
      monthIndex: i,
      monthName: monthNames[i],
      data: []
    };
  }

  filteredData.forEach(entry => {
    const month = new Date(entry.kpi_date).getMonth();
    if (months[month]) {
      months[month].data.push(entry);
    }
  });

  return { filteredData, months };
};

const calculateQuarterlyAverage = (data) => {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, entry) => acc + (entry.kpi_value || 0), 0);
  return Math.round(sum / data.length);
};

const getPerformanceColor = (score) => {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 75) return 'text-blue-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

const exportToPDF = (title, year, data) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${title} - ${year}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
          h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
          .subtitle { font-size: 1.2em; opacity: 0.9; margin-top: 10px; }
          .metric { margin: 15px 0; padding: 20px; border: 1px solid #e1e5e9; border-radius: 12px; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 ${title}</h1>
          <div class="subtitle">${year} • Performance Globale: ${data.overall}%</div>
        </div>
        <div class="metric">
          <h2>📊 Données de Performance</h2>
          ${data.details}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

const exportToCSV = (filename, headers, data) => {
  const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const TeamYearlyReport = ({ isDark, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null);
  const [teamsData, setTeamsData] = useState(null);

  // Use the real Supabase hook
  const { 
    kpiData,
    isLoading, 
    error, 
    getTeamAnalytics,
    refreshData 
  } = useTeamsKPIData();

  // Load Teams data using the same pattern as R&D
  useEffect(() => {
    const loadData = async () => {
      try {
        if (kpiData) {
          const analytics = getTeamAnalytics('team');
          setTeamsData(analytics);
        }
      } catch (err) {
        console.error('Error loading Teams data:', err);
      }
    };
    loadData();
  }, [kpiData, getTeamAnalytics]);

  const refreshTeamsData = async () => {
    try {
      await refreshData();
    } catch (err) {
      console.error('Error refreshing Teams data:', err);
    }
  };

  const yearlyAnalysis = useMemo(() => {
    if (!kpiData || isLoading || !teamsData) return null;

    // Use the data from kpiData (same as mock structure)
    const attendanceData = kpiData.team_productivity_attendance || [];
    const efficiencyData = kpiData.operator_efficiency || [];
    const safetyData = kpiData.safety_incidents || [];

    const { filteredData: filteredAttendance } = groupDataByQuarters(attendanceData, selectedYear);
    const { filteredData: filteredEfficiency } = groupDataByQuarters(efficiencyData, selectedYear);
    const { filteredData: filteredSafety } = groupDataByQuarters(safetyData, selectedYear);

    if (filteredAttendance.length === 0 && filteredEfficiency.length === 0 && filteredSafety.length === 0) {
      return null;
    }

    const quarters = {
      Q1: { months: [0, 1, 2], attendance: [], efficiency: [], safety: [], name: 'T1' },
      Q2: { months: [3, 4, 5], attendance: [], efficiency: [], safety: [], name: 'T2' },
      Q3: { months: [6, 7, 8], attendance: [], efficiency: [], safety: [], name: 'T3' },
      Q4: { months: [9, 10, 11], attendance: [], efficiency: [], safety: [], name: 'T4' }
    };

    [filteredAttendance, filteredEfficiency, filteredSafety].forEach((dataArray, type) => {
      const typeKey = ['attendance', 'efficiency', 'safety'][type];
      dataArray.forEach(entry => {
        const month = new Date(entry.kpi_date).getMonth();
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
          average: calculateQuarterlyAverage(quarter.attendance),
          entries: quarter.attendance.length,
          totalEmployees: 0,
          presentEmployees: 0
        },
        efficiency: {
          average: calculateQuarterlyAverage(quarter.efficiency),
          entries: quarter.efficiency.length,
          totalTasks: 0,
          completedTasks: 0,
          operators: 0
        },
        safety: {
          average: quarter.safety.length > 0 ? calculateQuarterlyAverage(quarter.safety) : 100,
          entries: quarter.safety.length,
          totalIncidents: 0,
          criticalIncidents: 0
        },
        detectedEvents: [],
        overallStatus: 'good'
      };

      // Analyze attendance
      if (quarter.attendance.length > 0) {
        quarter.attendance.forEach(entry => {
          if (entry.employees) {
            quarterAnalysis.attendance.totalEmployees += entry.employees.length;
            quarterAnalysis.attendance.presentEmployees += entry.employees.filter(emp => emp.workHours > 0).length;
          }
        });

        if (quarterAnalysis.attendance.average < 75) {
          const severity = quarterAnalysis.attendance.average < 60 ? 'critical' : 'warning';
          const detection = {
            type: 'quarterly_attendance_degradation',
            severity,
            category: 'Productivité Équipe',
            title: `Productivité ${quarter.name} faible (${quarterAnalysis.attendance.average}%)`,
            description: `Performance d'équipe trimestrielle en dessous des standards.`,
            impact: severity === 'critical' ? 'Impact majeur sur la production' : 'Optimisation requise',
            quarter: quarterKey
          };
          allDetections.push(detection);
          quarterAnalysis.detectedEvents.push(detection);
        }
      }

      // Analyze efficiency
      if (quarter.efficiency.length > 0) {
        quarter.efficiency.forEach(entry => {
          if (entry.employees) {
            quarterAnalysis.efficiency.operators += entry.employees.length;
            entry.employees.forEach(emp => {
              quarterAnalysis.efficiency.totalTasks += emp.tasks?.length || 0;
              quarterAnalysis.efficiency.completedTasks += emp.tasks?.filter(t => t.completed).length || 0;
            });
          }
        });

        if (quarterAnalysis.efficiency.average < 70) {
          const severity = quarterAnalysis.efficiency.average < 50 ? 'critical' : 'warning';
          const detection = {
            type: 'quarterly_efficiency_loss',
            severity,
            category: 'Efficacité Opérationnelle',
            title: `Efficacité ${quarter.name} faible (${quarterAnalysis.efficiency.average}%)`,
            description: `${quarterAnalysis.efficiency.completedTasks}/${quarterAnalysis.efficiency.totalTasks} tâches accomplies.`,
            impact: severity === 'critical' ? 'Perte de productivité majeure' : 'Optimisation des processus requise',
            quarter: quarterKey
          };
          allDetections.push(detection);
          quarterAnalysis.detectedEvents.push(detection);
        }
      }

      // Analyze safety
      if (quarter.safety.length > 0) {
        quarter.safety.forEach(entry => {
          quarterAnalysis.safety.totalIncidents += entry.total_incidents || 0;
          if (entry.incidents) {
            quarterAnalysis.safety.criticalIncidents += entry.incidents.filter(inc => inc.severity === 'critical').length;
          }
        });

        if (quarterAnalysis.safety.average < 85) {
          const severity = quarterAnalysis.safety.average < 70 ? 'critical' : 'warning';
          const detection = {
            type: 'quarterly_safety_degradation',
            severity,
            category: 'Sécurité Workplace',
            title: `Score sécurité ${quarter.name} dégradé (${quarterAnalysis.safety.average}%)`,
            description: `${quarterAnalysis.safety.totalIncidents} incidents détectés avec ${quarterAnalysis.safety.criticalIncidents} critiques.`,
            impact: severity === 'critical' ? 'Risque sécuritaire élevé' : 'Surveillance renforcée requise',
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
      } else if (quarterAnalysis.attendance.average >= 90 && quarterAnalysis.safety.average >= 95 && quarterAnalysis.efficiency.average >= 85) {
        quarterAnalysis.overallStatus = 'excellent';
      }

      quarterlyBreakdown.push(quarterAnalysis);
    });

    // Calculate yearly performance
    const yearlyPerformance = {
      attendance: filteredAttendance.length > 0 ? calculateQuarterlyAverage(filteredAttendance) : 0,
      efficiency: filteredEfficiency.length > 0 ? calculateQuarterlyAverage(filteredEfficiency) : 0,
      safety: filteredSafety.length > 0 ? calculateQuarterlyAverage(filteredSafety) : 100
    };
    yearlyPerformance.overall = Math.round((yearlyPerformance.attendance + yearlyPerformance.efficiency + yearlyPerformance.safety) / 3);

    // Monthly breakdown analysis
    const { months: attendanceMonths } = groupDataByMonths(attendanceData, selectedYear);
    const { months: efficiencyMonths } = groupDataByMonths(efficiencyData, selectedYear);
    const { months: safetyMonths } = groupDataByMonths(safetyData, selectedYear);

    const monthlyBreakdown = [];
    const monthlyTrends = { attendance: [], efficiency: [], safety: [] };

    for (let i = 0; i < 12; i++) {
      const attendanceMonth = attendanceMonths[i]?.data || [];
      const efficiencyMonth = efficiencyMonths[i]?.data || [];
      const safetyMonth = safetyMonths[i]?.data || [];

      const monthAnalysis = {
        monthIndex: i,
        monthName: attendanceMonths[i]?.monthName || '',
        attendance: {
          average: calculateQuarterlyAverage(attendanceMonth),
          hasData: attendanceMonth.length > 0,
          totalEmployees: 0,
          presentEmployees: 0
        },
        efficiency: {
          average: calculateQuarterlyAverage(efficiencyMonth),
          hasData: efficiencyMonth.length > 0,
          totalTasks: 0,
          completedTasks: 0,
          totalProductionKg: 0
        },
        safety: {
          average: safetyMonth.length > 0 ? calculateQuarterlyAverage(safetyMonth) : 100,
          hasData: safetyMonth.length > 0,
          totalIncidents: 0,
          criticalIncidents: 0
        }
      };

      // Analyze attendance for this month
      if (attendanceMonth.length > 0) {
        attendanceMonth.forEach(entry => {
          if (entry.employees) {
            monthAnalysis.attendance.totalEmployees += entry.employees.length;
            monthAnalysis.attendance.presentEmployees += entry.employees.filter(emp =>
              emp.attendance_records && emp.attendance_records.length > 0
            ).length;
          }
        });
      }

      // Analyze efficiency for this month
      if (efficiencyMonth.length > 0) {
        efficiencyMonth.forEach(entry => {
          if (entry.employees) {
            entry.employees.forEach(emp => {
              monthAnalysis.efficiency.totalTasks += emp.tasks?.length || 0;
              monthAnalysis.efficiency.completedTasks += emp.tasks?.filter(t => t.completed).length || 0;
              monthAnalysis.efficiency.totalProductionKg += emp.total_production_kg || 0;
            });
          }
        });
      }

      // Analyze safety for this month
      if (safetyMonth.length > 0) {
        safetyMonth.forEach(entry => {
          monthAnalysis.safety.totalIncidents += entry.total_incidents || 0;
          if (entry.incidents) {
            monthAnalysis.safety.criticalIncidents += entry.incidents.filter(inc => inc.severity === 'critical').length;
          }
        });
      }

      monthlyBreakdown.push(monthAnalysis);
      monthlyTrends.attendance.push(monthAnalysis.attendance.average);
      monthlyTrends.efficiency.push(monthAnalysis.efficiency.average);
      monthlyTrends.safety.push(monthAnalysis.safety.average);
    }

    // Calculate monthly insights
    const monthsWithData = monthlyBreakdown.filter(m => m.attendance.hasData || m.efficiency.hasData || m.safety.hasData);
    const bestMonth = monthsWithData.reduce((best, month) => {
      const monthScore = Math.round((month.attendance.average + month.efficiency.average + month.safety.average) / 3);
      const bestScore = Math.round((best.attendance.average + best.efficiency.average + best.safety.average) / 3);
      return monthScore > bestScore ? month : best;
    }, monthlyBreakdown[0] || {});

    const worstMonth = monthsWithData.reduce((worst, month) => {
      const monthScore = Math.round((month.attendance.average + month.efficiency.average + month.safety.average) / 3);
      const worstScore = Math.round((worst.attendance.average + worst.efficiency.average + worst.safety.average) / 3);
      return monthScore < worstScore ? month : worst;
    }, monthlyBreakdown[0] || {});

    const monthlyInsights = {
      bestMonth: bestMonth?.monthName || 'N/A',
      worstMonth: worstMonth?.monthName || 'N/A',
      monthsAboveTarget: monthsWithData.filter(m =>
        (m.attendance.average + m.efficiency.average + m.safety.average) / 3 >= 85
      ).length,
      monthsNeedingAttention: monthsWithData.filter(m =>
        m.attendance.average < 75 || m.efficiency.average < 70 || m.safety.average < 85
      ).length,
      totalProductionKg: monthlyBreakdown.reduce((sum, m) => sum + m.efficiency.totalProductionKg, 0),
      averageMonthlyIncidents: monthsWithData.length > 0 ?
        Math.round(monthlyBreakdown.reduce((sum, m) => sum + m.safety.totalIncidents, 0) / monthsWithData.length) : 0
    };

    return {
      year: selectedYear,
      yearlyPerformance,
      quarterlyBreakdown,
      monthlyBreakdown,
      monthlyTrends,
      monthlyInsights,
      detections: allDetections.sort((a, b) => {
        const severityOrder = { 'critical': 3, 'warning': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      statistics: {
        totalEntries: filteredAttendance.length + filteredEfficiency.length + filteredSafety.length,
        attendanceEntries: filteredAttendance.length,
        efficiencyEntries: filteredEfficiency.length,
        safetyEntries: filteredSafety.length,
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
      hasData: filteredAttendance.length > 0 || filteredEfficiency.length > 0 || filteredSafety.length > 0
    };
  }, [kpiData, selectedYear, isLoading, teamsData]);

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
              Récupération des données équipe depuis Supabase
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
                onClick={refreshTeamsData}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors text-sm"
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée d'équipe trouvée pour l'année {selectedYear}.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-xl hover:from-pink-700 hover:to-rose-800 transition-all duration-200 font-medium shadow-lg"
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
        name: 'Productivité',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.attendance.average),
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
      },
      {
        name: 'Sécurité',
        type: 'line',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.safety.average),
        smooth: true,
        lineStyle: { color: '#6366F1', width: 4 },
        itemStyle: { color: '#6366F1', borderWidth: 3, borderColor: '#FFFFFF' }
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
        name: 'Productivité',
        type: 'bar',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.attendance.average),
        itemStyle: { 
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Sécurité',
        type: 'bar',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.safety.average),
        itemStyle: { 
          color: '#6366F1',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Efficacité',
        type: 'bar',
        data: yearlyAnalysis.quarterlyBreakdown.map(q => q.efficiency.average),
        itemStyle: { 
          color: '#8B5CF6',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  });

  const handleExportToPDF = () => {
    const data = {
      overall: yearlyAnalysis.yearlyPerformance.overall,
      details: `
        <p><strong>Productivité:</strong> ${yearlyAnalysis.yearlyPerformance.attendance}%</p>
        <p><strong>Sécurité:</strong> ${yearlyAnalysis.yearlyPerformance.safety}%</p>
        <p><strong>Efficacité:</strong> ${yearlyAnalysis.yearlyPerformance.efficiency}%</p>
        <p><strong>Employés:</strong> ${yearlyAnalysis.statistics.totalEmployees}</p>
        <p><strong>Incidents:</strong> ${yearlyAnalysis.statistics.totalIncidents}</p>
        <p><strong>Tâches terminées:</strong> ${yearlyAnalysis.statistics.completedTasks}/${yearlyAnalysis.statistics.totalTasks}</p>
      `
    };
    exportToPDF(`Rapport Équipe Annuel`, yearlyAnalysis.year, data);
  };

  const handleExportToCSV = () => {
    const csvData = yearlyAnalysis.quarterlyBreakdown.map(quarter => [
      quarter.quarterName,
      quarter.attendance.average,
      quarter.safety.average,
      quarter.efficiency.average,
      quarter.attendance.totalEmployees,
      quarter.safety.totalIncidents,
      quarter.efficiency.totalTasks,
      quarter.efficiency.completedTasks,
      quarter.overallStatus
    ]);
    
    exportToCSV(
      `rapport_equipe_annuel_${yearlyAnalysis.year}.csv`,
      ['Trimestre', 'Productivité %', 'Sécurité %', 'Efficacité %', 'Employés', 'Incidents', 'Tâches Total', 'Tâches Complétées', 'Statut'],
      csvData
    );
  };

  const navigateYear = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getOverallStatus = () => {
    const score = yearlyAnalysis.yearlyPerformance.overall;
    if (score >= 90) return { status: 'excellent', color: 'blue', text: 'Excellent', icon: CheckCircle };
    if (score >= 75) return { status: 'good', color: 'blue', text: 'Bon', icon: Activity };
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Équipe Annuel
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
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                      : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Vue d'ensemble</span>
                </button>
                <button
                  onClick={() => setSelectedView('monthly')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedView === 'monthly'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                      : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Mensuel</span>
                </button>
                <button
                  onClick={() => setSelectedView('quarterly')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedView === 'quarterly'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                      : isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Trimestriel</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshTeamsData}
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
                      overallStatus.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-red-500 to-pink-600'
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
                    { title: 'Productivité', value: yearlyAnalysis.yearlyPerformance.attendance, icon: Users, color: 'blue', subtitle: `${yearlyAnalysis.statistics.totalEmployees} employés` },
                    { title: 'Sécurité', value: yearlyAnalysis.yearlyPerformance.safety, icon: Shield, color: 'indigo', subtitle: `${yearlyAnalysis.statistics.totalIncidents} incidents` },
                    { title: 'Efficacité', value: yearlyAnalysis.yearlyPerformance.efficiency, icon: Zap, color: 'purple', subtitle: `${yearlyAnalysis.statistics.completedTasks}/${yearlyAnalysis.statistics.totalTasks} tâches` },
                    { title: 'Données', value: yearlyAnalysis.statistics.totalEntries, icon: Gauge, color: 'amber', subtitle: 'entrées totales', isCount: true }
                  ].map((metric, index) => (
                    <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      isDark ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50/50 border-slate-200/50'
                    }`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          metric.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                          metric.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-600' :
                          metric.color === 'purple' ? 'bg-purple-500/15 text-purple-600' :
                          'bg-amber-500/15 text-amber-600'
                        }`}>
                          <metric.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {metric.title}
                        </span>
                      </div>
                      
                      <div className={`text-2xl font-light mb-2 ${metric.isCount ? 'text-amber-600' : getPerformanceColor(metric.value)}`}>
                        {metric.isCount ? metric.value : `${metric.value}%`}
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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
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
                            'bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-400/50 shadow-lg' :
                          quarter.overallStatus === 'excellent' ?
                            isDark ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10' : 'bg-blue-50/50 border-blue-200/50 hover:bg-blue-50' :
                          quarter.overallStatus === 'critical' ?
                            isDark ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' : 'bg-red-50/50 border-red-200/50 hover:bg-red-50' :
                          quarter.overallStatus === 'warning' ?
                            isDark ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10' : 'bg-amber-50/50 border-amber-200/50 hover:bg-amber-50' :
                            isDark ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50' : 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                          isSelected ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white' :
                          quarter.overallStatus === 'excellent' ? 'bg-blue-500/80 text-white' :
                          quarter.overallStatus === 'critical' ? 'bg-red-500/80 text-white' :
                          quarter.overallStatus === 'warning' ? 'bg-amber-500/80 text-white' : 
                          isDark ? 'bg-slate-600/80 text-slate-200' : 'bg-slate-400/80 text-white'
                        }`}>
                          <span className="text-sm font-medium">{quarter.quarterName}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          isSelected ? isDark ? 'text-pink-300' : 'text-pink-600' :
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Trimestre {quarter.quarterName}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {Math.round((quarter.attendance.average + quarter.safety.average + quarter.efficiency.average) / 3)}% global
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
                                selectedQuarter.overallStatus === 'excellent' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
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
                                  {selectedQuarter.detectedEvents.length} détections • {selectedQuarter.attendance.entries + selectedQuarter.efficiency.entries + selectedQuarter.safety.entries} entrées
                                </p>
                              </div>
                            </div>
                            
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                              isDark ? 'bg-slate-700/50' : 'bg-slate-100/70'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                selectedQuarter.overallStatus === 'excellent' ? 'bg-blue-500' :
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { 
                              title: 'Productivité', 
                              value: selectedQuarter.attendance.average, 
                              icon: Users, 
                              color: 'blue',
                              subtitle: `${selectedQuarter.attendance.totalEmployees} employés`
                            },
                            { 
                              title: 'Sécurité', 
                              value: selectedQuarter.safety.average, 
                              icon: Shield, 
                              color: 'indigo',
                              subtitle: `${selectedQuarter.safety.totalIncidents} incidents`
                            },
                            { 
                              title: 'Efficacité', 
                              value: selectedQuarter.efficiency.average, 
                              icon: Zap, 
                              color: 'purple',
                              subtitle: `${selectedQuarter.efficiency.completedTasks}/${selectedQuarter.efficiency.totalTasks} tâches`
                            }
                          ].map((metric, index) => (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                              isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/60 border-slate-200/50'
                            }`}>
                              <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  metric.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                                  metric.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-600' :
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
                                    metric.value >= 90 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
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

          {selectedView === 'monthly' && (
            <div className="h-full p-6 overflow-y-auto space-y-6">

              {/* Monthly Insights Summary */}
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Insights Mensuels {yearlyAnalysis.year}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Analyse détaillée des performances par mois
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      title: 'Meilleur Mois',
                      value: yearlyAnalysis.monthlyInsights.bestMonth,
                      icon: Award,
                      color: 'emerald',
                      subtitle: 'Performance optimale'
                    },
                    {
                      title: 'Mois à Améliorer',
                      value: yearlyAnalysis.monthlyInsights.worstMonth,
                      icon: AlertTriangle,
                      color: 'amber',
                      subtitle: 'Nécessite attention'
                    },
                    {
                      title: 'Mois au-dessus Cible',
                      value: yearlyAnalysis.monthlyInsights.monthsAboveTarget,
                      icon: Target,
                      color: 'blue',
                      subtitle: 'Sur 12 mois',
                      isCount: true
                    },
                    {
                      title: 'Production Totale',
                      value: Math.round(yearlyAnalysis.monthlyInsights.totalProductionKg),
                      icon: Zap,
                      color: 'purple',
                      subtitle: 'kg/année',
                      isCount: true
                    }
                  ].map((insight, index) => (
                    <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      isDark ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50/50 border-slate-200/50'
                    }`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          insight.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600' :
                          insight.color === 'amber' ? 'bg-amber-500/15 text-amber-600' :
                          insight.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                          'bg-purple-500/15 text-purple-600'
                        }`}>
                          <insight.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {insight.title}
                      </div>
                      <div className={`text-2xl font-light mb-2 ${
                        insight.color === 'emerald' ? 'text-emerald-500' :
                        insight.color === 'amber' ? 'text-amber-500' :
                        insight.color === 'blue' ? 'text-blue-500' :
                        'text-purple-500'
                      }`}>
                        {insight.value}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {insight.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trends Chart */}
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Tendances Mensuelles
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Évolution des KPIs sur 12 mois
                    </p>
                  </div>
                </div>

                <ReactECharts
                  option={{
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
                      extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
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
                      data: yearlyAnalysis.monthlyBreakdown.map(m => m.monthName),
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
                        name: 'Productivité',
                        type: 'line',
                        data: yearlyAnalysis.monthlyTrends.attendance,
                        smooth: true,
                        lineStyle: { color: '#3B82F6', width: 3 },
                        itemStyle: { color: '#3B82F6', borderWidth: 2, borderColor: '#FFFFFF' },
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
                      },
                      {
                        name: 'Efficacité',
                        type: 'line',
                        data: yearlyAnalysis.monthlyTrends.efficiency,
                        smooth: true,
                        lineStyle: { color: '#8B5CF6', width: 3 },
                        itemStyle: { color: '#8B5CF6', borderWidth: 2, borderColor: '#FFFFFF' }
                      },
                      {
                        name: 'Sécurité',
                        type: 'line',
                        data: yearlyAnalysis.monthlyTrends.safety,
                        smooth: true,
                        lineStyle: { color: '#6366F1', width: 3 },
                        itemStyle: { color: '#6366F1', borderWidth: 2, borderColor: '#FFFFFF' }
                      }
                    ]
                  }}
                  style={{ height: '320px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>

              {/* Monthly Grid */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Détails Mensuels
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {yearlyAnalysis.monthlyBreakdown.map((month, index) => {
                    const hasData = month.attendance.hasData || month.efficiency.hasData || month.safety.hasData;
                    const monthScore = Math.round((month.attendance.average + month.efficiency.average + month.safety.average) / 3);

                    return (
                      <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        !hasData ?
                          isDark ? 'bg-slate-800/20 border-slate-700/30 opacity-50' : 'bg-slate-50/30 border-slate-200/30 opacity-50' :
                        monthScore >= 90 ?
                          isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200/50' :
                        monthScore >= 75 ?
                          isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50/50 border-blue-200/50' :
                        monthScore >= 60 ?
                          isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/50 border-amber-200/50' :
                          isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/50 border-red-200/50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {month.monthName}
                          </div>
                          {hasData && (
                            <div className={`text-lg font-light ${getPerformanceColor(monthScore)}`}>
                              {monthScore}%
                            </div>
                          )}
                        </div>

                        {hasData ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Productivité</span>
                              <span className={`font-medium ${getPerformanceColor(month.attendance.average)}`}>
                                {month.attendance.average}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Efficacité</span>
                              <span className={`font-medium ${getPerformanceColor(month.efficiency.average)}`}>
                                {month.efficiency.average}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Sécurité</span>
                              <span className={`font-medium ${getPerformanceColor(month.safety.average)}`}>
                                {month.safety.average}%
                              </span>
                            </div>

                            {month.efficiency.totalProductionKg > 0 && (
                              <div className={`mt-3 pt-2 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Production</span>
                                  <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                    {Math.round(month.efficiency.totalProductionKg)} kg
                                  </span>
                                </div>
                              </div>
                            )}

                            {month.safety.totalIncidents > 0 && (
                              <div className={`flex items-center space-x-1 text-xs mt-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                <AlertTriangle className="w-3 h-3" />
                                <span>{month.safety.totalIncidents} incident{month.safety.totalIncidents > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`text-xs text-center py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Aucune donnée
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Summary Stats */}
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Résumé Annuel Complet
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Basé sur les données mensuelles de {yearlyAnalysis.year}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      title: 'Mois Analysés',
                      value: yearlyAnalysis.monthlyBreakdown.filter(m => m.attendance.hasData || m.efficiency.hasData || m.safety.hasData).length,
                      subtitle: 'sur 12 mois',
                      icon: Calendar,
                      color: 'blue'
                    },
                    {
                      title: 'Incidents Moyens',
                      value: yearlyAnalysis.monthlyInsights.averageMonthlyIncidents,
                      subtitle: 'par mois',
                      icon: Shield,
                      color: 'indigo'
                    },
                    {
                      title: 'Mois à Optimiser',
                      value: yearlyAnalysis.monthlyInsights.monthsNeedingAttention,
                      subtitle: 'nécessitent attention',
                      icon: AlertTriangle,
                      color: 'amber'
                    },
                    {
                      title: 'Taux de Réussite',
                      value: Math.round((yearlyAnalysis.monthlyInsights.monthsAboveTarget / 12) * 100),
                      subtitle: '% mois au-dessus cible',
                      icon: CheckCircle,
                      color: 'emerald'
                    }
                  ].map((stat, index) => (
                    <div key={index} className={`p-4 rounded-xl border transition-all duration-300 ${
                      isDark ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50/50 border-slate-200/50'
                    }`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          stat.color === 'blue' ? 'bg-blue-500/15 text-blue-600' :
                          stat.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-600' :
                          stat.color === 'amber' ? 'bg-amber-500/15 text-amber-600' :
                          'bg-emerald-500/15 text-emerald-600'
                        }`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {stat.title}
                      </div>
                      <div className={`text-2xl font-light mb-2 ${
                        stat.color === 'blue' ? 'text-blue-500' :
                        stat.color === 'indigo' ? 'text-indigo-500' :
                        stat.color === 'amber' ? 'text-amber-500' :
                        'text-emerald-500'
                      }`}>
                        {stat.value}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {stat.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-medium transition-all duration-200 hover:from-pink-700 hover:to-rose-700 shadow-lg"
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