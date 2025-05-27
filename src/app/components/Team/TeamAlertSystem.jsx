import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  TrendingDown, 
  X, 
  Eye, 
  EyeOff, 
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  ListChecks
} from 'lucide-react';

export const TeamAlertSystem = ({ 
  alerts = [], 
  onDismissAlert, 
  onOpenForm,
  isDark, 
  className = '' 
}) => {
  const [showAll, setShowAll] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getAlertIcon = (type) => {
    const iconClass = `w-5 h-5 text-white`;

    switch (type) {
      case 'safety':
        return <Shield className={iconClass} />;
      case 'attendance':
        return <Users className={iconClass} />;
      case 'efficiency':
        return <ListChecks className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return isDark 
          ? 'bg-red-900/30 border-red-700/50 text-red-200'
          : 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return isDark 
          ? 'bg-amber-900/30 border-amber-700/50 text-amber-200'
          : 'bg-amber-100 border-amber-300 text-amber-800';
      default:
        return isDark 
          ? 'bg-blue-900/30 border-blue-700/50 text-blue-200'
          : 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high':
        return "Action Urgente";
      case 'medium':
        return "Attention Requise";
      default:
        return "Information";
    }
  };

  const getAlertTypeText = (type) => {
    switch (type) {
      case 'safety':
        return "Alerte de Sécurité";
      case 'attendance':
        return "Alerte de Présence";
      case 'efficiency':
        return "Alerte de Performance";
      default:
        return "Alerte Système";
    }
  };

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }
  };

  // FIXED: Add form opening functionality
  const handleOpenForm = (kpiId) => {
    if (onOpenForm) {
      onOpenForm(kpiId);
    }
  };

  // FIXED: Filter alerts based on selected filter
  const getFilteredAlerts = () => {
    let filtered = alerts.filter(alert => alert && !dismissedAlerts.has(alert.id));
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedFilter);
    }
    
    return filtered;
  };

  const visibleAlerts = getFilteredAlerts();
  const displayedAlerts = showAll ? visibleAlerts : visibleAlerts.slice(0, 5);
  const hasMoreAlerts = visibleAlerts.length > 5;

  // FIXED: Enhanced filter functionality
  const alertTypes = ['all', 'safety', 'attendance', 'efficiency'];
  const getFilterLabel = (type) => {
    switch (type) {
      case 'all': return 'Toutes';
      case 'safety': return 'Sécurité';
      case 'attendance': return 'Présence';
      case 'efficiency': return 'Efficacité';
      default: return type;
    }
  };

  if (visibleAlerts.length === 0 && selectedFilter === 'all') {
    return (
      <div className={`rounded-2xl border ${
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
      } ${className} overflow-hidden`}>
        <div className="px-8 py-5 border-b mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Système d'Alerte
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Aucune alerte active
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center pb-12 px-6">
          <div className={`w-16 h-16 rounded-full ${
            isDark ? 'bg-green-900/20' : 'bg-green-50'
          } flex items-center justify-center mx-auto mb-4`}>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Excellent
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Tous les objectifs sont atteints. Aucune action requise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${
      isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200/80 shadow-sm'
    } ${className} overflow-hidden`}>
      
      {/* Alert Header */}
      <div className="px-8 py-5 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
            visibleAlerts.some(a => a.severity === 'high') ? 'from-red-500 to-red-600' :
            visibleAlerts.some(a => a.severity === 'medium') ? 'from-amber-500 to-amber-600' : 'from-blue-500 to-blue-600'
          } flex items-center justify-center shadow-lg`}>
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Système d'Alerte
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {visibleAlerts.length} {visibleAlerts.length === 1 ? 'alerte active' : 'alertes actives'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {/* FIXED: Enhanced filter dropdown */}
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                isDark 
                  ? 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {alertTypes.map(type => (
                <option key={type} value={type}>
                  {getFilterLabel(type)}
                </option>
              ))}
            </select>
          </div>
          
          {hasMoreAlerts && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-blue-800/40 text-blue-200 hover:bg-blue-800/60'
                  : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              }`}
            >
              {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAll ? "Afficher Moins" : "Voir Tout"}</span>
            </button>
          )}
        </div>
      </div>

      {/* FIXED: Handle case when no alerts match filter */}
      {visibleAlerts.length === 0 && selectedFilter !== 'all' ? (
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full ${
            isDark ? 'bg-slate-700/50' : 'bg-slate-100'
          } flex items-center justify-center mx-auto mb-4`}>
            <Filter className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Aucune alerte de ce type
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Aucune alerte {getFilterLabel(selectedFilter).toLowerCase()} trouvée.
          </p>
        </div>
      ) : (
        <>
          {/* Alert List */}
          <div className="p-6 space-y-4">
            {displayedAlerts.map((alert, index) => (
              <div
                key={`${alert.id}_${index}`}
                className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-lg ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    
                    {/* Alert Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.severity === 'high' ? isDark ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-red-500 to-red-600' : 
                      alert.severity === 'medium' ? isDark ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                      isDark ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    {/* Alert Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {getSeverityText(alert.severity)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          alert.severity === 'high' ? 
                            isDark ? 'bg-red-800/50 text-red-200' : 'bg-red-200 text-red-800' :
                          alert.severity === 'medium' ? 
                            isDark ? 'bg-amber-800/50 text-amber-200' : 'bg-amber-200 text-amber-800' :
                            isDark ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-200 text-blue-800'
                        }`}>
                          {getAlertTypeText(alert.type)}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs opacity-75">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {alert.kpiId && (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>KPI: {alert.kpiId.replace(/_/g, ' ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className={`ml-3 p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-300'
                        : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Summary */}
          <div className="px-6 pb-6 space-y-4">
            <div className={`p-5 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                
                <div>
                  <div className={`text-lg font-bold ${
                    alerts.filter(a => a && a.severity === 'high').length > 0 ? 
                      isDark ? 'text-red-400' : 'text-red-600' : 
                      isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {alerts.filter(a => a && a.severity === 'high').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Haute Priorité
                  </div>
                </div>
                
                <div>
                  <div className={`text-lg font-bold ${
                    alerts.filter(a => a && a.severity === 'medium').length > 0 ? 
                      isDark ? 'text-amber-400' : 'text-amber-600' : 
                      isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {alerts.filter(a => a && a.severity === 'medium').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Priorité Moyenne
                  </div>
                </div>
                
                <div>
                  <div className={`text-lg font-bold ${
                    alerts.filter(a => a && a.severity === 'low').length > 0 ? 
                      isDark ? 'text-blue-400' : 'text-blue-600' : 
                      isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {alerts.filter(a => a && a.severity === 'low').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Priorité Basse
                  </div>
                </div>
              </div>
            </div>

            {/* FIXED: Enhanced Quick Actions for Alerts */}
            <div className={`p-5 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Actions Rapides
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {alerts.some(a => a && a.type === 'attendance') && (
                  <button 
                    onClick={() => handleOpenForm('team_productivity_attendance')}
                    className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm shadow-sm"
                  >
                    Ajouter un Registre de Présence
                  </button>
                )}
                
                {alerts.some(a => a && a.type === 'safety') && (
                  <button 
                    onClick={() => handleOpenForm('safety_incidents')}
                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors text-sm shadow-sm"
                  >
                    Ajouter un Rapport d'Incident
                  </button>
                )}
                
                {alerts.some(a => a && a.type === 'efficiency') && (
                  <button 
                    onClick={() => handleOpenForm('operator_efficiency')}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors text-sm shadow-sm"
                  >
                    Gestion des Tâches
                  </button>
                )}
                
                <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                  isDark 
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-300 text-slate-800 hover:bg-slate-400'
                }`}>
                  Générer un Rapport
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};