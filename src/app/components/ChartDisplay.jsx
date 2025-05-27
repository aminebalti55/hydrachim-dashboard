import React, { useContext, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { AppContext } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  Download,
  Maximize2,
  Sparkles,
  Target
} from 'lucide-react';

export const ChartDisplay = ({ 
  data = [], 
  type = 'line', 
  title,
  dataKey = 'value',
  xAxisKey = 'date',
  color = '#3B82F6',
  height = 300,
  showGrid = true,
  animate = true,
  className = '',
  unit = '',
  showStats = true,
  interactive = true
}) => {
  const { language, isDark } = useContext(AppContext);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  // Modern color palettes
  const modernColors = {
    gradients: [
      ['#667eea', '#764ba2'], // Purple-Blue
      ['#f093fb', '#f5576c'], // Pink-Red
      ['#4facfe', '#00f2fe'], // Blue-Cyan
      ['#43e97b', '#38f9d7'], // Green-Teal
      ['#ffecd2', '#fcb69f'], // Orange-Peach
      ['#a8edea', '#fed6e3'], // Mint-Pink
      ['#d299c2', '#fef9d7'], // Purple-Yellow
      ['#89f7fe', '#66a6ff'], // Cyan-Blue
    ],
    solid: [
      '#667eea', '#f093fb', '#4facfe', '#43e97b', 
      '#ffecd2', '#a8edea', '#d299c2', '#89f7fe'
    ]
  };

  // Advanced theme configuration
  const chartTheme = {
    backgroundColor: 'transparent',
    textColor: isDark ? '#E2E8F0' : '#475569',
    gridColor: isDark ? '#334155' : '#E2E8F0',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDark ? '#334155' : '#E2E8F0',
    cardBg: isDark 
      ? 'bg-slate-900/80 backdrop-blur-xl border-slate-700/50' 
      : 'bg-white/80 backdrop-blur-xl border-slate-200/50'
  };

  // Get unit and format values
  const getUnit = (dataKey) => {
    if (unit) return unit;
    if (dataKey?.includes('percentage') || dataKey?.includes('rate') || dataKey?.includes('efficiency')) return '%';
    if (dataKey?.includes('cost') || dataKey?.includes('Cost')) return '€';
    if (dataKey?.includes('time') || dataKey?.includes('Time')) return ' min';
    return '';
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const values = data.map(item => parseFloat(item[dataKey]) || 0).filter(v => !isNaN(v));
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const trend = previous ? ((latest - previous) / previous) * 100 : 0;

    return {
      avg: avg.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      latest: latest.toFixed(1),
      trend: trend.toFixed(1),
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
  }, [data, dataKey]);

  // Format data for ECharts
  const formatDataForChart = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map((item, index) => ({
      ...item,
      [xAxisKey]: item[xAxisKey] || item.date || `Entry ${index + 1}`,
      [dataKey]: parseFloat(item[dataKey]) || parseFloat(item.value) || 0
    }));
  };

  const formattedData = formatDataForChart(data);

  // Advanced gradient generation
  const createGradient = (colors, vertical = false) => ({
    type: 'linear',
    x: 0,
    y: 0,
    x2: vertical ? 0 : 1,
    y2: vertical ? 1 : 0,
    colorStops: colors.map((color, index) => ({
      offset: index / (colors.length - 1),
      color
    }))
  });

  // Generate modern ECharts option
  const getChartOption = useMemo(() => {
    const gradientColors = modernColors.gradients[0];
    
    const baseOption = {
      backgroundColor: 'transparent',
      animation: animate,
      animationDuration: animate ? 1000 : 0,
      animationEasing: 'cubicOut',
      textStyle: {
        color: chartTheme.textColor,
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 500
      },
      tooltip: {
        trigger: type === 'pie' ? 'item' : 'axis',
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
        borderRadius: 12,
        padding: [12, 16],
        textStyle: {
          color: isDark ? '#FFFFFF' : '#000000',
          fontSize: 13,
          fontWeight: 500
        },
        shadowBlur: 20,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        formatter: (params) => {
          if (type === 'pie') {
            return `
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${params.name}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${params.color};"></div>
                <span style="font-weight: 600;">${params.value}${getUnit(dataKey)}</span>
                <span style="color: #64748B;">(${params.percent}%)</span>
              </div>
            `;
          }
          
          if (Array.isArray(params)) {
            let result = `<div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${params[0].name}</div>`;
            params.forEach(param => {
              result += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: ${param.color};"></div>
                  <span style="font-weight: 600;">${param.value}${getUnit(dataKey)}</span>
                </div>
              `;
            });
            return result;
          } else {
            return `
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${params.name}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${params.color};"></div>
                <span style="font-weight: 600;">${params.value}${getUnit(dataKey)}</span>
              </div>
            `;
          }
        }
      }
    };

    // Configure based on chart type
    switch (type) {
      case 'area':
        return {
          ...baseOption,
          grid: {
            left: '3%',
            right: '4%',
            bottom: '8%',
            top: '8%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: formattedData.map(item => item[xAxisKey]),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 500,
              margin: 12
            },
            splitLine: { show: false }
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 500
            },
            splitLine: {
              show: showGrid,
              lineStyle: {
                color: chartTheme.gridColor,
                opacity: 0.3,
                type: 'dashed'
              }
            }
          },
          series: [{
            name: dataKey,
            type: 'line',
            data: formattedData.map(item => item[dataKey]),
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: gradientColors[0],
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: gradientColors[0] + '40'
            },
            lineStyle: {
              width: 3,
              color: createGradient(gradientColors)
            },
            areaStyle: {
              color: createGradient([...gradientColors, 'transparent'], true),
              opacity: 0.6
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                shadowBlur: 20,
                shadowColor: gradientColors[0]
              }
            }
          }]
        };

      case 'bar':
        return {
          ...baseOption,
          grid: {
            left: '3%',
            right: '4%',
            bottom: '8%',
            top: '8%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: formattedData.map(item => item[xAxisKey]),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 500,
              margin: 12
            }
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 500
            },
            splitLine: {
              show: showGrid,
              lineStyle: {
                color: chartTheme.gridColor,
                opacity: 0.3,
                type: 'dashed'
              }
            }
          },
          series: [{
            name: dataKey,
            type: 'bar',
            data: formattedData.map(item => item[dataKey]),
            itemStyle: {
              color: createGradient(gradientColors, true),
              borderRadius: [8, 8, 0, 0],
              shadowBlur: 10,
              shadowColor: gradientColors[0] + '20',
              shadowOffsetY: 4
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: gradientColors[0] + '40'
              }
            },
            barWidth: '60%'
          }]
        };

      case 'pie':
        return {
          ...baseOption,
          series: [{
            name: dataKey,
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['50%', '50%'],
            data: formattedData.map((item, index) => ({
              name: item[xAxisKey],
              value: item[dataKey],
              itemStyle: {
                color: createGradient(modernColors.gradients[index % modernColors.gradients.length]),
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              },
              scale: true,
              scaleSize: 5
            },
            label: {
              show: true,
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 600,
              formatter: '{b}: {d}%'
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: chartTheme.textColor,
                width: 2
              }
            }
          }]
        };

      case 'line':
      default:
        return {
          ...baseOption,
          grid: {
            left: '3%',
            right: '4%',
            bottom: '8%',
            top: '8%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: formattedData.map(item => item[xAxisKey]),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 500,
              margin: 12
            }
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: chartTheme.textColor,
              fontSize: 12,
              fontWeight: 500
            },
            splitLine: {
              show: showGrid,
              lineStyle: {
                color: chartTheme.gridColor,
                opacity: 0.3,
                type: 'dashed'
              }
            }
          },
          series: [{
            name: dataKey,
            type: 'line',
            data: formattedData.map(item => item[dataKey]),
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: gradientColors[0],
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: gradientColors[0] + '40'
            },
            lineStyle: {
              width: 3,
              color: createGradient(gradientColors)
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                shadowBlur: 20,
                shadowColor: gradientColors[0],
                scale: 1.2
              }
            }
          }]
        };
    }
  }, [formattedData, type, color, showGrid, animate, chartTheme, dataKey, xAxisKey, isDark, modernColors]);

  // Stats component
  const StatsDisplay = () => {
    if (!showStats || !stats) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'fr' ? 'Moyenne' : 'Average'}
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {stats.avg}{getUnit(dataKey)}
          </p>
        </div>

        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'fr' ? 'Dernier' : 'Latest'}
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {stats.latest}{getUnit(dataKey)}
          </p>
        </div>

        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'fr' ? 'Plage' : 'Range'}
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {stats.min} - {stats.max}{getUnit(dataKey)}
          </p>
        </div>

        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-2">
            {stats.trendDirection === 'up' ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : stats.trendDirection === 'down' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4 text-slate-500" />
            )}
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'fr' ? 'Tendance' : 'Trend'}
            </span>
          </div>
          <p className={`text-lg font-bold ${
            stats.trendDirection === 'up' ? 'text-emerald-600' :
            stats.trendDirection === 'down' ? 'text-red-600' : 
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {stats.trendDirection === 'stable' ? '0' : `${stats.trend > 0 ? '+' : ''}${stats.trend}`}%
          </p>
        </div>
      </div>
    );
  };

  // Empty state with modern design
  if (!data || data.length === 0) {
    return (
      <div className={`rounded-2xl border ${chartTheme.cardBg} shadow-xl ${className}`}>
        <div className="p-6">
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h4>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {language === 'fr' ? 'Aucune donnée' : 'No data'}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl ${
                isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-slate-100 to-slate-200'
              } flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <BarChart3 className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <p className={`text-base font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {language === 'fr' ? 'Ajoutez des données pour voir le graphique' : 'Add data to see the chart'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${chartTheme.cardBg} shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <div className="p-6">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                isDark ? 'from-blue-400 to-purple-500' : 'from-blue-500 to-purple-600'
              }`} />
              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h4>
            </div>
            
            {interactive && (
              <div className="flex items-center space-x-2">
                <button className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}>
                  <Eye className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}>
                  <Download className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <Maximize2 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <StatsDisplay />

        {/* Chart */}
        <div style={{ width: '100%', height: isFullscreen ? '70vh' : height }}>
          <ReactECharts 
            option={getChartOption}
            style={{ width: '100%', height: '100%' }}
            theme={isDark ? 'dark' : 'light'}
            opts={{ 
              renderer: 'canvas',
              locale: language,
              devicePixelRatio: window.devicePixelRatio || 1
            }}
            onEvents={{
              click: (params) => {
                if (interactive) {
                  setSelectedDataPoint(params);
                }
              }
            }}
          />
        </div>

        {/* Selected data point info */}
        {selectedDataPoint && interactive && (
          <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} backdrop-blur-sm`}>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {language === 'fr' ? 'Point sélectionné' : 'Selected Point'}: {selectedDataPoint.name} - {selectedDataPoint.value}{getUnit(dataKey)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};