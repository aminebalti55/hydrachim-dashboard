import { useState, useEffect, useMemo } from 'react';
import { useTeamsKPIData } from '../../hooks/useTeamsKPIData';
import {
  Clock, UserPlus, Calendar, Target, Save, X, Trash2,
  Users, Check, ChevronLeft, ChevronRight, CalendarDays,
  Plus, Package, TrendingUp, AlertTriangle, CheckCircle,
  Edit3, BarChart3, Activity, Timer, Award, Eye, EyeOff
} from 'lucide-react';

// Employés prédéfinis
const EMPLOYES_PREDEFINIS = [
  { name: 'KLAII TAR', matricule: 4, defaultClockIn: '08:00', defaultClockOut: '16:30', role: 'Operator', color: 'from-pink-500 to-rose-600' }
];

// Helper function to format date in local timezone
const toLocalISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get first day of month
const getFirstDayOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

// Get month name in French
const getMonthName = (date) => {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[new Date(date).getMonth()];
};

export default function AttendanceForm({ onSave, onCancel, existingData = null, isDark = false }) {
  const { getAttendanceByDate, getOperatorEfficiencyByDate } = useTeamsKPIData();

  // State
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'production'
  const [selectedDate, setSelectedDate] = useState(existingData?.date || toLocalISODate(new Date()));
  const [monthlyTarget, setMonthlyTarget] = useState(95);
  const [productionTarget, setProductionTarget] = useState(80);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  // Employee data state
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [productionTasks, setProductionTasks] = useState([]);

  // New employee form
  const [newEmployee, setNewEmployee] = useState({ name: '', matricule: '', role: 'Operator' });

  // New attendance record
  const [newAttendance, setNewAttendance] = useState({
    date: selectedDate,
    schedule: 'Daytime',
    actual_entry: '08:00',
    actual_exit: '16:30',
    motif: null,
    retard: null
  });

  // New production task
  const [newProduction, setNewProduction] = useState({
    date: selectedDate,
    description: '',
    quantity_kg: 0
  });

  // Selected employee for editing
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Load data when date changes
  useEffect(() => {
    loadData();
    // Also sync the form dates with the selected date
    setNewAttendance(prev => ({ ...prev, date: selectedDate }));
    setNewProduction(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const attendanceData = await getAttendanceByDate(selectedDate);
      const efficiencyData = await getOperatorEfficiencyByDate(selectedDate);

      // Always clear records first when month changes
      const allRecords = [];
      const allTasks = [];

      if (attendanceData?.employees) {
        setEmployees(attendanceData.employees);
        setMonthlyTarget(attendanceData.monthly_target || 95);

        // Extract all attendance records for the selected month
        attendanceData.employees.forEach(emp => {
          if (emp.attendance_records) {
            emp.attendance_records.forEach(rec => {
              allRecords.push({ ...rec, employeeId: emp.id, employeeName: emp.name });
            });
          }
        });

        if (attendanceData.employees.length > 0 && !selectedEmployee) {
          setSelectedEmployee(attendanceData.employees[0]);
        }
      } else {
        // No attendance data for this month - keep employees but clear records
        // Don't reset employees if we already have some
      }

      // Set attendance records (will be empty if no data for this month)
      setAttendanceRecords(allRecords);

      if (efficiencyData?.employees) {
        // Extract all tasks for the selected month
        efficiencyData.employees.forEach(emp => {
          if (emp.tasks) {
            emp.tasks.forEach(task => {
              allTasks.push({ ...task, employeeId: emp.id, employeeName: emp.name });
            });
          }
        });
        setProductionTarget(efficiencyData.monthly_target || 80);

        // Merge employees from efficiency data if not already present
        if (!attendanceData?.employees && efficiencyData.employees.length > 0) {
          setEmployees(efficiencyData.employees);
          if (!selectedEmployee) {
            setSelectedEmployee(efficiencyData.employees[0]);
          }
        }
      }

      // Set production tasks (will be empty if no data for this month)
      setProductionTasks(allTasks);

    } catch (error) {
      console.error('Error loading data:', error);
      // On error, clear data for this month
      setAttendanceRecords([]);
      setProductionTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const currentMonth = new Date(selectedDate).getMonth();
    const monthRecords = attendanceRecords.filter(rec => new Date(rec.date).getMonth() === currentMonth);

    const workedDays = monthRecords.filter(r => !r.motif && r.presence).length;
    const lateDays = monthRecords.filter(r => r.retard && r.retard !== '00:00').length;
    const congeDays = monthRecords.filter(r => r.motif === 'Congé').length;
    const maladieDays = monthRecords.filter(r => r.motif?.includes('Maladie')).length;

    const totalLateMinutes = monthRecords.reduce((sum, r) => {
      if (r.retard) {
        const [h, m] = r.retard.split(':').map(Number);
        return sum + (h * 60 + m);
      }
      return sum;
    }, 0);

    const avgLateMinutes = lateDays > 0 ? Math.round(totalLateMinutes / lateDays) : 0;

    // Production stats
    const monthTasks = productionTasks.filter(t => new Date(t.date).getMonth() === currentMonth);
    const totalProduction = monthTasks.reduce((sum, t) => sum + (t.quantity_kg || 0), 0);
    const productionDays = monthTasks.length;
    const avgProduction = productionDays > 0 ? Math.round(totalProduction / productionDays) : 0;

    return {
      workedDays,
      lateDays,
      congeDays,
      maladieDays,
      avgLateMinutes,
      totalLateMinutes,
      totalProduction,
      productionDays,
      avgProduction,
      totalRecords: monthRecords.length
    };
  }, [attendanceRecords, productionTasks, selectedDate]);

  // Add attendance record
  const addAttendanceRecord = () => {
    if (!selectedEmployee) return;

    // Calculate presence hours
    const entry = new Date(`2000-01-01T${newAttendance.actual_entry}`);
    const exit = new Date(`2000-01-01T${newAttendance.actual_exit}`);
    const hoursWorked = (exit - entry) / (1000 * 60 * 60);
    const hours = Math.floor(hoursWorked);
    const minutes = Math.round((hoursWorked - hours) * 60);
    const presence = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Calculate retard
    const scheduledEntry = newAttendance.schedule === 'SAM' ? '08:00' : '08:00';
    const scheduled = new Date(`2000-01-01T${scheduledEntry}`);
    let retard = null;
    if (entry > scheduled) {
      const lateMinutes = Math.round((entry - scheduled) / (1000 * 60));
      const lateH = Math.floor(lateMinutes / 60);
      const lateM = lateMinutes % 60;
      retard = `${String(lateH).padStart(2, '0')}:${String(lateM).padStart(2, '0')}`;
    }

    const record = {
      date: newAttendance.date,
      schedule: newAttendance.schedule,
      actual_entry: newAttendance.motif ? null : newAttendance.actual_entry,
      actual_exit: newAttendance.motif ? null : newAttendance.actual_exit,
      motif: newAttendance.motif || null,
      retard: newAttendance.motif ? null : retard,
      presence: newAttendance.motif ? '08:30' : presence,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name
    };

    // Check if record for this date already exists
    const existingIndex = attendanceRecords.findIndex(
      r => r.date === record.date && r.employeeId === selectedEmployee.id
    );

    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = record;
      setAttendanceRecords(updated);
    } else {
      setAttendanceRecords([...attendanceRecords, record]);
    }

    // Reset form
    setNewAttendance({
      date: selectedDate,
      schedule: 'Daytime',
      actual_entry: '08:00',
      actual_exit: '16:30',
      motif: null,
      retard: null
    });
  };

  // Add production task
  const addProductionTask = () => {
    if (!selectedEmployee || newProduction.quantity_kg <= 0) return;

    const task = {
      id: Date.now(),
      date: newProduction.date,
      description: newProduction.description || `Production ${newProduction.quantity_kg} kg`,
      quantity_kg: newProduction.quantity_kg,
      completed: true,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name
    };

    setProductionTasks([...productionTasks, task]);
    setNewProduction({ date: selectedDate, description: '', quantity_kg: 0 });
  };

  // Delete attendance record
  const deleteAttendanceRecord = (date, employeeId) => {
    setAttendanceRecords(attendanceRecords.filter(r => !(r.date === date && r.employeeId === employeeId)));
  };

  // Delete production task
  const deleteProductionTask = (taskId) => {
    setProductionTasks(productionTasks.filter(t => t.id !== taskId));
  };

  // Add predefined employee
  const addPredefinedEmployee = (emp) => {
    const exists = employees.some(e => e.matricule === emp.matricule);
    if (exists) return;

    const newEmp = {
      id: emp.matricule,
      name: emp.name,
      matricule: emp.matricule,
      role: emp.role,
      clockIn: emp.defaultClockIn,
      clockOut: emp.defaultClockOut,
      createdAt: new Date().toISOString()
    };

    setEmployees([...employees, newEmp]);
    setSelectedEmployee(newEmp);
  };

  // Add custom employee
  const addCustomEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.matricule) return;

    const exists = employees.some(e => e.matricule === parseInt(newEmployee.matricule));
    if (exists) {
      alert('Un employé avec ce matricule existe déjà');
      return;
    }

    const customEmp = {
      id: parseInt(newEmployee.matricule),
      name: newEmployee.name.trim().toUpperCase(),
      matricule: parseInt(newEmployee.matricule),
      role: newEmployee.role || 'Operator',
      clockIn: '08:00',
      clockOut: '16:30',
      createdAt: new Date().toISOString()
    };

    setEmployees([...employees, customEmp]);
    setSelectedEmployee(customEmp);
    setNewEmployee({ name: '', matricule: '', role: 'Operator' });
    setShowAddEmployee(false);
  };

  // Delete employee
  const deleteEmployee = (empId) => {
    setEmployees(employees.filter(e => e.id !== empId));
    setAttendanceRecords(attendanceRecords.filter(r => r.employeeId !== empId));
    setProductionTasks(productionTasks.filter(t => t.employeeId !== empId));
    if (selectedEmployee?.id === empId) {
      setSelectedEmployee(employees.find(e => e.id !== empId) || null);
    }
  };

  // Save all data
  const handleSave = () => {
    // Build employees with their attendance records
    const employeesWithAttendance = employees.map(emp => ({
      ...emp,
      attendance_records: attendanceRecords
        .filter(r => r.employeeId === emp.id)
        .map(({ employeeId, employeeName, ...rest }) => rest)
    }));

    // Build employees with their tasks
    const employeesWithTasks = employees.map(emp => {
      const empTasks = productionTasks.filter(t => t.employeeId === emp.id);
      const totalProd = empTasks.reduce((sum, t) => sum + (t.quantity_kg || 0), 0);
      return {
        ...emp,
        tasks: empTasks.map(({ employeeId, employeeName, ...rest }) => rest),
        total_production_kg: totalProd,
        production_entries: empTasks.length,
        avg_kg_per_entry: empTasks.length > 0 ? Math.round(totalProd / empTasks.length) : 0
      };
    });

    // Calculate KPIs
    const attendanceKPI = stats.totalRecords > 0
      ? Math.round(((stats.workedDays) / stats.totalRecords) * 100)
      : 100;

    const productionKPI = productionTarget > 0 && stats.avgProduction > 0
      ? Math.min(100, Math.round((stats.avgProduction / 1000) * 100))
      : 80;

    // Save attendance data
    const attendanceData = {
      value: attendanceKPI,
      date: toLocalISODate(getFirstDayOfMonth(selectedDate)),
      monthlyTarget: monthlyTarget,
      employees: employeesWithAttendance,
      stats: {
        total: employees.length,
        presents: employees.length,
        absents: 0,
        enRetard: stats.lateDays,
        late_days: stats.lateDays,
        worked_days: stats.workedDays,
        conge_days: stats.congeDays,
        maladie_days: stats.maladieDays,
        tauxPresence: attendanceKPI
      },
      type: 'attendance'
    };

    // Save production data
    const productionData = {
      value: productionKPI,
      date: toLocalISODate(getFirstDayOfMonth(selectedDate)),
      monthlyTarget: productionTarget,
      employees: employeesWithTasks,
      type: 'efficiency'
    };

    // Call onSave for both
    onSave('team', 'team_productivity_attendance', attendanceData, '');
    onSave('team', 'operator_efficiency', productionData, '');
  };

  // Custom Calendar
  const CustomCalendar = () => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const days = [];
      const prevMonth = new Date(year, month - 1, 0);
      for (let i = startingDay - 1; i >= 0; i--) {
        days.push({ day: prevMonth.getDate() - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonth.getDate() - i) });
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dateStr = toLocalISODate(dayDate);
        const hasAttendance = attendanceRecords.some(r => r.date === dateStr);
        const hasProduction = productionTasks.some(t => t.date === dateStr);
        days.push({
          day,
          isCurrentMonth: true,
          date: dayDate,
          isSelected: dateStr === selectedDate,
          isToday: dayDate.toDateString() === new Date().toDateString(),
          hasAttendance,
          hasProduction
        });
      }

      const remaining = Math.ceil(days.length / 7) * 7 - days.length;
      for (let day = 1; day <= remaining; day++) {
        days.push({ day, isCurrentMonth: false, date: new Date(year, month + 1, day) });
      }

      return days;
    };

    const days = getDaysInMonth(viewDate);

    return (
      <div className={`absolute top-full mt-2 z-50 rounded-xl shadow-2xl border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`} style={{ width: '320px' }}>
        <div className={`px-4 py-3 flex items-center justify-between ${
          isDark ? 'bg-pink-900/30' : 'bg-gradient-to-r from-pink-500 to-rose-500'
        }`}>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
            className="p-1 rounded-lg hover:bg-white/20 text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
            className="p-1 rounded-lg hover:bg-white/20 text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => (
              <button key={i} onClick={() => { setSelectedDate(toLocalISODate(d.date)); setShowCalendar(false); }}
                className={`relative h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                  d.isCurrentMonth
                    ? d.isSelected
                      ? 'bg-pink-500 text-white'
                      : d.isToday
                        ? isDark ? 'bg-pink-900/40 text-pink-300' : 'bg-pink-100 text-pink-700'
                        : isDark ? 'text-white hover:bg-slate-700' : 'text-slate-900 hover:bg-slate-100'
                    : isDark ? 'text-slate-600' : 'text-slate-300'
                }`}>
                {d.day}
                {d.isCurrentMonth && (d.hasAttendance || d.hasProduction) && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {d.hasAttendance && <div className="w-1 h-1 rounded-full bg-blue-500" />}
                    {d.hasProduction && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={`px-3 py-2 border-t flex items-center justify-between ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Présence</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Production</span>
          </div>
          <button onClick={() => { setSelectedDate(toLocalISODate(new Date())); setShowCalendar(false); }}
            className="px-2 py-1 text-xs font-medium rounded bg-pink-500 text-white hover:bg-pink-600">
            Aujourd'hui
          </button>
        </div>
      </div>
    );
  };

  // Get records for selected date
  const selectedDateRecords = attendanceRecords.filter(r => r.date === selectedDate);
  const selectedDateTasks = productionTasks.filter(t => t.date === selectedDate);

  // Get current month records for the selected employee
  const currentMonth = new Date(selectedDate).getMonth();
  const employeeMonthRecords = selectedEmployee
    ? attendanceRecords.filter(r => r.employeeId === selectedEmployee.id && new Date(r.date).getMonth() === currentMonth)
    : [];
  const employeeMonthTasks = selectedEmployee
    ? productionTasks.filter(t => t.employeeId === selectedEmployee.id && new Date(t.date).getMonth() === currentMonth)
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Présence & Productivité Équipe
              </h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {getMonthName(selectedDate)} {new Date(selectedDate).getFullYear()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Picker */}
            <div className="relative">
              <button onClick={() => setShowCalendar(!showCalendar)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-white hover:border-pink-500'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-pink-500 shadow-sm'
                }`}>
                <CalendarDays className="w-4 h-4" />
                <span>{new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </button>
              {showCalendar && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                  <CustomCalendar />
                </>
              )}
            </div>

            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-6 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'attendance'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}>
              <Clock className="w-4 h-4" />
              <span>Présence</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'attendance' ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}>{stats.workedDays}</span>
            </button>

            <button onClick={() => setActiveTab('production')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'production'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}>
              <Package className="w-4 h-4" />
              <span>Production</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'production' ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}>{stats.productionDays}</span>
            </button>

            <div className="flex-1" />

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              {activeTab === 'attendance' ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stats.workedDays} jours travaillés
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stats.lateDays} retards
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stats.congeDays} congés
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stats.totalProduction.toLocaleString()} kg total
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stats.avgProduction} kg/jour moy.
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - Employees */}
          <div className={`w-64 border-r flex flex-col ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Employés</h3>
                <button onClick={() => setShowAddEmployee(!showAddEmployee)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showAddEmployee
                      ? 'bg-pink-500 text-white'
                      : isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                  }`}>
                  {showAddEmployee ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {showAddEmployee && (
                <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                  <h4 className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nouvel Employé
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="Nom complet"
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <input
                      type="number"
                      value={newEmployee.matricule}
                      onChange={e => setNewEmployee({ ...newEmployee, matricule: e.target.value })}
                      placeholder="Matricule"
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <select
                      value={newEmployee.role}
                      onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Operator">Opérateur</option>
                      <option value="Supervisor">Superviseur</option>
                      <option value="Technician">Technicien</option>
                      <option value="Manager">Manager</option>
                    </select>
                    <button
                      onClick={addCustomEmployee}
                      disabled={!newEmployee.name.trim() || !newEmployee.matricule}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        newEmployee.name.trim() && newEmployee.matricule
                          ? 'bg-pink-500 text-white hover:bg-pink-600'
                          : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>

                  {/* Predefined employees section */}
                  {EMPLOYES_PREDEFINIS.filter(e => !employees.some(emp => emp.matricule === e.matricule)).length > 0 && (
                    <div className="mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}">
                      <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ou sélectionner:</p>
                      <div className="space-y-1">
                        {EMPLOYES_PREDEFINIS.filter(e => !employees.some(emp => emp.matricule === e.matricule)).map(emp => (
                          <button key={emp.matricule} onClick={() => { addPredefinedEmployee(emp); setShowAddEmployee(false); }}
                            className={`w-full p-2 rounded-lg text-left transition-all text-sm ${
                              isDark ? 'hover:bg-slate-700' : 'hover:bg-pink-50'
                            }`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded bg-gradient-to-r ${emp.color} flex items-center justify-center text-white font-bold text-xs`}>
                                {emp.name.charAt(0)}
                              </div>
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{emp.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {employees.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun employé</p>
                  <p className="text-xs">Cliquez + pour ajouter</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {employees.map(emp => {
                    const empRecords = attendanceRecords.filter(r => r.employeeId === emp.id && new Date(r.date).getMonth() === currentMonth);
                    const empTasks = productionTasks.filter(t => t.employeeId === emp.id && new Date(t.date).getMonth() === currentMonth);
                    const empProd = empTasks.reduce((sum, t) => sum + (t.quantity_kg || 0), 0);

                    return (
                      <div key={emp.id}
                        className={`group relative p-3 rounded-xl transition-all ${
                          selectedEmployee?.id === emp.id
                            ? isDark ? 'bg-pink-900/40 border border-pink-500' : 'bg-pink-50 border border-pink-300'
                            : isDark ? 'hover:bg-slate-700 border border-transparent' : 'hover:bg-white border border-transparent'
                        }`}>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold`}>
                            {emp.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{emp.matricule}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                {empRecords.length}j
                              </span>
                              {empProd > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {(empProd / 1000).toFixed(1)}t
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEmployee(emp.id); }}
                          className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                            isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'
                          }`}
                          title="Supprimer l'employé"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {!selectedEmployee ? (
              <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Sélectionnez un employé</p>
                  <p className="text-sm">pour gérer sa présence et production</p>
                </div>
              </div>
            ) : activeTab === 'attendance' ? (
              <>
                {/* Attendance Entry Form */}
                <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-5 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Date</label>
                        <input type="date" value={newAttendance.date}
                          onChange={e => setNewAttendance({ ...newAttendance, date: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Horaire</label>
                        <select value={newAttendance.schedule}
                          onChange={e => setNewAttendance({ ...newAttendance, schedule: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}>
                          <option value="Daytime">Daytime</option>
                          <option value="SAM">SAM</option>
                          <option value="Night">Night</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Entrée</label>
                        <input type="time" value={newAttendance.actual_entry}
                          onChange={e => setNewAttendance({ ...newAttendance, actual_entry: e.target.value })}
                          disabled={!!newAttendance.motif}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          } ${newAttendance.motif ? 'opacity-50' : ''}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sortie</label>
                        <input type="time" value={newAttendance.actual_exit}
                          onChange={e => setNewAttendance({ ...newAttendance, actual_exit: e.target.value })}
                          disabled={!!newAttendance.motif}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          } ${newAttendance.motif ? 'opacity-50' : ''}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Motif</label>
                        <select value={newAttendance.motif || ''}
                          onChange={e => setNewAttendance({ ...newAttendance, motif: e.target.value || null })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}>
                          <option value="">Présent</option>
                          <option value="Congé">Congé</option>
                          <option value="Maladie">Maladie</option>
                          <option value="Maladie P">Maladie Payée</option>
                          <option value="Autorisation">Autorisation</option>
                          <option value="Absence">Absence</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={addAttendanceRecord}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2 mt-5">
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Attendance Records List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Historique de {selectedEmployee.name} - {getMonthName(selectedDate)}
                  </h3>

                  {employeeMonthRecords.length === 0 ? (
                    <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <Calendar className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Aucun enregistrement ce mois</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {employeeMonthRecords.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record, idx) => {
                        const hasRetard = record.retard && record.retard !== '00:00';
                        const [h, m] = (record.retard || '00:00').split(':').map(Number);
                        const lateMinutes = h * 60 + m;

                        return (
                          <div key={idx} className={`p-3 rounded-xl border ${
                            record.motif
                              ? isDark ? 'bg-orange-900/20 border-orange-800/50' : 'bg-orange-50 border-orange-200'
                              : hasRetard
                                ? isDark ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'
                                : isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                }`}>{record.schedule}</span>

                                {record.motif ? (
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                    record.motif === 'Congé' ? 'bg-orange-100 text-orange-700' :
                                    record.motif.includes('Maladie') ? 'bg-purple-100 text-purple-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>{record.motif}</span>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Entrée:</span>
                                      <span className={`text-sm font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{record.actual_entry || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sortie:</span>
                                      <span className={`text-sm font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{record.actual_exit || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Heures:</span>
                                      <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{record.presence}</span>
                                    </div>
                                    {hasRetard && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                        Retard: {lateMinutes}min
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>

                              <button onClick={() => deleteAttendanceRecord(record.date, selectedEmployee.id)}
                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Production Entry Form */}
                <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Date</label>
                        <input type="date" value={newProduction.date}
                          onChange={e => setNewProduction({ ...newProduction, date: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Quantité (kg)</label>
                        <input type="number" value={newProduction.quantity_kg}
                          onChange={e => setNewProduction({ ...newProduction, quantity_kg: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Description</label>
                        <input type="text" value={newProduction.description}
                          onChange={e => setNewProduction({ ...newProduction, description: e.target.value })}
                          placeholder="Description (optionnel)"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`} />
                      </div>
                    </div>
                    <button onClick={addProductionTask}
                      disabled={newProduction.quantity_kg <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mt-5 ${
                        newProduction.quantity_kg > 0
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}>
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Production Records List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Production de {selectedEmployee.name} - {getMonthName(selectedDate)}
                    </h3>
                    <div className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Total: {employeeMonthTasks.reduce((sum, t) => sum + (t.quantity_kg || 0), 0).toLocaleString()} kg
                    </div>
                  </div>

                  {employeeMonthTasks.length === 0 ? (
                    <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <Package className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Aucune production ce mois</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {employeeMonthTasks.sort((a, b) => new Date(b.date) - new Date(a.date)).map((task, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {new Date(task.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                              </div>
                              <div className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {task.quantity_kg.toLocaleString()} kg
                              </div>
                              {task.description && (
                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {task.description}
                                </span>
                              )}
                            </div>

                            <button onClick={() => deleteProductionTask(task.id)}
                              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Monthly Summary */}
          <div className={`w-72 border-l flex flex-col ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
              <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Résumé du Mois</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{getMonthName(selectedDate)} {new Date(selectedDate).getFullYear()}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Attendance Stats */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Présence</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jours travaillés</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.workedDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Retards</span>
                    <span className={`font-medium text-amber-500`}>{stats.lateDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Retard moyen</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.avgLateMinutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Congés</span>
                    <span className={`font-medium text-orange-500`}>{stats.congeDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Maladie</span>
                    <span className={`font-medium text-purple-500`}>{stats.maladieDays}</span>
                  </div>
                </div>
              </div>

              {/* Production Stats */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Production</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</span>
                    <span className={`font-bold text-emerald-500`}>{(stats.totalProduction / 1000).toFixed(2)} t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jours productifs</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.productionDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Moyenne/jour</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.avgProduction} kg</span>
                  </div>
                </div>
              </div>

              {/* Targets */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Objectifs</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Présence</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{monthlyTarget}%</span>
                    </div>
                    <input type="range" min="50" max="100" value={monthlyTarget}
                      onChange={e => setMonthlyTarget(parseInt(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none bg-pink-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Production</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{productionTarget}%</span>
                    </div>
                    <input type="range" min="50" max="100" value={productionTarget}
                      onChange={e => setProductionTarget(parseInt(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none bg-emerald-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {employees.length} employé{employees.length !== 1 ? 's' : ''} •
              {attendanceRecords.length} enregistrements présence •
              {productionTasks.length} entrées production
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onCancel}
              className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                isDark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
              Annuler
            </button>
            <button onClick={handleSave}
              disabled={employees.length === 0}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                employees.length > 0
                  ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}>
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
