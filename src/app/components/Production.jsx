import React, { useContext, useState, useMemo } from 'react';
import {
  Factory,
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
  Cog,
  Zap,
  Activity,
  Eye,
  Calendar,
  FileText,
  Package,
  Gauge,
  Settings,
  Bolt,
  Timer,
  Award
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { useKPIData } from '../hook/useKPIData';
import { KPIForm } from '../components/KPIForm';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';
import ReactECharts from 'echarts-for-react';
import EnergyConsumptionTracker from './production/EnergyConsumptionTracker';

// French display names for KPI statuses
const kpiStatusDisplayFr = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Passable',
  'needs-attention': 'Attention Requise',
  'no-data': 'Aucune Donnée'
};

// Weekly Report Modal for Production
const ProductionWeeklyReportModal = ({ analytics, isDark, onClose }) => {
  const weeklyData = useMemo(() => {
    if (!analytics) return null;

    const currentWeek = new Date();
    const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
    
    const productionData = analytics.production || [];

    const weekProduction = productionData.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    const avgProduction = weekProduction.length > 0 
      ? Math.round(weekProduction.reduce((sum, entry) => sum + entry.value, 0) / weekProduction.length)
      : 0;

    const totalOutput = weekProduction.reduce((sum, entry) => sum + (entry.output || 0), 0);
    const totalEfficiency = weekProduction.reduce((sum, entry) => sum + (entry.efficiency || 0), 0) / weekProduction.length || 0;

    return {
      weekNumber: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      avgProduction,
      totalOutput,
      avgEfficiency: Math.round(totalEfficiency),
      weekProduction
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
              Aucune donnée de production trouvée pour cette semaine.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Hebdomadaire Production - Semaine {weeklyData.weekNumber}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse complète des performances de production
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Factory className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Production Moyenne
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgProduction}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {weeklyData.totalOutput} unités produites
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Efficacité
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.avgEfficiency}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  performance globale
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Activité de Production
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyData.weekProduction.length}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  sessions cette semaine
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
                  {[weeklyData.avgProduction >= 85, weeklyData.avgEfficiency >= 80].filter(Boolean).length}/2
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  sur 2 KPIs
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-orange-50/50 border-slate-200'
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
                    {weeklyData.avgProduction >= 85 && <li>• Excellente production</li>}
                    {weeklyData.avgEfficiency >= 80 && <li>• Efficacité optimale</li>}
                    {weeklyData.totalOutput > 0 && <li>• Objectifs de production atteints</li>}
                    {weeklyData.weekProduction.length > 0 && <li>• Activité régulière</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Points d'Attention
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {weeklyData.avgProduction < 70 && <li>• Production à améliorer</li>}
                    {weeklyData.avgEfficiency < 65 && <li>• Efficacité à optimiser</li>}
                    {weeklyData.totalOutput === 0 && <li>• Aucune production</li>}
                    {weeklyData.weekProduction.length === 0 && <li>• Aucune activité</li>}
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Actions Recommandées
                  </h4>
                  <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li>• Optimiser les processus</li>
                    <li>• Maintenir la qualité</li>
                    <li>• Surveiller l'efficacité</li>
                    <li>• Planifier la maintenance</li>
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

// Monthly Report Modal for Production
const ProductionMonthlyReportModal = ({ analytics, isDark, onClose }) => {
  const monthlyData = useMemo(() => {
    if (!analytics) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthData = {
      production: (analytics.production || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
    };

    const avgProduction = monthData.production.length > 0 
      ? Math.round(monthData.production.reduce((sum, entry) => sum + entry.value, 0) / monthData.production.length)
      : 0;

    return {
      monthName: new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      avgProduction,
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
              Aucune donnée de production trouvée pour ce mois.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Mensuel Production - {monthlyData.monthName}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyse mensuelle complète des performances de production
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
              <div className="max-w-sm mx-auto">
                <div className={`p-8 rounded-xl border ${
                  isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Production Moyenne
                  </h4>
                  <div className={`text-4xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    {monthlyData.avgProduction}%
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

// Enhanced Production KPI Selector Component
const ProductionKPISelector = ({ onSelect, onCancel, isDark, departmentKPIs }) => {
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
    <div className={`rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
    }`}>

      {/* Header */}
      <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sélectionner un Indicateur de Production
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Choisissez l'indicateur de production à mettre à jour
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`p-2.5 rounded-lg hover:bg-opacity-10 transition-colors ${
              isDark ? 'hover:bg-white text-slate-400' : 'hover:bg-black text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left Panel - KPI List */}
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
                      className={`w-full p-6 rounded-xl border text-left transition-all duration-200 ${
                        selectedKPI === kpi.id
                          ? isDark
                            ? 'border-orange-500 bg-orange-900/20'
                            : 'border-orange-500 bg-orange-50'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium ${
                            selectedKPI === kpi.id
                              ? 'bg-orange-600 text-white border-orange-600'
                              : isDark
                                ? 'bg-slate-700 text-slate-300 border-slate-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-semibold mb-2 ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-orange-300' : 'text-orange-700'
                                : isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {kpi.name?.fr || kpi.name?.en || kpi.id}
                            </h4>
                            <p className={`text-sm mb-3 leading-relaxed ${
                              selectedKPI === kpi.id
                                ? isDark ? 'text-orange-400' : 'text-orange-600'
                                : isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {kpi.description?.fr || kpi.description?.en || ''}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                Cible : {kpi.target}{kpi.unit}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedKPI === kpi.id
                                  ? isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {kpi.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedKPI === kpi.id && (
                          <CheckCircle2 className="w-6 h-6 text-orange-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-6`}>
                  <Factory className={`w-10 h-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Aucun Indicateur Configuré
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Configurez les indicateurs de production pour commencer le suivi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Selected KPI Details */}
        <div className="flex-1 p-8">
          <div className="h-full">
            {selectedKPIData ? (
              <div className="space-y-8">
                <div>
                  <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Indicateur Sélectionné
                  </h4>
                  <div className={`p-6 rounded-xl border ${
                    isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
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
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                          }`}>
                            🎯 Cible : {selectedKPIData.target}{selectedKPIData.unit}
                          </span>
                          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                          }`}>
                            📊 Type : {selectedKPIData.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border ${
                  isDark ? 'border-slate-600 bg-orange-900/20' : 'border-orange-200 bg-orange-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Prêt à mettre à jour
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cliquez sur continuer pour saisir de nouvelles données pour cet indicateur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-6`}>
                    <Target className={`w-12 h-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
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

      {/* Footer */}
      <div className={`px-8 py-6 border-t ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Annuler
          </button>

          {selectedKPI && (
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Production Page Component
export const ProductionPage = () => {
  const { isDark } = useContext(AppContext);

  const [showKPIForm, setShowKPIForm] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const [showReportsMenu, setShowReportsMenu] = useState(false);

  const {
    kpiData,
    updateKPIValue,
    getKPIHistory,
    getDepartmentSummary,
    getKPITrend,
    getProductionAnalytics,
    getLatestKPIValue,
    isLoading
  } = useKPIData();

  const departmentId = 'production';
  const department = kpiDefinitions[departmentId];
  // Filter out the removed batch_yield KPI
  const departmentKPIs = (department?.kpis || []).filter(kpi => kpi.id !== 'batch_yield');

  const getProductionAnalyticsData = () => {
    return getProductionAnalytics && getProductionAnalytics(departmentId);
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
    // Calculate stats based on the updated KPI structure (excluding batch_yield)
    const kpisWithData = departmentKPIs.filter(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      return latestValue !== null;
    });

    const excellentKpis = departmentKPIs.filter(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      if (!latestValue) return false;
      
      // For energy consumption, special handling
      if (kpi.id === 'energy_consumption') {
        return latestValue.value >= 95; // KPI value of 95% or higher is excellent
      }
      
      // For mixing time, lower is better
      if (kpi.id === 'mixing_time') {
        return latestValue.value <= kpi.target;
      }
      
      // For standard KPIs, use standard logic
      return latestValue.value >= kpi.target;
    });

    const needsAttentionKpis = departmentKPIs.filter(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      if (!latestValue) return false;
      
      if (kpi.id === 'energy_consumption') {
        return latestValue.value < 80; // KPI value below 80% needs attention
      }
      
      if (kpi.id === 'mixing_time') {
        const tolerance = kpi.target * 0.2;
        return latestValue.value > (kpi.target + tolerance);
      }
      
      const tolerance = kpi.target * 0.2;
      return latestValue.value < (kpi.target - tolerance);
    });

    // Calculate overall efficiency
    let efficiency = 0;
    if (kpisWithData.length > 0) {
      const excellentCount = excellentKpis.length;
      const goodCount = kpisWithData.length - excellentKpis.length - needsAttentionKpis.length;
      const needsAttentionCount = needsAttentionKpis.length;
      
      const totalScore = (excellentCount * 100) + (goodCount * 80) + (needsAttentionCount * 40);
      efficiency = Math.round(totalScore / (kpisWithData.length * 100) * 100);
    }

    return [
      {
        title: 'Indicateurs Suivis',
        value: `${kpisWithData.length}/${departmentKPIs.length}`,
        change: kpisWithData.length,
        changeText: 'actifs',
        icon: Target,
        color: 'orange'
      },
      {
        title: 'Performance Globale',
        value: `${efficiency}%`,
        change: efficiency,
        changeText: 'efficacité',
        icon: TrendingUp,
        color: 'violet'
      },
      {
        title: 'Excellent',
        value: excellentKpis.length.toString(),
        change: excellentKpis.length,
        changeText: 'indicateurs',
        icon: CheckCircle,
        color: 'emerald'
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
        let progress;
        
        // Special handling for energy consumption KPI
        if (kpi.id === 'energy_consumption') {
          progress = latest.value; // KPI value is already a percentage
        } else if (kpi.id === 'mixing_time') {
          // For mixing time, calculate how good it is (reverse logic)
          progress = kpi.target !== 0 ? Math.max(0, 100 - ((latest.value - kpi.target) / kpi.target) * 100) : 0;
        } else {
          progress = kpi.target !== 0 ? (latest.value / kpi.target) * 100 : 0;
        }
        
        categoryData.push({
          name: kpi.name?.fr || kpi.name?.en || kpi.id,
          value: latest.value,
          target: kpi.target,
          progress: progress
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
          lineStyle: { color: '#EA580C', width: 3 },
          itemStyle: { color: '#EA580C' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#EA580C40' },
                { offset: 1, color: '#EA580C10' }
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
        isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
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
  const deptName = department?.name?.fr || department?.name?.en || 'Production & Mélange';

  React.useEffect(() => {
    console.log('Page Production montée. Données localStorage actuelles :', localStorage.getItem('hydrachim_kpi_data'));
    console.log('État kpiData actuel :', kpiData);
    console.log('KPIs configurés :', departmentKPIs);
  }, [kpiData, departmentKPIs]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* KPI Form Modal */}
        {showKPIForm && (
          <>
            {selectedKPI && selectedKPI.id === 'energy_consumption' ? (
              <EnergyConsumptionTracker
                onSave={handleSaveKPI}
                onCancel={handleCancelKPI}
                existingData={getLatestKPIValue(departmentId, selectedKPI.id)?.data}
                isDark={isDark}
              />
            ) : selectedKPI ? (
              <KPIForm
                kpi={selectedKPI}
                departmentId={departmentId}
                onSave={handleSaveKPI}
                onCancel={handleCancelKPI}
              />
            ) : (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                <div className="w-full max-w-6xl max-h-[90vh]">
                  <ProductionKPISelector
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
          <ProductionWeeklyReportModal 
            analytics={getProductionAnalyticsData()}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}

        {showReports && reportType === 'monthly' && (
          <ProductionMonthlyReportModal 
            analytics={getProductionAnalyticsData()}
            isDark={isDark}
            onClose={() => setShowReports(false)}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {deptName}
              </h1>
              <p className={`text-base mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Efficacité énergétique, temps de mélange optimisés et performance industrielle avec monitoring intelligent
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
                      ? 'border-orange-500 bg-orange-900/20 text-orange-300 shadow-orange-500/20' 
                      : 'border-orange-500 bg-orange-50 text-orange-700 shadow-orange-500/20'
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
                    Rapports de Production
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Analyses et synthèses des performances de production
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
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

            {/* Primary Action Button */}
            <button
              onClick={() => handleAddData()}
              className="flex items-center space-x-2.5 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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
              className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all ${
                  stat.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-red-700' :
                  stat.color === 'violet' ? 'bg-gradient-to-br from-violet-600 to-purple-700' :
                  stat.color === 'emerald' ? 'bg-gradient-to-br from-emerald-600 to-green-700' :
                  stat.color === 'red' ? 'bg-gradient-to-br from-red-600 to-rose-700' :
                  'bg-slate-600'
                }`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`p-1 rounded-lg transition-all ${
                  stat.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300' :
                  stat.color === 'violet' ? 'bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-300' :
                  stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300' :
                  'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
                }`}>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mb-3 ${
                  stat.color === 'orange' ? 'text-orange-600' :
                  stat.color === 'violet' ? 'text-violet-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    stat.color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
                    stat.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
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
                {departmentKPIs.filter(kpi => getLatestKPIValue(departmentId, kpi.id)).length || 0} / {departmentKPIs.length || 0} configurés • Optimisation énergétique et processus de production
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Interface optimisée</span>
              </div>
            </div>
          </div>

          {departmentKPIs && departmentKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {departmentKPIs.map((kpi) => {
                const latestValue = getLatestKPIValue(departmentId, kpi.id);
                
                const getKPIStatus = (kpi, latestValue) => {
                  if (!latestValue) return 'no-data';
                  
                  if (kpi.id === 'energy_consumption') {
                    const value = latestValue.value;
                    if (value >= 95) return 'excellent';
                    if (value >= 80) return 'good';
                    if (value >= 60) return 'fair';
                    return 'needs-attention';
                  }
                  
                  if (kpi.id === 'mixing_time') {
                    const tolerance = kpi.target * 0.1;
                    if (latestValue.value <= kpi.target) return 'excellent';
                    if (latestValue.value <= kpi.target + tolerance) return 'good';
                    return 'needs-attention';
                  }
                  
                  const tolerance = kpi.target * 0.1;
                  if (latestValue.value >= kpi.target) return 'excellent';
                  if (latestValue.value >= kpi.target - tolerance) return 'good';
                  return 'needs-attention';
                };

                const status = getKPIStatus(kpi, latestValue);

                const getStatusColor = (status) => {
                  switch (status) {
                    case 'excellent': return 'text-emerald-800 bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700';
                    case 'good': return 'text-orange-800 bg-orange-200 dark:bg-orange-800 dark:text-orange-100 border border-orange-300 dark:border-orange-700';
                    case 'fair': return 'text-amber-800 bg-amber-200 dark:bg-amber-800 dark:text-amber-100 border border-amber-300 dark:border-amber-700';
                    case 'needs-attention': return 'text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700';
                    default: return 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
                  }
                };

                const getProgress = () => {
                  if (!latestValue || !kpi.target || kpi.target === 0) return 0;
                  
                  // For energy consumption, use direct percentage
                  if (kpi.id === 'energy_consumption') {
                    return latestValue.value;
                  }
                  
                  // For mixing time, reverse logic (lower is better)
                  if (kpi.id === 'mixing_time') {
                    return Math.max(0, 100 - ((latestValue.value - kpi.target) / kpi.target) * 100);
                  }
                  
                  return Math.min(100, (latestValue.value / kpi.target) * 100);
                };

                const progress = getProgress();
                const kpiName = kpi.name?.fr || kpi.name?.en || kpi.id;
                const statusText = kpiStatusDisplayFr[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Indéfini');

                // Function to get appropriate icon for each KPI
                const getKPIIcon = (kpiId, kpiName) => {
                  if (kpiId === 'energy_consumption') {
                    return Zap;
                  } else if (kpiId === 'mixing_time') {
                    return Timer;
                  } else {
                    return Factory; // Default fallback
                  }
                };

                const KPIIcon = getKPIIcon(kpi.id, kpiName);

                return (
                  <div
                    key={kpi.id}
                    onClick={() => handleAddData(kpi)}
                    className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isDark ? 'bg-slate-800/80 border-slate-700 hover:border-orange-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-orange-400/50 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <KPIIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {statusText}
                        </div>
                        <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 ${
                          isDark ? 'text-orange-400' : 'text-orange-600'
                        }`}>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className={`text-base font-bold mb-2 group-hover:text-orange-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {kpiName}
                      </h4>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cible : {kpi.target}{kpi.unit}
                      </p>
                    </div>

                    {latestValue ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {latestValue.value}{kpi.unit}
                          </span>
                          <div className="text-right">
                            <div className={`text-xs font-semibold ${
                              progress >= 100 ? 'text-emerald-600' :
                              progress >= 80 ? 'text-orange-600' :
                              progress >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {progress.toFixed(0)}% performance
                            </div>
                          </div>
                        </div>

                        <div className={`w-full rounded-full h-2 shadow-inner ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                              progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              progress >= 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                              progress >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        {latestValue.notes && (
                          <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            "{latestValue.notes}"
                          </p>
                        )}

                        <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {new Date(latestValue.date).toLocaleDateString('fr-FR', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className={`w-12 h-12 rounded-xl ${
                          isDark ? 'bg-slate-700 group-hover:bg-orange-900/30' : 'bg-slate-100 group-hover:bg-orange-100'
                        } flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                          <Plus className={`w-6 h-6 ${
                            isDark ? 'text-slate-300 group-hover:text-orange-400' : 'text-slate-700 group-hover:text-orange-500'
                          } transition-all duration-300`} />
                        </div>
                        <p className={`text-sm font-semibold mb-1 ${
                          isDark ? 'text-slate-200 group-hover:text-orange-300' : 'text-slate-800 group-hover:text-orange-600'
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
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className={`w-24 h-24 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                <Factory className="w-12 h-12 text-orange-600" />
              </div>
              <h4 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Prêt à Démarrer la Production
              </h4>
              <p className={`text-lg mb-10 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Commencez à ajouter des données d'indicateurs pour votre production afin de suivre l'efficacité énergétique et l'optimisation des processus
              </p>
              <button
                onClick={() => handleAddData()}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Ajouter le Premier Indicateur
              </button>
            </div>
          )}
        </div>

        {/* Charts Section */}
        {departmentKPIs.some(kpi => getKPIHistory(departmentId, kpi.id).length > 0) && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Analyse de Performance par Indicateur
              </h3>
              <div className="flex items-center space-x-2 text-sm">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Évolution temporelle des indicateurs</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {departmentKPIs.map(kpi => renderKPIChart(kpi)).filter(Boolean)}
            </div>
          </div>
        )}

        {/* Traditional Charts if needed */}
        {trendData.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ChartDisplay
              data={trendData}
              title={'Analyse des Tendances des Indicateurs'}
              height={300}
              dataKey="value"
              xAxisKey="date"
              color="#EA580C"
              className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
            />
            <ChartDisplay
              data={categoryData}
              title={'Performance des Indicateurs vs Cible'}
              type="bar"
              height={300}
              dataKey="progress"
              xAxisKey="name"
              color="#DC2626"
              className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
            />
          </div>
        )}
      </div>
    </div>
  );
};