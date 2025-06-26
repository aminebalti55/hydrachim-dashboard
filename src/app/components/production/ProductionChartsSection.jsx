import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Target,
  Activity,
  Zap,
  Timer,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

const ProductionChartsSection = ({ 
  departmentKPIs, 
  getKPIHistory, 
  getKPITrend, 
  getLatestKPIValue, 
  departmentId, 
  isDark, 
  trendData, 
  categoryData 
}) => {
  const [selectedChart, setSelectedChart] = useState('trends');
  const [timeRange, setTimeRange] = useState('30');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced chart data generation with loading states
  const chartData = useMemo(() => {
    if (!departmentKPIs || departmentKPIs.length === 0) {
      return {
        trends: [],
        performance: [],
        distribution: [],
        hasData: false
      };
    }

    const trends = [];
    const performance = [];
    const distribution = [];

    departmentKPIs.forEach(kpi => {
      const history = getKPIHistory(departmentId, kpi.id);
      const latest = getLatestKPIValue(departmentId, kpi.id);
      
      if (history && history.length > 0) {
        // Trend data for line charts
        const kpiTrends = getKPITrend(departmentId, kpi.id, parseInt(timeRange));
        trends.push({
          name: kpi.name?.fr || kpi.name?.en || kpi.id,
          data: kpiTrends.map(entry => ({
            date: entry.date,
            value: entry.value,
            target: kpi.target
          })),
          target: kpi.target,
          unit: kpi.unit,
          kpiId: kpi.id
        });

        // Performance data for bar charts
        if (latest) {
          let progressValue;
          if (kpi.id === 'energy_consumption') {
            progressValue = latest.value; // Already a percentage
          } else if (kpi.id === 'mixing_time') {
            progressValue = kpi.target !== 0 ? Math.max(0, 100 - ((latest.value - kpi.target) / kpi.target) * 100) : 0;
          } else {
            progressValue = kpi.target !== 0 ? Math.min(100, (latest.value / kpi.target) * 100) : 0;
          }

          performance.push({
            name: kpi.name?.fr || kpi.name?.en || kpi.id,
            value: latest.value,
            progress: progressValue,
            target: kpi.target,
            unit: kpi.unit,
            status: progressValue >= 80 ? 'excellent' : progressValue >= 60 ? 'good' : 'needs-attention'
          });
        }

        // Distribution data for pie charts
        distribution.push({
          name: kpi.name?.fr || kpi.name?.en || kpi.id,
          value: history.length,
          entries: history.length
        });
      }
    });

    return {
      trends,
      performance,
      distribution,
      hasData: trends.length > 0 || performance.length > 0
    };
  }, [departmentKPIs, getKPIHistory, getKPITrend, getLatestKPIValue, departmentId, timeRange]);

  // Trend Chart Configuration
  const getTrendChart = () => {
    if (!chartData.trends.length) return null;

    const series = chartData.trends.map((kpi, index) => ({
      name: kpi.name,
      type: 'line',
      data: kpi.data.map(point => [point.date, point.value]),
      smooth: true,
      lineStyle: { 
        width: 3,
        color: index === 0 ? '#F97316' : '#3B82F6'
      },
      itemStyle: { 
        color: index === 0 ? '#F97316' : '#3B82F6',
        borderWidth: 2, 
        borderColor: '#FFFFFF' 
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: index === 0 ? 'rgba(249, 115, 22, 0.3)' : 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: index === 0 ? 'rgba(249, 115, 22, 0.05)' : 'rgba(59, 130, 246, 0.05)' }
          ]
        }
      },
      markLine: {
        data: [{
          yAxis: kpi.target,
          lineStyle: { 
            color: index === 0 ? '#F97316' : '#3B82F6',
            type: 'dashed',
            width: 2
          },
          label: {
            formatter: `Cible: ${kpi.target}${kpi.unit}`,
            position: 'end'
          }
        }]
      }
    }));

    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#475569',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        axisPointer: {
          type: 'cross',
          crossStyle: { color: isDark ? '#64748B' : '#94A3B8' }
        }
      },
      legend: {
        bottom: '5%',
        textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 11,
          formatter: function (value) {
            return new Date(value).toLocaleDateString('fr-FR', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series
    };
  };

  // Performance Bar Chart Configuration
  const getPerformanceChart = () => {
    if (!chartData.performance.length) return null;

    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#475569',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        formatter: function(params) {
          const data = chartData.performance[params.dataIndex];
          return `
            <div style="font-weight: bold;">${data.name}</div>
            <div>Valeur: ${data.value}${data.unit}</div>
            <div>Performance: ${data.progress.toFixed(1)}%</div>
            <div>Cible: ${data.target}${data.unit}</div>
          `;
        }
      },
      grid: {
        left: '15%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 11,
          formatter: '{value}%'
        },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: chartData.performance.map(item => item.name),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: chartData.performance.map(item => ({
          value: item.progress,
          itemStyle: {
            color: item.progress >= 80 ? '#10B981' :
                   item.progress >= 60 ? '#F59E0B' : '#EF4444'
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          color: isDark ? '#E2E8F0' : '#1E293B',
          fontSize: 11,
          formatter: '{c}%'
        }
      }]
    };
  };

  // Distribution Pie Chart Configuration
  const getDistributionChart = () => {
    if (!chartData.distribution.length) return null;

    const colors = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];

    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#475569',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' },
        formatter: '{b}: {c} entrées ({d}%)'
      },
      legend: {
        bottom: '5%',
        textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 11 }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: chartData.distribution.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: colors[index % colors.length] }
        })),
        label: {
          color: isDark ? '#E2E8F0' : '#1E293B',
          fontSize: 11,
          formatter: '{b}\n{c} entrées'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

  // Loading Component
  const LoadingChart = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-3">
      <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
      <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        Chargement des graphiques...
      </p>
    </div>
  );

  // No Data Component
  const NoDataChart = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center`}>
        <BarChart3 className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
      </div>
      <div className="text-center">
        <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Aucune Donnée Disponible
        </h4>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Ajoutez des données KPI pour voir les graphiques de performance
        </p>
      </div>
    </div>
  );

  // Refresh data handler
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate data refresh - in real app this would trigger data reload
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border shadow-sm ${
      isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      
      {/* Header */}
      <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Analyse Graphique
              </h3>
              <p className={`text-base mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Visualisation des tendances et performances de production
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                isDark 
                  ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500' 
                  : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'
              }`}
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg border transition-all ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : isDark 
                    ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg border transition-all ${
                isDark 
                  ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-8">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2 mb-6">
            <div className={`flex items-center space-x-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={() => setSelectedChart('trends')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedChart === 'trends' 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LineChart className="w-4 h-4" />
                <span>Tendances</span>
              </button>
              <button
                onClick={() => setSelectedChart('performance')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedChart === 'performance' 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Performance</span>
              </button>
              <button
                onClick={() => setSelectedChart('distribution')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedChart === 'distribution' 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Répartition</span>
              </button>
            </div>

            {/* Chart Info */}
            <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Activity className="w-4 h-4" />
              <span>
                {selectedChart === 'trends' && 'Évolution des KPI dans le temps'}
                {selectedChart === 'performance' && 'Comparaison des performances actuelles'}
                {selectedChart === 'distribution' && 'Répartition des données collectées'}
              </span>
            </div>
          </div>

          {/* Chart Display */}
          <div className={`rounded-xl border ${
            isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/50 border-slate-200'
          }`}>
            {isLoading ? (
              <LoadingChart />
            ) : !chartData.hasData ? (
              <NoDataChart />
            ) : (
              <div className="p-6">
                {selectedChart === 'trends' && getTrendChart() && (
                  <ReactECharts 
                    option={getTrendChart()} 
                    style={{ height: '400px' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}
                
                {selectedChart === 'performance' && getPerformanceChart() && (
                  <ReactECharts 
                    option={getPerformanceChart()} 
                    style={{ height: '400px' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}
                
                {selectedChart === 'distribution' && getDistributionChart() && (
                  <ReactECharts 
                    option={getDistributionChart()} 
                    style={{ height: '400px' }}
                    opts={{ renderer: 'svg' }}
                  />
                )}

                {/* Chart doesn't exist fallback */}
                {((selectedChart === 'trends' && !getTrendChart()) ||
                  (selectedChart === 'performance' && !getPerformanceChart()) ||
                  (selectedChart === 'distribution' && !getDistributionChart())) && (
                  <NoDataChart />
                )}
              </div>
            )}
          </div>

          {/* Chart Statistics */}
          {chartData.hasData && !isLoading && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {chartData.performance.length}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      KPI actifs
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {timeRange}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Jours analysés
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {chartData.performance.filter(item => item.status === 'excellent').length}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Excellentes performances
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductionChartsSection;