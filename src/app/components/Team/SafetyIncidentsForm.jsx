import React, { useState } from 'react';
import { Shield, AlertTriangle, UserRound, Calendar, Target, Save, X, UserPlus, Trash2, FilePlus } from 'lucide-react';

// Hardcoded French labels and text
const fr = {
  safetyManagement: "Gestion de la Sécurité",
  incidentManagementSub: "Enregistrer et suivre les incidents de sécurité",
  selectDate: "Sélectionner la date",
  weeklyIncidentLimit: "Limite d'incidents hebdo.",
  monthlyIncidentLimit: "Limite d'incidents mens.",
  safetyAlertHigh: "Alerte Sécurité Élevée",
  safetyAlertLow: "Niveau d'incidents Contrôlé",
  incidentCount: "Nb Incidents",
  weeklyTarget: "Cible Hebdo.",
  totalIncidentsToday: "Total Incidents (Jour)",
  employees: "Employés Concernés",
  addEmployee: "Ajouter un employé",
  employeeName: "Nom de l'employé",
  employeeNamePlaceholder: "Saisir le nom de l'employé",
  incidentReports: "Rapports d'Incidents",
  addIncidentReport: "Ajouter Rapport",
  incidentType: "Type d'incident",
  incidentSeverity: "Gravité",
  selectTime: "Heure",
  enterDescription: "Description (actions, causes, etc.)",
  notes: "Remarques Générales",
  addNotesPlaceholder: "Ajouter des remarques sur l'employé...",
  cancel: "Annuler",
  save: "Enregistrer",
  errorSelectEmployee: "Veuillez ajouter au moins un employé.",
  errorFieldRequired: "Ce champ est requis.",
  errorIncidentCountInvalid: "Le nombre d'incidents ne peut être négatif.",
  noEmployeesAdded: "Aucun employé pour le moment",
  noEmployeesSubtext: "Ajoutez des employés pour signaler les incidents les concernant.",
  addFirstEmployee: "Ajouter le premier employé",
  incidentDetails: "Détails de l'incident",
  incidentsUnit: "incidents",
  noIncidentsReported: "Aucun incident signalé pour cet employé.",
};

export const SafetyIncidentsForm = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [employees, setEmployees] = useState(existingData?.employees || []);
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 0); // 0 incidents is ideal
  const [monthlyTarget, setMonthlyTarget] = useState(existingData?.monthlyTarget || 2); // Example: max 2 per month
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const incidentTypes = [
    { value: 'slip_fall', label: 'Glissade/Chute' },
    { value: 'cut_injury', label: 'Coupure/Blessure' },
    { value: 'chemical_exposure', label: 'Exposition Chimique' },
    { value: 'equipment_malfunction', label: 'Dysfonctionnement Équipement' },
    { value: 'near_miss', label: 'Quasi-Accident' },
    { value: 'fire', label: 'Incendie' },
    { value: 'vehicle', label: 'Accident de Véhicule' },
    { value: 'violence', label: 'Violence/Agression' },
    { value: 'other', label: 'Autre' }
  ];

  const severityLevels = [
    { value: 'minor', label: 'Mineur' },
    { value: 'moderate', label: 'Modéré' },
    { value: 'major', label: 'Majeur' },
    { value: 'critical', label: 'Critique' }
  ];

  const addEmployee = () => {
    const newEmployee = {
      id: Date.now(),
      name: '',
      incidents: [],
      notes: ''
    };
    setEmployees([...employees, newEmployee]);
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const addIncident = (employeeId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const newIncident = {
          id: Date.now(),
          type: 'other',
          severity: 'minor',
          description: '',
          date: selectedDate, // Incident date is the form's selected date by default
          time: new Date().toTimeString().split(' ')[0].substring(0,5) // Default to current time HH:MM
        };
        return { ...emp, incidents: [...emp.incidents, newIncident] };
      }
      return emp;
    }));
  };

  const removeIncident = (employeeId, incidentId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, incidents: emp.incidents.filter(inc => inc.id !== incidentId) };
      }
      return emp;
    }));
  };

  const updateIncident = (employeeId, incidentId, field, value) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          incidents: emp.incidents.map(inc =>
            inc.id === incidentId ? { ...inc, [field]: value } : inc
          )
        };
      }
      return emp;
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (employees.length === 0) {
      newErrors.employees = fr.errorSelectEmployee;
    }
    employees.forEach((emp, index) => {
      if (!emp.name.trim()) {
        newErrors[`employee_${emp.id}_name`] = fr.errorFieldRequired;
      }
      emp.incidents.forEach((incident, incidentIndex) => {
        if (!incident.description.trim()) {
            newErrors[`incident_${emp.id}_${incident.id}_description`] = fr.errorFieldRequired;
        }
        if (!incident.time) {
            newErrors[`incident_${emp.id}_${incident.id}_time`] = fr.errorFieldRequired;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Calculate total incidents for the main KPI value
    const calculateTotalIncidents = () => {
      return employees.reduce((total, emp) => total + emp.incidents.length, 0);
    };

    // FIXED: Calculate incidentCount for each employee and create properly structured data object
    const processedEmployees = employees.filter(emp => emp.name.trim()).map(emp => ({
      ...emp,
      incidentCount: emp.incidents.length
    }));
    
    const safetyData = {
      value: calculateTotalIncidents(), // Main KPI value (number) for status calculations
      date: selectedDate,
      employees: processedEmployees,
      weeklyTarget,
      monthlyTarget,
      type: 'safety_incidents'
    };
    
    // FIXED: Pass the full data object as the third parameter
    onSave('team', 'safety_incidents', safetyData, '');
  };

  const calculateTotalIncidentsForDay = () => {
    return employees.reduce((total, emp) => total + emp.incidents.length, 0);
  };

  const totalDailyIncidents = calculateTotalIncidentsForDay();
  const isAlertHigh = totalDailyIncidents > weeklyTarget && weeklyTarget !== 0; // Alert if over target, unless target is 0 (meaning any incident is over)

  const inputBaseClasses = `w-full px-4 py-2.5 rounded-xl border shadow-sm transition-colors focus:ring-2 focus:outline-none text-sm`;
  const inputDarkClasses = `bg-slate-800 border-slate-700 text-white focus:border-red-500 focus:ring-red-500/20`;
  const inputLightClasses = `bg-white border-slate-300 text-slate-900 focus:border-red-500 focus:ring-red-500/30`;
  const getInputClasses = (hasError = false) => 
    `${inputBaseClasses} ${isDark ? inputDarkClasses : inputLightClasses} ${hasError ? (isDark ? 'border-red-500/70' : 'border-red-500') : ''}`;

  const labelClasses = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border-0 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        <div className={`px-8 py-5 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {fr.safetyManagement}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {fr.incidentManagementSub}
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

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]"> {/* Adjusted max-height */}
          <div className="p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{fr.selectDate}</span>
                  </div>
                </label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={getInputClasses()} />
              </div>
              
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span>{fr.weeklyIncidentLimit}</span>
                  </div>
                </label>
                <input type="number" min="0" value={weeklyTarget} onChange={(e) => setWeeklyTarget(Math.max(0, Number(e.target.value)))} className={getInputClasses()} />
              </div>
              
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span>{fr.monthlyIncidentLimit}</span>
                  </div>
                </label>
                <input type="number" min="0" value={monthlyTarget} onChange={(e) => setMonthlyTarget(Math.max(0, Number(e.target.value)))} className={getInputClasses()} />
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${
              isDark 
                ? isAlertHigh ? 'bg-red-900/20 border-red-700/30' : 'bg-green-900/20 border-green-700/30'
                : isAlertHigh ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAlertHigh ? 'bg-red-600' : 'bg-green-600'}`}>
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isDark 
                      ? isAlertHigh ? 'text-red-400' : 'text-green-400'
                      : isAlertHigh ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {isAlertHigh ? fr.safetyAlertHigh : fr.safetyAlertLow}
                  </span>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-bold ${
                      isAlertHigh 
                        ? isDark ? 'text-red-400' : 'text-red-600' 
                        : isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {totalDailyIncidents}
                    </span>
                     <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {fr.totalIncidentsToday} ( {fr.weeklyTarget}: {weeklyTarget} )
                     </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <UserRound className="w-5 h-5" />
                  <span>{fr.employees} ({employees.length})</span>
                </h4>
                <button
                  onClick={addEmployee}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{fr.addEmployee}</span>
                </button>
              </div>

              <div className="space-y-4">
                {employees.map((employee) => (
                  <div 
                    key={employee.id} 
                    className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      isDark 
                        ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 mr-4">
                            <label className={labelClasses}>{fr.employeeName}</label>
                            <input
                                type="text"
                                value={employee.name}
                                onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                                placeholder={fr.employeeNamePlaceholder}
                                className={getInputClasses(!!errors[`employee_${employee.id}_name`])}
                            />
                            {errors[`employee_${employee.id}_name`] && (
                                <span className="text-xs text-red-500 mt-1">{errors[`employee_${employee.id}_name`]}</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                             <div className="text-center">
                                <div className={`text-lg font-bold ${
                                employee.incidents.length > 0 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-green-400' : 'text-green-600')
                                }`}>
                                {employee.incidents.length}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {fr.incidentsUnit}
                                </div>
                            </div>
                            <button
                                onClick={() => addIncident(employee.id)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-medium hover:shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
                            >
                                <FilePlus className="w-3.5 h-3.5" />
                                <span>{fr.addIncidentReport}</span>
                            </button>
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
                    </div>
                    
                    {employee.incidents.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-dashed_custom_safe"> {/* Custom class for dashed border */}
                        <style jsx global>{`
                          .border-dashed_custom_safe {
                            border-color: ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.8)'};
                          }
                        `}</style>
                        <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {fr.incidentReports} ({employee.incidents.length})
                        </h5>
                        {employee.incidents.map((incident) => (
                          <div key={incident.id} className={`p-4 rounded-lg border ${
                            isDark ? 'bg-slate-700/40 border-slate-600/70' : 'bg-slate-50/70 border-slate-200'
                          }`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <label className={labelClasses}>{fr.incidentType}</label>
                                <select
                                  value={incident.type}
                                  onChange={(e) => updateIncident(employee.id, incident.id, 'type', e.target.value)}
                                  className={getInputClasses()}
                                >
                                  {incidentTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className={labelClasses}>{fr.incidentSeverity}</label>
                                <select
                                  value={incident.severity}
                                  onChange={(e) => updateIncident(employee.id, incident.id, 'severity', e.target.value)}
                                  className={getInputClasses()}
                                >
                                  {severityLevels.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className={labelClasses}>{fr.selectTime}</label>
                                <input
                                  type="time"
                                  value={incident.time}
                                  onChange={(e) => updateIncident(employee.id, incident.id, 'time', e.target.value)}
                                  className={getInputClasses(!!errors[`incident_${employee.id}_${incident.id}_time`])}
                                />
                                 {errors[`incident_${employee.id}_${incident.id}_time`] && (
                                    <span className="text-xs text-red-500 mt-1">{errors[`incident_${employee.id}_${incident.id}_time`]}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className={labelClasses}>{fr.enterDescription}</label>
                              <textarea
                                value={incident.description}
                                onChange={(e) => updateIncident(employee.id, incident.id, 'description', e.target.value)}
                                placeholder={fr.enterDescription}
                                rows="2"
                                className={`${getInputClasses(!!errors[`incident_${employee.id}_${incident.id}_description`])} resize-none`}
                              />
                              {errors[`incident_${employee.id}_${incident.id}_description`] && (
                                <span className="text-xs text-red-500 mt-1">{errors[`incident_${employee.id}_${incident.id}_description`]}</span>
                              )}
                            </div>
                            <div className="text-right mt-2">
                                <button
                                    onClick={() => removeIncident(employee.id, incident.id)}
                                    className={`p-1.5 rounded-md transition-colors text-xs ${
                                    isDark 
                                        ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                                        : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                    }`}
                                >
                                    <Trash2 className="w-3.5 h-3.5 inline-block mr-1" /> Supprimer ce rapport
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {employee.incidents.length === 0 && (
                        <p className={`text-sm text-center py-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {fr.noIncidentsReported}
                        </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-dashed_custom_safe">
                      <label className={labelClasses}>{fr.notes}</label>
                      <textarea
                        value={employee.notes}
                        onChange={(e) => updateEmployee(employee.id, 'notes', e.target.value)}
                        placeholder={fr.addNotesPlaceholder}
                        rows="2"
                        className={`${getInputClasses()} resize-none`}
                      />
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
                    <UserPlus className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                  </div>
                  <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {fr.noEmployeesAdded}
                  </h4>
                  <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {fr.noEmployeesSubtext}
                  </p>
                  <button
                    onClick={addEmployee}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    <span>{fr.addFirstEmployee}</span>
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
              {fr.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={employees.filter(emp => emp.name.trim()).length === 0}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 ${
                employees.filter(emp => emp.name.trim()).length === 0 
                  ? (isDark ? 'bg-slate-600' : 'bg-slate-400') + ' cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-md hover:from-red-600 hover:to-red-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>{fr.save}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};