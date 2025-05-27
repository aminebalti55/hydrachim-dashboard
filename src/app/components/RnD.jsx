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
  Gauge
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useKPIData } from '../hook/useKPIData';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';
import ProductQualityValidation from '../components/RnD/ProductQualityValidation';
import FormulationBuilder from '../components/RnD/FormulationBuilder';
import LiveKPIDashboard from '../components/RnD/LiveKPIDashboard';
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
    
    const qualityData = analytics.quality || [];
    const formulationData = analytics.formulation || [];
    const dashboardData = analytics.dashboard || [];

    const weekQuality = qualityData.filter(entry => 
      new Date(entry.date) >= weekStart
    );
    
    const weekFormulation = formulationData.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    const weekDashboard = dashboardData.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    const avgQuality = weekQuality.length > 0 
      ? Math.round(weekQuality.reduce((sum, entry) => sum + entry.value, 0) / weekQuality.length)
      : 0;

    const avgFormulation = weekFormulation.length > 0 
      ? Math.round(weekFormulation.reduce((sum, entry) => sum + entry.value, 0) / weekFormulation.length)
      : 0;

    const avgDashboard = weekDashboard.length > 0 
      ? Math.round(weekDashboard.reduce((sum, entry) => sum + entry.value, 0) / weekDashboard.length)
      : 0;

    const totalFormulas = weekFormulation.reduce((sum, entry) => 
      sum + (entry.formulas?.length || 0), 0
    );

    const totalProducts = weekQuality.reduce((sum, entry) => {
      const products = entry.products || {};
      return sum + Object.values(products).reduce((pSum, cat) => pSum + (cat?.length || 0), 0);
    }, 0);

    const totalTests = weekQuality.reduce((sum, entry) => {
      if (!entry.matierePremiereTests || !entry.produitFiniTests) return sum;
      return sum + entry.matierePremiereTests.totalTests + entry.produitFiniTests.totalTests;
    }, 0);

    return {
      weekNumber: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      avgQuality,
      avgFormulation,
      avgDashboard,
      totalFormulas,
      totalProducts,
      totalTests,
      weekQuality,
      weekFormulation,
      weekDashboard
    };
  }, [analytics]);

  if (!weeklyData) {
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
              Aucune donnée R&D trouvée pour cette semaine.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
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
            <button onClick={onClose} className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Qualité Moyenne
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgQuality}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyData.totalProducts} produits • {weeklyData.totalTests} tests
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Formulation
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgFormulation}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyData.totalFormulas} formules créées
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Dashboard Temps Réel
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgDashboard}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  performance globale
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Objectifs Atteints
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {[weeklyData.avgQuality >= 90, weeklyData.avgFormulation >= 80, weeklyData.avgDashboard >= 75].filter(Boolean).length}/3
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  sur 3 KPIs
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé de la Semaine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Réussites
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {weeklyData.avgQuality >= 90 && <li>• Excellente qualité produits</li>}
                    {weeklyData.avgFormulation >= 80 && <li>• Formulations performantes</li>}
                    {weeklyData.avgDashboard >= 75 && <li>• Dashboard optimisé</li>}
                    {weeklyData.totalFormulas > 0 && <li>• Nouvelles formules développées</li>}
                    {weeklyData.totalProducts > 0 && <li>• Tests qualité effectués</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Points d'Attention
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {weeklyData.avgQuality < 80 && <li>• Qualité à améliorer</li>}
                    {weeklyData.avgFormulation < 70 && <li>• Formulations à optimiser</li>}
                    {weeklyData.avgDashboard < 60 && <li>• Dashboard à ajuster</li>}
                    {weeklyData.totalFormulas === 0 && <li>• Aucune nouvelle formule</li>}
                    {weeklyData.totalTests === 0 && <li>• Aucun test effectué</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Actions Recommandées
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li>• Continuer l'innovation</li>
                    <li>• Optimiser les tests individuels</li>
                    <li>• Réviser les formules</li>
                    <li>• Vérifier disponibilité emballages</li>
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
      quality: (analytics.quality || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      }),
      formulation: (analytics.formulation || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      }),
      dashboard: (analytics.dashboard || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
    };

    const avgQuality = monthData.quality.length > 0 
      ? Math.round(monthData.quality.reduce((sum, entry) => sum + entry.value, 0) / monthData.quality.length)
      : 0;

    const avgFormulation = monthData.formulation.length > 0 
      ? Math.round(monthData.formulation.reduce((sum, entry) => sum + entry.value, 0) / monthData.formulation.length)
      : 0;

    const avgDashboard = monthData.dashboard.length > 0 
      ? Math.round(monthData.dashboard.reduce((sum, entry) => sum + entry.value, 0) / monthData.dashboard.length)
      : 0;

    return {
      monthName: new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      avgQuality,
      avgFormulation,
      avgDashboard,
      monthData
    };
  }, [analytics]);

  if (!monthlyData) {
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
              Aucune donnée R&D trouvée pour ce mois.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
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
            <button onClick={onClose} className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-8">
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Résumé Mensuel - {monthlyData.monthName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Qualité Produits
                  </h4>
                  <div className={`text-3xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {monthlyData.avgQuality}%
                  </div>
                </div>
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Formulations
                  </h4>
                  <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {monthlyData.avgFormulation}%
                  </div>
                </div>
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Dashboard Temps Réel
                  </h4>
                  <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {monthlyData.avgDashboard}%
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
  const interactiveKPIs = department?.kpis?.filter(kpi => 
    ['product_quality_validation', 'formulation_builder', 'live_kpi_dashboard'].includes(kpi.id)
  ) || [];

  const departmentSummary = useMemo(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData]);

  const getRnDAnalyticsData = () => {
    return getRnDAnalytics(departmentId);
  };

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
      setActiveForm(specificKPI.id);
    }
  };

  const handleSaveKPI = async (departmentId, kpiId, dataObject, notes) => {
    try {
      await updateKPIValue(departmentId, kpiId, dataObject, notes);
      setTimeout(() => {
        console.log('KPI sauvegardé avec succès :', { departmentId, kpiId, dataObject, notes });
        console.log('Données localStorage actuelles :', localStorage.getItem('hydrachim_kpi_data'));
      }, 100);
      setActiveForm(null);
      setSelectedKPI(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du KPI :', error);
      alert('Échec de la sauvegarde des données KPI. Veuillez réessayer.');
    }
  };

  const handleCancelKPI = () => {
    setActiveForm(null);
    setSelectedKPI(null);
  };

  const getStats = () => {
    if (!departmentSummary?.kpis) {
      return [
        { title: 'KPIs Interactifs', value: '0/3', change: 0, changeText: 'configurés', icon: Target, color: 'blue' },
        { title: 'Performance Globale', value: '0%', change: 0, changeText: 'efficacité', icon: TrendingUp, color: 'emerald' },
        { title: 'Qualité Produits', value: '0%', change: 0, changeText: 'validés', icon: TestTube, color: 'indigo' },
        { title: 'Formulations', value: '0%', change: 0, changeText: 'réussies', icon: Zap, color: 'green' }
      ];
    }

    const kpisWithData = departmentSummary.kpis.filter(kpi => 
      ['product_quality_validation', 'formulation_builder', 'live_kpi_dashboard'].includes(kpi.id) && kpi.latestValue
    ) || [];

    const qualityKPI = departmentSummary.kpis.find(k => k.id === 'product_quality_validation');
    const formulationKPI = departmentSummary.kpis.find(k => k.id === 'formulation_builder');
    const dashboardKPI = departmentSummary.kpis.find(k => k.id === 'live_kpi_dashboard');

    return [
      {
        title: 'KPIs Interactifs',
        value: `${kpisWithData.length}/3`,
        change: kpisWithData.length,
        changeText: 'configurés',
        icon: Target,
        color: 'blue'
      },
      {
        title: 'Performance Globale',
        value: `${dashboardKPI?.latestValue?.value || 0}%`,
        change: dashboardKPI?.latestValue?.value || 0,
        changeText: 'efficacité',
        icon: TrendingUp,
        color: 'emerald'
      },
      {
        title: 'Qualité Produits',
        value: `${qualityKPI?.latestValue?.value || 0}%`,
        change: qualityKPI?.latestValue?.value || 0,
        changeText: 'validés',
        icon: TestTube,
        color: 'indigo'
      },
      {
        title: 'Formulations',
        value: `${formulationKPI?.latestValue?.value || 0}%`,
        change: formulationKPI?.latestValue?.value || 0,
        changeText: 'réussies',
        icon: Zap,
        color: 'green'
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
  const deptName = 'Laboratoire R&D Interactif';

  const renderSpecializedKPICard = (kpi) => {
    const kpiSummary = departmentSummary?.kpis?.find(k => k.id === kpi.id);
    const latestValue = kpiSummary?.latestValue;
    const status = kpiSummary?.status || 'no-data';

    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
        case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
        case 'fair': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
        case 'needs-attention': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      }
    };

    const getKPIIcon = (kpiId) => {
      switch (kpiId) {
        case 'product_quality_validation': return TestTube;
        case 'formulation_builder': return Zap;
        case 'live_kpi_dashboard': return Activity;
        default: return Target;
      }
    };

    const getKPIColor = (kpiId) => {
      switch (kpiId) {
        case 'product_quality_validation': return 'from-indigo-600 to-indigo-700';
        case 'formulation_builder': return 'from-green-600 to-green-700';
        case 'live_kpi_dashboard': return 'from-purple-600 to-purple-700';
        default: return 'from-blue-600 to-blue-700';
      }
    };

    const getKPIName = (kpiId) => {
      switch (kpiId) {
        case 'product_quality_validation': return 'Validation Qualité Produits';
        case 'formulation_builder': return 'Constructeur de Formulations';
        case 'live_kpi_dashboard': return 'Tableau de Bord KPI en Temps Réel';
        default: return kpi.name?.fr || kpi.name?.en;
      }
    };

    const getKPIDescription = (kpiId) => {
      switch (kpiId) {
        case 'product_quality_validation': return 'Tests individuels (Densité, pH, Dosage) et vérification disponibilité emballage';
        case 'formulation_builder': return 'Création de formules par glisser-déposer avec KPI individuels et suivi d\'essais';
        case 'live_kpi_dashboard': return 'Synchronisation temps réel avec analyses de tendances et rapports automatiques';
        default: return kpi.description?.fr || kpi.description?.en;
      }
    };

    const KPIIcon = getKPIIcon(kpi.id);
    const kpiName = getKPIName(kpi.id);
    const kpiDescription = getKPIDescription(kpi.id);

    const getProgress = () => {
      if (!latestValue || !kpi.target) return 0;
      return Math.min(100, (latestValue.value / kpi.target) * 100);
    };

    const progress = getProgress();
    const statusText = kpiStatusDisplayFr[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Indéfini');

    const getDetailedMetrics = () => {
      if (!latestValue?.data) return null;

      if (kpi.id === 'product_quality_validation' && latestValue.data.categoryKPIs) {
        return (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Beaker className="w-3 h-3 text-blue-500" />
              <span>MP: {latestValue.data.categoryKPIs.matiere_premiere}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <TestTube className="w-3 h-3 text-green-500" />
              <span>PF: {latestValue.data.categoryKPIs.produit_fini}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 text-purple-500" />
              <span>EMB: {latestValue.data.categoryKPIs.emballage}%</span>
            </div>
          </div>
        );
      }

      if (kpi.id === 'formulation_builder' && latestValue.data.formulas) {
        return (
          <div className="text-xs">
            <span>{latestValue.data.formulas.length} formules • </span>
            <span>{latestValue.data.formulas.filter(f => f.kpi >= 80).length} performantes</span>
          </div>
        );
      }

      if (kpi.id === 'live_kpi_dashboard' && latestValue.data.metrics) {
        return (
          <div className="text-xs">
            <span>{latestValue.data.metrics.totalFormulas} formules • </span>
            <span>{latestValue.data.metrics.totalEssais} essais</span>
          </div>
        );
      }

      return null;
    };

    return (
      <div
        key={kpi.id}
        onClick={() => handleAddData(kpi)}
        className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          isDark ? 'bg-slate-800/60 border-slate-700/50 hover:border-indigo-500/50' : 'bg-white border-slate-200/80 hover:border-indigo-500/50 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getKPIColor(kpi.id)} flex items-center justify-center shadow-lg`}>
            <KPIIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {statusText}
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? 'text-indigo-400' : 'text-indigo-500'
            }`}>
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {kpiName}
          </h4>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {kpiDescription}
          </p>
        </div>

        {latestValue ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {latestValue.value}{kpi.unit}
              </span>
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {progress.toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress >= 90 ? 'bg-emerald-500' :
                  progress >= 70 ? 'bg-blue-500' :
                  progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              {getDetailedMetrics()}
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {new Date(latestValue.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className={`w-12 h-12 rounded-xl ${
              isDark ? 'bg-slate-700 group-hover:bg-indigo-900/30' : 'bg-slate-100 group-hover:bg-indigo-50'
            } flex items-center justify-center mx-auto mb-3 transition-all`}>
              <Plus className={`w-6 h-6 ${
                isDark ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'
              } transition-colors`} />
            </div>
            <p className={`text-sm font-medium ${
              isDark ? 'text-slate-300 group-hover:text-indigo-300' : 'text-slate-600 group-hover:text-indigo-600'
            } transition-colors`}>
              Cliquez pour configurer ce KPI
            </p>
          </div>
        )}
      </div>
    );
  };

  const getFormulationData = () => {
    const formulationKPI = departmentSummary?.kpis?.find(k => k.id === 'formulation_builder');
    return formulationKPI?.latestValue?.data || null;
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
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series: [
        {
          name: kpi.name?.fr || kpi.name?.en,
          type: 'line',
          data: chartData.map(item => item.value),
          smooth: true,
          lineStyle: { 
            color: kpi.id === 'product_quality_validation' ? '#6366F1' : 
                   kpi.id === 'formulation_builder' ? '#10B981' : '#8B5CF6',
            width: 3 
          },
          itemStyle: { 
            color: kpi.id === 'product_quality_validation' ? '#6366F1' : 
                   kpi.id === 'formulation_builder' ? '#10B981' : '#8B5CF6'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: (kpi.id === 'product_quality_validation' ? '#6366F1' : 
                                   kpi.id === 'formulation_builder' ? '#10B981' : '#8B5CF6') + '40' },
                { offset: 1, color: (kpi.id === 'product_quality_validation' ? '#6366F1' : 
                                   kpi.id === 'formulation_builder' ? '#10B981' : '#8B5CF6') + '10' }
              ]
            }
          }
        },
        {
          name: 'Cible',
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
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            kpi.id === 'product_quality_validation' ? 'bg-indigo-600' : 
            kpi.id === 'formulation_builder' ? 'bg-green-600' : 'bg-purple-600'
          }`}>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kpi.name?.fr || kpi.name?.en}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Évolution sur 10 dernières entrées
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

  React.useEffect(() => {
    console.log('Page RnD montée. Données localStorage actuelles :', localStorage.getItem('hydrachim_kpi_data'));
    console.log('État kpiData actuel :', kpiData);
    console.log('Résumé du département :', departmentSummary);
  }, [kpiData, departmentSummary]);

  return (
    <div className={`space-y-8 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {activeForm === 'product_quality_validation' && (
        <ProductQualityValidation
          onSave={handleSaveKPI}
          onCancel={handleCancelKPI}
          existingData={selectedKPI?.latestValue?.data}
          isDark={isDark}
        />
      )}

      {activeForm === 'formulation_builder' && (
        <FormulationBuilder
          onSave={handleSaveKPI}
          onCancel={handleCancelKPI}
          existingData={selectedKPI?.latestValue?.data}
          isDark={isDark}
        />
      )}

      {activeForm === 'live_kpi_dashboard' && (
        <LiveKPIDashboard
          onSave={handleSaveKPI}
          onCancel={handleCancelKPI}
          existingData={selectedKPI?.latestValue?.data}
          formulationData={getFormulationData()}
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {deptName}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Validation qualité avec tests individuels, formulations avancées et tableau de bord synchronisé
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
              stat.color === 'blue' ? (isDark ? 'from-blue-500/10 to-purple-500/5' : 'from-blue-50 to-purple-50/50') :
              stat.color === 'emerald' ? (isDark ? 'from-emerald-500/10 to-teal-500/5' : 'from-emerald-50 to-teal-50/50') :
              stat.color === 'indigo' ? (isDark ? 'from-indigo-500/10 to-purple-500/5' : 'from-indigo-50 to-purple-50/50') :
              stat.color === 'green' ? (isDark ? 'from-green-500/10 to-emerald-500/5' : 'from-green-50 to-emerald-50/50') :
              (isDark ? 'from-slate-500/10 to-slate-600/5' : 'from-slate-50 to-slate-100/50')
            } opacity-50`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  stat.color === 'blue' ? 'from-indigo-600 to-purple-600' :
                  stat.color === 'emerald' ? 'from-emerald-600 to-teal-600' :
                  stat.color === 'indigo' ? 'from-indigo-600 to-purple-600' :
                  stat.color === 'green' ? 'from-green-600 to-emerald-600' :
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
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
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

      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              KPIs Interactifs R&D
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Validation qualité avec tests individuels, construction de formules et tableau de bord synchronisé
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {interactiveKPIs.map(renderSpecializedKPICard)}
        </div>
      </div>

      {interactiveKPIs.some(kpi => getKPIHistory(departmentId, kpi.id).length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Analyse de Performance par KPI
            </h3>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <BarChart3 className="w-4 h-4" />
              <span>Évolution individuelle des KPIs</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {interactiveKPIs.map(kpi => renderKPIChart(kpi)).filter(Boolean)}
          </div>
        </div>
      )}

      {(!departmentSummary?.kpis || departmentSummary.kpis.filter(kpi => 
        ['product_quality_validation', 'formulation_builder', 'live_kpi_dashboard'].includes(kpi.id) && kpi.latestValue
      ).length === 0) && (
        <div className={`text-center py-12 rounded-2xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-indigo-50'} flex items-center justify-center mx-auto mb-4`}>
            <FlaskConical className="w-8 h-8 text-indigo-500" />
          </div>
          <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Prêt à Démarrer l'Innovation R&D
          </h4>
          <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Cliquez sur n'importe quelle carte KPI ci-dessus pour commencer la validation qualité avec tests individuels, la création de formules ou l'analyse en temps réel
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={() => handleAddData(interactiveKPIs.find(k => k.id === 'product_quality_validation'))}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Tests Qualité
            </button>
            <button 
              onClick={() => handleAddData(interactiveKPIs.find(k => k.id === 'formulation_builder'))}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Créer Formule
            </button>
            <button 
              onClick={() => handleAddData(interactiveKPIs.find(k => k.id === 'live_kpi_dashboard'))}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Tableau de Bord
            </button>
          </div>
        </div>
      )}
    </div>
  );
};