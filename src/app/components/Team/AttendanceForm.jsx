import { useState } from 'react';
import { Clock, UserPlus, Calendar, Target, Save, X, Trash2, UserRound, ClipboardCheck } from 'lucide-react';

export default function AttendanceForm({ onSave, onCancel, existingData = null, isDark = false }) {
  const [employees, setEmployees] = useState(existingData?.employees || []);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 95);
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 95);
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const addEmployee = () => {
    const newEmployee = {
      id: Date.now(),
      name: '',
      clockIn: '',
      clockOut: '',
      workHours: 0,
      productivity: 0,
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
        
        if (field === 'clockIn' || field === 'clockOut') {
          if (updated.clockIn && updated.clockOut) {
            const clockInTime = new Date(`${selectedDate}T${updated.clockIn}`);
            const clockOutTime = new Date(`${selectedDate}T${updated.clockOut}`);
            
            if (clockOutTime > clockInTime) {
              const workHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
              updated.workHours = Math.round(workHours * 100) / 100;
              
              const expectedHours = 8; // Supposons 8 heures de travail prévues
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

  const validateForm = () => {
    const newErrors = {};
    
    if (employees.length === 0) {
      newErrors.employees = "Veuillez ajouter au moins un employé.";
    }
    
    employees.forEach((emp, index) => {
      if (!emp.name.trim()) {
        newErrors[`employee_${index}_name`] = "Ce champ est requis.";
      }
      
      if (emp.clockIn && emp.clockOut) {
        const clockInTime = new Date(`${selectedDate}T${emp.clockIn}`);
        const clockOutTime = new Date(`${selectedDate}T${emp.clockOut}`);
        
        if (clockOutTime <= clockInTime) {
          newErrors[`employee_${index}_time`] = "L'heure de départ doit être ultérieure à l'heure d'arrivée.";
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Calculate team average for the main KPI value
    const calculateTeamAverage = () => {
      if (employees.length === 0) return 0;
      const validEmployees = employees.filter(emp => emp.productivity > 0 && emp.name.trim());
      if (validEmployees.length === 0) return 0;
      
      const total = validEmployees.reduce((sum, emp) => sum + emp.productivity, 0);
      return Math.round(total / validEmployees.length);
    };

    // FIXED: Create properly structured data object
    const attendanceData = {
      value: calculateTeamAverage(), // Main KPI value (number) for status calculations
      date: selectedDate,
      employees: employees.filter(emp => emp.name.trim()),
      weeklyTarget,
      monthlyTarget,
      type: 'attendance'
    };
    
    // FIXED: Pass the full data object as the third parameter
    onSave('team', 'team_productivity_attendance', attendanceData, '');
  };

  const calculateTeamAverage = () => {
    if (employees.length === 0) return 0;
    const validEmployees = employees.filter(emp => emp.productivity > 0 && emp.name.trim());
    if (validEmployees.length === 0) return 0;
    
    const total = validEmployees.reduce((sum, emp) => sum + emp.productivity, 0);
    return Math.round(total / validEmployees.length);
  };

  const teamAverage = calculateTeamAverage();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border-0 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-5 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Suivi des Présences
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Ajouter un enregistrement de présence
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
            
            {/* Date and Targets */}
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
                  className={`w-full px-4 py-3 rounded-xl border shadow-sm transition-colors focus:ring-2 focus:outline-none ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
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
                  className={`w-full px-4 py-3 rounded-xl border shadow-sm transition-colors focus:ring-2 focus:outline-none ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
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
                  className={`w-full px-4 py-3 rounded-xl border shadow-sm transition-colors focus:ring-2 focus:outline-none ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                />
              </div>
            </div>

            {/* Team Average Display */}
            {employees.filter(emp => emp.name.trim()).length > 0 && (
              <div className={`p-5 rounded-xl border ${
                isDark 
                  ? teamAverage >= weeklyTarget 
                    ? 'bg-green-900/20 border-green-700/30' 
                    : 'bg-red-900/20 border-red-700/30'
                  : teamAverage >= weeklyTarget 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      teamAverage >= weeklyTarget 
                        ? 'bg-green-600' 
                        : 'bg-red-600'
                    }`}>
                      <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${
                      isDark 
                        ? teamAverage >= weeklyTarget ? 'text-green-400' : 'text-red-400'
                        : teamAverage >= weeklyTarget ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Performance Globale de l'Équipe
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${
                      teamAverage >= weeklyTarget 
                        ? isDark ? 'text-green-400' : 'text-green-600' 
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {teamAverage}%
                    </span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      teamAverage >= weeklyTarget 
                        ? isDark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {teamAverage >= weeklyTarget ? 'Objectif Atteint' : 'Objectif Manqué'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employee List */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <UserRound className="w-5 h-5" />
                  <span>Employés ({employees.length})</span>
                </h4>
                <button
                  onClick={addEmployee}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter un employé</span>
                </button>
              </div>

              <div className="space-y-4">
                {employees.map((employee, index) => (
                  <div 
                    key={employee.id} 
                    className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      isDark 
                        ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Employee Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <UserRound className="w-4 h-4" />
                          </div>
                          <h5 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {employee.name || 'Nouvel employé'}
                          </h5>
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
                      
                      {/* Employee Info */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Nom de l'employé
                          </label>
                          <input
                            type="text"
                            value={employee.name}
                            onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                            placeholder="Saisir le nom de l'employé"
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
                              isDark 
                                ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                            } ${errors[`employee_${index}_name`] ? isDark ? 'border-red-500/70' : 'border-red-500' : ''}`}
                          />
                          {errors[`employee_${index}_name`] && (
                            <span className="text-xs text-red-500 mt-1">{errors[`employee_${index}_name`]}</span>
                          )}
                        </div>

                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Heure d'arrivée
                          </label>
                          <input
                            type="time"
                            value={employee.clockIn}
                            onChange={(e) => updateEmployee(employee.id, 'clockIn', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
                              isDark 
                                ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Heure de départ
                          </label>
                          <input
                            type="time"
                            value={employee.clockOut}
                            onChange={(e) => updateEmployee(employee.id, 'clockOut', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
                              isDark 
                                ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                            }`}
                          />
                          {errors[`employee_${index}_time`] && (
                            <span className="text-xs text-red-500 mt-1">{errors[`employee_${index}_time`]}</span>
                          )}
                        </div>

                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Productivité
                          </label>
                          <div className={`w-full px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700' 
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            <span className={`font-medium ${
                              !employee.productivity ? (isDark ? 'text-slate-500' : 'text-slate-400') :
                              employee.productivity >= weeklyTarget 
                                ? (isDark ? 'text-green-400' : 'text-green-600') 
                                : (isDark ? 'text-red-400' : 'text-red-600')
                            }`}>
                              {employee.productivity ? `${employee.productivity}%` : '--'}
                            </span>
                            
                            {employee.workHours > 0 && (
                              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {employee.workHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-2">
                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Remarques
                        </label>
                        <textarea
                          value={employee.notes}
                          onChange={(e) => updateEmployee(employee.id, 'notes', e.target.value)}
                          placeholder="Ajoutez ici toutes les remarques pertinentes..."
                          rows="2"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm resize-none transition-colors focus:ring-2 focus:outline-none ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500/30'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {employees.length === 0 && (
                <div className={`p-8 rounded-xl border text-center ${
                  isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className={`w-16 h-16 rounded-full ${
                    isDark ? 'bg-slate-700/80' : 'bg-white'
                  } flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    <UserPlus className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                  </div>
                  <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Aucun employé ajouté pour le moment
                  </h4>
                  <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ajoutez des employés pour suivre leur présence et leur productivité
                  </p>
                  <button
                    onClick={addEmployee}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    <span>Ajouter le premier employé</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md hover:from-blue-600 hover:to-blue-700'
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
}