import React, { useContext, useState, useMemo } from 'react';
import {
  FlaskConical,
  Plus,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Calculator,
  Info,
  Save,
  TestTube,
  Zap,
  Activity,
  Eye,
  Calendar,
  FileText,
  Package,
  Beaker,
  Droplets,
  Gauge,
  Trophy,
  TrendingDown,
  Users,
  Timer,
  PlayCircle
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useKPIData } from '../hook/useKPIData';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';
import ProductDevelopmentTracker from '../components/RnD/ProductQualityValidation';
import FormulationTracker from '../components/RnD/FormulationBuilder';
import ReactECharts from 'echarts-for-react';

// French display names for KPI statuses
const kpiStatusDisplayFr = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Passable',
  'needs-attention': 'Attention Requise',
  'no-data': 'Aucune Donnée'
};

// Weekly Report Modal for R&D
const RnDWeeklyReportModal = ({ analytics, isDark, onClose }) => {
  const weeklyData = useMemo(() => {
    if (!analytics) return null;

    const currentWeek = new Date();
    const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
    
    // Use the correct KPI IDs
    const productDevData = analytics.product_development_time || [];
    const formulationData = analytics.formulation_development || [];

    const weekProductDev = productDevData.filter(entry => 
      new Date(entry.date) >= weekStart
    );
    
    const weekFormulation = formulationData.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    const avgProductDev = weekProductDev.length > 0 
      ? Math.round(weekProductDev.reduce((sum, entry) => sum + entry.value, 0) / weekProductDev.length)
      : 0;

    const avgFormulation = weekFormulation.length > 0 
      ? Math.round(weekFormulation.reduce((sum, entry) => sum + entry.value, 0) / weekFormulation.length)
      : 0;

    const totalProjects = weekProductDev.reduce((sum, entry) => 
      sum + (entry.products?.length || 0), 0
    );

    const totalFormulas = weekFormulation.reduce((sum, entry) => 
      sum + (entry.formulas?.length || 0), 0
    );

    return {
      weekNumber: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      avgProductDev,
      avgFormulation,
      totalProjects,
      totalFormulas,
      weekProductDev,
      weekFormulation
    };
  }, [analytics]);

  if (!weeklyData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className={`w-full max-w-lg p-8 rounded-2xl shadow-xl ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <FileText className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée R&D trouvée pour cette semaine.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-xl ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Hebdomadaire R&D - Semaine {weeklyData.weekNumber}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse complète des performances laboratoire
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={`p-2.5 rounded-lg hover:bg-opacity-10 transition-colors ${
                isDark ? 'hover:bg-white text-slate-400' : 'hover:bg-black text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-8 space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Temps de Développement
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgProductDev}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyData.totalProjects} projets développés
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nouvelles Formules
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgFormulation}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyData.totalFormulas} formules développées
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Objectifs Atteints
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {[weeklyData.avgProductDev >= 80, weeklyData.avgFormulation >= 75].filter(Boolean).length}/2
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  sur 2 KPIs
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-indigo-50/50 border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé de la Semaine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Réussites
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {weeklyData.avgProductDev >= 80 && <li>• Performance développement excellente</li>}
                    {weeklyData.avgFormulation >= 75 && <li>• Objectifs formules atteints</li>}
                    {weeklyData.totalFormulas > 0 && <li>• Nouvelles formules développées</li>}
                    {weeklyData.totalProjects > 0 && <li>• Projets en progression</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Points d'Attention
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {weeklyData.avgProductDev < 60 && <li>• Performance développement faible</li>}
                    {weeklyData.avgFormulation < 60 && <li>• Objectifs formules non atteints</li>}
                    {weeklyData.totalFormulas === 0 && <li>• Aucune nouvelle formule</li>}
                    {weeklyData.totalProjects === 0 && <li>• Aucun projet actif</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Actions Recommandées
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li>• Optimiser délais développement</li>
                    <li>• Augmenter cadence formules</li>
                    <li>• Améliorer processus laboratoire</li>
                    <li>• Renforcer équipe R&D</li>
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

// Monthly Report Modal for R&D
const RnDMonthlyReportModal = ({ analytics, isDark, onClose }) => {
  const monthlyData = useMemo(() => {
    if (!analytics) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthData = {
      productDev: (analytics.product_development_time || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      }),
      formulation: (analytics.formulation_development || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
    };

    const avgProductDev = monthData.productDev.length > 0 
      ? Math.round(monthData.productDev.reduce((sum, entry) => sum + entry.value, 0) / monthData.productDev.length)
      : 0;

    const avgFormulation = monthData.formulation.length > 0 
      ? Math.round(monthData.formulation.reduce((sum, entry) => sum + entry.value, 0) / monthData.formulation.length)
      : 0;

    return {
      monthName: new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      avgProductDev,
      avgFormulation,
      monthData
    };
  }, [analytics]);

  if (!monthlyData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className={`w-full max-w-lg p-8 rounded-2xl shadow-xl ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <FileText className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée disponible
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aucune donnée R&D trouvée pour ce mois.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-xl ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel R&D - {monthlyData.monthName}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse mensuelle complète des performances laboratoire
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={`p-2.5 rounded-lg hover:bg-opacity-10 transition-colors ${
                isDark ? 'hover:bg-white text-slate-400' : 'hover:bg-black text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-8">
            <div className="text-center">
              <h3 className={`text-xl font-semibold mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé Mensuel - {monthlyData.monthName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Temps de Développement
                  </h4>
                  <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {monthlyData.avgProductDev}%
                  </div>
                </div>
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Nouvelles Formules
                  </h4>
                  <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {monthlyData.avgFormulation}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main R&D Page Component
export const RnDPage = () => {
  const { isDark } = useContext(AppContext);

  const [activeForm, setActiveForm] = useState(null);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const [showReportsMenu, setShowReportsMenu] = useState(false);

  const {
    kpiData,
    updateKPIValue,
    getLatestKPIValue,
    getKPIHistory,
    getKPIStatus,
    getDepartmentSummary,
    getKPITrend,
    getRnDAnalytics,
    isLoading
  } = useKPIData();

  const departmentId = 'rnd';
  const department = kpiDefinitions[departmentId];
  
  // Use the CORRECT KPI IDs that match what the components are actually saving
  const interactiveKPIs = [
    { 
      id: 'product_development_time', 
      name: { fr: 'Temps de Développement de Nouveaux Produits' },
      description: { fr: 'Suivi intelligent avec détection des retards d\'échéance et calcul de performance globale' },
      unit: '%',
      target: 80,
      icon: Clock,
      color: 'bg-blue-600'
    },
    { 
      id: 'formulation_development', 
      name: { fr: 'Développement de Nouvelles Formules' },
      description: { fr: 'Suivi des objectifs mensuels et des délais de développement avec gestion des échéances' },
      unit: '%',
      target: 75,
      icon: TestTube,
      color: 'bg-green-600'
    }
  ];

  const departmentSummary = useMemo(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData]);

  const getRnDAnalyticsData = () => {
    // Create analytics structure that matches the new KPI IDs
    const analytics = {
      product_development_time: getKPIHistory(departmentId, 'product_development_time'),
      formulation_development: getKPIHistory(departmentId, 'formulation_development')
    };
    return analytics;
  };

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
      if (specificKPI.id === 'product_development_time') {
        setActiveForm('product_development_tracker');
      } else if (specificKPI.id === 'formulation_development') {
        setActiveForm('formulation_tracker');
      }
    }
  };

  const handleSaveKPI = async (departmentId, kpiId, dataObject, notes) => {
    try {
      await updateKPIValue(departmentId, kpiId, dataObject, notes);
      setTimeout(() => {
        console.log('✅ KPI sauvegardé avec succès :', { departmentId, kpiId, dataObject, notes });
      }, 100);
      setActiveForm(null);
      setSelectedKPI(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du KPI :', error);
      alert('Échec de la sauvegarde des données KPI. Veuillez réessayer.');
    }
  };

  const handleCancelKPI = () => {
    setActiveForm(null);
    setSelectedKPI(null);
  };

  const getStats = () => {
    // Get the actual saved data using the correct KPI IDs
    const productDevKPI = getLatestKPIValue(departmentId, 'product_development_time');
    const formulationKPI = getLatestKPIValue(departmentId, 'formulation_development');

    const kpisWithData = [productDevKPI, formulationKPI].filter(Boolean).length;

    // Extract detailed stats from the saved data
    const productDevStats = productDevKPI?.data?.stats;
    const formulationStats = formulationKPI?.data?.stats;
    
    // Calculate monthly objectives from formulation data
    const monthlyCompleted = formulationStats?.monthlyCompleted || 0;
    const monthlyGoal = formulationKPI?.data?.monthlyGoal || 0;

    // Calculate total projects from product development data
    const totalProjects = productDevStats?.total || 0;
    const completedProjects = productDevStats?.completed || 0;

    return [
      {
        title: 'KPIs Interactifs',
        value: `${kpisWithData}/2`,
        change: kpisWithData === 2 ? '+100%' : `${Math.round((kpisWithData / 2) * 100)}%`,
        changeText: 'configurés',
        icon: Target,
        color: 'blue',
        status: kpisWithData === 2 ? 'excellent' : kpisWithData === 1 ? 'good' : 'needs-attention'
      },
      {
        title: 'Performance Globale',
        value: `${productDevKPI?.value || 0}%`,
        change: productDevKPI?.value >= 80 ? '+Excellent' : productDevKPI?.value >= 60 ? '~Moyen' : '-Faible',
        changeText: 'développement',
        icon: Zap,
        color: 'violet',
        status: (productDevKPI?.value || 0) >= 80 ? 'excellent' : (productDevKPI?.value || 0) >= 60 ? 'good' : 'needs-attention'
      },
      {
        title: 'Objectifs Mensuels',
        value: monthlyGoal > 0 ? `${monthlyCompleted}/${monthlyGoal}` : '0/0',
        change: monthlyGoal > 0 ? `${Math.round((monthlyCompleted / monthlyGoal) * 100)}%` : '0%',
        changeText: 'formules développées',
        icon: Trophy,
        color: 'emerald',
        status: monthlyGoal > 0 && monthlyCompleted >= monthlyGoal ? 'excellent' : monthlyCompleted > 0 ? 'good' : 'needs-attention'
      },
      {
        title: 'Projets Actifs',
        value: `${totalProjects}`,
        change: completedProjects > 0 ? `${completedProjects} terminés` : 'En cours',
        changeText: 'projets suivis',
        icon: PlayCircle,
        color: 'indigo',
        status: totalProjects > 0 ? 'good' : 'needs-attention'
      }
    ];
  };

  const generateChartData = () => {
    const trendData = [];
    const categoryData = [];

    if (!interactiveKPIs.length) return { trendData, categoryData };

    interactiveKPIs.forEach(kpi => {
      const history = getKPIHistory(departmentId, kpi.id);
      if (history.length > 0) {
        const trendEntries = getKPITrend(departmentId, kpi.id, 10);
        trendData.push(...trendEntries.map(entry => ({
          ...entry,
          kpi: kpi.name?.fr || kpi.name?.en,
          target: kpi.target
        })));

        const latest = history[0];
        categoryData.push({
          name: kpi.name?.fr || kpi.name?.en,
          value: latest.value,
          target: kpi.target,
          progress: (latest.value / kpi.target) * 100
        });
      }
    });

    return { trendData, categoryData };
  };

  const { trendData, categoryData } = useMemo(() => generateChartData(), [
    interactiveKPIs,
    getKPIHistory,
    getKPITrend,
    departmentId,
    kpiData
  ]);

  const stats = getStats();
  const deptName = 'Laboratoire R&D';

  const renderSpecializedKPICard = (kpi) => {
    const latestValue = getLatestKPIValue(departmentId, kpi.id);
    const status = getKPIStatus(departmentId, kpi.id);

    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-emerald-800 bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700';
        case 'good': return 'text-blue-800 bg-blue-200 dark:bg-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700';
        case 'fair': return 'text-amber-800 bg-amber-200 dark:bg-amber-800 dark:text-amber-100 border border-amber-300 dark:border-amber-700';
        case 'needs-attention': return 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700';
        default: return 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
      }
    };

    const KPIIcon = kpi.icon;

    const getProgress = () => {
      if (!latestValue || !kpi.target) return 0;
      return Math.min(100, (latestValue.value / kpi.target) * 100);
    };

    const progress = getProgress();
    const statusText = kpiStatusDisplayFr[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Indéfini');

    const getDetailedMetrics = () => {
      if (!latestValue?.data) return null;

      if (kpi.id === 'product_development_time' && latestValue.data.stats) {
        const stats = latestValue.data.stats;
        return (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.completed || 0} terminés
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Timer className="w-3 h-3 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.inProgress || 0} en cours
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.overdue || 0} retard
              </span>
            </div>
          </div>
        );
      }

      if (kpi.id === 'formulation_development' && latestValue.data.stats) {
        const stats = latestValue.data.stats;
        const formatDuration = (days) => {
          if (days === 0) return '0j';
          if (days < 7) return `${days}j`;
          const weeks = Math.floor(days / 7);
          const remainingDays = days % 7;
          if (weeks === 1 && remainingDays === 0) return '1 sem.';
          if (remainingDays === 0) return `${weeks} sem.`;
          return `${weeks}s ${remainingDays}j`;
        };

        return (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.monthlyCompleted}/{latestValue.data.monthlyGoal}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {formatDuration(stats.averageDays)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.completed} formules
              </span>
            </div>
          </div>
        );
      }

      return null;
    };

    return (
      <div
        key={kpi.id}
        onClick={() => handleAddData(kpi)}
        className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
          isDark ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-blue-400/50 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ${kpi.color}`}>
            <KPIIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
              {statusText}
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className={`text-base font-bold mb-2 group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {kpi.name.fr}
          </h4>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {kpi.description.fr}
          </p>
        </div>

        {latestValue ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {latestValue.value}{kpi.unit}
              </span>
              <div className="text-right">
                <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Objectif: {kpi.target}%
                </div>
                <div className={`text-xs font-semibold ${
                  progress >= 100 ? 'text-emerald-600' :
                  progress >= 80 ? 'text-blue-600' :
                  progress >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {progress.toFixed(0)}% atteint
                </div>
              </div>
            </div>

            <div className={`w-full rounded-full h-2 shadow-inner ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                  progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                  progress >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  progress >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                {getDetailedMetrics()}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {new Date(latestValue.date).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
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

  const renderKPIChart = (kpi) => {
    const history = getKPIHistory(departmentId, kpi.id);
    if (history.length === 0) return null;

    const chartData = history.slice(0, 10).reverse().map(entry => ({
      date: new Date(entry.date).toLocaleDateString('fr-FR'),
      value: entry.value,
      target: kpi.target
    }));

    const chartOptions = {
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
        },
        formatter: function(params) {
          const dataPoint = params[0];
          const targetPoint = params[1];
          return `
            <div class="text-sm">
              <div class="font-medium mb-2">${dataPoint.axisValue}</div>
              <div class="flex items-center space-x-2">
                <span style="color: ${dataPoint.color}">●</span>
                <span>${dataPoint.seriesName}: ${dataPoint.value}%</span>
              </div>
              <div class="flex items-center space-x-2">
                <span style="color: ${targetPoint.color}">●</span>
                <span>${targetPoint.seriesName}: ${targetPoint.value}%</span>
              </div>
            </div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.date),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, formatter: '{value}%' },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series: [
        {
          name: kpi.name?.fr || kpi.name?.en,
          type: 'line',
          data: chartData.map(item => item.value),
          smooth: true,
          lineStyle: { 
            color: kpi.id === 'product_development_time' ? '#3B82F6' : '#10B981',
            width: 3 
          },
          itemStyle: { 
            color: kpi.id === 'product_development_time' ? '#3B82F6' : '#10B981',
            borderWidth: 2,
            borderColor: '#fff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: (kpi.id === 'product_development_time' ? '#3B82F6' : '#10B981') + '40' },
                { offset: 1, color: (kpi.id === 'product_development_time' ? '#3B82F6' : '#10B981') + '10' }
              ]
            }
          }
        },
        {
          name: 'Objectif',
          type: 'line',
          data: chartData.map(item => item.target),
          lineStyle: { color: '#F59E0B', type: 'dashed', width: 2 },
          itemStyle: { color: '#F59E0B' },
          symbol: 'none'
        }
      ]
    };

    return (
      <div key={kpi.id} className={`p-6 rounded-xl border ${
        isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kpi.name?.fr || kpi.name?.en}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Évolution sur {chartData.length} dernières entrées
            </p>
          </div>
        </div>
        
        <ReactECharts 
          option={chartOptions} 
          style={{ height: '300px' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Modals */}
        {activeForm === 'product_development_tracker' && (
          <ProductDevelopmentTracker
            onSave={handleSaveKPI}
            onCancel={handleCancelKPI}
            existingData={selectedKPI?.latestValue?.data}
            isDark={isDark}
          />
        )}

        {activeForm === 'formulation_tracker' && (
          <FormulationTracker
            onSave={handleSaveKPI}
            onCancel={handleCancelKPI}
            existingData={selectedKPI?.latestValue?.data}
            isDark={isDark}
          />
        )}

        {showReports && reportType === 'weekly' && (
          <RnDWeeklyReportModal 
            analytics={getRnDAnalyticsData()}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}

        {showReports && reportType === 'monthly' && (
          <RnDMonthlyReportModal 
            analytics={getRnDAnalyticsData()}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </h1>
              <p className={`text-base mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Suivi intelligent du développement produits avec gestion des échéances et optimisation des délais de formulation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Reports Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowReportsMenu(!showReportsMenu)}
                className={`flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-200 font-medium group shadow-sm ${
                  showReportsMenu
                    ? isDark 
                      ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300 shadow-indigo-500/20' 
                      : 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-indigo-500/20'
                    : isDark 
                      ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50' 
                      : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Rapports</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showReportsMenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Backdrop for click outside */}
              {showReportsMenu && (
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowReportsMenu(false)}
                />
              )}
              
              {/* Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl z-20 transition-all duration-200 transform ${
                showReportsMenu 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible translate-y-2'
              } ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                
                {/* Menu Header */}
                <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Rapports de R&D
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Analyses et synthèses des performances laboratoire
                  </p>
                </div>
                
                {/* Menu Items */}
                <div className="p-3">
                  <button
                    onClick={() => { 
                      setReportType('weekly'); 
                      setShowReports(true); 
                      setShowReportsMenu(false);
                    }}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                      isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Rapport Hebdomadaire
                      </div>
                      <div className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Analyse détaillée de la semaine en cours
                      </div>
                    </div>
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => { 
                      setReportType('monthly'); 
                      setShowReports(true); 
                      setShowReportsMenu(false);
                    }}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                      isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Rapport Mensuel
                      </div>
                      <div className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Vue d'ensemble et tendances du mois
                      </div>
                    </div>
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
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
                  stat.color === 'blue' ? 'bg-blue-600' :
                  stat.color === 'violet' ? 'bg-violet-600' :
                  stat.color === 'emerald' ? 'bg-emerald-600' :
                  stat.color === 'indigo' ? 'bg-indigo-600' :
                  'bg-slate-600'
                }`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`p-1 rounded-lg transition-all ${
                  stat.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300' :
                  stat.status === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300'
                }`}>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mb-3 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'violet' ? 'text-violet-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    stat.status === 'excellent' ? 'text-emerald-600 dark:text-emerald-400' :
                    stat.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                    'text-amber-600 dark:text-amber-400'
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

        {/* Interactive KPIs Section */}
        <div className={`rounded-2xl border p-8 shadow-sm ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                KPIs Interactifs R&D
              </h3>
              <p className={`text-base mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Suivi en temps réel du développement avec gestion intelligente des échéances
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Nouvelle interface</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {interactiveKPIs.map(renderSpecializedKPICard)}
          </div>
        </div>

        {/* Charts Section */}
        {interactiveKPIs.some(kpi => getKPIHistory(departmentId, kpi.id).length > 0) && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Analyse de Performance par KPI
              </h3>
              <div className="flex items-center space-x-2 text-sm">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Évolution temporelle des indicateurs</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {interactiveKPIs.map(kpi => renderKPIChart(kpi)).filter(Boolean)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!getLatestKPIValue(departmentId, 'product_development_time') && !getLatestKPIValue(departmentId, 'formulation_development')) && (
          <div className={`text-center py-20 rounded-2xl border ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-8 shadow-lg`}>
              <FlaskConical className="w-12 h-12 text-indigo-600" />
            </div>
            <h4 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Prêt à Démarrer l'Innovation R&D
            </h4>
            <p className={`text-lg mb-10 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Cliquez sur n'importe quelle carte KPI ci-dessus pour commencer le suivi intelligent du développement avec gestion des échéances et optimisation des processus
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => handleAddData(interactiveKPIs[0])}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center space-x-3"
              >
                <Clock className="w-5 h-5" />
                <span>Temps Développement</span>
              </button>
              <button 
                onClick={() => handleAddData(interactiveKPIs[1])}
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center space-x-3"
              >
                <TestTube className="w-5 h-5" />
                <span>Nouvelles Formules</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};