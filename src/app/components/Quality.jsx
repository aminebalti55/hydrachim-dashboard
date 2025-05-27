import React, { useContext, useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  X,
  Eye,
  Calendar,
  FileText,
  Package,
  Gauge,
  Activity,
  Sparkles,
  Award,
  TrendingDown
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useKPIData } from '../hook/useKPIData';
import { KPIForm } from '../components/KPIForm';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';
import ReactECharts from 'echarts-for-react';

// French display names for KPI statuses
const kpiStatusDisplayFr = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Passable',
  'needs-attention': 'Attention Requise',
  'no-data': 'Aucune Donnée'
};

// Weekly Report Modal for Quality
const QualityWeeklyReportModal = ({ analytics, isDark, onClose }) => {
  const weeklyData = useMemo(() => {
    if (!analytics) return null;

    const currentWeek = new Date();
    const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
    
    const qualityData = analytics.quality || [];

    const weekQuality = qualityData.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    const avgQuality = weekQuality.length > 0 
      ? Math.round(weekQuality.reduce((sum, entry) => sum + entry.value, 0) / weekQuality.length)
      : 0;

    const totalTests = weekQuality.reduce((sum, entry) => sum + (entry.tests || 0), 0);
    const avgCompliance = weekQuality.reduce((sum, entry) => sum + (entry.compliance || 0), 0) / weekQuality.length || 0;

    return {
      weekNumber: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      avgQuality,
      totalTests,
      avgCompliance: Math.round(avgCompliance),
      weekQuality
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
              Aucune donnée de qualité trouvée pour cette semaine.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Hebdomadaire Qualité - Semaine {weeklyData.weekNumber}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse complète des performances qualité
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
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Qualité Moyenne
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgQuality}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyData.totalTests} tests effectués
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Conformité
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgCompliance}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  taux de conformité
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Contrôles Qualité
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.weekQuality.length}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  sessions cette semaine
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Objectifs Atteints
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {[weeklyData.avgQuality >= 95, weeklyData.avgCompliance >= 90].filter(Boolean).length}/2
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  sur 2 KPIs
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
                    {weeklyData.avgQuality >= 95 && <li>• Excellente qualité</li>}
                    {weeklyData.avgCompliance >= 90 && <li>• Conformité optimale</li>}
                    {weeklyData.totalTests > 0 && <li>• Tests de qualité réguliers</li>}
                    {weeklyData.weekQuality.length > 0 && <li>• Activité de contrôle</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Points d'Attention
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {weeklyData.avgQuality < 85 && <li>• Qualité à améliorer</li>}
                    {weeklyData.avgCompliance < 80 && <li>• Conformité à renforcer</li>}
                    {weeklyData.totalTests === 0 && <li>• Aucun test effectué</li>}
                    {weeklyData.weekQuality.length === 0 && <li>• Aucune activité</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Actions Recommandées
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li>• Renforcer les contrôles</li>
                    <li>• Maintenir les standards</li>
                    <li>• Surveiller la conformité</li>
                    <li>• Former les équipes</li>
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

// Monthly Report Modal for Quality
const QualityMonthlyReportModal = ({ analytics, isDark, onClose }) => {
  const monthlyData = useMemo(() => {
    if (!analytics) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthData = {
      quality: (analytics.quality || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
    };

    const avgQuality = monthData.quality.length > 0 
      ? Math.round(monthData.quality.reduce((sum, entry) => sum + entry.value, 0) / monthData.quality.length)
      : 0;

    return {
      monthName: new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      avgQuality,
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
              Aucune donnée de qualité trouvée pour ce mois.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel Qualité - {monthlyData.monthName}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse mensuelle complète des performances qualité
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
                    Qualité Moyenne
                  </h4>
                  <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {monthlyData.avgQuality}%
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

// Enhanced Quality KPI Selector Component
const QualityKPISelector = ({ onSelect, onCancel, isDark, departmentKPIs }) => {
  const [selectedKPI, setSelectedKPI] = useState('');

  const handleSubmit = () => {
    if (selectedKPI) {
      const kpi = departmentKPIs.find(k => k.id === selectedKPI);
      if (kpi) {
        onSelect(kpi);
      }
    }
  };

  const selectedKPIData = departmentKPIs.find(k => k.id === selectedKPI);

  return (
    <div className={`rounded-2xl border shadow-2xl max-h-[85vh] overflow-y-auto ${
      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
    }`}>

      <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sélectionner un Indicateur Qualité
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Choisissez l'indicateur qualité à mettre à jour
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        <div className={`flex-1 p-8 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="space-y-6">

            {departmentKPIs.length > 0 ? (
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Indicateurs Disponibles ({departmentKPIs.length})
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {departmentKPIs.map((kpi, index) => (
                    <button
                      key={kpi.id}
                      onClick={() => setSelectedKPI(kpi.id)}
                      className={`w-full p-6 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] ${
                        selectedKPI === kpi.id
                          ? isDark
                            ? 'border-emerald-500 bg-emerald-950/30 shadow-lg'
                            : 'border-emerald-500 bg-emerald-50 shadow-lg'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold ${
                            selectedKPI === kpi.id
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : isDark
                                ? 'bg-slate-700 text-slate-300 border-slate-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-semibold mb-2 ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-emerald-300' : 'text-emerald-700'
                                : isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {kpi.name?.fr || kpi.name?.en || kpi.id}
                            </h4>
                            <p className={`text-sm mb-3 leading-relaxed ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {kpi.description?.fr || kpi.description?.en || ''}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                Cible : {kpi.target}{kpi.unit}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {kpi.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedKPI === kpi.id && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-emerald-50'} flex items-center justify-center mx-auto mb-6`}>
                  <ShieldCheck className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-emerald-400'}`} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Aucun Indicateur Configuré
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Configurez les indicateurs qualité pour commencer le suivi
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="h-full">
            {selectedKPIData ? (
              <div className="space-y-8">
                <div>
                  <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Indicateur Sélectionné
                  </h4>
                  <div className={`p-6 rounded-xl border ${
                    isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {selectedKPIData.name?.fr || selectedKPIData.name?.en || selectedKPIData.id}
                        </h5>
                        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedKPIData.description?.fr || selectedKPIData.description?.en || ''}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 shadow-sm'
                          }`}>
                            🎯 Cible : {selectedKPIData.target}{selectedKPIData.unit}
                          </span>
                          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 shadow-sm'
                          }`}>
                            📊 Type : {selectedKPIData.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border ${
                  isDark ? 'border-slate-600 bg-slate-800/30' : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Prêt à mettre à jour
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Cliquez sur continuer pour saisir de nouvelles données pour cet indicateur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-emerald-50'} flex items-center justify-center mx-auto mb-6`}>
                    <Target className={`w-12 h-12 ${isDark ? 'text-slate-600' : 'text-emerald-400'}`} />
                  </div>
                  <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Sélectionner un Indicateur
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Choisissez un indicateur dans la liste pour voir les détails et continuer
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`px-8 py-6 border-t ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Annuler
          </button>

          {selectedKPI && (
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Quality Page Component
export const QualityPage = () => {
  const { isDark } = useContext(AppContext);

  const [showKPIForm, setShowKPIForm] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState('weekly');

  const {
    kpiData,
    updateKPIValue,
    getKPIHistory,
    getDepartmentSummary,
    getKPITrend,
    getQualityAnalytics,
    isLoading
  } = useKPIData();

  const departmentId = 'quality';
  const department = kpiDefinitions[departmentId];
  const departmentKPIs = department?.kpis || [];

  const departmentSummary = useMemo(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData]);

  const getQualityAnalyticsData = () => {
    return getQualityAnalytics && getQualityAnalytics(departmentId);
  };

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
      setShowKPIForm(true);
    } else {
      setSelectedKPI(null);
      setShowKPIForm(true);
    }
  };

  const handleSaveKPI = async (deptId, kpiId, value, notes) => {
    try {
      await updateKPIValue(deptId, kpiId, value, notes);
      setTimeout(() => {
        console.log('KPI sauvegardé avec succès :', { deptId, kpiId, value, notes });
        console.log('Données localStorage actuelles :', localStorage.getItem('hydrachim_kpi_data'));
      }, 100);
      setShowKPIForm(false);
      setSelectedKPI(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du KPI :', error);
      alert('Échec de la sauvegarde des données KPI. Veuillez réessayer.');
    }
  };

  const handleCancelKPI = () => {
    setShowKPIForm(false);
    setSelectedKPI(null);
  };

  const getStats = () => {
    if (!departmentSummary?.kpis) {
      return [
        { title: 'Indicateurs Suivis', value: '0/0', change: 0, changeText: 'actifs', icon: Target, color: 'emerald' },
        { title: 'Performance Globale', value: '0%', change: 0, changeText: 'efficacité', icon: TrendingUp, color: 'emerald' },
        { title: 'Excellent', value: '0', change: 0, changeText: 'indicateurs', icon: CheckCircle, color: 'green' },
        { title: 'Attention Requise', value: '0', change: 0, changeText: 'alertes', icon: AlertTriangle, color: 'red' }
      ];
    }

    const kpisWithData = departmentSummary.kpis.filter(kpi => kpi.latestValue) || [];
    const excellentKpis = kpisWithData.filter(kpi => kpi.status === 'excellent');
    const needsAttentionKpis = kpisWithData.filter(kpi => kpi.status === 'needs-attention');

    return [
      {
        title: 'Indicateurs Suivis',
        value: `${kpisWithData.length}/${departmentSummary.kpis.length}`,
        change: kpisWithData.length,
        changeText: 'actifs',
        icon: Target,
        color: 'emerald'
      },
      {
        title: 'Performance Globale',
        value: `${departmentSummary.efficiency || 0}%`,
        change: departmentSummary.efficiency || 0,
        changeText: 'efficacité',
        icon: TrendingUp,
        color: 'emerald'
      },
      {
        title: 'Excellent',
        value: excellentKpis.length.toString(),
        change: excellentKpis.length,
        changeText: 'indicateurs',
        icon: CheckCircle,
        color: 'green'
      },
      {
        title: 'Attention Requise',
        value: needsAttentionKpis.length.toString(),
        change: needsAttentionKpis.length,
        changeText: 'alertes',
        icon: AlertTriangle,
        color: 'red'
      }
    ];
  };

  const generateChartData = () => {
    const trendData = [];
    const categoryData = [];

    if (!departmentKPIs.length) return { trendData, categoryData };

    departmentKPIs.forEach(kpi => {
      const history = getKPIHistory(departmentId, kpi.id);
      if (history.length > 0) {
        const trendEntries = getKPITrend(departmentId, kpi.id, 10);
        trendData.push(...trendEntries.map(entry => ({
          ...entry,
          kpi: kpi.name?.fr || kpi.name?.en || kpi.id,
          target: kpi.target
        })));

        const latest = history[0];
        categoryData.push({
          name: kpi.name?.fr || kpi.name?.en || kpi.id,
          value: latest.value,
          target: kpi.target,
          progress: kpi.target !== 0 ? (latest.value / kpi.target) * 100 : 0
        });
      }
    });

    return { trendData, categoryData };
  };

  const { trendData, categoryData } = useMemo(generateChartData, [
    departmentKPIs, getKPIHistory, getKPITrend, departmentId, kpiData
  ]);

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
          lineStyle: { color: '#059669', width: 3 },
          itemStyle: { color: '#059669' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#05966940' },
                { offset: 1, color: '#05966910' }
              ]
            }
          }
        },
        {
          name: 'Cible',
          type: 'line',
          data: chartData.map(item => item.target),
          lineStyle: { color: '#0D9488', type: 'dashed', width: 2 },
          itemStyle: { color: '#0D9488' },
          symbol: 'none'
        }
      ]
    };

    return (
      <div key={kpi.id} className={`p-6 rounded-xl border ${
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
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

  const stats = getStats();
  const deptName = department?.name?.fr || department?.name?.en || 'Contrôle Qualité';

  React.useEffect(() => {
    console.log('Page Qualité montée. Données localStorage actuelles :', localStorage.getItem('hydrachim_kpi_data'));
    console.log('État kpiData actuel :', kpiData);
    console.log('Résumé du département :', departmentSummary);
  }, [kpiData, departmentSummary]);

  return (
    <div className={`space-y-8 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* KPI Form Modal */}
      {showKPIForm && (
        <>
          {selectedKPI ? (
            <KPIForm
              kpi={selectedKPI}
              departmentId={departmentId}
              onSave={handleSaveKPI}
              onCancel={handleCancelKPI}
            />
          ) : (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-6xl max-h-[90vh]">
                <QualityKPISelector
                  onSelect={(kpi) => setSelectedKPI(kpi)}
                  onCancel={handleCancelKPI}
                  isDark={isDark}
                  departmentKPIs={departmentKPIs}
                />
              </div>
            </div>
          )}
        </>
      )}

      {showReports && reportType === 'weekly' && (
        <QualityWeeklyReportModal 
          analytics={getQualityAnalyticsData()}
          isDark={isDark}
          onClose={() => setShowReports(false)}
        />
      )}

      {showReports && reportType === 'monthly' && (
        <QualityMonthlyReportModal 
          analytics={getQualityAnalyticsData()}
          isDark={isDark}
          onClose={() => setShowReports(false)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {deptName}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Assurance qualité des matières premières et produits finis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => { setReportType('weekly'); setShowReports(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>Rapport Hebdomadaire</span>
          </button>
          
          <button 
            onClick={() => { setReportType('monthly'); setShowReports(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200"
          >
            <Calendar className="w-4 h-4" />
            <span>Rapport Mensuel</span>
          </button>

          <button
            onClick={() => handleAddData()}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Données</span>
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
              stat.color === 'emerald' ? (isDark ? 'from-emerald-500/10 to-teal-500/5' : 'from-emerald-50 to-teal-50/50') :
              stat.color === 'green' ? (isDark ? 'from-green-500/10 to-emerald-500/5' : 'from-green-50 to-emerald-50/50') :
              stat.color === 'red' ? (isDark ? 'from-red-500/10 to-pink-500/5' : 'from-red-50 to-pink-50/50') :
              (isDark ? 'from-slate-500/10 to-slate-600/5' : 'from-slate-50 to-slate-100/50')
            } opacity-50`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  stat.color === 'emerald' ? 'from-emerald-600 to-teal-600' :
                  stat.color === 'green' ? 'from-green-600 to-emerald-600' :
                  stat.color === 'red' ? 'from-red-600 to-pink-600' :
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
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'red' ? 'text-red-600' :
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

      {/* KPI Cards Section */}
      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Indicateurs Clés de Performance
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {departmentSummary?.kpis?.filter(kpi => kpi.latestValue).length || 0} / {departmentSummary?.kpis?.length || 0} configurés • Cliquez sur une carte pour ajouter rapidement des données
            </p>
          </div>
          <button
            onClick={() => handleAddData()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 text-sm font-medium shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Sélectionner l'Indicateur</span>
          </button>
        </div>

        {departmentSummary?.kpis && departmentSummary.kpis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {departmentSummary.kpis.map((kpi) => {
              const getStatusColor = (status) => {
                switch (status) {
                  case 'excellent': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
                  case 'good': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
                  case 'fair': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
                  case 'needs-attention': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
                  default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
                }
              };

              const getProgress = () => {
                if (!kpi.latestValue || !kpi.target || kpi.target === 0) return 0;
                return Math.min(100, (kpi.latestValue.value / kpi.target) * 100);
              };

              const progress = getProgress();
              const kpiName = kpi.name?.fr || kpi.name?.en || kpi.id;
              const statusText = kpiStatusDisplayFr[kpi.status] || (kpi.status ? kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1) : 'Indéfini');

              // Function to get appropriate icon for each KPI
              const getKPIIcon = (kpiId, kpiName) => {
                const name = (kpiName || kpiId).toLowerCase();
                
                if (name.includes('conformité') || name.includes('compliance')) {
                  return Award;
                } else if (name.includes('défaut') || name.includes('defect') || name.includes('erreur')) {
                  return AlertTriangle;
                } else if (name.includes('test') || name.includes('contrôle') || name.includes('control')) {
                  return Activity;
                } else if (name.includes('pureté') || name.includes('purity') || name.includes('qualité') || name.includes('quality')) {
                  return Sparkles;
                } else if (name.includes('certification') || name.includes('audit')) {
                  return CheckCircle;
                } else if (name.includes('produit') || name.includes('product') || name.includes('matière')) {
                  return Package;
                } else if (name.includes('mesure') || name.includes('measure') || name.includes('température') || name.includes('ph')) {
                  return Gauge;
                } else if (name.includes('temps') || name.includes('time') || name.includes('délai')) {
                  return Clock;
                } else if (name.includes('performance') || name.includes('efficacité')) {
                  return TrendingUp;
                } else {
                  return ShieldCheck; // Default fallback
                }
              };

              const KPIIcon = getKPIIcon(kpi.id, kpiName);

              return (
                <div
                  key={kpi.id}
                  onClick={() => handleAddData(kpi)}
                  className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    isDark ? 'bg-slate-800/60 border-slate-700/50 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                      <KPIIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                        {statusText}
                      </div>
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'text-emerald-400' : 'text-emerald-500'
                      }`}>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {kpiName}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Cible : {kpi.target}{kpi.unit}
                    </p>
                  </div>

                  {kpi.latestValue ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {kpi.latestValue.value}{kpi.unit}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress >= 90 ? 'bg-emerald-500' :
                            progress >= 70 ? 'bg-emerald-500' :
                            progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      {kpi.latestValue.notes && (
                        <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          "{kpi.latestValue.notes}"
                        </p>
                      )}

                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {new Date(kpi.latestValue.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className={`w-12 h-12 rounded-xl ${
                        isDark ? 'bg-slate-700 group-hover:bg-emerald-900/30' : 'bg-slate-100 group-hover:bg-emerald-50'
                      } flex items-center justify-center mx-auto mb-3 transition-all`}>
                        <Plus className={`w-6 h-6 ${
                          isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'
                        } transition-colors`} />
                      </div>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-slate-300 group-hover:text-emerald-300' : 'text-slate-600 group-hover:text-emerald-600'
                      } transition-colors`}>
                        Cliquez pour ajouter des données
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-emerald-50'} flex items-center justify-center mx-auto mb-4`}>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Prêt à Démarrer le Contrôle Qualité
            </h4>
            <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Commencez à ajouter des données d'indicateurs pour votre contrôle qualité afin de suivre les normes et la conformité
            </p>
            <button
              onClick={() => handleAddData()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Ajouter le Premier Indicateur
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      {departmentKPIs.some(kpi => getKPIHistory(departmentId, kpi.id).length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Analyse de Performance par Indicateur
            </h3>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <BarChart3 className="w-4 h-4" />
              <span>Évolution individuelle des indicateurs</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {departmentKPIs.map(kpi => renderKPIChart(kpi)).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Traditional Charts if needed */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartDisplay
            data={trendData}
            title={'Analyse des Tendances des Indicateurs'}
            height={300}
            dataKey="value"
            xAxisKey="date"
            color="#059669"
            className={isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80'}
          />
          <ChartDisplay
            data={categoryData}
            title={'Performance des Indicateurs vs Cible'}
            type="bar"
            height={300}
            dataKey="progress"
            xAxisKey="name"
            color="#0D9488"
            className={isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80'}
          />
        </div>
      )}
    </div>
  );
};