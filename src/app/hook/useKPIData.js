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
      data: dataObject, // Full data object including products, formulas, etc.
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

  // Enhanced KPI status calculation for different KPI types
  const getKPIStatus = useCallback((departmentId, kpiId) => {
    const latestEntry = getLatestKPIValue(departmentId, kpiId);
    if (!latestEntry || !latestEntry.data) return 'no-data';

    const kpiDefinition = kpiDefinitions[departmentId]?.kpis.find(k => k.id === kpiId);
    if (!kpiDefinition) return 'no-data';

    // Handle different R&D KPI types
    if (kpiId === 'product_quality_validation') {
      return getProductQualityStatus(latestEntry, kpiDefinition);
    } else if (kpiId === 'formulation_builder') {
      return getFormulationStatus(latestEntry, kpiDefinition);
    } else if (kpiId === 'live_kpi_dashboard') {
      return getDashboardStatus(latestEntry, kpiDefinition);
    } else if (kpiDefinition.trackingType === 'attendance') {
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

  // Product Quality Validation status calculation
  const getProductQualityStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.products) return 'no-data';
    
    const { products, categoryKPIs } = entry.data;
    const target = kpiDefinition.target || 90;
    const globalKPI = entry.value;
    
    // Calculate weighted status based on category performance
    const matiereKPI = categoryKPIs?.matiere_premiere || 0;
    const produitKPI = categoryKPIs?.produit_fini || 0;
    const emballageKPI = categoryKPIs?.emballage || 0;
    
    const avgKPI = (matiereKPI + produitKPI + emballageKPI) / 3;
    
    if (avgKPI >= target) return 'excellent';
    if (avgKPI >= target * 0.8) return 'good';
    if (avgKPI >= target * 0.6) return 'fair';
    return 'needs-attention';
  };

  // Formulation Builder status calculation
  const getFormulationStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.formulas) return 'no-data';
    
    const { formulas } = entry.data;
    const target = kpiDefinition.target || 80;
    const globalKPI = entry.value;
    
    // Check formula performance
    const highPerformingFormulas = formulas.filter(f => (f.kpi || 0) >= target).length;
    const performanceRatio = formulas.length > 0 ? highPerformingFormulas / formulas.length : 0;
    
    if (performanceRatio >= 0.8) return 'excellent';
    if (performanceRatio >= 0.6) return 'good';
    if (performanceRatio >= 0.4) return 'fair';
    return 'needs-attention';
  };

  // Dashboard status calculation
  const getDashboardStatus = (entry, kpiDefinition) => {
    if (!entry.data || !entry.data.metrics) return 'no-data';
    
    const { metrics, globalTarget } = entry.data;
    const target = globalTarget || kpiDefinition.target || 80;
    const globalSuccessRate = metrics.globalSuccessRate || entry.value;
    
    if (globalSuccessRate >= target) return 'excellent';
    if (globalSuccessRate >= target * 0.8) return 'good';
    if (globalSuccessRate >= target * 0.6) return 'fair';
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
    if (!entry.data || !entry.data.employees) return 'no-data';
    
    const { weeklyTarget } = entry.data;
    const target = weeklyTarget || kpiDefinition.target || 0;
    const totalIncidents = entry.value;
    
    if (totalIncidents <= target) return 'excellent';
    if (totalIncidents <= target * 1.5) return 'good';
    if (totalIncidents <= target * 2) return 'fair';
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

  // Get R&D specific analytics
  const getRnDAnalytics = useCallback((departmentId) => {
    if (departmentId !== 'rnd') return null;
    
    const rndData = kpiData[departmentId] || {};
    const analytics = {
      quality: [],
      formulation: [],
      dashboard: [],
      weeklyReports: [],
      monthlyReports: [],
      alerts: []
    };

    // Process product quality validation data
    const qualityEntries = rndData['product_quality_validation'] || [];
    qualityEntries.forEach(entry => {
      if (entry.data && entry.data.products) {
        const date = new Date(entry.date);
        
        analytics.quality.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          products: entry.data.products,
          categoryKPIs: entry.data.categoryKPIs,
          
          // Calculate detailed metrics for new structure
          matierePremiereTests: calculateMatierePremiereMetrics(entry.data.products.matiere_premiere),
          produitFiniTests: calculateProduitFiniMetrics(entry.data.products.produit_fini),
          emballageAvailability: calculateEmballageMetrics(entry.data.products.emballage)
        });
      }
    });

    // Process formulation builder data
    const formulationEntries = rndData['formulation_builder'] || [];
    formulationEntries.forEach(entry => {
      if (entry.data && entry.data.formulas) {
        const date = new Date(entry.date);
        
        analytics.formulation.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          formulas: entry.data.formulas,
          totalFormulas: entry.data.formulas.length,
          averageKPI: entry.value
        });
      }
    });

    // Process dashboard data
    const dashboardEntries = rndData['live_kpi_dashboard'] || [];
    dashboardEntries.forEach(entry => {
      if (entry.data && entry.data.metrics) {
        const date = new Date(entry.date);
        
        analytics.dashboard.push({
          date: entry.date,
          week: getWeekNumber(date),
          month: date.getMonth(),
          value: entry.value,
          metrics: entry.data.metrics,
          globalTarget: entry.data.globalTarget
        });
      }
    });

    // Sort by date (most recent first)
    analytics.quality.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.formulation.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.dashboard.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate reports and alerts
    analytics.weeklyReports = generateRnDWeeklyReports(analytics);
    analytics.monthlyReports = generateRnDMonthlyReports(analytics);
    analytics.alerts = generateRnDAlerts(analytics);

    return analytics;
  }, [kpiData]);

  // Calculate matiere premiere test metrics
  const calculateMatierePremiereMetrics = (products) => {
    if (!products || products.length === 0) return { totalTests: 0, passedTests: 0, byTestType: {} };
    
    let totalTests = 0;
    let passedTests = 0;
    const byTestType = { density: { total: 0, passed: 0 }, ph: { total: 0, passed: 0 }, dosage: { total: 0, passed: 0 } };
    
    products.forEach(product => {
      if (product.tests) {
        Object.entries(product.tests).forEach(([testType, test]) => {
          totalTests++;
          if (test.passed) passedTests++;
          
          if (byTestType[testType]) {
            byTestType[testType].total++;
            if (test.passed) byTestType[testType].passed++;
          }
        });
      }
    });
    
    return { totalTests, passedTests, byTestType };
  };

  // Calculate produit fini test metrics
  const calculateProduitFiniMetrics = (products) => {
    if (!products || products.length === 0) return { totalTests: 0, passedTests: 0, byTestType: {} };
    
    let totalTests = 0;
    let passedTests = 0;
    const byTestType = { density: { total: 0, passed: 0 }, ph: { total: 0, passed: 0 }, dosage: { total: 0, passed: 0 } };
    
    products.forEach(product => {
      if (product.tests) {
        Object.entries(product.tests).forEach(([testType, test]) => {
          totalTests++;
          if (test.passed) passedTests++;
          
          if (byTestType[testType]) {
            byTestType[testType].total++;
            if (test.passed) byTestType[testType].passed++;
          }
        });
      }
    });
    
    return { totalTests, passedTests, byTestType };
  };

  // Calculate emballage availability metrics
  const calculateEmballageMetrics = (products) => {
    if (!products || products.length === 0) return { totalProducts: 0, availableProducts: 0 };
    
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.available).length;
    
    return { totalProducts, availableProducts };
  };

  // Get team-specific analytics with corrected data processing
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

  // Generate R&D specific weekly reports
  const generateRnDWeeklyReports = (analytics) => {
    const reports = [];
    const currentWeek = getWeekNumber(new Date());
    
    // Group data by week
    const weeklyData = {};
    
    ['quality', 'formulation', 'dashboard'].forEach(type => {
      analytics[type].forEach(entry => {
        if (!weeklyData[entry.week]) {
          weeklyData[entry.week] = { quality: [], formulation: [], dashboard: [] };
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
        quality: calculateWeeklyQuality(weekData.quality),
        formulation: calculateWeeklyFormulation(weekData.formulation),
        dashboard: calculateWeeklyDashboard(weekData.dashboard),
        status: 'good'
      };
      
      // Determine overall week status
      const statuses = [report.quality.status, report.formulation.status, report.dashboard.status];
      if (statuses.includes('needs-attention')) report.status = 'needs-attention';
      else if (statuses.includes('good')) report.status = 'good';
      else report.status = 'excellent';
      
      reports.push(report);
    });
    
    return reports.sort((a, b) => b.week - a.week);
  };

  // Generate R&D specific monthly reports
  const generateRnDMonthlyReports = (analytics) => {
    const reports = [];
    const currentMonth = new Date().getMonth();
    
    const monthlyData = {};
    
    ['quality', 'formulation', 'dashboard'].forEach(type => {
      analytics[type].forEach(entry => {
        if (!monthlyData[entry.month]) {
          monthlyData[entry.month] = { quality: [], formulation: [], dashboard: [] };
        }
        monthlyData[entry.month][type].push(entry);
      });
    });
    
    Object.keys(monthlyData).forEach(month => {
      const monthData = monthlyData[month];
      const report = {
        month: parseInt(month),
        isCurrent: parseInt(month) === currentMonth,
        quality: calculateMonthlyQuality(monthData.quality),
        formulation: calculateMonthlyFormulation(monthData.formulation),
        dashboard: calculateMonthlyDashboard(monthData.dashboard),
        status: 'good'
      };
      
      const statuses = [report.quality.status, report.formulation.status, report.dashboard.status];
      if (statuses.includes('needs-attention')) report.status = 'needs-attention';
      else if (statuses.includes('good')) report.status = 'good';
      else report.status = 'excellent';
      
      reports.push(report);
    });
    
    return reports.sort((a, b) => b.month - a.month);
  };

  // Generate R&D specific alerts
  const generateRnDAlerts = (analytics) => {
    const alerts = [];
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    
    // Check quality alerts
    const currentWeekQuality = analytics.quality.filter(entry => entry.week === currentWeek);
    currentWeekQuality.forEach(entry => {
      if (entry.value < 80) {
        alerts.push({
          id: `quality_${entry.date}`,
          type: 'quality',
          severity: entry.value < 60 ? 'high' : 'medium',
          message: `Qualité produits en dessous du seuil: ${entry.value}%`,
          date: entry.date,
          kpiId: 'product_quality_validation'
        });
      }
      
      // Check specific test type failures
      if (entry.matierePremiereTests && entry.matierePremiereTests.totalTests > 0) {
        const failureRate = (entry.matierePremiereTests.totalTests - entry.matierePremiereTests.passedTests) / entry.matierePremiereTests.totalTests;
        if (failureRate > 0.3) {
          alerts.push({
            id: `matiere_premiere_${entry.date}`,
            type: 'quality',
            severity: failureRate > 0.5 ? 'high' : 'medium',
            message: `Taux d'échec élevé pour matières premières: ${Math.round(failureRate * 100)}%`,
            date: entry.date,
            kpiId: 'product_quality_validation'
          });
        }
      }
    });
    
    // Check formulation alerts
    const currentWeekFormulation = analytics.formulation.filter(entry => entry.week === currentWeek);
    currentWeekFormulation.forEach(entry => {
      if (entry.value < 70) {
        alerts.push({
          id: `formulation_${entry.date}`,
          type: 'formulation',
          severity: entry.value < 50 ? 'high' : 'medium',
          message: `Performance formulations faible: ${entry.value}%`,
          date: entry.date,
          kpiId: 'formulation_builder'
        });
      }
    });
    
    return alerts.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Weekly calculation helpers for R&D
  const calculateWeeklyQuality = (data) => {
    if (!data.length) return { average: 0, target: 90, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const average = Math.round(total / data.length);
    const target = 90;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.8 ? 'good' : 'needs-attention'
    };
  };

  const calculateWeeklyFormulation = (data) => {
    if (!data.length) return { average: 0, target: 80, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const average = Math.round(total / data.length);
    const target = 80;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.8 ? 'good' : 'needs-attention'
    };
  };

  const calculateWeeklyDashboard = (data) => {
    if (!data.length) return { average: 0, target: 75, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const average = Math.round(total / data.length);
    const target = 75;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.8 ? 'good' : 'needs-attention'
    };
  };

  // Monthly calculation helpers for R&D
  const calculateMonthlyQuality = (data) => {
    if (!data.length) return { average: 0, target: 90, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const average = Math.round(total / data.length);
    const target = 90;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.9 ? 'good' : 'needs-attention'
    };
  };

  const calculateMonthlyFormulation = (data) => {
    if (!data.length) return { average: 0, target: 80, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const average = Math.round(total / data.length);
    const target = 80;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.9 ? 'good' : 'needs-attention'
    };
  };

  const calculateMonthlyDashboard = (data) => {
    if (!data.length) return { average: 0, target: 75, status: 'no-data' };
    
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const average = Math.round(total / data.length);
    const target = 75;
    
    return {
      average,
      target,
      status: average >= target ? 'excellent' : average >= target * 0.9 ? 'good' : 'needs-attention'
    };
  };

  // Original team functions (kept for compatibility)
  const generateWeeklyReports = (analytics) => {
    const reports = [];
    const currentWeek = getWeekNumber(new Date());
    
    const weeklyData = {};
    
    ['attendance', 'safety', 'efficiency'].forEach(type => {
      analytics[type].forEach(entry => {
        if (!weeklyData[entry.week]) {
          weeklyData[entry.week] = { attendance: [], safety: [], efficiency: [] };
        }
        weeklyData[entry.week][type].push(entry);
      });
    });
    
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
                 departmentId === 'rnd' ? getRnDAnalytics(departmentId) : null
    };
  }, [kpiData, getLatestKPIValue, getKPIStatus, getKPIHistory, getTeamAnalytics, getRnDAnalytics]);

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
    
    // Utility functions
    deleteKPIEntry,
    getKPITrend,
    clearAllData,
    forceSave,
    debugLocalStorage
  };
};