import React, { useState, useContext } from 'react';
import { 
  Target, 
  Save, 
  X, 
  AlertCircle,
  Calculator,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

export const KPIForm = ({ 
  kpi, 
  departmentId,
  onSave, 
  onCancel,
  initialValue = '',
  initialNotes = ''
}) => {
  const { isDark = false, language = 'en' } = useContext(AppContext);
  
  const [value, setValue] = useState(initialValue);
  const [notes, setNotes] = useState(initialNotes);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get localized text
  const getLocalizedText = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Helper function for KPI name/description
  const getKpiText = (textObject) => {
    if (typeof textObject === 'string') return textObject;
    if (typeof textObject === 'object' && textObject !== null) {
      return textObject[language] || textObject.en || 'Unknown';
    }
    return 'Unknown';
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!value || value.toString().trim() === '') {
      newErrors.value = getLocalizedText('thisFieldIsRequired');
      setErrors(newErrors);
      return false;
    }

    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      newErrors.value = getLocalizedText('pleaseEnterValidNumber');
      setErrors(newErrors);
      return false;
    }

    if (kpi?.type === 'percentage') {
      if (numValue < 0 || numValue > 100) {
        newErrors.value = getLocalizedText('percentageMustBeBetween');
        setErrors(newErrors);
        return false;
      }
    }

    const nonNegativeKPIs = ['count', 'hours', 'minutes', 'days', 'liters', 'kWh'];
    if (nonNegativeKPIs.includes(kpi?.unit) && numValue < 0) {
      newErrors.value = getLocalizedText('negativeValuesNotAllowed');
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave(departmentId, kpi?.id, value, notes.trim());
      setValue('');
      setNotes('');
      setErrors({});
    } catch (error) {
      setErrors({ submit: getLocalizedText('failedToSaveKpiData') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle value change
  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (errors.value) {
      setErrors(prev => ({ ...prev, value: null }));
    }
  };

  // Get input placeholder
  const getPlaceholder = () => {
    switch (kpi?.type) {
      case 'percentage':
        return '0-100';
      case 'currency':
        return '0.00';
      case 'number':
        return '0';
      default:
        return getLocalizedText('enterValue');
    }
  };

  // Format target
  const formatTarget = (target, type, unit) => {
    if (!target) return '--';
    switch (type) {
      case 'percentage':
        return `${target}${unit}`;
      case 'currency':
        return `${unit}${target.toLocaleString()}`;
      case 'number':
        return `${target}${unit ? ` ${unit}` : ''}`;
      default:
        return `${target}${unit ? ` ${unit}` : ''}`;
    }
  };

  // Calculate progress
  const getProgress = () => {
    if (!value || !kpi?.target || isNaN(parseFloat(value))) return 0;
    return Math.min(100, (parseFloat(value) / kpi.target) * 100);
  };

  const progress = getProgress();
  const formattedTarget = formatTarget(kpi?.target, kpi?.type, kpi?.unit);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-lg rounded-xl border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                <Target className={`w-5 h-5 ${isDark ? 'text-white' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {getLocalizedText('updateKpiValue')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {getKpiText(kpi?.name) || 'KPI Name'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          
          {/* KPI Description - More compact */}
          {kpi?.description && (
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {getKpiText(kpi.description)}
            </p>
          )}
          
          {/* Target and Progress - Side by side */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className={`p-3 rounded-lg border ${
              isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Target className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {getLocalizedText('target')}
                </span>
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formattedTarget}
              </p>
            </div>
            
            {progress > 0 && (
              <div className={`p-3 rounded-lg border ${
                isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className={`w-4 h-4 ${
                    progress >= 100 ? 'text-emerald-500' : 
                    progress >= 80 ? 'text-blue-500' : 'text-amber-500'
                  }`} />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {getLocalizedText('progress')}
                  </span>
                </div>
                <p className={`text-sm font-semibold ${
                  progress >= 100 ? 'text-emerald-600' : 
                  progress >= 80 ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {progress.toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {/* Value Input - More compact */}
          <div className="space-y-3 mb-4">
            <label className={`block text-sm font-medium ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>{getLocalizedText('enterNewValue')} *</span>
              </div>
            </label>
            
            <div className="relative">
              <input
                type="number"
                step="any"
                value={value}
                onChange={handleValueChange}
                placeholder={getPlaceholder()}
                className={`w-full px-4 py-2.5 rounded-lg border text-base font-medium transition-all ${
                  errors.value
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : isDark
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                } focus:ring-2`}
                disabled={isSubmitting}
              />
              
              {/* Unit display */}
              {kpi?.unit && (
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {kpi.unit}
                </div>
              )}
              
              {/* Progress bar */}
              {progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-b-lg overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      progress >= 100 ? 'bg-emerald-500' : 
                      progress >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              )}
            </div>
            
            {errors.value && (
              <div className="flex items-center space-x-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-600 dark:text-red-400">{errors.value}</span>
              </div>
            )}
          </div>

          {/* Notes Input - More compact */}
          <div className="space-y-3 mb-5">
            <label className={`block text-sm font-medium ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <div className="flex items-center space-x-2">
                <span>{getLocalizedText('notes')}</span>
                <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  ({getLocalizedText('optional')})
                </span>
              </div>
            </label>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getLocalizedText('addContext')}
              rows="2"
              className={`w-full px-4 py-2.5 rounded-lg border transition-all resize-none text-sm ${
                isDark
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
              } focus:ring-2`}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">{errors.submit}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {getLocalizedText('cancel')}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !value}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                isSubmitting || !value
                  ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{getLocalizedText('saving')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{getLocalizedText('save')}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};