import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Shield,
  Clock,
  Target,
  BarChart3,
  AlertTriangle,
  Settings,
  Calendar,
  CheckCircle2,
  Eye,
  X,
  FileText,
  XCircle,
  CheckCircle,
  Sparkles,
  Award,
  Activity
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useTeamsKPIData } from '../hooks/useTeamsKPIData';
import AttendanceForm from '../components/Team/AttendanceForm';
import { SafetyIncidentsForm } from '../components/Team/SafetyIncidentsForm';
import { OperatorEfficiencyForm } from '../components/Team/OperatorEfficiencyForm';
import { TeamCharts } from '../components/Team/TeamCharts';
import { MonthlyReportModal } from '../components/Team/MonthlyReportModal';

export const TeamPage = ({ isDark = false }) => {
  // UI State
  const [activeForm, setActiveForm] = useState(null);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  
  // Force re-render trigger
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // KPI Data Hook - Now using Supabase with date-specific queries
  const {
    kpiData,
    updateKPIValue,
    getDepartmentSummary,
    getTeamAnalytics,
    getLatestKPIValue,
    isLoading,
    error,
    refreshData,
    // NEW: Date-specific queries
    getAttendanceByDate,
    getOperatorEfficiencyByDate,
    getSafetyIncidentsByDate
  } = useTeamsKPIData();
  
  // Department configuration
  const departmentId = 'team';
  const department = kpiDefinitions[departmentId];
  const departmentKPIs = department?.kpis || [];
  
  // Stable functions to avoid infinite loops
  const stableGetDepartmentSummary = useCallback(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData, updateTrigger]);
  
  const stableGetTeamAnalytics = useCallback(() => {
    return getTeamAnalytics(departmentId);
  }, [getTeamAnalytics, departmentId, kpiData, updateTrigger]);

  // Get department summary and analytics with proper dependency tracking
  const departmentSummary = useMemo(() => {
    console.log('🔄 Recalculating departmentSummary due to data change');
    return stableGetDepartmentSummary();
  }, [stableGetDepartmentSummary]);
  
  const teamAnalytics = useMemo(() => {
    console.log('🔄 Recalculating teamAnalytics due to data change');
    return stableGetTeamAnalytics();
  }, [stableGetTeamAnalytics]);

  // UPDATED: Handle form operations with date-specific data loading
  const handleOpenForm = async (kpiId) => {
    const kpi = departmentKPIs.find(k => k.id === kpiId);
    
    // Get the latest value for display purposes
    const latestValue = getLatestKPIValue(kpiId);
    
    // For forms, we want to load data for today's date by default
    // or the latest available date if no data exists for today
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log('🔧 Opening form for KPI:', kpiId, 'with today date:', todayISO);
    
    // The AttendanceForm will handle loading the correct date-specific data
    // via its useEffect when the component mounts with the default date
    setSelectedKPI({
      ...kpi,
      latestValue
    });
    setActiveForm(kpiId);
  };

  // Handle save with proper parameter structure and force re-render
  const handleSaveKPI = async (departmentId, kpiId, dataObject, notes = '') => {
    try {
      console.log('💾 Saving KPI data to Supabase:', { departmentId, kpiId, dataObject, notes });
      
      // Call the hook's updateKPIValue which saves to Supabase
      await updateKPIValue(departmentId, kpiId, dataObject, notes);
      
      console.log('✅ KPI data saved successfully to Supabase');
      
      // Close form
      setActiveForm(null);
      setSelectedKPI(null);
      
      // Force a re-render to ensure UI updates
      setUpdateTrigger(prev => prev + 1);
      
      // Small delay to ensure state propagation
      setTimeout(() => {
        console.log('🔄 Forced component update after save');
      }, 100);
    } catch (error) {
      console.error('❌ Error saving KPI to Supabase:', error);
      alert('Échec de sauvegarde des données KPI. Veuillez réessayer.');
    }
  };

  const handleCancelForm = () => {
    setActiveForm(null);
    setSelectedKPI(null);
  };

  // Enhanced stats calculation with real data from forms
  const stats = useMemo(() => {
    console.log('📈 Recalculating stats with latest real data from Supabase');
    
    if (!departmentSummary?.kpis) {
      return [
        { title: 'KPIs Suivis', value: '0/3', change: 0, changeText: 'actifs', icon: Target, color: 'pink' },
        { title: 'Productivité Moyenne', value: '0%', change: 0, changeText: 'équipe', icon: TrendingUp, color: 'violet' },
        { title: 'Employés Actifs', value: '0', change: 0, changeText: 'employés', icon: Users, color: 'blue' },
        { title: 'Score Sécurité', value: '100%', change: 100, changeText: 'sécurité', icon: Shield, color: 'emerald' }
      ];
    }

    const kpisWithData = departmentSummary.kpis.filter(kpi => kpi.latestValue) || [];
    
    // Get real data from each KPI
    const attendanceKPI = kpisWithData.find(kpi => kpi.id === 'team_productivity_attendance');
    const safetyKPI = kpisWithData.find(kpi => kpi.id === 'safety_incidents');
    const efficiencyKPI = kpisWithData.find(kpi => kpi.id === 'operator_efficiency');
    
    // Calculate total active employees across all KPIs
    const totalEmployees = new Set();
    
    // From attendance data
    if (attendanceKPI?.latestValue?.data?.employees) {
      attendanceKPI.latestValue.data.employees.forEach(emp => {
        if (emp.name?.trim()) totalEmployees.add(emp.name.trim());
      });
    }
    
    // From efficiency data
    if (efficiencyKPI?.latestValue?.data?.employees) {
      efficiencyKPI.latestValue.data.employees.forEach(emp => {
        if (emp.name?.trim()) totalEmployees.add(emp.name.trim());
      });
    }
    
    // Calculate team productivity (from attendance form)
    const teamProductivity = attendanceKPI?.latestValue?.value || 0;
    
    // Calculate safety score (from safety incidents form)
    const safetyScore = safetyKPI?.latestValue?.value || 100;
    
    return [
      {
        title: 'KPIs Suivis',
        value: `${kpisWithData.length}/3`,
        change: kpisWithData.length,
        changeText: 'actifs',
        icon: Target,
        color: 'pink'
      },
      {
        title: 'Productivité Équipe',
        value: `${teamProductivity}%`,
        change: teamProductivity,
        changeText: 'productivité',
        icon: TrendingUp,
        color: 'violet'
      },
      {
        title: 'Employés Actifs',
        value: totalEmployees.size.toString(),
        change: totalEmployees.size,
        changeText: 'employés',
        icon: Users,
        color: 'blue'
      },
      {
        title: 'Score Sécurité',
        value: `${safetyScore}%`,
        change: safetyScore,
        changeText: 'sécurité',
        icon: Shield,
        color: safetyScore >= 90 ? 'emerald' : safetyScore >= 70 ? 'amber' : 'red'
      }
    ];
  }, [departmentSummary]);
  
  const deptName = 'Ressources Humaines & Performance d\'Équipe';

  // Enhanced KPI Cards with real data rendering
  const renderKPICard = (kpi) => {
    const kpiSummary = departmentSummary?.kpis?.find(k => k.id === kpi.id);
    const latestValue = kpiSummary?.latestValue;
    const status = kpiSummary?.status || 'no-data';

    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-emerald-800 bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700';
        case 'good': return 'text-blue-800 bg-blue-200 dark:bg-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700';
        case 'needs-attention': return 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700';
        default: return 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
      }
    };

    const getKPIIcon = (kpiId) => {
      switch (kpiId) {
        case 'team_productivity_attendance': return Clock;
        case 'safety_incidents': return Shield;
        case 'operator_efficiency': return Settings;
        default: return Target;
      }
    };

    const getKPIColor = (kpiId) => {
      switch (kpiId) {
        case 'team_productivity_attendance': return 'from-blue-600 to-blue-700';
        case 'safety_incidents': return 'from-red-600 to-red-700';
        case 'operator_efficiency': return 'from-purple-600 to-purple-700';
        default: return 'from-pink-600 to-pink-700';
      }
    };

    const getKPIName = (kpiId) => {
      switch (kpiId) {
        case 'team_productivity_attendance': return 'Productivité & Présence de l\'Équipe';
        case 'safety_incidents': return 'Incidents de Sécurité';
        case 'operator_efficiency': return 'Efficacité de l\'Opérateur';
        default: return 'KPI Équipe';
      }
    };

    const getKPIDescription = (kpiId) => {
      switch (kpiId) {
        case 'team_productivity_attendance': return 'Suivi de la présence et de la productivité de l\'équipe avec gestion des heures de travail';
        case 'safety_incidents': return 'Surveillance et enregistrement des incidents affectant l\'environnement de travail et les équipements';
        case 'operator_efficiency': return 'Mesure de l\'efficacité des opérateurs à travers l\'assignation et l\'achèvement des tâches';
        default: return 'Mesures de performance de l\'équipe';
      }
    };

    const KPIIcon = getKPIIcon(kpi.id);
    const kpiName = getKPIName(kpi.id);
    const kpiDescription = getKPIDescription(kpi.id);

    // Enhanced summary metrics calculation with real data
    const getSummaryMetrics = () => {
      if (!latestValue || !latestValue.data) {
        return { primary: 'Aucune Donnée', secondary: 'Ajoutez des données pour voir les métriques', progress: 0 };
      }

      const data = latestValue.data;
      const mainValue = latestValue.value; // Main KPI value
      const target = data.weeklyTarget || data.monthlyTarget || kpi.target || 85;

      switch (kpi.id) {
        case 'team_productivity_attendance':
          const employees = data.employees || [];
          const presentEmployees = employees.filter(emp => emp.workHours > 0).length;
          const totalEmployees = employees.length;
          
          return {
            primary: `${mainValue}%`,
            secondary: `${presentEmployees}/${totalEmployees} présents`,
            progress: (mainValue / target) * 100,
            details: `Productivité moyenne: ${mainValue}% • Objectif: ${target}%`
          };
        
        case 'safety_incidents':
          const incidents = data.incidents || [];
          const criticalIncidents = incidents.filter(inc => inc.severity === 'critical').length;
          const totalIncidents = incidents.length;
          
          return {
            primary: `${mainValue}%`,
            secondary: `${totalIncidents} incidents • ${criticalIncidents} critiques`,
            progress: mainValue, // Safety score is already a percentage
            details: `Score sécurité: ${mainValue}% • Limite: ≤${target} incidents/semaine`
          };
        
        case 'operator_efficiency':
          const operators = data.employees || [];
          const totalTasks = operators.reduce((sum, op) => sum + (op.tasks?.length || 0), 0);
          const completedTasks = operators.reduce((sum, op) => 
            sum + (op.tasks?.filter(t => t.completed).length || 0), 0);
          
          return {
            primary: `${mainValue}%`,
            secondary: `${completedTasks}/${totalTasks} tâches • ${operators.length} opérateurs`,
            progress: (mainValue / target) * 100,
            details: `Efficacité moyenne: ${mainValue}% • ${operators.length} opérateurs actifs`
          };
        
        default:
          return { primary: 'Aucune Donnée', secondary: 'Type de KPI inconnu', progress: 0 };
      }
    };

    const metrics = getSummaryMetrics();

    const getStatusText = (status) => {
      switch (status) {
        case 'excellent': return 'Excellent';
        case 'good': return 'Bon';
        case 'needs-attention': return 'Attention Requise';
        default: return 'Aucune Donnée';
      }
    };

    return (
      <div
        key={kpi.id}
        onClick={() => handleOpenForm(kpi.id)}
        className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
          isDark ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-blue-400/50 hover:bg-slate-50/50'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getKPIColor(kpi.id)} flex items-center justify-center shadow-lg`}>
            <KPIIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </div>
          </div>
        </div>

        {/* KPI Info */}
        <div className="mb-4">
          <h4 className={`text-base font-bold mb-2 group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {kpiName}
          </h4>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {kpiDescription}
          </p>
        </div>
        
        {/* Enhanced Metrics with Real Data */}
        {latestValue ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {metrics.primary}
              </span>
              {metrics.progress > 0 && (
                <div className="text-right">
                  <div className={`text-xs font-semibold ${
                    metrics.progress >= 100 ? 'text-emerald-600' :
                    metrics.progress >= 80 ? 'text-blue-600' :
                    metrics.progress >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {kpi.id === 'safety_incidents' ? 'Score' : 
                     metrics.progress >= 100 ? 'Objectif dépassé ✓' : 
                     Math.round(Math.min(metrics.progress, 100)) + '% atteint'}
                  </div>
                </div>
              )}
            </div>
            
            {metrics.progress > 0 && kpi.id !== 'safety_incidents' && (
              <div className={`w-full rounded-full h-2 shadow-inner ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                    metrics.progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                    metrics.progress >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    metrics.progress >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${Math.min(metrics.progress, 100)}%` }}
                />
              </div>
            )}

            {/* Safety score visualization */}
            {kpi.id === 'safety_incidents' && (
              <div className={`w-full rounded-full h-2 shadow-inner ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                    metrics.progress >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                    metrics.progress >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${Math.min(metrics.progress, 100)}%` }}
                />
              </div>
            )}
            
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {metrics.secondary}
            </p>
            
            <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Dernière mise à jour: {new Date(latestValue.date).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            {/* Additional details tooltip */}
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              {metrics.details} {metrics.progress > 100 ? `• Performance: ${Math.round(metrics.progress)}% de l'objectif` : ''}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className={`w-12 h-12 rounded-xl ${
              isDark ? 'bg-slate-700 group-hover:bg-blue-900/30' : 'bg-slate-100 group-hover:bg-blue-100'
            } flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
              <Plus className={`w-6 h-6 ${
                isDark ? 'text-slate-300 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-500'
              } transition-all duration-300`} />
            </div>
            <p className={`text-sm font-semibold mb-1 ${
              isDark ? 'text-slate-200 group-hover:text-blue-300' : 'text-slate-800 group-hover:text-blue-600'
            } transition-colors`}>
              Configurer ce KPI
            </p>
            <p className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Cliquez pour commencer le suivi
            </p>
          </div>
        )}
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className={`text-center p-8 rounded-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Erreur de chargement
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
                Impossible de charger les données depuis Supabase
              </p>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Forms - UPDATED: No longer passing existingData as forms handle their own date-specific loading */}
        {activeForm === 'team_productivity_attendance' && (
          <AttendanceForm
            onSave={handleSaveKPI}
            onCancel={handleCancelForm}
            existingData={null} // Let the form handle its own data loading
            isDark={isDark}
          />
        )}

        {activeForm === 'safety_incidents' && (
          <SafetyIncidentsForm
            onSave={handleSaveKPI}
            onCancel={handleCancelForm}
            existingData={selectedKPI?.latestValue?.data}
            isDark={isDark}
          />
        )}

        {activeForm === 'operator_efficiency' && (
          <OperatorEfficiencyForm
            onSave={handleSaveKPI}
            onCancel={handleCancelForm}
            existingData={selectedKPI?.latestValue?.data}
            isDark={isDark}
          />
        )}

        {/* Enhanced Monthly Report Modal */}
        {showReports && (
          <MonthlyReportModal 
            analytics={teamAnalytics}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </h1>
              <p className={`text-base mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Gestion avancée de la performance d'équipe avec suivi intelligent des présences, incidents et efficacité
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Monthly Report Button */}
            <button
              onClick={() => setShowReports(true)}
              className={`flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-200 font-medium group shadow-sm ${
                isDark 
                  ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50' 
                  : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Rapport Mensuel</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid with Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all ${
                  stat.color === 'pink' ? 'bg-pink-600' :
                  stat.color === 'violet' ? 'bg-violet-600' :
                  stat.color === 'blue' ? 'bg-blue-600' :
                  stat.color === 'emerald' ? 'bg-emerald-600' :
                  stat.color === 'amber' ? 'bg-amber-600' :
                  stat.color === 'red' ? 'bg-red-600' :
                  'bg-slate-600'
                }`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mb-3 ${
                  stat.color === 'pink' ? 'text-pink-600' :
                  stat.color === 'violet' ? 'text-violet-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'amber' ? 'text-amber-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    stat.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                    stat.color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    stat.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {stat.changeText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KPI Cards Section */}
        <div className={`rounded-2xl border p-8 shadow-sm ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Indicateurs Clés de Performance
              </h3>
              <p className={`text-base mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {departmentSummary?.kpis?.filter(kpi => kpi.latestValue).length || 0} / {departmentKPIs.length || 0} configurés • Gestion intelligente des équipes et performance opérationnelle
              </p>
            </div>
          </div>

          {departmentKPIs && departmentKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {departmentKPIs.map(renderKPICard)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                <Users className="w-12 h-12 text-pink-600" />
              </div>
              <h4 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Prêt à Démarrer la Gestion d'Équipe
              </h4>
              <p className={`text-lg mb-10 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Commencez à suivre la productivité, les présences et la sécurité de votre équipe avec nos outils intelligents
              </p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => handleOpenForm('team_productivity_attendance')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Suivre la Présence
                </button>
                <button 
                  onClick={() => handleOpenForm('safety_incidents')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Gérer la Sécurité
                </button>
                <button 
                  onClick={() => handleOpenForm('operator_efficiency')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Gérer les Tâches
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        {teamAnalytics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Analyse de Performance
              </h3>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <BarChart3 className="w-4 h-4" />
                <span>Visualisation de données en temps réel</span>
              </div>
            </div>
            
            <TeamCharts 
              analytics={teamAnalytics}
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </div>
  );
};