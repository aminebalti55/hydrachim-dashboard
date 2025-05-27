import React, { useContext } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  Calendar,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const KPICard = ({ 
  kpi, 
  latestValue, 
  status, 
  trend = null,
  onEdit,
  className = '' 
}) => {
  const { isDark = false, language = 'en' } = useContext(AppContext);
  
  // Helper function to get localized text
  const getLocalizedText = (textObject) => {
    if (typeof textObject === 'string') return textObject;
    if (typeof textObject === 'object' && textObject !== null) {
      return textObject[language] || textObject.en || 'Unknown';
    }
    return 'Unknown';
  };

  // Format value based on KPI type
  const formatValue = (value, type, unit) => {
    if (value === null || value === undefined) return '--';
    
    switch (type) {
      case 'percentage':
        return `${value}${unit}`;
      case 'currency':
        return `${unit}${value.toLocaleString()}`;
      case 'number':
        return `${value}${unit ? ` ${unit}` : ''}`;
      default:
        return `${value}${unit ? ` ${unit}` : ''}`;
    }
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'excellent':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-500/10',
          gradient: 'from-emerald-500/10 to-emerald-600/5',
          icon: CheckCircle2,
          text: 'Excellent',
          dotColor: 'bg-emerald-500'
        };
      case 'good':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10',
          gradient: 'from-blue-500/10 to-blue-600/5',
          icon: Target,
          text: 'Good',
          dotColor: 'bg-blue-500'
        };
      case 'needs-attention':
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-500/10',
          gradient: 'from-amber-500/10 to-amber-600/5',
          icon: AlertTriangle,
          text: 'Needs Attention',
          dotColor: 'bg-amber-500'
        };
      default:
        return {
          color: 'text-slate-500',
          bgColor: 'bg-slate-500/10',
          gradient: 'from-slate-500/10 to-slate-600/5',
          icon: Minus,
          text: 'No Data',
          dotColor: 'bg-slate-400'
        };
    }
  };

  // Get trend configuration
  const getTrendConfig = (trend) => {
    if (!trend || trend.direction === 'stable') {
      return {
        icon: Minus,
        color: 'text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        text: 'Stable'
      };
    }
    
    if (trend.direction === 'up') {
      return {
        icon: TrendingUp,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: `+${trend.percentage}%`
      };
    }
    
    return {
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      text: `-${trend.percentage}%`
    };
  };

  const statusConfig = getStatusConfig(status);
  const trendConfig = getTrendConfig(trend);
  const StatusIcon = statusConfig.icon;
  const TrendIcon = trendConfig.icon;

  const formattedValue = formatValue(latestValue?.value, kpi?.type, kpi?.unit);
  const formattedTarget = formatValue(kpi?.target, kpi?.type, kpi?.unit);
  
  const lastUpdate = latestValue?.date 
    ? new Date(latestValue.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : '--';

  // Calculate progress percentage for visual indicator
  const getProgress = () => {
    if (!latestValue?.value || !kpi?.target) return 0;
    return Math.min(100, (latestValue.value / kpi.target) * 100);
  };

  const progress = getProgress();

  return (
    <div className={`group relative ${className}`}>
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' 
          : 'bg-gradient-to-br from-white to-gray-50/80 border-gray-200/80 shadow-sm'
      }`}>
        
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Status indicator dot */}
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${statusConfig.dotColor} shadow-sm`} />
        
        {/* Edit button */}
        {onEdit && (
          <button
            onClick={() => onEdit(kpi)}
            className={`absolute top-3 right-8 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              isDark 
                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-white/80 text-slate-400 hover:text-slate-600'
            } backdrop-blur-sm`}
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}

        <div className="relative p-4">
          {/* Header */}
          <div className="mb-4">
            <h4 className={`text-sm font-semibold leading-tight pr-12 mb-2 ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}>
              {getLocalizedText(kpi?.name) || 'KPI Name'}
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {getLocalizedText(kpi?.description) || 'KPI Description'}
            </p>
          </div>

          {/* Value Section */}
          <div className="mb-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className={`text-xl font-bold ${statusConfig.color} block leading-none`}>
                  {formattedValue}
                </span>
                {/* Progress bar */}
                <div className={`w-16 h-1 rounded-full mt-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className={`h-1 rounded-full ${statusConfig.dotColor} transition-all duration-700 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Trend */}
              {trend && (
                <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg ${trendConfig.bgColor}`}>
                  <TrendIcon className={`w-3 h-3 ${trendConfig.color}`} />
                  <span className={`text-xs font-medium ${trendConfig.color}`}>
                    {trendConfig.text}
                  </span>
                </div>
              )}
            </div>
            
            {/* Target */}
            <div className="flex items-center space-x-1.5">
              <Target className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Target: 
              </span>
              <span className={`text-xs font-semibold ${statusConfig.color}`}>
                {formattedTarget}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mb-3">
            {/* Status */}
            <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg ${statusConfig.bgColor} border border-white/10`}>
              <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
              <span className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
            </div>
            
            {/* Last update */}
            <div className="flex items-center space-x-1.5">
              <Calendar className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {lastUpdate}
              </span>
            </div>
          </div>

          {/* Notes */}
          {latestValue?.notes && (
            <div className={`pt-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
              <div className="flex items-start space-x-2">
                <div className={`p-1.5 rounded-md ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <MessageSquare className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Latest Note
                  </p>
                  <p className={`text-xs italic leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
                    "{latestValue.notes}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};