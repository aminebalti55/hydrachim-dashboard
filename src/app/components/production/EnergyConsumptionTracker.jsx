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
  Wallet,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  CalendarDays,
  Loader2
} from 'lucide-react';

const EnergyConsumptionTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  
  // Custom scrollbar styles with enhanced styling
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #f97316 transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-track {
      background: rgba(251, 146, 60, 0.08);
      border-radius: 12px;
      border: 1px solid rgba(249, 115, 22, 0.1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #ff6b35 0%, #f97316 25%, #dc2626 75%, #b91c1c 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 2px 8px rgba(249, 115, 22, 0.3),
        inset 0 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #ff5722 0%, #ea580c 25%, #b91c1c 75%, #991b1b 100%);
      box-shadow: 
        0 4px 16px rgba(249, 115, 22, 0.5),
        inset 0 1px 3px rgba(255, 255, 255, 0.5),
        inset 0 -1px 3px rgba(0, 0, 0, 0.2);
      transform: scaleY(1.1);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb:active {
      background: linear-gradient(135deg, #e65100 0%, #c2410c 25%, #991b1b 75%, #7f1d1d 100%);
      box-shadow: 
        0 2px 8px rgba(249, 115, 22, 0.6),
        inset 0 2px 4px rgba(0, 0, 0, 0.3);
      transform: scaleY(0.95);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-track {
      background: rgba(71, 85, 105, 0.2);
      border-radius: 12px;
      border: 1px solid rgba(100, 116, 139, 0.3);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #ff6b35 0%, #f97316 25%, #dc2626 75%, #b91c1c 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 2px 8px rgba(249, 115, 22, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #ff5722 0%, #ea580c 25%, #b91c1c 75%, #991b1b 100%);
      box-shadow: 
        0 4px 16px rgba(249, 115, 22, 0.6),
        inset 0 1px 3px rgba(255, 255, 255, 0.3),
        inset 0 -1px 3px rgba(0, 0, 0, 0.3);
      transform: scaleY(1.1);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb:active {
      background: linear-gradient(135deg, #e65100 0%, #c2410c 25%, #991b1b 75%, #7f1d1d 100%);
      box-shadow: 
        0 2px 8px rgba(249, 115, 22, 0.7),
        inset 0 2px 4px rgba(0, 0, 0, 0.4);
      transform: scaleY(0.95);
    }
    
    /* Smooth scrolling animation */
    .custom-scrollbar {
      scroll-behavior: smooth;
    }
    
    /* Custom scrollbar corner */
    .custom-scrollbar::-webkit-scrollbar-corner {
      background: transparent;
    }
  `;

  // Loading state for saving
  const [isSaving, setIsSaving] = useState(false);

  // Obtenir la date actuelle du système correctement
  const aujourdhui = new Date();
  
  // Fonctions utilitaires pour mois
  const obtenirPremierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const obtenirDernierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

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

  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || aujourdhui.toISOString().split('T')[0]
  );
  const [monthlyElectricityTarget, setMonthlyElectricityTarget] = useState(existingData?.monthlyElectricityTarget || 2500); // kWh per month
  const [monthlyWaterTarget, setMonthlyWaterTarget] = useState(existingData?.monthlyWaterTarget || 15000); // L per month
  const [monthlyBudget, setMonthlyBudget] = useState(existingData?.monthlyBudget || 800); // TND per month
  const [consumptionEntries, setConsumptionEntries] = useState(existingData?.consumptionEntries || []);
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(selectedDate));
  const [newEntry, setNewEntry] = useState({
    date: aujourdhui.toISOString().split('T')[0],
    time: aujourdhui.toTimeString().slice(0, 5),
    type: 'electricity', // 'electricity' or 'water'
    consumption: '',
    billAmount: '',
    notes: '',
    billPeriodStart: '',
    billPeriodEnd: ''
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    type: '',
    consumption: '',
    billAmount: '',
    notes: ''
  });

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

  // Get current month entries
  const getCurrentMonthEntries = () => {
    const debutMois = obtenirPremierJourMois(selectedDate);
    const finMois = obtenirDernierJourMois(selectedDate);
    
    return consumptionEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= debutMois && entryDate <= finMois;
    });
  };

  // Calculate electricity KPI (binary: 100% if within target, 0% if exceeded)
  const calculateElectricityKPI = () => {
    const monthEntries = getCurrentMonthEntries();
    const electricityEntries = monthEntries.filter(entry => entry.type === 'electricity');
    const totalElectricityConsumption = electricityEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    
    return totalElectricityConsumption <= monthlyElectricityTarget ? 100 : 0;
  };

  // Calculate water KPI (binary: 100% if within target, 0% if exceeded)
  const calculateWaterKPI = () => {
    const monthEntries = getCurrentMonthEntries();
    const waterEntries = monthEntries.filter(entry => entry.type === 'water');
    const totalWaterConsumption = waterEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    
    return totalWaterConsumption <= monthlyWaterTarget ? 100 : 0;
  };

  // Calculate money KPI (binary: 100% if within budget, 0% if exceeded)
  const calculateMoneyKPI = () => {
    const monthEntries = getCurrentMonthEntries();
    const totalCost = monthEntries.reduce((sum, entry) => sum + (entry.billAmount || 0), 0);
    
    return totalCost <= monthlyBudget ? 100 : 0;
  };

  // Calculate overall KPI (average of all three KPIs: electricity, water, and budget)
  const calculateOverallKPI = () => {
    const electricityKPI = calculateElectricityKPI();
    const waterKPI = calculateWaterKPI();
    const moneyKPI = calculateMoneyKPI();
    return Math.round((electricityKPI + waterKPI + moneyKPI) / 3);
  };

  // Calculate energy statistics
  const getEnergyStats = () => {
    const monthEntries = getCurrentMonthEntries();
    const totalConsumption = monthEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    const totalCost = monthEntries.reduce((sum, entry) => sum + (entry.billAmount || 0), 0);
    const entriesCount = monthEntries.length;
    const averageConsumption = entriesCount > 0 ? totalConsumption / entriesCount : 0;
    const budgetRemaining = Math.max(0, monthlyBudget - totalCost);
    const isOverBudget = totalCost > monthlyBudget;
    
    // Separate by type
    const electricityEntries = monthEntries.filter(entry => entry.type === 'electricity');
    const waterEntries = monthEntries.filter(entry => entry.type === 'water');
    
    const electricityConsumption = electricityEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    const waterConsumption = waterEntries.reduce((sum, entry) => sum + (entry.consumption || 0), 0);
    const electricityCost = electricityEntries.reduce((sum, entry) => sum + (entry.billAmount || 0), 0);
    const waterCost = waterEntries.reduce((sum, entry) => sum + (entry.billAmount || 0), 0);
    
    const electricityRemaining = Math.max(0, monthlyElectricityTarget - electricityConsumption);
    const waterRemaining = Math.max(0, monthlyWaterTarget - waterConsumption);
    const isOverElectricityTarget = electricityConsumption > monthlyElectricityTarget;
    const isOverWaterTarget = waterConsumption > monthlyWaterTarget;
    
    // Détection du mois actuel système
    const dateMoisSelectionne = new Date(selectedDate);
    const estMoisActuel = dateMoisSelectionne.getMonth() === aujourdhui.getMonth() && 
                         dateMoisSelectionne.getFullYear() === aujourdhui.getFullYear();
    
    return {
      totalConsumption,
      totalCost,
      entriesCount,
      averageConsumption,
      budgetRemaining,
      isOverBudget,
      electricityKPI: calculateElectricityKPI(),
      waterKPI: calculateWaterKPI(),
      moneyKPI: calculateMoneyKPI(),
      overallKPI: calculateOverallKPI(),
      electricityConsumption,
      waterConsumption,
      electricityCost,
      waterCost,
      electricityCount: electricityEntries.length,
      waterCount: waterEntries.length,
      electricityRemaining,
      waterRemaining,
      isOverElectricityTarget,
      isOverWaterTarget,
      estMoisActuel
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
      time: newEntry.time,
      type: newEntry.type,
      consumption: parseFloat(newEntry.consumption),
      billAmount: parseFloat(newEntry.billAmount) || 0,
      notes: newEntry.notes.trim(),
      billPeriodStart: newEntry.billPeriodStart,
      billPeriodEnd: newEntry.billPeriodEnd,
      createdAt: new Date().toISOString()
    };

    setConsumptionEntries(prev => [...prev, entry]);
    
    // Changer automatiquement vers le mois de la nouvelle entrée
    setSelectedDate(newEntry.date);
    
    setNewEntry({
      date: aujourdhui.toISOString().split('T')[0],
      time: aujourdhui.toTimeString().slice(0, 5),
      type: 'electricity',
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

  // Start editing an entry
  const startEdit = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      date: entry.date,
      time: entry.time,
      type: entry.type,
      consumption: entry.consumption.toString(),
      billAmount: entry.billAmount.toString(),
      notes: entry.notes
    });
  };

  // Save edited entry
  const saveEdit = () => {
    if (!editForm.consumption || parseFloat(editForm.consumption) <= 0) {
      setErrors({ consumption: 'La consommation doit être supérieure à 0' });
      return;
    }

    setConsumptionEntries(prev => prev.map(entry => 
      entry.id === editingEntry 
        ? {
            ...entry,
            date: editForm.date,
            time: editForm.time,
            type: editForm.type,
            consumption: parseFloat(editForm.consumption),
            billAmount: parseFloat(editForm.billAmount) || 0,
            notes: editForm.notes.trim()
          }
        : entry
    ));

    setEditingEntry(null);
    setErrors({});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingEntry(null);
    setErrors({});
  };

  // Handle month selection from calendar
  const handleMonthSelect = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setShowCalendar(false);
  };

  // Handle submit with loading state
  const handleSubmit = async () => {
    if (consumptionEntries.length === 0) {
      setErrors({ entries: 'Ajoutez au moins une entrée de consommation' });
      return;
    }
    
    setIsSaving(true);
    try {
      const stats = getEnergyStats();
      
      const energyData = {
        value: stats.overallKPI,
        date: selectedDate,
        data: {
          monthlyElectricityTarget: monthlyElectricityTarget,
          monthlyWaterTarget: monthlyWaterTarget,
          monthlyBudget: monthlyBudget,
          consumptionEntries: consumptionEntries,
          stats: stats,
          type: 'energy_consumption'
        }
      };
      
      await onSave('production', 'energy_consumption', energyData, '');
    } catch (error) {
      console.error('Error saving energy consumption:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Obtenir couleur KPI basée sur l'objectif
  const obtenirCouleurKPI = () => {
    const overallKPI = calculateOverallKPI();
    if (overallKPI === 100) return 'text-emerald-600';
    if (overallKPI >= 67) return 'text-green-600';
    if (overallKPI >= 33) return 'text-amber-600';
    return 'text-red-600';
  };

  const stats = getEnergyStats();
  const kpiGlobal = calculateOverallKPI();
  const entriesMois = getCurrentMonthEntries();
  const moisActuel = obtenirNomMois(selectedDate);
  const anneeActuelle = new Date(selectedDate).getFullYear();
  const selectedDateObj = new Date(selectedDate);

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-orange-100'
        }`}>
          
          {/* Loading Overlay */}
          {isSaving && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-60 flex items-center justify-center rounded-2xl">
              <div className={`p-6 rounded-2xl shadow-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Sauvegarde en cours...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* En-tête moderne */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-orange-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Consommation d'Énergie et d'Eau
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Suivi mensuel de la consommation énergétique avec objectifs de performance
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    KPI Global
                  </div>
                  <div 
                    className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                    title={`📊 FORMULE KPI ÉNERGIE & EAU

🎯 CALCUL DU SCORE:
• KPI Électricité = ${stats.electricityConsumption} ≤ ${monthlyElectricityTarget} ? 100% : 0%
• KPI Eau = ${stats.waterConsumption} ≤ ${monthlyWaterTarget} ? 100% : 0%
• KPI Budget Global = (${stats.electricityCost} + ${stats.waterCost}) ≤ ${monthlyBudget} ? 100% : 0%
• KPI Global = (KPI Électricité + KPI Eau + KPI Budget Global) ÷ 3

📋 SITUATION ACTUELLE:
• Mois: ${moisActuel} ${anneeActuelle}
• Électricité: ${stats.electricityConsumption} kWh (${stats.electricityCount} factures)
• Eau: ${stats.waterConsumption} L (${stats.waterCount} factures)
• Budget Global: ${stats.totalCost} TND (${stats.electricityCost} + ${stats.waterCost})

🎯 OBJECTIFS MENSUELS:
• Électricité: ≤ ${monthlyElectricityTarget} kWh
• Eau: ≤ ${monthlyWaterTarget} L
• Budget Global (Électricité + Eau): ≤ ${monthlyBudget} TND

📈 CALCUL ACTUEL:
• KPI Électricité: ${stats.electricityKPI}%
• KPI Eau: ${stats.waterKPI}%
• KPI Budget Global: ${stats.moneyKPI}%
• KPI Global: ${kpiGlobal}%

💡 INTERPRÉTATION:
• 100%: Tous les objectifs atteints
• 67%: Deux objectifs sur trois atteints
• 33%: Un objectif sur trois atteint
• 0%: Aucun objectif atteint

${kpiGlobal === 100 ? '✅ EXCELLENTE PERFORMANCE' : kpiGlobal >= 67 ? '✅ BONNE PERFORMANCE' : kpiGlobal >= 33 ? '⚠️ PERFORMANCE PARTIELLE' : '🚨 OBJECTIFS MANQUÉS'}

📌 NOTE: Le budget est GLOBAL pour les deux services (électricité + eau combinés)`}
                  >
                    {kpiGlobal}%
                  </div>
                </div>
                
                {!showAddForm ? (
                  <button
                    onClick={() => setShowAddForm(true)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark
                          ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                          : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Nouvelle Facture</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddForm(false)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                          : 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>Annuler</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Panneau de contrôle intelligent */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-orange-50/50 border-orange-100'
          }`}>
            <div className="flex items-center justify-between">
              
              {/* Sélecteur de mois avec calendrier moderne */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    disabled={isSaving}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
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
                  stats.estMoisActuel 
                    ? isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stats.estMoisActuel ? '📅 Mois actuel' : '📋 Historique'}
                </div>
              </div>

              {/* Métriques en temps réel */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <div className={`text-lg font-semibold text-blue-600`}>{stats.electricityCount}</div>
                      <div className={`text-xs font-medium text-blue-600`}>Électricité</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <div>
                      <div className={`text-lg font-semibold text-teal-600`}>{stats.waterCount}</div>
                      <div className={`text-xs font-medium text-teal-600`}>Eau</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <div className={`text-lg font-semibold text-green-600`}>{stats.totalCost.toLocaleString()}</div>
                      <div className={`text-xs font-medium text-green-600`}>TND Total</div>
                    </div>
                  </div>
                </div>
                
                {/* Objectifs modifiables */}
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-800 border-slate-600' 
                    : 'bg-white border-orange-200'
                }`}>
                  <Target className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={monthlyElectricityTarget}
                        onChange={(e) => setMonthlyElectricityTarget(parseInt(e.target.value) || 0)}
                        disabled={isSaving}
                        className={`w-20 px-2 py-1 text-xs font-semibold text-center rounded border ${
                          isSaving 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-orange-200 text-slate-900'
                        }`}
                      />
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>kWh</span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={monthlyWaterTarget}
                        onChange={(e) => setMonthlyWaterTarget(parseInt(e.target.value) || 0)}
                        disabled={isSaving}
                        className={`w-20 px-2 py-1 text-xs font-semibold text-center rounded border ${
                          isSaving 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-orange-200 text-slate-900'
                        }`}
                      />
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>L</span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>•</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)}
                        disabled={isSaving}
                        className={`w-20 px-2 py-1 text-xs font-semibold text-center rounded border ${
                          isSaving 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-orange-200 text-slate-900'
                        }`}
                      />
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>TND</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex flex-1 min-h-0">
            
            {/* Formulaire d'ajout (si affiché) */}
            {showAddForm && (
              <div className={`w-80 border-r flex flex-col ${
                isDark 
                  ? 'border-slate-700 bg-slate-800/30' 
                  : 'border-orange-100 bg-orange-50/30'
              }`}>
                {/* Form Header */}
                <div className="px-6 py-4 flex-shrink-0">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Nouvelle Facture
                  </h3>
                </div>
                
                {/* Scrollable Form Content */}
                <div className={`flex-1 px-6 py-4 overflow-y-auto custom-scrollbar ${
                  isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
                }`}>
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
                          value={newEntry.date}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                          disabled={isSaving}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                            isSaving 
                              ? 'opacity-50 cursor-not-allowed' 
                              : isDark 
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
                          value={newEntry.time}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, time: e.target.value }))}
                          disabled={isSaving}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                            isSaving 
                              ? 'opacity-50 cursor-not-allowed' 
                              : isDark 
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
                        Type de Facture
                      </label>
                      <select
                        value={newEntry.type}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
                        disabled={isSaving}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                          isSaving 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isDark 
                              ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500' 
                              : 'bg-white border-orange-200 text-slate-900 focus:border-orange-500'
                        }`}
                      >
                        <option value="electricity">⚡ Électricité (STEG)</option>
                        <option value="water">💧 Eau (SONEDE)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Consommation ({newEntry.type === 'electricity' ? 'kWh' : 'L'})
                        </label>
                        <input
                          type="number"
                          value={newEntry.consumption}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, consumption: e.target.value }))}
                          placeholder={newEntry.type === 'electricity' ? "Ex: 250 kWh" : "Ex: 1500 L"}
                          disabled={isSaving}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                            isSaving 
                              ? 'opacity-50 cursor-not-allowed' 
                              : isDark 
                                ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500' 
                                : 'bg-white border-orange-200 text-slate-900 focus:border-orange-500'
                          }`}
                        />
                        {errors.consumption && (
                          <p className="text-red-500 text-xs mt-1">{errors.consumption}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Montant (TND)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newEntry.billAmount}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, billAmount: e.target.value }))}
                          placeholder="Ex: 145.50"
                          disabled={isSaving}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                            isSaving 
                              ? 'opacity-50 cursor-not-allowed' 
                              : isDark 
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
                        Notes
                      </label>
                      <input
                        type="text"
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ex: Facture période hiver"
                        disabled={isSaving}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                          isSaving 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isDark 
                              ? 'bg-slate-800 border-slate-600 text-white focus:border-orange-500' 
                              : 'bg-white border-orange-200 text-slate-900 focus:border-orange-500'
                        }`}
                      />
                    </div>

                    {errors.date && (
                      <p className="text-red-500 text-xs">{errors.date}</p>
                    )}
                  </div>
                </div>
                
                {/* Fixed Ajouter Button */}
                <div className={`px-6 py-4 border-t flex-shrink-0 ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-orange-100 bg-white'
                }`}>
                  <button
                    onClick={addEntry}
                    disabled={isSaving}
                    className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Ajouter la Facture</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Liste des factures - Design épuré et élégant */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Factures de {moisActuel}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {entriesMois.length} facture(s) • {stats.totalConsumption.toLocaleString()} kWh/L • {stats.totalCost.toLocaleString()} TND
                    </p>
                  </div>
                </div>
              </div>

              {entriesMois.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark 
                    ? 'border-slate-700 bg-slate-800/50' 
                    : 'border-slate-300 bg-slate-50'
                }`}>
                  <Receipt className={`w-12 h-12 mx-auto mb-4 ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`} />
                  <h3 className={`text-lg font-medium mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-900'
                  }`}>
                    Aucune facture pour ce mois
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                    Utilisez le formulaire pour ajouter vos factures
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entriesMois.map((entry, index) => {
                    const infoType = entry.type === 'electricity' 
                      ? { icon: Bolt, couleur: 'bg-blue-500', label: 'Électricité', unit: 'kWh' }
                      : { icon: Droplets, couleur: 'bg-teal-500', label: 'Eau', unit: 'L' };
                    
                    const IconeType = infoType.icon;
                    const isEditing = editingEntry === entry.id;
                    
                    return (
                      <div 
                        key={entry.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 hover:border-orange-500/50 hover:bg-slate-750' 
                            : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-lg'
                        } ${isEditing ? 'ring-2 ring-orange-500 shadow-xl' : ''}`}
                      >
                        {isEditing ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-12 h-12 rounded-xl ${infoType.couleur} flex items-center justify-center flex-shrink-0`}>
                                <IconeType className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Modifier la facture
                                </h4>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  Modifiez les informations de cette facture
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                  disabled={isSaving}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isSaving 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : isDark 
                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                        : 'bg-white border-orange-200 text-slate-900'
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
                                  value={editForm.time}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                                  disabled={isSaving}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isSaving 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : isDark 
                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                        : 'bg-white border-orange-200 text-slate-900'
                                  }`}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${
                                isDark ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                Type de Facture
                              </label>
                              <select
                                value={editForm.type}
                                onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                disabled={isSaving}
                                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  isSaving 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : isDark 
                                      ? 'bg-slate-800 border-slate-600 text-white' 
                                      : 'bg-white border-orange-200 text-slate-900'
                                }`}
                              >
                                <option value="electricity">⚡ Électricité (STEG)</option>
                                <option value="water">💧 Eau (SONEDE)</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Consommation ({editForm.type === 'electricity' ? 'kWh' : 'L'})
                                </label>
                                <input
                                  type="number"
                                  value={editForm.consumption}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, consumption: e.target.value }))}
                                  disabled={isSaving}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isSaving 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : isDark 
                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                        : 'bg-white border-orange-200 text-slate-900'
                                  }`}
                                />
                                {errors.consumption && (
                                  <p className="text-red-500 text-xs mt-1">{errors.consumption}</p>
                                )}
                              </div>
                              
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  Montant (TND)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.billAmount}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, billAmount: e.target.value }))}
                                  disabled={isSaving}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isSaving 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : isDark 
                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                        : 'bg-white border-orange-200 text-slate-900'
                                  }`}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${
                                isDark ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                Notes
                              </label>
                              <input
                                type="text"
                                value={editForm.notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                disabled={isSaving}
                                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  isSaving 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : isDark 
                                      ? 'bg-slate-800 border-slate-600 text-white' 
                                      : 'bg-white border-orange-200 text-slate-900'
                                }`}
                              />
                            </div>
                            
                            <div className="flex space-x-3 pt-2">
                              <button
                                onClick={saveEdit}
                                disabled={isSaving}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                  isSaving 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : isDark 
                                      ? 'bg-green-600 text-white hover:bg-green-700' 
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-2">
                                  <Save className="w-4 h-4" />
                                  <span>Enregistrer</span>
                                </div>
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={isSaving}
                                className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                                  isSaving 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : isDark 
                                      ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-slate-300' 
                                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center space-x-4">
                            {/* Avatar type */}
                            <div className={`w-14 h-14 rounded-xl ${infoType.couleur} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                              <IconeType className="w-7 h-7 text-white" />
                            </div>
                            
                            {/* Contenu principal */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4 mb-3">
                                    <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                      {entry.consumption.toLocaleString()} {infoType.unit}
                                    </h4>
                                    {entry.billAmount > 0 && (
                                      <div className={`text-lg font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg`}>
                                        {entry.billAmount.toLocaleString()} TND
                                      </div>
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      entry.type === 'electricity'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-teal-600 text-white shadow-lg'
                                    }`}>
                                      {infoType.label}
                                    </span>
                                  </div>
                                  <div className={`flex items-center space-x-4 text-sm ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}>
                                    <span className="flex items-center space-x-1 font-medium">
                                      <Calendar className="w-4 h-4" />
                                      <span>{new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                                    </span>
                                    <span className="flex items-center space-x-1 font-medium">
                                      <Clock className="w-4 h-4" />
                                      <span>{entry.time}</span>
                                    </span>
                                    {entry.notes && (
                                      <span className="flex items-center space-x-1 font-medium">
                                        <span>💬 {entry.notes}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEdit(entry)}
                                    disabled={isSaving}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                                      isSaving 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : isDark 
                                          ? 'bg-blue-900/20 hover:bg-blue-900/40 text-blue-400' 
                                          : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                    }`}
                                    title="Modifier"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeEntry(entry.id)}
                                    disabled={isSaving}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                                      isSaving 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : isDark 
                                          ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' 
                                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                                    }`}
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.entries && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.entries}</p>
                </div>
              )}

              {errors.submit && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.submit}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pied de page */}
          <div className={`px-6 py-4 border-t flex-shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-orange-100'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">{kpiGlobal}% KPI Global</span>
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stats.totalConsumption.toLocaleString()} kWh/L • {stats.totalCost.toLocaleString()} TND
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  {moisActuel} {anneeActuelle}
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  Objectifs: ≤{monthlyElectricityTarget} kWh • ≤{monthlyWaterTarget} L • ≤{monthlyBudget} TND
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={onCancel} 
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                    isSaving 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark 
                        ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 text-red-400' 
                        : 'border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700'
                  }`}
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 shadow-sm ${
                    isSaving 
                      ? 'opacity-50 cursor-not-allowed bg-orange-600' 
                      : isDark 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnergyConsumptionTracker;