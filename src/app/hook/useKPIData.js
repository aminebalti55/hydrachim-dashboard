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

  // Enhanced updateKPIValue to handle team-specific data structures properly
  const updateKPIValue = useCallback((departmentId, kpiId, dataObject, notes = '') => {
    console.log('Updating KPI:', { departmentId, kpiId, dataObject, notes });
    setIsLoading(true);
    
    // Create a properly structured entry with the main value extracted
    const newEntry = {
      value: dataObject.value || 0, // Main KPI number value for calculations
      data: dataObject, // Full data object including employees, incidents, etc.
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

  // Helper functions for calculations
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  // Enhanced KPI status calculation for different KPI types
  const getKPIStatus = useCallback((departmentId, kpiId) => {
    const latestEntry = getLatestKPIValue(departmentId, kpiId);
    if (!latestEntry || !latestEntry.data) return 'no-data';

    const kpiDefinition = kpiDefinitions[departmentId]?.kpis.find(k => k.id === kpiId);
    if (!kpiDefinition) return 'no-data';

    // Handle R&D KPI types with correct IDs
    if (kpiId === 'product_development_time') {
      return getProductDevelopmentStatus(latestEntry, kpiDefinition);
    } else if (kpiId === 'formulation_development') {
      return getFormulationDevelopmentStatus(latestEntry, kpiDefinition);
    } else if (kpiDefinition.trackingType === 'employee-based') {
      return getAttendanceStatus(latestEntry, kpiDefinition);
    } else if (kpiDefinition.trackingType === 'employee-incidents') {
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

  // Product Development Time status calculation
  const getProductDevelopmentStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.stats) return 'no-data';
    
    const { stats } = entry.data;
    const target = kpiDefinition.target || 80;
    const globalKPI = entry.value;
    
    // Check if there are overdue projects
    const overdueProjects = stats.overdue || 0;
    const totalProjects = stats.total || 0;
    
    // Penalize heavily for overdue projects
    if (overdueProjects > 0 && totalProjects > 0) {
      const overdueRatio = overdueProjects / totalProjects;
      if (overdueRatio > 0.3) return 'needs-attention';
      if (overdueRatio > 0.1) return 'fair';
    }
    
    // Evaluate based on global performance
    if (globalKPI >= target) return 'excellent';
    if (globalKPI >= target * 0.8) return 'good';
    if (globalKPI >= target * 0.6) return 'fair';
    return 'needs-attention';
  };

  // Formulation Development status calculation
  const getFormulationDevelopmentStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.stats) return 'no-data';
    
    const { stats, monthlyGoal } = entry.data;
    const target = kpiDefinition.target || 75;
    const globalKPI = entry.value;
    
    // Check monthly goal achievement
    const monthlyCompleted = stats.monthlyCompleted || 0;
    const monthlyTarget = monthlyGoal || 0;
    
    if (monthlyTarget > 0) {
      const monthlyAchievement = (monthlyCompleted / monthlyTarget) * 100;
      
      // If monthly goals are severely behind, lower the status
      if (monthlyAchievement < 30) return 'needs-attention';
      if (monthlyAchievement < 60) return 'fair';
    }
    
    // Evaluate based on global performance
    if (globalKPI >= target) return 'excellent';
    if (globalKPI >= target * 0.8) return 'good';
    if (globalKPI >= target * 0.6) return 'fair';
    return 'needs-attention';
  };

  // Attendance status calculation
  const getAttendanceStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.employees) return 'no-data';
    
    const { employees, weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target;
    const averageProductivity = entry.value;
    
    if (averageProductivity >= target) return 'excellent';
    if (averageProductivity >= target * 0.9) return 'good';
    if (averageProductivity >= target * 0.7) return 'fair';
    return 'needs-attention';
  };

  // Safety status calculation
  const getSafetyStatus = (entry, kpiDefinition) => {
    if (!entry.data) return 'no-data';
    
    const { weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target || 0;
    const safetyScore = entry.value;
    
    // Safety KPI returns a score (0-100), higher is better
    if (safetyScore >= 90) return 'excellent';
    if (safetyScore >= 70) return 'good';
    if (safetyScore >= 50) return 'fair';
    return 'needs-attention';
  };

  // Efficiency status calculation
  const getEfficiencyStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.employees) return 'no-data';
    
    const { weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target;
    const averageEfficiency = entry.value;
    
    if (averageEfficiency >= target) return 'excellent';
    if (averageEfficiency >= target * 0.9) return 'good';
    if (averageEfficiency >= target * 0.7) return 'fair';
    return 'needs-attention';
  };

  // Get R&D specific analytics with correct KPI IDs
  const getRnDAnalytics = useCallback((departmentId) => {
    if (departmentId !== 'rnd') return null;
    
    const rndData = kpiData[departmentId] || {};
    const analytics = {
      product_development_time: [],
      formulation_development: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process product development time data (correct KPI ID)
    const productDevEntries = rndData['product_development_time'] || [];
    productDevEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.product_development_time.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          products: entry.data.products || [],
          stats: entry.data.stats || {},
          type: entry.data.type
        });
      }
    });

    // Process formulation development data (correct KPI ID)
    const formulationEntries = rndData['formulation_development'] || [];
    formulationEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.formulation_development.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          formulas: entry.data.formulas || [],
          stats: entry.data.stats || {},
          monthlyGoal: entry.data.monthlyGoal || 0,
          type: entry.data.type
        });
      }
    });

    // Sort by date (most recent first)
    analytics.product_development_time.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.formulation_development.sort((a, b) => new Date(b.date) - new Date(a.date));

    return analytics;
  }, [kpiData]);

  // ENHANCED: Get team-specific analytics with proper data synchronization
  const getTeamAnalytics = useCallback((departmentId) => {
    if (departmentId !== 'team') return null;
    
    const teamData = kpiData[departmentId] || {};
    console.log('🔍 Getting team analytics from:', teamData);
    
    // Initialize analytics structure with proper naming to match report expectations
    const analytics = {
      team_productivity_attendance: [],
      safety_incidents: [],
      operator_efficiency: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process each KPI type with correct mapping
    Object.keys(teamData).forEach(kpiId => {
      const kpiEntries = teamData[kpiId];
      const kpiDef = kpiDefinitions[departmentId]?.kpis.find(k => k.id === kpiId);
      
      if (!kpiDef) return;

      console.log(`📊 Processing KPI: ${kpiId} with ${kpiEntries.length} entries`);

      kpiEntries.forEach(entry => {
        const date = new Date(entry.date);
        const week = getWeekNumber(date);
        const month = date.getMonth();
        
        // Map KPI data to analytics structure with proper names
        if (kpiId === 'team_productivity_attendance') {
          analytics.team_productivity_attendance.push({
            date: entry.date,
            week,
            month,
            value: entry.value, // Team average productivity
            data: entry.data, // Full data including employees
            employees: entry.data?.employees || [],
            target: entry.data?.weeklyTarget || kpiDef.target,
            type: 'attendance'
          });
        } else if (kpiId === 'safety_incidents') {
          analytics.safety_incidents.push({
            date: entry.date,
            week,
            month,
            value: entry.value, // Safety score (0-100)
            data: entry.data, // Full data including incidents
            incidents: entry.data?.incidents || [],
            totalIncidents: entry.data?.totalIncidents || 0,
            target: entry.data?.weeklyTarget || kpiDef.target,
            type: 'safety'
          });
        } else if (kpiId === 'operator_efficiency') {
          analytics.operator_efficiency.push({
            date: entry.date,
            week,
            month,
            value: entry.value, // Team average efficiency
            data: entry.data, // Full data including employees and tasks
            employees: entry.data?.employees || [],
            target: entry.data?.weeklyTarget || kpiDef.target,
            type: 'efficiency'
          });
        }
      });
    });

    // Sort by date (most recent first)
    analytics.team_productivity_attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.safety_incidents.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.operator_efficiency.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('✅ Team analytics generated:', {
      attendanceEntries: analytics.team_productivity_attendance.length,
      safetyEntries: analytics.safety_incidents.length,
      efficiencyEntries: analytics.operator_efficiency.length
    });

    return analytics;
  }, [kpiData]);

  // Get Production specific analytics
  const getProductionAnalytics = useCallback((departmentId) => {
    if (departmentId !== 'production') return null;
    
    const productionData = kpiData[departmentId] || {};
    const analytics = {
      energy_consumption: [],
      mixing_time: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process energy consumption data
    const energyEntries = productionData['energy_consumption'] || [];
    energyEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.energy_consumption.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          stats: entry.data.stats || {},
          type: 'energy'
        });
      }
    });

    // Process mixing time data
    const mixingEntries = productionData['mixing_time'] || [];
    mixingEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.mixing_time.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          stats: entry.data.stats || {},
          type: 'mixing'
        });
      }
    });

    // Sort by date (most recent first)
    analytics.energy_consumption.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.mixing_time.sort((a, b) => new Date(b.date) - new Date(a.date));

    return analytics;
  }, [kpiData]);

  // Get Quality specific analytics
  const getQualityAnalytics = useCallback((departmentId) => {
    if (departmentId !== 'quality') return null;
    
    const qualityData = kpiData[departmentId] || {};
    const analytics = {
      material_batch_acceptance_rate: [],
      production_waste_rate: [],
      raw_materials_inventory_list: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process material batch acceptance data
    const batchEntries = qualityData['material_batch_acceptance_rate'] || [];
    batchEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.material_batch_acceptance_rate.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          batches: entry.data.batches || [],
          stats: entry.data.stats || {},
          type: 'batch_acceptance'
        });
      }
    });

    // Process waste rate data
    const wasteEntries = qualityData['production_waste_rate'] || [];
    wasteEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.production_waste_rate.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          processes: entry.data.processes || [],
          stats: entry.data.stats || {},
          type: 'waste_rate'
        });
      }
    });

    // Process inventory data
    const inventoryEntries = qualityData['raw_materials_inventory_list'] || [];
    inventoryEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.raw_materials_inventory_list.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          tests: entry.data.tests || [],
          stats: entry.data.stats || {},
          type: 'inventory'
        });
      }
    });

    // Sort by date (most recent first)
    analytics.material_batch_acceptance_rate.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.production_waste_rate.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.raw_materials_inventory_list.sort((a, b) => new Date(b.date) - new Date(a.date));

    return analytics;
  }, [kpiData]);

  // Get Warehouses specific analytics
  const getWarehousesAnalytics = useCallback((departmentId) => {
    if (departmentId !== 'warehouses') return null;
    
    const warehousesData = kpiData[departmentId] || {};
    const analytics = {
      cost_per_formulation: [],
      inventory_turnover: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process cost per formulation data
    const costEntries = warehousesData['cost_per_formulation'] || [];
    costEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.cost_per_formulation.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          totalCost: entry.data.totalCost || 0,
          budgetedCost: entry.data.budgetedCost || 0,
          budgetVariance: entry.data.budgetVariance || 0,
          stats: entry.data.stats || {},
          type: 'cost'
        });
      }
    });

    // Process inventory turnover data
    const turnoverEntries = warehousesData['inventory_turnover'] || [];
    turnoverEntries.forEach(entry => {
      if (entry.data) {
        const date = new Date(entry.date);
        
        analytics.inventory_turnover.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          data: entry.data,
          turnoverRate: entry.data.turnoverRate || 0,
          currentStock: entry.data.currentStock || 0,
          optimalStock: entry.data.optimalStock || 0,
          stats: entry.data.stats || {},
          type: 'turnover'
        });
      }
    });

    // Sort by date (most recent first)
    analytics.cost_per_formulation.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.inventory_turnover.sort((a, b) => new Date(b.date) - new Date(a.date));

    return analytics;
  }, [kpiData]);

  // Enhanced department summary with stable function reference
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
      analytics: departmentId === 'team' ? getTeamAnalytics(departmentId) : 
                 departmentId === 'rnd' ? getRnDAnalytics(departmentId) : 
                 departmentId === 'production' ? getProductionAnalytics(departmentId) :
                 departmentId === 'quality' ? getQualityAnalytics(departmentId) :
                 departmentId === 'warehouses' ? getWarehousesAnalytics(departmentId) : null
    };
  }, [kpiData, getLatestKPIValue, getKPIStatus, getKPIHistory, getTeamAnalytics, getRnDAnalytics, getProductionAnalytics, getQualityAnalytics, getWarehousesAnalytics]);

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
    
    // Specific analytics functions
    getTeamAnalytics,
    getRnDAnalytics,
    getProductionAnalytics,
    getQualityAnalytics,
    getWarehousesAnalytics,
    
    // Utility functions
    deleteKPIEntry,
    getKPITrend,
    clearAllData,
    forceSave,
    debugLocalStorage
  };
};