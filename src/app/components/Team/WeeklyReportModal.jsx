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
  Activity
} from 'lucide-react';

// Helper function to calculate week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export const WeeklyReportModal = ({ analytics, isDark, onClose, weekNumber }) => {
  // Calculate comprehensive weekly statistics from real KPI data
  const weeklyStats = useMemo(() => {
    if (!analytics) return null;

    // Get current week data
    const currentWeek = weekNumber || getWeekNumber(new Date());
    
    // Extract real data from KPI structure
    const attendanceData = (analytics['team_productivity_attendance'] || []).filter(entry => 
      getWeekNumber(new Date(entry.date)) === currentWeek
    );
    
    const safetyData = (analytics['safety_incidents'] || []).filter(entry => 
      getWeekNumber(new Date(entry.date)) === currentWeek
    );
    
    const efficiencyData = (analytics['operator_efficiency'] || []).filter(entry => 
      getWeekNumber(new Date(entry.date)) === currentWeek
    );

    // Calculate metrics from real data
    const attendanceAvg = attendanceData.length > 0 
      ? Math.round(attendanceData.reduce((sum, entry) => sum + (entry.value || 0), 0) / attendanceData.length)
      : 0;

    const totalIncidents = safetyData.reduce((sum, entry) => sum + (entry.data?.totalIncidents || 0), 0);
    const latestSafetyScore = safetyData.length > 0 ? safetyData[safetyData.length - 1].value : 100;
    
    const efficiencyAvg = efficiencyData.length > 0
      ? Math.round(efficiencyData.reduce((sum, entry) => sum + (entry.value || 0), 0) / efficiencyData.length)
      : 0;

    // Get all unique employees from the week
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
              attendanceDays: 0
            });
          }
          const employee = allEmployees.get(emp.name);
          employee.productivity.push(emp.productivity || 0);
          employee.workHours += emp.workHours || 0;
          employee.attendanceDays++;
          employee.daysActive++;
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
              attendanceDays: 0
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
              attendanceDays: 0
            });
          }
          const employee = allEmployees.get(emp.name);
          employee.efficiency.push(emp.efficiency || 0);
          employee.tasks = [...employee.tasks, ...(emp.tasks || [])];
          if (employee.attendanceDays === 0) employee.daysActive++;
        }
      });
    });

    // Calculate averages for employees
    const employeeArray = Array.from(allEmployees.values()).map(emp => ({
      ...emp,
      avgProductivity: emp.productivity.length > 0 ? Math.round(emp.productivity.reduce((a, b) => a + b, 0) / emp.productivity.length) : 0,
      avgEfficiency: emp.efficiency.length > 0 ? Math.round(emp.efficiency.reduce((a, b) => a + b, 0) / emp.efficiency.length) : 0,
      completedTasks: emp.tasks.filter(t => t.completed).length,
      totalTasks: emp.tasks.length
    }));

    // Daily breakdown using real data
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      date.setTime(currentWeekStart.getTime() + (i * 24 * 60 * 60 * 1000));
      
      const dayData = {
        date: date.toLocaleDateString('fr-FR'),
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        attendance: attendanceData.find(entry => 
          new Date(entry.date).toDateString() === date.toDateString()
        )?.value || 0,
        incidents: safetyData.find(entry => 
          new Date(entry.date).toDateString() === date.toDateString()
        )?.data?.totalIncidents || 0,
        efficiency: efficiencyData.find(entry => 
          new Date(entry.date).toDateString() === date.toDateString()
        )?.value || 0
      };
      dailyBreakdown.push(dayData);
    }

    return {
      weekNumber: currentWeek,
      attendanceAvg,
      totalIncidents,
      safetyScore: latestSafetyScore,
      efficiencyAvg,
      employees: employeeArray,
      dailyBreakdown,
      totalEmployees: employeeArray.length,
      totalWorkHours: employeeArray.reduce((sum, emp) => sum + emp.workHours, 0),
      totalTasks: employeeArray.reduce((sum, emp) => sum + emp.totalTasks, 0),
      completedTasks: employeeArray.reduce((sum, emp) => sum + emp.completedTasks, 0),
      activeDays: Math.max(...employeeArray.map(emp => emp.daysActive), 0),
      hasData: attendanceData.length > 0 || safetyData.length > 0 || efficiencyData.length > 0
    };
  }, [analytics, weekNumber]);

  if (!weeklyStats || !weeklyStats.hasData) {
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
              Aucune donnée d'équipe trouvée pour cette semaine. Ajoutez des données via les formulaires KPI.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chart options for daily performance
  const getDailyPerformanceOptions = () => ({
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
      data: weeklyStats.dailyBreakdown.map(day => day.dayName),
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
        name: 'Présence',
        type: 'bar',
        data: weeklyStats.dailyBreakdown.map(day => day.attendance),
        itemStyle: { color: '#3B82F6', borderRadius: [2, 2, 0, 0] }
      },
      {
        name: 'Efficacité',
        type: 'line',
        data: weeklyStats.dailyBreakdown.map(day => day.efficiency),
        smooth: true,
        lineStyle: { color: '#8B5CF6', width: 3 },
        itemStyle: { color: '#8B5CF6' }
      }
    ]
  });

  const getOverallStatus = () => {
    const score = (weeklyStats.attendanceAvg + weeklyStats.efficiencyAvg) / 2;
    if (score >= 90) return { status: 'excellent', color: 'green', text: 'Excellent' };
    if (score >= 75) return { status: 'good', color: 'blue', text: 'Bon' };
    return { status: 'needs-attention', color: 'red', text: 'Amélioration Nécessaire' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Hebdomadaire - Semaine {weeklyStats.weekNumber}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse complète de la performance d'équipe
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}>
                <Download className="w-4 h-4" />
                <span>Exporter</span>
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
                    {overallStatus.color === 'green' ? <CheckCircle className="w-6 h-6 text-white" /> :
                     overallStatus.color === 'blue' ? <Activity className="w-6 h-6 text-white" /> :
                     <AlertTriangle className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      overallStatus.color === 'green' ? 
                        isDark ? 'text-green-400' : 'text-green-700' :
                      overallStatus.color === 'blue' ? 
                        isDark ? 'text-blue-400' : 'text-blue-700' :
                        isDark ? 'text-red-400' : 'text-red-700'
                    }`}>
                      Performance de la Semaine: {overallStatus.text}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Score global: {Math.round((weeklyStats.attendanceAvg + weeklyStats.efficiencyAvg) / 2)}% • Score sécurité: {weeklyStats.safetyScore}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    overallStatus.color === 'green' ? 'text-green-600' :
                    overallStatus.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {weeklyStats.totalEmployees}
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
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Productivité Équipe
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyStats.attendanceAvg}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyStats.totalWorkHours}h travaillées
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Sécurité
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${
                  weeklyStats.totalIncidents === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {weeklyStats.safetyScore}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyStats.totalIncidents} incidents
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Efficacité Moyenne
                    </h4>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyStats.efficiencyAvg}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyStats.completedTasks}/{weeklyStats.totalTasks} tâches
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
                  {weeklyStats.activeDays}/7
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Jours avec activité
                </div>
              </div>
            </div>

            {/* Daily Performance Chart */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Performance Quotidienne
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Évolution jour par jour
                  </p>
                </div>
              </div>
              
              <ReactECharts 
                option={getDailyPerformanceOptions()} 
                style={{ height: '300px' }}
                opts={{ renderer: 'svg' }}
              />
            </div>

            {/* Employee Performance Table */}
            {weeklyStats.employees.length > 0 && (
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Performance Individuelle
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Détail par employé
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Employé
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
                      {weeklyStats.employees.map((employee, index) => (
                        <tr key={index} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                          <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {employee.name.charAt(0)}
                              </div>
                              <span className="font-medium">{employee.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              employee.avgProductivity >= 90 ? 'bg-green-600 text-white' :
                              employee.avgProductivity >= 75 ? 'bg-blue-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {employee.avgProductivity}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              employee.avgEfficiency >= 90 ? 'bg-green-600 text-white' :
                              employee.avgEfficiency >= 75 ? 'bg-blue-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {employee.avgEfficiency}%
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {employee.workHours}h
                          </td>
                          <td className={`py-3 px-4 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {employee.completedTasks}/{employee.totalTasks}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              employee.incidents === 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
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

            {/* Weekly Summary */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé de la Semaine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Points Forts
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {weeklyStats.attendanceAvg >= 90 && <li>• Excellente productivité d'équipe</li>}
                    {weeklyStats.totalIncidents === 0 && <li>• Aucun incident de sécurité</li>}
                    {weeklyStats.safetyScore >= 90 && <li>• Excellent score de sécurité</li>}
                    {weeklyStats.efficiencyAvg >= 85 && <li>• Haute efficacité opérationnelle</li>}
                    {weeklyStats.completedTasks / weeklyStats.totalTasks >= 0.8 && <li>• Bon taux de completion des tâches</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Améliorations
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {weeklyStats.attendanceAvg < 75 && <li>• Améliorer la productivité</li>}
                    {weeklyStats.totalIncidents > 0 && <li>• Réduire les incidents</li>}
                    {weeklyStats.safetyScore < 80 && <li>• Renforcer la sécurité</li>}
                    {weeklyStats.efficiencyAvg < 75 && <li>• Optimiser l'efficacité</li>}
                    {weeklyStats.employees.length === 0 && <li>• Augmenter l'engagement</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Actions Recommandées
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li>• Formation continue équipe</li>
                    <li>• Révision processus sécurité</li>
                    <li>• Feedback régulier employés</li>
                    <li>• Optimisation des tâches</li>
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