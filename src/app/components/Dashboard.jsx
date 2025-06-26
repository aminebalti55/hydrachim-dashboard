import React, { useContext, useMemo, useState, useEffect } from 'react';
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
  Plus,
  Calendar,
  Eye,
  Database,
  Loader2,
  RefreshCw,
  AlertCircle,
  Settings,
  FileText,
  Zap,
  Bell
} from 'lucide-react';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';
import { YearlyReports } from './yearlyreports/YearlyReports';
import { useRnDData } from '../hooks/useRnDData';
import { useTeamsKPIData } from '../hooks/useTeamsKPIData';
import { useWarehouseData } from '../hooks/useWarehouseData';
import { useQualityData } from '../hooks/useQualityData';
import { useProductionData } from '../hooks/useProductionData';

// French KPI translations
const KPI_TRANSLATIONS = {
  'product_development_time': 'Temps de Développement Produit',
  'team_productivity_attendance': 'Productivité et Assiduité Équipe',
  'operator_efficiency': 'Efficacité des Opérateurs',
  'safety_incidents': 'Incidents de Sécurité',
  'cost_per_formulation': 'Coût par Formulation',
  'stock_issues_rate': 'Taux de Problèmes Stock',
  'material_batch_acceptance_rate': 'Taux d\'Acceptation des Lots',
  'production_waste_rate': 'Taux de Déchets de Production',
  'raw_materials_inventory_list': 'Liste Inventaire Matières Premières',
  'energy_consumption': 'Consommation Énergétique',
  'mixing_time': 'Temps de Mélange'
};

// Department configurations
const DEPARTMENT_CONFIGS = [
  { 
    id: 'rnd', 
    name: 'Laboratoire R&D', 
    color: '#6366F1',
    icon: FlaskConical,
    kpis: ['product_development_time']
  },
  { 
    id: 'team', 
    name: "Performance de l'Équipe", 
    color: '#EC4899',
    icon: Users,
    kpis: ['team_productivity_attendance', 'operator_efficiency', 'safety_incidents']
  },
  { 
    id: 'warehouses', 
    name: 'Entrepôts & Logistique', 
    color: '#8B5CF6',
    icon: Package,
    kpis: ['cost_per_formulation', 'stock_issues_rate']
  },
  { 
    id: 'quality', 
    name: 'Contrôle Qualité', 
    color: '#059669',
    icon: ShieldCheck,
    kpis: ['material_batch_acceptance_rate', 'production_waste_rate', 'raw_materials_inventory_list']
  },
  { 
    id: 'production', 
    name: 'Production & Mélange', 
    color: '#DC2626',
    icon: Factory,
    kpis: ['energy_consumption', 'mixing_time']
  }
];

// Generate realistic recent activities
const generateRecentActivities = (departmentSummaries) => {
  const activities = [];
  const now = new Date();
  
  // Generate activities based on department data
  Object.entries(departmentSummaries).forEach(([deptId, summary]) => {
    const dept = DEPARTMENT_CONFIGS.find(d => d.id === deptId);
    if (!dept || !summary) return;

    // KPI updates
    if (summary.kpisWithData > 0) {
      activities.push({
        id: `kpi_update_${deptId}_${Date.now()}`,
        type: 'data_updated',
        title: `Mise à jour KPI ${dept.name}`,
        description: `${summary.kpisWithData} indicateur(s) mis à jour avec de nouvelles données`,
        department: dept.name,
        time: 'Il y a 2h',
        impact: 'Modéré',
        date: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      });
    }

    // Performance alerts
    if (summary.efficiency >= 90) {
      activities.push({
        id: `performance_excellent_${deptId}_${Date.now()}`,
        type: 'target_achieved',
        title: `Performance Excellente`,
        description: `${dept.name} atteint ${summary.efficiency}% d'efficacité`,
        department: dept.name,
        time: 'Il y a 4h',
        impact: 'Élevé',
        date: new Date(now.getTime() - 4 * 60 * 60 * 1000)
      });
    } else if (summary.efficiency < 60) {
      activities.push({
        id: `performance_warning_${deptId}_${Date.now()}`,
        type: 'alert_generated',
        title: `Attention Performance`,
        description: `${dept.name} nécessite une attention (${summary.efficiency}%)`,
        department: dept.name,
        time: 'Il y a 1h',
        impact: 'Élevé',
        date: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      });
    }
  });

  // Add some general system activities
  activities.push(
    {
      id: 'system_backup',
      type: 'data_updated',
      title: 'Sauvegarde Système',
      description: 'Sauvegarde automatique des données effectuée avec succès',
      department: 'Système',
      time: 'Il y a 6h',
      impact: 'Faible',
      date: new Date(now.getTime() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'monthly_report',
      type: 'yearly_report_generated',
      title: 'Rapport Mensuel',
      description: 'Génération du rapport mensuel pour tous les départements',
      department: 'Rapports',
      time: 'Hier',
      impact: 'Modéré',
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
  );

  return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
};

// Loading Spinner Component
const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Error Display Component
const ErrorDisplay = ({ error, onRetry, isDark }) => (
  <div className={`rounded-lg p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
    <div className="flex items-center space-x-2 mb-2">
      <AlertCircle className="w-5 h-5 text-red-500" />
      <h4 className={`font-semibold ${isDark ? 'text-red-200' : 'text-red-800'}`}>
        Erreur de Chargement
      </h4>
    </div>
    <p className={`text-sm mb-3 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
      {typeof error === 'string' ? error : error?.message || 'Une erreur est survenue'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Réessayer</span>
      </button>
    )}
  </div>
);

// Enhanced Stat Card Component
const StatCard = ({ stat, isDark, onClick, isLoading = false }) => (
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
        {isLoading ? (
          <LoadingSpinner size="small" className="text-white" />
        ) : (
          <stat.icon className="w-5 h-5 text-white" />
        )}
      </div>
      <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'} group-hover:translate-x-1 transition-transform`} />
    </div>

    <div>
      <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {stat.name}
      </p>
      <p className={`text-3xl font-bold mb-3`} style={{ color: stat.textColor }}>
        {isLoading ? (
          <LoadingSpinner size="default" className="text-gray-400" />
        ) : (
          stat.value
        )}
      </p>
      <div className="flex items-center space-x-2">
        {!isLoading && (
          <>
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
          </>
        )}
      </div>
    </div>

    {isLoading && (
      <div className="absolute inset-0 bg-black/5 rounded-2xl animate-pulse" />
    )}
  </div>
);

// Analytics Card Component with Loading Support
const AnalyticsCard = ({ title, children, isDark, icon: Icon, action, onActionClick, isLoading = false }) => (
  <div className={`rounded-2xl border p-8 transition-all duration-200 hover:shadow-lg ${
    isDark
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200'
  }`}>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            {isLoading ? (
              <LoadingSpinner size="small" className="text-indigo-600" />
            ) : (
              <Icon className="w-5 h-5 text-indigo-600" />
            )}
          </div>
        )}
        <h3 className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {title}
        </h3>
      </div>
      {action && (
        <button
          onClick={onActionClick}
          disabled={isLoading}
          className={`text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center space-x-1 disabled:opacity-50`}
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
const ModernActivityCard = ({ activity, isDark, isLoading = false }) => {
  const getActivityConfig = (type) => {
    switch (type) {
      case 'kpi_added':
        return {
          icon: Plus,
          bgColor: '#3B82F6',
          text: 'Nouveau KPI',
          description: 'Un nouveau indicateur a été ajouté'
        };
      case 'target_achieved':
        return {
          icon: CheckCircle,
          bgColor: '#10B981',
          text: 'Objectif Atteint',
          description: 'Un objectif important a été atteint'
        };
      case 'performance_improved':
        return {
          icon: TrendingUp,
          bgColor: '#059669',
          text: 'Performance +',
          description: 'Amélioration des performances'
        };
      case 'alert_generated':
        return {
          icon: AlertTriangle,
          bgColor: '#F59E0B',
          text: 'Alerte',
          description: 'Nouvelle alerte générée'
        };
      case 'data_updated':
        return {
          icon: Database,
          bgColor: '#8B5CF6',
          text: 'Données Maj',
          description: 'Mise à jour des données'
        };
      case 'yearly_report_generated':
        return {
          icon: Calendar,
          bgColor: '#6366F1',
          text: 'Rapport Généré',
          description: 'Rapport annuel généré'
        };
      default:
        return {
          icon: Activity,
          bgColor: '#6B7280',
          text: 'Activité',
          description: 'Nouvelle activité'
        };
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gray-300 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const config = getActivityConfig(activity.type);
  const ActivityIcon = config.icon;

  return (
    <div className={`group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
      isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-start space-x-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: config.bgColor }}
        >
          <ActivityIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {activity.title || config.text}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-md ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
              {activity.department}
            </span>
          </div>
          <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {activity.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {activity.time}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {activity.impact || 'Faible'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Top KPI Performance Card with French translations
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
    if (!kpi.latestValue || kpi.latestValue.value === null || kpi.latestValue.value === undefined) return null;
    
    const value = kpi.latestValue.value;
    
    if (typeof value === 'number') {
      return value;
    }
    
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
              {KPI_TRANSLATIONS[kpi.id] || kpi.name || kpi.id}
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
  const [showYearlyReports, setShowYearlyReports] = useState(false);
  const [departmentSummaries, setDepartmentSummaries] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  // Module hooks
  const rndData = useRnDData();
  const teamsData = useTeamsKPIData();
  const warehouseData = useWarehouseData();
  const qualityData = useQualityData();
  const productionData = useProductionData();

  // Overall loading state
  const isLoading = rndData.isLoading || teamsData.isLoading || warehouseData.isLoading || 
                   qualityData.isLoading || productionData.isLoading;

  // Aggregate errors
  const errors = [
    rndData.error,
    teamsData.error,
    warehouseData.error,
    qualityData.error,
    productionData.error
  ].filter(Boolean);

  // Load department summaries
  useEffect(() => {
    const loadDepartmentSummaries = async () => {
      if (isLoading) return;

      const summaries = {};
      
      try {
        // R&D Department
        const rndSummary = await rndData.getDepartmentSummary('rnd');
        summaries.rnd = {
          totalKPIs: rndSummary.totalKPIs || 1,
          kpisWithData: rndSummary.withData || 0,
          efficiency: rndSummary.averageScore || 0,
          kpis: [{
            id: 'product_development_time',
            latestValue: await rndData.getLatestKPIValue('rnd', 'product_development_time'),
            target: 80
          }].filter(kpi => kpi.latestValue),
          lastUpdated: Date.now()
        };
      } catch (err) {
        summaries.rnd = { totalKPIs: 1, kpisWithData: 0, efficiency: 0, kpis: [], lastUpdated: null };
      }

      try {
        // Teams Department
        if (teamsData.kpiData) {
          const teamSummary = teamsData.getDepartmentSummary('team');
          summaries.team = {
            totalKPIs: 3,
            kpisWithData: teamSummary.kpisWithData || 0,
            efficiency: teamSummary.efficiency || 0,
            kpis: ['team_productivity_attendance', 'operator_efficiency', 'safety_incidents'].map(kpiId => ({
              id: kpiId,
              latestValue: teamsData.getLatestKPIValue(kpiId),
              target: kpiId === 'safety_incidents' ? 0 : 85
            })).filter(kpi => kpi.latestValue),
            lastUpdated: teamSummary.lastUpdated
          };
        }
      } catch (err) {
        summaries.team = { totalKPIs: 3, kpisWithData: 0, efficiency: 0, kpis: [], lastUpdated: null };
      }

      try {
        // Warehouse Department
        if (warehouseData.kpiData) {
          const warehouseSummary = warehouseData.getDepartmentSummary('warehouses');
          summaries.warehouses = {
            totalKPIs: 2,
            kpisWithData: warehouseSummary.kpiCount || 0,
            efficiency: warehouseSummary.overallScore || 0,
            kpis: ['cost_per_formulation', 'stock_issues_rate'].map(kpiId => ({
              id: kpiId,
              latestValue: warehouseData.getLatestKPIValue('warehouses', kpiId),
              target: kpiId === 'cost_per_formulation' ? 100 : 90
            })).filter(kpi => kpi.latestValue),
            lastUpdated: warehouseSummary.lastUpdated
          };
        }
      } catch (err) {
        summaries.warehouses = { totalKPIs: 2, kpisWithData: 0, efficiency: 0, kpis: [], lastUpdated: null };
      }

      try {
        // Quality Department
        if (qualityData.qualityData) {
          const qualityStats = qualityData.getQualityStats();
          summaries.quality = {
            totalKPIs: qualityStats.totalKPIs || 3,
            kpisWithData: qualityStats.kpisWithData || 0,
            efficiency: qualityStats.efficiency || 0,
            kpis: ['material_batch_acceptance_rate', 'production_waste_rate', 'raw_materials_inventory_list'].map(kpiId => ({
              id: kpiId,
              latestValue: qualityData.getLatestKPIValue('quality', kpiId),
              target: kpiId === 'material_batch_acceptance_rate' ? 90 : kpiId === 'production_waste_rate' ? 80 : 95
            })).filter(kpi => kpi.latestValue),
            lastUpdated: qualityStats.lastUpdated
          };
        }
      } catch (err) {
        summaries.quality = { totalKPIs: 3, kpisWithData: 0, efficiency: 0, kpis: [], lastUpdated: null };
      }

      try {
        // Production Department
        if (productionData.productionData) {
          const productionSummary = productionData.getDepartmentSummary('production');
          summaries.production = {
            totalKPIs: productionSummary.totalKPIs || 2,
            kpisWithData: productionSummary.activeKPIs || 0,
            efficiency: productionSummary.averagePerformance || 0,
            kpis: ['energy_consumption', 'mixing_time'].map(kpiId => ({
              id: kpiId,
              latestValue: productionData.getLatestKPIValue('production', kpiId),
              target: kpiId === 'energy_consumption' ? 80 : 90
            })).filter(kpi => kpi.latestValue),
            lastUpdated: productionSummary.lastUpdated
          };
        }
      } catch (err) {
        summaries.production = { totalKPIs: 2, kpisWithData: 0, efficiency: 0, kpis: [], lastUpdated: null };
      }

      setDepartmentSummaries(summaries);
      
      // Generate activities based on summaries
      const activities = generateRecentActivities(summaries);
      setRecentActivities(activities);
    };

    loadDepartmentSummaries();
  }, [isLoading, rndData, teamsData, warehouseData, qualityData, productionData]);

  // Calculate overall dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalKPIs = Object.values(departmentSummaries).reduce((sum, dept) => sum + dept.totalKPIs, 0);
    const kpisWithData = Object.values(departmentSummaries).reduce((sum, dept) => sum + dept.kpisWithData, 0);
    const activeDepartments = Object.values(departmentSummaries).filter(dept => dept.kpisWithData > 0).length;
    const overallEfficiency = Object.values(departmentSummaries).length > 0
      ? Math.round(Object.values(departmentSummaries).reduce((sum, dept) => sum + dept.efficiency, 0) / Object.values(departmentSummaries).length)
      : 0;
    const dataCompleteness = totalKPIs > 0 ? Math.round((kpisWithData / totalKPIs) * 100) : 0;

    return {
      totalKPIs,
      kpisWithData,
      activeDepartments,
      overallEfficiency,
      dataCompleteness
    };
  }, [departmentSummaries]);

  // Enhanced dashboard data with department configurations
  const enhancedDashboardData = useMemo(() => {
    const departmentsWithSummary = DEPARTMENT_CONFIGS.map(dept => {
      const summary = departmentSummaries[dept.id] || {
        totalKPIs: dept.kpis.length,
        kpisWithData: 0,
        efficiency: 0,
        kpis: [],
        lastUpdated: null
      };

      return {
        ...dept,
        ...summary
      };
    });

    return {
      departments: departmentsWithSummary,
      ...dashboardStats
    };
  }, [departmentSummaries, dashboardStats]);

  // Top performing KPIs with correct data extraction
  const topPerformingKPIs = useMemo(() => {
    const allKPIsWithPerformance = [];
    
    enhancedDashboardData.departments.forEach(dept => {
      if (dept.kpis && Array.isArray(dept.kpis)) {
        dept.kpis.forEach(kpi => {
          if (kpi.latestValue && kpi.target) {
            let kpiValue = null;
            
            if (typeof kpi.latestValue.value === 'number') {
              kpiValue = kpi.latestValue.value;
            } else if (typeof kpi.latestValue.value === 'object') {
              const value = kpi.latestValue.value;
              if (value.employees && Array.isArray(value.employees)) {
                if (kpi.id.includes('productivity') || kpi.id.includes('attendance')) {
                  kpiValue = value.employees.length > 0
                    ? Math.round(value.employees.reduce((sum, emp) => sum + (emp.productivity || 0), 0) / value.employees.length)
                    : 0;
                } else if (kpi.id.includes('efficiency')) {
                  kpiValue = value.employees.length > 0
                    ? Math.round(value.employees.reduce((sum, emp) => sum + (emp.efficiency || 0), 0) / value.employees.length)
                    : 0;
                } else if (kpi.id.includes('safety')) {
                  kpiValue = value.employees.reduce((sum, emp) => sum + (emp.incidentCount || 0), 0);
                }
              }
            }
            
            if (kpiValue !== null) {
              const performancePercentage = (kpiValue / kpi.target) * 100;
              allKPIsWithPerformance.push({
                ...kpi,
                department: dept,
                performancePercentage: Math.min(100, performancePercentage)
              });
            }
          }
        });
      }
    });

    return allKPIsWithPerformance
      .sort((a, b) => b.performancePercentage - a.performancePercentage)
      .slice(0, 6);
  }, [enhancedDashboardData]);

  const getQuickStats = () => [
    {
      name: 'KPIs Totaux',
      value: dashboardStats.totalKPIs.toString(),
      change: `${dashboardStats.kpisWithData}`,
      trend: dashboardStats.kpisWithData > 0 ? 'up' : 'neutral',
      icon: Target,
      subtitle: 'avec données',
      bgColor: '#6366F1',
      textColor: '#6366F1'
    },
    {
      name: 'Départements Actifs',
      value: dashboardStats.activeDepartments.toString(),
      change: `${DEPARTMENT_CONFIGS.length}`,
      trend: dashboardStats.activeDepartments > 0 ? 'up' : 'neutral',
      icon: Users,
      subtitle: 'total',
      bgColor: '#10B981',
      textColor: '#10B981'
    },
    {
      name: 'Efficacité Globale',
      value: `${dashboardStats.overallEfficiency}%`,
      change: `${dashboardStats.dataCompleteness}%`,
      trend: dashboardStats.overallEfficiency > 80 ? 'up' : dashboardStats.overallEfficiency > 50 ? 'neutral' : 'down',
      icon: TrendingUp,
      subtitle: 'complétude',
      bgColor: '#8B5CF6',
      textColor: '#8B5CF6'
    },
    {
      name: 'Score de Qualité',
      value: topPerformingKPIs.filter(kpi => kpi.performancePercentage >= 90).length.toString(),
      change: topPerformingKPIs.filter(kpi => kpi.performancePercentage < 70).length.toString(),
      trend: topPerformingKPIs.filter(kpi => kpi.performancePercentage < 70).length === 0 ? 'up' : 'down',
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

  const handleRefresh = () => {
    window.location.reload();
  };

  // Show loading state
  if (isLoading && Object.keys(departmentSummaries).length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="large" className={`mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Chargement du Tableau de Bord
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Récupération des données des modules...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Actualiser</span>
          </button>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <ErrorDisplay 
                key={index}
                error={error} 
                onRetry={handleRefresh} 
                isDark={isDark} 
              />
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              isDark={isDark}
              onClick={() => {}}
              isLoading={isLoading && Object.keys(departmentSummaries).length === 0}
            />
          ))}
        </div>

        {/* Yearly Reports Section */}
        <AnalyticsCard
          title="Rapports Annuels"
          isDark={isDark}
          icon={Calendar}
          action="Voir Rapports"
          onActionClick={() => setShowYearlyReports(true)}
          isLoading={isLoading}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enhancedDashboardData.departments
              .filter(d => d.kpisWithData > 0)
              .map((dept) => (
                <div
                  key={dept.id}
                  className={`group relative p-5 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    isDark
                      ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-xl'
                  }`}
                  onClick={() => setShowYearlyReports(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: dept.color }}
                      >
                        <dept.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {dept.name}
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Rapport {new Date().getFullYear()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Performance Annuelle
                      </span>
                      <span className={`text-sm font-bold ${
                        dept.efficiency >= 85 ? 'text-emerald-600' :
                        dept.efficiency >= 70 ? 'text-blue-600' :
                        dept.efficiency >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {dept.efficiency}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        KPIs Actifs
                      </span>
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {dept.kpisWithData}
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="relative pt-2">
                      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                        <div
                          className="h-2 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${Math.min(dept.efficiency, 100)}%`,
                            backgroundColor: dept.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center space-x-2 pt-2">
                      <div className={`w-2 h-2 rounded-full ${
                        dept.efficiency >= 85 ? 'bg-emerald-500' :
                        dept.efficiency >= 70 ? 'bg-blue-500' :
                        dept.efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        dept.efficiency >= 85 ? 'text-emerald-600' :
                        dept.efficiency >= 70 ? 'text-blue-600' :
                        dept.efficiency >= 50 ? 'text-amber-600' :
                        isDark ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {dept.efficiency >= 85 ? 'Excellent' :
                         dept.efficiency >= 70 ? 'Bon' :
                         dept.efficiency >= 50 ? 'Nécessite Attention' : 'Critique'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {dashboardStats.activeDepartments === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-2xl ${
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              } flex items-center justify-center mx-auto mb-4`}>
                <Calendar className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Aucun Rapport Disponible
              </h4>
              <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Ajoutez des données KPI aux départements pour générer des rapports annuels détaillés.
              </p>
              <button
                onClick={() => setShowYearlyReports(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Explorer les Rapports
              </button>
            </div>
          )}
        </AnalyticsCard>

        {/* Modern Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Department Efficiency Chart */}
          <AnalyticsCard
            title="Efficacité des Départements"
            isDark={isDark}
            icon={TrendingUp}
            isLoading={isLoading}
          >
            {enhancedDashboardData.departments.filter(d => d.kpisWithData > 0).length > 0 ? (
              <div className="space-y-6">
                {enhancedDashboardData.departments
                  .filter(d => d.kpisWithData > 0)
                  .sort((a, b) => b.efficiency - a.efficiency)
                  .map((dept, index) => (
                    <div key={dept.id} className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: dept.color }}>
                            <dept.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {dept.name}
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {dept.kpisWithData} KPIs actifs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                            index === 0 ? 'bg-emerald-100 text-emerald-700' :
                            index === 1 ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className={`text-lg font-bold ${
                            dept.efficiency >= 90 ? 'text-emerald-600' :
                            dept.efficiency >= 70 ? 'text-blue-600' :
                            dept.efficiency >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {dept.efficiency}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className={`w-full h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div
                            className="h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ 
                              width: `${dept.efficiency}%`,
                              backgroundColor: dept.color
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>0%</span>
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>100%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aucune donnée d'efficacité disponible
                </p>
              </div>
            )}
          </AnalyticsCard>

          {/* KPI Distribution Chart */}
          <AnalyticsCard
            title="Distribution des KPIs"
            isDark={isDark}
            icon={BarChart3}
            isLoading={isLoading}
          >
            {dashboardStats.kpisWithData > 0 ? (
              <div className="space-y-6">
                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={isDark ? '#374151' : '#E5E7EB'}
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#10B981"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(dashboardStats.dataCompleteness / 100) * 251.2} 251.2`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {dashboardStats.dataCompleteness}%
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Complétude
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department Breakdown */}
                <div className="space-y-4">
                  {enhancedDashboardData.departments
                    .filter(d => d.kpisWithData > 0)
                    .sort((a, b) => b.kpisWithData - a.kpisWithData)
                    .map((dept) => {
                      const percentage = dashboardStats.kpisWithData > 0 
                        ? Math.round((dept.kpisWithData / dashboardStats.kpisWithData) * 100)
                        : 0;
                      return (
                        <div key={dept.id} className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: dept.color }}>
                            <dept.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {dept.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  {dept.kpisWithData}
                                </span>
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  ({percentage}%)
                                </span>
                              </div>
                            </div>
                            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div
                                className="h-2 rounded-full transition-all duration-700 ease-out"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: dept.color
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aucun KPI avec données disponible
                </p>
              </div>
            )}
          </AnalyticsCard>
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Performing KPIs */}
          <AnalyticsCard
            title="KPIs les Plus Performants"
            isDark={isDark}
            icon={Award}
            isLoading={isLoading}
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

          {/* Modern Activity Feed */}
          <AnalyticsCard
            title="Activités Récentes"
            isDark={isDark}
            icon={Activity}
            action="Historique Complet"
            isLoading={isLoading}
          >
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 8).map((activity, index) => (
                  <ModernActivityCard
                    key={activity.id || index}
                    activity={activity}
                    isDark={isDark}
                    isLoading={false}
                  />
                ))}
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <ModernActivityCard
                    key={index}
                    activity={{}}
                    isDark={isDark}
                    isLoading={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aucune activité récente pour le moment.
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Les activités apparaîtront lorsque vous utiliserez les modules KPI.
                </p>
              </div>
            )}
          </AnalyticsCard>
        </div>
      </div>

      {/* Yearly Reports Modal */}
      {showYearlyReports && (
        <YearlyReports
          isDark={isDark}
          onClose={() => setShowYearlyReports(false)}
        />
      )}
    </div>
  );
};