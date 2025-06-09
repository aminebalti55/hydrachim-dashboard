import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Save,
  X,
  Calendar,
  Target,
  Clock,
  Trash2,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Edit3
} from 'lucide-react';

const FormulationTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [monthlyGoal, setMonthlyGoal] = useState(existingData?.monthlyGoal || 4);
  const [formulas, setFormulas] = useState(existingData?.formulas || []);
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    finishDate: '',
    isCompleted: false
  });

  // Calculate development duration in days
  const calculateDuration = (startDate, finishDate) => {
    if (!startDate || !finishDate) return 0;
    const start = new Date(startDate);
    const finish = new Date(finishDate);
    const diffTime = Math.abs(finish - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 1000));
  };

  // Format duration display
  const formatDuration = (days) => {
    if (days === 0) return '0 jour';
    if (days === 1) return '1 jour';
    if (days < 7) return `${days} jours`;
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    if (weeks === 1 && remainingDays === 0) return '1 semaine';
    if (weeks === 1) return `1 semaine ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
    if (remainingDays === 0) return `${weeks} semaines`;
    return `${weeks} semaines ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
  };

  // Get current month formulas
  const getCurrentMonthFormulas = () => {
    const currentMonth = selectedDate.substring(0, 7); // YYYY-MM
    return formulas.filter(formula => {
      const formulaMonth = formula.finishDate?.substring(0, 7);
      return formulaMonth === currentMonth;
    });
  };

  // Get formula status
  const getFormulaStatus = (formula) => {
    if (formula.isCompleted) return 'completed';
    
    const today = new Date();
    const finishDate = new Date(formula.finishDate);
    
    if (finishDate < today) return 'overdue';
    return 'in_progress';
  };

  // Calculate monthly KPI
  const calculateMonthlyKPI = () => {
    const monthlyFormulas = getCurrentMonthFormulas();
    const completedFormulas = monthlyFormulas.filter(f => f.isCompleted);
    
    if (monthlyGoal === 0) return 0;
    
    const achievementRate = (completedFormulas.length / monthlyGoal) * 100;
    return Math.min(Math.round(achievementRate), 100);
  };

  // Calculate average development time
  const calculateAverageDevelopmentTime = () => {
    const completedFormulas = formulas.filter(f => f.isCompleted);
    if (completedFormulas.length === 0) return 0;
    
    const totalDays = completedFormulas.reduce((sum, formula) => {
      return sum + calculateDuration(formula.startDate, formula.finishDate);
    }, 0);
    
    return Math.round(totalDays / completedFormulas.length);
  };

  // Get development statistics
  const getDevelopmentStats = () => {
    const currentMonthFormulas = getCurrentMonthFormulas();
    const total = formulas.length;
    const monthlyTotal = currentMonthFormulas.length;
    const completed = formulas.filter(f => f.isCompleted).length;
    const monthlyCompleted = currentMonthFormulas.filter(f => f.isCompleted).length;
    const inProgress = formulas.filter(f => !f.isCompleted && getFormulaStatus(f) === 'in_progress').length;
    const overdue = formulas.filter(f => getFormulaStatus(f) === 'overdue').length;
    const averageDays = calculateAverageDevelopmentTime();
    
    return {
      total,
      monthlyTotal,
      completed,
      monthlyCompleted,
      inProgress,
      overdue,
      averageDays,
      remaining: monthlyGoal - monthlyCompleted
    };
  };

  const addFormula = () => {
    if (!newFormula.name.trim()) {
      setErrors({ name: 'Le nom de la formule est requis' });
      return;
    }

    if (!newFormula.startDate) {
      setErrors({ startDate: 'La date de début est requise' });
      return;
    }

    if (!newFormula.finishDate) {
      setErrors({ finishDate: 'La date de fin est requise' });
      return;
    }

    const startDate = new Date(newFormula.startDate);
    const finishDate = new Date(newFormula.finishDate);
    
    if (finishDate <= startDate) {
      setErrors({ finishDate: 'La date de fin doit être après la date de début' });
      return;
    }

    const formula = {
      id: Date.now(),
      name: newFormula.name.trim(),
      startDate: newFormula.startDate,
      finishDate: newFormula.finishDate,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    setFormulas(prev => [...prev, formula]);
    setNewFormula({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      finishDate: '',
      isCompleted: false
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removeFormula = (formulaId) => {
    setFormulas(prev => prev.filter(f => f.id !== formulaId));
  };

  const updateFormula = (formulaId, field, value) => {
    setFormulas(prev => prev.map(formula => 
      formula.id === formulaId ? { ...formula, [field]: value } : formula
    ));
  };

  const handleSubmit = () => {
    if (formulas.length === 0) {
      setErrors({ formulas: 'Ajoutez au moins une formule' });
      return;
    }
    
    const monthlyKPI = calculateMonthlyKPI();
    const stats = getDevelopmentStats();
    
    const formulationData = {
      value: monthlyKPI,
      date: selectedDate,
      monthlyGoal: monthlyGoal,
      formulas: formulas,
      stats: stats,
      type: 'formulation_development'
    };
    
    onSave('rnd', 'formulation_development', formulationData, '');
  };

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20'
  }`;

  const stats = getDevelopmentStats();
  const monthlyKPI = calculateMonthlyKPI();

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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Développement de Nouvelles Formules
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Suivi des objectifs mensuels et des délais de développement
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-sm font-medium">KPI Mensuel</div>
                <div className={`text-3xl font-bold ${
                  monthlyKPI >= 100 ? 'text-emerald-600' : 
                  monthlyKPI >= 75 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {monthlyKPI}%
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
              
              {/* Date & Goal Settings */}
              <div className={`p-6 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Configuration
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Période de Suivi
                    </label>
                    <input
                      type="month"
                      value={selectedDate.substring(0, 7)}
                      onChange={(e) => setSelectedDate(e.target.value + '-01')}
                      className={baseInputClasses}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Objectif Mensuel
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 1)}
                        className={`flex-1 ${baseInputClasses}`}
                      />
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        formules/mois
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Overview */}
              <div className="space-y-4 mb-6">
                {/* Monthly KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Performance Mensuelle
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Objectif vs Réalisé
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      monthlyKPI >= 100 ? 'text-emerald-600' : 
                      monthlyKPI >= 75 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {monthlyKPI}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs px-2 py-1 rounded-lg font-semibold inline-block ${
                      monthlyKPI >= 100 
                        ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : monthlyKPI >= 75
                        ? isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                        : isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.monthlyCompleted}/{monthlyGoal} formules
                    </div>
                  </div>
                </div>

                {/* Average Development Time */}
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
                          Temps Moyen
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Développement
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {stats.averageDays > 0 ? formatDuration(stats.averageDays) : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining Target */}
              <div className={`p-6 rounded-xl border mb-4 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Restant à Développer
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Pour atteindre l'objectif
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    stats.remaining <= 0 ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    {Math.max(0, stats.remaining)}
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {stats.total}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        Total
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {stats.completed}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        Terminées
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-amber-900 border-amber-800' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        {stats.inProgress}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                        En Cours
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {stats.overdue}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                        En Retard
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Formula Form */}
              <div className={`rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`p-6 ${showAddForm ? 'border-b' : ''} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 mr-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                          Nouvelle Formule
                        </h4>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Enregistrez une nouvelle formule
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${
                        showAddForm
                          ? isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
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
                      <div>
                        <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                          Nom de la Formule
                        </label>
                        <input
                          type="text"
                          value={newFormula.name}
                          onChange={(e) => setNewFormula(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Détergent Bio Innovant"
                          className={baseInputClasses}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-2 font-medium">{errors.name}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Date de Début
                          </label>
                          <input
                            type="date"
                            value={newFormula.startDate}
                            onChange={(e) => setNewFormula(prev => ({ ...prev, startDate: e.target.value }))}
                            className={baseInputClasses}
                          />
                          {errors.startDate && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.startDate}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Date de Fin Prévue
                          </label>
                          <input
                            type="date"
                            value={newFormula.finishDate}
                            onChange={(e) => setNewFormula(prev => ({ ...prev, finishDate: e.target.value }))}
                            className={baseInputClasses}
                          />
                          {errors.finishDate && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.finishDate}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={addFormula}
                          className="px-8 py-3 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Ajouter la Formule</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Formulas List */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Formules en Développement ({formulas.length})
                    </h4>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Gérez vos formules et suivez leur progression
                    </p>
                  </div>
                </div>
              </div>

              {formulas.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'
                }`}>
                  <FlaskConical className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Aucune formule en développement
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Utilisez le formulaire ci-contre pour ajouter votre première formule
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formulas.map((formula, index) => {
                    const duration = calculateDuration(formula.startDate, formula.finishDate);
                    const status = getFormulaStatus(formula);
                    
                    return (
                      <div 
                        key={formula.id}
                        className={`p-6 rounded-xl border transition-colors ${
                          isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {/* Formula Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {formula.name}
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Début: {new Date(formula.startDate).toLocaleDateString('fr-FR')}
                              </div>
                              <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <Clock className="w-4 h-4 inline mr-1" />
                                Fin: {new Date(formula.finishDate).toLocaleDateString('fr-FR')}
                              </div>
                              <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                                formula.isCompleted
                                  ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                  : status === 'overdue'
                                  ? isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                                  : isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {formula.isCompleted ? '✅ Terminée' : 
                                 status === 'overdue' ? '⚠️ En Retard' : '⏳ En Cours'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFormula(formula.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                            }`}
                            title="Supprimer la formule"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Completion Controls */}
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => updateFormula(formula.id, 'isCompleted', !formula.isCompleted)}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                              formula.isCompleted
                                ? isDark ? 'bg-emerald-900 text-emerald-400 border border-emerald-700' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : isDark ? 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{formula.isCompleted ? 'Terminée' : 'Marquer comme terminée'}</span>
                          </button>
                          
                          <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Durée: {formatDuration(duration)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.formulas && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.formulas}</p>
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
              Performance Mensuelle: <span className={`text-lg ${
                monthlyKPI >= 100 ? 'text-emerald-600' : 
                monthlyKPI >= 75 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {monthlyKPI}%
              </span> • {stats.monthlyCompleted}/{monthlyGoal} formules développées
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
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors bg-emerald-600 hover:bg-emerald-700"
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

export default FormulationTracker;