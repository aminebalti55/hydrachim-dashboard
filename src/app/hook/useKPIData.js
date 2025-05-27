import { useState, useCallback, useMemo, useEffect } from 'react';
import { kpiDefinitions } from '../utils/kpiDefinitions';

// Enhanced custom hook for managing KPI data with team-specific features
export const useKPIData = () => {
  const [kpiData, setKpiData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on initialization
  useEffect(() => {
    const loadDataFromStorage = () => {
      try {
        console.log('Loading KPI data from localStorage...');
        const savedData = localStorage.getItem('hydrachim_kpi_data');
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('Loaded KPI data:', parsedData);
          setKpiData(parsedData);
        } else {
          console.log('No saved KPI data found, starting with empty state');
          setKpiData({});
        }
      } catch (error) {
        console.error('Error loading KPI data from localStorage:', error);
        setKpiData({});
      } finally {
        setIsInitialized(true);
      }
    };

    loadDataFromStorage();
  }, []);

  // Save data to localStorage whenever kpiData changes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      console.log('Saving KPI data to localStorage:', kpiData);
      localStorage.setItem('hydrachim_kpi_data', JSON.stringify(kpiData));
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.error('Error saving KPI data to localStorage:', error);
    }
  }, [kpiData, isInitialized]);

  // FIXED: Enhanced updateKPIValue to handle team-specific data structures properly
  const updateKPIValue = useCallback((departmentId, kpiId, dataObject, notes = '') => {
    console.log('Updating KPI:', { departmentId, kpiId, dataObject, notes });
    setIsLoading(true);
    
    // FIXED: Create a properly structured entry with the main value extracted
    const newEntry = {
      value: dataObject.value || 0, // Main KPI number value for calculations
      data: dataObject, // Full data object including employees, targets, etc.
      date: new Date().toISOString(),
      notes,
      id: Date.now()
    };

    setKpiData(prev => {
      const newData = { ...prev };
      
      if (!newData[departmentId]) {
        newData[departmentId] = {};
      }
      
      if (!newData[departmentId][kpiId]) {
        newData[departmentId][kpiId] = [];
      }
      
      // Add new entry at the beginning (most recent first)
      newData[departmentId][kpiId] = [newEntry, ...newData[departmentId][kpiId]];
      
      console.log('✅ Updated KPI data structure:', {
        departmentId,
        kpiId,
        latestEntry: newEntry,
        totalEntries: newData[departmentId][kpiId].length
      });
      return newData;
    });
    
    setIsLoading(false);
  }, []);

  // Get latest value for a specific KPI
  const getLatestKPIValue = useCallback((departmentId, kpiId) => {
    const kpiEntries = kpiData[departmentId]?.[kpiId];
    return kpiEntries && kpiEntries.length > 0 ? kpiEntries[0] : null;
  }, [kpiData]);

  // Get all entries for a specific KPI
  const getKPIHistory = useCallback((departmentId, kpiId) => {
    return kpiData[departmentId]?.[kpiId] || [];
  }, [kpiData]);

  // FIXED: Enhanced KPI status calculation for team KPIs with proper data structure
  const getKPIStatus = useCallback((departmentId, kpiId) => {
    const latestEntry = getLatestKPIValue(departmentId, kpiId);
    if (!latestEntry || !latestEntry.data) return 'no-data';

    const kpiDefinition = kpiDefinitions[departmentId]?.kpis.find(k => k.id === kpiId);
    if (!kpiDefinition) return 'no-data';

    // Handle team-specific KPI types
    if (kpiDefinition.trackingType === 'attendance') {
      return getAttendanceStatus(latestEntry, kpiDefinition);
    } else if (kpiDefinition.trackingType === 'safety') {
      return getSafetyStatus(latestEntry, kpiDefinition);
    } else if (kpiDefinition.trackingType === 'task-based') {
      return getEfficiencyStatus(latestEntry, kpiDefinition);
    }

    // Default status calculation using the main value
    const { value } = latestEntry;
    const { target } = kpiDefinition;

    if (typeof value === 'number') {
      const tolerance = target * 0.1;
      
      const lowerIsBetter = ['safety_incidents'];
      
      if (lowerIsBetter.includes(kpiId)) {
        if (value <= target) return 'excellent';
        if (value <= target + tolerance) return 'good';
        return 'needs-attention';
      } else {
        if (value >= target) return 'excellent';
        if (value >= target - tolerance) return 'good';
        return 'needs-attention';
      }
    }

    return 'good';
  }, [getLatestKPIValue]);

  // FIXED: Calculate attendance status using the correct data structure
  const getAttendanceStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.employees) return 'no-data';
    
    const { employees, weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target;
    const averageProductivity = entry.value; // Main KPI value
    
    if (averageProductivity >= target) return 'excellent';
    if (averageProductivity >= target * 0.9) return 'good';
    return 'needs-attention';
  };

  // FIXED: Calculate safety status using the correct data structure
  const getSafetyStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.employees) return 'no-data';
    
    const { weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target || 0;
    const totalIncidents = entry.value; // Main KPI value
    
    if (totalIncidents <= target) return 'excellent';
    if (totalIncidents <= target * 1.5) return 'good';
    return 'needs-attention';
  };

  // FIXED: Calculate efficiency status using the correct data structure
  const getEfficiencyStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.employees) return 'no-data';
    
    const { weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target;
    const averageEfficiency = entry.value; // Main KPI value
    
    if (averageEfficiency >= target) return 'excellent';
    if (averageEfficiency >= target * 0.9) return 'good';
    return 'needs-attention';
  };

  // FIXED: Get team-specific analytics with corrected data processing
  const getTeamAnalytics = useCallback((departmentId) => {
    const teamData = kpiData[departmentId] || {};
    const analytics = {
      attendance: [],
      safety: [],
      efficiency: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process each KPI type
    Object.keys(teamData).forEach(kpiId => {
      const kpiEntries = teamData[kpiId];
      const kpiDef = kpiDefinitions[departmentId]?.kpis.find(k => k.id === kpiId);
      
      if (!kpiDef) return;

      kpiEntries.forEach(entry => {
        const date = new Date(entry.date);
        const week = getWeekNumber(date);
        const month = date.getMonth();
        
        if (kpiDef.trackingType === 'attendance') {
          analytics.attendance.push({
            date: entry.date,
            week,
            month,
            employees: entry.data.employees || [],
            averageProductivity: entry.value,
            target: entry.data.weeklyTarget || kpiDef.target
          });
        } else if (kpiDef.trackingType === 'safety') {
          analytics.safety.push({
            date: entry.date,
            week,
            month,
            employees: entry.data.employees || [],
            totalIncidents: entry.value,
            target: entry.data.weeklyTarget || kpiDef.target
          });
        } else if (kpiDef.trackingType === 'task-based') {
          analytics.efficiency.push({
            date: entry.date,
            week,
            month,
            employees: entry.data.employees || [],
            averageEfficiency: entry.value,
            target: entry.data.weeklyTarget || kpiDef.target
          });
        }
      });
    });

    // Sort by date (most recent first)
    analytics.attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.safety.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.efficiency.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate weekly and monthly reports
    analytics.weeklyReports = generateWeeklyReports(analytics);
    analytics.monthlyReports = generateMonthlyReports(analytics);
    analytics.alerts = generateAlerts(analytics);

    return analytics;
  }, [kpiData]);

  // Helper functions for calculations
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const generateWeeklyReports = (analytics) => {
    const reports = [];
    const currentWeek = getWeekNumber(new Date());
    
    // Group data by week
    const weeklyData = {};
    
    ['attendance', 'safety', 'efficiency'].forEach(type => {
      analytics[type].forEach(entry => {
        if (!weeklyData[entry.week]) {
          weeklyData[entry.week] = { attendance: [], safety: [], efficiency: [] };
        }
        weeklyData[entry.week][type].push(entry);
      });
    });
    
    // Generate reports for each week
    Object.keys(weeklyData).forEach(week => {
      const weekData = weeklyData[week];
      const report = {
        week: parseInt(week),
        isCurrent: parseInt(week) === currentWeek,
        attendance: calculateWeeklyAttendance(weekData.attendance),
        safety: calculateWeeklySafety(weekData.safety),
        efficiency: calculateWeeklyEfficiency(weekData.efficiency),
        status: 'good'
      };
      
      // Determine overall week status
      const statuses = [report.attendance.status, report.safety.status, report.efficiency.status];
      if (statuses.includes('needs-attention')) report.status = 'needs-attention';
      else if (statuses.includes('good')) report.status = 'good';
      else report.status = 'excellent';
      
      reports.push(report);
    });
    
    return reports.sort((a, b) => b.week - a.week);
  };

  const generateMonthlyReports = (analytics) => {
    const reports = [];
    const currentMonth = new Date().getMonth();
    
    const monthlyData = {};
    
    ['attendance', 'safety', 'efficiency'].forEach(type => {
      analytics[type].forEach(entry => {
        if (!monthlyData[entry.month]) {
          monthlyData[entry.month] = { attendance: [], safety: [], efficiency: [] };
        }
        monthlyData[entry.month][type].push(entry);
      });
    });
    
    Object.keys(monthlyData).forEach(month => {
      const monthData = monthlyData[month];
      const report = {
        month: parseInt(month),
        isCurrent: parseInt(month) === currentMonth,
        attendance: calculateMonthlyAttendance(monthData.attendance),
        safety: calculateMonthlySafety(monthData.safety),
        efficiency: calculateMonthlyEfficiency(monthData.efficiency),
        status: 'good'
      };
      
      const statuses = [report.attendance.status, report.safety.status, report.efficiency.status];
      if (statuses.includes('needs-attention')) report.status = 'needs-attention';
      else if (statuses.includes('good')) report.status = 'good';
      else report.status = 'excellent';
      
      reports.push(report);
    });
    
    return reports.sort((a, b) => b.month - a.month);
  };

  const generateAlerts = (analytics) => {
    const alerts = [];
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    
    ['attendance', 'safety', 'efficiency'].forEach(type => {
      const currentWeekData = analytics[type].filter(entry => entry.week === currentWeek);
      
      currentWeekData.forEach(entry => {
        if (type === 'attendance' && entry.averageProductivity < entry.target * 0.9) {
          alerts.push({
            id: `attendance_${entry.date}`,
            type: 'attendance',
            severity: entry.averageProductivity < entry.target * 0.8 ? 'high' : 'medium',
            message: `Team attendance below target: ${entry.averageProductivity}% vs ${entry.target}%`,
            date: entry.date,
            kpiId: 'team_productivity_attendance'
          });
        }
        
        if (type === 'safety' && entry.totalIncidents > entry.target) {
          alerts.push({
            id: `safety_${entry.date}`,
            type: 'safety',
            severity: entry.totalIncidents > entry.target * 2 ? 'high' : 'medium',
            message: `Safety incidents exceeded target: ${entry.totalIncidents} vs ${entry.target}`,
            date: entry.date,
            kpiId: 'safety_incidents'
          });
        }
        
        if (type === 'efficiency' && entry.averageEfficiency < entry.target * 0.9) {
          alerts.push({
            id: `efficiency_${entry.date}`,
            type: 'efficiency',
            severity: entry.averageEfficiency < entry.target * 0.8 ? 'high' : 'medium',
            message: `Team efficiency below target: ${entry.averageEfficiency}% vs ${entry.target}%`,
            date: entry.date,
            kpiId: 'operator_efficiency'
          });
        }
      });
    });
    
    return alerts.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Weekly calculation helpers
  const calculateWeeklyAttendance = (data) => {
    if (!data.length) return { average: 0, target: 95, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.averageProductivity, 0);
    const average = Math.round(total / data.length);
    const target = data[0]?.target || 95;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.9 ? 'good' : 'needs-attention'
    };
  };

  const calculateWeeklySafety = (data) => {
    if (!data.length) return { total: 0, target: 0, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.totalIncidents, 0);
    const target = data[0]?.target || 0;
    
    return {
      total,
      target,
      status: total <= target ? 'excellent' : total <= target * 1.5 ? 'good' : 'needs-attention'
    };
  };

  const calculateWeeklyEfficiency = (data) => {
    if (!data.length) return { average: 0, target: 85, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.averageEfficiency, 0);
    const average = Math.round(total / data.length);
    const target = data[0]?.target || 85;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.9 ? 'good' : 'needs-attention'
    };
  };

  // Monthly calculation helpers
  const calculateMonthlyAttendance = (data) => {
    if (!data.length) return { average: 0, target: 95, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.averageProductivity, 0);
    const average = Math.round(total / data.length);
    const target = data[0]?.monthlyTarget || data[0]?.target || 95;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.95 ? 'good' : 'needs-attention'
    };
  };

  const calculateMonthlySafety = (data) => {
    if (!data.length) return { total: 0, target: 2, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.totalIncidents, 0);
    const target = data[0]?.monthlyTarget || 2;
    
    return {
      total,
      target,
      status: total <= target ? 'excellent' : total <= target * 1.5 ? 'good' : 'needs-attention'
    };
  };

  const calculateMonthlyEfficiency = (data) => {
    if (!data.length) return { average: 0, target: 87, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.averageEfficiency, 0);
    const average = Math.round(total / data.length);
    const target = data[0]?.monthlyTarget || data[0]?.target || 87;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.95 ? 'good' : 'needs-attention'
    };
  };

  // FIXED: Enhanced department summary with stable function reference
  const getDepartmentSummary = useCallback((departmentId) => {
    const department = kpiDefinitions[departmentId];
    if (!department) {
      console.log('Department not found:', departmentId);
      return null;
    }

    console.log('Getting department summary for:', departmentId);
    console.log('Available KPI data:', kpiData[departmentId]);

    const kpis = department.kpis.map(kpi => {
      const latestValue = getLatestKPIValue(departmentId, kpi.id);
      const status = getKPIStatus(departmentId, kpi.id);
      const history = getKPIHistory(departmentId, kpi.id);
      
      console.log(`KPI ${kpi.id}:`, {
        hasLatestValue: !!latestValue,
        latestValueStructure: latestValue ? Object.keys(latestValue) : 'none',
        employeesCount: latestValue?.data?.employees?.length || 0,
        status,
        historyLength: history.length
      });
      
      return {
        ...kpi,
        latestValue,
        status,
        historyCount: history.length
      };
    });

    // Calculate department efficiency
    const kpisWithData = kpis.filter(kpi => kpi.latestValue);
    let efficiency = 0;
    
    if (kpisWithData.length > 0) {
      const excellentCount = kpisWithData.filter(kpi => kpi.status === 'excellent').length;
      const goodCount = kpisWithData.filter(kpi => kpi.status === 'good').length;
      const fairCount = kpisWithData.filter(kpi => kpi.status === 'fair').length;
      
      const totalScore = (excellentCount * 100) + (goodCount * 80) + (fairCount * 60) + 
                        ((kpisWithData.length - excellentCount - goodCount - fairCount) * 30);
      
      efficiency = Math.round(totalScore / (kpisWithData.length * 100) * 100);
    }

    return {
      ...department,
      kpis,
      efficiency,
      analytics: departmentId === 'team' ? getTeamAnalytics(departmentId) : null
    };
  }, [kpiData, getLatestKPIValue, getKPIStatus, getKPIHistory, getTeamAnalytics]);

  // Get overall dashboard summary
  const getDashboardSummary = useMemo(() => {
    const allDepartments = Object.keys(kpiDefinitions);
    
    let totalKPIs = 0;
    let kpisWithData = 0;
    let excellentKPIs = 0;
    let needsAttentionKPIs = 0;
    
    const departmentSummaries = allDepartments.map(deptId => {
      const dept = getDepartmentSummary(deptId);
      if (!dept) return null;
      
      let deptExcellent = 0;
      let deptGood = 0;
      let deptNeedsAttention = 0;
      let deptWithData = 0;
      
      dept.kpis.forEach(kpi => {
        totalKPIs++;
        if (kpi.latestValue) {
          kpisWithData++;
          deptWithData++;
          
          if (kpi.status === 'excellent') {
            excellentKPIs++;
            deptExcellent++;
          } else if (kpi.status === 'good') {
            deptGood++;
          } else if (kpi.status === 'needs-attention') {
            needsAttentionKPIs++;
            deptNeedsAttention++;
          }
        }
      });
      
      const efficiency = dept.efficiency;
      
      return {
        ...dept,
        efficiency,
        status: deptNeedsAttention > 0 ? 'needs-attention' : 
                deptGood > 0 ? 'good' : 
                deptExcellent > 0 ? 'excellent' : 'no-data',
        kpisWithData: deptWithData
      };
    }).filter(Boolean);
    
    const departmentsWithData = departmentSummaries.filter(dept => dept.kpisWithData > 0);
    const overallEfficiency = departmentsWithData.length > 0
      ? Math.round(departmentsWithData.reduce((sum, dept) => sum + dept.efficiency, 0) / departmentsWithData.length)
      : 0;
    
    return {
      totalKPIs,
      kpisWithData,
      dataCompleteness: totalKPIs > 0 ? Math.round((kpisWithData / totalKPIs) * 100) : 0,
      excellentKPIs,
      needsAttentionKPIs,
      overallEfficiency,
      departments: departmentSummaries
    };
  }, [kpiData, getDepartmentSummary]);

  // Delete KPI entry
  const deleteKPIEntry = useCallback((departmentId, kpiId, entryId) => {
    setKpiData(prev => {
      const newData = { ...prev };
      if (newData[departmentId] && newData[departmentId][kpiId]) {
        newData[departmentId][kpiId] = newData[departmentId][kpiId].filter(
          entry => entry.id !== entryId
        );
      }
      return newData;
    });
  }, []);

  // Get trending data for charts
  const getKPITrend = useCallback((departmentId, kpiId, limit = 10) => {
    const history = getKPIHistory(departmentId, kpiId);
    return history
      .slice(0, limit)
      .reverse()
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        value: entry.value,
        notes: entry.notes
      }));
  }, [getKPIHistory]);

  // Clear all data
  const clearAllData = useCallback(() => {
    console.log('Clearing all KPI data');
    setKpiData({});
    localStorage.removeItem('hydrachim_kpi_data');
  }, []);

  // Force save current data to localStorage
  const forceSave = useCallback(() => {
    try {
      localStorage.setItem('hydrachim_kpi_data', JSON.stringify(kpiData));
      console.log('Force saved KPI data to localStorage');
    } catch (error) {
      console.error('Error force saving KPI data:', error);
    }
  }, [kpiData]);

  // Debug function to check localStorage
  const debugLocalStorage = useCallback(() => {
    const savedData = localStorage.getItem('hydrachim_kpi_data');
    console.log('Current localStorage data:', savedData);
    console.log('Current state data:', kpiData);
    console.log('Is initialized:', isInitialized);
  }, [kpiData, isInitialized]);

  return {
    // Data
    kpiData,
    
    // Loading state
    isLoading,
    isInitialized,
    
    // Core functions
    updateKPIValue,
    getLatestKPIValue,
    getKPIHistory,
    getKPIStatus,
    
    // Summary functions
    getDepartmentSummary,
    getDashboardSummary,
    
    // Team-specific functions
    getTeamAnalytics,
    
    // Utility functions
    deleteKPIEntry,
    getKPITrend,
    clearAllData,
    forceSave,
    debugLocalStorage
  };
};