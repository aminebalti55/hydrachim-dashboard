import React, { useState, useMemo } from 'react';
import {
  Zap,
  Plus,
  Save,
  X,
  Calendar,
  Target,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Activity,
  Trash2,
  Receipt,
  Bolt,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Wallet
} from 'lucide-react';

const EnergyConsumptionTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || new Date().toISOString().split('T')[0]
  );
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 2500); // kWh per month
  const [monthlyBudget, setMonthlyBudget] = useState(existingData?.monthlyBudget || 800); // TND per month
  const [consumptionEntries, setConsumptionEntries] = useState(existingData?.consumptionEntries || []);
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    consumption: '',
    billAmount: '',
    notes: '',
    billPeriodStart: '',
    billPeriodEnd: ''
  });

  // Get current month entries
  const getCurrentMonthEntries = () => {
    const currentMonth = selectedDate.substring(0, 7); // YYYY-MM
    return consumptionEntries.filter(entry => {
      const entryMonth = entry.date.substring(0, 7);
      return entryMonth === currentMonth;
    });
  };

  // Calculate energy KPI (binary: 100% if within target, 0% if exceeded)
  const calculateEnergyKPI = () => {
    const monthEntries = getCurrentMonthEntries();
    const totalConsumption = monthEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    
    return totalConsumption <= monthlyTarget ? 100 : 0;
  };

  // Calculate money KPI (binary: 100% if within budget, 0% if exceeded)
  const calculateMoneyKPI = () => {
    const monthEntries = getCurrentMonthEntries();
    const totalCost = monthEntries.reduce((sum, entry) => sum + (entry.billAmount || 0), 0);
    
    return totalCost <= monthlyBudget ? 100 : 0;
  };

  // Calculate overall KPI (average of both KPIs)
  const calculateOverallKPI = () => {
    const energyKPI = calculateEnergyKPI();
    const moneyKPI = calculateMoneyKPI();
    return Math.round((energyKPI + moneyKPI) / 2);
  };

  // Calculate energy statistics
  const getEnergyStats = () => {
    const monthEntries = getCurrentMonthEntries();
    const totalConsumption = monthEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    const totalCost = monthEntries.reduce((sum, entry) => sum + (entry.billAmount || 0), 0);
    const entriesCount = monthEntries.length;
    const averageConsumption = entriesCount > 0 ? totalConsumption / entriesCount : 0;
    const energyRemaining = Math.max(0, monthlyTarget - totalConsumption);
    const budgetRemaining = Math.max(0, monthlyBudget - totalCost);
    const isOverEnergyTarget = totalConsumption > monthlyTarget;
    const isOverBudget = totalCost > monthlyBudget;
    
    return {
      totalConsumption,
      totalCost,
      entriesCount,
      averageConsumption,
      energyRemaining,
      budgetRemaining,
      isOverEnergyTarget,
      isOverBudget,
      energyKPI: calculateEnergyKPI(),
      moneyKPI: calculateMoneyKPI(),
      overallKPI: calculateOverallKPI()
    };
  };

  // Add new consumption entry
  const addEntry = () => {
    if (!newEntry.consumption || parseFloat(newEntry.consumption) <= 0) {
      setErrors({ consumption: 'La consommation doit être supérieure à 0' });
      return;
    }

    if (!newEntry.date) {
      setErrors({ date: 'La date est requise' });
      return;
    }

    const entry = {
      id: Date.now(),
      date: newEntry.date,
      consumption: parseFloat(newEntry.consumption),
      billAmount: parseFloat(newEntry.billAmount) || 0,
      notes: newEntry.notes.trim(),
      billPeriodStart: newEntry.billPeriodStart,
      billPeriodEnd: newEntry.billPeriodEnd,
      createdAt: new Date().toISOString()
    };

    setConsumptionEntries(prev => [...prev, entry]);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      consumption: '',
      billAmount: '',
      notes: '',
      billPeriodStart: '',
      billPeriodEnd: ''
    });
    setShowAddForm(false);
    setErrors({});
  };

  // Remove consumption entry
  const removeEntry = (entryId) => {
    setConsumptionEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Handle submit
  const handleSubmit = () => {
    if (consumptionEntries.length === 0) {
      setErrors({ entries: 'Ajoutez au moins une entrée de consommation' });
      return;
    }
    
    const stats = getEnergyStats();
    
    const energyData = {
      value: stats.overallKPI,
      date: selectedDate,
      monthlyTarget: monthlyTarget,
      monthlyBudget: monthlyBudget,
      consumptionEntries: consumptionEntries,
      stats: stats,
      type: 'energy_consumption'
    };
    
    onSave('production', 'energy_consumption', energyData, '');
  };

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-500 focus:ring-orange-500/20'
  }`;

  const stats = getEnergyStats();
  const currentMonth = new Date(selectedDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

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
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Consommation d'Énergie par Lot
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Suivi mensuel de la consommation énergétique avec objectifs de performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Overall KPI */}
              <div className={`text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-sm font-medium">KPI Global</div>
                <div className={`text-3xl font-bold ${
                  stats.overallKPI === 100 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stats.overallKPI}%
                </div>
              </div>
              
              {/* Energy KPI */}
              <div className={`text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-xs font-medium">KPI Énergie</div>
                <div className={`text-2xl font-bold ${
                  stats.energyKPI === 100 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stats.energyKPI}%
                </div>
              </div>
              
              {/* Money KPI */}
              <div className={`text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-xs font-medium">KPI Budget</div>
                <div className={`text-2xl font-bold ${
                  stats.moneyKPI === 100 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stats.moneyKPI}%
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
              
              {/* Configuration */}
              <div className={`p-6 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Target className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Configuration des Objectifs
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Mois de Suivi
                    </label>
                    <input
                      type="month"
                      value={selectedDate.substring(0, 7)}
                      onChange={(e) => setSelectedDate(e.target.value + '-01')}
                      className={baseInputClasses}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Objectif Énergie (kWh)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={monthlyTarget}
                        onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 0)}
                        className={baseInputClasses}
                        placeholder="Ex: 2500"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Budget Mensuel (TND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)}
                        className={baseInputClasses}
                        placeholder="Ex: 800"
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    KPI = 100% si objectifs respectés, 0% si dépassés
                  </p>
                </div>
              </div>

              {/* KPI Overview */}
              <div className="space-y-4 mb-6">
                {/* Overall KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stats.overallKPI === 100 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Performance Globale
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      stats.overallKPI === 100 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stats.overallKPI}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs px-2 py-1 rounded-lg font-semibold inline-block ${
                      stats.overallKPI === 100 
                        ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.overallKPI === 100 ? '✅ OBJECTIFS ATTEINTS' : '❌ OBJECTIFS MANQUÉS'}
                    </div>
                  </div>
                </div>

                {/* Energy KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stats.energyKPI === 100 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        <Bolt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          KPI Consommation
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {stats.totalConsumption.toLocaleString()}/{monthlyTarget.toLocaleString()} kWh
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      stats.energyKPI === 100 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {stats.energyKPI}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {stats.isOverEnergyTarget 
                        ? `Dépassement: +${(stats.totalConsumption - monthlyTarget).toLocaleString()} kWh`
                        : `Reste disponible: ${stats.energyRemaining.toLocaleString()} kWh`
                      }
                    </div>
                  </div>
                </div>

                {/* Money KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stats.moneyKPI === 100 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          KPI Budget
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {stats.totalCost.toLocaleString()}/{monthlyBudget.toLocaleString()} TND
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      stats.moneyKPI === 100 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stats.moneyKPI}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {stats.isOverBudget 
                        ? `Dépassement: +${(stats.totalCost - monthlyBudget).toLocaleString()} TND`
                        : `Budget restant: ${stats.budgetRemaining.toLocaleString()} TND`
                      }
                    </div>
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
                      <Receipt className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {stats.entriesCount}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        Factures
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        {stats.totalCost.toLocaleString()} TND
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                        Coût Total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Entry Form */}
              <div className={`rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`p-6 ${showAddForm ? 'border-b' : ''} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 mr-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                          Nouvelle Facture
                        </h4>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Enregistrez votre consommation énergétique
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${
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
                            Date de la Facture
                          </label>
                          <input
                            type="date"
                            value={newEntry.date}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                            className={baseInputClasses}
                          />
                          {errors.date && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.date}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Consommation (kWh)
                          </label>
                          <input
                            type="number"
                            value={newEntry.consumption}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, consumption: e.target.value }))}
                            placeholder="Ex: 250"
                            className={baseInputClasses}
                          />
                          {errors.consumption && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.consumption}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Montant Facture (TND)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={newEntry.billAmount}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, billAmount: e.target.value }))}
                            placeholder="Ex: 145.50 TND"
                            className={baseInputClasses}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Notes
                          </label>
                          <input
                            type="text"
                            value={newEntry.notes}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Ex: Facture STEG période hiver"
                            className={baseInputClasses}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={addEntry}
                          className="px-8 py-3 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Ajouter la Facture</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Consumption Entries */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Factures du Mois ({stats.entriesCount})
                    </h4>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {currentMonth}
                    </p>
                  </div>
                </div>
              </div>

              {getCurrentMonthEntries().length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'
                }`}>
                  <Receipt className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Aucune facture pour ce mois
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Utilisez le formulaire ci-contre pour ajouter vos factures
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getCurrentMonthEntries().map((entry, index) => (
                    <div 
                      key={entry.id}
                      className={`p-6 rounded-xl border transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Entry Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {entry.consumption.toLocaleString()} kWh
                            </div>
                            {entry.billAmount > 0 && (
                              <div className={`text-lg font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                {entry.billAmount.toLocaleString()} TND
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(entry.date).toLocaleDateString('fr-FR')}
                            </div>
                            {entry.notes && (
                              <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                💬 {entry.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                          }`}
                          title="Supprimer la facture"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Impact Indicators */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Energy Impact */}
                        <div className={`p-3 rounded-lg border ${
                          entry.consumption <= (monthlyTarget / 4) 
                            ? isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                            : entry.consumption <= (monthlyTarget / 2)
                            ? isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
                            : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Bolt className={`w-4 h-4 ${
                              entry.consumption <= (monthlyTarget / 4) ? 'text-emerald-600' :
                              entry.consumption <= (monthlyTarget / 2) ? 'text-orange-600' : 'text-red-600'
                            }`} />
                            <span className={`text-xs font-semibold ${
                              entry.consumption <= (monthlyTarget / 4) 
                                ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                : entry.consumption <= (monthlyTarget / 2)
                                ? isDark ? 'text-orange-400' : 'text-orange-700'
                                : isDark ? 'text-red-400' : 'text-red-700'
                            }`}>
                              {entry.consumption <= (monthlyTarget / 4) 
                                ? 'Énergie Optimale' 
                                : entry.consumption <= (monthlyTarget / 2)
                                ? 'Énergie Modérée'
                                : 'Énergie Élevée'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Cost Impact */}
                        <div className={`p-3 rounded-lg border ${
                          entry.billAmount <= (monthlyBudget / 4) 
                            ? isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                            : entry.billAmount <= (monthlyBudget / 2)
                            ? isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
                            : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Wallet className={`w-4 h-4 ${
                              entry.billAmount <= (monthlyBudget / 4) ? 'text-emerald-600' :
                              entry.billAmount <= (monthlyBudget / 2) ? 'text-orange-600' : 'text-red-600'
                            }`} />
                            <span className={`text-xs font-semibold ${
                              entry.billAmount <= (monthlyBudget / 4) 
                                ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                : entry.billAmount <= (monthlyBudget / 2)
                                ? isDark ? 'text-orange-400' : 'text-orange-700'
                                : isDark ? 'text-red-400' : 'text-red-700'
                            }`}>
                              {entry.billAmount <= (monthlyBudget / 4) 
                                ? 'Coût Optimal' 
                                : entry.billAmount <= (monthlyBudget / 2)
                                ? 'Coût Modéré'
                                : 'Coût Élevé'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.entries && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.entries}</p>
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
              KPI Global: <span className={`text-lg ${
                stats.overallKPI === 100 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stats.overallKPI}%
              </span> • Énergie: <span className={`${stats.energyKPI === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.energyKPI}%
              </span> • Budget: <span className={`${stats.moneyKPI === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.moneyKPI}%
              </span> • {stats.isOverEnergyTarget || stats.isOverBudget ? '⚠️ DÉPASSEMENT' : '✅ OBJECTIFS ATTEINTS'}
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

export default EnergyConsumptionTracker;