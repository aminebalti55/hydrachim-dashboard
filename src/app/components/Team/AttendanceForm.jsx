import { useState, useEffect } from 'react';
import { useTeamsKPIData } from '../../hooks/useTeamsKPIData';
import { 
  Clock, UserPlus, Calendar, Target, Save, X, Trash2, UserRound, 
  Users, Check, Search, Filter, MoreHorizontal, 
  Copy, AlertCircle, Timer, Activity, TrendingUp, Award,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, CalendarDays,
  Edit3, Plus
} from 'lucide-react';

// Employés prédéfinis de l'équipe avec rôles et couleurs
const EMPLOYES_PREDEFINIS = [
  { name: 'Rihem', defaultClockIn: '08:00', defaultClockOut: '17:00', role: 'Manager', color: 'from-purple-500 to-purple-600' },
  { name: 'Hamza', defaultClockIn: '08:00', defaultClockOut: '17:00', role: 'Senior', color: 'from-blue-500 to-blue-600' },
  { name: 'Mohamed', defaultClockIn: '08:00', defaultClockOut: '17:00', role: 'Developer', color: 'from-green-500 to-green-600' },
  { name: 'Nassim', defaultClockIn: '08:00', defaultClockOut: '17:00', role: 'Analyst', color: 'from-orange-500 to-orange-600' },
  { name: 'Tarek', defaultClockIn: '08:00', defaultClockOut: '17:00', role: 'Designer', color: 'from-pink-500 to-pink-600' },
  { name: 'Youssef', defaultClockIn: '08:00', defaultClockOut: '17:00', role: 'QA', color: 'from-teal-500 to-teal-600' }
];

// Helper function to format date in local timezone (fixes calendar glitch)
const toLocalISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AttendanceForm({ onSave, onCancel, existingData = null, isDark = false }) {
  // KPI Data Hook for date-specific loading
  const { getAttendanceByDate } = useTeamsKPIData();

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #3b82f6 transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-track {
      background: rgba(59, 130, 246, 0.08);
      border-radius: 12px;
      border: 1px solid rgba(59, 130, 246, 0.1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 25%, #1d4ed8 75%, #1e40af 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 2px 8px rgba(59, 130, 246, 0.3),
        inset 0 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #1e40af 75%, #1e3a8a 100%);
      box-shadow: 
        0 4px 16px rgba(59, 130, 246, 0.5),
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
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 25%, #1d4ed8 75%, #1e40af 100%);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 2px 8px rgba(59, 130, 246, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #1e40af 75%, #1e3a8a 100%);
      box-shadow: 
        0 4px 16px rgba(59, 130, 246, 0.6),
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
  
  // Fonctions utilitaires pour les mois
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

  // État - FIXED: Use local date formatting for initial state
  const [dateSelectionnee, setDateSelectionnee] = useState(
    existingData?.date || toLocalISODate(aujourdhui)
  );
  const [objectifMensuel, setObjectifMensuel] = useState(existingData?.monthlyTarget || 95);
  const [employes, setEmployes] = useState(existingData?.employees || []);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [nouvelEmploye, setNouvelEmploye] = useState({
    nom: '',
    heureArrivee: '08:00',
    heureDepart: '17:00',
    estPresent: false
  });

  // NEW: Load employees for a specific date
  const loadEmployees = async (date) => {
    if (!date) return;
    
    try {
      setIsLoadingData(true);
      console.log('🔄 Loading attendance data for date:', date);
      
      const attendanceRecord = await getAttendanceByDate(date);
      
      if (attendanceRecord) {
        console.log('✅ Found existing data for date:', date, attendanceRecord);
        setEmployes(attendanceRecord.employees || []);
        setObjectifMensuel(attendanceRecord.monthly_target || 95);
      } else {
        console.log('📭 No existing data for date:', date, '- showing empty list');
        setEmployes([]);
        setObjectifMensuel(95);
      }
    } catch (error) {
      console.error('❌ Error loading attendance data:', error);
      setEmployes([]);
      setObjectifMensuel(95);
    } finally {
      setIsLoadingData(false);
    }
  };

  // NEW: Effect to reload employees when date changes
  useEffect(() => {
    console.log('📅 Date changed to:', dateSelectionnee, '- reloading employees...');
    loadEmployees(dateSelectionnee);
  }, [dateSelectionnee, getAttendanceByDate]);

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
          : 'bg-white border-blue-200 shadow-blue-100/50'
      }`} style={{ width: '280px' }}>
        
        {/* Calendar Header */}
        <div className={`px-3 py-3 ${
          isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-blue-500 to-blue-600'
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
                    ? isDark ? 'text-white hover:bg-blue-600' : 'text-slate-900 hover:bg-blue-500 hover:text-white'
                    : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                  }
                  ${dayObj.isSelected 
                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 shadow-lg' 
                    : ''
                  }
                  ${dayObj.isToday && !dayObj.isSelected
                    ? isDark 
                      ? 'bg-blue-900/40 text-blue-300 ring-1 ring-blue-500' 
                      : 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
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
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-blue-100 bg-blue-50/50'
        }`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                // FIXED: Use local date formatting for "Today" button
                const todayLocal = toLocalISODate(currentDate);
                console.log('📅 Today button clicked:', currentDate, '→ local ISO:', todayLocal);
                setDateSelectionnee(todayLocal);
                setShowCalendar(false);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
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

  // Calculer le KPI mensuel de productivité
  const calculerKPIMensuel = () => {
    const employesValides = employes.filter(emp => emp.name && emp.name.trim());
    if (employesValides.length === 0) return 100;
    
    let totalProductivite = 0;
    employesValides.forEach(emp => {
      const productivite = calculerProductiviteEmploye(emp);
      totalProductivite += productivite;
    });
    
    return Math.round(totalProductivite / employesValides.length);
  };

  // Calculer la productivité d'un employé
  const calculerProductiviteEmploye = (employe) => {
    if (!employe.clockIn || !employe.clockOut || !employe.estPresent) return 0;
    
    const heureArrivee = new Date(`${dateSelectionnee}T${employe.clockIn}`);
    const heureDepart = new Date(`${dateSelectionnee}T${employe.clockOut}`);
    
    if (heureDepart <= heureArrivee) return 0;
    
    const heuresTravaillees = (heureDepart - heureArrivee) / (1000 * 60 * 60);
    const heuresAttendues = 9; // 9 heures de travail attendues
    const productivite = Math.min(100, Math.round((heuresTravaillees / heuresAttendues) * 100));
    
    return productivite;
  };

  // Calculer le taux de présence
  const calculerTauxPresence = () => {
    const employesValides = employes.filter(emp => emp.name && emp.name.trim());
    if (employesValides.length === 0) return 100;
    
    const presents = employesValides.filter(emp => emp.estPresent).length;
    return Math.round((presents / employesValides.length) * 100);
  };

  // Obtenir les statistiques
  const obtenirStatistiques = () => {
    const employesValides = employes.filter(emp => emp.name && emp.name.trim());
    const total = employesValides.length;
    const presents = employesValides.filter(emp => emp.estPresent).length;
    const absents = total - presents;
    const enRetard = employesValides.filter(emp => emp.estPresent && emp.clockIn > '08:30').length;
    const performants = employesValides.filter(emp => {
      const productivite = calculerProductiviteEmploye(emp);
      return productivite >= objectifMensuel;
    }).length;

    // Détection du jour actuel
    const dateSelectionneeObj = new Date(dateSelectionnee);
    const estJourActuel = dateSelectionneeObj.toDateString() === aujourdhui.toDateString();
    
    return {
      total,
      presents,
      absents,
      enRetard,
      performants,
      tauxPresence: calculerTauxPresence(),
      estJourActuel
    };
  };

  // Ajouter un employé
  const ajouterEmploye = () => {
    if (!nouvelEmploye.nom.trim()) return;

    const employe = {
      id: Date.now(),
      name: nouvelEmploye.nom.trim(),
      clockIn: nouvelEmploye.heureArrivee,
      clockOut: nouvelEmploye.heureDepart,
      estPresent: nouvelEmploye.estPresent,
      notes: '',
      createdAt: new Date().toISOString()
    };

    setEmployes(prev => [...prev, employe]);
    setNouvelEmploye({
      nom: '',
      heureArrivee: '08:00',
      heureDepart: '17:00',
      estPresent: false
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
      clockIn: employePredefini.defaultClockIn,
      clockOut: employePredefini.defaultClockOut,
      estPresent: false,
      notes: '',
      role: employePredefini.role,
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
      clockIn: employePredefini.defaultClockIn,
      clockOut: employePredefini.defaultClockOut,
      estPresent: false,
      notes: '',
      role: employePredefini.role,
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

  // Gérer la soumission
  const gererSoumission = () => {
    if (employes.length === 0) return;
    
    const kpiMensuel = calculerKPIMensuel();
    const stats = obtenirStatistiques();
    
    const donneesPresence = {
      value: kpiMensuel,
      date: dateSelectionnee,
      monthlyTarget: objectifMensuel,
      employees: employes,
      stats: stats,
      type: 'attendance'
    };
    
    onSave('team', 'team_productivity_attendance', donneesPresence, '');
  };

  // Obtenir couleur KPI basée sur l'objectif
  const obtenirCouleurKPI = () => {
    const kpiMensuel = calculerKPIMensuel();
    if (kpiMensuel >= 95) return 'text-emerald-600';
    if (kpiMensuel >= objectifMensuel) return 'text-blue-600';
    if (kpiMensuel >= objectifMensuel * 0.8) return 'text-amber-600';
    return 'text-red-600';
  };

  const stats = obtenirStatistiques();
  const kpiMensuel = calculerKPIMensuel();
  const moisActuel = obtenirNomMois(dateSelectionnee);
  const anneeActuelle = new Date(dateSelectionnee).getFullYear();
  const selectedDateObj = new Date(dateSelectionnee);
  const employesNonUtilises = EMPLOYES_PREDEFINIS.filter(employePredefini => 
    !employes.some(emp => emp.name && emp.name.toLowerCase() === employePredefini.name.toLowerCase())
  );

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'
        }`}>
          
          {/* En-tête moderne */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Présence & Productivité Équipe
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Suivi journalier de la présence avec calcul de productivité mensuelle
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
                    className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                    title={`📊 FORMULE KPI PRÉSENCE & PRODUCTIVITÉ

🎯 CALCUL DU SCORE:
• KPI = Moyenne de la Productivité de tous les employés présents

📋 CALCUL PRODUCTIVITÉ INDIVIDUELLE:
• Productivité = (Heures Travaillées ÷ 9h attendues) × 100
• Si absent → Productivité = 0%
• Si présent → Calculé selon les heures

📋 SITUATION ACTUELLE:
• Date: ${formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
• Total employés: ${stats.total}
• Présents: ${stats.presents} (${stats.tauxPresence}%)
• Absents: ${stats.absents}
• En retard: ${stats.enRetard}
• Performants (≥${objectifMensuel}%): ${stats.performants}

📈 EXEMPLE DE CALCUL:
• Employé présent 8h → (8÷9)×100 = 89%
• Employé présent 9h → (9÷9)×100 = 100%
• Employé absent → 0%
• KPI Global = Moyenne de toutes les productivités

💡 INTERPRÉTATION:
• 95-100%: Excellence productive
• ${objectifMensuel}-94%: Performance satisfaisante
• ${Math.round(objectifMensuel * 0.8)}-${objectifMensuel-1}%: Attention requise
• <${Math.round(objectifMensuel * 0.8)}%: Action corrective

Score actuel: ${kpiMensuel}%
${kpiMensuel >= objectifMensuel ? '✅ OBJECTIF ATTEINT' : '🚨 SOUS LE SEUIL'}

📌 NOTE: Basé sur 9h de travail attendues par jour`}
                  >
                    {kpiMensuel}%
                  </div>
                </div>
                <button 
                  onClick={onCancel} 
                  className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Panneau de contrôle intelligent */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'
          }`}>
            <div className="flex items-center justify-between">
              
              {/* Sélecteur de date avec calendrier */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white hover:border-blue-500 shadow-lg' 
                        : 'bg-white border-blue-200 text-slate-900 hover:border-blue-400 shadow-lg hover:shadow-xl'
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
                  stats.estJourActuel 
                    ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stats.estJourActuel ? '📅 Aujourd\'hui' : '📋 Historique'}
                </div>

                {/* Loading indicator for data fetching */}
                {isLoadingData && (
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                    isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    <span>Chargement...</span>
                  </div>
                )}
              </div>

              {/* Métriques en temps réel */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{stats.presents}</div>
                      <div className="text-xs text-green-600 font-medium">Présents</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">{stats.absents}</div>
                      <div className="text-xs text-red-600 font-medium">Absents</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div>
                      <div className="text-lg font-semibold text-amber-600">{stats.enRetard}</div>
                      <div className="text-xs text-amber-600 font-medium">En Retard</div>
                    </div>
                  </div>
                </div>
                
                {/* Objectif modifiable */}
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-800 border-slate-600' 
                    : 'bg-white border-blue-200'
                }`}>
                  <Target className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Objectif:</div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setObjectifMensuel(Math.max(0, objectifMensuel - 5))}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs font-bold ${
                        isDark 
                          ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
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
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                          : 'bg-white border-blue-200 text-slate-900 focus:border-blue-500'
                      } border`}
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>%</span>
                    <button
                      onClick={() => setObjectifMensuel(Math.min(100, objectifMensuel + 5))}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs font-bold ${
                        isDark 
                          ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
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
                    : isDark ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {afficherFormulaire ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{afficherFormulaire ? 'Annuler' : 'Nouvel Employé'}</span>
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
                  : 'border-blue-100 bg-blue-50/30'
              }`}>
                {/* Form Header */}
                <div className="px-6 py-4 flex-shrink-0">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Nouvel Employé
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ajoutez un nouvel employé à l'équipe
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
                        Nom de l'employé
                      </label>
                      <input
                        type="text"
                        value={nouvelEmploye.nom}
                        onChange={(e) => setNouvelEmploye(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Ahmed Ben Ali"
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-slate-800 border-slate-600 text-white' 
                            : 'bg-white border-blue-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Heure d'arrivée
                        </label>
                        <input
                          type="time"
                          value={nouvelEmploye.heureArrivee}
                          onChange={(e) => setNouvelEmploye(prev => ({ ...prev, heureArrivee: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDark 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-blue-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Heure de départ
                        </label>
                        <input
                          type="time"
                          value={nouvelEmploye.heureDepart}
                          onChange={(e) => setNouvelEmploye(prev => ({ ...prev, heureDepart: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDark 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-blue-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border ${
                      isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="estPresent"
                          checked={nouvelEmploye.estPresent}
                          onChange={(e) => setNouvelEmploye(prev => ({ ...prev, estPresent: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="estPresent" className={`text-sm font-medium ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Présent aujourd'hui
                        </label>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Cochez si l'employé est présent pour la journée sélectionnée
                      </p>
                    </div>

                    <button
                      onClick={ajouterEmploye}
                      disabled={!nouvelEmploye.nom.trim()}
                      className={`w-full py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        nouvelEmploye.nom.trim()
                          ? isDark 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-400 text-white cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <UserPlus className="w-4 h-4" />
                        <span>Ajouter l'Employé</span>
                      </div>
                    </button>

                    {/* Section équipe prédéfinie - Design révolutionnaire */}
                    {employesNonUtilises.length > 0 && (
                      <div className={`rounded-xl border overflow-hidden ${
                        isDark ? 'bg-slate-800 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                      }`}>
                        {/* Header avec statistiques */}
                        <div className={`px-4 py-3 border-b ${
                          isDark ? 'bg-slate-700 border-slate-600' : 'bg-white/80 border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
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
                                    ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-500' 
                                    : 'bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 shadow-sm hover:shadow-lg'
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
                                    <div className="flex items-center text-xs">
                                      <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {emp.defaultClockIn} - {emp.defaultClockOut}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Bouton d'action */}
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    isDark 
                                      ? 'bg-blue-700 group-hover:bg-blue-600 text-white' 
                                      : 'bg-blue-500 group-hover:bg-blue-600 text-white'
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
                      isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                          Calcul Productivité
                        </p>
                      </div>
                      <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <div>• Heures travaillées ÷ 9h attendues</div>
                        <div>• Calcul automatique basé sur présence</div>
                        <div>• Objectif: ≥{objectifMensuel}% par employé</div>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Équipe du {formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {employes.length} employé(s) • {stats.presents} présent(s) • {stats.tauxPresence}% de présence
                    </p>
                  </div>
                </div>
              </div>

              {employes.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
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
                    {isLoadingData ? 'Chargement...' : 'Aucun employé pour cette date'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                    {isLoadingData ? 'Récupération des données en cours...' : 'Commencez par ajouter des employés à votre équipe'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employes.map((employe) => {
                    const productivite = calculerProductiviteEmploye(employe);
                    const heuresTravaillees = employe.clockIn && employe.clockOut && employe.estPresent
                      ? ((new Date(`${dateSelectionnee}T${employe.clockOut}`) - new Date(`${dateSelectionnee}T${employe.clockIn}`)) / (1000 * 60 * 60))
                      : 0;
                    const estEnRetard = employe.estPresent && employe.clockIn > '08:30';
                    
                    return (
                      <div 
                        key={employe.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' 
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Avatar employé */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold ${
                            employe.estPresent
                              ? productivite >= objectifMensuel
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-slate-400 to-slate-500'
                          }`}>
                            {employe.name ? employe.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          
                          {/* Contenu principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <input
                                    type="text"
                                    value={employe.name}
                                    onChange={(e) => mettreAJourEmploye(employe.id, 'name', e.target.value)}
                                    className={`text-lg font-semibold bg-transparent border-none p-0 flex-1 min-w-0 ${
                                      isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                                    } focus:outline-none`}
                                    placeholder="Nom de l'employé"
                                  />
                                  <button
                                    onClick={() => mettreAJourEmploye(employe.id, 'estPresent', !employe.estPresent)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                      employe.estPresent
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                    }`}
                                  >
                                    {employe.estPresent ? '✓ Présent' : '✗ Absent'}
                                  </button>
                                  {estEnRetard && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                      En retard
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Arrivée:
                                    </span>
                                    <input
                                      type="time"
                                      value={employe.clockIn}
                                      onChange={(e) => mettreAJourEmploye(employe.id, 'clockIn', e.target.value)}
                                      disabled={!employe.estPresent}
                                      className={`text-sm bg-transparent border border-slate-300 rounded px-2 py-1 ${
                                        isDark ? 'text-slate-300 border-slate-600' : 'text-slate-900 border-slate-300'
                                      } focus:outline-none focus:border-blue-500 disabled:opacity-50`}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Départ:
                                    </span>
                                    <input
                                      type="time"
                                      value={employe.clockOut}
                                      onChange={(e) => mettreAJourEmploye(employe.id, 'clockOut', e.target.value)}
                                      disabled={!employe.estPresent}
                                      className={`text-sm bg-transparent border border-slate-300 rounded px-2 py-1 ${
                                        isDark ? 'text-slate-300 border-slate-600' : 'text-slate-900 border-slate-300'
                                      } focus:outline-none focus:border-blue-500 disabled:opacity-50`}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                      {employe.estPresent ? `${Math.round(heuresTravaillees * 100) / 100}h` : '0h'}
                                    </div>
                                    <div className={`text-sm font-bold ${
                                      productivite >= objectifMensuel ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {productivite}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => supprimerEmploye(employe.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isDark 
                                    ? 'hover:bg-red-900/30 text-red-400' 
                                    : 'hover:bg-red-50 text-red-500'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Pied de page */}
          <div className={`px-6 py-4 border-t flex-shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">{kpiMensuel}% KPI Mensuel</span>
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stats.presents}/{stats.total} présents • {stats.tauxPresence}% présence
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Objectif: ≥{objectifMensuel}%
                </div>
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
                  onClick={gererSoumission}
                  disabled={employes.filter(emp => emp.name && emp.name.trim()).length === 0}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 shadow-sm ${
                    employes.filter(emp => emp.name && emp.name.trim()).length === 0
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
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
}