import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Package,
  Trash2,
  List,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const QualityWeeklyReport = ({ analytics, isDark, onClose }) => {
  const [selectedView, setSelectedView] = useState('overview');

  const weeklyData = useMemo(() => {
    if (!analytics) return null;

    const currentWeek = new Date();
    const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    // Get week data for each KPI
    const reception = analytics.material_batch_acceptance_rate?.filter(entry => 
      new Date(entry.date) >= weekStart && new Date(entry.date) <= weekEnd
    ) || [];
    
    const waste = analytics.production_waste_rate?.filter(entry => 
      new Date(entry.date) >= weekStart && new Date(entry.date) <= weekEnd
    ) || [];
    
    const inventory = analytics.raw_materials_inventory_list?.filter(entry => 
      new Date(entry.date) >= weekStart && new Date(entry.date) <= weekEnd
    ) || [];

    // Calculate comprehensive statistics
    const receptionStats = {
      average: reception.length > 0 ? 
        Math.round(reception.reduce((sum, entry) => sum + entry.value, 0) / reception.length) : 0,
      entries: reception.length,
      totalReceptions: reception.reduce((sum, entry) => sum + (entry.data?.stats?.total || 0), 0),
      conformeReceptions: reception.reduce((sum, entry) => sum + (entry.data?.stats?.conforme || 0), 0),
      nonConformeReceptions: reception.reduce((sum, entry) => sum + (entry.data?.stats?.nonConforme || 0), 0),
    };

    const wasteStats = {
      average: waste.length > 0 ? 
        Math.round(waste.reduce((sum, entry) => sum + entry.value, 0) / waste.length) : 0,
      entries: waste.length,
      totalWasted: waste.reduce((sum, entry) => sum + (entry.data?.stats?.totalGaspille || 0), 0),
      objectives: waste.map(entry => entry.data?.monthlyTarget || 0),
    };

    const inventoryStats = {
      average: inventory.length > 0 ? 
        Math.round(inventory.reduce((sum, entry) => sum + entry.value, 0) / inventory.length) : 0,
      entries: inventory.length,
      totalTests: inventory.reduce((sum, entry) => sum + (entry.data?.stats?.total || 0), 0),
      successfulTests: inventory.reduce((sum, entry) => sum + (entry.data?.stats?.reussis || 0), 0),
      failedTests: inventory.reduce((sum, entry) => sum + (entry.data?.stats?.echoues || 0), 0),
    };

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      reception: receptionStats,
      waste: wasteStats,
      inventory: inventoryStats,
      overallPerformance: Math.round((receptionStats.average + wasteStats.average + inventoryStats.average) / 3),
      hasData: reception.length > 0 || waste.length > 0 || inventory.length > 0
    };
  }, [analytics]);

  // Modern chart component using CSS and divs instead of heavy charting library
  const ModernProgressChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.value), ...data.map(item => item.target));
    
    return (
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h4 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h4>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {item.name}
                </span>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.value}%
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Cible: {item.target}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className={`w-full h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      item.value >= item.target ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      item.value >= item.target * 0.8 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      item.value >= item.target * 0.6 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
                  />
                </div>
                <div
                  className="absolute top-0 w-1 h-3 bg-slate-400 rounded-full"
                  style={{ left: `${Math.min((item.target / maxValue) * 100, 100)}%` }}
                  title={`Cible: ${item.target}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modern radial progress for overall performance
  const RadialProgress = ({ value, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? '#374151' : '#E5E7EB'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={value >= 90 ? '#10B981' : value >= 70 ? '#3B82F6' : value >= 50 ? '#F59E0B' : '#EF4444'}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {value}%
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Performance
            </div>
          </div>
        </div>
      </div>
    );
  };

  const downloadReport = (format) => {
    const data = {
      période: `Semaine du ${new Date(weeklyData.weekStart).toLocaleDateString('fr-FR')} au ${new Date(weeklyData.weekEnd).toLocaleDateString('fr-FR')}`,
      performance_globale: `${weeklyData.overallPerformance}%`,
      réception_matières: {
        moyenne: `${weeklyData.reception.average}%`,
        total_réceptions: weeklyData.reception.totalReceptions,
        conformes: weeklyData.reception.conformeReceptions,
        non_conformes: weeklyData.reception.nonConformeReceptions
      },
      contrôle_gaspillage: {
        moyenne: `${weeklyData.waste.average}%`,
        total_gaspillé: weeklyData.waste.totalWasted,
        entrées: weeklyData.waste.entries
      },
      qualité_inventaire: {
        moyenne: `${weeklyData.inventory.average}%`,
        total_tests: weeklyData.inventory.totalTests,
        réussis: weeklyData.inventory.successfulTests,
        échoués: weeklyData.inventory.failedTests
      }
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_qualite_hebdomadaire_${weeklyData.weekStart}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csv = Object.entries(data).map(([key, value]) => 
        typeof value === 'object' ? 
          Object.entries(value).map(([k, v]) => `${key}_${k},${v}`).join('\n') :
          `${key},${value}`
      ).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_qualite_hebdomadaire_${weeklyData.weekStart}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!weeklyData?.hasData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className={`w-full max-w-lg p-8 rounded-2xl shadow-xl ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <Calendar className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Aucune donnée cette semaine
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Aucune donnée de qualité trouvée pour cette semaine.
            </p>
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
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
      <div className={`w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
        isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapport Qualité Hebdomadaire
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Du {new Date(weeklyData.weekStart).toLocaleDateString('fr-FR')} au {new Date(weeklyData.weekEnd).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'overview' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setSelectedView('details')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedView === 'details' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Détails
                </button>
              </div>
              
              <button 
                onClick={onClose} 
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-8 space-y-8">
            
            {selectedView === 'overview' && (
              <>
                {/* Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className={`lg:col-span-1 p-6 rounded-2xl border text-center ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Performance Globale
                    </h3>
                    <RadialProgress value={weeklyData.overallPerformance} />
                    <div className={`mt-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Moyenne des 3 indicateurs
                    </div>
                  </div>
                  
                  <div className="lg:col-span-3">
                    <ModernProgressChart 
                      title="Performance par Indicateur"
                      data={[
                        { name: 'Réception Matières', value: weeklyData.reception.average, target: 90 },
                        { name: 'Contrôle Gaspillage', value: weeklyData.waste.average, target: 80 },
                        { name: 'Qualité Inventaire', value: weeklyData.inventory.average, target: 95 }
                      ]}
                    />
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Réception Matières
                        </h4>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {weeklyData.reception.average}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total réceptions</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {weeklyData.reception.totalReceptions}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Conformes</span>
                        <span className="font-medium text-emerald-600">{weeklyData.reception.conformeReceptions}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg">
                        <Trash2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Contrôle Gaspillage
                        </h4>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {weeklyData.waste.average}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total gaspillé</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {weeklyData.waste.totalWasted}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Entrées</span>
                        <span className="font-medium text-blue-600">{weeklyData.waste.entries}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                        <List className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Qualité Inventaire
                        </h4>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {weeklyData.inventory.average}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tests totaux</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {weeklyData.inventory.totalTests}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Réussis</span>
                        <span className="font-medium text-emerald-600">{weeklyData.inventory.successfulTests}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedView === 'details' && (
              <div className="space-y-8">
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-800/30 border-slate-600' : 'bg-blue-50/50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Analyse Détaillée des Performances
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Points Forts
                      </h4>
                      <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {weeklyData.reception.average >= 85 && <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Excellente réception matières</span></li>}
                        {weeklyData.waste.average >= 75 && <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Contrôle gaspillage efficace</span></li>}
                        {weeklyData.inventory.average >= 90 && <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Qualité inventaire optimale</span></li>}
                        {weeklyData.overallPerformance >= 80 && <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Performance globale satisfaisante</span></li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Points d'Attention
                      </h4>
                      <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {weeklyData.reception.average < 85 && <li className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span>Réception matières à améliorer</span></li>}
                        {weeklyData.waste.average < 75 && <li className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span>Gaspillage à réduire</span></li>}
                        {weeklyData.inventory.average < 90 && <li className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span>Qualité inventaire perfectible</span></li>}
                        {weeklyData.overallPerformance < 80 && <li className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-red-500" /><span>Performance globale insuffisante</span></li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Actions Recommandées
                      </h4>
                      <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <li>• Renforcer les contrôles qualité</li>
                        <li>• Optimiser les processus</li>
                        <li>• Formation équipes</li>
                        <li>• Surveillance continue</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-800/30 border-slate-600' : 'bg-blue-50/50 border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Exporter le Rapport
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => downloadReport('json')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => downloadReport('csv')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityWeeklyReport;