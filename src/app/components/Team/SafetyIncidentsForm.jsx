import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Calendar, Target, Save, X, Plus, Trash2, 
  Clock, User, Award, Activity, TrendingUp, UserRound, Users, 
  Edit3, ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';

// Default team members with unique colors
const DEFAULT_EMPLOYEES = [
  { name: 'Rihem', color: 'from-purple-500 to-purple-600' },
  { name: 'Hamza', color: 'from-blue-500 to-blue-600' },
  { name: 'Mohamed', color: 'from-green-500 to-green-600' },
  { name: 'Nassim', color: 'from-orange-500 to-orange-600' },
  { name: 'Tarek', color: 'from-pink-500 to-pink-600' },
  { name: 'Youssef', color: 'from-teal-500 to-teal-600' }
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

export const SafetyIncidentsForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #ef4444 transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-track {
      background: rgba(239, 68, 68, 0.08);
      border-radius: 12px;
      border: 1px solid rgba(239, 68, 68, 0.1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #b91c1c 75%, #991b1b 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 2px 8px rgba(239, 68, 68, 0.3),
        inset 0 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 25%, #991b1b 75%, #7f1d1d 100%);
      box-shadow: 
        0 4px 16px rgba(239, 68, 68, 0.5),
        inset 0 1px 3px rgba(255, 255, 255, 0.5),
        inset 0 -1px 3px rgba(0, 0, 0, 0.2);
      transform: scaleY(1.1);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-track {
      background: rgba(71, 85, 105, 0.2);
      border-radius: 12px;
      border: 1px solid rgba(100, 116, 139, 0.3);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #b91c1c 75%, #991b1b 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 2px 8px rgba(239, 68, 68, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 25%, #991b1b 75%, #7f1d1d 100%);
      box-shadow: 
        0 4px 16px rgba(239, 68, 68, 0.6),
        inset 0 1px 3px rgba(255, 255, 255, 0.3),
        inset 0 -1px 3px rgba(0, 0, 0, 0.3);
      transform: scaleY(1.1);
    }
    
    .custom-scrollbar {
      scroll-behavior: smooth;
    }
  `;

  // Obtenir la date actuelle du système
  const aujourdhui = new Date();

  // Obtenir le nom du mois
  const obtenirNomMois = (date) => {
    const mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois[new Date(date).getMonth()];
  };

  // Custom date formatting function
  const formatDate = (date, formatStr) => {
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const d = new Date(date);
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    
    if (formatStr === 'MMMM yyyy') {
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    }
    if (formatStr === 'dd MMM yyyy') {
      return `${day.toString().padStart(2, '0')} ${month.substring(0, 3)} ${year}`;
    }
    return `${day}/${d.getMonth() + 1}/${year}`;
  };

  // Fonctions utilitaires pour les mois
  const obtenirPremierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const obtenirDernierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const [incidents, setIncidents] = useState(existingData?.incidents || []);
  const [selectedDate, setSelectedDate] = useState(existingData?.date || aujourdhui.toISOString().split('T')[0]);
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 10);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Get employee color
  const getEmployeeColor = (employeeName) => {
    const employee = DEFAULT_EMPLOYEES.find(emp => emp.name === employeeName);
    return employee ? employee.color : 'from-slate-500 to-slate-600';
  };

  // Custom Calendar Component
  const CustomCalendar = () => {
    const currentDate = new Date();
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Previous month's trailing days
      const prevMonth = new Date(year, month - 1, 0);
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonth.getDate() - i,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          date: new Date(year, month - 1, prevMonth.getDate() - i)
        });
      }
      
      // Current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const isToday = dayDate.toDateString() === currentDate.toDateString();
        const isSelected = dayDate.toDateString() === new Date(selectedDate).toDateString();
        
        days.push({
          day,
          isCurrentMonth: true,
          isToday,
          isSelected,
          date: dayDate
        });
      }
      
      // Next month's leading days
      const totalCells = Math.ceil(days.length / 7) * 7;
      const remainingCells = totalCells - days.length;
      for (let day = 1; day <= remainingCells; day++) {
        days.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          date: new Date(year, month + 1, day)
        });
      }
      
      return days;
    };
    
    const days = getDaysInMonth(viewDate);
    
    const navigateMonth = (direction) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + direction);
      setViewDate(newDate);
    };
    
    const selectDay = (dayObj) => {
      setSelectedDate(dayObj.date.toISOString().split('T')[0]);
      setShowCalendar(false);
    };
    
    return (
      <div className={`absolute top-full mt-3 z-50 rounded-xl shadow-xl border overflow-hidden ${
        isDark 
          ? 'bg-slate-900 border-slate-700 shadow-slate-900/50' 
          : 'bg-white border-red-200 shadow-red-100/50'
      }`} style={{ width: '280px' }}>
        
        {/* Calendar Header */}
        <div className={`px-3 py-3 ${
          isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                {monthNames[viewDate.getMonth()]}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {viewDate.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={() => navigateMonth(1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-3">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className={`text-center py-1 text-xs font-bold uppercase tracking-wide ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayObj, index) => (
              <button
                key={index}
                onClick={() => selectDay(dayObj)}
                className={`
                  h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105
                  ${dayObj.isCurrentMonth 
                    ? isDark ? 'text-white hover:bg-red-600' : 'text-slate-900 hover:bg-red-500 hover:text-white'
                    : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                  }
                  ${dayObj.isSelected 
                    ? 'bg-red-600 text-white font-bold ring-2 ring-red-300 shadow-lg' 
                    : ''
                  }
                  ${dayObj.isToday && !dayObj.isSelected
                    ? isDark 
                      ? 'bg-red-900/40 text-red-300 ring-1 ring-red-500' 
                      : 'bg-red-100 text-red-800 ring-1 ring-red-300'
                    : ''
                  }
                `}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className={`px-3 py-2 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-red-100 bg-red-50/50'
        }`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedDate(currentDate.toISOString().split('T')[0]);
                setShowCalendar(false);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Aujourd'hui
            </button>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatDate(new Date(selectedDate), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Get monthly incidents for KPI calculation
  const getMonthlyIncidents = () => {
    const debutMois = obtenirPremierJourMois(selectedDate);
    const finMois = obtenirDernierJourMois(selectedDate);
    
    return incidents.filter(incident => {
      const incidentDate = new Date(incident.date);
      return incidentDate >= debutMois && incidentDate <= finMois;
    });
  };

  // Enhanced KPI calculation with severity weighting - MONTHLY
  const calculateKPI = () => {
    const monthlyIncidents = getMonthlyIncidents();
    
    if (monthlyIncidents.length === 0) return 100; // Perfect score with no incidents
    
    // INSTANT PENALTY: If exceeding monthly target, score drops to 0
    if (monthlyIncidents.length > monthlyTarget) {
      return 0;
    }
    
    // If within target, calculate score based on severity weighting
    const severityWeights = { minor: 5, moderate: 10, major: 20, critical: 40 };
    const totals = { minor: 0, moderate: 0, major: 0, critical: 0 };
    
    monthlyIncidents.forEach(inc => {
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
    setSelectedEmployee(name);
    setShowAddForm(true);
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
      const empIncidents = incidents.filter(inc => inc.employee === emp.name);
      stats[emp.name] = {
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
      monthlyTarget,
      incidents,
      totalIncidents: incidents.length,
      stats: getEmployeeStats(),
      type: 'safety_incidents'
    };
    onSave('safety', 'safety_incidents', safetyData, '');
  };

  // Obtenir couleur KPI basée sur l'objectif
  const obtenirCouleurKPI = () => {
    const currentKPI = calculateKPI();
    if (currentKPI >= 90) return 'text-emerald-600';
    if (currentKPI >= 70) return 'text-amber-600';
    if (currentKPI >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const currentKPI = calculateKPI();
  const monthlyIncidents = getMonthlyIncidents();
  const totalMonthlyIncidents = monthlyIncidents.length;
  const criticalIncidents = monthlyIncidents.filter(inc => inc.severity === 'critical').length;
  const isAtTarget = totalMonthlyIncidents <= monthlyTarget;
  const stats = getEmployeeStats();
  const selectedDateObj = new Date(selectedDate);
  const moisActuel = obtenirNomMois(selectedDate);
  const anneeActuelle = new Date(selectedDate).getFullYear();

  // Détection du mois actuel
  const dateMoisSelectionne = new Date(selectedDate);
  const estMoisActuel = dateMoisSelectionne.getMonth() === aujourdhui.getMonth() && 
                       dateMoisSelectionne.getFullYear() === aujourdhui.getFullYear();

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
        <div className={`w-full max-w-7xl h-[95vh] sm:h-[85vh] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-100'
        }`}>
          
          {/* En-tête moderne */}
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>
                    Sécurité & Incidents
                  </h1>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'} truncate`}>
                    Suivi mensuel avec scoring de sécurité
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                <div className="text-right">
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    KPI Mensuel
                  </div>
                  <div 
                    className={`text-2xl sm:text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                    title={`🛡️ FORMULE SCORE SÉCURITÉ MENSUEL

⚠️ RÈGLE CRITIQUE: Si incidents > ${monthlyTarget} → Score = 0% (échec instant)

Si incidents ≤ ${monthlyTarget}:
Score = 100 - (Pénalités par gravité)

💥 PÉNALITÉS PAR GRAVITÉ:
• Mineur: -5 points par incident
• Modéré: -10 points par incident  
• Majeur: -20 points par incident
• Critique: -40 points par incident

📊 SITUATION MENSUELLE:
• Mois: ${moisActuel} ${anneeActuelle}
• Total incidents: ${totalMonthlyIncidents} (limite: ${monthlyTarget})
• Mineur: ${monthlyIncidents.filter(i => i.severity === 'minor').length}
• Modéré: ${monthlyIncidents.filter(i => i.severity === 'moderate').length}
• Majeur: ${monthlyIncidents.filter(i => i.severity === 'major').length}
• Critique: ${monthlyIncidents.filter(i => i.severity === 'critical').length}

📈 CALCUL DÉTAILLÉ:
${totalMonthlyIncidents > monthlyTarget ? '🚨 LIMITE DÉPASSÉE - SCORE = 0%' : `Score final: ${currentKPI}%`}

🎯 OBJECTIF MENSUEL:
• Limite: ${monthlyTarget} incidents maximum par mois

💡 INTERPRÉTATION:
• 90-100%: Sécurité excellente
• 70-89%: Sécurité acceptable
• 50-69%: Attention requise
• <50%: Action corrective urgente

${currentKPI >= 90 ? '✅ EXCELLENTE SÉCURITÉ' : currentKPI >= 70 ? '⚠️ SÉCURITÉ ACCEPTABLE' : currentKPI >= 50 ? '🚨 ATTENTION REQUISE' : '🆘 ACTION URGENTE'}`}
                  >
                    {currentKPI}%
                  </div>
                </div>
                <button 
                  onClick={onCancel} 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Panneau de contrôle intelligent */}
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-red-50/50 border-red-100'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              
              {/* Sélecteur de date avec calendrier */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white hover:border-red-500 shadow-lg' 
                        : 'bg-white border-red-200 text-slate-900 hover:border-red-400 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{formatDate(selectedDateObj, 'dd MMM yyyy')}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showCalendar ? 'rotate-90' : ''} flex-shrink-0`} />
                  </button>

                  {/* Custom Calendar Dropdown */}
                  {showCalendar && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowCalendar(false)}
                      />
                      <CustomCalendar />
                    </>
                  )}
                </div>
                
                <div className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium ${
                  estMoisActuel 
                    ? isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {estMoisActuel ? '📅 Mois actuel' : '📋 Historique'}
                </div>
              </div>

              {/* Métriques en temps réel */}
              <div className="flex items-center space-x-4 overflow-x-auto">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    

                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                   
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div>

                    </div>
                  </div>
                </div>
                
                {/* Objectif modifiable */}
                <div className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-xl border flex-shrink-0 ${
                  isDark 
                    ? 'bg-slate-800 border-slate-600' 
                    : 'bg-white border-red-200'
                }`}>
                  <Target className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'} flex-shrink-0`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} hidden sm:block`}>Limite:</div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setMonthlyTarget(Math.max(0, monthlyTarget - 1))}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs font-bold ${
                        isDark 
                          ? 'bg-red-700 hover:bg-red-600 text-white' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                      className={`w-12 text-center text-sm font-semibold rounded-md py-1 outline-none ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-red-500' 
                          : 'bg-white border-red-200 text-slate-900 focus:border-red-500'
                      } border`}
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>/mois</span>
                    <button
                      onClick={() => setMonthlyTarget(Math.min(50, monthlyTarget + 1))}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs font-bold ${
                        isDark 
                          ? 'bg-red-700 hover:bg-red-600 text-white' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Bouton ajout */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${
                  showAddForm
                    ? isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : isDark ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' : 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span className="hidden sm:inline">{showAddForm ? 'Annuler' : 'Signaler Incident'}</span>
                  <span className="sm:hidden">{showAddForm ? 'Fermer' : 'Ajouter'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            
            {/* Formulaire d'ajout (si affiché) */}
            {showAddForm && (
              <div className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r flex flex-col ${
                isDark 
                  ? 'border-slate-700 bg-slate-800/30' 
                  : 'border-red-100 bg-red-50/30'
              }`}>
                {/* Form Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Signaler un Incident
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Déclarez rapidement un incident de sécurité
                  </p>
                </div>
                
                {/* Scrollable Form Content */}
                <div className={`flex-1 px-4 sm:px-6 overflow-y-auto custom-scrollbar ${
                  isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
                }`}>
                  <div className="pb-4">
                    <IncidentForm 
                      onAddIncident={addIncident}
                      selectedEmployee={selectedEmployee}
                      setSelectedEmployee={setSelectedEmployee}
                      isDark={isDark}
                      setShowAddForm={setShowAddForm}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Liste des incidents ou état de sécurité */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>
                      {monthlyIncidents.length > 0 ? `Incidents de ${moisActuel}` : `État de Sécurité par Employé`}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} truncate`}>
                      {monthlyIncidents.length > 0 
                        ? `${totalMonthlyIncidents} incident(s) • ${criticalIncidents} critique(s) • Score: ${currentKPI}%`
                        : `Surveillance de la sécurité de l'équipe • Limite: ${monthlyTarget} incidents/mois`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {monthlyIncidents.length > 0 ? (
                <div className="space-y-3">
                  {monthlyIncidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onDelete={removeIncident}
                      isDark={isDark}
                      getEmployeeColor={getEmployeeColor}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {DEFAULT_EMPLOYEES.map(employee => (
                    <EmployeeSafetyCard
                      key={employee.name}
                      employee={employee}
                      incidents={incidents}
                      onQuickAdd={addQuickEmployee}
                      isDark={isDark}
                      calculateEmployeeSafetyKPI={calculateEmployeeSafetyKPI}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pied de page */}
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-100'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className={`flex items-center space-x-2 ${obtenirCouleurKPI()}`}>
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{currentKPI}% Score Sécurité</span>
                </div>
                <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {totalMonthlyIncidents}/{monthlyTarget} incidents • {criticalIncidents} critique(s)
                </div>
                <div className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {moisActuel} {anneeActuelle}
                </div>
              </div>
              
              <div className="flex space-x-3 flex-shrink-0">
                <button
                  onClick={onCancel}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                    isDark 
                      ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 text-red-400' 
                      : 'border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 shadow-sm ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Incident Card Component with modern styling
const IncidentCard = ({ incident, onDelete, isDark, getEmployeeColor }) => {
  const getTypeData = (type) => QUICK_INCIDENTS.find(t => t.id === type);
  const getSeverityData = (severity) => SEVERITY_LEVELS.find(s => s.id === severity);
  
  const typeData = getTypeData(incident.type);
  const severityData = getSeverityData(incident.severity);

  // Simplified severity indicator - just a colored dot
  const getSeverityIndicator = () => {
    const colors = {
      minor: 'bg-emerald-500',
      moderate: 'bg-amber-500', 
      major: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    return colors[incident.severity] || colors.minor;
  };

  return (
    <div className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800' 
        : 'bg-white/80 border-slate-200/50 hover:border-slate-300 hover:bg-white'
    }`}>
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Subtle Employee Avatar */}
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${getEmployeeColor(incident.employee)} flex items-center justify-center flex-shrink-0 text-white text-sm font-medium shadow-sm`}>
            {incident.employee.charAt(0).toUpperCase()}
          </div>
          
          {/* Employee Name & Type */}
          <div>
            <div className="flex items-center space-x-2">
              <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {incident.employee}
              </h4>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                • {typeData?.label}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              {/* Severity Indicator Dot */}
              <div className={`w-2 h-2 rounded-full ${getSeverityIndicator()}`}></div>
              <span className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {severityData?.label}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {incident.time}
              </span>
            </div>
          </div>
        </div>
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(incident.id)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
            isDark 
              ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' 
              : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Description */}
      <div className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {incident.description}
      </div>
    </div>
  );
};

// Employee Safety Card Component with modern styling and colorful avatars
const EmployeeSafetyCard = ({ employee, incidents, onQuickAdd, isDark, calculateEmployeeSafetyKPI }) => {
  const employeeIncidents = incidents.filter(inc => inc.employee === employee.name);
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
    <div className={`p-3 rounded-xl border transition-all hover:shadow-lg ${
      isDark 
        ? 'bg-slate-800 border-slate-700 hover:border-red-500/50' 
        : 'bg-white border-slate-200 hover:border-red-300'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Avatar employé avec couleurs vives */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${employee.color} flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg`}>
          {employee.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>
                  {employee.name}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  safetyStatus.color === 'red' ? (isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700') :
                  safetyStatus.color === 'orange' ? (isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-700') :
                  safetyStatus.color === 'amber' ? (isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700') :
                  isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {safetyStatus.status === 'critical' ? '🚨' :
                   safetyStatus.status === 'danger' ? '⚠️' :
                   safetyStatus.status === 'warning' ? '⚠️' :
                   safetyStatus.status === 'caution' ? '⚠️' :
                   '✅'}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Score:
                  </span>
                  <div 
                    className={`text-sm font-bold cursor-help ${
                      employeeSafetyScore >= 90 ? 'text-emerald-600' :
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

Incidents de ${employee.name}:
• Mineur: ${employeeIncidents.filter(i => i.severity === 'minor').length}
• Modéré: ${employeeIncidents.filter(i => i.severity === 'moderate').length}
• Majeur: ${employeeIncidents.filter(i => i.severity === 'major').length}
• Critique: ${employeeIncidents.filter(i => i.severity === 'critical').length}

Score final: ${employeeSafetyScore}%`}
                  >
                    {employeeSafetyScore}%
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total:
                  </span>
                  <div className={`text-sm font-medium ${
                    totalIncidents === 0 ? 'text-slate-600' : 'text-red-600'
                  }`}>
                    {totalIncidents}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Critiques:
                  </span>
                  <div className={`text-sm font-medium ${
                    criticalIncidents === 0 ? 'text-slate-600' : 'text-red-600'
                  }`}>
                    {criticalIncidents}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onQuickAdd(employee.name)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                isDark 
                  ? 'hover:bg-red-900/30 text-red-400' 
                  : 'hover:bg-red-50 text-red-500'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate Incident Form Component with modern styling
const IncidentForm = ({ onAddIncident, selectedEmployee, setSelectedEmployee, isDark, setShowAddForm }) => {
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
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Employé concerné
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isDark 
              ? 'bg-slate-800 border-slate-600 text-white' 
              : 'bg-white border-red-200 text-slate-900'
          }`}
        >
          <option value="">Sélectionner un employé...</option>
          {DEFAULT_EMPLOYEES.map(emp => (
            <option key={emp.name} value={emp.name}>{emp.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Type d'incident
        </label>
        <select
          value={incidentData.type}
          onChange={(e) => setIncidentData(prev => ({ ...prev, type: e.target.value }))}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isDark 
              ? 'bg-slate-800 border-slate-600 text-white' 
              : 'bg-white border-red-200 text-slate-900'
          }`}
        >
          {QUICK_INCIDENTS.map(type => (
            <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Niveau de gravité
        </label>
        <select
          value={incidentData.severity}
          onChange={(e) => setIncidentData(prev => ({ ...prev, severity: e.target.value }))}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isDark 
              ? 'bg-slate-800 border-slate-600 text-white' 
              : 'bg-white border-red-200 text-slate-900'
          }`}
        >
          {SEVERITY_LEVELS.map(level => (
            <option key={level.id} value={level.id}>{level.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Description détaillée
        </label>
        <textarea
          value={incidentData.description}
          onChange={(e) => setIncidentData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez l'incident en détail..."
          rows="4"
          className={`w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isDark 
              ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
              : 'bg-white border-red-200 text-slate-900 placeholder-slate-500'
          }`}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedEmployee || !incidentData.description.trim()}
        className={`w-full py-3 font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
          selectedEmployee && incidentData.description.trim()
            ? isDark 
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-slate-400 text-white cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Signaler l'Incident</span>
        </div>
      </button>

      {/* Info section */}
      <div className={`p-3 rounded-lg border ${
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <Shield className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <p className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            Impact Sécurité
          </p>
        </div>
        <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <div>• Chaque incident impacte le score mensuel</div>
          <div>• Soyez précis dans la description</div>
          <div>• Les incidents critiques ont un impact majeur</div>
        </div>
      </div>
    </div>
  );
};