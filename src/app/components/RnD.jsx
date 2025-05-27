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
  Save
} from 'lucide-react';
import { kpiDefinitions } from '../utils/kpiDefinitions';
import { translations } from '../utils/translations';
import { useKPIData } from '../hook/useKPIData';
import { KPICard } from '../components/KPICard';
import { KPIForm } from '../components/KPIForm';
import { ChartDisplay } from '../components/ChartDisplay';
import { AppContext } from '../context/AppContext';

// Improved R&D KPI Selector Component
const RnDKPISelector = ({ onSelect, onCancel, isDark, departmentKPIs }) => {
  const { language } = useContext(AppContext);
  const t = translations[language];
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
    <div className={`rounded-lg border shadow-xl max-h-[85vh] overflow-y-auto ${
      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <FlaskConical className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.selectRndKpi || 'Select R&D KPI'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.selectRndKpiDescription || 'Choose the R&D KPI to update'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[400px]">
        {/* Left Side - KPI List */}
        <div className={`flex-1 p-6 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="space-y-4">
            
            {departmentKPIs.length > 0 ? (
              <div className="space-y-3">
                <h4 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Available KPIs ({departmentKPIs.length})
                </h4>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {departmentKPIs.map((kpi, index) => (
                    <button
                      key={kpi.id}
                      onClick={() => setSelectedKPI(kpi.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedKPI === kpi.id
                          ? isDark 
                            ? 'border-blue-500 bg-blue-950/20' 
                            : 'border-blue-500 bg-blue-50'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-medium ${
                            selectedKPI === kpi.id
                              ? 'bg-blue-500 text-white border-blue-500'
                              : isDark
                                ? 'bg-slate-700 text-slate-300 border-slate-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium mb-1 ${
                              selectedKPI === kpi.id 
                                ? isDark ? 'text-blue-300' : 'text-blue-700'
                                : isDark ? 'text-slate-200' : 'text-slate-900'
                            }`}>
                              {kpi.name?.[language] || kpi.name?.en}
                            </h4>
                            <p className={`text-xs mb-2 ${
                              selectedKPI === kpi.id 
                                ? isDark ? 'text-blue-400' : 'text-blue-600'
                                : isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {kpi.description?.[language] || kpi.description?.en}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              selectedKPI === kpi.id
                                ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              Target: {kpi.target}{kpi.unit}
                            </span>
                          </div>
                        </div>
                        {selectedKPI === kpi.id && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
                  <FlaskConical className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
                <p className={`text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.noRndKpisConfigured || 'No R&D KPIs configured'}
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Configure KPIs to start tracking
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Selected KPI Details */}
        <div className="flex-1 p-6">
          <div className="h-full">
            {selectedKPIData ? (
              <div className="space-y-6">
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Selected KPI
                  </h4>
                  <div className={`p-5 rounded-lg border ${
                    isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}>
                        <Target className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {selectedKPIData.name?.[language] || selectedKPIData.name?.en}
                        </h5>
                        <p className={`text-sm mb-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedKPIData.description?.[language] || selectedKPIData.description?.en}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded text-sm ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            Target: {selectedKPIData.target}{selectedKPIData.unit}
                          </span>
                          <span className={`px-3 py-1 rounded text-sm ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            Type: {selectedKPIData.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  isDark ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <div>
                      <h5 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Ready to update
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Click continue to start entering new data for this KPI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
                    <Target className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                  <h4 className={`text-lg font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Select a KPI
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Choose a KPI from the list to see details and continue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.cancel}
          </button>
          
          {selectedKPI && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t.continue || 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main R&D Page Component
export const RnDPage = () => {
  const { isDark, language } = useContext(AppContext);
  const t = translations[language];
  
  // UI State
  const [showKPIForm, setShowKPIForm] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  
  // KPI Data Hook with proper state management
  const {
    kpiData,
    updateKPIValue,
    getLatestKPIValue,
    getKPIHistory,
    getKPIStatus,
    getDepartmentSummary,
    getKPITrend,
    isLoading
  } = useKPIData();
  
  // Department configuration
  const departmentId = 'rnd';
  const department = kpiDefinitions[departmentId];
  const departmentKPIs = department?.kpis || [];
  
  // Get department summary with live data
  const departmentSummary = useMemo(() => {
    return getDepartmentSummary(departmentId);
  }, [getDepartmentSummary, departmentId, kpiData]); // Depend on kpiData to trigger updates
  
  // Handle KPI operations
  const handleEditKPI = (kpi) => {
    setSelectedKPI(kpi);
    setShowKPIForm(true);
  };

  const handleAddData = (specificKPI = null) => {
    if (specificKPI) {
      setSelectedKPI(specificKPI);
    } else {
      setSelectedKPI(null);
    }
    setShowKPIForm(true);
  };

  const handleSaveKPI = async (departmentId, kpiId, value, notes) => {
    try {
      // Ensure the data is saved to localStorage
      await updateKPIValue(departmentId, kpiId, value, notes);
      
      // Add a small delay to ensure localStorage write completes
      setTimeout(() => {
        console.log('KPI saved successfully:', { departmentId, kpiId, value, notes });
        console.log('Current localStorage data:', localStorage.getItem('hydrachim_kpi_data'));
      }, 100);
      
      setShowKPIForm(false);
      setSelectedKPI(null);
    } catch (error) {
      console.error('Error saving KPI:', error);
      // Show error to user
      alert('Failed to save KPI data. Please try again.');
    }
  };

  const handleCancelKPI = () => {
    setShowKPIForm(false);
    setSelectedKPI(null);
  };

  // Get R&D statistics with real data
  const getStats = () => {
    if (!departmentSummary?.kpis) {
      return [
        { title: t.kpisTracked || 'KPIs Tracked', value: '0/0', change: 0, changeText: 'active', icon: Target, color: 'blue' },
        { title: t.performance || 'Performance', value: '0%', change: 0, changeText: 'efficiency', icon: TrendingUp, color: 'emerald' },
        { title: t.excellent || 'Excellent', value: '0', change: 0, changeText: 'KPIs', icon: CheckCircle, color: 'green' },
        { title: t.needsAttention || 'Attention', value: '0', change: 0, changeText: 'alerts', icon: AlertTriangle, color: 'gray' }
      ];
    }

    const kpisWithData = departmentSummary.kpis.filter(kpi => kpi.latestValue) || [];
    const excellentKpis = kpisWithData.filter(kpi => kpi.status === 'excellent');
    const needsAttentionKpis = kpisWithData.filter(kpi => kpi.status === 'needs-attention');
    
    return [
      {
        title: t.kpisTracked || 'KPIs Tracked',
        value: `${kpisWithData.length}/${departmentSummary.kpis.length}`,
        change: kpisWithData.length,
        changeText: 'active',
        icon: Target,
        color: 'blue'
      },
      {
        title: t.performance || 'Performance',
        value: `${departmentSummary.efficiency || 0}%`,
        change: departmentSummary.efficiency || 0,
        changeText: 'efficiency',
        icon: TrendingUp,
        color: 'emerald'
      },
      {
        title: t.excellent || 'Excellent',
        value: excellentKpis.length.toString(),
        change: excellentKpis.length,
        changeText: 'KPIs',
        icon: CheckCircle,
        color: 'green'
      },
      {
        title: t.needsAttention || 'Attention',
        value: needsAttentionKpis.length.toString(),
        change: needsAttentionKpis.length,
        changeText: 'alerts',
        icon: AlertTriangle,
        color: 'gray'
      }
    ];
  };

  // Generate chart data from KPI history
  const generateChartData = () => {
    const trendData = [];
    const categoryData = [];
    
    if (!departmentKPIs.length) return { trendData, categoryData };
    
    departmentKPIs.forEach(kpi => {
      const history = getKPIHistory(departmentId, kpi.id);
      if (history.length > 0) {
        // Add trend data (last 10 entries, chronological order)
        const trendEntries = getKPITrend(departmentId, kpi.id, 10);
        trendData.push(...trendEntries.map(entry => ({
          ...entry,
          kpi: kpi.name[language] || kpi.name.en,
          target: kpi.target
        })));
        
        // Add category data (latest values vs targets)
        const latest = history[0]; // Latest entry (first in array due to structure)
        categoryData.push({
          name: kpi.name[language] || kpi.name.en,
          value: latest.value,
          target: kpi.target,
          progress: (latest.value / kpi.target) * 100
        });
      }
    });
    
    return { trendData, categoryData };
  };

  const { trendData, categoryData } = useMemo(() => generateChartData(), [
    departmentKPIs, 
    getKPIHistory, 
    getKPITrend, 
    departmentId, 
    language,
    kpiData // Add kpiData as dependency to regenerate when data changes
  ]);

  const stats = getStats();
  const deptName = department?.name?.[language] || department?.name?.en || 'R&D Laboratory';

  // Debug localStorage on component mount
  React.useEffect(() => {
    console.log('RnD Page mounted. Current localStorage data:', localStorage.getItem('hydrachim_kpi_data'));
    console.log('Current kpiData state:', kpiData);
    console.log('Department summary:', departmentSummary);
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
                <RnDKPISelector 
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

      {/* Header Section */}
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
              {t.rndDescription || 'Innovation, efficiency, and quality assurance'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => handleAddData()}
          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addRndData || 'Add R&D Data'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          return (
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
                stat.color === 'green' ? (isDark ? 'from-green-500/10 to-emerald-500/5' : 'from-green-50 to-emerald-50/50') :
                (isDark ? 'from-slate-500/10 to-slate-600/5' : 'from-slate-50 to-slate-100/50')
              } opacity-50`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${
                    stat.color === 'blue' ? 'from-indigo-600 to-purple-600' :
                    stat.color === 'emerald' ? 'from-emerald-600 to-teal-600' :
                    stat.color === 'green' ? 'from-emerald-600 to-green-600' :
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
          );
        })}
      </div>

      {/* KPI Cards Section */}
      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.keyPerformanceIndicators || 'Key Performance Indicators'}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {departmentSummary?.kpis?.filter(kpi => kpi.latestValue).length || 0} / {departmentSummary?.kpis?.length || 0} {t.completed || 'completed'} • Click any card to add data quickly
            </p>
          </div>
          <button 
            onClick={() => handleAddData()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Select KPI</span>
          </button>
        </div>
        
        {departmentSummary?.kpis && departmentSummary.kpis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {departmentSummary.kpis.map((kpi) => {
              const getStatusColor = (status) => {
                switch (status) {
                  case 'excellent': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
                  case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
                  case 'fair': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
                  case 'needs-attention': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
                  default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
                }
              };

              const getProgress = () => {
                if (!kpi.latestValue || !kpi.target) return 0;
                return Math.min(100, (kpi.latestValue.value / kpi.target) * 100);
              };

              const progress = getProgress();
              const kpiName = kpi.name?.[language] || kpi.name?.en;

              return (
                <div
                  key={kpi.id}
                  onClick={() => handleAddData(kpi)}
                  className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    isDark ? 'bg-slate-800/60 border-slate-700/50 hover:border-indigo-500/50' : 'bg-white border-slate-200/80 hover:border-indigo-500/50 shadow-sm'
                  }`}
                >
                  {/* Header with quick action indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                      {kpi.status === 'no-data' ? 'No Data' : kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        isDark 
                          ? 'bg-slate-700 text-slate-300 group-hover:bg-indigo-900/30 group-hover:text-indigo-300' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                      }`}>
                        {kpi.latestValue ? 'Update' : 'Add Data'}
                      </div>
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'text-indigo-400' : 'text-indigo-500'
                      }`}>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* KPI Title and Target */}
                  <div className="mb-4">
                    <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {kpiName}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Target: {kpi.target}{kpi.unit}
                    </p>
                  </div>
                  
                  {/* Current Value or Add Data Prompt */}
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
                            progress >= 70 ? 'bg-blue-500' : 
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
                        Last updated: {new Date(kpi.latestValue.date).toLocaleDateString()}
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
                        Click to add first data point
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'} flex items-center justify-center mx-auto mb-4`}>
              <FlaskConical className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.noDataAvailable_rnd || 'No Data Available'}
            </h4>
            <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.startAddingKpiData || 'Start adding KPI data for your R&D laboratory to track innovation and performance'}
            </p>
            <button 
              onClick={() => handleAddData()}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              {t.addFirstKpi || 'Add First KPI'}
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartDisplay
          data={trendData}
          title={t.trendAnalysis || 'KPI Trend Analysis'}
          height={300}
          dataKey="value"
          xAxisKey="date"
          color="#6366F1"
          className={isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80'}
        />
        <ChartDisplay
          data={categoryData}
          title={t.kpisByCategory || 'KPI Performance vs Target'}
          type="bar"
          height={300}
          dataKey="progress"
          xAxisKey="name"
          color="#10B981"
          className={isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80'}
        />
      </div>
    </div>
  );
};