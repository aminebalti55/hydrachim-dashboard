import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Save,
  X,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Trash2,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const RawMaterialsReceptionTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Helper function to get Monday of any given date
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to get Sunday of any given date
  const getSundayOfWeek = (date) => {
    const monday = getMondayOfWeek(date);
    return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || new Date().toISOString().split('T')[0]
  );
  const [weeklyTarget] = useState(90);
  const [receptions, setReceptions] = useState(existingData?.receptions || []);
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReception, setNewReception] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    productName: '',
    productType: 'matiere_premiere',
    quantity: 1,
    isConforme: null
  });

  // Calculate daily KPI based on receptions for that day
  const calculateDailyKPI = (date) => {
    const dayReceptions = receptions.filter(r => r.date === date);
    if (dayReceptions.length === 0) return 100;
    
    const conformeCount = dayReceptions.filter(r => r.isConforme === true).length;
    const totalCount = dayReceptions.length;
    
    return Math.round((conformeCount / totalCount) * 100);
  };

  // Calculate weekly KPI average for selected week
  const calculateWeeklyKPI = () => {
    const weekStart = getMondayOfWeek(selectedDate);
    const weekEnd = getSundayOfWeek(selectedDate);
    
    const weekReceptions = receptions.filter(r => {
      const receptionDate = new Date(r.date);
      return receptionDate >= weekStart && receptionDate <= weekEnd;
    });
    
    if (weekReceptions.length === 0) return 0;
    
    const receptionsByDate = weekReceptions.reduce((acc, reception) => {
      if (!acc[reception.date]) {
        acc[reception.date] = [];
      }
      acc[reception.date].push(reception);
      return acc;
    }, {});

    const dailyKPIs = Object.keys(receptionsByDate).map(date => {
      const dayReceptions = receptionsByDate[date];
      const conformeCount = dayReceptions.filter(r => r.isConforme === true).length;
      const totalCount = dayReceptions.length;
      return (conformeCount / totalCount) * 100;
    });

    if (dailyKPIs.length === 0) return 0;
    
    const averageKPI = dailyKPIs.reduce((sum, kpi) => sum + kpi, 0) / dailyKPIs.length;
    return Math.round(averageKPI);
  };

  // Get statistics for selected week
  const getStats = () => {
    const weekStart = getMondayOfWeek(selectedDate);
    const weekEnd = getSundayOfWeek(selectedDate);
    
    const weekReceptions = receptions.filter(r => {
      const receptionDate = new Date(r.date);
      return receptionDate >= weekStart && receptionDate <= weekEnd;
    });
    
    const total = weekReceptions.length;
    const conforme = weekReceptions.filter(r => r.isConforme === true).length;
    const nonConforme = weekReceptions.filter(r => r.isConforme === false).length;
    const pending = weekReceptions.filter(r => r.isConforme === null).length;
    
    return {
      total,
      conforme,
      nonConforme,
      pending,
      conformeRate: total > 0 ? Math.round((conforme / total) * 100) : 0
    };
  };

  const getTodayReceptions = () => {
    const today = new Date().toISOString().split('T')[0];
    return receptions.filter(r => r.date === today);
  };

  const addReception = () => {
    if (!newReception.productName.trim()) {
      setErrors({ productName: 'Le nom du produit est requis' });
      return;
    }

    const reception = {
      id: Date.now(),
      date: newReception.date,
      time: newReception.time,
      productName: newReception.productName.trim(),
      productType: newReception.productType,
      quantity: newReception.quantity,
      isConforme: null,
      createdAt: new Date().toISOString()
    };

    setReceptions(prev => [...prev, reception]);
    setNewReception({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      productName: '',
      productType: 'matiere_premiere',
      quantity: 1,
      isConforme: null
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removeReception = (receptionId) => {
    setReceptions(prev => prev.filter(r => r.id !== receptionId));
  };

  const updateReceptionStatus = (receptionId, isConforme) => {
    setReceptions(prev => prev.map(reception => 
      reception.id === receptionId ? { ...reception, isConforme } : reception
    ));
  };

  const handleSubmit = () => {
    if (receptions.length === 0) {
      setErrors({ receptions: 'Ajoutez au moins une réception' });
      return;
    }
    
    const weeklyKPI = calculateWeeklyKPI();
    const stats = getStats();
    
    const receptionData = {
      value: weeklyKPI,
      date: selectedDate,
      weeklyTarget: weeklyTarget,
      receptions: receptions,
      stats: stats,
      type: 'raw_materials_reception'
    };
    
    onSave('quality', 'material_batch_acceptance_rate', receptionData, '');
  };

  // Handle date change - automatically set to Monday of selected week
  const handleDateChange = (dateString) => {
    const selectedDate = new Date(dateString);
    const monday = getMondayOfWeek(selectedDate);
    setSelectedDate(formatDate(monday));
  };

  // Quick week selection buttons
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

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20'
  }`;

  const stats = getStats();
  const weeklyKPI = calculateWeeklyKPI();
  const todayReceptions = getTodayReceptions();

  // Get filtered receptions for selected week
  const getWeekReceptions = () => {
    const weekStart = getMondayOfWeek(selectedDate);
    const weekEnd = getSundayOfWeek(selectedDate);
    
    return receptions.filter(r => {
      const receptionDate = new Date(r.date);
      return receptionDate >= weekStart && receptionDate <= weekEnd;
    });
  };

  const weekReceptions = getWeekReceptions();
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Taux des Matières Premières et Emballage Non Conforme à la Réception
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Suivi des contrôles qualité à la réception des matières premières et emballages
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-sm font-medium">KPI Hebdomadaire</div>
                <div className={`text-3xl font-bold ${
                  weeklyKPI >= weeklyTarget ? 'text-emerald-600' : 
                  weeklyKPI >= weeklyTarget * 0.8 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {weeklyKPI}%
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
                        className={`px-3 py-2 text-xs font-semibold rounded transition-colors bg-emerald-600 text-white hover:bg-emerald-700`}
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
                    <p className={`text-xs mt-2 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      📅 Semaine du {mondayOfWeek.toLocaleDateString('fr-FR')} au {sundayOfWeek.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Objectif Hebdomadaire
                    </label>
                    <div className={`px-4 py-3 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}>
                      ≥ {weeklyTarget}% de conformité
                    </div>
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
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          KPI Hebdomadaire
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Taux de Conformité
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      weeklyKPI >= weeklyTarget ? 'text-emerald-600' : 
                      weeklyKPI >= weeklyTarget * 0.8 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {weeklyKPI}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs px-2 py-1 rounded-lg font-semibold inline-block ${
                      weeklyKPI >= weeklyTarget 
                        ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : weeklyKPI >= weeklyTarget * 0.8
                        ? isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                        : isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      Objectif: ≥ {weeklyTarget}%
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
                          Performance Aujourd'hui
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {todayReceptions.length} réception(s)
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      calculateDailyKPI(new Date().toISOString().split('T')[0]) >= 95 ? 'text-emerald-600' : 
                      calculateDailyKPI(new Date().toISOString().split('T')[0]) >= 85 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {calculateDailyKPI(new Date().toISOString().split('T')[0])}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {stats.conforme}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        Conforme
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {stats.nonConforme}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                        Non Conforme
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Reception Form */}
              <div className={`rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`p-6 ${showAddForm ? 'border-b' : ''} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Nouvelle Réception
                        </h4>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Enregistrez l'arrivée de matières premières
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Date de Réception
                          </label>
                          <input
                            type="date"
                            value={newReception.date}
                            onChange={(e) => setNewReception(prev => ({ ...prev, date: e.target.value }))}
                            className={baseInputClasses}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Heure d'Arrivée
                          </label>
                          <input
                            type="time"
                            value={newReception.time}
                            onChange={(e) => setNewReception(prev => ({ ...prev, time: e.target.value }))}
                            className={baseInputClasses}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                          Nom du Produit
                        </label>
                        <input
                          type="text"
                          value={newReception.productName}
                          onChange={(e) => setNewReception(prev => ({ ...prev, productName: e.target.value }))}
                          placeholder="Ex: Acide Citrique 25kg"
                          className={baseInputClasses}
                        />
                        {errors.productName && (
                          <p className="text-red-500 text-xs mt-2 font-medium">{errors.productName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Type de Produit
                          </label>
                          <select
                            value={newReception.productType}
                            onChange={(e) => setNewReception(prev => ({ ...prev, productType: e.target.value }))}
                            className={baseInputClasses}
                          >
                            <option value="matiere_premiere">Matière Première</option>
                            <option value="emballage">Emballage</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Quantité
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newReception.quantity}
                            onChange={(e) => setNewReception(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            className={baseInputClasses}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={addReception}
                          className="px-8 py-3 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Ajouter la Réception</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Receptions List */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Réceptions de la Semaine ({stats.total})
                    </h4>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Du {mondayOfWeek.toLocaleDateString('fr-FR')} au {sundayOfWeek.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {weekReceptions.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'
                }`}>
                  <Package className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Aucune réception pour cette semaine
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Utilisez le formulaire ci-contre pour ajouter des réceptions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weekReceptions.map((reception, index) => (
                    <div 
                      key={reception.id}
                      className={`p-6 rounded-xl border transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Reception Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {reception.productName}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(reception.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              <Clock className="w-4 h-4 inline mr-1" />
                              {reception.time}
                            </div>
                            <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                              reception.productType === 'matiere_premiere'
                                ? isDark ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-700'
                                : isDark ? 'bg-purple-900 text-purple-400' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {reception.productType === 'matiere_premiere' ? 'Matière Première' : 'Emballage'}
                            </div>
                            <div className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              Qté: {reception.quantity}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeReception(reception.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                          }`}
                          title="Supprimer la réception"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Conformity Controls */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => updateReceptionStatus(reception.id, true)}
                          className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                            reception.isConforme === true
                              ? isDark ? 'bg-emerald-900 text-emerald-400 border border-emerald-700' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : isDark ? 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>Conforme</span>
                        </button>
                        <button
                          onClick={() => updateReceptionStatus(reception.id, false)}
                          className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                            reception.isConforme === false
                              ? isDark ? 'bg-red-900 text-red-400 border border-red-700' : 'bg-red-100 text-red-700 border border-red-300'
                              : isDark ? 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-red-900/30' : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-red-50'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          <span>Non Conforme</span>
                        </button>
                        {reception.isConforme === null && (
                          <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold ${
                            isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                            <span>En attente de contrôle</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.receptions && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.receptions}</p>
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
                weeklyKPI >= weeklyTarget ? 'text-emerald-600' : 
                weeklyKPI >= weeklyTarget * 0.8 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {weeklyKPI}%
              </span> • {stats.conforme}/{stats.total} conforme • Objectif: ≥ {weeklyTarget}%
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

export default RawMaterialsReceptionTracker;