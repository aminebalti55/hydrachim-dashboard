import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, Shield, BarChart3, Calendar, Clock, Activity, Star, Target, Zap, Award, Sparkles } from 'lucide-react';

export const TeamCharts = ({ analytics, isDark, className = '' }) => {
  // French text labels
  const t = {
    addDataToSeeChart: "Ajoutez des données pour voir le graphique",
    attendanceChart: "Productivité & Présence",
    safetyChart: "Score de Sécurité", 
    efficiencyChart: "Efficacité Opérationnelle",
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
      <div className={`text-center py-16 ${className}`}>
        <div className={`w-20 h-20 rounded-3xl ${
          isDark ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-slate-100 to-slate-200'
        } flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-lg`}>
          <BarChart3 className={`w-10 h-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
          Aucune donnée disponible
        </h3>
        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t.addDataToSeeChart}
        </p>
      </div>
    );
  }

  // Modern color palette with gradients
  const modernColors = {
    primary: ['#6366F1', '#8B5CF6'],
    secondary: ['#10B981', '#059669'],
    accent: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626'],
    purple: ['#8B5CF6', '#7C3AED'],
    pink: ['#EC4899', '#BE185D'],
    emerald: ['#10B981', '#047857'],
    violet: ['#7C3AED', '#5B21B6'],
    rose: ['#F43F5E', '#E11D48'],
    blue: ['#3B82F6', '#1D4ED8'],
    cyan: ['#06B6D4', '#0891B2'],
    amber: ['#F59E0B', '#D97706']
  };

  // Extract real data from Supabase structure
  const extractKPIData = (kpiId) => {
    if (!analytics || !analytics[kpiId]) return [];
    
    const kpiData = Array.isArray(analytics[kpiId]) ? analytics[kpiId] : [];
    return kpiData.sort((a, b) => new Date(b.kpi_date) - new Date(a.kpi_date)).slice(0, 15).reverse();
  };

  // Extract and transform data
  const attendanceData = extractKPIData('team_productivity_attendance');
  const safetyData = extractKPIData('safety_incidents');
  const efficiencyData = extractKPIData('operator_efficiency');

  const attendanceTrendData = attendanceData.map(entry => ({
    date: new Date(entry.kpi_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    productivity: entry.kpi_value || 0,
    target: entry.monthly_target || 95,
    employees: (entry.employees || []).length,
    presentEmployees: (entry.employees || []).filter(emp => emp.workHours > 0).length,
    avgWorkHours: entry.employees?.length > 0 ? 
      entry.employees.reduce((sum, emp) => sum + (emp.workHours || 0), 0) / entry.employees.length : 0
  }));

  const safetyTrendData = safetyData.map(entry => ({
    date: new Date(entry.kpi_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    safetyScore: entry.kpi_value || 100,
    incidents: entry.total_incidents || 0,
    criticalIncidents: (entry.incidents || []).filter(inc => inc.severity === 'critical').length,
    target: entry.monthly_target || 3
  }));

  const efficiencyTrendData = efficiencyData.map(entry => ({
    date: new Date(entry.kpi_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    efficiency: entry.kpi_value || 0,
    target: entry.monthly_target || 85,
    operators: (entry.employees || []).length,
    totalTasks: (entry.employees || []).reduce((sum, emp) => sum + (emp.tasks?.length || 0), 0),
    completedTasks: (entry.employees || []).reduce((sum, emp) => sum + (emp.tasks?.filter(t => t.completed).length || 0), 0)
  }));

  // Combined performance data
  const getRecentPerformanceData = () => {
    const allDates = new Set([
      ...attendanceData.map(d => d.kpi_date),
      ...safetyData.map(d => d.kpi_date),
      ...efficiencyData.map(d => d.kpi_date)
    ]);
    
    const sortedDates = Array.from(allDates).sort().slice(-12);
    
    return sortedDates.map(date => {
      const attendanceEntry = attendanceData.find(d => d.kpi_date === date);
      const safetyEntry = safetyData.find(d => d.kpi_date === date);
      const efficiencyEntry = efficiencyData.find(d => d.kpi_date === date);
      
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        attendance: attendanceEntry?.kpi_value || 0,
        safety: safetyEntry?.kpi_value || 100,
        efficiency: efficiencyEntry?.kpi_value || 0
      };
    });
  };

  const recentPerformanceData = getRecentPerformanceData();

  // Employee performance
  const getEmployeePerformanceData = () => {
    const latestAttendance = attendanceData[attendanceData.length - 1];
    const latestEfficiency = efficiencyData[efficiencyData.length - 1];
    
    if (!latestAttendance && !latestEfficiency) return [];

    const employeeMap = new Map();
    
    if (latestAttendance?.employees) {
      latestAttendance.employees.forEach(emp => {
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
    
    if (latestEfficiency?.employees) {
      latestEfficiency.employees.forEach(emp => {
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

  // Status distribution
  const getStatusDistribution = () => {
    const recentData = recentPerformanceData.slice(-6);
    
    let excellent = 0, good = 0, needsAttention = 0;
    
    recentData.forEach(entry => {
      const avgScore = (entry.attendance + entry.safety + entry.efficiency) / 3;
      if (avgScore >= 85) excellent++;
      else if (avgScore >= 70) good++;
      else needsAttention++;
    });
    
    return [
      { name: t.excellent, value: excellent, color: modernColors.emerald[0] },
      { name: t.good, value: good, color: modernColors.blue[0] },
      { name: t.needsAttention, value: needsAttention, color: modernColors.danger[0] }
    ];
  };

  const statusDistribution = getStatusDistribution();

  // Enhanced modern chart options
  const getModernChartOptions = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 13,
      fontWeight: 500
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      borderRadius: 16,
      textStyle: {
        color: isDark ? '#F1F5F9' : '#0F172A',
        fontSize: 14,
        fontWeight: 500
      },
      padding: [16, 20],
      shadowBlur: 25,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      extraCssText: `
        box-shadow: 0 20px 40px rgba(0, 0, 0, ${isDark ? '0.4' : '0.1'});
        backdrop-filter: blur(20px);
        border: 1px solid ${isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.8)'};
      `
    },
    legend: {
      top: '8%',
      textStyle: {
        color: isDark ? '#CBD5E1' : '#64748B',
        fontSize: 13,
        fontWeight: 600
      },
      itemGap: 25,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 14
    },
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicInOut',
    animationDelay: (idx) => idx * 100
  });

  // Attendance Chart
  const getAttendanceOptions = () => ({
    ...getModernChartOptions(),
    xAxis: {
      type: 'category',
      data: attendanceTrendData.map(item => item.date),
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        margin: 12
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        formatter: '{value}%'
      },
      splitLine: { 
        lineStyle: { 
          color: isDark ? '#334155' : '#F1F5F9', 
          type: 'dashed',
          width: 1
        } 
      }
    },
    series: [
      {
        name: t.productivity,
        type: 'line',
        data: attendanceTrendData.map(item => item.productivity),
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 10,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${modernColors.blue[0]}60` },
              { offset: 0.5, color: `${modernColors.blue[0]}30` },
              { offset: 1, color: `${modernColors.blue[0]}10` }
            ]
          }
        },
        lineStyle: { 
          color: {
            type: 'linear',
            colorStops: [
              { offset: 0, color: modernColors.blue[0] },
              { offset: 1, color: modernColors.blue[1] }
            ]
          },
          width: 4,
          shadowColor: `${modernColors.blue[0]}60`,
          shadowBlur: 15,
          shadowOffsetY: 8
        },
        itemStyle: { 
          color: modernColors.blue[0],
          borderWidth: 3,
          borderColor: '#FFFFFF',
          shadowColor: `${modernColors.blue[0]}80`,
          shadowBlur: 12
        }
      },
      {
        name: t.target,
        type: 'line',
        data: attendanceTrendData.map(item => item.target),
        lineStyle: { 
          color: modernColors.amber[0], 
          type: 'dashed', 
          width: 3,
          opacity: 0.9
        },
        itemStyle: { 
          color: modernColors.amber[0],
          opacity: 0.9
        },
        symbol: 'diamond',
        symbolSize: 8
      }
    ]
  });

  // Safety Chart
  const getSafetyOptions = () => ({
    ...getModernChartOptions(),
    xAxis: {
      type: 'category',
      data: safetyTrendData.map(item => item.date),
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        margin: 12
      },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Score (%)',
        nameTextStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 13,
          fontWeight: 600
        },
        axisLine: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 12,
          fontWeight: 600,
          formatter: '{value}%'
        },
        splitLine: { 
          lineStyle: { 
            color: isDark ? '#334155' : '#F1F5F9', 
            type: 'dashed',
            width: 1
          } 
        }
      },
      {
        type: 'value',
        name: 'Incidents',
        nameTextStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 13,
          fontWeight: 600
        },
        axisLine: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 12,
          fontWeight: 600
        },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t.safetyScore,
        type: 'line',
        yAxisIndex: 0,
        data: safetyTrendData.map(item => item.safetyScore),
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { 
          color: {
            type: 'linear',
            colorStops: [
              { offset: 0, color: modernColors.emerald[0] },
              { offset: 1, color: modernColors.emerald[1] }
            ]
          },
          width: 4,
          shadowColor: `${modernColors.emerald[0]}60`,
          shadowBlur: 15,
          shadowOffsetY: 8
        },
        itemStyle: { 
          color: modernColors.emerald[0],
          borderWidth: 3,
          borderColor: '#FFFFFF',
          shadowColor: `${modernColors.emerald[0]}80`,
          shadowBlur: 12
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${modernColors.emerald[0]}40` },
              { offset: 1, color: `${modernColors.emerald[0]}05` }
            ]
          }
        }
      },
      {
        name: t.incidentCount,
        type: 'bar',
        yAxisIndex: 1,
        data: safetyTrendData.map(item => item.incidents),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: modernColors.danger[0] },
              { offset: 1, color: `${modernColors.danger[0]}80` }
            ]
          },
          borderRadius: [8, 8, 0, 0],
          shadowColor: `${modernColors.danger[0]}40`,
          shadowBlur: 12,
          shadowOffsetY: 6
        },
        barWidth: '45%'
      }
    ]
  });

  // Efficiency Chart
  const getEfficiencyOptions = () => ({
    ...getModernChartOptions(),
    xAxis: {
      type: 'category',
      data: efficiencyTrendData.map(item => item.date),
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        margin: 12
      },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Efficacité (%)',
        nameTextStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 13,
          fontWeight: 600
        },
        axisLine: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 12,
          fontWeight: 600,
          formatter: '{value}%'
        },
        splitLine: { 
          lineStyle: { 
            color: isDark ? '#334155' : '#F1F5F9', 
            type: 'dashed',
            width: 1
          } 
        }
      },
      {
        type: 'value',
        name: 'Tâches',
        nameTextStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 13,
          fontWeight: 600
        },
        axisLine: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 12,
          fontWeight: 600
        },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t.efficiency,
        type: 'line',
        yAxisIndex: 0,
        data: efficiencyTrendData.map(item => item.efficiency),
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { 
          color: {
            type: 'linear',
            colorStops: [
              { offset: 0, color: modernColors.purple[0] },
              { offset: 1, color: modernColors.purple[1] }
            ]
          },
          width: 4,
          shadowColor: `${modernColors.purple[0]}60`,
          shadowBlur: 15,
          shadowOffsetY: 8
        },
        itemStyle: { 
          color: modernColors.purple[0],
          borderWidth: 3,
          borderColor: '#FFFFFF',
          shadowColor: `${modernColors.purple[0]}80`,
          shadowBlur: 12
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${modernColors.purple[0]}50` },
              { offset: 1, color: `${modernColors.purple[0]}08` }
            ]
          }
        }
      },
      {
        name: t.target,
        type: 'line',
        yAxisIndex: 0,
        data: efficiencyTrendData.map(item => item.target),
        lineStyle: { 
          color: modernColors.amber[0], 
          type: 'dashed', 
          width: 3,
          opacity: 0.9
        },
        itemStyle: { 
          color: modernColors.amber[0],
          opacity: 0.9
        },
        symbol: 'diamond',
        symbolSize: 8
      },
      {
        name: 'Tâches Terminées',
        type: 'bar',
        yAxisIndex: 1,
        data: efficiencyTrendData.map(item => item.completedTasks),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${modernColors.emerald[0]}CC` },
              { offset: 1, color: `${modernColors.emerald[0]}60` }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: `${modernColors.emerald[0]}40`,
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        barWidth: '35%'
      }
    ]
  });

  // Combined Performance Chart
  const getCombinedPerformanceOptions = () => ({
    ...getModernChartOptions(),
    xAxis: {
      type: 'category',
      data: recentPerformanceData.map(item => item.date),
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        margin: 12
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        formatter: '{value}%'
      },
      splitLine: { 
        lineStyle: { 
          color: isDark ? '#334155' : '#F1F5F9', 
          type: 'dashed',
          width: 1
        } 
      }
    },
    series: [
      {
        name: 'Productivité',
        type: 'bar',
        data: recentPerformanceData.map(item => item.attendance),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: modernColors.blue[0] },
              { offset: 1, color: `${modernColors.blue[0]}CC` }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: `${modernColors.blue[0]}40`,
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        barWidth: '28%'
      },
      {
        name: t.safetyScore,
        type: 'bar',
        data: recentPerformanceData.map(item => item.safety),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: modernColors.emerald[0] },
              { offset: 1, color: `${modernColors.emerald[0]}CC` }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: `${modernColors.emerald[0]}40`,
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        barWidth: '28%'
      },
      {
        name: t.efficiency,
        type: 'bar',
        data: recentPerformanceData.map(item => item.efficiency),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: modernColors.purple[0] },
              { offset: 1, color: `${modernColors.purple[0]}CC` }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: `${modernColors.purple[0]}40`,
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        barWidth: '28%'
      }
    ]
  });

  // Employee Performance Chart
  const getEmployeePerformanceOptions = () => ({
    ...getModernChartOptions(),
    grid: {
      left: '20%',
      right: '5%',
      bottom: '12%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600,
        formatter: '{value}%'
      },
      splitLine: { 
        lineStyle: { 
          color: isDark ? '#334155' : '#F1F5F9', 
          type: 'dashed',
          width: 1
        } 
      }
    },
    yAxis: {
      type: 'category',
      data: employeePerformanceData.map(item => item.name),
      axisLine: { show: false },
      axisLabel: { 
        color: isDark ? '#94A3B8' : '#64748B', 
        fontSize: 12,
        fontWeight: 600
      },
      axisTick: { show: false }
    },
    series: [
      {
        name: t.productivity,
        type: 'bar',
        data: employeePerformanceData.map(item => item.productivity),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: `${modernColors.blue[0]}60` },
              { offset: 1, color: modernColors.blue[0] }
            ]
          },
          borderRadius: [0, 8, 8, 0],
          shadowColor: `${modernColors.blue[0]}40`,
          shadowBlur: 10,
          shadowOffsetX: 5
        },
        barWidth: '40%'
      },
      {
        name: t.efficiency,
        type: 'bar',
        data: employeePerformanceData.map(item => item.efficiency),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: `${modernColors.purple[0]}60` },
              { offset: 1, color: modernColors.purple[0] }
            ]
          },
          borderRadius: [0, 8, 8, 0],
          shadowColor: `${modernColors.purple[0]}40`,
          shadowBlur: 10,
          shadowOffsetX: 5
        },
        barWidth: '40%'
      }
    ]
  });

  // Status Distribution Donut
  const getStatusDistributionOptions = () => ({
    ...getModernChartOptions(),
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '5%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      borderRadius: 16,
      textStyle: { 
        color: isDark ? '#F1F5F9' : '#0F172A',
        fontSize: 14,
        fontWeight: 500
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      padding: [16, 20],
      shadowBlur: 25,
      shadowColor: 'rgba(0, 0, 0, 0.15)'
    },
    legend: {
      show: false  // Disable legend to avoid overlap, we'll use custom cards below
    },
    series: [
      {
        name: 'Performance',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        data: statusDistribution.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { 
            color: item.color,
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.15)'
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.25)',
            scale: 1.08
          }
        },
        labelLine: { show: false },
        label: {
          show: true,
          position: 'inside',
          formatter: (params) => {
            return params.value > 0 ? params.value : '';  // Only show label if value > 0
          },
          color: 'white',
          fontWeight: 'bold',
          fontSize: 18
        }
      }
    ]
  });

  return (
    <div className={`space-y-10 ${className}`}>
      
      {/* Modern Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Attendance Trend Chart */}
        {attendanceTrendData.length > 0 && (
          <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t.attendanceChart}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.weeklyTrend}
                  </p>
                </div>
              </div>
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="text-lg font-bold text-blue-600">{attendanceTrendData[attendanceTrendData.length - 1]?.productivity}%</div>
                <div className="text-sm">{attendanceTrendData[attendanceTrendData.length - 1]?.presentEmployees}/{attendanceTrendData[attendanceTrendData.length - 1]?.employees} présents</div>
              </div>
            </div>
            
            <ReactECharts 
              option={getAttendanceOptions()} 
              style={{ height: '350px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Safety Chart */}
        {safetyTrendData.length > 0 && (
          <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 pointer-events-none" />
            
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t.safetyChart}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Score & Incidents
                  </p>
                </div>
              </div>
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="text-lg font-bold text-emerald-600">{safetyTrendData[safetyTrendData.length - 1]?.safetyScore}%</div>
                <div className="text-sm">{safetyTrendData[safetyTrendData.length - 1]?.incidents} incidents</div>
              </div>
            </div>
            
            <ReactECharts 
              option={getSafetyOptions()} 
              style={{ height: '350px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Efficiency Chart */}
        {efficiencyTrendData.length > 0 && (
          <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
            
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t.efficiencyChart}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Efficacité & Tâches
                  </p>
                </div>
              </div>
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="text-lg font-bold text-purple-600">{efficiencyTrendData[efficiencyTrendData.length - 1]?.efficiency}%</div>
                <div className="text-sm">{efficiencyTrendData[efficiencyTrendData.length - 1]?.completedTasks}/{efficiencyTrendData[efficiencyTrendData.length - 1]?.totalTasks} tâches</div>
              </div>
            </div>
            
            <ReactECharts 
              option={getEfficiencyOptions()} 
              style={{ height: '350px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Combined Performance */}
        {recentPerformanceData.length > 0 && (
          <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 pointer-events-none" />
            
            <div className="relative flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-xl shadow-pink-500/30">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Performance Globale
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Comparaison multi-KPI
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getCombinedPerformanceOptions()} 
              style={{ height: '350px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}
      </div>

      {/* Bottom Row: Employee Performance & Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Employee Performance */}
        {employeePerformanceData.length > 0 && (
          <div className={`xl:col-span-2 relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none" />
            
            <div className="relative flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Performance Individuelle
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Données les plus récentes • {employeePerformanceData.length} employés
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getEmployeePerformanceOptions()} 
              style={{ height: '400px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        )}

        {/* Status Distribution */}
        {statusDistribution.some(s => s.value > 0) && (
          <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 pointer-events-none" />
            
            <div className="relative flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Répartition Performance
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Dernières 6 entrées
                </p>
              </div>
            </div>
            
            <ReactECharts 
              option={getStatusDistributionOptions()} 
              style={{ height: '280px' }}
              opts={{ renderer: 'svg' }}
            />

            {/* Enhanced Status Cards */}
            <div className="mt-6 space-y-4">
              {statusDistribution.map((status, index) => (
                <div key={index} className={`relative overflow-hidden p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  isDark ? 'bg-slate-700/40 hover:bg-slate-700/60' : 'bg-slate-50/80 hover:bg-slate-100/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-5 h-5 rounded-full shadow-lg"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {status.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {status.value}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        entrées
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Summary Section */}
      {(attendanceData.length > 0 || safetyData.length > 0 || efficiencyData.length > 0) && (
        <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl ${
          isDark ? 'bg-slate-800/80 border-slate-700/60 shadow-slate-900/30' : 'bg-white/90 border-slate-200/60 shadow-slate-200/60'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 pointer-events-none" />
          
          <div className="relative flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé des Données
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Aperçu détaillé des KPIs configurés
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {attendanceData.length > 0 && (
              <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-200 hover:scale-105 ${
                isDark ? 'bg-blue-900/30 border-blue-700/40 hover:bg-blue-900/40' : 'bg-blue-50/80 border-blue-200/60 hover:bg-blue-100/80'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                <div className="relative flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>Présence</h4>
                </div>
                <div className={`space-y-3 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium">Entrées:</span>
                    <span className="font-bold">{attendanceData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dernière:</span>
                    <span className="font-bold">{new Date(attendanceData[attendanceData.length - 1]?.kpi_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Performance:</span>
                    <span className="font-bold text-xl">{attendanceData[attendanceData.length - 1]?.kpi_value || 0}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {safetyData.length > 0 && (
              <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-200 hover:scale-105 ${
                isDark ? 'bg-emerald-900/30 border-emerald-700/40 hover:bg-emerald-900/40' : 'bg-emerald-50/80 border-emerald-200/60 hover:bg-emerald-100/80'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="relative flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Sécurité</h4>
                </div>
                <div className={`space-y-3 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium">Rapports:</span>
                    <span className="font-bold">{safetyData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dernière:</span>
                    <span className="font-bold">{new Date(safetyData[safetyData.length - 1]?.kpi_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Score:</span>
                    <span className="font-bold text-xl">{safetyData[safetyData.length - 1]?.kpi_value || 100}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {efficiencyData.length > 0 && (
              <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-200 hover:scale-105 ${
                isDark ? 'bg-purple-900/30 border-purple-700/40 hover:bg-purple-900/40' : 'bg-purple-50/80 border-purple-200/60 hover:bg-purple-100/80'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                <div className="relative flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-lg font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>Efficacité</h4>
                </div>
                <div className={`space-y-3 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium">Rapports:</span>
                    <span className="font-bold">{efficiencyData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dernière:</span>
                    <span className="font-bold">{new Date(efficiencyData[efficiencyData.length - 1]?.kpi_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Efficacité:</span>
                    <span className="font-bold text-xl">{efficiencyData[efficiencyData.length - 1]?.kpi_value || 0}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};