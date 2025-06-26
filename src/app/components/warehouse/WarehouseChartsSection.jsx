import React, { useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useWarehouseData } from '../../hooks/useWarehouseData';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Euro,
  AlertTriangle,
  Package,
  PieChart,
  LineChart,
  Target,
  Gauge,
  CheckCircle,
  DollarSign,
  Activity,
  Zap,
  Layers,
  Eye,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Brain,
  Cpu,
  Database,
  Loader2
} from 'lucide-react';

// Modern Warehouse Charts Section Component
const WarehouseChartsSection = ({ 
  departmentId = 'warehouses', 
  isDark = false
}) => {
  const {
    kpiData,
    isLoading,
    error,
    getKPIHistory,
    getLatestKPIValue,
    getKPITrend,
    getDepartmentSummary
  } = useWarehouseData();

  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeChart, setActiveChart] = useState('overview');

  // Define warehouse KPIs
  const warehouseKPIs = [
    {
      id: 'cost_per_formulation',
      name: 'Coût par Formulation',
      icon: DollarSign,
      color: 'violet'
    },
    {
      id: 'stock_issues_rate',
      name: 'Taux de Problèmes Stock',
      icon: AlertTriangle,
      color: 'orange'
    }
  ];

  // Get real data for charts
  const costHistory = getKPIHistory(departmentId, 'cost_per_formulation');
  const stockHistory = getKPIHistory(departmentId, 'stock_issues_rate');
  const departmentSummary = getDepartmentSummary(departmentId);

  // Create category data from real KPI values
  const categoryData = useMemo(() => {
    const categories = [];
    
    const latestCost = getLatestKPIValue(departmentId, 'cost_per_formulation');
    if (latestCost) {
      categories.push({
        name: 'Coût par Formulation',
        progress: latestCost.value,
        target: 100,
        current: latestCost.data?.monthlyTotal || 0,
        budget: latestCost.data?.budgetedCost || 0
      });
    }

    const latestStock = getLatestKPIValue(departmentId, 'stock_issues_rate');
    if (latestStock) {
      categories.push({
        name: 'Problèmes de Stock',
        progress: latestStock.value,
        target: 100,
        current: latestStock.data?.currentMonthCount || 0,
        goal: latestStock.data?.monthlyGoal || 0
      });
    }

    return categories;
  }, [getLatestKPIValue, departmentId]);

  // Monthly Trend Line Chart for Real KPI Data
  const MonthlyTrendChart = ({ kpi }) => {
    const history = getKPIHistory(departmentId, kpi.id);
    if (history.length === 0) return null;

    const chartData = history.slice(-12).reverse().map(entry => ({
      date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value: entry.value,
      cost: entry.data?.monthlyTotal || 0,
      budget: entry.data?.monthlyBudget || entry.data?.budgetedCost || 0,
      issues: entry.data?.currentMonthCount || 0
    }));

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 2000,
      title: {
        text: 'Évolution Mensuelle des KPIs',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        left: '3%',
        top: '3%'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: { 
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        padding: [16, 20],
        extraCssText: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);',
        formatter: function(params) {
          const data = chartData[params[0].dataIndex];
          return `
            <div style="margin-bottom: 8px;"><strong>${params[0].axisValue}</strong></div>
            <div style="margin: 6px 0;">
              <span style="color: ${isDark ? '#A78BFA' : '#7C3AED'}; font-weight: 600;">📊 Performance: ${data.value}%</span><br/>
              ${data.cost > 0 ? `<span style="color: ${isDark ? '#60A5FA' : '#3B82F6'}; font-weight: 600;">💰 Coût: ${data.cost.toLocaleString()} DT</span><br/>` : ''}
              ${data.issues > 0 ? `<span style="color: ${isDark ? '#F87171' : '#EF4444'}; font-weight: 600;">⚠️ Problèmes: ${data.issues}</span>` : ''}
            </div>
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.date),
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
          formatter: '{value}%'
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { 
          lineStyle: { 
            color: isDark ? '#374151' : '#F1F5F9',
            type: 'dashed'
          } 
        }
      },
      series: [
        {
          name: 'Performance KPI',
          type: 'line',
          data: chartData.map(item => item.value),
          smooth: true,
          lineStyle: {
            color: '#8B5CF6',
            width: 3
          },
          itemStyle: {
            color: '#8B5CF6',
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
              ]
            }
          },
          markLine: {
            data: [
              { yAxis: 80, name: 'Objectif Performance' }
            ],
            lineStyle: {
              color: '#10B981',
              type: 'dashed',
              width: 2
            }
          }
        }
      ]
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-violet-300 hover:shadow-lg ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20' 
            : 'bg-gradient-to-br from-violet-50/50 via-transparent to-cyan-50/50'
        }`}></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Tendances Mensuelles
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Évolution des performances sur 12 mois
                </p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-100 text-violet-700'
            }`}>
              Tendance
            </div>
          </div>
          
          <ReactECharts 
            option={option} 
            style={{ height: '350px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
    );
  };

  // Cost Breakdown Pie Chart with Real Data
  const CostBreakdownChart = () => {
    const latestCost = getLatestKPIValue(departmentId, 'cost_per_formulation');
    if (!latestCost || !latestCost.data?.stats) return null;

    const stats = latestCost.data.stats;
    const breakdownData = [
      { 
        name: 'Matières Premières', 
        value: stats.materieresPremieresTotal || 0,
        itemStyle: { color: '#3B82F6' }
      },
      { 
        name: 'Emballage', 
        value: stats.emballageTotal || 0,
        itemStyle: { color: '#F59E0B' }
      },
      { 
        name: 'Autres Coûts', 
        value: Math.max(0, (stats.monthlyTotal || 0) - (stats.materieresPremieresTotal || 0) - (stats.emballageTotal || 0)),
        itemStyle: { color: '#10B981' }
      }
    ].filter(item => item.value > 0);

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 2000,
      title: {
        text: 'Répartition des Coûts',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        left: '3%',
        top: '3%'
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: { 
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        padding: [16, 20],
        extraCssText: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);',
        formatter: function(params) {
          const percentage = ((params.value / stats.monthlyTotal) * 100).toFixed(1);
          return `
            <div style="margin-bottom: 8px;">
              <strong style="color: ${isDark ? '#A78BFA' : '#7C3AED'};">${params.name}</strong>
            </div>
            <div style="margin: 6px 0;">
              <span style="color: ${isDark ? '#60A5FA' : '#3B82F6'}; font-weight: 600;">💰 ${params.value.toLocaleString()} DT</span><br/>
              <span style="color: ${isDark ? '#34D399' : '#059669'}; font-weight: 600;">📊 ${percentage}% du total</span>
            </div>
          `;
        }
      },
      legend: {
        bottom: '2%',
        left: 'center',
        textStyle: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 12
        },
        itemGap: 20
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '45%'],
          data: breakdownData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            position: 'inside',
            formatter: function(params) {
              const percentage = ((params.value / stats.monthlyTotal) * 100).toFixed(0);
              return percentage > 8 ? `${percentage}%` : '';
            },
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 'bold'
          },
          labelLine: {
            show: false
          }
        }
      ]
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-emerald-300 hover:shadow-lg ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-orange-900/20 via-transparent to-cyan-900/20' 
            : 'bg-gradient-to-br from-orange-50/50 via-transparent to-cyan-50/50'
        }`}></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center shadow-md">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Répartition des Coûts
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Distribution mensuelle des dépenses
              </p>
            </div>
          </div>
          
          <ReactECharts 
            option={option} 
            style={{ height: '350px' }}
            opts={{ renderer: 'svg' }}
          />

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">
                {((stats.materieresPremieresTotal || 0) / (stats.monthlyTotal || 1) * 100).toFixed(0)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Matières Premières
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">
                {((stats.emballageTotal || 0) / (stats.monthlyTotal || 1) * 100).toFixed(0)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Emballage
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-500">
                {(stats.monthlyTotal || 0).toLocaleString()}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Total (DT)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Monthly Comparison Bar Chart
  const MonthlyComparisonChart = () => {
    const costHistory = getKPIHistory(departmentId, 'cost_per_formulation', 6);
    const stockHistory = getKPIHistory(departmentId, 'stock_issues_rate', 6);
    
    if (costHistory.length === 0 && stockHistory.length === 0) return null;

    // Combine data by month
    const monthsData = {};
    
    costHistory.forEach(entry => {
      const month = new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' });
      if (!monthsData[month]) monthsData[month] = {};
      monthsData[month].costPerformance = entry.value;
      monthsData[month].totalCost = entry.data?.monthlyTotal || 0;
    });

    stockHistory.forEach(entry => {
      const month = new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' });
      if (!monthsData[month]) monthsData[month] = {};
      monthsData[month].stockPerformance = entry.value;
      monthsData[month].issuesCount = entry.data?.currentMonthCount || 0;
    });

    const chartData = Object.entries(monthsData).map(([month, data]) => ({
      month,
      costPerformance: data.costPerformance || 0,
      stockPerformance: data.stockPerformance || 0,
      avgPerformance: ((data.costPerformance || 0) + (data.stockPerformance || 0)) / 2
    })).reverse();

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 2000,
      title: {
        text: 'Comparaison Mensuelle des KPIs',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        left: '3%',
        top: '3%'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: { 
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        padding: [16, 20],
        extraCssText: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);'
      },
      legend: {
        top: '15%',
        textStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.month),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
          formatter: '{value}%'
        },
        splitLine: { 
          lineStyle: { 
            color: isDark ? '#374151' : '#F1F5F9',
            type: 'dashed'
          } 
        }
      },
      series: [
        {
          name: 'Performance Coûts',
          type: 'bar',
          data: chartData.map(item => item.costPerformance),
          itemStyle: {
            color: '#3B82F6',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '25%'
        },
        {
          name: 'Performance Stock',
          type: 'bar',
          data: chartData.map(item => item.stockPerformance),
          itemStyle: {
            color: '#F59E0B',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '25%'
        },
        {
          name: 'Moyenne',
          type: 'line',
          data: chartData.map(item => item.avgPerformance),
          lineStyle: {
            color: '#10B981',
            width: 3
          },
          itemStyle: {
            color: '#10B981'
          },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-purple-300 hover:shadow-lg ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20' 
            : 'bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50'
        }`}></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Comparaison des KPIs
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Évolution comparative des performances
              </p>
            </div>
          </div>
          
          <ReactECharts 
            option={option} 
            style={{ height: '350px' }}
            opts={{ renderer: 'svg' }}
          />

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">
                {chartData.length > 0 ? chartData[chartData.length - 1]?.costPerformance || 0 : 0}%
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Coûts actuels
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">
                {chartData.length > 0 ? chartData[chartData.length - 1]?.stockPerformance || 0 : 0}%
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Stock actuels
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-500">
                {chartData.length > 0 ? Math.round(chartData[chartData.length - 1]?.avgPerformance || 0) : 0}%
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Moyenne globale
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Advanced Stacked Area Chart with Real Cost Data
  const StackedAreaChart = ({ kpi }) => {
    const history = getKPIHistory(departmentId, kpi.id);
    if (history.length === 0) return null;

    const chartData = history.slice(-15).reverse().map(entry => {
      const data = entry.data || {};
      const stats = data.stats || {};
      return {
        date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        materials: stats.materieresPremieresTotal || 0,
        packaging: stats.emballageTotal || 0,
        operations: (data.monthlyTotal || 0) * 0.05, // Estimate 5% for operations
        total: data.monthlyTotal || 0
      };
    });

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 2500,
      title: {
        text: 'Évolution des Coûts par Catégorie',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        left: '3%',
        top: '3%'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: { 
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        padding: [16, 20],
        extraCssText: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);',
        formatter: function(params) {
          let tooltip = `<div style="margin-bottom: 8px;"><strong>${params[0].axisValue}</strong></div>`;
          params.forEach(param => {
            tooltip += `<div style="margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: ${isDark ? '#F8FAFC' : '#1E293B'};">${param.seriesName}: ${param.value.toLocaleString()} DT</span>
            </div>`;
          });
          return tooltip;
        }
      },
      legend: {
        top: '15%',
        textStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.date),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
          formatter: '{value} DT'
        },
        splitLine: { 
          lineStyle: { 
            color: isDark ? '#374151' : '#F1F5F9',
            type: 'dashed'
          } 
        }
      },
      series: [
        {
          name: 'Matières Premières',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.8)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.2)' }
              ]
            }
          },
          data: chartData.map(item => Math.round(item.materials)),
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2 }
        },
        {
          name: 'Emballages',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.8)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.2)' }
              ]
            }
          },
          data: chartData.map(item => Math.round(item.packaging)),
          smooth: true,
          lineStyle: { color: '#10B981', width: 2 }
        },
        {
          name: 'Opérations',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245, 158, 11, 0.8)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.2)' }
              ]
            }
          },
          data: chartData.map(item => Math.round(item.operations)),
          smooth: true,
          lineStyle: { color: '#F59E0B', width: 2 }
        }
      ]
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-blue-300 hover:shadow-lg ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20' 
            : 'bg-gradient-to-br from-blue-50/50 via-transparent to-green-50/50'
        }`}></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Analyse des Coûts
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Évolution par catégorie de dépenses
              </p>
            </div>
          </div>
          
          <ReactECharts 
            option={option} 
            style={{ height: '380px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
    );
  };

  // Futuristic Gauge Chart with Better Colors
  const FuturisticGaugeChart = () => {
    if (!categoryData.length) return null;

    const overallPerformance = categoryData.reduce((sum, item) => sum + item.progress, 0) / categoryData.length;

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 3000,
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          radius: '90%',
          min: 0,
          max: 100,
          startAngle: 200,
          endAngle: -20,
          splitNumber: 5,
          itemStyle: {
            color: '#3B82F6'
          },
          progress: {
            show: true,
            width: 12,
            itemStyle: {
              color: {
                type: 'conic',
                x: 0.5,
                y: 0.5,
                colorStops: [
                  { offset: 0, color: '#F59E0B' },
                  { offset: 0.3, color: '#10B981' },
                  { offset: 0.7, color: '#3B82F6' },
                  { offset: 1, color: '#8B5CF6' }
                ]
              }
            }
          },
          pointer: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [[1, isDark ? '#475569' : '#E5E7EB']]
            }
          },
          axisTick: { show: false },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: isDark ? '#64748B' : '#D1D5DB'
            }
          },
          axisLabel: {
            distance: 25,
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 12
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 28,
            fontWeight: 'bold',
            color: isDark ? '#F8FAFC' : '#1E293B',
            offsetCenter: [0, '20%']
          },
          data: [{ value: overallPerformance }]
        }
      ]
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-purple-300 hover:shadow-lg ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20' 
            : 'bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50'
        }`}></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
              <Gauge className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Jauge de Performance
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Indicateur de performance en temps réel
              </p>
            </div>
          </div>
          
          <ReactECharts 
            option={option} 
            style={{ height: '300px' }}
            opts={{ renderer: 'svg' }}
          />

          <div className="mt-4 text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              overallPerformance >= 80 
                ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                : overallPerformance >= 60 
                ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                : overallPerformance >= 40 
                ? isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800'
                : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
            }`}>
              {overallPerformance >= 80 ? '🏆 Excellent' :
               overallPerformance >= 60 ? '✅ Bon' :
               overallPerformance >= 40 ? '⚠️ Modéré' : '🚨 Critique'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modern 3D Bar Chart with Real Data
  const Modern3DBarChart = ({ kpi }) => {
    const history = getKPIHistory(departmentId, kpi.id);
    if (history.length === 0) return null;

    const chartData = history.slice(-8).reverse().map(entry => ({
      date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      value: entry.value,
      cost: entry.data?.monthlyTotal || 0,
      budget: entry.data?.monthlyBudget || entry.data?.budgetedCost || 0
    }));

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 2000,
      title: {
        text: 'Performance vs Budget',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        left: '3%',
        top: '3%'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: { 
          color: isDark ? '#F8FAFC' : '#1E293B',
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        padding: [16, 20],
        extraCssText: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);',
        formatter: function(params) {
          const data = chartData[params[0].dataIndex];
          return `
            <div style="margin-bottom: 8px;"><strong>${params[0].axisValue}</strong></div>
            <div style="margin: 4px 0;">
              <span style="color: ${isDark ? '#A78BFA' : '#8B5CF6'};">📊 Performance: ${data.value}%</span><br/>
              <span style="color: ${isDark ? '#60A5FA' : '#3B82F6'};">💰 Coût: ${data.cost.toLocaleString()} DT</span><br/>
              <span style="color: ${isDark ? '#34D399' : '#10B981'};">🎯 Budget: ${data.budget.toLocaleString()} DT</span>
            </div>
          `;
        }
      },
      legend: {
        top: '15%',
        textStyle: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.date),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11
        },
        splitLine: { 
          lineStyle: { 
            color: isDark ? '#374151' : '#F1F5F9',
            type: 'dashed'
          } 
        }
      },
      series: [
        {
          name: 'Performance',
          type: 'bar',
          data: chartData.map(item => item.value),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#8B5CF6' },
                { offset: 1, color: '#6366F1' }
              ]
            },
            borderRadius: [8, 8, 0, 0],
            shadowColor: 'rgba(139, 92, 246, 0.3)',
            shadowBlur: 8,
            shadowOffsetY: 4
          },
          barWidth: '40%',
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(139, 92, 246, 0.4)'
            }
          }
        },
        {
          name: 'Budget Cible',
          type: 'line',
          data: chartData.map(() => 100),
          lineStyle: {
            color: '#10B981',
            width: 3,
            type: 'dashed'
          },
          symbol: 'none',
          markLine: {
            data: [{ yAxis: 80, name: 'Seuil Critique' }],
            lineStyle: {
              color: '#EF4444',
              type: 'solid',
              width: 2
            }
          }
        }
      ]
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:border-indigo-300 hover:shadow-lg ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20' 
            : 'bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50'
        }`}></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Analyse Comparative
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Performance vs objectifs budgétaires
              </p>
            </div>
          </div>
          
          <ReactECharts 
            option={option} 
            style={{ height: '380px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
    );
  };

  const renderKPIChart = (kpi) => {
    if (kpi.id === 'cost_per_formulation') {
      return <Modern3DBarChart key={kpi.id} kpi={kpi} />;
    }
    return null;
  };

  // Loading and Error States
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
          <span className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Chargement des données...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasKPIData = costHistory.length > 0 || stockHistory.length > 0;

  if (!hasKPIData) {
    return (
      <div className={`p-8 rounded-2xl border text-center ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <Database className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Aucune donnée disponible
        </h3>
        <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          Commencez par saisir des données dans les trackers de coûts et de problèmes de stock.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analytics Avancées
            </h3>
            <p className={`text-base mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Visualisations intelligentes et insights en temps réel
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {warehouseKPIs.map(kpi => (
          <MonthlyTrendChart key={`trend-${kpi.id}`} kpi={kpi} />
        )).filter(Boolean)[0] || null}
        
        {categoryData.length > 0 && <CostBreakdownChart />}
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {warehouseKPIs.map(kpi => (
          <StackedAreaChart key={`stack-${kpi.id}`} kpi={kpi} />
        )).filter(Boolean)[0] || null}
        
        <MonthlyComparisonChart />
      </div>

      {/* Comparative Analysis */}
      <div className="grid grid-cols-1 gap-8">
        {warehouseKPIs.map(kpi => renderKPIChart(kpi)).filter(Boolean)}
      </div>

      {/* Floating Action Button for Export */}
      <div className="fixed bottom-8 right-8 z-10">
        <button className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:from-blue-600 hover:to-purple-600 flex items-center justify-center ${
          isDark ? 'hover:scale-110' : 'hover:scale-105'
        }`}>
          <Database className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default WarehouseChartsSection;