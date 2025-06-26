import React, { useState, useEffect } from 'react';
import { useTeamsKPIData } from '../../hooks/useTeamsKPIData';
import {
  Calendar, Users, Target, TrendingUp, Plus, X, Check, 
  Edit3, Trash2, Clock, Flag, Search, Filter,
  CheckCircle2, Circle, BarChart3, Activity, User,
  Settings, ArrowRight, Hash, Timer, Award, CalendarDays,
  Save, ListChecks, Grid3X3, List, Minimize2, UserPlus,
  ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

// Employés prédéfinis de l'équipe avec couleurs
const EMPLOYES_PREDEFINIS = [
  { name: 'Rihem', color: 'from-purple-500 to-purple-600' },
  { name: 'Hamza', color: 'from-blue-500 to-blue-600' },
  { name: 'Mohamed', color: 'from-green-500 to-green-600' },
  { name: 'Nassim', color: 'from-orange-500 to-orange-600' },
  { name: 'Tarek', color: 'from-pink-500 to-pink-600' },
  { name: 'Youssef', color: 'from-teal-500 to-teal-600' }
];

// Helper function to format date in local timezone (fixes calendar glitch)
const toLocalISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const OperatorEfficiencyForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // KPI Data Hook for date-specific loading
  const { getOperatorEfficiencyByDate } = useTeamsKPIData();

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #8b5cf6 transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-track {
      background: rgba(139, 92, 246, 0.08);
      border-radius: 12px;
      border: 1px solid rgba(139, 92, 246, 0.1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 25%, #6d28d9 75%, #5b21b6 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 2px 8px rgba(139, 92, 246, 0.3),
        inset 0 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 25%, #5b21b6 75%, #4c1d95 100%);
      box-shadow: 
        0 4px 16px rgba(139, 92, 246, 0.5),
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
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 25%, #6d28d9 75%, #5b21b6 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 2px 8px rgba(139, 92, 246, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 25%, #5b21b6 75%, #4c1d95 100%);
      box-shadow: 
        0 4px 16px rgba(139, 92, 246, 0.6),
        inset 0 1px 3px rgba(255, 255, 255, 0.3),
        inset 0 -1px 3px rgba(0, 0, 0, 0.3);
      transform: scaleY(1.1);
    }
    
    .custom-scrollbar {
      scroll-behavior: smooth;
    }
  `;

  // Get current date
  const today = new Date();

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

  // État - FIXED: Use local date formatting for initial state
  const [dateSelectionnee, setDateSelectionnee] = useState(
    existingData?.date || toLocalISODate(today)
  );
  const [objectifMensuel, setObjectifMensuel] = useState(existingData?.monthlyTarget || 85);
  const [employes, setEmployes] = useState(existingData?.employees || []);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // cards, list, compact
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [nouvelEmploye, setNouvelEmploye] = useState({
    nom: '',
    tasks: []
  });

  // NEW: Load employees for a specific date
  const loadEmployees = async (date) => {
    if (!date) return;
    
    try {
      setIsLoadingData(true);
      console.log('🔄 Loading operator efficiency data for date:', date);
      
      const efficiencyRecord = await getOperatorEfficiencyByDate(date);
      
      if (efficiencyRecord) {
        console.log('✅ Found existing efficiency data for date:', date, efficiencyRecord);
        setEmployes(efficiencyRecord.employees || []);
        setObjectifMensuel(efficiencyRecord.monthly_target || 85);
      } else {
        console.log('📭 No existing efficiency data for date:', date, '- showing empty list');
        setEmployes([]);
        setObjectifMensuel(85);
      }
    } catch (error) {
      console.error('❌ Error loading operator efficiency data:', error);
      setEmployes([]);
      setObjectifMensuel(85);
    } finally {
      setIsLoadingData(false);
    }
  };

  // NEW: Effect to reload employees when date changes
  useEffect(() => {
    console.log('📅 Date changed to:', dateSelectionnee, '- reloading operators...');
    loadEmployees(dateSelectionnee);
  }, [dateSelectionnee, getOperatorEfficiencyByDate]);

  // Custom Calendar Component
  const CustomCalendar = () => {
    const currentDate = new Date();
    const [viewDate, setViewDate] = useState(new Date(dateSelectionnee));
    
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
        const isSelected = dayDate.toDateString() === new Date(dateSelectionnee).toDateString();
        
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
    
    // FIXED: Use local date formatting to avoid timezone conversion
    const selectDay = (dayObj) => {
      const localDate = toLocalISODate(dayObj.date);
      console.log('📅 Calendar day selected:', dayObj.date, '→ local ISO:', localDate);
      setDateSelectionnee(localDate);
      setShowCalendar(false);
    };
    
    return (
      <div className={`absolute top-full mt-3 z-50 rounded-xl shadow-xl border overflow-hidden ${
        isDark 
          ? 'bg-slate-900 border-slate-700 shadow-slate-900/50' 
          : 'bg-white border-purple-200 shadow-purple-100/50'
      }`} style={{ width: '280px' }}>
        
        {/* Calendar Header */}
        <div className={`px-3 py-3 ${
          isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-purple-500 to-purple-600'
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
                    ? isDark ? 'text-white hover:bg-purple-600' : 'text-slate-900 hover:bg-purple-500 hover:text-white'
                    : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                  }
                  ${dayObj.isSelected 
                    ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300 shadow-lg' 
                    : ''
                  }
                  ${dayObj.isToday && !dayObj.isSelected
                    ? isDark 
                      ? 'bg-purple-900/40 text-purple-300 ring-1 ring-purple-500' 
                      : 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
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
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-purple-100 bg-purple-50/50'
        }`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                // FIXED: Use local date formatting for "Today" button
                const todayLocal = toLocalISODate(today);
                console.log('📅 Today button clicked:', today, '→ local ISO:', todayLocal);
                setDateSelectionnee(todayLocal);
                setShowCalendar(false);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                isDark 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              Aujourd'hui
            </button>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate employee efficiency - Simple task completion rate
  const calculateEmployeeEfficiency = (employee) => {
    if (!employee.tasks || employee.tasks.length === 0) return 0;
    
    const completedTasks = employee.tasks.filter(task => task.completed).length;
    const totalTasks = employee.tasks.length;
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  // Calculate team efficiency - Average of all employee efficiencies
  const calculateTeamEfficiency = () => {
    const validEmployees = employes.filter(emp => emp.name && emp.name.trim());
    if (validEmployees.length === 0) return 0;
    
    const totalEfficiency = validEmployees.reduce((sum, emp) => sum + calculateEmployeeEfficiency(emp), 0);
    return Math.round(totalEfficiency / validEmployees.length);
  };

  // Get employee statistics
  const getEmployeeStats = () => {
    const validEmployees = employes.filter(emp => emp.name && emp.name.trim());
    const total = validEmployees.length;
    const totalTasks = validEmployees.reduce((sum, emp) => sum + (emp.tasks?.length || 0), 0);
    const completedTasks = validEmployees.reduce((sum, emp) => 
      sum + (emp.tasks?.filter(t => t.completed).length || 0), 0);
    const highPerformers = validEmployees.filter(emp => {
      const efficiency = calculateEmployeeEfficiency(emp);
      return efficiency >= objectifMensuel;
    }).length;

    // Détection du jour actuel
    const dateSelectionneeObj = new Date(dateSelectionnee);
    const estJourActuel = dateSelectionneeObj.toDateString() === today.toDateString();
    
    return {
      total,
      totalTasks,
      completedTasks,
      highPerformers,
      estJourActuel
    };
  };

  // Ajouter un employé
  const ajouterEmploye = () => {
    if (!nouvelEmploye.nom.trim()) return;

    const employe = {
      id: Date.now(),
      name: nouvelEmploye.nom.trim(),
      tasks: [],
      notes: '',
      createdAt: new Date().toISOString()
    };

    setEmployes(prev => [...prev, employe]);
    setNouvelEmploye({
      nom: '',
      tasks: []
    });
    setAfficherFormulaire(false);
  };

  // Ajouter un employé prédéfini
  const ajouterEmployePredefini = (employePredefini) => {
    const existe = employes.some(emp => emp.name && emp.name.toLowerCase() === employePredefini.name.toLowerCase());
    if (existe) return;
    
    const employe = {
      id: Date.now(),
      name: employePredefini.name,
      tasks: [],
      notes: '',
      createdAt: new Date().toISOString()
    };
    setEmployes(prev => [...prev, employe]);
  };

  // Ajouter tous les employés prédéfinis
  const ajouterTousEmployes = () => {
    const nouveauxEmployes = EMPLOYES_PREDEFINIS.filter(employePredefini => 
      !employes.some(emp => emp.name && emp.name.toLowerCase() === employePredefini.name.toLowerCase())
    ).map(employePredefini => ({
      id: Date.now() + Math.random(),
      name: employePredefini.name,
      tasks: [],
      notes: '',
      createdAt: new Date().toISOString()
    }));
    
    setEmployes(prev => [...prev, ...nouveauxEmployes]);
  };

  // Supprimer un employé
  const supprimerEmploye = (employeId) => {
    setEmployes(prev => prev.filter(emp => emp.id !== employeId));
  };

  // Mettre à jour un employé
  const mettreAJourEmploye = (employeId, field, value) => {
    setEmployes(prev => prev.map(emp => 
      emp.id === employeId ? { ...emp, [field]: value } : emp
    ));
  };

  // Task management functions
  const addTask = (employeeId, description) => {
    if (!description.trim()) return;
    
    const newTask = {
      id: Date.now(),
      description: description.trim(),
      completed: false,
      estimatedMinutes: 30
    };

    mettreAJourEmploye(employeeId, 'tasks', [
      ...(employes.find(emp => emp.id === employeeId)?.tasks || []),
      newTask
    ]);
  };

  const updateTask = (employeeId, taskId, field, value) => {
    const employee = employes.find(emp => emp.id === employeeId);
    if (!employee) return;

    const updatedTasks = employee.tasks.map(task =>
      task.id === taskId ? { ...task, [field]: value } : task
    );
    mettreAJourEmploye(employeeId, 'tasks', updatedTasks);
  };

  const deleteTask = (employeeId, taskId) => {
    const employee = employes.find(emp => emp.id === employeeId);
    if (!employee) return;

    const updatedTasks = employee.tasks.filter(task => task.id !== taskId);
    mettreAJourEmploye(employeeId, 'tasks', updatedTasks);
  };

  const toggleTask = (employeeId, taskId) => {
    const employee = employes.find(emp => emp.id === employeeId);
    if (!employee) return;

    const updatedTasks = employee.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    mettreAJourEmploye(employeeId, 'tasks', updatedTasks);
  };

  // Gérer la soumission
  const gererSoumission = () => {
    const processedEmployees = employes.filter(emp => emp.name && emp.name.trim()).map(emp => ({
      ...emp,
      efficiency: calculateEmployeeEfficiency(emp)
    }));
    
    const efficiencyData = {
      value: calculateTeamEfficiency(),
      date: dateSelectionnee,
      employees: processedEmployees,
      monthlyTarget: objectifMensuel,
      type: 'efficiency'
    };
    
    onSave('team', 'operator_efficiency', efficiencyData, '');
  };

  // Obtenir couleur KPI basée sur l'objectif
  const obtenirCouleurKPI = () => {
    const kpiMensuel = calculateTeamEfficiency();
    if (kpiMensuel >= 95) return 'text-emerald-600';
    if (kpiMensuel >= objectifMensuel) return 'text-purple-600';
    if (kpiMensuel >= objectifMensuel * 0.8) return 'text-amber-600';
    return 'text-red-600';
  };

  const stats = getEmployeeStats();
  const kpiMensuel = calculateTeamEfficiency();
  const selectedDateObj = new Date(dateSelectionnee);
  const employesNonUtilises = EMPLOYES_PREDEFINIS.filter(employePredefini => 
    !employes.some(emp => emp.name && emp.name.toLowerCase() === employePredefini.name.toLowerCase())
  );

  // Check if current day
  const isToday = selectedDateObj.toDateString() === today.toDateString();

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-100'
        }`}>
          
          {/* En-tête moderne */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Efficacité Opérationnelle & Tâches
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Gestion simple et efficace des tâches
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    KPI Équipe
                  </div>
                  <div 
                    className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                    title={`🎯 FORMULE KPI EFFICACITÉ

🧮 CALCUL DU SCORE:
• KPI Équipe = Moyenne des efficacités individuelles

📋 CALCUL INDIVIDUEL:
• Efficacité Employé = (Tâches terminées ÷ Total tâches) × 100

📊 SITUATION ACTUELLE:
• Date: ${formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
• Opérateurs actifs: ${stats.total}
• Total tâches: ${stats.totalTasks}
• Tâches terminées: ${stats.completedTasks}
• KPI Équipe: ${kpiMensuel}%

📈 EXEMPLE DE CALCUL:
• Employé A: 8 tâches terminées / 10 total = 80%
• Employé B: 6 tâches terminées / 8 total = 75%
• KPI Équipe = (80% + 75%) ÷ 2 = 77.5%

💡 INTERPRÉTATION:
• 95-100%: Performance exceptionnelle
• ${objectifMensuel}-94%: Objectif mensuel atteint
• ${Math.round(objectifMensuel * 0.8)}-${objectifMensuel-1}%: Performance acceptable
• <${Math.round(objectifMensuel * 0.8)}%: Amélioration nécessaire

Score actuel: ${kpiMensuel}%
${kpiMensuel >= objectifMensuel ? '✅ OBJECTIF ATTEINT' : '🚨 SOUS L\'OBJECTIF'}

📌 NOTE: Basé uniquement sur le taux de completion des tâches`}
                  >
                    {kpiMensuel}%
                  </div>
                </div>
                <button 
                  onClick={onCancel} 
                  className="w-9 h-9 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Panneau de contrôle intelligent */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-purple-50/50 border-purple-100'
          }`}>
            <div className="flex items-center justify-between">
              
              {/* Sélecteur de date avec calendrier */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white hover:border-purple-500 shadow-lg' 
                        : 'bg-white border-purple-200 text-slate-900 hover:border-purple-400 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatDate(selectedDateObj, 'dd MMM yyyy')}</span>
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
                  isToday 
                    ? isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isToday ? '📅 Aujourd\'hui' : '📋 Historique'}
                </div>

                {/* Loading indicator for data fetching */}
                {isLoadingData && (
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                    isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    <span>Chargement...</span>
                  </div>
                )}
              </div>

              {/* Métriques en temps réel */}
              <div className="flex items-center space-x-6">
                {/* View Mode Toggle */}
                <ViewModeToggle 
                  viewMode={viewMode} 
                  onChange={setViewMode} 
                  isDark={isDark}
                />
                
                {/* Objectif modifiable */}
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-800 border-slate-600' 
                    : 'bg-white border-purple-200'
                }`}>
                  <Target className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Objectif:</div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setObjectifMensuel(Math.max(0, objectifMensuel - 5))}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs font-bold ${
                        isDark 
                          ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                      }`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={objectifMensuel}
                      onChange={(e) => setObjectifMensuel(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                      className={`w-14 text-center text-sm font-semibold rounded-md py-1 outline-none ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' 
                          : 'bg-white border-purple-200 text-slate-900 focus:border-purple-500'
                      } border`}
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>%</span>
                    <button
                      onClick={() => setObjectifMensuel(Math.min(100, objectifMensuel + 5))}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs font-bold ${
                        isDark 
                          ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Bouton ajout */}
              <button
                onClick={() => setAfficherFormulaire(!afficherFormulaire)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  afficherFormulaire
                    ? isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : isDark ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' : 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {afficherFormulaire ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{afficherFormulaire ? 'Annuler' : 'Nouvel Opérateur'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex flex-1 min-h-0">
            
            {/* Formulaire d'ajout (si affiché) */}
            {afficherFormulaire && (
              <div className={`w-80 border-r flex flex-col ${
                isDark 
                  ? 'border-slate-700 bg-slate-800/30' 
                  : 'border-purple-100 bg-purple-50/30'
              }`}>
                {/* Form Header */}
                <div className="px-6 py-4 flex-shrink-0">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Nouvel Opérateur
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ajoutez un nouvel opérateur à l'équipe
                  </p>
                </div>
                
                {/* Scrollable Form Content */}
                <div className={`flex-1 px-6 overflow-y-auto custom-scrollbar ${
                  isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
                }`}>
                  <div className="space-y-4 pb-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Nom de l'opérateur
                      </label>
                      <input
                        type="text"
                        value={nouvelEmploye.nom}
                        onChange={(e) => setNouvelEmploye(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Ahmed Ben Ali"
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isDark 
                            ? 'bg-slate-800 border-slate-600 text-white' 
                            : 'bg-white border-purple-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <button
                      onClick={ajouterEmploye}
                      disabled={!nouvelEmploye.nom.trim()}
                      className={`w-full py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        nouvelEmploye.nom.trim()
                          ? isDark 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-slate-400 text-white cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <UserPlus className="w-4 h-4" />
                        <span>Ajouter l'Opérateur</span>
                      </div>
                    </button>

                    {/* Section équipe prédéfinie - Design révolutionnaire */}
                    {employesNonUtilises.length > 0 && (
                      <div className={`rounded-xl border overflow-hidden ${
                        isDark ? 'bg-slate-800 border-slate-600' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                      }`}>
                        {/* Header avec statistiques */}
                        <div className={`px-4 py-3 border-b ${
                          isDark ? 'bg-slate-700 border-slate-600' : 'bg-white/80 border-purple-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Équipe Prédéfinie
                                </p>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {employesNonUtilises.length} membre{employesNonUtilises.length > 1 ? 's' : ''} disponible{employesNonUtilises.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {employesNonUtilises.length > 1 && (
                              <button
                                onClick={ajouterTousEmployes}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 ${
                                  isDark 
                                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                              >
                                + Tous
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Liste des employés avec design premium */}
                        <div className="p-3 space-y-2">
                          {employesNonUtilises.map((emp, index) => {
                            return (
                              <button
                                key={emp.name}
                                onClick={() => ajouterEmployePredefini(emp)}
                                className={`w-full p-3 rounded-lg transition-all duration-300 hover:scale-102 transform group ${
                                  isDark 
                                    ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-purple-500' 
                                    : 'bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 shadow-sm hover:shadow-lg'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Avatar minimal avec gradient */}
                                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${emp.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                                    <span className="text-white font-bold text-sm">{emp.name.charAt(0)}</span>
                                  </div>
                                  
                                  {/* Informations employé */}
                                  <div className="flex-1 text-left">
                                    <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                      {emp.name}
                                    </div>
                                  </div>
                                  
                                  {/* Bouton d'action */}
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    isDark 
                                      ? 'bg-purple-700 group-hover:bg-purple-600 text-white' 
                                      : 'bg-purple-500 group-hover:bg-purple-600 text-white'
                                  } group-hover:scale-110`}>
                                    <Plus className="w-4 h-4" />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Info section */}
                    <div className={`p-3 rounded-lg border ${
                      isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-purple-50 border-purple-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <p className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                          Calcul Efficacité
                        </p>
                      </div>
                      <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <div>• Tâches terminées ÷ Total tâches</div>
                        <div>• Calcul automatique en temps réel</div>
                        <div>• Objectif: ≥{objectifMensuel}% par opérateur</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des employés - Design moderne */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Équipe du {formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {employes.length > 0 
                        ? `${stats.total} opérateur(s) • ${stats.totalTasks} tâches • Efficacité: ${kpiMensuel}%`
                        : `Commencez par ajouter des opérateurs pour gérer leurs tâches`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {employes.length === 0 ? (
                <div className="space-y-6">
                  {/* Empty State */}
                  <div className={`text-center py-8 border-2 border-dashed rounded-xl ${
                    isDark 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-slate-300 bg-slate-50'
                  }`}>
                    <Users className={`w-12 h-12 mx-auto mb-4 ${
                      isDark ? 'text-slate-600' : 'text-slate-400'
                    }`} />
                    <h3 className={`text-lg font-medium mb-2 ${
                      isDark ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                      {isLoadingData ? 'Chargement...' : 'Aucun opérateur pour cette date'}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      {isLoadingData ? 'Récupération des données en cours...' : 'Commencez par ajouter des opérateurs à votre équipe'}
                    </p>
                  </div>

                  {/* Smart Predefined Team Display */}
                  {!isLoadingData && employesNonUtilises.length > 0 && (
                    <div className={`rounded-xl border overflow-hidden ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                    }`}>
                      <div className={`px-4 py-3 border-b ${
                        isDark ? 'bg-slate-700 border-slate-600' : 'bg-white/80 border-purple-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Équipe Prédéfinie
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Ajoutez rapidement les membres de votre équipe
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={ajouterTousEmployes}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 ${
                              isDark 
                                ? 'bg-green-700 hover:bg-green-600 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            + Tous Ajouter
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {employesNonUtilises.map((emp) => (
                          <button
                            key={emp.name}
                            onClick={() => ajouterEmployePredefini(emp)}
                            className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 transform group ${
                              isDark 
                                ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-purple-500' 
                                : 'bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 shadow-sm hover:shadow-lg'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${emp.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <span className="text-white font-bold text-sm">{emp.name.charAt(0)}</span>
                              </div>
                              
                              <div className="flex-1 text-left">
                                <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {emp.name}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Opérateur
                                </div>
                              </div>
                              
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                isDark 
                                  ? 'bg-purple-700 group-hover:bg-purple-600 text-white' 
                                  : 'bg-purple-500 group-hover:bg-purple-600 text-white'
                              } group-hover:scale-110`}>
                                <Plus className="w-4 h-4" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {viewMode === 'cards' && (
                    <div className="space-y-6">
                      {employes.map((employe) => (
                        <TeamMemberTaskCard
                          key={employe.id}
                          employee={employe}
                          onUpdate={mettreAJourEmploye}
                          onDelete={supprimerEmploye}
                          onUpdateTask={updateTask}
                          onDeleteTask={deleteTask}
                          onToggleTask={toggleTask}
                          onAddTask={addTask}
                          monthlyTarget={objectifMensuel}
                          isDark={isDark}
                          calculateEmployeeEfficiency={calculateEmployeeEfficiency}
                        />
                      ))}
                    </div>
                  )}
                  
                  {viewMode === 'list' && (
                    <TaskList 
                      team={employes}
                      onAddTask={addTask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onToggleTask={toggleTask}
                      target={objectifMensuel}
                      isDark={isDark}
                      calculateEmployeeEfficiency={calculateEmployeeEfficiency}
                    />
                  )}
                  
                  {viewMode === 'compact' && (
                    <CompactView 
                      team={employes}
                      onAddTask={addTask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onToggleTask={toggleTask}
                      target={objectifMensuel}
                      isDark={isDark}
                      calculateEmployeeEfficiency={calculateEmployeeEfficiency}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pied de page */}
          <div className={`px-6 py-4 border-t flex-shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-100'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">{kpiMensuel}% KPI Équipe</span>
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stats.total} opérateur(s) • {stats.completedTasks}/{stats.totalTasks} tâches
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Objectif: ≥{objectifMensuel}%
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                    isDark 
                      ? 'border-purple-600 hover:border-purple-500 hover:bg-purple-900/20 text-purple-400' 
                      : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={gererSoumission}
                  disabled={employes.filter(emp => emp.name && emp.name.trim()).length === 0}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 shadow-sm ${
                    employes.filter(emp => emp.name && emp.name.trim()).length === 0
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : isDark 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
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

// Main Employee Task Card
const TeamMemberTaskCard = ({ 
  employee, 
  onUpdate, 
  onDelete, 
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onAddTask,
  monthlyTarget, 
  isDark,
  calculateEmployeeEfficiency
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [showTasks, setShowTasks] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const efficiency = calculateEmployeeEfficiency(employee);
  const completedTasks = employee.tasks ? employee.tasks.filter(t => t.completed).length : 0;
  const totalTasks = employee.tasks ? employee.tasks.length : 0;

  // Get employee color
  const getEmployeeColor = (employeeName) => {
    const employeData = EMPLOYES_PREDEFINIS.find(emp => emp.name === employeeName);
    return employeData ? employeData.color : 'from-slate-500 to-slate-600';
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(employee.id, newTaskText.trim());
      setNewTaskText('');
      setIsAddingTask(false);
      if (!showTasks) setShowTasks(true); // Auto-expand to show new task
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setEditText(task.description);
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdateTask(employee.id, editingTask, 'description', editText.trim());
    }
    setEditingTask(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const handleQuickAdd = () => {
    setIsAddingTask(true);
    if (!showTasks) setShowTasks(true);
  };

  const handleCancelAdd = () => {
    setIsAddingTask(false);
    setNewTaskText('');
  };

  return (
    <div className={`rounded-xl border transition-all ${
      isDark 
        ? 'bg-slate-800 border-slate-700 hover:border-purple-500/50' 
        : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-lg'
    }`}>
      
      {/* Employee Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getEmployeeColor(employee.name)} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-lg">
                {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            
            <div className="flex-1">
              <input
                type="text"
                value={employee.name}
                onChange={(e) => onUpdate(employee.id, 'name', e.target.value)}
                placeholder="Nom de l'opérateur"
                className={`text-lg font-semibold bg-transparent border-none p-0 ${
                  isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                } focus:outline-none w-full`}
              />
              
              <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Opérateur spécialisé
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
              efficiency >= monthlyTarget ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {efficiency}%
            </div>
            
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              isDark ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              {completedTasks}/{totalTasks}
            </div>
            
            <button
              onClick={() => onDelete(employee.id)}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Tâches terminées: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {completedTasks} sur {totalTasks} tâches
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Task Summary & Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            {totalTasks > 0 && (
              <button
                onClick={() => setShowTasks(!showTasks)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all ${
                  isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span>{totalTasks} tâche{totalTasks > 1 ? 's' : ''}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showTasks ? 'rotate-90' : ''}`} />
              </button>
            )}
            
            {totalTasks === 0 && (
              <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Aucune tâche
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              isDark 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Tâche</span>
          </button>
        </div>
      </div>

      {/* Collapsible Tasks Section */}
      {showTasks && (
        <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="p-4 space-y-2">
            {employee.tasks && employee.tasks.length > 0 && (
              <>
                {employee.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`group flex items-center space-x-3 py-2 px-3 rounded-lg transition-all ${
                      task.completed ? 'opacity-60' : ''
                    } ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleTask(employee.id, task.id)}
                      className={`flex-shrink-0 ${task.completed ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                      {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {editingTask === task.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className={`flex-1 bg-transparent text-sm border-none p-0 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            } focus:outline-none`}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className={`p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30`}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={`p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleEditTask(task)}
                          className={`text-sm cursor-text ${
                            task.completed ? 'line-through' : ''
                          } ${isDark ? 'text-slate-200 hover:text-purple-300' : 'text-slate-700 hover:text-purple-600'} transition-colors`}
                        >
                          {task.description}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDeleteTask(employee.id, task.id)}
                        className={`p-1 rounded transition-colors ${
                          isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Smart Add Task Input */}
            {isAddingTask && (
              <div className={`py-2 px-3 rounded-lg border-2 border-dashed transition-all ${
                isDark ? 'border-purple-600/50 bg-purple-900/20' : 'border-purple-300/50 bg-purple-50/50'
              }`}>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTaskText.trim()) {
                      handleAddTask();
                    }
                    if (e.key === 'Escape') handleCancelAdd();
                  }}
                  placeholder="Nouvelle tâche..."
                  className={`w-full bg-transparent text-sm ${
                    isDark ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'
                  } border-none p-0 focus:outline-none`}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className={`text-xs ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'} transition-colors`}
                  >
                    Échap pour annuler
                  </button>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskText.trim()}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      newTaskText.trim()
                        ? isDark 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-slate-400 text-white cursor-not-allowed'
                    }`}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ViewModeToggle component
const ViewModeToggle = ({ viewMode, onChange, isDark }) => (
  <div className={`flex items-center p-1 rounded-lg ${
    isDark ? 'bg-slate-700' : 'bg-purple-200'
  }`}>
    {[
      { mode: 'cards', icon: Grid3X3, label: 'Cartes' },
      { mode: 'list', icon: List, label: 'Liste' },
      { mode: 'compact', icon: Minimize2, label: 'Compact' }
    ].map(({ mode, icon: Icon, label }) => (
      <button
        key={mode}
        onClick={() => onChange(mode)}
        className={`p-1.5 rounded transition-colors ${
          viewMode === mode
            ? isDark 
              ? 'bg-slate-600 text-white' 
              : 'bg-white text-slate-900 shadow-sm'
            : isDark 
              ? 'text-slate-400 hover:text-slate-300' 
              : 'text-slate-600 hover:text-slate-800'
        }`}
        title={label}
      >
        <Icon className="w-4 h-4" />
      </button>
    ))}
  </div>
);

// TaskList component for list view
const TaskList = ({ team, onAddTask, onUpdateTask, onDeleteTask, onToggleTask, target, isDark, calculateEmployeeEfficiency }) => (
  <div className="space-y-4">
    {team.map(member => {
      const tasks = member.tasks || [];
      const efficiency = calculateEmployeeEfficiency(member);
      const getEmployeeColor = (employeeName) => {
        const employeData = EMPLOYES_PREDEFINIS.find(emp => emp.name === employeeName);
        return employeData ? employeData.color : 'from-slate-500 to-slate-600';
      };
      
      return (
        <div key={member.id} className={`border rounded-lg ${
          isDark ? 'border-slate-700' : 'border-purple-200'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-purple-200 bg-purple-50/50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getEmployeeColor(member.name)} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
              </div>
              <span className={`text-sm font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>{member.name}</span>
            </div>
            <div className={`text-sm font-bold ${
              efficiency >= target ? 'text-green-500' : 'text-orange-500'
            }`}>
              {efficiency}%
            </div>
          </div>
          <div className="p-4">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <button
                  onClick={() => {
                    const description = prompt('Nouvelle tâche:');
                    if (description && description.trim()) {
                      onAddTask(member.id, description.trim());
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDark 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Ajouter une tâche
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className={`flex items-center space-x-3 p-2 rounded transition-colors ${
                    isDark ? 'hover:bg-slate-700' : 'hover:bg-purple-50'
                  }`}>
                    <button
                      onClick={() => onToggleTask(member.id, task.id)}
                      className={task.completed ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}
                    >
                      {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <span className={`flex-1 text-sm ${
                      task.completed 
                        ? isDark ? 'line-through text-slate-500' : 'line-through text-slate-400'
                        : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {task.description}
                    </span>
                    <button
                      onClick={() => onDeleteTask(member.id, task.id)}
                      className={`text-sm ${
                        isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const description = prompt('Nouvelle tâche:');
                    if (description && description.trim()) {
                      onAddTask(member.id, description.trim());
                    }
                  }}
                  className={`w-full mt-2 p-2 border border-dashed rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 ${
                    isDark 
                      ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300' 
                      : 'border-purple-300 text-purple-600 hover:border-purple-400 hover:text-purple-700'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter une tâche</span>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// CompactView component
const CompactView = ({ team, onAddTask, onUpdateTask, onDeleteTask, onToggleTask, target, isDark, calculateEmployeeEfficiency }) => (
  <div className={`border rounded-lg overflow-hidden ${
    isDark ? 'border-slate-700' : 'border-purple-200'
  }`}>
    <div className={`p-4 border-b ${
      isDark ? 'border-slate-700 bg-slate-800' : 'border-purple-200 bg-purple-50/50'
    }`}>
      <div className="grid grid-cols-5 gap-4 text-xs font-bold uppercase tracking-wide">
        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>Opérateur</div>
        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tâches</div>
        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>Terminées</div>
        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>Efficacité</div>
        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>Actions</div>
      </div>
    </div>
    <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-purple-200'}`}>
      {team.map(member => {
        const tasks = member.tasks || [];
        const completedCount = tasks.filter(t => t.completed).length;
        const efficiency = calculateEmployeeEfficiency(member);
        const getEmployeeColor = (employeeName) => {
          const employeData = EMPLOYES_PREDEFINIS.find(emp => emp.name === employeeName);
          return employeData ? employeData.color : 'from-slate-500 to-slate-600';
        };
        
        return (
          <div key={member.id} className={`p-4 transition-colors ${
            isDark ? 'hover:bg-slate-800' : 'hover:bg-purple-50/50'
          }`}>
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r ${getEmployeeColor(member.name)} shadow-lg`}>
                  {member.name.charAt(0)}
                </div>
                <span className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>{member.name}</span>
              </div>
              <div className={`text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>{tasks.length}</div>
              <div className={`text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>{completedCount}</div>
              <div className={`text-sm font-bold ${
                efficiency >= target ? 'text-green-500' : 'text-orange-500'
              }`}>{efficiency}%</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    const description = prompt('Nouvelle tâche:');
                    if (description && description.trim()) {
                      onAddTask(member.id, description.trim());
                    }
                  }}
                  className={`p-1 rounded transition-colors ${
                    isDark 
                      ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer ${member.name}?`)) {
                      // Note: We need to pass this up through props
                      console.log('Delete member:', member.id);
                    }
                  }}
                  className={`p-1 rounded transition-colors ${
                    isDark 
                      ? 'bg-red-800 hover:bg-red-700 text-red-300' 
                      : 'bg-red-100 hover:bg-red-200 text-red-600'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);