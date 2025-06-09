import React, { useContext, useMemo } from 'react';
import {
  Target,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Users,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Factory,
  FlaskConical,
  Package,
  ShieldCheck,
  CheckCircle,
  Clock,
  Gauge,
  Award,
  TrendingDown,
  Plus
} from 'lucide-react';
import { useKPIData } from '../hook/useKPIData';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';

// Enhanced Stat Card Component
const StatCard = ({ stat, isDark, onClick }) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer ${
      isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200 shadow-sm'
    } border`}
  >
    <div className="flex items-start justify-between mb-6">
      <div className={`p-3 rounded-xl`} style={{ backgroundColor: stat.bgColor }}>
        <stat.icon className="w-5 h-5 text-white" />
      </div>
      <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'} group-hover:translate-x-1 transition-transform`} />
    </div>

    <div>
      <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {stat.name}
      </p>
      <p className={`text-3xl font-bold mb-3`} style={{ color: stat.textColor }}>
        {stat.value}
      </p>
      <div className="flex items-center space-x-2">
        {stat.trend === 'up' ? (
          <ArrowUp className="w-4 h-4 text-emerald-500" />
        ) : stat.trend === 'down' ? (
          <ArrowDown className="w-4 h-4 text-red-500" />
        ) : null}
        <span className={`text-sm font-medium ${
          stat.trend === 'up' ? 'text-emerald-600' :
          stat.trend === 'down' ? 'text-red-600' :
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {stat.change}
        </span>
        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {stat.subtitle}
        </span>
      </div>
    </div>
  </div>
);

// Department Quick View Card
const DepartmentQuickView = ({ dept, isDark, onNavigate }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'excellent':
        return { color: 'text-emerald-600', bgColor: 'bg-emerald-500', text: 'Excellent' };
      case 'good':
        return { color: 'text-blue-600', bgColor: 'bg-blue-500', text: 'Bon' };
      case 'needs-attention':
        return { color: 'text-amber-600', bgColor: 'bg-amber-500', text: 'Nécessite Attention' };
      default:
        return { color: 'text-slate-500', bgColor: 'bg-slate-400', text: 'Pas de Données' };
    }
  };

  const statusConfig = getStatusConfig(dept.status);

  return (
    <div
      onClick={() => onNavigate(dept.id)}
      className={`group relative rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer ${
        isDark
          ? 'bg-slate-700/50 border-slate-600'
          : 'bg-slate-50 border-slate-200'
      } border`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: dept.color }}>
            <dept.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {dept.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${statusConfig.bgColor}`} />
              <span className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`} />
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            KPIs Suivis
          </span>
          <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {dept.kpisWithData}/{dept.totalKpis}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Efficacité
          </span>
          <span className={`text-sm font-bold ${statusConfig.color}`}>
            {dept.efficiency}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-2">
          <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ease-out`}
              style={{ 
                width: `${Math.min(dept.efficiency, 100)}%`,
                backgroundColor: dept.color
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Card Component
const AnalyticsCard = ({ title, children, isDark, icon: Icon, action, onActionClick }) => (
  <div className={`rounded-2xl border p-8 transition-all duration-200 hover:shadow-lg ${
    isDark
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200'
  }`}>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
        )}
        <h3 className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {title}
        </h3>
      </div>
      {action && (
        <button
          onClick={onActionClick}
          className={`text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center space-x-1`}
        >
          <span>{action}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
    {children}
  </div>
);

// Enhanced Recent Activity Card
const RecentActivityCard = ({ activity, isDark }) => {
  const getActivityConfig = (type) => {
    switch (type) {
      case 'kpi_added':
        return {
          icon: Plus,
          bgColor: isDark ? 'bg-blue-900/30' : 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: isDark ? 'border-blue-500/30' : 'border-blue-200'
        };
      case 'target_achieved':
        return {
          icon: CheckCircle,
          bgColor: isDark ? 'bg-emerald-900/30' : 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          borderColor: isDark ? 'border-emerald-500/30' : 'border-emerald-200'
        };
      case 'performance_improved':
        return {
          icon: TrendingUp,
          bgColor: isDark ? 'bg-green-900/30' : 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: isDark ? 'border-green-500/30' : 'border-green-200'
        };
      case 'alert_generated':
        return {
          icon: AlertTriangle,
          bgColor: isDark ? 'bg-amber-900/30' : 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: isDark ? 'border-amber-500/30' : 'border-amber-200'
        };
      case 'data_quality':
        return {
          icon: ShieldCheck,
          bgColor: isDark ? 'bg-purple-900/30' : 'bg-purple-100',
          iconColor: 'text-purple-600',
          borderColor: isDark ? 'border-purple-500/30' : 'border-purple-200'
        };
      default:
        return {
          icon: Activity,
          bgColor: isDark ? 'bg-slate-700/50' : 'bg-slate-100',
          iconColor: isDark ? 'text-slate-400' : 'text-slate-600',
          borderColor: isDark ? 'border-slate-600' : 'border-slate-200'
        };
    }
  };

  const config = getActivityConfig(activity.type);
  const ActivityIcon = config.icon;

  return (
    <div className={`relative p-4 rounded-xl border ${config.borderColor} ${config.bgColor} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-4">
        <div className={`w-10 h-10 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
          <ActivityIcon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {activity.title}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {activity.description}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <Clock className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {activity.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Top KPI Performance Card
const TopKPICard = ({ kpi, dept, isDark, rank }) => {
  const getPerformanceColor = (efficiency) => {
    if (efficiency >= 95) return 'text-emerald-600';
    if (efficiency >= 85) return 'text-blue-600';
    if (efficiency >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return isDark ? '#64748B' : '#94A3B8';
    }
  };

  const getKPIValue = (kpi) => {
    if (!kpi.latestValue || !kpi.latestValue.value) return null;
    if (typeof kpi.latestValue.value === 'number') {
      return kpi.latestValue.value;
    }
    const value = kpi.latestValue.value;
    if (typeof value === 'object') {
      if (value.employees && Array.isArray(value.employees)) {
        if (kpi.id === 'team_productivity_attendance' || kpi.id.includes('attendance')) {
          const avgProductivity = value.employees.length > 0
            ? Math.round(value.employees.reduce((sum, emp) => sum + (emp.productivity || 0), 0) / value.employees.length)
            : 0;
          return avgProductivity;
        } else if (kpi.id === 'safety_incidents' || kpi.id.includes('safety')) {
          const totalIncidents = value.employees.reduce((sum, emp) => sum + (emp.incidentCount || 0), 0);
          return totalIncidents;
        } else if (kpi.id === 'operator_efficiency' || kpi.id.includes('efficiency')) {
          const avgEfficiency = value.employees.length > 0
            ? Math.round(value.employees.reduce((sum, emp) => sum + (emp.efficiency || 0), 0) / value.employees.length)
            : 0;
          return avgEfficiency;
        }
      }
      if (value.averageValue !== undefined) return value.averageValue;
      if (value.total !== undefined) return value.total;
      if (value.count !== undefined) return value.count;
      if (value.weeklyTarget !== undefined) return value.weeklyTarget;
      return null;
    }
    return null;
  };

  const kpiValue = getKPIValue(kpi);
  const performancePercentage = kpiValue !== null && kpi.target
    ? Math.min(100, (kpiValue / kpi.target) * 100)
    : 0;

  const formatKPIValue = () => {
    if (kpiValue === null) return '--';
    if (kpi.id.includes('productivity') || kpi.id.includes('efficiency') || kpi.unit === '%') {
      return `${kpiValue}%`;
    }
    return kpiValue.toString();
  };

  return (
    <div className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-lg ${
      isDark
        ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
        : 'bg-slate-50 border-slate-200 hover:shadow-xl'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: dept.color }}>
              <dept.icon className="w-5 h-5 text-white" />
            </div>
            <div 
              className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg`}
              style={{ backgroundColor: getRankBadgeColor(rank) }}
            >
              <span className="text-xs font-bold text-white">#{rank}</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {typeof kpi.name === 'object' ? kpi.name.en : kpi.name}
            </h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {dept.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${getPerformanceColor(performancePercentage)}`}>
            {performancePercentage.toFixed(0)}%
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Performance
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Valeur: {formatKPIValue()}
          </span>
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Cible: {kpi.target}
          </span>
        </div>
        <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
          <div
            className={`h-2.5 rounded-full transition-all duration-700`}
            style={{ 
              width: `${Math.min(performancePercentage, 100)}%`,
              backgroundColor: dept.color
            }}
          />
        </div>
      </div>

      {kpi.latestValue?.notes && (
        <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-slate-600/30' : 'bg-slate-100'}`}>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {kpi.latestValue.notes}
          </p>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
export const DashboardPage = () => {
  const { isDark } = useContext(AppContext);

  const {
    kpiData,
    getDepartmentSummary,
  } = useKPIData();

  const dashboardData = useMemo(() => {
    const departments = [
      { id: 'rnd', name: 'Laboratoire R&D', icon: FlaskConical, color: '#6366F1' },
      { id: 'team', name: "Performance de l'Équipe", icon: Users, color: '#EC4899' },
      { id: 'warehouses', name: 'Entrepôts & Logistique', icon: Package, color: '#8B5CF6' },
      { id: 'quality', name: 'Contrôle Qualité', icon: ShieldCheck, color: '#059669' },
      { id: 'production', name: 'Production & Mélange', icon: Factory, color: '#DC2626' }
    ];

    let totalKPIs = 0;
    let kpisWithData = 0;
    let totalEfficiency = 0;
    let excellentKPIs = 0;
    let needsAttentionKPIs = 0;
    let activeDepartments = 0;

    const departmentsSummary = departments.map(dept => {
      const summary = getDepartmentSummary(dept.id);
      const kpisWithDataCount = summary?.kpis?.filter(kpi => kpi.latestValue).length || 0;
      const efficiency = summary?.efficiency || 0;

      totalKPIs += summary?.kpis?.length || 0;
      kpisWithData += kpisWithDataCount;

      if (kpisWithDataCount > 0) {
        activeDepartments++;
        totalEfficiency += efficiency;
      }

      const excellent = summary?.kpis?.filter(kpi => kpi.status === 'excellent').length || 0;
      const needsAttention = summary?.kpis?.filter(kpi => kpi.status === 'needs-attention').length || 0;

      excellentKPIs += excellent;
      needsAttentionKPIs += needsAttention;

      return {
        ...dept,
        kpisWithData: kpisWithDataCount,
        totalKpis: summary?.kpis?.length || 0,
        efficiency,
        status: efficiency >= 90 ? 'excellent' : efficiency >= 70 ? 'good' : efficiency > 0 ? 'needs-attention' : 'no-data',
        summary
      };
    });

    const overallEfficiency = activeDepartments > 0 ? Math.round(totalEfficiency / activeDepartments) : 0;
    const dataCompleteness = totalKPIs > 0 ? Math.round((kpisWithData / totalKPIs) * 100) : 0;

    return {
      totalKPIs,
      kpisWithData,
      departments: departmentsSummary,
      overallEfficiency,
      dataCompleteness,
      needsAttentionKPIs,
      excellentKPIs,
      activeDepartments
    };
  }, [getDepartmentSummary, kpiData]);

  const topPerformingKPIs = useMemo(() => {
    const allKPIsWithPerformance = [];
    dashboardData.departments.forEach(dept => {
      if (dept.summary?.kpis) {
        dept.summary.kpis.forEach(kpi => {
          if (kpi.latestValue && kpi.target) {
            allKPIsWithPerformance.push({
              ...kpi,
              department: dept
            });
          }
        });
      }
    });

    const extractKPIValue = (kpi) => {
      if (!kpi.latestValue || !kpi.latestValue.value) return 0;
      if (typeof kpi.latestValue.value === 'number') {
        return (kpi.latestValue.value / kpi.target) * 100;
      }
      const value = kpi.latestValue.value;
      if (typeof value === 'object') {
        if (value.employees && Array.isArray(value.employees)) {
          if (kpi.id === 'team_productivity_attendance' || kpi.id.includes('attendance')) {
            const avgProductivity = value.employees.length > 0
              ? Math.round(value.employees.reduce((sum, emp) => sum + (emp.productivity || 0), 0) / value.employees.length)
              : 0;
            return (avgProductivity / kpi.target) * 100;
          } else if (kpi.id === 'safety_incidents' || kpi.id.includes('safety')) {
            const totalIncidents = value.employees.reduce((sum, emp) => sum + (emp.incidentCount || 0), 0);
            return kpi.target > 0 ? Math.max(0, 100 - (totalIncidents / kpi.target) * 100) : (totalIncidents === 0 ? 100 : 0);
          } else if (kpi.id === 'operator_efficiency' || kpi.id.includes('efficiency')) {
            const avgEfficiency = value.employees.length > 0
              ? Math.round(value.employees.reduce((sum, emp) => sum + (emp.efficiency || 0), 0) / value.employees.length)
              : 0;
            return (avgEfficiency / kpi.target) * 100;
          }
        }
        if (value.averageValue !== undefined) return (value.averageValue / kpi.target) * 100;
        if (value.total !== undefined) return (value.total / kpi.target) * 100;
        if (value.count !== undefined) return (value.count / kpi.target) * 100;
        return 0;
      }
      return 0;
    };

    return allKPIsWithPerformance
      .map(kpi => ({
        ...kpi,
        performancePercentage: extractKPIValue(kpi)
      }))
      .sort((a, b) => b.performancePercentage - a.performancePercentage)
      .slice(0, 6);
  }, [dashboardData]);

  const recentActivities = useMemo(() => {
    const activities = [];
    dashboardData.departments.forEach(dept => {
      if (dept.summary?.kpis) {
        dept.summary.kpis.forEach(kpi => {
          if (kpi.latestValue) {
            if (kpi.status === 'excellent') {
              activities.push({
                type: 'target_achieved',
                title: 'Cible atteinte',
                description: `${typeof kpi.name === 'object' ? kpi.name.en : kpi.name} dans ${dept.name}`,
                time: new Date(kpi.latestValue.date).toLocaleTimeString()
              });
            } else {
              activities.push({
                type: 'kpi_added',
                title: 'Données KPI ajoutées',
                description: `${typeof kpi.name === 'object' ? kpi.name.en : kpi.name} dans ${dept.name}`,
                time: new Date(kpi.latestValue.date).toLocaleTimeString()
              });
            }
          }
        });
      }
    });

    if (dashboardData.overallEfficiency > 80) {
      activities.push({
        type: 'performance_improved',
        title: 'Performance améliorée',
        description: "L'efficacité globale du système s'est améliorée",
        time: new Date().toLocaleTimeString()
      });
    }

    return activities.slice(0, 5);
  }, [dashboardData]);

  const chartData = useMemo(() => {
    const departmentEfficiency = dashboardData.departments
      .filter(d => d.kpisWithData > 0)
      .map(d => ({
        name: d.name,
        efficiency: d.efficiency,
        kpis: d.kpisWithData
      }));

    const kpiDistribution = dashboardData.departments.map(d => ({
      name: d.name,
      value: d.kpisWithData
    })).filter(d => d.value > 0);

    return { departmentEfficiency, kpiDistribution };
  }, [dashboardData]);

  const getQuickStats = () => [
    {
      name: 'KPIs Totaux',
      value: dashboardData.totalKPIs.toString(),
      change: `${dashboardData.kpisWithData}`,
      trend: dashboardData.kpisWithData > 0 ? 'up' : 'neutral',
      icon: Target,
      subtitle: 'avec données',
      bgColor: '#6366F1',
      textColor: '#6366F1'
    },
    {
      name: 'Départements Actifs',
      value: dashboardData.activeDepartments.toString(),
      change: `${dashboardData.departments.length}`,
      trend: dashboardData.activeDepartments > 0 ? 'up' : 'neutral',
      icon: Users,
      subtitle: 'total',
      bgColor: '#10B981',
      textColor: '#10B981'
    },
    {
      name: 'Efficacité Globale',
      value: `${dashboardData.overallEfficiency}%`,
      change: `${dashboardData.dataCompleteness}%`,
      trend: dashboardData.overallEfficiency > 80 ? 'up' : dashboardData.overallEfficiency > 50 ? 'neutral' : 'down',
      icon: TrendingUp,
      subtitle: 'complétude',
      bgColor: '#8B5CF6',
      textColor: '#8B5CF6'
    },
    {
      name: 'Score de Qualité',
      value: dashboardData.excellentKPIs.toString(),
      change: dashboardData.needsAttentionKPIs.toString(),
      trend: dashboardData.needsAttentionKPIs === 0 ? 'up' : 'down',
      icon: CheckCircle,
      subtitle: 'nécessitent attention',
      bgColor: '#059669',
      textColor: '#059669'
    }
  ];

  const quickStats = getQuickStats();

  const handleNavigateToDepartment = (deptId) => {
    window.location.href = `/${deptId}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Tableau de Bord
              </h1>
              <p className={`text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              isDark={isDark}
              onClick={() => {}}
            />
          ))}
        </div>

        {/* Departments Overview */}
        <AnalyticsCard
          title="Aperçu des Départements"
          isDark={isDark}
          icon={Users}
          action="Voir Tout"
          onActionClick={() => {}}
        >
          {dashboardData.activeDepartments > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {dashboardData.departments
                .filter(d => d.kpisWithData > 0)
                .map((dept) => (
                  <DepartmentQuickView
                    key={dept.id}
                    dept={dept}
                    isDark={isDark}
                    onNavigate={handleNavigateToDepartment}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className={`w-20 h-20 rounded-2xl ${
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              } flex items-center justify-center mx-auto mb-6`}>
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Aucun Département Actif
              </h4>
              <p className={`text-base mb-8 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Accédez aux pages des départements pour ajouter des données KPI et voir les métriques de performance.
              </p>
            </div>
          )}
        </AnalyticsCard>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartDisplay
            data={chartData.departmentEfficiency}
            title="Efficacité des Départements"
            height={300}
            dataKey="efficiency"
            xAxisKey="name"
            color="#6366F1"
            className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          />
          <ChartDisplay
            data={chartData.kpiDistribution}
            title="Distribution des KPIs"
            type="bar"
            height={300}
            dataKey="value"
            xAxisKey="name"
            color="#10B981"
            className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          />
        </div>

        {/* Performance & Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <AnalyticsCard
            title="KPIs les Plus Performants"
            isDark={isDark}
            icon={Award}
          >
            {topPerformingKPIs.length > 0 ? (
              <div className="space-y-4">
                {topPerformingKPIs.map((kpi, index) => (
                  <TopKPICard
                    key={`${kpi.department.id}-${kpi.id}`}
                    kpi={kpi}
                    dept={kpi.department}
                    isDark={isDark}
                    rank={index + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aucune donnée de performance KPI pour le moment.
                </p>
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Mises à Jour Récentes"
            isDark={isDark}
            icon={Activity}
            action="Voir Tout"
          >
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <RecentActivityCard
                    key={index}
                    activity={activity}
                    isDark={isDark}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aucune activité récente pour le moment.
                </p>
              </div>
            )}
          </AnalyticsCard>
        </div>

        {/* All Departments Section */}
        <AnalyticsCard
          title="Tous les Départements"
          isDark={isDark}
          icon={Factory}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboardData.departments.map((dept) => (
              <DepartmentQuickView
                key={dept.id}
                dept={dept}
                isDark={isDark}
                onNavigate={handleNavigateToDepartment}
              />
            ))}
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
};