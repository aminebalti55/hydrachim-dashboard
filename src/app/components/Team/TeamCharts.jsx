import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, Shield, BarChart3, Calendar, Clock } from 'lucide-react';

export const TeamCharts = ({ analytics, isDark, className = '' }) => {
  // French text labels
  const t = {
    addDataToSeeChart: "Ajoutez des données pour voir le graphique",
    attendanceChart: "Tendance de Présence",
    safetyChart: "Incidents de Sécurité", 
    efficiencyChart: "Tendance d'Efficacité",
    weeklyTrend: "Tendance hebdomadaire",
    weeklyPerformance: "Performance Hebdomadaire",
    teamComparison: "Comparaison d'équipe",
    individualPerformance: "Performance Individuelle",
    topPerformer: "Top performers",
    performanceTrend: "Tendance de Performance",
    weeklyReport: "Rapport hebdomadaire",
    monthlyTrend: "Tendance Mensuelle",
    overallTeamPerformance: "Performance globale de l'équipe",
    productivity: "Productivité",
    target: "Objectif",
    incidentCount: "Nombre d'incidents",
    efficiency: "Efficacité",
    attendanceRate: "Taux de Présence",
    safetyScore: "Score de Sécurité",
    excellent: "Excellent",
    good: "Bon",
    needsAttention: "Attention Requise"
  };

  if (!analytics) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <BarChart3 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t.addDataToSeeChart}
        </p>
      </div>
    );
  }

  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899'
  };

  // Common ECharts theme configuration
  const getCommonOptions = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    grid: {
      left: '3%',
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
      },
      confine: true
    },
    legend: {
      top: '5%',
      textStyle: {
        color: isDark ? '#CBD5E1' : '#64748B'
      }
    }
  });

  // Extract real data from the analytics object based on actual KPI structure
  const extractKPIData = (kpiId) => {
    if (!analytics || !analytics[kpiId]) return [];
    
    // Get the KPI data array and sort by date (newest first)
    const kpiData = Array.isArray(analytics[kpiId]) ? analytics[kpiId] : [];
    return kpiData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).reverse();
  };

  // Extract attendance data from team_productivity_attendance KPI
  const attendanceData = extractKPIData('team_productivity_attendance');
  const attendanceTrendData = attendanceData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    productivity: entry.value || 0,
    target: entry.data?.weeklyTarget || 95,
    employees: (entry.data?.employees || []).length,
    presentEmployees: (entry.data?.employees || []).filter(emp => emp.workHours > 0).length
  }));

  // Extract safety data from safety_incidents KPI
  const safetyData = extractKPIData('safety_incidents');
  const safetyTrendData = safetyData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    safetyScore: entry.value || 100,
    incidents: entry.data?.totalIncidents || 0,
    criticalIncidents: (entry.data?.incidents || []).filter(inc => inc.severity === 'critical').length,
    target: entry.data?.weeklyTarget || 3
  }));

  // Extract efficiency data from operator_efficiency KPI
  const efficiencyData = extractKPIData('operator_efficiency');
  const efficiencyTrendData = efficiencyData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    efficiency: entry.value || 0,
    target: entry.data?.weeklyTarget || 85,
    operators: (entry.data?.employees || []).length,
    totalTasks: (entry.data?.employees || []).reduce((sum, emp) => sum + (emp.tasks?.length || 0), 0),
    completedTasks: (entry.data?.employees || []).reduce((sum, emp) => sum + (emp.tasks?.filter(t => t.completed).length || 0), 0)
  }));

  // Prepare combined performance data for recent entries
  const getRecentPerformanceData = () => {
    const maxEntries = 8;
    const combinedData = [];
    
    // Get unique dates from all KPIs
    const allDates = new Set([
      ...attendanceData.map(d => d.date),
      ...safetyData.map(d => d.date),
      ...efficiencyData.map(d => d.date)
    ]);
    
    const sortedDates = Array.from(allDates).sort().slice(-maxEntries);
    
    return sortedDates.map(date => {
      const attendanceEntry = attendanceData.find(d => d.date === date);
      const safetyEntry = safetyData.find(d => d.date === date);
      const efficiencyEntry = efficiencyData.find(d => d.date === date);
      
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        attendance: attendanceEntry?.value || 0,
        safety: safetyEntry?.value || 100,
        efficiency: efficiencyEntry?.value || 0
      };
    });
  };

  const recentPerformanceData = getRecentPerformanceData();

  // Extract individual employee performance from latest data
  const getEmployeePerformanceData = () => {
    const latestAttendance = attendanceData[attendanceData.length - 1];
    const latestEfficiency = efficiencyData[efficiencyData.length - 1];
    
    if (!latestAttendance && !latestEfficiency) return [];

    // Combine employee data from both sources
    const employeeMap = new Map();
    
    // Add attendance data
    if (latestAttendance?.data?.employees) {
      latestAttendance.data.employees.forEach(emp => {
        if (emp.name?.trim()) {
          employeeMap.set(emp.name, {
            name: emp.name,
            productivity: emp.productivity || 0,
            efficiency: 0,
            workHours: emp.workHours || 0
          });
        }
      });
    }
    
    // Add efficiency data
    if (latestEfficiency?.data?.employees) {
      latestEfficiency.data.employees.forEach(emp => {
        if (emp.name?.trim()) {
          const existing = employeeMap.get(emp.name) || { name: emp.name, productivity: 0, efficiency: 0, workHours: 0 };
          existing.efficiency = emp.efficiency || 0;
          existing.totalTasks = emp.tasks?.length || 0;
          existing.completedTasks = emp.tasks?.filter(t => t.completed).length || 0;
          employeeMap.set(emp.name, existing);
        }
      });
    }
    
    return Array.from(employeeMap.values()).slice(0, 10);
  };

  const employeePerformanceData = getEmployeePerformanceData();

  // Calculate performance status distribution based on recent data
  const getStatusDistribution = () => {
    const recentData = recentPerformanceData.slice(-4); // Last 4 entries
    
    let excellent = 0, good = 0, needsAttention = 0;
    
    recentData.forEach(entry => {
      const avgScore = (entry.attendance + entry.safety + entry.efficiency) / 3;
      if (avgScore >= 85) excellent++;
      else if (avgScore >= 70) good++;
      else needsAttention++;
    });
    
    return [
      { name: t.excellent, value: excellent, color: chartColors.secondary },
      { name: t.good, value: good, color: chartColors.primary },
      { name: t.needsAttention, value: needsAttention, color: chartColors.danger }
    ];
  };

  const statusDistribution = getStatusDistribution();

  // ECharts Options for Attendance Trend (Area Chart)
  const getAttendanceOptions = () => ({
    ...getCommonOptions(),
    title: { show: false },
    xAxis: {
      type: 'category',
      data: attendanceTrendData.map(item => item.date),
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
        name: t.productivity,
        type: 'line',
        data: attendanceTrendData.map(item => item.productivity),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: chartColors.primary + '40' },
              { offset: 1, color: chartColors.primary + '10' }
            ]
          }
        },
        lineStyle: { color: chartColors.primary, width: 3 },
        itemStyle: { color: chartColors.primary }
      },
      {
        name: t.target,
        type: 'line',
        data: attendanceTrendData.map(item => item.target),
        lineStyle: { color: chartColors.accent, type: 'dashed', width: 2 },
        itemStyle: { color: chartColors.accent },
        symbol: 'none'
      }
    ]
  });

  // ECharts Options for Safety Incidents (Combined Chart)
  const getSafetyOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: safetyTrendData.map(item => item.date),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Score (%)',
        nameTextStyle: { color: isDark ? '#94A3B8' : '#64748B' },
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Incidents',
        nameTextStyle: { color: isDark ? '#94A3B8' : '#64748B' },
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
      }
    ],
    series: [
      {
        name: t.safetyScore,
        type: 'line',
        yAxisIndex: 0,
        data: safetyTrendData.map(item => item.safetyScore),
        smooth: true,
        lineStyle: { color: chartColors.secondary, width: 3 },
        itemStyle: { color: chartColors.secondary }
      },
      {
        name: t.incidentCount,
        type: 'bar',
        yAxisIndex: 1,
        data: safetyTrendData.map(item => item.incidents),
        itemStyle: { color: chartColors.danger, borderRadius: [4, 4, 0, 0] },
        barWidth: '40%'
      }
    ]
  });

  // ECharts Options for Efficiency Trend (Line Chart with Tasks)
  const getEfficiencyOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: efficiencyTrendData.map(item => item.date),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Efficacité (%)',
        nameTextStyle: { color: isDark ? '#94A3B8' : '#64748B' },
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Tâches',
        nameTextStyle: { color: isDark ? '#94A3B8' : '#64748B' },
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
      }
    ],
    series: [
      {
        name: t.efficiency,
        type: 'line',
        yAxisIndex: 0,
        data: efficiencyTrendData.map(item => item.efficiency),
        smooth: true,
        lineStyle: { color: chartColors.purple, width: 3 },
        itemStyle: { color: chartColors.purple }
      },
      {
        name: t.target,
        type: 'line',
        yAxisIndex: 0,
        data: efficiencyTrendData.map(item => item.target),
        lineStyle: { color: chartColors.accent, type: 'dashed', width: 2 },
        itemStyle: { color: chartColors.accent },
        symbol: 'none'
      },
      {
        name: 'Tâches Terminées',
        type: 'bar',
        yAxisIndex: 1,
        data: efficiencyTrendData.map(item => item.completedTasks),
        itemStyle: { color: chartColors.secondary + '80', borderRadius: [2, 2, 0, 0] },
        barWidth: '30%'
      }
    ]
  });

  // ECharts Options for Recent Performance (Grouped Bar Chart)
  const getRecentPerformanceOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: recentPerformanceData.map(item => item.date),
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
        type: 'bar',
        data: recentPerformanceData.map(item => item.attendance),
        itemStyle: { color: chartColors.primary, borderRadius: [2, 2, 0, 0] }
      },
      {
        name: t.safetyScore,
        type: 'bar',
        data: recentPerformanceData.map(item => item.safety),
        itemStyle: { color: chartColors.secondary, borderRadius: [2, 2, 0, 0] }
      },
      {
        name: t.efficiency,
        type: 'bar',
        data: recentPerformanceData.map(item => item.efficiency),
        itemStyle: { color: chartColors.purple, borderRadius: [2, 2, 0, 0] }
      }
    ]
  });

  // ECharts Options for Employee Performance (Horizontal Bar Chart)
  const getEmployeePerformanceOptions = () => ({
    ...getCommonOptions(),
    grid: {
      left: '15%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: employeePerformanceData.map(item => item.name),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    series: [
      {
        name: t.productivity,
        type: 'bar',
        data: employeePerformanceData.map(item => item.productivity),
        itemStyle: { color: chartColors.primary, borderRadius: [0, 2, 2, 0] }
      },
      {
        name: t.efficiency,
        type: 'bar',
        data: employeePerformanceData.map(item => item.efficiency),
        itemStyle: { color: chartColors.purple, borderRadius: [0, 2, 2, 0] }
      }
    ]
  });

  // ECharts Options for Status Distribution (Pie Chart)
  const getStatusDistributionOptions = () => ({
    ...getCommonOptions(),
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      textStyle: { color: isDark ? '#CBD5E1' : '#64748B' }
    },
    series: [
      {
        name: 'Performance',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: statusDistribution.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: { show: false },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',
          color: 'white',
          fontWeight: 'bold'
        }
      }
    ]
  });

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Attendance Trend Chart */}
        {attendanceTrendData.length > 0 && (
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t.attendanceChart}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.weeklyTrend}
                  </p>
                </div>
              </div>
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="text-xs">Dernière: {attendanceTrendData[attendanceTrendData.length - 1]?.productivity}%</div>
                <div className="text-xs">{attendanceTrendData[attendanceTrendData.length - 1]?.presentEmployees}/{attendanceTrendData[attendanceTrendData.length - 1]?.employees} présents</div>
              </div>
            </div>
            
            <ReactECharts 
              option={getAttendanceOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Safety Incidents Chart */}
        {safetyTrendData.length > 0 && (
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t.safetyChart}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Score & Incidents
                  </p>
                </div>
              </div>
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="text-xs">Score: {safetyTrendData[safetyTrendData.length - 1]?.safetyScore}%</div>
                <div className="text-xs">{safetyTrendData[safetyTrendData.length - 1]?.incidents} incidents</div>
              </div>
            </div>
            
            <ReactECharts 
              option={getSafetyOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Efficiency Trend Chart */}
        {efficiencyTrendData.length > 0 && (
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t.efficiencyChart}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Efficacité & Tâches
                  </p>
                </div>
              </div>
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="text-xs">Efficacité: {efficiencyTrendData[efficiencyTrendData.length - 1]?.efficiency}%</div>
                <div className="text-xs">{efficiencyTrendData[efficiencyTrendData.length - 1]?.completedTasks}/{efficiencyTrendData[efficiencyTrendData.length - 1]?.totalTasks} tâches</div>
              </div>
            </div>
            
            <ReactECharts 
              option={getEfficiencyOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Recent Performance Comparison */}
        {recentPerformanceData.length > 0 && (
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Performance Récente
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Comparaison multi-KPI
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getRecentPerformanceOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}
      </div>

      {/* Individual Performance & Status Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Employee Performance Distribution */}
        {employeePerformanceData.length > 0 && (
          <div className={`xl:col-span-2 p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Performance Individuelle
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Données les plus récentes
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getEmployeePerformanceOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Performance Status Distribution */}
        {statusDistribution.some(s => s.value > 0) && (
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Tendance Performance
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Répartition récente
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getStatusDistributionOptions()} 
              style={{ height: '250px' }}
              opts={{ renderer: 'svg' }}
            />

            {/* Status Summary */}
            <div className="mt-4 space-y-2">
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {status.name}
                    </span>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {status.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Summary */}
      {(attendanceData.length > 0 || safetyData.length > 0 || efficiencyData.length > 0) && (
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé des Données
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Aperçu des KPIs configurés
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {attendanceData.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Présence</h4>
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div>{attendanceData.length} entrées de données</div>
                  <div>Dernière: {new Date(attendanceData[attendanceData.length - 1]?.date).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            )}
            
            {safetyData.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-red-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sécurité</h4>
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div>{safetyData.length} rapports de sécurité</div>
                  <div>Dernière: {new Date(safetyData[safetyData.length - 1]?.date).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            )}
            
            {efficiencyData.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Efficacité</h4>
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div>{efficiencyData.length} rapports d'efficacité</div>
                  <div>Dernière: {new Date(efficiencyData[efficiencyData.length - 1]?.date).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};