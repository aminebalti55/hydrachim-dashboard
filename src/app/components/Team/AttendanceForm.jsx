import { useState, useEffect } from 'react';
import { 
  Clock, UserPlus, Calendar, Target, Save, X, Trash2, UserRound, 
  ClipboardCheck, Users, Edit3, Check, Search, Filter, MoreHorizontal, 
  Copy, AlertCircle, Timer, Activity, TrendingUp, Award
} from 'lucide-react';

// Default team members
const DEFAULT_EMPLOYEES = [
  { name: 'Rihem', defaultClockIn: '08:00', defaultClockOut: '17:00' },
  { name: 'Hamza', defaultClockIn: '08:00', defaultClockOut: '17:00' },
  { name: 'Mohamed', defaultClockIn: '08:00', defaultClockOut: '17:00' },
  { name: 'Nassim', defaultClockIn: '08:00', defaultClockOut: '17:00' },
  { name: 'Tarek', defaultClockIn: '08:00', defaultClockOut: '17:00' },
  { name: 'Youssef', defaultClockIn: '08:00', defaultClockOut: '17:00' }
];

// Employee Card Component
const EmployeeCard = ({ employee, onUpdate, onDelete, weeklyTarget, isDark, selectedDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Calculate work hours and productivity
  const calculateWorkMetrics = () => {
    if (!employee.clockIn || !employee.clockOut) return { workHours: 0, productivity: 0 };
    
    const clockInTime = new Date(`${selectedDate}T${employee.clockIn}`);
    const clockOutTime = new Date(`${selectedDate}T${employee.clockOut}`);
    
    if (clockOutTime <= clockInTime) return { workHours: 0, productivity: 0 };
    
    const workHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    const expectedHours = 9;
    const productivity = Math.min(100, Math.round((workHours / expectedHours) * 100));
    
    return { 
      workHours: Math.round(workHours * 100) / 100, 
      productivity 
    };
  };

  const { workHours, productivity } = calculateWorkMetrics();
  
  // Status indicators
  const isPresent = workHours > 0;
  const isOnTime = employee.clockIn <= '08:00' && workHours >= 8;
  const isHighPerformer = productivity >= weeklyTarget;

  return (
    <div className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-lg group min-w-0 ${
      isDark 
        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2 min-w-0">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            isHighPerformer
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
              placeholder="Nom employé"
              className={`text-sm font-semibold bg-transparent border-none p-0 w-full min-w-0 ${
                isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              } focus:outline-none truncate`}
            />
            <div className="mt-1 min-w-0">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="min-w-0">
                  <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mb-0.5`}>In</span>
                  <input
                    type="time"
                    value={employee.clockIn}
                    onChange={(e) => onUpdate(employee.id, 'clockIn', e.target.value)}
                    className={`w-full text-xs bg-transparent border border-slate-300 rounded px-1 py-0.5 min-w-0 ${
                      isDark ? 'text-slate-300 border-slate-600' : 'text-slate-900 border-slate-300'
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div className="min-w-0">
                  <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mb-0.5`}>Out</span>
                  <input
                    type="time"
                    value={employee.clockOut}
                    onChange={(e) => onUpdate(employee.id, 'clockOut', e.target.value)}
                    className={`w-full text-xs bg-transparent border border-slate-300 rounded px-1 py-0.5 min-w-0 ${
                      isDark ? 'text-slate-300 border-slate-600' : 'text-slate-900 border-slate-300'
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
              </div>
              <div className={`text-center text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'} truncate`}>
                {workHours}h
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(employee.id)}
          className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${
            isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
          }`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div 
            className={`text-lg font-bold cursor-help ${
              productivity >= weeklyTarget ? 'text-green-500' : 'text-red-500'
            }`}
            title={`Formule Productivité:

Productivité = (Heures Travaillées / Heures Attendues) × 100

Détail du calcul:
• Heures Travaillées: ${workHours}h
• Heures Attendues: 9h
• Calcul: (${workHours} / 9) × 100 = ${productivity}%

Note: La productivité est plafonnée à 100%
Les heures sont calculées entre l'heure d'arrivée et de départ.`}
          >
            {productivity}%
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>
            Productivité
          </div>
        </div>
        
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {workHours}h
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>Travaillées</div>
        </div>
        
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className={`text-lg font-bold ${
            isPresent ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPresent ? '✓' : '✗'}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>Présence</div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`mb-2 p-1.5 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'} truncate`}>
            Statut
          </span>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {isPresent && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                Présent
              </span>
            )}
          </div>
        </div>
        <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div 
            className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${Math.min(100, (workHours / 9) * 100)}%` }}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Remarques
        </label>
        <textarea
          value={employee.notes || ''}
          onChange={(e) => onUpdate(employee.id, 'notes', e.target.value)}
          placeholder="Notes..."
          rows="1"
          className={`w-full px-2 py-1 text-xs rounded-lg border resize-none min-w-0 ${
            isDark 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
          } focus:outline-none focus:border-blue-500`}
        />
      </div>
    </div>
  );
};

export default function AttendanceForm({ onSave, onCancel, existingData = null, isDark = false }) {
  const [employees, setEmployees] = useState([]);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 95);
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 95);
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);

  // Initialize with default employees if no existing data
  useEffect(() => {
    if (existingData?.employees) {
      setEmployees(existingData.employees);
    }
  }, [existingData]);

  const addEmployee = (name = '') => {
    const newEmployee = {
      id: Date.now(),
      name: name,
      clockIn: '08:00',
      clockOut: '17:00',
      workHours: 9,
      productivity: 100,
      notes: ''
    };
    setEmployees([...employees, newEmployee]);
  };

  const addQuickEmployee = (defaultEmp) => {
    const exists = employees.some(emp => emp.name.toLowerCase() === defaultEmp.name.toLowerCase());
    if (exists) return;
    
    const newEmployee = {
      id: Date.now(),
      name: defaultEmp.name,
      clockIn: defaultEmp.defaultClockIn,
      clockOut: defaultEmp.defaultClockOut,
      workHours: 9,
      productivity: 100,
      notes: ''
    };
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };
        
        // Recalculate work hours and productivity when clock times change
        if (field === 'clockIn' || field === 'clockOut') {
          if (updated.clockIn && updated.clockOut) {
            const clockInTime = new Date(`${selectedDate}T${updated.clockIn}`);
            const clockOutTime = new Date(`${selectedDate}T${updated.clockOut}`);
            
            if (clockOutTime > clockInTime) {
              const workHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
              updated.workHours = Math.round(workHours * 100) / 100;
              
              const expectedHours = 9;
              updated.productivity = Math.min(100, Math.round((workHours / expectedHours) * 100));
            } else {
              updated.workHours = 0;
              updated.productivity = 0;
            }
          } else {
            updated.workHours = 0;
            updated.productivity = 0;
          }
        }
        
        return updated;
      }
      return emp;
    }));
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const calculateTeamAverage = () => {
    if (employees.length === 0) return 0;
    const validEmployees = employees.filter(emp => emp.name.trim());
    if (validEmployees.length === 0) return 0;
    
    // Calculate productivity for each employee
    const productivities = validEmployees.map(emp => {
      if (!emp.clockIn || !emp.clockOut) return 0;
      
      const clockInTime = new Date(`${selectedDate}T${emp.clockIn}`);
      const clockOutTime = new Date(`${selectedDate}T${emp.clockOut}`);
      
      if (clockOutTime <= clockInTime) return 0;
      
      const workHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      const expectedHours = 9;
      return Math.min(100, Math.round((workHours / expectedHours) * 100));
    });
    
    const total = productivities.reduce((sum, prod) => sum + prod, 0);
    return Math.round(total / productivities.length);
  };

  const handleSubmit = () => {
    const processedEmployees = employees.filter(emp => emp.name.trim()).map(emp => {
      // Ensure productivity is calculated
      if (!emp.clockIn || !emp.clockOut) {
        return { ...emp, workHours: 0, productivity: 0 };
      }
      
      const clockInTime = new Date(`${selectedDate}T${emp.clockIn}`);
      const clockOutTime = new Date(`${selectedDate}T${emp.clockOut}`);
      
      if (clockOutTime <= clockInTime) {
        return { ...emp, workHours: 0, productivity: 0 };
      }
      
      const workHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      const expectedHours = 9;
      const productivity = Math.min(100, Math.round((workHours / expectedHours) * 100));
      
      return {
        ...emp,
        workHours: Math.round(workHours * 100) / 100,
        productivity
      };
    });
    
    const attendanceData = {
      value: calculateTeamAverage(),
      date: selectedDate,
      employees: processedEmployees,
      weeklyTarget,
      monthlyTarget,
      type: 'attendance'
    };
    
    onSave('team', 'team_productivity_attendance', attendanceData, '');
  };

  const getStats = () => {
    const total = employees.filter(emp => emp.name.trim()).length;
    let present = 0;
    let onTime = 0;
    let highPerformance = 0;
    
    employees.forEach(emp => {
      if (!emp.clockIn || !emp.clockOut || !emp.name.trim()) return;
      
      const clockInTime = new Date(`${selectedDate}T${emp.clockIn}`);
      const clockOutTime = new Date(`${selectedDate}T${emp.clockOut}`);
      
      if (clockOutTime > clockInTime) {
        const workHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
        const productivity = Math.min(100, Math.round((workHours / 9) * 100));
        
        if (workHours > 0) present++;
        if (emp.clockIn <= '08:00' && workHours >= 8) onTime++;
        if (productivity >= weeklyTarget) highPerformance++;
      }
    });
    
    return {
      total,
      present,
      onTime,
      highPerformance,
      presentRate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  };

  const teamAverage = calculateTeamAverage();
  const stats = getStats();
  const unusedEmployees = DEFAULT_EMPLOYEES.filter(defaultEmp => 
    !employees.some(emp => emp.name.toLowerCase() === defaultEmp.name.toLowerCase())
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Présence & Productivité
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Suivi moderne des horaires et performance équipe
                </p>
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  teamAverage >= weeklyTarget ? 'text-green-500' : 'text-red-500'
                }`}>
                  {teamAverage}%
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Productivité
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {stats.present}/{stats.total}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Présents
                </div>
              </div>
              
              <button onClick={onCancel} className={`p-2 rounded-lg transition-colors ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0">
                {employees.map(employee => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onUpdate={updateEmployee}
                    onDelete={removeEmployee}
                    weeklyTarget={weeklyTarget}
                    isDark={isDark}
                    selectedDate={selectedDate}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">Aucun employé ajouté</h4>
                <p className="mb-6">Commencez par ajouter des employés à votre équipe</p>
                <button
                  onClick={() => addEmployee()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
                >
                  Ajouter un Employé
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={`w-80 border-l ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="p-4 space-y-4">
              <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Gestion Rapide
              </h4>

              {/* Quick Add */}
              <div className="space-y-2">
                <button
                  onClick={() => addEmployee()}
                  className="w-full p-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nouvel Employé</span>
                </button>

                {unusedEmployees.length > 0 && (
                  <div>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Équipe Prédéfinie:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {unusedEmployees.map(emp => (
                        <button
                          key={emp.name}
                          onClick={() => addQuickEmployee(emp)}
                          className={`p-1.5 text-xs rounded-lg transition-colors ${
                            isDark 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          + {emp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Team Overview */}
              {employees.length > 0 && (
                <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  <h5 className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Aperçu de l'Équipe
                  </h5>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Employés:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{stats.total}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Présents:</span>
                      <span className={`font-semibold ${stats.presentRate >= 90 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.present}/{stats.total}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>À l'heure:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{stats.onTime}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Performants:</span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{stats.highPerformance}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Productivité moy:</span>
                      <span className={`font-semibold ${
                        teamAverage >= weeklyTarget ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {teamAverage}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* KPI Info */}
              <div className={`p-2 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
                <h5 className={`text-xs font-medium mb-1 flex items-center ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  <Award className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Formule</span>
                </h5>
                <div className={`text-xs leading-tight ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="truncate">• Heures / 9h</div>
                  <div className="truncate">• Auto calculé</div>
                  <div className="truncate">• Max 100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Productivité Équipe: <span className={`text-lg font-bold ${
                teamAverage >= weeklyTarget ? 'text-green-600' : 'text-red-600'
              }`}>
                {teamAverage}%
              </span> • {stats.present}/{stats.total} présent(s) • Objectif: ≥{weeklyTarget}%
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
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}