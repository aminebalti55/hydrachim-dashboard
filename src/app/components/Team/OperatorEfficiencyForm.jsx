import React, { useState, useEffect } from 'react';
import {
  Settings, User, Calendar, Target, Save, X, Plus, Trash2,
  CheckCircle2, Circle, Clock, BarChart3, UserRound, UserPlus, 
  ListChecks, Users, Edit3, Eye, EyeOff, ChevronDown, ChevronUp,
  Timer, Award, TrendingUp, Activity
} from 'lucide-react';

// Default team members
const DEFAULT_EMPLOYEES = [
  'Rihem', 'Hamza', 'Mohamed', 'Nassim', 'Tarek', 'Youssef'
];

// Task Management Modal
const TaskModal = ({ isOpen, onClose, employee, onUpdateEmployee, isDark }) => {
  const [tasks, setTasks] = useState(employee?.tasks || []);
  const [newTask, setNewTask] = useState({ description: '', priority: 'medium', estimatedMinutes: 30 });

  useEffect(() => {
    setTasks(employee?.tasks || []);
  }, [employee]);

  const addTask = () => {
    if (!newTask.description.trim()) return;
    const task = {
      id: Date.now(),
      ...newTask,
      completed: false
    };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    setNewTask({ description: '', priority: 'medium', estimatedMinutes: 30 });
    onUpdateEmployee(employee.id, 'tasks', updatedTasks);
  };

  const updateTask = (taskId, field, value) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
    onUpdateEmployee(employee.id, 'tasks', updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    onUpdateEmployee(employee.id, 'tasks', updatedTasks);
  };

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    onUpdateEmployee(employee.id, 'tasks', updatedTasks);
  };

  if (!isOpen) return null;

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className={`w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Tâches - {employee?.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {completedTasks.length} / {tasks.length} terminées
                  </span>
                  <span className={`font-medium ${
                    completedTasks.length === tasks.length && tasks.length > 0
                      ? 'text-green-500' 
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0)}min total
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-900 hover:text-slate-800'
            }`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(80vh-80px)]">
          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Timer className="w-4 h-4 mr-2 text-amber-500" />
                    En cours ({pendingTasks.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onUpdate={updateTask} 
                        onDelete={deleteTask} 
                        onToggle={toggleTask} 
                        isDark={isDark} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Terminées ({completedTasks.length})
                  </h4>
                  <div className="space-y-2">
                    {completedTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onUpdate={updateTask} 
                        onDelete={deleteTask} 
                        onToggle={toggleTask} 
                        isDark={isDark} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune tâche assignée</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Task Sidebar */}
          <div className={`w-80 border-l p-6 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nouvelle Tâche
            </h4>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description de la tâche..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                  }`}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Priorité
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="low">Bas</option>
                    <option value="medium">Moyen</option>
                    <option value="high">Haut</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Minutes
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 0 })}
                    min="5"
                    max="480"
                    className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!newTask.description.trim()}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  newTask.description.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Ajouter la Tâche
              </button>
            </div>

            {/* Quick Stats */}
            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <h5 className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Statistiques
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total tâches:</span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Temps total:</span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {Math.round(tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0) / 60 * 10) / 10}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Progression:</span>
                  <span className={completedTasks.length === tasks.length && tasks.length > 0 ? 'text-green-500' : isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Task Item
const TaskItem = ({ task, onUpdate, onDelete, onToggle, isDark }) => {
  const priorityColors = {
    high: 'border-l-red-500 bg-red-50/50',
    medium: 'border-l-amber-500 bg-amber-50/50',
    low: 'border-l-green-500 bg-green-50/50'
  };

  const priorityColorsDark = {
    high: 'border-l-red-500 bg-red-900/20',
    medium: 'border-l-amber-500 bg-amber-900/20',
    low: 'border-l-green-500 bg-green-900/20'
  };

  return (
    <div className={`p-3 rounded-lg border-l-4 ${
      isDark ? priorityColorsDark[task.priority] : priorityColors[task.priority]
    } ${task.completed ? 'opacity-60' : ''} ${
      isDark ? 'bg-slate-800' : 'bg-white'
    }`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 ${task.completed ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}
        >
          {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={task.description}
            onChange={(e) => onUpdate(task.id, 'description', e.target.value)}
                          className={`w-full bg-transparent text-sm font-medium ${
              task.completed ? 'line-through' : ''
            } ${isDark ? 'text-white' : 'text-slate-900'} border-none p-0 focus:outline-none`}
          />
          
          <div className="flex items-center space-x-3 mt-1">
            <select
              value={task.priority}
              onChange={(e) => onUpdate(task.id, 'priority', e.target.value)}
              className={`text-xs px-2 py-0.5 rounded ${
                isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}
            >
              <option value="low">Bas</option>
              <option value="medium">Moyen</option>
              <option value="high">Haut</option>
            </select>

            <div className="flex items-center space-x-1">
              <Clock className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="number"
                value={task.estimatedMinutes || ''}
                onChange={(e) => onUpdate(task.id, 'estimatedMinutes', parseInt(e.target.value) || 0)}
                className={`w-12 text-xs bg-transparent ${isDark ? 'text-white' : 'text-slate-900'} border-none p-0`}
                min="5"
              />
              <span className={`text-xs ${isDark ? 'text-white' : 'text-slate-700'}`}>min</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// Employee Card Component
const EmployeeCard = ({ employee, onUpdate, onDelete, onOpenTasks, weeklyTarget, isDark }) => {
  const efficiency = calculateEmployeeEfficiency(employee);
  const completedTasks = employee.tasks.filter(t => t.completed).length;
  const totalTasks = employee.tasks.length;
  const totalMinutes = employee.tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  
  // Calculate components for tooltip
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const timeUtilization = employee.workHours > 0 ? Math.round(Math.min(100, (totalMinutes / (employee.workHours * 60)) * 100)) : 0;

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
      isDark 
        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
            efficiency >= weeklyTarget
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
          }`}>
            {employee.name.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={employee.name}
              onChange={(e) => onUpdate(employee.id, 'name', e.target.value)}
              placeholder="Nom de l'opérateur"
              className={`text-lg font-semibold bg-transparent border-none p-0 w-full ${
                isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              } focus:outline-none`}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Prévu:</span>
                  <input
                    type="number"
                    value={employee.workHours}
                    onChange={(e) => onUpdate(employee.id, 'workHours', Number(e.target.value))}
                    className={`w-10 text-xs bg-transparent border-none p-0 ${
                      isDark ? 'text-slate-300' : 'text-slate-900'
                    }`}
                    min="1"
                    max="24"
                    step="0.5"
                  />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fait:</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {Math.round(totalMinutes / 60 * 10) / 10}h
                  </span>
                </div>
              </div>
              
              {/* Simple priority dots */}
              {totalTasks > 0 && (
                <div className="flex items-center space-x-1 ml-2">
                  {employee.tasks.filter(t => t.priority === 'high').length > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" title="Tâches haute priorité"></div>
                  )}
                  {employee.tasks.filter(t => t.priority === 'medium').length > 0 && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" title="Tâches priorité moyenne"></div>
                  )}
                  {employee.tasks.filter(t => t.priority === 'low').length > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Tâches priorité basse"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(employee.id)}
          className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
            isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Simple Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div 
            className={`text-2xl font-bold cursor-help ${
              efficiency >= weeklyTarget ? 'text-green-500' : 'text-red-500'
            }`}
            title={`Formule KPI Efficacité:

Efficacité = (Taux de Completion × 60%) + (Utilisation du Temps × 40%)

Détail du calcul:
• Taux de Completion: ${taskCompletionRate}% (${completedTasks}/${totalTasks} tâches)
• Utilisation du Temps: ${timeUtilization}% (${Math.round(totalMinutes / 60 * 10) / 10}h/${employee.workHours}h)

Calcul final:
(${taskCompletionRate}% × 0.6) + (${timeUtilization}% × 0.4) = ${efficiency}%`}
          >
            {efficiency}%
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Efficacité
          </div>
        </div>
        
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {completedTasks}/{totalTasks}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tâches</div>
        </div>
        
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Progression</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`mb-4 p-2 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Progression des tâches
          </span>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {completedTasks}/{totalTasks}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onOpenTasks(employee)}
        className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <ListChecks className="w-4 h-4" />
        <span>Gérer les Tâches ({totalTasks})</span>
      </button>
    </div>
  );
};

// Calculate employee efficiency - Original Simple Formula
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

// Main Component
export const OperatorEfficiencyForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [employees, setEmployees] = useState([]);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 85);
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 87);
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (existingData?.employees) {
      setEmployees(existingData.employees);
    }
  }, [existingData]);

  const addEmployee = (name = '') => {
    const newEmployee = {
      id: Date.now(),
      name: name,
      workHours: 8,
      tasks: [], // NO PREFILLED TASKS
      efficiency: 0,
      notes: ''
    };
    setEmployees([...employees, newEmployee]);
  };

  const addQuickEmployee = (defaultName) => {
    const exists = employees.some(emp => emp.name.toLowerCase() === defaultName.toLowerCase());
    if (exists) return;
    addEmployee(defaultName);
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };
        return updated;
      }
      return emp;
    }));
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const openTaskModal = (employee) => {
    setSelectedEmployee(employee);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedEmployee(null);
  };

  const calculateTeamEfficiency = () => {
    if (employees.length === 0) return 0;
    const validEmployees = employees.filter(emp => emp.name.trim());
    if (validEmployees.length === 0) return 0;
    const total = validEmployees.reduce((sum, emp) => sum + calculateEmployeeEfficiency(emp), 0);
    return Math.round(total / validEmployees.length);
  };

  const handleSubmit = () => {
    const processedEmployees = employees.filter(emp => emp.name.trim()).map(emp => ({
      ...emp,
      efficiency: calculateEmployeeEfficiency(emp)
    }));
    
    const efficiencyData = {
      value: calculateTeamEfficiency(),
      date: selectedDate,
      employees: processedEmployees,
      weeklyTarget,
      monthlyTarget,
      type: 'efficiency'
    };
    
    onSave('team', 'operator_efficiency', efficiencyData, '');
  };

  const teamEfficiency = calculateTeamEfficiency();
  const unusedEmployees = DEFAULT_EMPLOYEES.filter(name => 
    !employees.some(emp => emp.name.toLowerCase() === name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Efficacité Opérationnelle
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Suivi moderne des performances et tâches
                </p>
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  teamEfficiency >= weeklyTarget ? 'text-green-500' : 'text-red-500'
                }`}>
                  {teamEfficiency}%
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Équipe
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {employees.filter(emp => emp.name.trim()).length}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Opérateurs
                </div>
              </div>
              
              <button onClick={onCancel} className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-900 hover:text-slate-800'
              }`}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-160px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Quick Settings */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Objectif Hebdo (%)
                </label>
                <input
                  type="number"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Objectif Mensuel (%)
                </label>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Employees Grid */}
            {employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {employees.map(employee => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onUpdate={updateEmployee}
                    onDelete={removeEmployee}
                    onOpenTasks={openTaskModal}
                    weeklyTarget={weeklyTarget}
                    isDark={isDark}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">Aucun opérateur ajouté</h4>
                <p className="mb-6">Commencez par ajouter des opérateurs à votre équipe</p>
                <button
                  onClick={() => addEmployee()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700"
                >
                  Ajouter un Opérateur
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={`w-80 border-l overflow-y-auto ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="p-6 space-y-6">
              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Gestion Rapide
              </h4>

              {/* Quick Add */}
              <div className="space-y-3">
                <button
                  onClick={() => addEmployee()}
                  className="w-full p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nouvel Opérateur</span>
                </button>

                {unusedEmployees.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Équipe Prédéfinie:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {unusedEmployees.map(name => (
                        <button
                          key={name}
                          onClick={() => addQuickEmployee(name)}
                          className={`p-2 text-sm rounded-lg transition-colors ${
                            isDark 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          + {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Team Overview */}
              {employees.length > 0 && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  <h5 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Aperçu de l'Équipe
                  </h5>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Opérateurs:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{employees.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Efficacité moy:</span>
                      <span className={`font-semibold ${
                        teamEfficiency >= weeklyTarget ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {teamEfficiency}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tâches totales:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                        {employees.reduce((sum, emp) => sum + emp.tasks.length, 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Terminées:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                        {employees.reduce((sum, emp) => sum + emp.tasks.filter(t => t.completed).length, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Simple KPI Info */}
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
                <h5 className={`text-sm font-semibold mb-2 flex items-center ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  <Award className="w-4 h-4 mr-2" />
                  Formule KPI
                </h5>
                <div className={`text-xs space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div>• Completion: 60%</div>
                  <div>• Utilisation temps: 40%</div>
                  <div>• Simple et équitable</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {employees.filter(emp => emp.name.trim()).length} opérateur(s) • Efficacité globale: {teamEfficiency}%
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={employees.filter(emp => emp.name.trim()).length === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  employees.filter(emp => emp.name.trim()).length === 0
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                }`}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        employee={selectedEmployee}
        onUpdateEmployee={updateEmployee}
        isDark={isDark}
      />
    </div>
  );
};