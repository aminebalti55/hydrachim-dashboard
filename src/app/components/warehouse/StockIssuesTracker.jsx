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
  XCircle
} from 'lucide-react';

const StockIssuesTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // State management
  const [weeklyGoal, setWeeklyGoal] = useState(existingData?.weeklyGoal || 5); // Max 5 problems per week
  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || new Date().toISOString().split('T')[0]
  );
  const [stockIssues, setStockIssues] = useState(existingData?.stockIssues || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});
  
  // New issue form state
  const [newIssue, setNewIssue] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });
  
  const [editingId, setEditingId] = useState(null);

  // Helper functions to get week boundaries
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getSundayOfWeek = (date) => {
    const monday = getMondayOfWeek(date);
    return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get current week's issues
  const getCurrentWeekIssues = () => {
    const weekStart = getMondayOfWeek(selectedDate);
    const weekEnd = getSundayOfWeek(selectedDate);

    return stockIssues.filter(issue => {
      const issueDate = new Date(issue.date);
      return issueDate >= weekStart && issueDate <= weekEnd;
    });
  };

  // Calculate KPI (100% if within goal, 0% if over goal)
  const calculateKPI = () => {
    const currentWeekIssues = getCurrentWeekIssues();
    return currentWeekIssues.length <= weeklyGoal ? 100 : 0;
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
    setNewIssue({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
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
      setErrors({ issues: 'Ajoutez au moins un problème ou configurez la semaine' });
      return;
    }

    const kpi = calculateKPI();
    const currentWeekIssues = getCurrentWeekIssues();
    
    const issuesData = {
      value: kpi,
      date: selectedDate,
      weeklyGoal: weeklyGoal,
      stockIssues: stockIssues,
      currentWeekCount: currentWeekIssues.length,
      type: 'stock_issues'
    };
    
    onSave('warehouses', 'stock_issues_rate', issuesData, `${currentWeekIssues.length} problèmes cette semaine (objectif: ≤${weeklyGoal})`);
  };

  // Get week statistics
  const getWeekStats = () => {
    const currentWeekIssues = getCurrentWeekIssues();
    const previousWeekStart = getMondayOfWeek(new Date(new Date(selectedDate).getTime() - 7 * 24 * 60 * 60 * 1000));
    const previousWeekEnd = getSundayOfWeek(new Date(new Date(selectedDate).getTime() - 7 * 24 * 60 * 60 * 1000));

    const previousWeekIssues = stockIssues.filter(issue => {
      const issueDate = new Date(issue.date);
      return issueDate >= previousWeekStart && issueDate <= previousWeekEnd;
    });

    return {
      currentWeek: currentWeekIssues.length,
      previousWeek: previousWeekIssues.length,
      trend: currentWeekIssues.length - previousWeekIssues.length
    };
  };

  // Quick week selection
  const selectThisWeek = () => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    setSelectedDate(formatDate(monday));
  };

  const selectLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monday = getMondayOfWeek(lastWeek);
    setSelectedDate(formatDate(monday));
  };

  const selectNextWeek = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monday = getMondayOfWeek(nextWeek);
    setSelectedDate(formatDate(monday));
  };

  const handleDateChange = (dateString) => {
    const selectedDate = new Date(dateString);
    const monday = getMondayOfWeek(selectedDate);
    setSelectedDate(formatDate(monday));
  };

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-500 focus:ring-orange-500/20'
  }`;

  const kpi = calculateKPI();
  const weekStats = getWeekStats();
  const isOverGoal = weekStats.currentWeek > weeklyGoal;
  const currentWeekIssues = getCurrentWeekIssues();
  const mondayOfWeek = getMondayOfWeek(selectedDate);
  const sundayOfWeek = getSundayOfWeek(selectedDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl border flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Taux de Problèmes de Stock
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Suivi hebdomadaire des incidents et problèmes de stockage
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-sm font-medium">KPI Hebdomadaire</div>
                <div className={`text-3xl font-bold ${
                  isOverGoal ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {kpi}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`p-3 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            
            {/* Left Column - Controls & Overview */}
            <div className={`w-2/5 border-r p-8 overflow-y-auto ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            }`}>
              
              {/* Date Settings */}
              <div className={`p-6 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Période de Suivi
                  </h4>
                </div>
                <div className="space-y-4">
                  {/* Quick Week Selection */}
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Sélection Rapide
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={selectLastWeek}
                        className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
                          isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Semaine Dernière
                      </button>
                      <button
                        onClick={selectThisWeek}
                        className={`px-3 py-2 text-xs font-semibold rounded transition-colors bg-orange-600 text-white hover:bg-orange-700`}
                      >
                        Cette Semaine
                      </button>
                      <button
                        onClick={selectNextWeek}
                        className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
                          isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Semaine Prochaine
                      </button>
                    </div>
                  </div>
                  
                  {/* Date Picker */}
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Ou Choisir une Date (sélectionne automatiquement la semaine)
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className={baseInputClasses}
                    />
                    <p className={`text-xs mt-2 font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      📅 Semaine du {mondayOfWeek.toLocaleDateString('fr-FR')} au {sundayOfWeek.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Objectif Maximum par Semaine
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={weeklyGoal}
                      onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 0)}
                      className={baseInputClasses}
                    />
                    <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Nombre maximum de problèmes autorisés par semaine
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Overview */}
              <div className="space-y-4 mb-6">
                {/* Weekly KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          KPI Hebdomadaire
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Respect de l'Objectif
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      isOverGoal ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {kpi}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs px-2 py-1 rounded-lg font-semibold inline-block ${
                      isOverGoal
                        ? isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                        : isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      Objectif: ≤ {weeklyGoal} problèmes/semaine
                    </div>
                  </div>
                </div>

                {/* Today's Performance */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Performance Semaine
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {currentWeekIssues.length} problème(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isOverGoal ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {weekStats.currentWeek}
                      </div>
                      <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        sur {weeklyGoal} max
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  isOverGoal
                    ? isDark ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'
                    : isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isOverGoal ? 'bg-red-600' : 'bg-emerald-600'
                    }`}>
                      {isOverGoal ? <XCircle className="w-4 h-4 text-white" /> : <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${
                        isOverGoal 
                          ? isDark ? 'text-red-400' : 'text-red-700'
                          : isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        {weekStats.currentWeek}
                      </div>
                      <div className={`text-xs font-semibold ${
                        isOverGoal 
                          ? isDark ? 'text-red-300' : 'text-red-600'
                          : isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}>
                        Cette semaine
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  weekStats.trend > 0
                    ? isDark ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'
                    : weekStats.trend < 0
                    ? isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      weekStats.trend > 0 ? 'bg-red-600' : weekStats.trend < 0 ? 'bg-emerald-600' : 'bg-slate-600'
                    }`}>
                      {weekStats.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-white" />
                      ) : weekStats.trend < 0 ? (
                        <TrendingDown className="w-4 h-4 text-white" />
                      ) : (
                        <BarChart3 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${
                        weekStats.trend > 0 
                          ? isDark ? 'text-red-400' : 'text-red-700'
                          : weekStats.trend < 0
                          ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                          : isDark ? 'text-slate-400' : 'text-slate-700'
                      }`}>
                        {weekStats.trend > 0 ? `+${weekStats.trend}` : weekStats.trend}
                      </div>
                      <div className={`text-xs font-semibold ${
                        weekStats.trend > 0 
                          ? isDark ? 'text-red-300' : 'text-red-600'
                          : weekStats.trend < 0
                          ? isDark ? 'text-emerald-300' : 'text-emerald-600'
                          : isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Tendance
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Issue Form */}
              <div className={`rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`p-6 ${showAddForm ? 'border-b' : ''} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Nouveau Problème
                        </h4>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Enregistrez un incident de stock
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
                        showAddForm
                          ? isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{showAddForm ? 'Annuler' : 'Ajouter'}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {showAddForm && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Date du Problème
                          </label>
                          <input
                            type="date"
                            value={newIssue.date}
                            onChange={(e) => setNewIssue(prev => ({ ...prev, date: e.target.value }))}
                            className={baseInputClasses}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Heure d'Occurrence
                          </label>
                          <input
                            type="time"
                            value={newIssue.time}
                            onChange={(e) => setNewIssue(prev => ({ ...prev, time: e.target.value }))}
                            className={baseInputClasses}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                          Description du Problème
                        </label>
                        <textarea
                          value={newIssue.notes}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Décrivez le problème de stock rencontré en détail..."
                          rows={4}
                          className={baseInputClasses}
                        />
                        {errors.notes && (
                          <p className="text-red-500 text-xs mt-2 font-medium">{errors.notes}</p>
                        )}
                        {!newIssue.notes.trim() && (
                          <p className={`text-xs mt-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            ⚠️ La description est obligatoire pour ajouter un problème
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleAddIssue}
                          className={`px-8 py-3 rounded-lg text-sm font-semibold transition-colors ${
                            newIssue.notes.trim()
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : isDark 
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!newIssue.notes.trim()}
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Ajouter le Problème</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Issues List */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Problèmes de la Semaine ({currentWeekIssues.length})
                    </h4>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Du {mondayOfWeek.toLocaleDateString('fr-FR')} au {sundayOfWeek.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {stockIssues.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'
                }`}>
                  <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Aucun problème enregistré
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Utilisez le formulaire ci-contre pour ajouter des problèmes de stock
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockIssues.map((issue) => {
                    const isEditing = editingId === issue.id;
                    const issueDate = new Date(issue.date);
                    const isCurrentWeek = currentWeekIssues.some(i => i.id === issue.id);

                    return (
                      <div
                        key={issue.id}
                        className={`p-6 rounded-xl border transition-colors ${
                          isCurrentWeek
                            ? isDark 
                              ? 'border-orange-600 bg-orange-900/10 hover:bg-orange-900/20' 
                              : 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                            : isDark 
                              ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
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
                              {isCurrentWeek && (
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                  isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  Cette semaine
                                </span>
                              )}
                            </div>
                            
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  defaultValue={issue.notes}
                                  className={baseInputClasses}
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
                              className={`p-2 rounded-lg transition-colors ${
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
                              className={`p-2 rounded-lg transition-colors ${
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
                  isDark ? 'border-red-700 bg-red-900' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.issues}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Performance Hebdomadaire: <span className={`text-lg ${
                isOverGoal ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {kpi}%
              </span> • {weekStats.currentWeek}/{weeklyGoal} problèmes • {isOverGoal ? '⚠️ OBJECTIF DÉPASSÉ' : '✅ OBJECTIF RESPECTÉ'}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors bg-orange-600 hover:bg-orange-700"
              >
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockIssuesTracker;