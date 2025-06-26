import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Save,
  X,
  Clock,
  Calendar,
  FileText,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  Edit3,
  BarChart3,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Activity,
  Minus
} from 'lucide-react';

const StockIssuesTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Date utility functions
  const getCurrentMonth = () => new Date();
  
  const getFirstDayOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const getLastDayOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const getMonthName = (date) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[new Date(date).getMonth()];
  };

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

  // State management
  const [monthlyGoal, setMonthlyGoal] = useState(existingData?.monthlyGoal || 15); // Max 15 problems per month
  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || getCurrentMonth().toISOString().split('T')[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [stockIssues, setStockIssues] = useState(existingData?.stockIssues || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  // New issue form state
  const [newIssue, setNewIssue] = useState({
    date: getCurrentMonth().toISOString().split('T')[0],
    time: getCurrentMonth().toTimeString().slice(0, 5),
    notes: ''
  });
  
  const [editingId, setEditingId] = useState(null);

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
          : 'bg-white border-orange-200 shadow-orange-100/50'
      }`} style={{ width: '280px' }}>
        
        {/* Calendar Header */}
        <div className={`px-3 py-3 ${
          isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-orange-500 to-red-600'
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
                    ? isDark ? 'text-white hover:bg-orange-600' : 'text-slate-900 hover:bg-orange-500 hover:text-white'
                    : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                  }
                  ${dayObj.isSelected 
                    ? 'bg-orange-600 text-white font-bold ring-2 ring-orange-300 shadow-lg' 
                    : ''
                  }
                  ${dayObj.isToday && !dayObj.isSelected
                    ? isDark 
                      ? 'bg-orange-900/40 text-orange-300 ring-1 ring-orange-500' 
                      : 'bg-orange-100 text-orange-800 ring-1 ring-orange-300'
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
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-orange-100 bg-orange-50/50'
        }`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedDate(currentDate.toISOString().split('T')[0]);
                setShowCalendar(false);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                isDark 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
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

  // Get current month's issues
  const getCurrentMonthIssues = () => {
    const monthStart = getFirstDayOfMonth(selectedDate);
    const monthEnd = getLastDayOfMonth(selectedDate);

    return stockIssues.filter(issue => {
      const issueDate = new Date(issue.date);
      return issueDate >= monthStart && issueDate <= monthEnd;
    });
  };

  // Calculate monthly KPI (100% if within goal, 0% if over goal)
  const calculateMonthlyKPI = () => {
    const currentMonthIssues = getCurrentMonthIssues();
    return currentMonthIssues.length <= monthlyGoal ? 100 : 0;
  };

  // Add new issue
  const handleAddIssue = () => {
    if (!newIssue.notes.trim()) {
      setErrors({ notes: 'La description du problème est obligatoire' });
      return;
    }

    const issue = {
      id: Date.now().toString(),
      date: newIssue.date,
      time: newIssue.time,
      notes: newIssue.notes.trim(),
      createdAt: new Date().toISOString()
    };

    setStockIssues(prev => [issue, ...prev]);
    
    // Change automatically to the month of the new entry
    setSelectedDate(newIssue.date);
    
    setNewIssue({
      date: getCurrentMonth().toISOString().split('T')[0],
      time: getCurrentMonth().toTimeString().slice(0, 5),
      notes: ''
    });
    setShowAddForm(false);
    setErrors({});
  };

  // Delete issue
  const handleDeleteIssue = (id) => {
    setStockIssues(prev => prev.filter(issue => issue.id !== id));
  };

  // Edit issue
  const handleEditIssue = (id, updatedIssue) => {
    setStockIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, ...updatedIssue } : issue
    ));
    setEditingId(null);
  };

  // Submit data
  const handleSubmit = () => {
    if (stockIssues.length === 0) {
      setErrors({ issues: 'Ajoutez au moins un problème ou configurez le mois' });
      return;
    }

    const kpi = calculateMonthlyKPI();
    const currentMonthIssues = getCurrentMonthIssues();
    
    const issuesData = {
      value: kpi,
      date: selectedDate,
      monthlyGoal: monthlyGoal,
      stockIssues: stockIssues,
      currentMonthCount: currentMonthIssues.length,
      type: 'stock_issues'
    };
    
    // Call the save function with the correct parameters for Supabase integration
    onSave('warehouses', 'stock_issues_rate', issuesData, `${currentMonthIssues.length} problèmes ce mois (objectif: ≤${monthlyGoal})`);
  };

  // Get month statistics
  const getMonthStats = () => {
    const currentMonthIssues = getCurrentMonthIssues();
    const previousMonth = new Date(new Date(selectedDate).setMonth(new Date(selectedDate).getMonth() - 1));
    const previousMonthStart = getFirstDayOfMonth(previousMonth);
    const previousMonthEnd = getLastDayOfMonth(previousMonth);

    const previousMonthIssues = stockIssues.filter(issue => {
      const issueDate = new Date(issue.date);
      return issueDate >= previousMonthStart && issueDate <= previousMonthEnd;
    });

    return {
      currentMonth: currentMonthIssues.length,
      previousMonth: previousMonthIssues.length,
      trend: currentMonthIssues.length - previousMonthIssues.length
    };
  };

  // Get KPI color
  const getKPIColor = () => {
    const kpi = calculateMonthlyKPI();
    return kpi === 100 ? 'text-emerald-600' : 'text-red-600';
  };

  const kpi = calculateMonthlyKPI();
  const monthStats = getMonthStats();
  const isOverGoal = monthStats.currentMonth > monthlyGoal;
  const currentMonthIssues = getCurrentMonthIssues();
  const selectedDateObj = new Date(selectedDate);
  const currentDate = getCurrentMonth();
  const isCurrentMonth = selectedDateObj.getMonth() === currentDate.getMonth() && 
                        selectedDateObj.getFullYear() === currentDate.getFullYear();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-orange-100'
      }`}>
        
        {/* Modern Header */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-orange-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Contrôle Problèmes de Stock
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  Suivi mensuel des incidents avec gestion d'objectifs intelligente
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  KPI Mensuel
                </div>
                <div 
                  className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${getKPIColor()}`}
                  title={`🚨 FORMULE KPI PROBLÈMES MENSUELS

🎯 CALCUL DU SCORE:
• KPI = Nombre Problèmes Mensuels ≤ Objectif Mensuel ? 100% : 0%

📋 SITUATION ACTUELLE:
• Mois: ${getMonthName(selectedDate)} ${selectedDateObj.getFullYear()}
• Objectif Mensuel: ≤ ${monthlyGoal} problèmes
• Problèmes Actuels: ${monthStats.currentMonth} problèmes
• Reste autorisés: ${Math.max(0, monthlyGoal - monthStats.currentMonth)} problèmes

📊 TENDANCE:
• Mois Précédent: ${monthStats.previousMonth} problèmes
• Évolution: ${monthStats.trend > 0 ? '+' + monthStats.trend : monthStats.trend} problèmes
• Tendance: ${monthStats.trend > 0 ? 'Dégradation' : monthStats.trend < 0 ? 'Amélioration' : 'Stable'}

📈 HISTORIQUE MENSUEL:
• Total problèmes enregistrés: ${stockIssues.length}
• Problèmes ce mois: ${currentMonthIssues.length}

💡 INTERPRÉTATION:
• 100%: Objectif respecté - performance excellente
• 0%: Objectif dépassé - actions correctives nécessaires

Score actuel: ${kpi}%
${isOverGoal ? '🚨 OBJECTIF DÉPASSÉ' : '✅ OBJECTIF RESPECTÉ'}

📌 NOTE: Le calcul se base sur le mois sélectionné avec tous les incidents déclarés pour cette période`}
                >
                  {kpi}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-orange-50/50 border-orange-100'
        }`}>
          <div className="flex items-center justify-between">
            
            {/* Month Selector with Calendar */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-600 text-white hover:border-orange-500 shadow-lg' 
                      : 'bg-white border-orange-200 text-slate-900 hover:border-orange-400 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(selectedDateObj, 'MMMM yyyy')}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
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
              
              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                isCurrentMonth 
                  ? isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {isCurrentMonth ? '📅 Mois actuel' : '📋 Historique'}
              </div>
            </div>

            {/* Stats and Goal Control */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <div className={`text-lg font-semibold text-red-600`}>{monthStats.currentMonth}</div>
                    <div className={`text-xs font-medium text-red-600`}>Problèmes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${monthStats.trend > 0 ? 'bg-red-500' : monthStats.trend < 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className={`text-lg font-semibold ${
                      monthStats.trend > 0 ? 'text-red-600' : monthStats.trend < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {monthStats.trend > 0 ? '+' : ''}{monthStats.trend}
                    </div>
                    <div className={`text-xs font-medium ${
                      monthStats.trend > 0 ? 'text-red-600' : monthStats.trend < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      Tendance
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Goal Setting */}
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-slate-800 border-slate-600' 
                  : 'bg-white border-orange-200'
              }`}>
                <Target className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Objectif:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 0)}
                    className={`w-16 px-2 py-1 text-sm font-semibold text-center rounded border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-orange-200 text-slate-900'
                    }`}
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>max/mois</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0">
          
          {/* Add Form Sidebar */}
          {showAddForm && (
            <div className={`w-80 border-r flex flex-col ${
              isDark 
                ? 'border-slate-700 bg-slate-800/30' 
                : 'border-orange-100 bg-orange-50/30'
            }`}>
              {/* Form Header */}
              <div className="px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Nouveau Problème
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Enregistrer un incident de stock
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={newIssue.date}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                          isDark 
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500' 
                            : 'bg-white border-orange-200 text-slate-900 focus:border-orange-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Heure
                      </label>
                      <input
                        type="time"
                        value={newIssue.time}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, time: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                          isDark 
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500' 
                            : 'bg-white border-orange-200 text-slate-900 focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Description du Problème
                    </label>
                    <textarea
                      value={newIssue.notes}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Décrivez le problème de stock rencontré en détail..."
                      rows={6}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none ${
                        isDark 
                          ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500 placeholder-slate-400' 
                          : 'bg-white border-orange-200 text-slate-900 focus:border-orange-500 placeholder-slate-500'
                      }`}
                    />
                    {errors.notes && (
                      <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Fixed Add Button */}
              <div className={`px-6 py-4 border-t flex-shrink-0 ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-orange-100 bg-white'
              }`}>
                <button
                  onClick={handleAddIssue}
                  disabled={!newIssue.notes.trim()}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    newIssue.notes.trim()
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : isDark 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Ajouter le Problème</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Issues List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Problèmes de {getMonthName(selectedDate)}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {currentMonthIssues.length} incident(s) • Objectif: ≤{monthlyGoal} problèmes/mois
                  </p>
                </div>
              </div>
              
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isDark
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Problème</span>
                  </div>
                </button>
              )}
            </div>

            {stockIssues.length === 0 ? (
              <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                isDark 
                  ? 'border-slate-700 bg-slate-800/50' 
                  : 'border-slate-300 bg-slate-50'
              }`}>
                <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-slate-600' : 'text-slate-400'
                }`} />
                <h3 className={`text-lg font-medium mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-900'
                }`}>
                  Aucun problème enregistré
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  Utilisez le formulaire pour ajouter des incidents de stock
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stockIssues.map((issue) => {
                  const isEditing = editingId === issue.id;
                  const issueDate = new Date(issue.date);
                  const isCurrentMonth = currentMonthIssues.some(i => i.id === issue.id);

                  return (
                    <div
                      key={issue.id}
                      className={`p-5 rounded-2xl border transition-all duration-300 ${
                        isCurrentMonth
                          ? isDark 
                            ? 'border-orange-600 bg-orange-900/10 hover:bg-orange-900/20' 
                            : 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                          : isDark 
                            ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                      } ${isEditing ? 'ring-2 ring-orange-500 shadow-xl' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {issueDate.toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {issue.time}
                              </span>
                            </div>
                            {isCurrentMonth && (
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                              }`}>
                                Ce mois
                              </span>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                defaultValue={issue.notes}
                                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  isDark 
                                    ? 'bg-slate-800 border-slate-600 text-white' 
                                    : 'bg-white border-orange-200 text-slate-900'
                                }`}
                                rows={3}
                                onBlur={(e) => handleEditIssue(issue.id, { notes: e.target.value })}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {issue.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setEditingId(isEditing ? null : issue.id)}
                            className={`p-2 rounded-lg transition-all ${
                              isDark 
                                ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-300' 
                                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                            }`}
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue.id)}
                            className={`p-2 rounded-lg transition-all ${
                              isDark 
                                ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' 
                                : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                            }`}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.issues && (
              <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'
              }`}>
                <p className="text-red-500 font-semibold text-sm">{errors.issues}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-orange-100'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${getKPIColor()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpi}% KPI Mensuel</span>
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {monthStats.currentMonth}/{monthlyGoal} problèmes ce mois
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                {getMonthName(selectedDate)} {selectedDateObj.getFullYear()}
              </div>
              {isOverGoal && (
                <div className="text-sm text-red-600 font-medium">
                  Objectif dépassé de {monthStats.currentMonth - monthlyGoal} problèmes
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
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
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 shadow-sm ${
                  isDark 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
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
  );
};

export default StockIssuesTracker;