'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  BarChart3,
  Briefcase,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Zap,
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export const EmployeeDetailModal = ({ isOpen, onClose, kpiData, isDark = false }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [activeTab, setActiveTab] = useState('attendance');
  const [expandedMonth, setExpandedMonth] = useState(null);

  // Extract all unique employees from attendance and efficiency data
  const allEmployees = useMemo(() => {
    const employeesMap = new Map();

    // From attendance data
    if (kpiData?.team_productivity_attendance) {
      kpiData.team_productivity_attendance.forEach(record => {
        if (record.employees) {
          record.employees.forEach(emp => {
            const name = emp.name?.trim();
            if (name) {
              if (!employeesMap.has(name)) {
                employeesMap.set(name, {
                  name,
                  attendanceRecords: [],
                  efficiencyRecords: [],
                  totalPresenceDays: 0,
                  totalLateDays: 0,
                  totalAbsentDays: 0,
                  totalCongeDays: 0,
                  totalSickLeaveDays: 0,
                  totalProduction: 0,
                  avgEfficiency: 0
                });
              }
              const empData = employeesMap.get(name);
              empData.attendanceRecords.push({
                ...emp,
                month: record.kpi_date,
                kpiValue: record.kpi_value
              });
            }
          });
        }
      });
    }

    // From efficiency/production data
    if (kpiData?.operator_efficiency) {
      kpiData.operator_efficiency.forEach(record => {
        if (record.employees) {
          record.employees.forEach(emp => {
            const name = emp.name?.trim();
            if (name) {
              if (!employeesMap.has(name)) {
                employeesMap.set(name, {
                  name,
                  attendanceRecords: [],
                  efficiencyRecords: [],
                  totalPresenceDays: 0,
                  totalLateDays: 0,
                  totalAbsentDays: 0,
                  totalCongeDays: 0,
                  totalSickLeaveDays: 0,
                  totalProduction: 0,
                  avgEfficiency: 0
                });
              }
              const empData = employeesMap.get(name);
              empData.efficiencyRecords.push({
                ...emp,
                month: record.kpi_date,
                kpiValue: record.kpi_value
              });
            }
          });
        }
      });
    }

    // Calculate aggregates for each employee
    employeesMap.forEach((emp, name) => {
      // Calculate attendance stats from attendance_records (correct field name)
      emp.attendanceRecords.forEach(record => {
        // Check for attendance_records array (from Supabase structure)
        if (record.attendance_records && Array.isArray(record.attendance_records)) {
          record.attendance_records.forEach(day => {
            // Parse presence string like "08:30" to get hours
            const presenceStr = day.presence || '0';
            const [hours, minutes] = presenceStr.split(':').map(Number);
            const presenceHours = hours + (minutes || 0) / 60;

            if (presenceHours > 0 && day.motif !== 'Congé' && day.motif !== 'Absence' && day.motif !== 'Maladie') {
              emp.totalPresenceDays++;
            }

            // Parse retard string like "00:09" to get minutes (only count if employee was present - not on leave/absence/sick)
            if (day.retard && !day.motif) {
              const [retardHours, retardMins] = day.retard.split(':').map(Number);
              if ((retardHours * 60 + retardMins) > 0) {
                emp.totalLateDays++;
              }
            }

            // Properly categorize motifs (reasons for absence)
            if (day.motif) {
              const motifLower = day.motif.toLowerCase();

              if (motifLower.includes('congé')) {
                // Congé = Approved leave/vacation
                emp.totalCongeDays++;
              } else if (motifLower.includes('maladie')) {
                // Maladie/Maladie P = Sick leave
                emp.totalSickLeaveDays++;
              } else if (motifLower.includes('absence')) {
                // Absence = Unexcused absence
                emp.totalAbsentDays++;
              } else {
                // Other motifs count as absence
                emp.totalAbsentDays++;
              }
            }
          });
        }
      });

      // Calculate production stats from tasks with quantity_kg (correct field name)
      emp.efficiencyRecords.forEach(record => {
        // Use pre-calculated total if available
        if (record.total_production_kg) {
          emp.totalProduction += parseFloat(record.total_production_kg) || 0;
        } else if (record.tasks && Array.isArray(record.tasks)) {
          record.tasks.forEach(task => {
            // Use quantity_kg (correct field name from Supabase)
            emp.totalProduction += parseFloat(task.quantity_kg) || parseFloat(task.quantity) || 0;
          });
        }
      });

      // Calculate average efficiency
      const efficiencyValues = emp.efficiencyRecords.map(r => r.kpiValue || r.efficiency).filter(v => v > 0);
      emp.avgEfficiency = efficiencyValues.length > 0
        ? Math.round(efficiencyValues.reduce((a, b) => a + b, 0) / efficiencyValues.length)
        : 0;
    });

    return Array.from(employeesMap.values());
  }, [kpiData]);

  // Auto-select first employee
  useEffect(() => {
    if (allEmployees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(allEmployees[0]);
    }
  }, [allEmployees, selectedEmployee]);

  // Get unique months
  const availableMonths = useMemo(() => {
    const months = new Set();
    kpiData?.team_productivity_attendance?.forEach(r => months.add(r.kpi_date));
    kpiData?.operator_efficiency?.forEach(r => months.add(r.kpi_date));
    return Array.from(months).sort().reverse();
  }, [kpiData]);

  // Selected employee data with filtering
  const employeeData = useMemo(() => {
    if (!selectedEmployee) return null;

    let attendanceRecords = selectedEmployee.attendanceRecords || [];
    let efficiencyRecords = selectedEmployee.efficiencyRecords || [];

    if (selectedMonth !== 'all') {
      attendanceRecords = attendanceRecords.filter(r => r.month === selectedMonth);
      efficiencyRecords = efficiencyRecords.filter(r => r.month === selectedMonth);
    }

    return {
      ...selectedEmployee,
      filteredAttendance: attendanceRecords,
      filteredEfficiency: efficiencyRecords
    };
  }, [selectedEmployee, selectedMonth]);

  // Performance insights
  const insights = useMemo(() => {
    if (!employeeData) return [];

    const insights = [];
    const { filteredAttendance, filteredEfficiency } = employeeData;

    // Attendance insights
    let totalLate = 0;
    let totalPresent = 0;
    let totalHours = 0;
    let lateMinutes = 0;

    filteredAttendance.forEach(record => {
      if (record.attendance_records && Array.isArray(record.attendance_records)) {
        record.attendance_records.forEach(day => {
          // Parse presence string like "08:30"
          const presenceStr = day.presence || '0';
          const [hours, minutes] = presenceStr.split(':').map(Number);
          const presenceHours = hours + (minutes || 0) / 60;

          if (presenceHours > 0 && !['Congé', 'Absence', 'Maladie'].includes(day.motif)) {
            totalPresent++;
            totalHours += presenceHours;
          }

          // Parse retard string like "00:09" (only count if employee was present - not on congé/absence/sick)
          if (day.retard && !day.motif) {
            const [retardHours, retardMins] = day.retard.split(':').map(Number);
            const tardiness = retardHours * 60 + retardMins;
            if (tardiness > 0) {
              totalLate++;
              lateMinutes += tardiness;
            }
          }
        });
      }
    });

    // Production insights
    let totalProduction = 0;
    let productionDays = 0;

    filteredEfficiency.forEach(record => {
      if (record.total_production_kg) {
        totalProduction += parseFloat(record.total_production_kg) || 0;
        productionDays += record.production_entries || record.tasks?.length || 1;
      } else if (record.tasks && Array.isArray(record.tasks)) {
        record.tasks.forEach(task => {
          totalProduction += parseFloat(task.quantity_kg) || parseFloat(task.quantity) || 0;
          productionDays++;
        });
      }
    });

    const avgDailyProduction = productionDays > 0 ? totalProduction / productionDays : 0;

    // Generate insights
    if (totalLate > 5) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Retards frequents',
        description: `${totalLate} jours de retard (${Math.round(lateMinutes / totalLate)} min en moyenne)`,
        color: 'amber'
      });
    } else if (totalLate === 0 && totalPresent > 0) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Ponctualite excellente',
        description: 'Aucun retard enregistre',
        color: 'emerald'
      });
    }

    if (avgDailyProduction > 1000) {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Haute productivite',
        description: `Production moyenne: ${avgDailyProduction.toFixed(0)} kg/jour`,
        color: 'emerald'
      });
    } else if (avgDailyProduction > 0 && avgDailyProduction < 500) {
      insights.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Potentiel d\'amelioration',
        description: `Production actuelle: ${avgDailyProduction.toFixed(0)} kg/jour`,
        color: 'blue'
      });
    }

    if (totalHours > 0) {
      const avgHoursPerDay = totalHours / totalPresent;
      if (avgHoursPerDay >= 8) {
        insights.push({
          type: 'success',
          icon: Clock,
          title: 'Heures completes',
          description: `${avgHoursPerDay.toFixed(1)}h en moyenne par jour`,
          color: 'emerald'
        });
      }
    }

    return insights;
  }, [employeeData]);

  // Attendance Chart Options
  const attendanceChartOptions = useMemo(() => {
    if (!employeeData?.filteredAttendance?.length) return null;

    const allDays = [];
    employeeData.filteredAttendance.forEach(record => {
      if (record.attendance_records && Array.isArray(record.attendance_records)) {
        record.attendance_records.forEach(day => {
          // Parse presence string like "08:30" to get hours
          const presenceStr = day.presence || '0';
          const [hours, minutes] = presenceStr.split(':').map(Number);
          const presenceHours = hours + (minutes || 0) / 60;

          // Parse retard string like "00:09" to get minutes
          let tardiness = 0;
          if (day.retard) {
            const [retardHours, retardMins] = day.retard.split(':').map(Number);
            tardiness = retardHours * 60 + retardMins;
          }

          allDays.push({
            date: day.date,
            presenceHours: presenceHours || 0,
            tardiness: tardiness,
            motif: day.motif || ''
          });
        });
      }
    });

    // Sort by date
    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark ? '#f1f5f9' : '#1e293b' },
        formatter: (params) => {
          const day = allDays[params[0].dataIndex];
          return `
            <div style="padding: 8px">
              <div style="font-weight: bold; margin-bottom: 4px">${new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
              <div>Presence: ${day.presenceHours}h</div>
              <div>Retard: ${day.tardiness} min</div>
              ${day.motif ? `<div>Motif: ${day.motif}</div>` : ''}
            </div>
          `;
        }
      },
      legend: {
        data: ['Heures de presence', 'Retard (min)'],
        textStyle: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: allDays.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
        axisLabel: { color: isDark ? '#94a3b8' : '#64748b', rotate: 45 }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Heures',
          axisLabel: { color: isDark ? '#94a3b8' : '#64748b' },
          splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } }
        },
        {
          type: 'value',
          name: 'Minutes',
          axisLabel: { color: isDark ? '#94a3b8' : '#64748b' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Heures de presence',
          type: 'bar',
          data: allDays.map(d => d.presenceHours),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Retard (min)',
          type: 'line',
          yAxisIndex: 1,
          data: allDays.map(d => d.tardiness),
          lineStyle: { color: '#f59e0b', width: 2 },
          itemStyle: { color: '#f59e0b' },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    };
  }, [employeeData, isDark]);

  // Production Chart Options
  const productionChartOptions = useMemo(() => {
    if (!employeeData?.filteredEfficiency?.length) return null;

    const allTasks = [];
    employeeData.filteredEfficiency.forEach(record => {
      if (record.tasks && Array.isArray(record.tasks)) {
        record.tasks.forEach(task => {
          allTasks.push({
            date: task.date,
            quantity: parseFloat(task.quantity_kg) || parseFloat(task.quantity) || 0,
            product: task.product || task.description || 'Non specifie'
          });
        });
      }
    });

    // Sort by date
    allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate cumulative
    let cumulative = 0;
    const cumulativeData = allTasks.map(t => {
      cumulative += t.quantity;
      return cumulative;
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark ? '#f1f5f9' : '#1e293b' }
      },
      legend: {
        data: ['Production (kg)', 'Cumul'],
        textStyle: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: allTasks.map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
        axisLabel: { color: isDark ? '#94a3b8' : '#64748b', rotate: 45 }
      },
      yAxis: [
        {
          type: 'value',
          name: 'kg',
          axisLabel: { color: isDark ? '#94a3b8' : '#64748b' },
          splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } }
        },
        {
          type: 'value',
          name: 'Cumul (kg)',
          axisLabel: { color: isDark ? '#94a3b8' : '#64748b' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Production (kg)',
          type: 'bar',
          data: allTasks.map(t => t.quantity),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Cumul',
          type: 'line',
          yAxisIndex: 1,
          data: cumulativeData,
          lineStyle: { color: '#8b5cf6', width: 2 },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
              ]
            }
          },
          smooth: true
        }
      ]
    };
  }, [employeeData, isDark]);

  // Efficiency Trend Chart
  const efficiencyTrendOptions = useMemo(() => {
    if (!employeeData) return null;

    const monthlyData = [];

    // Get monthly KPI values
    employeeData.filteredAttendance.forEach(record => {
      monthlyData.push({
        month: record.month,
        type: 'attendance',
        value: record.kpiValue || 0
      });
    });

    employeeData.filteredEfficiency.forEach(record => {
      const existing = monthlyData.find(m => m.month === record.month);
      if (existing) {
        existing.efficiency = record.kpiValue || 0;
      } else {
        monthlyData.push({
          month: record.month,
          type: 'efficiency',
          efficiency: record.kpiValue || 0,
          value: 0
        });
      }
    });

    monthlyData.sort((a, b) => new Date(a.month) - new Date(b.month));

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark ? '#f1f5f9' : '#1e293b' }
      },
      legend: {
        data: ['Presence %', 'Efficacite %'],
        textStyle: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: monthlyData.map(d => new Date(d.month).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })),
        axisLabel: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: isDark ? '#94a3b8' : '#64748b', formatter: '{value}%' },
        splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } }
      },
      series: [
        {
          name: 'Presence %',
          type: 'line',
          data: monthlyData.map(d => d.value || 0),
          lineStyle: { color: '#3b82f6', width: 3 },
          itemStyle: { color: '#3b82f6' },
          smooth: true,
          symbol: 'circle',
          symbolSize: 8
        },
        {
          name: 'Efficacite %',
          type: 'line',
          data: monthlyData.map(d => d.efficiency || 0),
          lineStyle: { color: '#10b981', width: 3 },
          itemStyle: { color: '#10b981' },
          smooth: true,
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    };
  }, [employeeData, isDark]);

  if (!isOpen) return null;

  const formatMonth = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl border shadow-xl flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Header - Clean and minimal */}
        <div className={`px-5 py-3 border-b flex items-center justify-between flex-shrink-0 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <User className={`w-4.5 h-4.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            </div>
            <div>
              <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Detail Employes
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {allEmployees.length} employes • Presence & Performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-md transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Employee List Sidebar - Compact */}
          <div className={`w-56 border-r flex-shrink-0 overflow-y-auto ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="p-3">
              <p className={`text-xs font-medium uppercase tracking-wide mb-2 px-2 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Employes
              </p>
              <div className="space-y-0.5">
                {allEmployees.map((emp) => (
                  <button
                    key={emp.name}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`w-full text-left px-2.5 py-2 rounded-md transition-all ${
                      selectedEmployee?.name === emp.name
                        ? isDark
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-900'
                        : isDark
                          ? 'hover:bg-slate-800/50 text-slate-400'
                          : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${
                        selectedEmployee?.name === emp.name
                          ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                          : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate text-sm ${
                          selectedEmployee?.name === emp.name
                            ? isDark ? 'text-white' : 'text-slate-900'
                            : ''
                        }`}>{emp.name}</p>
                        <p className={`text-xs truncate ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {emp.totalProduction > 0 ? `${(emp.totalProduction/1000).toFixed(1)}t` : ''}
                          {emp.totalProduction > 0 && emp.avgEfficiency > 0 ? ' · ' : ''}
                          {emp.avgEfficiency > 0 ? `${emp.avgEfficiency}%` : ''}
                          {emp.totalProduction === 0 && emp.avgEfficiency === 0 ? `${emp.attendanceRecords.length} mois` : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedEmployee ? (
              <div className="p-5 space-y-5">
                {/* Employee Header - Clean */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedEmployee.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-0.5">
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {selectedEmployee.attendanceRecords.length} mois presence
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {selectedEmployee.efficiencyRecords.length} mois production
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Month Filter */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="all">Tous les mois</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>{formatMonth(month)}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Stats - Compact grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Jours Presents
                    </p>
                    <p className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedEmployee.totalPresenceDays}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Jours en Retard
                    </p>
                    <p className={`text-xl font-bold ${
                      selectedEmployee.totalLateDays > 5
                        ? 'text-amber-500'
                        : isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {selectedEmployee.totalLateDays}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Production
                    </p>
                    <p className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedEmployee.totalProduction >= 1000
                        ? `${(selectedEmployee.totalProduction/1000).toFixed(1)}t`
                        : `${selectedEmployee.totalProduction}kg`}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Efficacite Moy.
                    </p>
                    <p className={`text-xl font-bold ${
                      selectedEmployee.avgEfficiency >= 85
                        ? 'text-emerald-500'
                        : selectedEmployee.avgEfficiency >= 70
                          ? isDark ? 'text-slate-200' : 'text-slate-800'
                          : 'text-amber-500'
                    }`}>
                      {selectedEmployee.avgEfficiency}%
                    </p>
                  </div>
                </div>

                {/* Insights - Compact inline */}
                {insights.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                          insight.color === 'emerald'
                            ? isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                            : insight.color === 'amber'
                              ? isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'
                              : isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <insight.icon className="w-3.5 h-3.5" />
                        <span>{insight.title}</span>
                        <span className="opacity-60">·</span>
                        <span className="font-normal opacity-80">{insight.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabs - Clean underline style */}
                <div className={`flex space-x-1 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  {[
                    { id: 'attendance', label: 'Presence', icon: Clock },
                    { id: 'production', label: 'Production', icon: BarChart3 },
                    { id: 'details', label: 'Details', icon: FileText }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                        activeTab === tab.id
                          ? isDark
                            ? 'border-blue-500 text-blue-400'
                            : 'border-blue-500 text-blue-600'
                          : isDark
                            ? 'border-transparent text-slate-500 hover:text-slate-300'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'attendance' && attendanceChartOptions && (
                  <div className="pt-4">
                    <ReactECharts option={attendanceChartOptions} style={{ height: '320px' }} />
                  </div>
                )}

                {activeTab === 'production' && productionChartOptions && (
                  <div className="pt-4">
                    <ReactECharts option={productionChartOptions} style={{ height: '320px' }} />
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="pt-4 space-y-3">
                    {/* Monthly Attendance Records */}
                    {employeeData?.filteredAttendance.map((record, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border overflow-hidden ${
                          isDark ? 'border-slate-800' : 'border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedMonth(expandedMonth === record.month ? null : record.month)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 ${
                            isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {formatMonth(record.month)}
                            </span>
                            <span className={`text-sm font-semibold ${
                              record.kpiValue >= 90
                                ? 'text-emerald-600'
                                : record.kpiValue >= 75
                                  ? isDark ? 'text-blue-400' : 'text-blue-600'
                                  : 'text-amber-600'
                            }`}>
                              {record.kpiValue}%
                            </span>
                          </div>
                          {expandedMonth === record.month ? (
                            <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          ) : (
                            <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          )}
                        </button>

                        {expandedMonth === record.month && record.attendance_records && (
                          <div className={`px-3 pb-3 ${isDark ? 'bg-slate-800/20' : 'bg-slate-50/50'}`}>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                                    <th className="text-left py-1.5 px-2 font-medium">Date</th>
                                    <th className="text-left py-1.5 px-2 font-medium">Horaire</th>
                                    <th className="text-left py-1.5 px-2 font-medium">Entree</th>
                                    <th className="text-left py-1.5 px-2 font-medium">Sortie</th>
                                    <th className="text-center py-1.5 px-2 font-medium">Retard</th>
                                    <th className="text-center py-1.5 px-2 font-medium">Heures</th>
                                    <th className="text-left py-1.5 px-2 font-medium">Motif</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.attendance_records.map((day, dayIdx) => {
                                    // Parse retard string to get minutes display
                                    let retardMinutes = 0;
                                    if (day.retard) {
                                      const [h, m] = day.retard.split(':').map(Number);
                                      retardMinutes = h * 60 + m;
                                    }
                                    return (
                                      <tr
                                        key={dayIdx}
                                        className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                                      >
                                        <td className={`py-1.5 px-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                          {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })}
                                        </td>
                                        <td className={`py-1.5 px-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                          {day.schedule || '-'}
                                        </td>
                                        <td className={`py-1.5 px-2 font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                          {day.actual_entry || '-'}
                                        </td>
                                        <td className={`py-1.5 px-2 font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                          {day.actual_exit || '-'}
                                        </td>
                                        <td className="py-1.5 px-2 text-center">
                                          {retardMinutes > 0 ? (
                                            <span className="text-amber-600 font-medium">{retardMinutes}m</span>
                                          ) : (
                                            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>-</span>
                                          )}
                                        </td>
                                        <td className="py-1.5 px-2 text-center">
                                          {day.presence ? (
                                            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{day.presence}</span>
                                          ) : (
                                            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>-</span>
                                          )}
                                        </td>
                                        <td className={`py-1.5 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                          {day.motif || '-'}
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
                      ))}

                    {/* Production Details */}
                    {employeeData?.filteredEfficiency.map((record, idx) => (
                      <div
                        key={`eff-${idx}`}
                        className={`rounded-lg border overflow-hidden ${
                          isDark ? 'border-slate-800' : 'border-slate-200'
                        }`}
                      >
                        <div className={`px-3 py-2.5 flex items-center justify-between ${
                          isDark ? 'bg-emerald-900/20' : 'bg-emerald-50/50'
                        }`}>
                          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Production · {formatMonth(record.month)}
                          </span>
                          <span className="text-sm font-semibold text-emerald-600">
                            {record.total_production_kg
                              ? parseFloat(record.total_production_kg).toLocaleString()
                              : record.tasks
                                ? record.tasks.reduce((sum, t) => sum + (parseFloat(t.quantity_kg) || parseFloat(t.quantity) || 0), 0).toLocaleString()
                                : 0} kg
                          </span>
                        </div>
                        {record.tasks && record.tasks.length > 0 && (
                          <div className={`px-3 pb-3 ${isDark ? 'bg-slate-800/20' : 'bg-slate-50/50'}`}>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                                    <th className="text-left py-1.5 px-2 font-medium">Date</th>
                                    <th className="text-left py-1.5 px-2 font-medium">Produit</th>
                                    <th className="text-right py-1.5 px-2 font-medium">Quantite</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.tasks.map((task, taskIdx) => (
                                    <tr
                                      key={taskIdx}
                                      className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                                    >
                                      <td className={`py-1.5 px-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {new Date(task.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                      </td>
                                      <td className={`py-1.5 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {task.product || task.description || '-'}
                                      </td>
                                      <td className={`py-1.5 px-2 text-right font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {parseFloat(task.quantity_kg || task.quantity || 0).toLocaleString()} kg
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Monthly Trend Chart */}
                {efficiencyTrendOptions && (
                  <div className="pt-4">
                    <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Evolution Mensuelle
                    </p>
                    <ReactECharts option={efficiencyTrendOptions} style={{ height: '220px' }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-3`}>
                    <User className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Selectionnez un employe
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
