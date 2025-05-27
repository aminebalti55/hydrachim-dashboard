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

  // Prepare attendance trend data
  const attendanceTrendData = (analytics.attendance || []).map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR'),
    productivity: entry.averageProductivity || 0,
    target: entry.target || 95,
    employees: (entry.employees || []).length
  })).slice(-10);

  // Prepare safety trend data
  const safetyTrendData = (analytics.safety || []).map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR'),
    incidents: entry.totalIncidents || 0,
    target: entry.target || 0,
    employees: (entry.employees || []).length
  })).slice(-10);

  // Prepare efficiency trend data
  const efficiencyTrendData = (analytics.efficiency || []).map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR'),
    efficiency: entry.averageEfficiency || 0,
    target: entry.target || 85,
    completedTasks: (entry.employees || []).reduce((sum, emp) => sum + ((emp.tasks || []).filter(t => t.completed).length || 0), 0),
    totalTasks: (entry.employees || []).reduce((sum, emp) => sum + ((emp.tasks || []).length || 0), 0)
  })).slice(-10);

  // Prepare weekly performance comparison
  const weeklyPerformanceData = (analytics.weeklyReports || []).slice(-8).map(report => ({
    week: `Semaine ${report.week}`,
    attendance: report.attendance?.average || 0,
    safety: Math.max(0, 100 - ((report.safety?.total || 0) * 10)),
    efficiency: report.efficiency?.average || 0,
    status: report.status || 'no-data'
  }));

  // Prepare employee performance distribution for latest data
  const getEmployeeDistribution = () => {
    const latestAttendance = analytics.attendance?.[0];
    const latestEfficiency = analytics.efficiency?.[0];
    
    if (!latestAttendance && !latestEfficiency) return [];

    const employees = latestAttendance?.employees || latestEfficiency?.employees || [];
    
    return employees.map(emp => ({
      name: emp.name || 'Employé',
      productivity: emp.productivity || 0,
      efficiency: emp.efficiency || 0,
      performance: Math.round(((emp.productivity || 0) + (emp.efficiency || 0)) / 2)
    })).slice(0, 10);
  };

  const employeeDistribution = getEmployeeDistribution();

  // Prepare monthly summary data
  const monthlySummaryData = (analytics.monthlyReports || []).slice(-6).map(report => ({
    month: new Date(2024, report.month).toLocaleDateString('fr-FR', { month: 'short' }),
    attendance: report.attendance?.average || 0,
    safety: Math.max(0, 100 - ((report.safety?.total || 0) * 5)),
    efficiency: report.efficiency?.average || 0
  }));

  // Performance status distribution
  const statusDistribution = [
    { 
      name: t.excellent, 
      value: (analytics.weeklyReports || []).filter(r => r.status === 'excellent').length, 
      color: chartColors.secondary 
    },
    { 
      name: t.good, 
      value: (analytics.weeklyReports || []).filter(r => r.status === 'good').length, 
      color: chartColors.primary 
    },
    { 
      name: t.needsAttention, 
      value: (analytics.weeklyReports || []).filter(r => r.status === 'needs-attention').length, 
      color: chartColors.danger 
    }
  ];

  // ECharts Options for Attendance Trend (Area Chart)
  const getAttendanceOptions = () => ({
    ...getCommonOptions(),
    title: {
      show: false
    },
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

  // ECharts Options for Safety Incidents (Bar Chart)
  const getSafetyOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: safetyTrendData.map(item => item.date),
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
        name: t.incidentCount,
        type: 'bar',
        data: safetyTrendData.map(item => item.incidents),
        itemStyle: { 
          color: chartColors.danger,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  });

  // ECharts Options for Efficiency Trend (Line Chart)
  const getEfficiencyOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: efficiencyTrendData.map(item => item.date),
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
        name: t.efficiency,
        type: 'line',
        data: efficiencyTrendData.map(item => item.efficiency),
        smooth: true,
        lineStyle: { color: chartColors.purple, width: 3 },
        itemStyle: { color: chartColors.purple }
      },
      {
        name: t.target,
        type: 'line',
        data: efficiencyTrendData.map(item => item.target),
        lineStyle: { color: chartColors.accent, type: 'dashed', width: 2 },
        itemStyle: { color: chartColors.accent },
        symbol: 'none'
      }
    ]
  });

  // ECharts Options for Weekly Performance (Grouped Bar Chart)
  const getWeeklyPerformanceOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: weeklyPerformanceData.map(item => item.week),
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
        name: t.attendanceRate,
        type: 'bar',
        data: weeklyPerformanceData.map(item => item.attendance),
        itemStyle: { color: chartColors.primary, borderRadius: [2, 2, 0, 0] }
      },
      {
        name: t.safetyScore,
        type: 'bar',
        data: weeklyPerformanceData.map(item => item.safety),
        itemStyle: { color: chartColors.secondary, borderRadius: [2, 2, 0, 0] }
      },
      {
        name: t.efficiency,
        type: 'bar',
        data: weeklyPerformanceData.map(item => item.efficiency),
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
      data: employeeDistribution.map(item => item.name),
      axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
      axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
    },
    series: [
      {
        name: t.productivity,
        type: 'bar',
        data: employeeDistribution.map(item => item.productivity),
        itemStyle: { color: chartColors.primary, borderRadius: [0, 2, 2, 0] }
      },
      {
        name: t.efficiency,
        type: 'bar',
        data: employeeDistribution.map(item => item.efficiency),
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
      textStyle: {
        color: isDark ? '#E2E8F0' : '#1E293B'
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      textStyle: {
        color: isDark ? '#CBD5E1' : '#64748B'
      }
    },
    series: [
      {
        name: 'Status',
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
        labelLine: {
          show: false
        },
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

  // ECharts Options for Monthly Summary (Multi-line Chart)
  const getMonthlySummaryOptions = () => ({
    ...getCommonOptions(),
    xAxis: {
      type: 'category',
      data: monthlySummaryData.map(item => item.month),
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
        name: t.attendanceRate,
        type: 'line',
        data: monthlySummaryData.map(item => item.attendance),
        smooth: true,
        lineStyle: { color: chartColors.primary, width: 3 },
        itemStyle: { color: chartColors.primary }
      },
      {
        name: t.safetyScore,
        type: 'line',
        data: monthlySummaryData.map(item => item.safety),
        smooth: true,
        lineStyle: { color: chartColors.secondary, width: 3 },
        itemStyle: { color: chartColors.secondary }
      },
      {
        name: t.efficiency,
        type: 'line',
        data: monthlySummaryData.map(item => item.efficiency),
        smooth: true,
        lineStyle: { color: chartColors.purple, width: 3 },
        itemStyle: { color: chartColors.purple }
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
            <div className="flex items-center space-x-3 mb-4">
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
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.safetyChart}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.weeklyTrend}
                </p>
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
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.efficiencyChart}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.weeklyTrend}
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getEfficiencyOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Weekly Performance Comparison */}
        {weeklyPerformanceData.length > 0 && (
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.weeklyPerformance}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.teamComparison}
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getWeeklyPerformanceOptions()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}
      </div>

      {/* Individual Performance & Status Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Employee Performance Distribution */}
        {employeeDistribution.length > 0 && (
          <div className={`xl:col-span-2 p-6 rounded-xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.individualPerformance}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.topPerformer}
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
                  {t.performanceTrend}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.weeklyReport}
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

      {/* Monthly Summary Chart */}
      {monthlySummaryData.length > 0 && (
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.monthlyTrend}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.overallTeamPerformance}
              </p>
            </div>
          </div>
          
          <ReactECharts 
            option={getMonthlySummaryOptions()} 
            style={{ height: '300px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      )}
    </div>
  );
};