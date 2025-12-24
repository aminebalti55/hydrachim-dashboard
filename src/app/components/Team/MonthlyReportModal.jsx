import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Download,
  FileText,
  Users,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  PieChart,
  LineChart,
  Timer,
  Package,
  User,
  Loader2,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { teamsService } from '../../services/teamsService';

export const MonthlyReportModal = ({ analytics, isDark, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Fetch data for selected month from Supabase
  const fetchMonthlyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const year = selectedYear;
      const month = String(selectedMonth + 1).padStart(2, '0');
      const monthDate = `${year}-${month}-01`;

      // Fetch attendance and efficiency data for the selected month
      const [attendanceData, efficiencyData] = await Promise.all([
        teamsService.getTeamProductivityAttendanceByDate(monthDate),
        teamsService.getOperatorEfficiencyByDate(monthDate)
      ]);

      setMonthlyData({
        attendance: attendanceData,
        efficiency: efficiencyData,
        monthDate
      });
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  // Process and analyze monthly data
  const monthlyAnalysis = useMemo(() => {
    if (!monthlyData) return null;

    const { attendance, efficiency } = monthlyData;

    // Extract employees from attendance or efficiency data
    const employeesMap = new Map();

    // Process attendance data
    if (attendance?.employees) {
      attendance.employees.forEach(emp => {
        const existing = employeesMap.get(emp.id) || {
          id: emp.id,
          name: emp.name,
          matricule: emp.matricule,
          role: emp.role || 'Operator',
          attendance: {
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            absentDays: 0,
            congeDays: 0,
            sickLeaveDays: 0,
            totalHours: 0,
            totalLateMinutes: 0,
            records: []
          },
          production: {
            totalKg: 0,
            tasks: [],
            avgDaily: 0
          }
        };

        // Process attendance records
        if (emp.attendance_records && Array.isArray(emp.attendance_records)) {
          emp.attendance_records.forEach(record => {
            existing.attendance.totalDays++;
            existing.attendance.records.push(record);

            // Parse presence hours
            if (record.presence) {
              const [hours, mins] = record.presence.split(':').map(Number);
              const presenceHours = hours + (mins || 0) / 60;
              if (presenceHours > 0 && !['Congé', 'Absence', 'Maladie'].includes(record.motif)) {
                existing.attendance.presentDays++;
                existing.attendance.totalHours += presenceHours;
              }
            }

            // Parse late minutes (only count if employee was present - not on leave/absence/sick)
            if (record.retard && !record.motif) {
              const [h, m] = record.retard.split(':').map(Number);
              const lateMinutes = h * 60 + m;
              if (lateMinutes > 0) {
                existing.attendance.lateDays++;
                existing.attendance.totalLateMinutes += lateMinutes;
              }
            }

            // Properly categorize motifs (reasons for absence)
            if (record.motif) {
              const motifLower = record.motif.toLowerCase();

              if (motifLower.includes('congé')) {
                // Congé = Approved leave/vacation
                existing.attendance.congeDays++;
              } else if (motifLower.includes('maladie')) {
                // Maladie/Maladie P = Sick leave
                existing.attendance.sickLeaveDays++;
              } else if (motifLower.includes('absence')) {
                // Absence = Unexcused absence
                existing.attendance.absentDays++;
              } else {
                // Other motifs count as absence
                existing.attendance.absentDays++;
              }
            }
          });
        }

        employeesMap.set(emp.id, existing);
      });
    }

    // Process efficiency/production data
    if (efficiency?.employees) {
      efficiency.employees.forEach(emp => {
        const existing = employeesMap.get(emp.id) || {
          id: emp.id,
          name: emp.name,
          matricule: emp.matricule,
          role: emp.role || 'Operator',
          attendance: {
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            absentDays: 0,
            congeDays: 0,
            sickLeaveDays: 0,
            totalHours: 0,
            totalLateMinutes: 0,
            records: []
          },
          production: {
            totalKg: 0,
            tasks: [],
            avgDaily: 0
          }
        };

        // Process production tasks
        if (emp.tasks && Array.isArray(emp.tasks)) {
          emp.tasks.forEach(task => {
            const quantity = parseFloat(task.quantity_kg) || parseFloat(task.quantity) || 0;
            existing.production.totalKg += quantity;
            existing.production.tasks.push(task);
          });
          existing.production.avgDaily = emp.tasks.length > 0
            ? existing.production.totalKg / emp.tasks.length
            : 0;
        }

        employeesMap.set(emp.id, existing);
      });
    }

    const employees = Array.from(employeesMap.values());

    // Calculate global statistics
    const totalEmployees = employees.length;
    const totalPresenceDays = employees.reduce((sum, e) => sum + e.attendance.presentDays, 0);
    const totalWorkingDays = employees.reduce((sum, e) => sum + e.attendance.totalDays, 0);
    const totalLateDays = employees.reduce((sum, e) => sum + e.attendance.lateDays, 0);
    const totalLateMinutes = employees.reduce((sum, e) => sum + e.attendance.totalLateMinutes, 0);
    const totalProduction = employees.reduce((sum, e) => sum + e.production.totalKg, 0);
    const totalHoursWorked = employees.reduce((sum, e) => sum + e.attendance.totalHours, 0);

    const attendanceRate = totalWorkingDays > 0
      ? Math.round((totalPresenceDays / totalWorkingDays) * 100)
      : 0;
    const punctualityRate = totalPresenceDays > 0
      ? Math.round(((totalPresenceDays - totalLateDays) / totalPresenceDays) * 100)
      : 100;
    const avgLateMinutes = totalLateDays > 0
      ? Math.round(totalLateMinutes / totalLateDays)
      : 0;

    // Get daily breakdown for charts
    const dailyData = {};
    employees.forEach(emp => {
      emp.attendance.records.forEach(record => {
        if (!record.date) return;
        if (!dailyData[record.date]) {
          dailyData[record.date] = {
            date: record.date,
            present: 0,
            late: 0,
            absent: 0,
            totalHours: 0
          };
        }

        if (record.presence) {
          const [hours, mins] = record.presence.split(':').map(Number);
          const presenceHours = hours + (mins || 0) / 60;
          if (presenceHours > 0 && !['Congé', 'Absence', 'Maladie'].includes(record.motif)) {
            dailyData[record.date].present++;
            dailyData[record.date].totalHours += presenceHours;
          }
        }

        if (record.retard && !record.motif) {
          const [h, m] = record.retard.split(':').map(Number);
          if ((h * 60 + m) > 0) {
            dailyData[record.date].late++;
          }
        }

        // Only count true absences (not congé or sick leave) for dailyData
        if (record.motif) {
          const motifLower = record.motif.toLowerCase();
          if (motifLower.includes('absence')) {
            dailyData[record.date].absent++;
          }
          // Note: Congé and Maladie are not counted as absent in daily charts
        }
      });
    });

    // Get production by day
    const productionByDay = {};
    employees.forEach(emp => {
      emp.production.tasks.forEach(task => {
        if (!task.date) return;
        if (!productionByDay[task.date]) {
          productionByDay[task.date] = { date: task.date, totalKg: 0, tasks: 0 };
        }
        productionByDay[task.date].totalKg += parseFloat(task.quantity_kg) || parseFloat(task.quantity) || 0;
        productionByDay[task.date].tasks++;
      });
    });

    // Employee rankings
    const topProducers = [...employees]
      .filter(e => e.production.totalKg > 0)
      .sort((a, b) => b.production.totalKg - a.production.totalKg)
      .slice(0, 5);

    const bestAttendance = [...employees]
      .filter(e => e.attendance.totalDays > 0)
      .sort((a, b) => {
        const rateA = a.attendance.presentDays / a.attendance.totalDays;
        const rateB = b.attendance.presentDays / b.attendance.totalDays;
        return rateB - rateA;
      })
      .slice(0, 5);

    const mostLate = [...employees]
      .filter(e => e.attendance.lateDays > 0)
      .sort((a, b) => b.attendance.totalLateMinutes - a.attendance.totalLateMinutes)
      .slice(0, 5);

    return {
      monthName: monthNames[selectedMonth],
      year: selectedYear,
      employees,
      stats: {
        totalEmployees,
        attendanceRate,
        punctualityRate,
        avgLateMinutes,
        totalPresenceDays,
        totalWorkingDays,
        totalLateDays,
        totalProduction,
        totalHoursWorked,
        avgProductionPerEmployee: totalEmployees > 0 ? totalProduction / totalEmployees : 0
      },
      dailyData: Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date)),
      productionByDay: Object.values(productionByDay).sort((a, b) => new Date(a.date) - new Date(b.date)),
      rankings: {
        topProducers,
        bestAttendance,
        mostLate
      },
      hasData: employees.length > 0
    };
  }, [monthlyData, selectedMonth, selectedYear]);

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!monthlyAnalysis?.employees) return [];
    if (!searchQuery.trim()) return monthlyAnalysis.employees;

    const query = searchQuery.toLowerCase();
    return monthlyAnalysis.employees.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.matricule?.toString().includes(query)
    );
  }, [monthlyAnalysis?.employees, searchQuery]);

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
    setSelectedEmployee(null);
  };

  // Chart Configurations
  const getAttendanceTrendChart = () => {
    if (!monthlyAnalysis?.dailyData?.length) return null;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);'
      },
      legend: {
        bottom: '5%',
        textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 11 }
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: monthlyAnalysis.dailyData.map(d => {
          const date = new Date(d.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series: [
        {
          name: 'Présents',
          type: 'bar',
          stack: 'total',
          data: monthlyAnalysis.dailyData.map(d => d.present),
          itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: 'Retards',
          type: 'line',
          data: monthlyAnalysis.dailyData.map(d => d.late),
          lineStyle: { color: '#F59E0B', width: 3 },
          itemStyle: { color: '#F59E0B' },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: 'Absents',
          type: 'bar',
          stack: 'total',
          data: monthlyAnalysis.dailyData.map(d => d.absent),
          itemStyle: { color: '#EF4444' }
        }
      ]
    };
  };

  const getProductionTrendChart = () => {
    if (!monthlyAnalysis?.productionByDay?.length) return null;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px;',
        formatter: (params) => {
          const data = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.axisValue}</div>
            <div>Production: <strong>${data.value.toLocaleString()} kg</strong></div>
          </div>`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: monthlyAnalysis.productionByDay.map(d => {
          const date = new Date(d.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 10,
          formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}t` : `${v}kg`
        },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series: [{
        name: 'Production',
        type: 'line',
        data: monthlyAnalysis.productionByDay.map(d => d.totalKg),
        smooth: true,
        lineStyle: { color: '#EC4899', width: 3 },
        itemStyle: { color: '#EC4899' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(236, 72, 153, 0.3)' },
              { offset: 1, color: 'rgba(236, 72, 153, 0.05)' }
            ]
          }
        }
      }]
    };
  };

  const getEmployeeProductionChart = () => {
    if (!monthlyAnalysis?.employees?.length) return null;

    const sortedEmployees = [...monthlyAnalysis.employees]
      .filter(e => e.production.totalKg > 0)
      .sort((a, b) => b.production.totalKg - a.production.totalKg)
      .slice(0, 10);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px;',
        formatter: (params) => {
          const data = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
            <div>Production: <strong>${data.value.toLocaleString()} kg</strong></div>
          </div>`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '5%', top: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 10,
          formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}t` : `${v}kg`
        },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: sortedEmployees.map(e => e.name),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
      },
      series: [{
        type: 'bar',
        data: sortedEmployees.map(e => e.production.totalKg),
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#EC4899' },
              { offset: 1, color: '#F43F5E' }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        }
      }]
    };
  };

  const getAttendancePieChart = () => {
    if (!monthlyAnalysis?.stats) return null;
    const { totalPresenceDays, totalLateDays, totalWorkingDays } = monthlyAnalysis.stats;
    const onTime = totalPresenceDays - totalLateDays;
    const absent = totalWorkingDays - totalPresenceDays;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        extraCssText: 'border-radius: 12px;',
        formatter: '{b}: {c} jours ({d}%)'
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        data: [
          { value: onTime, name: 'À l\'heure', itemStyle: { color: '#10B981' } },
          { value: totalLateDays, name: 'En retard', itemStyle: { color: '#F59E0B' } },
          { value: absent, name: 'Absents', itemStyle: { color: '#EF4444' } }
        ],
        label: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          fontSize: 11,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }]
    };
  };

  const exportToPDF = () => {
    if (!monthlyAnalysis) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Équipe - ${monthlyAnalysis.monthName} ${monthlyAnalysis.year}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 30px; color: #1e293b; }
            .header { background: linear-gradient(135deg, #EC4899, #F43F5E); color: white; padding: 30px; border-radius: 16px; margin-bottom: 30px; }
            h1 { margin: 0; font-size: 2em; }
            .subtitle { opacity: 0.9; margin-top: 8px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .stat-value { font-size: 2em; font-weight: bold; color: #0f172a; }
            .stat-label { color: #64748b; font-size: 0.9em; margin-top: 4px; }
            .section { margin: 30px 0; }
            .section-title { font-size: 1.3em; color: #0f172a; margin-bottom: 16px; border-bottom: 2px solid #EC4899; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: 600; color: #475569; }
            .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8em; display: inline-block; }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-warning { background: #fef3c7; color: #92400e; }
            .badge-danger { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport Mensuel Équipe</h1>
            <div class="subtitle">${monthlyAnalysis.monthName} ${monthlyAnalysis.year} - ${monthlyAnalysis.stats.totalEmployees} employés</div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${monthlyAnalysis.stats.attendanceRate}%</div>
              <div class="stat-label">Taux de Présence</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${monthlyAnalysis.stats.punctualityRate}%</div>
              <div class="stat-label">Taux de Ponctualité</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${(monthlyAnalysis.stats.totalProduction / 1000).toFixed(1)}t</div>
              <div class="stat-label">Production Totale</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${monthlyAnalysis.stats.totalLateDays}</div>
              <div class="stat-label">Jours de Retard</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Top Producteurs</div>
            <table>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Employé</th>
                  <th>Matricule</th>
                  <th>Production</th>
                </tr>
              </thead>
              <tbody>
                ${monthlyAnalysis.rankings.topProducers.map((emp, idx) => `
                  <tr>
                    <td>#${idx + 1}</td>
                    <td>${emp.name}</td>
                    <td>${emp.matricule}</td>
                    <td><strong>${(emp.production.totalKg / 1000).toFixed(2)} t</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Détail par Employé</div>
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Présence</th>
                  <th>Retards</th>
                  <th>Production</th>
                </tr>
              </thead>
              <tbody>
                ${monthlyAnalysis.employees.map(emp => {
                  const rate = emp.attendance.totalDays > 0
                    ? Math.round((emp.attendance.presentDays / emp.attendance.totalDays) * 100)
                    : 0;
                  return `
                    <tr>
                      <td>${emp.name}</td>
                      <td><span class="badge ${rate >= 90 ? 'badge-success' : rate >= 70 ? 'badge-warning' : 'badge-danger'}">${rate}%</span></td>
                      <td>${emp.attendance.lateDays} jours</td>
                      <td>${(emp.production.totalKg / 1000).toFixed(2)} t</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9em;">
            Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Chargement des données...
            </h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!monthlyAnalysis?.hasData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-lg p-8 rounded-2xl border shadow-2xl ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée d'équipe trouvée pour <strong>{monthNames[selectedMonth]} {selectedYear}</strong>.
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Mois précédent
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Mois suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all font-medium shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-7xl h-[90vh] flex flex-col rounded-3xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Header */}
        <div className={`px-8 py-5 border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-t-3xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel Équipe
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Présence, Ponctualité & Production
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchMonthlyData}
                className={`p-2 rounded-xl transition-all ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Rafraîchir"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className={`px-8 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            {/* Month Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateMonth(-1)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center min-w-[180px]">
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {monthlyAnalysis.monthName} {monthlyAnalysis.year}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {monthlyAnalysis.stats.totalEmployees} employés • {monthlyAnalysis.stats.totalWorkingDays} jours
                </div>
              </div>

              <button
                onClick={() => navigateMonth(1)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* View Selector */}
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
                { id: 'employees', label: 'Employés', icon: Users },
                { id: 'charts', label: 'Graphiques', icon: BarChart3 }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setSelectedView(view.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedView === view.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={exportToPDF}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Overview View */}
          {selectedView === 'overview' && (
            <div className="space-y-6">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Taux de Présence',
                    value: `${monthlyAnalysis.stats.attendanceRate}%`,
                    icon: CheckCircle,
                    color: monthlyAnalysis.stats.attendanceRate >= 90 ? 'emerald' : monthlyAnalysis.stats.attendanceRate >= 75 ? 'amber' : 'red',
                    subtitle: `${monthlyAnalysis.stats.totalPresenceDays}/${monthlyAnalysis.stats.totalWorkingDays} jours`
                  },
                  {
                    title: 'Ponctualité',
                    value: `${monthlyAnalysis.stats.punctualityRate}%`,
                    icon: Clock,
                    color: monthlyAnalysis.stats.punctualityRate >= 90 ? 'emerald' : monthlyAnalysis.stats.punctualityRate >= 75 ? 'amber' : 'red',
                    subtitle: `${monthlyAnalysis.stats.totalLateDays} retards`
                  },
                  {
                    title: 'Production Totale',
                    value: `${(monthlyAnalysis.stats.totalProduction / 1000).toFixed(1)}t`,
                    icon: Package,
                    color: 'pink',
                    subtitle: `${(monthlyAnalysis.stats.avgProductionPerEmployee / 1000).toFixed(2)}t/emp`
                  },
                  {
                    title: 'Heures Travaillées',
                    value: `${Math.round(monthlyAnalysis.stats.totalHoursWorked)}h`,
                    icon: Timer,
                    color: 'blue',
                    subtitle: `${Math.round(monthlyAnalysis.stats.totalHoursWorked / monthlyAnalysis.stats.totalEmployees)}h/emp`
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                      isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        stat.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600' :
                        stat.color === 'amber' ? 'bg-amber-500/15 text-amber-600' :
                        stat.color === 'red' ? 'bg-red-500/15 text-red-600' :
                        stat.color === 'pink' ? 'bg-pink-500/15 text-pink-600' :
                        'bg-blue-500/15 text-blue-600'
                      }`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {stat.title}
                      </p>
                      <p className={`text-2xl font-bold mb-1 ${
                        stat.color === 'emerald' ? 'text-emerald-500' :
                        stat.color === 'amber' ? 'text-amber-500' :
                        stat.color === 'red' ? 'text-red-500' :
                        stat.color === 'pink' ? 'text-pink-500' :
                        'text-blue-500'
                      }`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Attendance Trend */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Évolution Présence
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Présents, retards et absences par jour
                      </p>
                    </div>
                  </div>
                  {getAttendanceTrendChart() ? (
                    <ReactECharts option={getAttendanceTrendChart()} style={{ height: '250px' }} />
                  ) : (
                    <div className={`h-[250px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pas de données de présence
                    </div>
                  )}
                </div>

                {/* Production Trend */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Évolution Production
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Production quotidienne (kg)
                      </p>
                    </div>
                  </div>
                  {getProductionTrendChart() ? (
                    <ReactECharts option={getProductionTrendChart()} style={{ height: '250px' }} />
                  ) : (
                    <div className={`h-[250px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pas de données de production
                    </div>
                  )}
                </div>
              </div>

              {/* Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Producers */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Top Producteurs
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {monthlyAnalysis.rankings.topProducers.length > 0 ? (
                      monthlyAnalysis.rankings.topProducers.map((emp, idx) => (
                        <div key={emp.id} className={`flex items-center justify-between p-3 rounded-xl ${
                          isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              idx === 0 ? 'bg-amber-500 text-white' :
                              idx === 1 ? 'bg-slate-400 text-white' :
                              idx === 2 ? 'bg-orange-600 text-white' :
                              isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {emp.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-pink-500">
                            {(emp.production.totalKg / 1000).toFixed(2)}t
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Pas de données
                      </p>
                    )}
                  </div>
                </div>

                {/* Best Attendance */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Meilleure Assiduité
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {monthlyAnalysis.rankings.bestAttendance.length > 0 ? (
                      monthlyAnalysis.rankings.bestAttendance.map((emp, idx) => {
                        const rate = emp.attendance.totalDays > 0
                          ? Math.round((emp.attendance.presentDays / emp.attendance.totalDays) * 100)
                          : 0;
                        return (
                          <div key={emp.id} className={`flex items-center justify-between p-3 rounded-xl ${
                            isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                idx === 0 ? 'bg-emerald-500 text-white' :
                                idx === 1 ? 'bg-slate-400 text-white' :
                                idx === 2 ? 'bg-green-600 text-white' :
                                isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {idx + 1}
                              </div>
                              <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                {emp.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-emerald-500">{rate}%</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Pas de données
                      </p>
                    )}
                  </div>
                </div>

                {/* Most Late */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Plus de Retards
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {monthlyAnalysis.rankings.mostLate.length > 0 ? (
                      monthlyAnalysis.rankings.mostLate.map((emp, idx) => (
                        <div key={emp.id} className={`flex items-center justify-between p-3 rounded-xl ${
                          isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              idx === 0 ? 'bg-red-500 text-white' :
                              idx === 1 ? 'bg-amber-500 text-white' :
                              idx === 2 ? 'bg-orange-500 text-white' :
                              isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {emp.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-amber-500">
                            {emp.attendance.lateDays}j ({emp.attendance.totalLateMinutes}min)
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Aucun retard
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employees View */}
          {selectedView === 'employees' && (
            <div className="space-y-6">

              {/* Search */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <Search className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm ${
                    isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                  }`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Employee Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEmployees.map(emp => {
                  const attendanceRate = emp.attendance.totalDays > 0
                    ? Math.round((emp.attendance.presentDays / emp.attendance.totalDays) * 100)
                    : 0;
                  const punctualityRate = emp.attendance.presentDays > 0
                    ? Math.round(((emp.attendance.presentDays - emp.attendance.lateDays) / emp.attendance.presentDays) * 100)
                    : 100;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-lg ${
                        selectedEmployee?.id === emp.id
                          ? isDark ? 'bg-pink-900/30 border-pink-500' : 'bg-pink-50 border-pink-300'
                          : isDark ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {emp.name}
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              #{emp.matricule} • {emp.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Présence</p>
                          <p className={`text-lg font-bold ${
                            attendanceRate >= 90 ? 'text-emerald-500' :
                            attendanceRate >= 70 ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {attendanceRate}%
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {emp.attendance.presentDays}/{emp.attendance.totalDays} jours
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ponctualité</p>
                          <p className={`text-lg font-bold ${
                            punctualityRate >= 90 ? 'text-emerald-500' :
                            punctualityRate >= 70 ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {punctualityRate}%
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {emp.attendance.lateDays} retards
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Production</p>
                          <p className="text-lg font-bold text-pink-500">
                            {(emp.production.totalKg / 1000).toFixed(2)}t
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {emp.production.tasks.length} tâches
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Heures</p>
                          <p className="text-lg font-bold text-blue-500">
                            {Math.round(emp.attendance.totalHours)}h
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            travaillées
                          </p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedEmployee?.id === emp.id && (
                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                          <h5 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Détails du mois
                          </h5>

                          {/* Recent attendance records */}
                          {emp.attendance.records.length > 0 && (
                            <div className="mb-4">
                              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Dernières présences
                              </p>
                              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                {emp.attendance.records.slice(0, 10).map((record, idx) => (
                                  <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded-lg ${
                                    isDark ? 'bg-slate-700/30' : 'bg-slate-100/50'
                                  }`}>
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                                      {new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      {record.presence && (
                                        <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {record.presence}
                                        </span>
                                      )}
                                      {record.retard && record.retard !== '00:00' && (
                                        <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                                          +{record.retard}
                                        </span>
                                      )}
                                      {record.motif && (
                                        <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                          {record.motif}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recent production tasks */}
                          {emp.production.tasks.length > 0 && (
                            <div>
                              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Dernières productions
                              </p>
                              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                {emp.production.tasks.slice(0, 10).map((task, idx) => (
                                  <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded-lg ${
                                    isDark ? 'bg-slate-700/30' : 'bg-slate-100/50'
                                  }`}>
                                    <div className="flex items-center space-x-2">
                                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                                        {new Date(task.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                      </span>
                                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                        {task.product || task.description || '-'}
                                      </span>
                                    </div>
                                    <span className="font-bold text-pink-500">
                                      {(parseFloat(task.quantity_kg) || parseFloat(task.quantity) || 0).toLocaleString()} kg
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredEmployees.length === 0 && (
                <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun employé trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* Charts View */}
          {selectedView === 'charts' && (
            <div className="space-y-6">

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Attendance Distribution */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Répartition Présence
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        À l'heure, retards et absences
                      </p>
                    </div>
                  </div>
                  {getAttendancePieChart() ? (
                    <ReactECharts option={getAttendancePieChart()} style={{ height: '300px' }} />
                  ) : (
                    <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pas de données
                    </div>
                  )}
                </div>

                {/* Employee Production Ranking */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Production par Employé
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Classement des producteurs
                      </p>
                    </div>
                  </div>
                  {getEmployeeProductionChart() ? (
                    <ReactECharts option={getEmployeeProductionChart()} style={{ height: '300px' }} />
                  ) : (
                    <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pas de données de production
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Charts */}
              <div className="grid grid-cols-1 gap-6">

                {/* Attendance Timeline */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Évolution Journalière
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Présence et retards au fil du mois
                      </p>
                    </div>
                  </div>
                  {getAttendanceTrendChart() ? (
                    <ReactECharts option={getAttendanceTrendChart()} style={{ height: '300px' }} />
                  ) : (
                    <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pas de données de présence
                    </div>
                  )}
                </div>

                {/* Production Timeline */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Tendance Production
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Production quotidienne
                      </p>
                    </div>
                  </div>
                  {getProductionTrendChart() ? (
                    <ReactECharts option={getProductionTrendChart()} style={{ height: '300px' }} />
                  ) : (
                    <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Pas de données de production
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} rounded-b-3xl`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="font-medium">{monthlyAnalysis.stats.totalEmployees}</span> employés •
              <span className="font-medium ml-1">{monthlyAnalysis.stats.attendanceRate}%</span> présence •
              <span className="font-medium text-pink-500 ml-1">{(monthlyAnalysis.stats.totalProduction / 1000).toFixed(1)}t</span> production
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportModal;
