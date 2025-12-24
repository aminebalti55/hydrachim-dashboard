import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, BarChart3, Calendar, Clock, AlertTriangle, Package } from 'lucide-react';

export const TeamCharts = ({ analytics, isDark, className = '' }) => {
  // French text labels
  const t = {
    addDataToSeeChart: "Ajoutez des données pour voir les graphiques",
    noData: "Aucune donnée disponible"
  };

  // Modern color palette
  const colors = {
    blue: ['#3B82F6', '#1D4ED8'],
    emerald: ['#10B981', '#047857'],
    amber: ['#F59E0B', '#D97706'],
    red: ['#EF4444', '#DC2626'],
    purple: ['#8B5CF6', '#7C3AED'],
    cyan: ['#06B6D4', '#0891B2'],
    pink: ['#EC4899', '#BE185D']
  };

  // Extract data from Supabase
  const attendanceData = useMemo(() => {
    if (!analytics?.team_productivity_attendance) return [];
    return [...analytics.team_productivity_attendance]
      .sort((a, b) => new Date(a.kpi_date) - new Date(b.kpi_date));
  }, [analytics]);

  const efficiencyData = useMemo(() => {
    if (!analytics?.operator_efficiency) return [];
    return [...analytics.operator_efficiency]
      .sort((a, b) => new Date(a.kpi_date) - new Date(b.kpi_date));
  }, [analytics]);

  // Process attendance records for insights
  const attendanceInsights = useMemo(() => {
    const allRecords = [];
    const monthlyStats = [];

    attendanceData.forEach(entry => {
      const monthName = new Date(entry.kpi_date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      let totalDays = 0;
      let lateDays = 0;
      let totalLateMinutes = 0;
      let totalHoursWorked = 0;
      let absenceDays = 0;
      let congeDays = 0;
      let sickLeaveDays = 0;

      if (entry.employees) {
        entry.employees.forEach(emp => {
          if (emp.attendance_records && Array.isArray(emp.attendance_records)) {
            emp.attendance_records.forEach(day => {
              totalDays++;

              // Parse presence hours
              const presenceStr = day.presence || '0';
              const [hours, minutes] = presenceStr.split(':').map(Number);
              const presenceHours = hours + (minutes || 0) / 60;
              totalHoursWorked += presenceHours;

              // Parse late minutes (only count if employee was present - not on congé/absence/sick leave)
              if (day.retard && !day.motif) {
                const [h, m] = day.retard.split(':').map(Number);
                const lateMinutes = h * 60 + m;
                if (lateMinutes > 0) {
                  lateDays++;
                  totalLateMinutes += lateMinutes;
                }
              }

              // Properly categorize motifs (reasons for absence)
              if (day.motif) {
                const motifLower = day.motif.toLowerCase();

                if (motifLower.includes('congé')) {
                  // Congé = Approved leave/vacation
                  congeDays++;
                } else if (motifLower.includes('maladie')) {
                  // Maladie/Maladie P = Sick leave
                  sickLeaveDays++;
                } else if (motifLower.includes('absence')) {
                  // Absence = Unexcused absence
                  absenceDays++;
                } else {
                  // Other motifs count as absence
                  absenceDays++;
                }
              }

              allRecords.push({
                date: day.date,
                presenceHours,
                lateMinutes: day.retard ? (parseInt(day.retard.split(':')[0]) * 60 + parseInt(day.retard.split(':')[1] || 0)) : 0,
                motif: day.motif,
                schedule: day.schedule
              });
            });
          }
        });
      }

      monthlyStats.push({
        month: monthName,
        rawDate: entry.kpi_date,
        kpiValue: entry.kpi_value,
        totalDays,
        lateDays,
        avgLateMinutes: lateDays > 0 ? Math.round(totalLateMinutes / lateDays) : 0,
        totalLateMinutes,
        avgHoursWorked: totalDays > 0 ? (totalHoursWorked / totalDays).toFixed(1) : 0,
        absenceDays,
        congeDays,
        sickLeaveDays,
        punctualityRate: totalDays > 0 ? Math.round(((totalDays - lateDays) / totalDays) * 100) : 100
      });
    });

    return { allRecords, monthlyStats };
  }, [attendanceData]);

  // Process production data
  const productionInsights = useMemo(() => {
    const dailyProduction = [];
    const monthlyProduction = [];

    efficiencyData.forEach(entry => {
      const monthName = new Date(entry.kpi_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      let monthTotal = 0;
      let productionDays = 0;

      if (entry.employees) {
        entry.employees.forEach(emp => {
          if (emp.total_production_kg) {
            monthTotal += parseFloat(emp.total_production_kg) || 0;
          }
          if (emp.tasks && Array.isArray(emp.tasks)) {
            emp.tasks.forEach(task => {
              const qty = parseFloat(task.quantity_kg) || 0;
              if (qty > 0) {
                productionDays++;
                dailyProduction.push({
                  date: task.date,
                  quantity: qty,
                  description: task.description
                });
              }
            });
          }
        });
      }

      monthlyProduction.push({
        month: monthName,
        shortMonth: new Date(entry.kpi_date).toLocaleDateString('fr-FR', { month: 'short' }),
        rawDate: entry.kpi_date,
        totalKg: monthTotal,
        productionDays,
        avgDaily: productionDays > 0 ? Math.round(monthTotal / productionDays) : 0,
        efficiency: entry.kpi_value
      });
    });

    // Sort daily production by date
    dailyProduction.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { dailyProduction, monthlyProduction };
  }, [efficiencyData]);

  // Base chart options
  const getBaseOptions = () => ({
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E2E8F0' : '#475569',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 12
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '15%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      borderWidth: 1,
      borderRadius: 12,
      textStyle: { color: isDark ? '#F1F5F9' : '#0F172A', fontSize: 13 },
      padding: [12, 16]
    },
    animation: true,
    animationDuration: 800
  });

  // 1. Monthly Attendance Overview Chart
  const getAttendanceOverviewOptions = () => {
    const stats = attendanceInsights.monthlyStats;
    if (stats.length === 0) return null;

    return {
      ...getBaseOptions(),
      legend: {
        data: ['Taux Presence (%)', 'Ponctualite (%)', 'Jours en Retard'],
        textStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
        top: '2%'
      },
      xAxis: {
        type: 'category',
        data: stats.map(s => s.month),
        axisLine: { show: false },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 600 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: '%',
          max: 100,
          axisLine: { show: false },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B', formatter: '{value}%' },
          splitLine: { lineStyle: { color: isDark ? '#334155' : '#F1F5F9', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'Jours',
          axisLine: { show: false },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Taux Presence (%)',
          type: 'bar',
          data: stats.map(s => s.kpiValue),
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.blue[0] }, { offset: 1, color: colors.blue[1] }] },
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '25%'
        },
        {
          name: 'Ponctualite (%)',
          type: 'line',
          data: stats.map(s => s.punctualityRate),
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: colors.emerald[0], width: 3 },
          itemStyle: { color: colors.emerald[0], borderWidth: 2, borderColor: '#fff' }
        },
        {
          name: 'Jours en Retard',
          type: 'bar',
          yAxisIndex: 1,
          data: stats.map(s => s.lateDays),
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.amber[0] }, { offset: 1, color: colors.amber[1] }] },
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '20%'
        }
      ]
    };
  };

  // 2. Late Arrivals Analysis Chart
  const getRetardAnalysisOptions = () => {
    const stats = attendanceInsights.monthlyStats;
    if (stats.length === 0) return null;

    return {
      ...getBaseOptions(),
      legend: {
        data: ['Retard Moyen (min)', 'Total Retard (min)'],
        textStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
        top: '2%'
      },
      xAxis: {
        type: 'category',
        data: stats.map(s => s.month),
        axisLine: { show: false },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 600 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Minutes',
        axisLine: { show: false },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B' },
        splitLine: { lineStyle: { color: isDark ? '#334155' : '#F1F5F9', type: 'dashed' } }
      },
      series: [
        {
          name: 'Retard Moyen (min)',
          type: 'bar',
          data: stats.map(s => s.avgLateMinutes),
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.red[0] }, { offset: 1, color: colors.red[1] }] },
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '35%',
          label: {
            show: true,
            position: 'top',
            formatter: '{c} min',
            color: isDark ? '#F1F5F9' : '#1E293B',
            fontSize: 11,
            fontWeight: 600
          }
        },
        {
          name: 'Total Retard (min)',
          type: 'line',
          data: stats.map(s => s.totalLateMinutes),
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: { color: colors.purple[0], width: 3 },
          itemStyle: { color: colors.purple[0], borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${colors.purple[0]}40` }, { offset: 1, color: `${colors.purple[0]}05` }] }
          }
        }
      ]
    };
  };

  // 3. Daily Production Chart
  const getDailyProductionOptions = () => {
    const data = productionInsights.dailyProduction;
    if (data.length === 0) return null;

    // Calculate cumulative
    let cumulative = 0;
    const withCumulative = data.map(d => {
      cumulative += d.quantity;
      return { ...d, cumulative };
    });

    return {
      ...getBaseOptions(),
      legend: {
        data: ['Production (kg)', 'Cumul (kg)'],
        textStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
        top: '2%'
      },
      tooltip: {
        ...getBaseOptions().tooltip,
        formatter: (params) => {
          const idx = params[0].dataIndex;
          const item = withCumulative[idx];
          return `
            <div style="padding: 4px 0">
              <div style="font-weight: bold; margin-bottom: 6px">${new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
              <div>Production: <b>${item.quantity.toLocaleString()} kg</b></div>
              <div>Cumul: <b>${item.cumulative.toLocaleString()} kg</b></div>
            </div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: withCumulative.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
        axisLine: { show: false },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, rotate: 45 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: 'kg',
          axisLine: { show: false },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B' },
          splitLine: { lineStyle: { color: isDark ? '#334155' : '#F1F5F9', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'Cumul',
          axisLine: { show: false },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Production (kg)',
          type: 'bar',
          data: withCumulative.map(d => d.quantity),
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.emerald[0] }, { offset: 1, color: colors.emerald[1] }] },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '60%'
        },
        {
          name: 'Cumul (kg)',
          type: 'line',
          yAxisIndex: 1,
          data: withCumulative.map(d => d.cumulative),
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: colors.cyan[0], width: 2 },
          itemStyle: { color: colors.cyan[0] }
        }
      ]
    };
  };

  // 4. Monthly Production Comparison
  const getMonthlyProductionOptions = () => {
    const data = productionInsights.monthlyProduction.filter(m => m.totalKg > 0);
    if (data.length === 0) return null;

    return {
      ...getBaseOptions(),
      legend: {
        data: ['Production Totale (kg)', 'Moyenne/Jour (kg)'],
        textStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
        top: '2%'
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.shortMonth),
        axisLine: { show: false },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 600 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Total (kg)',
          axisLine: { show: false },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B' },
          splitLine: { lineStyle: { color: isDark ? '#334155' : '#F1F5F9', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'Moy/Jour',
          axisLine: { show: false },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Production Totale (kg)',
          type: 'bar',
          data: data.map(d => d.totalKg),
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.pink[0] }, { offset: 1, color: colors.pink[1] }] },
            borderRadius: [8, 8, 0, 0]
          },
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            formatter: (p) => `${(p.value / 1000).toFixed(1)}t`,
            color: isDark ? '#F1F5F9' : '#1E293B',
            fontSize: 12,
            fontWeight: 600
          }
        },
        {
          name: 'Moyenne/Jour (kg)',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.avgDaily),
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 12,
          lineStyle: { color: colors.amber[0], width: 3 },
          itemStyle: { color: colors.amber[0], borderWidth: 3, borderColor: '#fff' },
          label: {
            show: true,
            position: 'top',
            formatter: '{c} kg/j',
            color: isDark ? '#F1F5F9' : '#1E293B',
            fontSize: 11,
            fontWeight: 600
          }
        }
      ]
    };
  };

  // Render empty state
  if (!analytics || (attendanceData.length === 0 && efficiencyData.length === 0)) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-6`}>
          <BarChart3 className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
          {t.noData}
        </h3>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t.addDataToSeeChart}
        </p>
      </div>
    );
  }

  const attendanceOptions = getAttendanceOverviewOptions();
  const retardOptions = getRetardAnalysisOptions();
  const dailyProdOptions = getDailyProductionOptions();
  const monthlyProdOptions = getMonthlyProductionOptions();

  // Calculate summary stats
  const latestAttendance = attendanceInsights.monthlyStats[attendanceInsights.monthlyStats.length - 1];
  const latestProduction = productionInsights.monthlyProduction.filter(m => m.totalKg > 0).slice(-1)[0];
  const totalProductionAllTime = productionInsights.monthlyProduction.reduce((sum, m) => sum + m.totalKg, 0);

  return (
    <div className={`space-y-8 ${className}`}>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {latestAttendance && (
          <>
            <div className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-blue-500 to-blue-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Presence</p>
                <p className={`text-3xl font-bold mb-3 text-blue-500`}>{latestAttendance.kpiValue}%</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{latestAttendance.month}</p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-amber-500 to-orange-600">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Retards</p>
                <p className={`text-3xl font-bold mb-3 text-amber-500`}>{latestAttendance.lateDays}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>jours · moy {latestAttendance.avgLateMinutes} min</p>
              </div>
            </div>
          </>
        )}
        {latestProduction && (
          <>
            <div className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Production</p>
                <p className={`text-3xl font-bold mb-3 text-emerald-500`}>{(latestProduction.totalKg / 1000).toFixed(1)}t</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{latestProduction.shortMonth} · {latestProduction.avgDaily} kg/j</p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-pink-500 to-rose-600">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total Prod.</p>
                <p className={`text-3xl font-bold mb-3 text-pink-500`}>{(totalProductionAllTime / 1000).toFixed(1)}t</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>cumul tous mois</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Attendance Overview */}
        {attendanceOptions && (
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Presence & Ponctualite</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evolution mensuelle</p>
              </div>
            </div>
            <ReactECharts option={attendanceOptions} style={{ height: '300px' }} />
          </div>
        )}

        {/* Retard Analysis */}
        {retardOptions && (
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600`}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analyse des Retards</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Temps perdu par mois</p>
              </div>
            </div>
            <ReactECharts option={retardOptions} style={{ height: '300px' }} />
          </div>
        )}

        {/* Daily Production */}
        {dailyProdOptions && (
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600`}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Production Journaliere</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quantites produites (kg)</p>
              </div>
            </div>
            <ReactECharts option={dailyProdOptions} style={{ height: '300px' }} />
          </div>
        )}

        {/* Monthly Production */}
        {monthlyProdOptions && (
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-pink-600`}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Production Mensuelle</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Comparaison par mois</p>
              </div>
            </div>
            <ReactECharts option={monthlyProdOptions} style={{ height: '300px' }} />
          </div>
        )}
      </div>

      {/* Monthly Details Table */}
      {attendanceInsights.monthlyStats.length > 0 && (
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Resume Mensuel Detaille</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  <th className="text-left py-2 px-3 font-medium">Mois</th>
                  <th className="text-center py-2 px-3 font-medium">Presence</th>
                  <th className="text-center py-2 px-3 font-medium">Ponctualite</th>
                  <th className="text-center py-2 px-3 font-medium">Jours Retard</th>
                  <th className="text-center py-2 px-3 font-medium">Retard Moy.</th>
                  <th className="text-center py-2 px-3 font-medium">Heures/Jour</th>
                  <th className="text-right py-2 px-3 font-medium">Production</th>
                </tr>
              </thead>
              <tbody>
                {attendanceInsights.monthlyStats.map((stat, idx) => {
                  const prod = productionInsights.monthlyProduction.find(p =>
                    new Date(p.rawDate).getMonth() === new Date(stat.rawDate).getMonth()
                  );
                  return (
                    <tr key={idx} className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      <td className={`py-3 px-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{stat.month}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          stat.kpiValue >= 90 ? 'bg-emerald-100 text-emerald-700' :
                          stat.kpiValue >= 75 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{stat.kpiValue}%</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          stat.punctualityRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          stat.punctualityRate >= 60 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{stat.punctualityRate}%</span>
                      </td>
                      <td className={`py-3 px-3 text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{stat.lateDays}</td>
                      <td className={`py-3 px-3 text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{stat.avgLateMinutes} min</td>
                      <td className={`py-3 px-3 text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{stat.avgHoursWorked}h</td>
                      <td className={`py-3 px-3 text-right font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {prod ? `${prod.totalKg.toLocaleString()} kg` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
