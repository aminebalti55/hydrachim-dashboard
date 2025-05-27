import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Shield,
  Clock,
  Target,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Settings,
  Calendar,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useKPIData } from '../hook/useKPIData';
import AttendanceForm from '../components/Team/AttendanceForm';
import { SafetyIncidentsForm } from '../components/Team/SafetyIncidentsForm';
import { OperatorEfficiencyForm } from '../components/Team/OperatorEfficiencyForm';
import { TeamCharts } from '../components/Team/TeamCharts';
import { TeamAlertSystem } from '../components/Team/TeamAlertSystem';
import { WeeklyReportModal } from '../components/Team/WeeklyReportModal';
import { MonthlyReportModal } from '../components/Team/MonthlyReportModal';

export const TeamPage = ({ isDark = false }) => {
  // UI State
  const [activeForm, setActiveForm] = useState(null);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState('weekly'); // 'weekly' or 'monthly'
  
  // FIXED: Force re-render trigger
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // KPI Data Hook
  const {
    kpiData,
    updateKPIValue,
    getDepartmentSummary,
    getTeamAnalytics,
    isLoading
  } = useKPIData();
  
  // Department configuration
  const departmentId = 'team';
  const department = kpiDefinitions[departmentId];
  const departmentKPIs = department?.kpis || [];
  
  // FIXED: Stable getDepartmentSummary using useCallback to avoid infinite loops
  const stableGetDepartmentSummary = useCallback(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData, updateTrigger]);
  
  const stableGetTeamAnalytics = useCallback(() => {
    return getTeamAnalytics(departmentId);
  }, [getTeamAnalytics, departmentId, kpiData, updateTrigger]);

  // FIXED: Get department summary and analytics with proper dependency tracking
  const departmentSummary = useMemo(() => {
    console.log('🔄 Recalculating departmentSummary due to data change');
    return stableGetDepartmentSummary();
  }, [stableGetDepartmentSummary]);
  
  const teamAnalytics = useMemo(() => {
    console.log('🔄 Recalculating teamAnalytics due to data change');
    return stableGetTeamAnalytics();
  }, [stableGetTeamAnalytics]);

  // Debug effect to track data changes
  useEffect(() => {
    console.log('📊 KPI Data changed in Team component:', {
      hasTeamData: !!kpiData?.team,
      teamKPIs: Object.keys(kpiData?.team || {}),
      departmentSummaryExists: !!departmentSummary,
      teamAnalyticsExists: !!teamAnalytics,
      updateTrigger
    });
  }, [kpiData, departmentSummary, teamAnalytics, updateTrigger]);

  // Handle form operations
  const handleOpenForm = (kpiId) => {
    const kpi = departmentKPIs.find(k => k.id === kpiId);
    setSelectedKPI(kpi);
    setActiveForm(kpiId);
  };

  // FIXED: Handle save with proper parameter structure and force re-render
  const handleSaveKPI = async (departmentId, kpiId, dataObject, notes = '') => {
    try {
      console.log('💾 Saving KPI data:', { departmentId, kpiId, dataObject, notes });
      
      // Call the hook's updateKPIValue with the data object
      await updateKPIValue(departmentId, kpiId, dataObject, notes);
      
      console.log('✅ KPI data saved successfully');
      
      // Close form
      setActiveForm(null);
      setSelectedKPI(null);
      
      // FIXED: Force a re-render to ensure UI updates
      setUpdateTrigger(prev => prev + 1);
      
      // Small delay to ensure state propagation
      setTimeout(() => {
        console.log('🔄 Forced component update after save');
      }, 100);
    } catch (error) {
      console.error('❌ Error saving KPI:', error);
      alert('Échec de sauvegarde des données KPI. Veuillez réessayer.');
    }
  };

  const handleCancelForm = () => {
    setActiveForm(null);
    setSelectedKPI(null);
  };

  // FIXED: Get team statistics with proper data access
  const stats = useMemo(() => {
    console.log('📈 Recalculating stats with latest data');
    
    if (!departmentSummary?.kpis) {
      return [
        { title: 'KPIs Suivis', value: '0/3', change: 0, changeText: 'actifs', icon: Target, color: 'pink' },
        { title: 'Performance Moyenne', value: '0%', change: 0, changeText: 'efficacité', icon: TrendingUp, color: 'pink' },
        { title: 'Employés Actifs', value: '0', change: 0, changeText: 'employés', icon: Users, color: 'pink' },
        { title: 'Alertes Actives', value: '0', change: 0, changeText: 'alertes', icon: AlertTriangle, color: 'gray' }
      ];
    }

    const kpisWithData = departmentSummary.kpis.filter(kpi => kpi.latestValue) || [];
    const alerts = teamAnalytics?.alerts || [];
    
    // Calculate total active employees across all KPIs
    const totalEmployees = new Set();
    kpisWithData.forEach(kpi => {
      if (kpi.latestValue && kpi.latestValue.data && kpi.latestValue.data.employees) {
        kpi.latestValue.data.employees.forEach(emp => totalEmployees.add(emp.name));
      }
    });
    
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
        title: 'Performance Moyenne',
        value: `${departmentSummary.efficiency || 0}%`,
        change: departmentSummary.efficiency || 0,
        changeText: 'efficacité',
        icon: TrendingUp,
        color: 'pink'
      },
      {
        title: 'Employés Actifs',
        value: totalEmployees.size.toString(),
        change: totalEmployees.size,
        changeText: 'employés',
        icon: Users,
        color: 'pink'
      },
      {
        title: 'Alertes Actives',
        value: alerts.length.toString(),
        change: alerts.length,
        changeText: 'alertes',
        icon: AlertTriangle,
        color: alerts.length > 0 ? 'red' : 'green'
      }
    ];
  }, [departmentSummary, teamAnalytics]);
  
  const deptName = 'Ressources Humaines & Performance d\'Équipe';

  // FIXED: Render KPI Cards with proper data access
  const renderKPICard = (kpi) => {
    const kpiSummary = departmentSummary?.kpis?.find(k => k.id === kpi.id);
    const latestValue = kpiSummary?.latestValue;
    const status = kpiSummary?.status || 'no-data';

    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
        case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
        case 'needs-attention': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
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
        case 'safety_incidents': return 'Surveillance et enregistrement des incidents de sécurité pour maintenir un environnement de travail sûr';
        case 'operator_efficiency': return 'Mesure de l\'efficacité des opérateurs à travers l\'assignation et l\'achèvement des tâches';
        default: return 'Mesures de performance de l\'équipe';
      }
    };

    const KPIIcon = getKPIIcon(kpi.id);
    const kpiName = getKPIName(kpi.id);
    const kpiDescription = getKPIDescription(kpi.id);

    // FIXED: Calculate summary metrics with proper data structure access
    const getSummaryMetrics = () => {
      if (!latestValue || !latestValue.data || !latestValue.data.employees) {
        return { primary: 'Aucune Donnée', secondary: 'Ajoutez des données pour voir les métriques', progress: 0 };
      }

      const employees = latestValue.data.employees;
      const target = latestValue.data.weeklyTarget || kpi.target;
      const mainValue = latestValue.value; // Main KPI value (number)

      switch (kpi.id) {
        case 'team_productivity_attendance':
          return {
            primary: `${mainValue}%`,
            secondary: `${employees.length} employés`,
            progress: (mainValue / target) * 100
          };
        
        case 'safety_incidents':
          return {
            primary: `${mainValue} incidents`,
            secondary: `Objectif: ≤${target}`,
            progress: target > 0 ? Math.max(0, 100 - (mainValue / target) * 100) : (mainValue === 0 ? 100 : 0)
          };
        
        case 'operator_efficiency':
          return {
            primary: `${mainValue}%`,
            secondary: `${employees.reduce((sum, emp) => sum + (emp.tasks?.length || 0), 0)} tâches`,
            progress: (mainValue / target) * 100
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
        className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          isDark ? 'bg-slate-800/60 border-slate-700/50 hover:border-blue-500/50' : 'bg-white border-slate-200/80 hover:border-blue-500/50 shadow-sm'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getKPIColor(kpi.id)} flex items-center justify-center shadow-lg`}>
            <KPIIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? 'text-blue-400' : 'text-blue-500'
            }`}>
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI Info */}
        <div className="mb-4">
          <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {kpiName}
          </h4>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {kpiDescription}
          </p>
        </div>
        
        {/* Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${
              status === 'excellent' ? 'text-emerald-600' : 
              status === 'good' ? 'text-blue-600' : 
              status === 'needs-attention' ? 'text-red-600' : 
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {metrics.primary}
            </span>
            {metrics.progress > 0 && (
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {Math.round(metrics.progress)}%
              </span>
            )}
          </div>
          
          {metrics.progress > 0 && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.progress >= 90 ? 'bg-emerald-500' : 
                  metrics.progress >= 70 ? 'bg-blue-500' : 
                  metrics.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.progress, 100)}%` }}
              />
            </div>
          )}
          
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {metrics.secondary}
          </p>
          
          {latestValue && (
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Dernière mise à jour: {new Date(latestValue.date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-8 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Forms */}
      {activeForm === 'team_productivity_attendance' && (
        <AttendanceForm
          onSave={handleSaveKPI}
          onCancel={handleCancelForm}
          existingData={selectedKPI?.latestValue?.data}
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

      {/* Enhanced Report Modals */}
      {showReports && reportType === 'weekly' && (
        <WeeklyReportModal 
          analytics={teamAnalytics}
          isDark={isDark}
          onClose={() => setShowReports(false)}
        />
      )}

      {showReports && reportType === 'monthly' && (
        <MonthlyReportModal 
          analytics={teamAnalytics}
          isDark={isDark}
          onClose={() => setShowReports(false)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {deptName}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Gestion avancée de la performance d'équipe
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => { setReportType('weekly'); setShowReports(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>Rapport Hebdomadaire</span>
          </button>
          
          <button 
            onClick={() => { setReportType('monthly'); setShowReports(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
          >
            <Calendar className="w-4 h-4" />
            <span>Rapport Mensuel</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white border-slate-200/80 shadow-sm'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              stat.color === 'pink' ? (isDark ? 'from-pink-500/10 to-rose-500/5' : 'from-pink-50 to-rose-50/50') :
              stat.color === 'red' ? (isDark ? 'from-red-500/10 to-red-500/5' : 'from-red-50 to-red-50/50') :
              stat.color === 'green' ? (isDark ? 'from-green-500/10 to-green-500/5' : 'from-green-50 to-green-50/50') :
              (isDark ? 'from-slate-500/10 to-slate-600/5' : 'from-slate-50 to-slate-100/50')
            } opacity-50`} />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  stat.color === 'pink' ? 'from-pink-600 to-rose-600' :
                  stat.color === 'red' ? 'from-red-600 to-red-700' :
                  stat.color === 'green' ? 'from-green-600 to-green-700' :
                  'from-slate-600 to-slate-700'
                } shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mb-3 ${
                  stat.color === 'pink' ? 'text-pink-600' : 
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  'text-slate-600'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {stat.change}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {stat.changeText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert System */}
      {teamAnalytics?.alerts && (
        <TeamAlertSystem 
          alerts={teamAnalytics.alerts}
          onOpenForm={handleOpenForm}
          isDark={isDark}
          className={`rounded-2xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
          }`}
        />
      )}

      {/* KPI Cards Section */}
      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Gestion de Performance d'Équipe
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Suivi avancé avec gestion des employés, assignation des tâches et surveillance de la sécurité
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Only show the 3 main team KPIs, excluding the removed one */}
          {departmentKPIs.filter(kpi => kpi.id !== 'batches_per_day').map(renderKPICard)}
        </div>
      </div>

      {/* Charts Section */}
      {teamAnalytics && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
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

      {/* Empty State */}
      {(!departmentSummary?.kpis || departmentSummary.kpis.every(kpi => !kpi.latestValue)) && (
        <div className={`text-center py-12 rounded-2xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-pink-50'} flex items-center justify-center mx-auto mb-4`}>
            <Users className="w-8 h-8 text-pink-500" />
          </div>
          <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Prêt à Commencer la Gestion d'Équipe
          </h4>
          <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Cliquez sur n'importe quelle carte KPI ci-dessus pour commencer le suivi de présence, des incidents de sécurité ou de l'efficacité des opérateurs
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={() => handleOpenForm('team_productivity_attendance')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Suivre la Présence
            </button>
            <button 
              onClick={() => handleOpenForm('safety_incidents')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Signaler un Incident
            </button>
            <button 
              onClick={() => handleOpenForm('operator_efficiency')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Gérer les Tâches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};