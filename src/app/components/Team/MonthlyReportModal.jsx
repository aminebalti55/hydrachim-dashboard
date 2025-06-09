import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  X, 
  Calendar, 
  Users, 
  Shield, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Download,
  FileText,
  Award,
  Activity,
  Star,
  Zap,
  AlertCircle
} from 'lucide-react';

export const MonthlyReportModal = ({ analytics, isDark, onClose, monthNumber }) => {
  // Calculate comprehensive monthly statistics from real KPI data
  const monthlyStats = useMemo(() => {
    if (!analytics) return null;

    // Get current month data
    const currentMonth = monthNumber !== undefined ? monthNumber : new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Extract real data from KPI structure
    const attendanceData = (analytics['team_productivity_attendance'] || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    const safetyData = (analytics['safety_incidents'] || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    const efficiencyData = (analytics['operator_efficiency'] || []).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    // Calculate metrics from real data
    const attendanceAvg = attendanceData.length > 0 
      ? Math.round(attendanceData.reduce((sum, entry) => sum + (entry.value || 0), 0) / attendanceData.length)
      : 0;

    const totalIncidents = safetyData.reduce((sum, entry) => sum + (entry.data?.totalIncidents || 0), 0);
    const latestSafetyScore = safetyData.length > 0 ? safetyData[safetyData.length - 1].value : 100;
    
    const efficiencyAvg = efficiencyData.length > 0
      ? Math.round(efficiencyData.reduce((sum, entry) => sum + (entry.value || 0), 0) / efficiencyData.length)
      : 0;

    // Get all unique employees from the month
    const allEmployees = new Map();
    
    // Process attendance data
    attendanceData.forEach(entry => {
      (entry.data?.employees || []).forEach(emp => {
        if (emp.name?.trim()) {
          if (!allEmployees.has(emp.name)) {
            allEmployees.set(emp.name, {
              name: emp.name,
              productivity: [],
              incidents: 0,
              efficiency: [],
              workHours: 0,
              tasks: [],
              daysActive: 0,
              bestDay: { date: '', score: 0 },
              worstDay: { date: '', score: 100 }
            });
          }
          const employee = allEmployees.get(emp.name);
          employee.productivity.push(emp.productivity || 0);
          employee.workHours += emp.workHours || 0;
          employee.daysActive++;
          
          const dayScore = emp.productivity || 0;
          if (dayScore > employee.bestDay.score) {
            employee.bestDay = { date: entry.date, score: dayScore };
          }
          if (dayScore < employee.worstDay.score && dayScore > 0) {
            employee.worstDay = { date: entry.date, score: dayScore };
          }
        }
      });
    });

    // Process safety data
    safetyData.forEach(entry => {
      (entry.data?.incidents || []).forEach(incident => {
        if (incident.employee?.trim()) {
          if (!allEmployees.has(incident.employee)) {
            allEmployees.set(incident.employee, {
              name: incident.employee,
              productivity: [],
              incidents: 0,
              efficiency: [],
              workHours: 0,
              tasks: [],
              daysActive: 0,
              bestDay: { date: '', score: 0 },
              worstDay: { date: '', score: 100 }
            });
          }
          const employee = allEmployees.get(incident.employee);
          employee.incidents++;
        }
      });
    });

    // Process efficiency data
    efficiencyData.forEach(entry => {
      (entry.data?.employees || []).forEach(emp => {
        if (emp.name?.trim()) {
          if (!allEmployees.has(emp.name)) {
            allEmployees.set(emp.name, {
              name: emp.name,
              productivity: [],
              incidents: 0,
              efficiency: [],
              workHours: 0,
              tasks: [],
              daysActive: 0,
              bestDay: { date: '', score: 0 },
              worstDay: { date: '', score: 100 }
            });
          }
          const employee = allEmployees.get(emp.name);
          employee.efficiency.push(emp.efficiency || 0);
          employee.tasks = [...employee.tasks, ...(emp.tasks || [])];
        }
      });
    });

    // Calculate averages for employees
    const employeeArray = Array.from(allEmployees.values()).map(emp => ({
      ...emp,
      avgProductivity: emp.productivity.length > 0 ? Math.round(emp.productivity.reduce((a, b) => a + b, 0) / emp.productivity.length) : 0,
      avgEfficiency: emp.efficiency.length > 0 ? Math.round(emp.efficiency.reduce((a, b) => a + b, 0) / emp.efficiency.length) : 0,
      completedTasks: emp.tasks.filter(t => t.completed).length,
      totalTasks: emp.tasks.length,
      overallScore: 0
    }));

    // Calculate overall score for ranking
    employeeArray.forEach(emp => {
      emp.overallScore = Math.round((emp.avgProductivity + emp.avgEfficiency) / 2);
    });

    // Sort by performance
    employeeArray.sort((a, b) => b.overallScore - a.overallScore);

    // Weekly breakdown
    const weeklyBreakdown = [];
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    let currentWeekStart = new Date(startOfMonth);
    let weekNumber = 1;
    
    while (currentWeekStart <= endOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > endOfMonth) weekEnd.setTime(endOfMonth.getTime());
      
      const weekAttendance = attendanceData.filter(entry => {
        const date = new Date(entry.date);
        return date >= currentWeekStart && date <= weekEnd;
      });
      
      const weekSafety = safetyData.filter(entry => {
        const date = new Date(entry.date);
        return date >= currentWeekStart && date <= weekEnd;
      });
      
      const weekEfficiency = efficiencyData.filter(entry => {
        const date = new Date(entry.date);
        return date >= currentWeekStart && date <= weekEnd;
      });
      
      weeklyBreakdown.push({
        week: weekNumber,
        startDate: currentWeekStart.toLocaleDateString('fr-FR'),
        endDate: weekEnd.toLocaleDateString('fr-FR'),
        attendance: weekAttendance.length > 0 ? Math.round(weekAttendance.reduce((sum, entry) => sum + (entry.value || 0), 0) / weekAttendance.length) : 0,
        incidents: weekSafety.reduce((sum, entry) => sum + (entry.data?.totalIncidents || 0), 0),
        efficiency: weekEfficiency.length > 0 ? Math.round(weekEfficiency.reduce((sum, entry) => sum + (entry.value || 0), 0) / weekEfficiency.length) : 0
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    // Department trends
    const trends = {
      attendance: {
        current: attendanceAvg,
        trend: attendanceData.length > 1 ? 
          (attendanceData[attendanceData.length - 1]?.value || 0) - (attendanceData[0]?.value || 0) : 0
      },
      safety: {
        current: totalIncidents,
        trend: safetyData.length > 1 ? 
          (safetyData[safetyData.length - 1]?.data?.totalIncidents || 0) - (safetyData[0]?.data?.totalIncidents || 0) : 0
      },
      efficiency: {
        current: efficiencyAvg,
        trend: efficiencyData.length > 1 ? 
          (efficiencyData[efficiencyData.length - 1]?.value || 0) - (efficiencyData[0]?.value || 0) : 0
      }
    };

    return {
      monthNumber: currentMonth,
      monthName: new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      attendanceAvg,
      totalIncidents,
      safetyScore: latestSafetyScore,
      efficiencyAvg,
      employees: employeeArray,
      weeklyBreakdown,
      totalEmployees: employeeArray.length,
      totalWorkHours: employeeArray.reduce((sum, emp) => sum + emp.workHours, 0),
      totalTasks: employeeArray.reduce((sum, emp) => sum + emp.totalTasks, 0),
      completedTasks: employeeArray.reduce((sum, emp) => sum + emp.completedTasks, 0),
      activeDays: Math.max(...employeeArray.map(emp => emp.daysActive), 0),
      bestPerformer: employeeArray[0] || null,
      trends,
      daysInMonth: endOfMonth.getDate(),
      hasData: attendanceData.length > 0 || safetyData.length > 0 || efficiencyData.length > 0
    };
  }, [analytics, monthNumber]);

  if (!monthlyStats || !monthlyStats.hasData) {
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
              Aucune donnée d'équipe trouvée pour ce mois. Ajoutez des données via les formulaires KPI.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chart options for weekly performance
  const getWeeklyPerformanceOptions = () => ({
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
      data: monthlyStats.weeklyBreakdown.map(week => `S${week.week}`),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    series: [
      {
        name: 'Productivité',
        type: 'line',
        data: monthlyStats.weeklyBreakdown.map(week => week.attendance),
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 3 },
        itemStyle: { color: '#3B82F6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3B82F640' },
              { offset: 1, color: '#3B82F610' }
            ]
          }
        }
      },
      {
        name: 'Efficacité',
        type: 'line',
        data: monthlyStats.weeklyBreakdown.map(week => week.efficiency),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 3 },
        itemStyle: { color: '#8B5CF6' }
      }
    ]
  });

  // Employee performance radar chart
  const getTopPerformersOptions = () => {
    const topEmployees = monthlyStats.employees.slice(0, 5);
    if (topEmployees.length === 0) return {};
    
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#475569',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#E2E8F0' : '#1E293B'
        }
      },
      radar: {
        indicator: [
          { name: 'Productivité', max: 100 },
          { name: 'Efficacité', max: 100 },
          { name: 'Heures', max: Math.max(200, Math.max(...topEmployees.map(e => e.workHours))) },
          { name: 'Tâches', max: Math.max(50, Math.max(...topEmployees.map(e => e.completedTasks))) },
          { name: 'Sécurité', max: 100, inverse: true }
        ],
        radius: '70%',
        nameGap: 15,
        name: {
          textStyle: {
            color: isDark ? '#CBD5E1' : '#64748B'
          }
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#475569' : '#E2E8F0'
          }
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#E5E7EB'
          }
        }
      },
      series: topEmployees.map((emp, index) => ({
        name: emp.name,
        type: 'radar',
        data: [{
          value: [
            emp.avgProductivity,
            emp.avgEfficiency,
            Math.min(emp.workHours, 200),
            Math.min(emp.completedTasks, 50),
            Math.max(0, 100 - emp.incidents * 20)
          ],
          name: emp.name,
          itemStyle: {
            color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]
          },
          lineStyle: {
            color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index],
            width: 2
          },
          areaStyle: {
            color: ['#3B82F620', '#10B98120', '#F59E0B20', '#EF444420', '#8B5CF620'][index]
          }
        }]
      }))
    };
  };

  const getOverallStatus = () => {
    const score = (monthlyStats.attendanceAvg + monthlyStats.efficiencyAvg) / 2;
    if (score >= 90) return { status: 'excellent', color: 'green', text: 'Excellent', icon: CheckCircle };
    if (score >= 75) return { status: 'good', color: 'blue', text: 'Bon', icon: Activity };
    return { status: 'needs-attention', color: 'red', text: 'Amélioration Nécessaire', icon: AlertTriangle };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
    return <TrendingUp className="w-4 h-4 text-gray-500 transform rotate-90" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel - {monthlyStats.monthName}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse complète mensuelle de la performance d'équipe
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}>
                <Download className="w-4 h-4" />
                <span>Exporter PDF</span>
              </button>
              <button onClick={onClose} className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-8 space-y-8">
            
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
                    <StatusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      overallStatus.color === 'green' ? 
                        isDark ? 'text-green-400' : 'text-green-700' :
                      overallStatus.color === 'blue' ? 
                        isDark ? 'text-blue-400' : 'text-blue-700' :
                        isDark ? 'text-red-400' : 'text-red-700'
                    }`}>
                      Performance du Mois: {overallStatus.text}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Score global: {Math.round((monthlyStats.attendanceAvg + monthlyStats.efficiencyAvg) / 2)}% • {monthlyStats.daysInMonth} jours • Score sécurité: {monthlyStats.safetyScore}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    overallStatus.color === 'green' ? 'text-green-600' :
                    overallStatus.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {monthlyStats.totalEmployees}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Employés Actifs
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Productivité Équipe
                      </h4>
                    </div>
                  </div>
                  {getTrendIcon(monthlyStats.trends.attendance.trend)}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {monthlyStats.attendanceAvg}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {monthlyStats.totalWorkHours}h travaillées
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Sécurité
                      </h4>
                    </div>
                  </div>
                  {getTrendIcon(-monthlyStats.trends.safety.trend)}
                </div>
                <div className={`text-2xl font-bold ${
                  monthlyStats.totalIncidents === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {monthlyStats.safetyScore}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {monthlyStats.totalIncidents} incidents
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Efficacité Moyenne
                      </h4>
                    </div>
                  </div>
                  {getTrendIcon(monthlyStats.trends.efficiency.trend)}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {monthlyStats.efficiencyAvg}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {monthlyStats.completedTasks}/{monthlyStats.totalTasks} tâches
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Jours Actifs
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {monthlyStats.activeDays}/{monthlyStats.daysInMonth}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Jours avec activité
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Weekly Performance Chart */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Évolution Hebdomadaire
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Performance semaine par semaine
                    </p>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getWeeklyPerformanceOptions()} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>

              {/* Top Performers Radar */}
              {monthlyStats.employees.length > 0 && (
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Top 5 Performeurs
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Analyse multidimensionnelle
                      </p>
                    </div>
                  </div>
                  
                  <ReactECharts 
                    option={getTopPerformersOptions()} 
                    style={{ height: '300px' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              )}
            </div>

            {/* Best Performer Highlight */}
            {monthlyStats.bestPerformer && (
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-700/30' : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Employé du Mois: {monthlyStats.bestPerformer.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        Score global: {monthlyStats.bestPerformer.overallScore}% • {monthlyStats.bestPerformer.completedTasks} tâches accomplies
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-500">
                      #{1}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Classement
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Performance Table */}
            {monthlyStats.employees.length > 0 && (
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Classement Mensuel des Employés
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Performance détaillée et classement
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Rang
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Employé
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Score Global
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Productivité
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Efficacité
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Heures
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Tâches
                        </th>
                        <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Incidents
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyStats.employees.map((employee, index) => (
                        <tr key={index} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'} ${
                          index === 0 ? (isDark ? 'bg-yellow-900/20' : 'bg-yellow-50') : ''
                        }`}>
                          <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="flex items-center space-x-2">
                              {index === 0 && <Star className="w-4 h-4 text-yellow-500" />}
                              <span className="font-bold">#{index + 1}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {employee.name.charAt(0)}
                              </div>
                              <span className="font-medium">{employee.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              employee.overallScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              employee.overallScore >= 75 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              employee.overallScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {employee.overallScore}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {employee.avgProductivity}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {employee.avgEfficiency}%
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-center text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {employee.workHours}h
                          </td>
                          <td className={`py-3 px-4 text-center text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {employee.completedTasks}/{employee.totalTasks}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-sm ${
                              employee.incidents === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              employee.incidents <= 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {employee.incidents}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Monthly Summary */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé du Mois
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className={`font-medium mb-3 flex items-center space-x-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Réussites</span>
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {monthlyStats.attendanceAvg >= 85 && <li>• Excellente productivité mensuelle</li>}
                    {monthlyStats.totalIncidents <= 2 && <li>• Maintien d'un environnement sûr</li>}
                    {monthlyStats.safetyScore >= 90 && <li>• Score de sécurité optimal</li>}
                    {monthlyStats.efficiencyAvg >= 80 && <li>• Haute performance d'équipe</li>}
                    {monthlyStats.completedTasks / monthlyStats.totalTasks >= 0.8 && <li>• Objectifs de tâches atteints</li>}
                    {monthlyStats.bestPerformer && <li>• {monthlyStats.bestPerformer.name} a excellé ce mois</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 flex items-center space-x-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Points d'Attention</span>
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {monthlyStats.attendanceAvg < 75 && <li>• Productivité à améliorer</li>}
                    {monthlyStats.totalIncidents > 3 && <li>• Nombre d'incidents préoccupant</li>}
                    {monthlyStats.safetyScore < 80 && <li>• Score de sécurité à renforcer</li>}
                    {monthlyStats.efficiencyAvg < 70 && <li>• Efficacité en dessous des attentes</li>}
                    {monthlyStats.employees.filter(e => e.overallScore < 60).length > 0 && <li>• Certains employés nécessitent un accompagnement</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 flex items-center space-x-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>Actions pour le Mois Prochain</span>
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li>• Planifier sessions de formation</li>
                    <li>• Réviser les processus inefficaces</li>
                    <li>• Reconnaître les performances exceptionnelles</li>
                    <li>• Mettre en place des mesures préventives</li>
                    <li>• Définir nouveaux objectifs mensuels</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};