import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Calendar, Target, Save, X, Plus, Trash2, 
  Clock, User, Award, Activity, TrendingUp, UserRound, Users, 
  Edit3
} from 'lucide-react';

// Default team members
const DEFAULT_EMPLOYEES = [
  'Rihem', 'Hamza', 'Mohamed', 'Nassim', 'Tarek', 'Youssef'
];

// Simplified incident types for quick selection
const QUICK_INCIDENTS = [
  { id: 'equipment', label: 'Équipement', icon: '🔧', color: 'blue' },
  { id: 'chemical', label: 'Chimique', icon: '☣️', color: 'purple' },
  { id: 'facility', label: 'Installation', icon: '🏭', color: 'gray' },
  { id: 'environmental', label: 'Environnement', icon: '🌱', color: 'green' },
  { id: 'electrical', label: 'Électrique', icon: '⚡', color: 'yellow' },
  { id: 'other', label: 'Autre', icon: '⚠️', color: 'red' }
];

const SEVERITY_LEVELS = [
  { id: 'minor', label: 'Mineur', color: 'green' },
  { id: 'moderate', label: 'Modéré', color: 'yellow' },
  { id: 'major', label: 'Majeur', color: 'orange' },
  { id: 'critical', label: 'Critique', color: 'red' }
];

// Incident Card Component
const IncidentCard = ({ incident, onDelete, isDark }) => {
  const getTypeData = (type) => QUICK_INCIDENTS.find(t => t.id === type);
  const getSeverityData = (severity) => SEVERITY_LEVELS.find(s => s.id === severity);
  
  const typeData = getTypeData(incident.type);
  const severityData = getSeverityData(incident.severity);

  const getSeverityColor = () => {
    const colors = {
      minor: isDark ? 'bg-green-900/30 text-green-400 border-green-700/50' : 'bg-green-100 text-green-700 border-green-300',
      moderate: isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      major: isDark ? 'bg-orange-900/30 text-orange-400 border-orange-700/50' : 'bg-orange-100 text-orange-700 border-orange-300',
      critical: isDark ? 'bg-red-900/30 text-red-400 border-red-700/50' : 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[incident.severity] || colors.minor;
  };

  return (
    <div className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-lg group min-w-0 ${
      isDark 
        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2 min-w-0">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            incident.severity === 'critical' ? 'bg-red-600 text-white' :
            incident.severity === 'major' ? 'bg-orange-600 text-white' :
            incident.severity === 'moderate' ? 'bg-amber-600 text-white' :
            'bg-green-600 text-white'
          }`}>
            {incident.employee.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>
              {incident.employee}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                🕐 {incident.time}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getSeverityColor()}`}>
                {severityData?.label}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(incident.id)}
          className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${
            isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
          }`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Incident Details */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${
            typeData?.color === 'blue' ? (isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' : 'bg-blue-100 text-blue-700 border-blue-300') :
            typeData?.color === 'purple' ? (isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700/50' : 'bg-purple-100 text-purple-700 border-purple-300') :
            typeData?.color === 'green' ? (isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50' : 'bg-emerald-100 text-emerald-700 border-emerald-300') :
            typeData?.color === 'yellow' ? (isDark ? 'bg-amber-900/30 text-amber-400 border-amber-700/50' : 'bg-amber-100 text-amber-700 border-amber-300') :
            typeData?.color === 'red' ? (isDark ? 'bg-red-900/30 text-red-400 border-red-700/50' : 'bg-red-100 text-red-700 border-red-300') :
            isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {typeData?.icon} {typeData?.label}
          </span>
        </div>
        
        <div className={`text-xs p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} leading-tight`}>
            {incident.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Employee Safety Card Component
const EmployeeSafetyCard = ({ employee, incidents, onQuickAdd, isDark, calculateEmployeeSafetyKPI }) => {
  const employeeIncidents = incidents.filter(inc => inc.employee === employee);
  const criticalIncidents = employeeIncidents.filter(inc => inc.severity === 'critical').length;
  const totalIncidents = employeeIncidents.length;
  const employeeSafetyScore = calculateEmployeeSafetyKPI(employeeIncidents);
  
  const getSafetyStatus = () => {
    if (criticalIncidents > 0) return { status: 'critical', color: 'red', level: 'critical' };
    if (employeeSafetyScore < 60) return { status: 'danger', color: 'red', level: 'high' };
    if (employeeSafetyScore < 80) return { status: 'warning', color: 'orange', level: 'medium' };
    if (totalIncidents > 0) return { status: 'caution', color: 'amber', level: 'low' };
    return { status: 'safe', color: 'slate', level: 'none' };
  };

  const safetyStatus = getSafetyStatus();

  return (
    <div className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-lg group min-w-0 ${
      isDark 
        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2 min-w-0">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            safetyStatus.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
            safetyStatus.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
            safetyStatus.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
            'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
          }`}>
            {employee.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>
              {employee}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                safetyStatus.color === 'red' ? (isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700') :
                safetyStatus.color === 'orange' ? (isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-700') :
                safetyStatus.color === 'amber' ? (isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700') :
                isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                {safetyStatus.status === 'critical' ? '🚨 Critique' :
                 safetyStatus.status === 'danger' ? '⚠️ Danger' :
                 safetyStatus.status === 'warning' ? '⚠️ Attention' :
                 safetyStatus.status === 'caution' ? '⚠️ Prudence' :
                 '✅ Sécurisé'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onQuickAdd(employee)}
          className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${
            isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
          }`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div 
            className={`text-lg font-bold cursor-help ${
              employeeSafetyScore >= 90 ? 'text-slate-600' :
              employeeSafetyScore >= 70 ? 'text-amber-600' :
              employeeSafetyScore >= 50 ? 'text-orange-600' : 'text-red-600'
            }`}
            title={`Score Sécurité Individuel:

Score = 100 - (Pénalités par Gravité)

Pénalités par incident:
• Mineur: -5 points
• Modéré: -10 points  
• Majeur: -20 points
• Critique: -40 points

Incidents de ${employee}:
• Mineur: ${employeeIncidents.filter(i => i.severity === 'minor').length}
• Modéré: ${employeeIncidents.filter(i => i.severity === 'moderate').length}
• Majeur: ${employeeIncidents.filter(i => i.severity === 'major').length}
• Critique: ${employeeIncidents.filter(i => i.severity === 'critical').length}

Score final: ${employeeSafetyScore}%`}
          >
            {employeeSafetyScore}%
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>
            Score
          </div>
        </div>
        
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className={`text-lg font-bold ${
            totalIncidents === 0 ? 'text-slate-600' : 'text-red-600'
          }`}>
            {totalIncidents}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>
            Total
          </div>
        </div>
        
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className={`text-lg font-bold ${
            criticalIncidents === 0 ? 'text-slate-600' : 'text-red-600'
          }`}>
            {criticalIncidents}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>Critiques</div>
        </div>
      </div>

      {/* Recent Incidents */}
      {employeeIncidents.length > 0 && (
        <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'} truncate`}>
              Derniers incidents
            </span>
          </div>
          <div className="space-y-1">
            {employeeIncidents.slice(-2).map((inc, idx) => (
              <div key={idx} className={`text-xs p-1 rounded ${isDark ? 'bg-slate-600/50' : 'bg-white'}`}>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {QUICK_INCIDENTS.find(t => t.id === inc.type)?.icon} {inc.time} - {SEVERITY_LEVELS.find(s => s.id === inc.severity)?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SafetyIncidentsForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [incidents, setIncidents] = useState(existingData?.incidents || []);
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 3);
  // Auto-calculate monthly target based on weekly (4 weeks)
  const monthlyTarget = weeklyTarget * 4;
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Enhanced KPI calculation with severity weighting and instant penalty
  const calculateKPI = () => {
    if (incidents.length === 0) return 100; // Perfect score with no incidents
    
    // INSTANT PENALTY: If exceeding weekly target, score drops to 0
    if (incidents.length > weeklyTarget) {
      return 0;
    }
    
    // If within target, calculate score based on severity weighting
    const severityWeights = { minor: 5, moderate: 10, major: 20, critical: 40 };
    const totals = { minor: 0, moderate: 0, major: 0, critical: 0 };
    
    incidents.forEach(inc => {
      if (totals[inc.severity] !== undefined) {
        totals[inc.severity]++;
      }
    });
    
    const totalPenalty = Object.entries(totals).reduce(
      (sum, [severity, count]) => sum + severityWeights[severity] * count, 
      0
    );
    
    const finalScore = Math.max(0, 100 - totalPenalty);
    return Math.round(finalScore);
  };

  // Calculate individual employee safety score
  const calculateEmployeeSafetyKPI = (employeeIncidents) => {
    if (employeeIncidents.length === 0) return 100;
    
    const severityWeights = { minor: 5, moderate: 10, major: 20, critical: 40 };
    const totals = { minor: 0, moderate: 0, major: 0, critical: 0 };
    
    employeeIncidents.forEach(inc => {
      if (totals[inc.severity] !== undefined) {
        totals[inc.severity]++;
      }
    });
    
    const penalty = Object.entries(totals).reduce(
      (sum, [severity, count]) => sum + severityWeights[severity] * count, 
      0
    );
    
    return Math.max(0, 100 - penalty);
  };

  const addQuickEmployee = (name) => {
    // Set selected employee for quick incident creation
    setSelectedEmployee(name);
  };

  const addIncident = (employee, type = 'equipment', severity = 'minor', description = '') => {
    if (!description.trim() || !employee) return;

    const incident = {
      id: Date.now(),
      employee: employee,
      type: type,
      severity: severity,
      description: description.trim(),
      time: new Date().toTimeString().slice(0, 5),
      date: selectedDate
    };

    setIncidents([...incidents, incident]);
  };

  const removeIncident = (id) => {
    setIncidents(incidents.filter(inc => inc.id !== id));
  };

  const getEmployeeStats = () => {
    const stats = {};
    DEFAULT_EMPLOYEES.forEach(emp => {
      const empIncidents = incidents.filter(inc => inc.employee === emp);
      stats[emp] = {
        total: empIncidents.length,
        critical: empIncidents.filter(inc => inc.severity === 'critical').length,
        today: empIncidents.filter(inc => inc.date === selectedDate).length
      };
    });
    return stats;
  };

  const handleSubmit = () => {
    const kpiScore = calculateKPI();
    const safetyData = {
      value: kpiScore,
      date: selectedDate,
      weeklyTarget,
      monthlyTarget,
      incidents,
      totalIncidents: incidents.length,
      stats: getEmployeeStats(),
      type: 'safety_incidents'
    };
    onSave('safety', 'safety_incidents', safetyData, '');
  };

  const currentKPI = calculateKPI();
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(inc => inc.severity === 'critical').length;
  const isAtTarget = totalIncidents <= weeklyTarget;
  const stats = getEmployeeStats();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                currentKPI >= 90 ? 'bg-gradient-to-br from-slate-500 to-slate-600' :
                currentKPI >= 70 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                currentKPI >= 50 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Sécurité & Incidents
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Suivi moderne des incidents de sécurité
                </p>
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div 
                  className={`text-2xl font-bold cursor-help ${
                    currentKPI >= 90 ? 'text-slate-600' :
                    currentKPI >= 70 ? 'text-amber-500' :
                    currentKPI >= 50 ? 'text-orange-500' : 'text-red-500'
                  }`}
                  title={`Formule Score Sécurité Globale:

⚠️ RÈGLE CRITIQUE: Si incidents > ${weeklyTarget} → Score = 0% (échec instant)

Si incidents ≤ ${weeklyTarget}:
Score = 100 - (Pénalités par gravité)

Pénalités par gravité:
• Mineur: -5 points par incident
• Modéré: -10 points par incident  
• Majeur: -20 points par incident
• Critique: -40 points par incident

Situation actuelle:
• Total incidents: ${totalIncidents} (limite: ${weeklyTarget})
• Mineur: ${incidents.filter(i => i.severity === 'minor').length}
• Modéré: ${incidents.filter(i => i.severity === 'moderate').length}
• Majeur: ${incidents.filter(i => i.severity === 'major').length}
• Critique: ${incidents.filter(i => i.severity === 'critical').length}

${totalIncidents > weeklyTarget ? '🚨 LIMITE DÉPASSÉE - SCORE = 0%' : `Score final: ${currentKPI}%`}

Limite mensuelle: ${monthlyTarget} (${weeklyTarget} × 4 semaines)`}
                >
                  {currentKPI}%
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Score Sécurité
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  totalIncidents === 0 ? 'text-slate-600' : 'text-red-500'
                }`}>
                  {totalIncidents}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Incidents
                </div>
              </div>
              
              <button onClick={onCancel} className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-900 hover:text-slate-800'
              }`}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-160px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Quick Settings */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Limite Hebdo (Mensuel: {monthlyTarget})
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Employee Safety Cards or Incidents List */}
            {incidents.length > 0 ? (
              <div>
                <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Incidents Signalés ({incidents.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
                  {incidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onDelete={removeIncident}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  État de Sécurité par Employé
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
                  {DEFAULT_EMPLOYEES.map(employee => (
                    <EmployeeSafetyCard
                      key={employee}
                      employee={employee}
                      incidents={incidents}
                      onQuickAdd={addQuickEmployee}
                      isDark={isDark}
                      calculateEmployeeSafetyKPI={calculateEmployeeSafetyKPI}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={`w-80 border-l ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="p-4 space-y-3">
              <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Signaler Incident
              </h4>

              {/* Quick Incident Form */}
              <IncidentForm 
                onAddIncident={addIncident}
                selectedEmployee={selectedEmployee}
                setSelectedEmployee={setSelectedEmployee}
                isDark={isDark}
              />

              {/* Compact Team Overview */}
              {Object.keys(stats).some(emp => stats[emp].total > 0) && (
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  <h5 className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Résumé
                  </h5>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Incidents:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{totalIncidents}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Critiques:</span>
                      <span className={`font-semibold ${criticalIncidents === 0 ? 'text-slate-500' : 'text-red-500'}`}>
                        {criticalIncidents}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Score:</span>
                      <span className={`font-semibold ${
                        currentKPI >= 90 ? 'text-slate-500' :
                        currentKPI >= 70 ? 'text-amber-500' :
                        currentKPI >= 50 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {currentKPI}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} flex-1 min-w-0 pr-4`}>
              <span className="truncate">
                Score: <span className={`font-bold ${
                  totalIncidents > weeklyTarget ? 'text-red-600' :
                  currentKPI >= 90 ? 'text-slate-600' :
                  currentKPI >= 70 ? 'text-amber-600' :
                  currentKPI >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {currentKPI}%
                </span> • {totalIncidents}/{weeklyTarget} incidents {totalIncidents > weeklyTarget ? '(LIMITE DÉPASSÉE)' : ''} • {criticalIncidents} critique(s)
              </span>
            </div>
            
            <div className="flex space-x-3 flex-shrink-0">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate Incident Form Component
const IncidentForm = ({ onAddIncident, selectedEmployee, setSelectedEmployee, isDark }) => {
  const [incidentData, setIncidentData] = useState({
    type: 'equipment',
    severity: 'minor',
    description: ''
  });

  const handleSubmit = () => {
    if (!selectedEmployee || !incidentData.description.trim()) return;
    
    onAddIncident(selectedEmployee, incidentData.type, incidentData.severity, incidentData.description);
    setIncidentData({ type: 'equipment', severity: 'minor', description: '' });
    setSelectedEmployee('');
  };

  return (
    <div className="space-y-3">
      <div>
        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Employé
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className={`w-full px-2 py-1.5 text-xs rounded-lg border ${
            isDark 
              ? 'bg-slate-700 border-slate-600 text-white' 
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <option value="">Sélectionner...</option>
          {DEFAULT_EMPLOYEES.map(emp => (
            <option key={emp} value={emp}>{emp}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Type d'incident
        </label>
        <select
          value={incidentData.type}
          onChange={(e) => setIncidentData(prev => ({ ...prev, type: e.target.value }))}
          className={`w-full px-2 py-1.5 text-xs rounded-lg border ${
            isDark 
              ? 'bg-slate-700 border-slate-600 text-white' 
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {QUICK_INCIDENTS.map(type => (
            <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Gravité
        </label>
        <select
          value={incidentData.severity}
          onChange={(e) => setIncidentData(prev => ({ ...prev, severity: e.target.value }))}
          className={`w-full px-2 py-1.5 text-xs rounded-lg border ${
            isDark 
              ? 'bg-slate-700 border-slate-600 text-white' 
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {SEVERITY_LEVELS.map(level => (
            <option key={level.id} value={level.id}>{level.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Description
        </label>
        <textarea
          value={incidentData.description}
          onChange={(e) => setIncidentData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Décrire l'incident..."
          rows="3"
          className={`w-full px-2 py-1.5 text-xs rounded-lg border resize-none ${
            isDark 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
          }`}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedEmployee || !incidentData.description.trim()}
        className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
          selectedEmployee && incidentData.description.trim()
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
            : isDark ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
        }`}
      >
        Signaler Incident
      </button>
    </div>
  );
};