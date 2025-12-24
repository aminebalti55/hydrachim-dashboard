import React, { useState, useEffect } from 'react';
import { useTeamsKPIData } from '../../hooks/useTeamsKPIData';
import {
  Calendar, Package, TrendingUp, Plus, X, Check,
  Trash2, ChevronLeft, ChevronRight, CalendarDays,
  Save, User, Award, BarChart3, Loader2
} from 'lucide-react';

// Helper function to format date in local timezone
const toLocalISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const OperatorEfficiencyForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const { getOperatorEfficiencyByDate } = useTeamsKPIData();
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

  const [dateSelectionnee, setDateSelectionnee] = useState(existingData?.date || toLocalISODate(today));
  const [objectifMensuel, setObjectifMensuel] = useState(existingData?.monthlyTarget || 85);
  const [employes, setEmployes] = useState(existingData?.employees || []);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', matricule: '' });

  // Load employees for a specific date
  const loadEmployees = async (date) => {
    if (!date) return;

    try {
      setIsLoadingData(true);
      const efficiencyRecord = await getOperatorEfficiencyByDate(date);

      if (efficiencyRecord) {
        setEmployes(efficiencyRecord.employees || []);
        setObjectifMensuel(efficiencyRecord.monthly_target || 85);
      } else {
        setEmployes([]);
        setObjectifMensuel(85);
      }
    } catch (error) {
      console.error('Error loading operator efficiency data:', error);
      setEmployes([]);
      setObjectifMensuel(85);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadEmployees(dateSelectionnee);
  }, [dateSelectionnee]);

  // Custom Calendar Component
  const CustomCalendar = () => {
    const currentDate = new Date();
    const [viewDate, setViewDate] = useState(new Date(dateSelectionnee));

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
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

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const isToday = dayDate.toDateString() === currentDate.toDateString();
        const isSelected = dayDate.toDateString() === new Date(dateSelectionnee).toDateString();

        days.push({ day, isCurrentMonth: true, isToday, isSelected, date: dayDate });
      }

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
      const localDate = toLocalISODate(dayObj.date);
      setDateSelectionnee(localDate);
      setShowCalendar(false);
    };

    return (
      <div className={`absolute top-full mt-3 z-50 rounded-xl shadow-xl border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-200'
      }`} style={{ width: '280px' }}>
        <div className={`px-3 py-3 ${isDark ? 'bg-slate-800' : 'bg-gradient-to-r from-purple-500 to-purple-600'}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => navigateMonth(-1)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}>
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">{monthNames[viewDate.getMonth()]}</h3>
              <p className="text-xs text-white/80 font-medium">{viewDate.getFullYear()}</p>
            </div>
            <button onClick={() => navigateMonth(1)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className={`text-center py-1 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayObj, index) => (
              <button
                key={index}
                onClick={() => selectDay(dayObj)}
                className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                  dayObj.isCurrentMonth ? (isDark ? 'text-white hover:bg-purple-600' : 'text-slate-900 hover:bg-purple-500 hover:text-white') : (isDark ? 'text-slate-600' : 'text-slate-400')
                } ${dayObj.isSelected ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300' : ''} ${
                  dayObj.isToday && !dayObj.isSelected ? (isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-800') : ''
                }`}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>
        <div className={`px-3 py-2 border-t ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-purple-100 bg-purple-50/50'}`}>
          <button
            onClick={() => {
              setDateSelectionnee(toLocalISODate(today));
              setShowCalendar(false);
            }}
            className={`px-2 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
          >
            Aujourd'hui
          </button>
        </div>
      </div>
    );
  };

  // Calculate employee production efficiency
  const calculateEmployeeEfficiency = (employee) => {
    if (!employee.tasks || employee.tasks.length === 0) return 0;
    const completedTasks = employee.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / employee.tasks.length) * 100);
  };

  // Calculate team efficiency
  const calculateTeamEfficiency = () => {
    const validEmployees = employes.filter(emp => emp.name && emp.name.trim());
    if (validEmployees.length === 0) return 0;
    const totalEfficiency = validEmployees.reduce((sum, emp) => sum + calculateEmployeeEfficiency(emp), 0);
    return Math.round(totalEfficiency / validEmployees.length);
  };

  // Get production stats
  const getProductionStats = () => {
    const totalProduction = employes.reduce((sum, emp) => {
      return sum + (emp.tasks || []).reduce((taskSum, task) => {
        return taskSum + (parseFloat(task.quantity_kg) || 0);
      }, 0);
    }, 0);

    const completedProduction = employes.reduce((sum, emp) => {
      return sum + (emp.tasks || []).filter(t => t.completed).reduce((taskSum, task) => {
        return taskSum + (parseFloat(task.quantity_kg) || 0);
      }, 0);
    }, 0);

    return {
      totalProduction: Math.round(totalProduction),
      completedProduction: Math.round(completedProduction),
      totalTasks: employes.reduce((sum, emp) => sum + (emp.tasks?.length || 0), 0),
      completedTasks: employes.reduce((sum, emp) => sum + (emp.tasks?.filter(t => t.completed).length || 0), 0)
    };
  };

  const addEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.matricule) return;

    const exists = employes.some(e => e.matricule === parseInt(newEmployee.matricule));
    if (exists) {
      alert('Un employé avec ce matricule existe déjà');
      return;
    }

    const employe = {
      id: parseInt(newEmployee.matricule),
      name: newEmployee.name.trim().toUpperCase(),
      matricule: parseInt(newEmployee.matricule),
      tasks: [],
      notes: '',
      createdAt: new Date().toISOString()
    };

    setEmployes([...employes, employe]);
    setNewEmployee({ name: '', matricule: '' });
    setShowAddEmployee(false);
  };

  const deleteEmployee = (employeeId) => {
    if (confirm('Supprimer cet employé et toutes ses productions ?')) {
      setEmployes(employes.filter(emp => emp.id !== employeeId));
    }
  };

  const addProductionTask = (employeeId, date, quantityKg, description = '') => {
    if (!quantityKg || quantityKg <= 0) return;

    const newTask = {
      id: Date.now(),
      date: date,
      quantity_kg: parseFloat(quantityKg),
      description: description || `Production ${quantityKg} kg`,
      completed: true
    };

    setEmployes(employes.map(emp =>
      emp.id === employeeId
        ? { ...emp, tasks: [...(emp.tasks || []), newTask] }
        : emp
    ));
  };

  const deleteTask = (employeeId, taskId) => {
    setEmployes(employes.map(emp =>
      emp.id === employeeId
        ? { ...emp, tasks: emp.tasks.filter(t => t.id !== taskId) }
        : emp
    ));
  };

  const toggleTask = (employeeId, taskId) => {
    setEmployes(employes.map(emp =>
      emp.id === employeeId
        ? { ...emp, tasks: emp.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
        : emp
    ));
  };

  const handleSubmit = () => {
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

  const kpiMensuel = calculateTeamEfficiency();
  const stats = getProductionStats();
  const selectedDateObj = new Date(dateSelectionnee);
  const isToday = selectedDateObj.toDateString() === today.toDateString();

  const getKPIColor = () => {
    if (kpiMensuel >= 95) return 'text-emerald-600';
    if (kpiMensuel >= objectifMensuel) return 'text-purple-600';
    if (kpiMensuel >= objectifMensuel * 0.8) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-100'
      }`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Suivi Production Opérateurs
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  Production journalière et efficacité
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Efficacité
                </div>
                <div className={`text-3xl font-light ${getKPIColor()}`}>
                  {kpiMensuel}%
                </div>
              </div>
              <button onClick={onCancel} className="w-9 h-9 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center">
                <X className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={`px-6 py-4 border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-purple-50/50 border-purple-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-purple-200 text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(selectedDateObj, 'dd MMM yyyy')}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
                </button>

                {showCalendar && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                    <CustomCalendar />
                  </>
                )}
              </div>

              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                isToday ? (isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
              }`}>
                {isToday ? '📅 Aujourd\'hui' : '📋 Historique'}
              </div>

              {isLoadingData && (
                <div className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                  isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Chargement...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'}`}>
                {stats.completedProduction.toLocaleString()} / {stats.totalProduction.toLocaleString()} kg
              </div>
              <button
                onClick={() => setShowAddEmployee(!showAddEmployee)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  showAddEmployee
                    ? (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700')
                    : (isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white')
                }`}
              >
                <div className="flex items-center space-x-2">
                  {showAddEmployee ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddEmployee ? 'Annuler' : 'Ajouter'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Add Employee Form */}
          {showAddEmployee && (
            <div className={`w-80 border-r flex flex-col ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-purple-100 bg-purple-50/30'}`}>
              <div className="px-6 py-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nouvel Opérateur</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nom</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="Ex: KLAII TAR"
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-purple-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Matricule</label>
                    <input
                      type="number"
                      value={newEmployee.matricule}
                      onChange={(e) => setNewEmployee({ ...newEmployee, matricule: e.target.value })}
                      placeholder="Ex: 4"
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-purple-200 text-slate-900'}`}
                    />
                  </div>
                  <button
                    onClick={addEmployee}
                    disabled={!newEmployee.name.trim() || !newEmployee.matricule}
                    className={`w-full py-3 rounded-lg font-medium ${
                      newEmployee.name.trim() && newEmployee.matricule
                        ? (isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')
                        : 'bg-slate-400 text-white cursor-not-allowed'
                    }`}
                  >
                    Ajouter l'Opérateur
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Employee List */}
          <div className="flex-1 overflow-y-auto p-6">
            {employes.length === 0 ? (
              <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}>
                <Package className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-900'}`}>
                  {isLoadingData ? 'Chargement...' : 'Aucun opérateur'}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  Ajoutez des opérateurs pour suivre leur production
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {employes.map((employe) => (
                  <EmployeeProductionCard
                    key={employe.id}
                    employee={employe}
                    onDelete={deleteEmployee}
                    onAddTask={addProductionTask}
                    onDeleteTask={deleteTask}
                    onToggleTask={toggleTask}
                    isDark={isDark}
                    selectedDate={dateSelectionnee}
                    calculateEmployeeEfficiency={calculateEmployeeEfficiency}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-purple-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${getKPIColor()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpiMensuel}% Efficacité</span>
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {employes.length} opérateur(s) • {stats.totalProduction.toLocaleString()} kg
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg border font-medium text-sm ${
                  isDark ? 'border-purple-600 text-purple-400 hover:bg-purple-900/20' : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={employes.filter(emp => emp.name && emp.name.trim()).length === 0}
                className={`px-6 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 ${
                  employes.filter(emp => emp.name && emp.name.trim()).length === 0
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : (isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')
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

// Employee Production Card Component
const EmployeeProductionCard = ({ employee, onDelete, onAddTask, onDeleteTask, onToggleTask, isDark, selectedDate, calculateEmployeeEfficiency }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduction, setNewProduction] = useState({ date: selectedDate, quantity: '', description: '' });

  const efficiency = calculateEmployeeEfficiency(employee);
  const totalProduction = (employee.tasks || []).reduce((sum, task) => sum + (parseFloat(task.quantity_kg) || 0), 0);
  const completedProduction = (employee.tasks || []).filter(t => t.completed).reduce((sum, task) => sum + (parseFloat(task.quantity_kg) || 0), 0);

  const handleAddProduction = () => {
    if (!newProduction.quantity || newProduction.quantity <= 0) return;

    onAddTask(
      employee.id,
      newProduction.date,
      newProduction.quantity,
      newProduction.description || `Production ${newProduction.quantity} kg`
    );

    setNewProduction({ date: selectedDate, quantity: '', description: '' });
    setShowAddForm(false);
  };

  return (
    <div className={`rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {employee.name ? employee.name.charAt(0) : '?'}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{employee.name}</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Matricule: {employee.matricule}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
              efficiency >= 85 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              {efficiency}%
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${isDark ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'}`}>
              {Math.round(completedProduction)} / {Math.round(totalProduction)} kg
            </div>
            <button onClick={() => onDelete(employee.id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
              style={{ width: `${totalProduction > 0 ? (completedProduction / totalProduction) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2 mb-4">
          {(employee.tasks || []).map(task => (
            <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center space-x-3 flex-1">
                <button onClick={() => onToggleTask(employee.id, task.id)} className={task.completed ? 'text-green-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}>
                  {task.completed ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded border-2" />}
                </button>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${task.completed ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {task.description}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(task.date).toLocaleDateString('fr-FR')} • {task.quantity_kg} kg
                  </div>
                </div>
              </div>
              <button onClick={() => onDeleteTask(employee.id, task.id)} className={`p-1 rounded ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'}`}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Production Form */}
        {showAddForm ? (
          <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-purple-600/50 bg-purple-900/20' : 'border-purple-300/50 bg-purple-50/50'}`}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</label>
                  <input
                    type="date"
                    value={newProduction.date}
                    onChange={(e) => setNewProduction({ ...newProduction, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-purple-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Quantité (kg)</label>
                  <input
                    type="number"
                    value={newProduction.quantity}
                    onChange={(e) => setNewProduction({ ...newProduction, quantity: e.target.value })}
                    placeholder="Ex: 932"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-purple-200 text-slate-900'}`}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setShowAddForm(false)} className={`flex-1 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                  Annuler
                </button>
                <button
                  onClick={handleAddProduction}
                  disabled={!newProduction.quantity || newProduction.quantity <= 0}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    newProduction.quantity && newProduction.quantity > 0
                      ? (isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white')
                      : 'bg-slate-400 text-white cursor-not-allowed'
                  }`}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className={`w-full px-4 py-2 rounded-lg border-2 border-dashed font-medium text-sm flex items-center justify-center space-x-2 ${
              isDark ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une production</span>
          </button>
        )}
      </div>
    </div>
  );
};
