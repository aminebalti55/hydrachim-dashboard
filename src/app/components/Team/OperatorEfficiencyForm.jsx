import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Settings, User, Calendar, Target, Save, X, Plus, Trash2,
  GripVertical, CheckCircle2, Circle, Clock, BarChart3, UserRound, UserPlus, ListChecks
} from 'lucide-react';

// Sortable Task Item Component (French)
const SortableTask = ({ task, onToggle, onUpdate, onDelete, isDark }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    high: isDark ? 'border-red-700/50 bg-red-900/30' : 'border-red-300 bg-red-50',
    medium: isDark ? 'border-yellow-700/50 bg-yellow-900/30' : 'border-yellow-300 bg-yellow-50',
    low: isDark ? 'border-green-700/50 bg-green-900/30' : 'border-green-300 bg-green-50'
  };
  
  const baseInputClasses = `text-sm transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30'
  }`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
        task.completed
          ? isDark ? 'bg-slate-800/60 border-slate-700/70 opacity-70' : 'bg-slate-100 border-slate-300 opacity-70'
          : priorityColors[task.priority] || (isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200')
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          {...attributes}
          {...listeners}
          className={`mt-1.5 cursor-grab active:cursor-grabbing p-1 rounded-md ${
            isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 p-1 rounded-md ${
            task.completed
              ? 'text-green-500 hover:text-green-400'
              : isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
        >
          {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={task.description}
              onChange={(e) => onUpdate(task.id, 'description', e.target.value)}
              placeholder="Description de la tâche"
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${baseInputClasses} ${
                task.completed ? 'line-through' : ''
              }`}
            />
            <div className="flex items-center space-x-2 ml-2">
              <select
                value={task.priority}
                onChange={(e) => onUpdate(task.id, 'priority', e.target.value)}
                className={`text-xs px-2.5 py-2 rounded-lg border shadow-sm ${baseInputClasses}`}
              >
                <option value="low">Bas</option>
                <option value="medium">Moyen</option>
                <option value="high">Haut</option>
              </select>
              <button
                onClick={() => onDelete(task.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                  }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="number"
              value={task.estimatedMinutes || ''}
              onChange={(e) => onUpdate(task.id, 'estimatedMinutes', parseInt(e.target.value) || 0)}
              placeholder="Min"
              min="0"
              className={`w-24 px-2.5 py-1.5 rounded-lg border text-xs shadow-sm ${baseInputClasses}`}
            />
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Form Component (French)
export const OperatorEfficiencyForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [employees, setEmployees] = useState(existingData?.employees || []);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 85);
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 87);
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const baseInputClasses = `w-full px-4 py-3 rounded-xl border shadow-sm transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30'
  }`;
  
  const employeeCardInputClasses = `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30'
  }`;

  const addEmployee = () => {
    const newEmployee = {
      id: Date.now(),
      name: '',
      workHours: 8,
      tasks: [],
      efficiency: 0,
      notes: ''
    };
    setEmployees([...employees, newEmployee]);
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };
        if (field === 'tasks' || field === 'workHours') {
          updated.efficiency = calculateEmployeeEfficiency(updated);
        }
        return updated;
      }
      return emp;
    }));
  };

  const addTask = (employeeId) => {
    const newTask = {
      id: Date.now(),
      description: '',
      priority: 'medium',
      estimatedMinutes: 30,
      completed: false
    };
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedTasks = [...emp.tasks, newTask];
        const updatedEmp = { ...emp, tasks: updatedTasks };
        updatedEmp.efficiency = calculateEmployeeEfficiency(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
  };

  const deleteTask = (employeeId, taskId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedTasks = emp.tasks.filter(task => task.id !== taskId);
        const updatedEmp = { ...emp, tasks: updatedTasks };
        updatedEmp.efficiency = calculateEmployeeEfficiency(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
  };

  const updateTask = (employeeId, taskId, field, value) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedTasks = emp.tasks.map(task =>
          task.id === taskId ? { ...task, [field]: value } : task
        );
        const updatedEmp = { ...emp, tasks: updatedTasks };
        updatedEmp.efficiency = calculateEmployeeEfficiency(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
  };

  const toggleTask = (employeeId, taskId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedTasks = emp.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const updatedEmp = { ...emp, tasks: updatedTasks };
        updatedEmp.efficiency = calculateEmployeeEfficiency(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));
  };

  const handleDragEnd = (event, employeeId) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setEmployees(employees.map(emp => {
        if (emp.id === employeeId) {
          const oldIndex = emp.tasks.findIndex(task => task.id === active.id);
          const newIndex = emp.tasks.findIndex(task => task.id === over.id);
          return { ...emp, tasks: arrayMove(emp.tasks, oldIndex, newIndex) };
        }
        return emp;
      }));
    }
  };

  const calculateEmployeeEfficiency = (employee) => {
    if (!employee.tasks.length || employee.workHours <= 0) return 0;
    const completedTasks = employee.tasks.filter(task => task.completed);
    const taskCompletionRate = (completedTasks.length / employee.tasks.length) * 100;
    const totalEstimatedMinutes = completedTasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
    const actualWorkMinutes = employee.workHours * 60;
    
    const timeUtilization = actualWorkMinutes > 0 ? Math.min(100, (totalEstimatedMinutes / actualWorkMinutes) * 100) : 0;
    const efficiency = (taskCompletionRate * 0.6) + (timeUtilization * 0.4);
    return Math.round(Math.min(100, efficiency));
  };

  const validateForm = () => {
    const newErrors = {};
    if (employees.length === 0) newErrors.employees = "Veuillez sélectionner au moins un employé.";
    employees.forEach((emp, index) => {
      if (!emp.name.trim()) newErrors[`employee_${emp.id}_name`] = "Ce champ est requis.";
      if (emp.workHours <= 0) newErrors[`employee_${emp.id}_hours`] = "Veuillez saisir un temps valide.";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Calculate team average efficiency for the main KPI value
    const calculateTeamEfficiency = () => {
      if (employees.length === 0) return 0;
      const validEmployees = employees.filter(emp => emp.efficiency > 0 && emp.name.trim());
      if (validEmployees.length === 0) return 0;
      const total = validEmployees.reduce((sum, emp) => sum + emp.efficiency, 0);
      return Math.round(total / validEmployees.length);
    };
    
    // FIXED: Ensure efficiency is calculated for each employee before saving
    const processedEmployees = employees.filter(emp => emp.name.trim()).map(emp => ({
      ...emp,
      efficiency: calculateEmployeeEfficiency(emp) // Make sure this is calculated
    }));
    
    const efficiencyData = {
      value: calculateTeamEfficiency(), // Main KPI value (number) for status calculations
      date: selectedDate,
      employees: processedEmployees, // Detailed data
      weeklyTarget,
      monthlyTarget,
      type: 'efficiency'
    };
    
    // FIXED: Pass the full data object as the third parameter
    onSave('team', 'operator_efficiency', efficiencyData, '');
  };

  const calculateTeamEfficiency = () => {
    if (employees.length === 0) return 0;
    const validEmployees = employees.filter(emp => emp.efficiency > 0 && emp.name.trim());
    if (validEmployees.length === 0) return 0;
    const total = validEmployees.reduce((sum, emp) => sum + emp.efficiency, 0);
    return Math.round(total / validEmployees.length);
  };

  const teamEfficiency = calculateTeamEfficiency();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border-0 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        <div className={`px-8 py-5 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Efficacité de l'Opérateur
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Gestion des tâches et efficacité
                </p>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Sélectionner la date</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={baseInputClasses}
                />
              </div>
              
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span>Objectif Hebdomadaire (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className={baseInputClasses}
                />
              </div>
              
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span>Objectif Mensuel (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className={baseInputClasses}
                />
              </div>
            </div>

            {employees.filter(emp => emp.name.trim()).length > 0 && (
              <div className={`p-5 rounded-xl border ${
                isDark 
                  ? teamEfficiency >= weeklyTarget 
                    ? 'bg-green-900/20 border-green-700/30' 
                    : 'bg-red-900/20 border-red-700/30'
                  : teamEfficiency >= weeklyTarget 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      teamEfficiency >= weeklyTarget 
                        ? 'bg-green-600' 
                        : 'bg-red-600'
                    }`}>
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${
                      isDark 
                        ? teamEfficiency >= weeklyTarget ? 'text-green-400' : 'text-red-400'
                        : teamEfficiency >= weeklyTarget ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Efficacité Globale de l'Équipe
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${
                      teamEfficiency >= weeklyTarget 
                        ? isDark ? 'text-green-400' : 'text-green-600' 
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {teamEfficiency}%
                    </span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      teamEfficiency >= weeklyTarget 
                        ? isDark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {teamEfficiency >= weeklyTarget ? 'Objectif Atteint' : 'Objectif Manqué'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <UserRound className="w-5 h-5" />
                  <span>Employés ({employees.length})</span>
                </h4>
                <button
                  onClick={addEmployee}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter un employé</span>
                </button>
              </div>

              {employees.map((employee) => (
                <div 
                  key={employee.id} 
                  className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    isDark 
                      ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
                          }`}>
                            <UserRound className="w-4 h-4" />
                          </div>
                        </div>
                        <button
                          onClick={() => removeEmployee(employee.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                              : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Nom de l'employé
                        </label>
                        <input
                          type="text"
                          value={employee.name}
                          onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                          placeholder="Nom de l'employé"
                          className={`${employeeCardInputClasses} ${errors[`employee_${employee.id}_name`] ? (isDark ? 'border-red-500/70' : 'border-red-500') : ''}`}
                        />
                         {errors[`employee_${employee.id}_name`] && (
                            <span className="text-xs text-red-500 mt-1">{errors[`employee_${employee.id}_name`]}</span>
                          )}
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Heures de travail
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={employee.workHours}
                          onChange={(e) => updateEmployee(employee.id, 'workHours', Number(e.target.value))}
                          className={`${employeeCardInputClasses} ${errors[`employee_${employee.id}_hours`] ? (isDark ? 'border-red-500/70' : 'border-red-500') : ''}`}
                        />
                        {errors[`employee_${employee.id}_hours`] && (
                            <span className="text-xs text-red-500 mt-1">{errors[`employee_${employee.id}_hours`]}</span>
                          )}
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Efficacité
                        </label>
                        <div className={`w-full px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <span className={`font-medium ${
                            employee.efficiency >= weeklyTarget 
                              ? (isDark ? 'text-green-400' : 'text-green-600') 
                              : (isDark ? 'text-red-400' : 'text-red-600')
                          }`}>
                            {employee.efficiency}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200/80'}`}>
                      <div className="flex items-center justify-between">
                        <h5 className={`text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          Tâches quotidiennes ({employee.tasks.length})
                          {employee.tasks.length > 0 && (
                            <span className={`ml-2 text-xs ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              ({employee.tasks.filter(t => t.completed).length} terminées)
                            </span>
                          )}
                        </h5>
                        <button
                          onClick={() => addTask(employee.id)}
                          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDark 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ajouter une tâche</span>
                        </button>
                      </div>

                      {employee.tasks.length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, employee.id)}
                        >
                          <SortableContext
                            items={employee.tasks.map(task => task.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                              {employee.tasks.map((task) => (
                                <SortableTask
                                  key={task.id}
                                  task={task}
                                  onToggle={toggleTask.bind(null, employee.id)}
                                  onUpdate={updateTask.bind(null, employee.id)}
                                  onDelete={deleteTask.bind(null, employee.id)}
                                  isDark={isDark}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className={`text-center py-6 border-2 border-dashed rounded-xl ${
                          isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-500'
                        }`}>
                          <ListChecks className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                          <p className="text-sm font-medium">Aucune tâche ajoutée pour cet employé.</p>
                          <p className="text-xs mt-1">Cliquez sur 'Ajouter une tâche' pour commencer.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Remarques
                      </label>
                      <textarea
                        value={employee.notes}
                        onChange={(e) => updateEmployee(employee.id, 'notes', e.target.value)}
                        placeholder="Ajoutez des remarques pertinentes (facultatif)..."
                        rows="2"
                        className={`${employeeCardInputClasses} resize-none`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {employees.length === 0 && (
                <div className={`p-8 rounded-xl border text-center ${
                  isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className={`w-16 h-16 rounded-full ${
                    isDark ? 'bg-slate-700/80' : 'bg-white'
                  } flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    <UserPlus className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                  </div>
                  <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Aucun employé ajouté pour le moment
                  </h4>
                  <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ajoutez des employés pour suivre l'efficacité de leurs tâches.
                  </p>
                  <button
                    onClick={addEmployee}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <span>Ajouter le premier employé</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`px-8 py-5 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={employees.filter(emp => emp.name.trim()).length === 0}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 ${
                employees.filter(emp => emp.name.trim()).length === 0 
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-md hover:from-purple-600 hover:to-purple-700'
              }`}
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
  );
};