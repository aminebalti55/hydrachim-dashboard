import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardService } from '../services/DashboardService';
import { useRnDData } from './useRnDData';
import { useTeamsKPIData } from './useTeamsKPIData';
import { useWarehouseData } from './useWarehouseData';
import { useQualityData } from './useQualityData';
import { useProductionData } from './useProductionData';

export const useDashboardData = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [yearlyAnalysis, setYearlyAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // MODULE HOOKS INTEGRATION
  // ============================================================================
  
  const rndData = useRnDData();
  const teamsData = useTeamsKPIData();
  const warehouseData = useWarehouseData();
  const qualityData = useQualityData();
  const productionData = useProductionData();

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [stats, activities, depts, analysis] = await Promise.all([
        DashboardService.getDashboardStatistics(),
        DashboardService.getRecentActivities(),
        DashboardService.getAllDepartments(),
        DashboardService.getAllYearlyAnalysis()
      ]);

      setDashboardStats(stats);
      setRecentActivities(activities);
      setDepartments(depts);
      setYearlyAnalysis(analysis);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ============================================================================
  // ACTIVITY LOGGING
  // ============================================================================

  const logActivity = useCallback(async (activityData) => {
    try {
      await DashboardService.logActivity(activityData);
      // Refresh activities
      const activities = await DashboardService.getRecentActivities();
      setRecentActivities(activities);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, []);

  // ============================================================================
  // DEPARTMENT SUMMARY AGGREGATION
  // ============================================================================

  const getDepartmentSummary = useCallback(async (departmentId) => {
    try {
      let summary = {
        totalKPIs: 0,
        kpisWithData: 0,
        efficiency: 0,
        kpis: [],
        lastUpdated: null
      };

      switch (departmentId) {
        case 'rnd':
          if (rndData) {
            const rndSummary = await rndData.getDepartmentSummary(departmentId);
            summary = {
              totalKPIs: rndSummary.totalKPIs || 1,
              kpisWithData: rndSummary.withData || 0,
              efficiency: rndSummary.averageScore || 0,
              kpis: [], // Will be populated with actual KPI data
              lastUpdated: null
            };
          }
          break;

        case 'team':
          if (teamsData && teamsData.kpiData) {
            const teamSummary = teamsData.getDepartmentSummary(departmentId);
            summary = {
              totalKPIs: 3, // team_productivity_attendance, operator_efficiency, safety_incidents
              kpisWithData: teamSummary.kpisWithData || 0,
              efficiency: teamSummary.efficiency || 0,
              kpis: teamSummary.kpis || [],
              lastUpdated: teamSummary.lastUpdated
            };
          }
          break;

        case 'warehouses':
          if (warehouseData) {
            const warehouseSummary = warehouseData.getDepartmentSummary(departmentId);
            summary = {
              totalKPIs: 2, // cost_per_formulation, stock_issues_rate
              kpisWithData: warehouseSummary.kpiCount || 0,
              efficiency: warehouseSummary.overallScore || 0,
              kpis: warehouseSummary.kpis ? Object.entries(warehouseSummary.kpis).map(([id, data]) => ({
                id,
                latestValue: data,
                target: id === 'cost_per_formulation' ? 100 : 90
              })) : [],
              lastUpdated: warehouseSummary.lastUpdated
            };
          }
          break;

        case 'quality':
          if (qualityData) {
            const qualityStats = qualityData.getQualityStats();
            summary = {
              totalKPIs: qualityStats.totalKPIs || 3,
              kpisWithData: qualityStats.kpisWithData || 0,
              efficiency: qualityStats.efficiency || 0,
              kpis: ['material_batch_acceptance_rate', 'production_waste_rate', 'raw_materials_inventory_list'].map(kpiId => ({
                id: kpiId,
                latestValue: qualityData.getLatestKPIValue('quality', kpiId),
                target: kpiId === 'material_batch_acceptance_rate' ? 90 : kpiId === 'production_waste_rate' ? 80 : 95,
                status: qualityData.getKPIStatus('quality', kpiId)
              })),
              lastUpdated: qualityStats.lastUpdated
            };
          }
          break;

        case 'production':
          if (productionData) {
            const productionSummary = productionData.getDepartmentSummary(departmentId);
            summary = {
              totalKPIs: productionSummary.totalKPIs || 2,
              kpisWithData: productionSummary.activeKPIs || 0,
              efficiency: productionSummary.averagePerformance || 0,
              kpis: ['energy_consumption', 'mixing_time'].map(kpiId => ({
                id: kpiId,
                latestValue: productionData.getLatestKPIValue(departmentId, kpiId),
                target: kpiId === 'energy_consumption' ? 80 : 90
              })),
              lastUpdated: productionSummary.lastUpdated
            };
          }
          break;
      }

      return summary;
    } catch (err) {
      console.error(`Error getting department summary for ${departmentId}:`, err);
      return {
        totalKPIs: 0,
        kpisWithData: 0,
        efficiency: 0,
        kpis: [],
        lastUpdated: null
      };
    }
  }, [rndData, teamsData, warehouseData, qualityData, productionData]);

  // ============================================================================
  // AGGREGATED DASHBOARD DATA
  // ============================================================================

  const dashboardData = useMemo(() => {
    const departmentConfigs = [
      { id: 'rnd', name: 'Laboratoire R&D', color: '#6366F1' },
      { id: 'team', name: "Performance de l'Équipe", color: '#EC4899' },
      { id: 'warehouses', name: 'Entrepôts & Logistique', color: '#8B5CF6' },
      { id: 'quality', name: 'Contrôle Qualité', color: '#059669' },
      { id: 'production', name: 'Production & Mélange', color: '#DC2626' }
    ];

    return {
      departments: departmentConfigs,
      totalDepartments: departmentConfigs.length,
      activeDepartments: dashboardStats?.activeDepartments || 0,
      averageScore: dashboardStats?.averageScore || 0
    };
  }, [dashboardStats]);

  // ============================================================================
  // KPI DATA AGGREGATION
  // ============================================================================

  const getKPIData = useCallback(() => {
    const allKPIData = {};

    // Aggregate data from all modules
    if (rndData && rndData.kpiData) {
      allKPIData.rnd = rndData.kpiData;
    }

    if (teamsData && teamsData.kpiData) {
      allKPIData.team = teamsData.kpiData;
    }

    if (warehouseData && warehouseData.kpiData) {
      allKPIData.warehouses = warehouseData.kpiData;
    }

    if (qualityData && qualityData.qualityData) {
      allKPIData.quality = qualityData.qualityData;
    }

    if (productionData && productionData.productionData) {
      allKPIData.production = productionData.productionData;
    }

    return allKPIData;
  }, [rndData, teamsData, warehouseData, qualityData, productionData]);

  // ============================================================================
  // YEARLY REPORTS
  // ============================================================================

  const generateYearlyReport = useCallback(async (departmentId, year = new Date().getFullYear()) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Get department summary
      const summary = await getDepartmentSummary(departmentId);
      
      // Get KPI data for the department
      const kpiData = getKPIData()[departmentId] || {};

      // Generate performance data
      const performanceData = {
        overall_efficiency: summary.efficiency,
        kpis_with_data: summary.kpisWithData,
        total_kpis: summary.totalKPIs,
        data_completeness: summary.totalKPIs > 0 ? (summary.kpisWithData / summary.totalKPIs) * 100 : 0
      };

      // Generate yearly analysis
      const analysis = await DashboardService.generateYearlyAnalysisForDepartment(
        departmentId, 
        year, 
        kpiData, 
        performanceData
      );

      // Refresh yearly analysis data
      const updatedAnalysis = await DashboardService.getAllYearlyAnalysis(year);
      setYearlyAnalysis(updatedAnalysis);

      return analysis;
    } catch (err) {
      console.error('Error generating yearly report:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [getDepartmentSummary, getKPIData]);

  const getYearlyReport = useCallback(async (departmentId, year = new Date().getFullYear()) => {
    try {
      const analysis = await DashboardService.getYearlyAnalysis(departmentId, year);
      
      if (analysis) {
        const [detections, recommendations] = await Promise.all([
          DashboardService.getDetectionsByAnalysis(analysis.id),
          DashboardService.getRecommendationsByAnalysis(analysis.id)
        ]);

        return {
          ...analysis,
          detections,
          recommendations
        };
      }

      return null;
    } catch (err) {
      console.error('Error getting yearly report:', err);
      return null;
    }
  }, []);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  const refreshData = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // MODULE LOADING STATES
  // ============================================================================

  const isAnyModuleLoading = useMemo(() => {
    return rndData?.isLoading || 
           teamsData?.isLoading || 
           warehouseData?.isLoading || 
           qualityData?.isLoading || 
           productionData?.isLoading;
  }, [rndData?.isLoading, teamsData?.isLoading, warehouseData?.isLoading, qualityData?.isLoading, productionData?.isLoading]);

  const moduleErrors = useMemo(() => {
    const errors = [];
    if (rndData?.error) errors.push({ module: 'R&D', error: rndData.error });
    if (teamsData?.error) errors.push({ module: 'Teams', error: teamsData.error });
    if (warehouseData?.error) errors.push({ module: 'Warehouse', error: warehouseData.error });
    if (qualityData?.error) errors.push({ module: 'Quality', error: qualityData.error });
    if (productionData?.error) errors.push({ module: 'Production', error: productionData.error });
    return errors;
  }, [rndData?.error, teamsData?.error, warehouseData?.error, qualityData?.error, productionData?.error]);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Data
    dashboardData,
    dashboardStats,
    recentActivities,
    departments,
    yearlyAnalysis,
    
    // States
    isLoading: isLoading || isAnyModuleLoading,
    isUpdating,
    error: error || (moduleErrors.length > 0 ? moduleErrors : null),
    
    // Methods
    getDepartmentSummary,
    getKPIData,
    logActivity,
    generateYearlyReport,
    getYearlyReport,
    refreshData,
    clearError,
    
    // Module hooks (for direct access if needed)
    modules: {
      rndData,
      teamsData,
      warehouseData,
      qualityData,
      productionData
    },

    // Utility
    hasData: () => {
      return dashboardStats !== null || recentActivities.length > 0;
    },
    
    getOverallStats: () => {
      const kpiData = getKPIData();
      let totalKPIs = 0;
      let kpisWithData = 0;
      let totalEfficiency = 0;
      let departmentsWithData = 0;

      Object.keys(kpiData).forEach(deptId => {
        const data = kpiData[deptId];
        if (data && Object.keys(data).length > 0) {
          departmentsWithData++;
          const dataArrays = Object.values(data).filter(arr => Array.isArray(arr));
          totalKPIs += dataArrays.length;
          kpisWithData += dataArrays.filter(arr => arr.length > 0).length;
        }
      });

      // Calculate efficiency based on yearly analysis
      if (yearlyAnalysis.length > 0) {
        totalEfficiency = yearlyAnalysis.reduce((sum, analysis) => sum + analysis.overall_score, 0);
        totalEfficiency = Math.round(totalEfficiency / yearlyAnalysis.length);
      }

      return {
        totalKPIs,
        kpisWithData,
        activeDepartments: departmentsWithData,
        overallEfficiency: totalEfficiency,
        dataCompleteness: totalKPIs > 0 ? Math.round((kpisWithData / totalKPIs) * 100) : 0
      };
    }
  };
};