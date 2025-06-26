import { useState, useEffect, useCallback } from 'react';
import { RnDService } from '../services/rndService';

export const useRnDData = () => {
  const [kpiData, setKpiData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update KPI value
  const updateKPIValue = useCallback(async (departmentId, kpiId, dataObject, notes = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await RnDService.updateKPIValue(departmentId, kpiId, dataObject, notes);
      
      // Update local state to reflect the change
      setKpiData(prev => ({
        ...prev,
        [`${departmentId}_${kpiId}`]: {
          ...prev[`${departmentId}_${kpiId}`],
          lastUpdate: Date.now()
        }
      }));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get latest KPI value
  const getLatestKPIValue = useCallback(async (departmentId, kpiId) => {
    try {
      const result = await RnDService.getLatestKPIValue(departmentId, kpiId);
      return result;
    } catch (err) {
      console.error('Error getting latest KPI value:', err);
      return null;
    }
  }, []);

  // NEW: Get KPI value for a specific month
  const getKPIValueForMonth = useCallback(async (departmentId, kpiId, targetDate) => {
    try {
      const result = await RnDService.getKPIValueForMonth(departmentId, kpiId, targetDate);
      return result;
    } catch (err) {
      console.error('Error getting KPI value for month:', err);
      return null;
    }
  }, []);

  // Get KPI history
  const getKPIHistory = useCallback(async (departmentId, kpiId, limit = 50) => {
    try {
      const result = await RnDService.getKPIHistory(departmentId, kpiId, limit);
      return result;
    } catch (err) {
      console.error('Error getting KPI history:', err);
      return [];
    }
  }, []);

  // Get KPI status
  const getKPIStatus = useCallback(async (departmentId, kpiId) => {
    try {
      const result = await RnDService.getKPIStatus(departmentId, kpiId);
      return result;
    } catch (err) {
      console.error('Error getting KPI status:', err);
      return 'no-data';
    }
  }, []);

  // Get department summary
  const getDepartmentSummary = useCallback(async (departmentId) => {
    try {
      const result = await RnDService.getDepartmentSummary(departmentId);
      return result;
    } catch (err) {
      console.error('Error getting department summary:', err);
      return {
        totalKPIs: 1,
        withData: 0,
        excellent: 0,
        good: 0,
        fair: 0,
        needsAttention: 0,
        noData: 1,
        averageScore: 0
      };
    }
  }, []);

  // Get KPI trend
  const getKPITrend = useCallback(async (departmentId, kpiId, limit = 10) => {
    try {
      const result = await RnDService.getKPITrend(departmentId, kpiId, limit);
      return result;
    } catch (err) {
      console.error('Error getting KPI trend:', err);
      return [];
    }
  }, []);

  // Get R&D analytics
  const getRnDAnalytics = useCallback(async () => {
    try {
      const result = await RnDService.getRnDAnalytics();
      return result;
    } catch (err) {
      console.error('Error getting R&D analytics:', err);
      return {
        product_development_time: []
      };
    }
  }, []);

  // Get all projects
  const getAllProjects = useCallback(async (departmentId) => {
    try {
      const result = await RnDService.getAllProjects(departmentId);
      return result;
    } catch (err) {
      console.error('Error getting all projects:', err);
      return [];
    }
  }, []);

  // NEW: Get projects for a specific month
  const getProjectsForMonth = useCallback(async (departmentId, targetDate) => {
    try {
      const result = await RnDService.getProjectsForMonth(departmentId, targetDate);
      return result;
    } catch (err) {
      console.error('Error getting projects for month:', err);
      return [];
    }
  }, []);

  // NEW: Check if data exists for a specific month
  const hasDataForMonth = useCallback(async (departmentId, kpiId, targetDate) => {
    try {
      const result = await RnDService.hasDataForMonth(departmentId, kpiId, targetDate);
      return result;
    } catch (err) {
      console.error('Error checking data for month:', err);
      return false;
    }
  }, []);

  // NEW: Load complete data for a specific month (projects + KPI data)
  const loadMonthData = useCallback(async (departmentId, kpiId, targetDate) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [kpiData, projects, hasData] = await Promise.all([
        RnDService.getKPIValueForMonth(departmentId, kpiId, targetDate),
        RnDService.getProjectsForMonth(departmentId, targetDate),
        RnDService.hasDataForMonth(departmentId, kpiId, targetDate)
      ]);
      
      return {
        kpiData,
        projects,
        hasData,
        monthKey: new Date(targetDate).toISOString().split('T')[0].substring(0, 7) // YYYY-MM format
      };
    } catch (err) {
      setError(err.message);
      console.error('Error loading month data:', err);
      return {
        kpiData: null,
        projects: [],
        hasData: false,
        monthKey: new Date(targetDate).toISOString().split('T')[0].substring(0, 7)
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    kpiData,
    isLoading,
    error,
    updateKPIValue,
    getLatestKPIValue,
    getKPIValueForMonth, // NEW
    getKPIHistory,
    getKPIStatus,
    getDepartmentSummary,
    getKPITrend,
    getRnDAnalytics,
    getAllProjects,
    getProjectsForMonth, // NEW
    hasDataForMonth, // NEW
    loadMonthData // NEW - comprehensive month data loader
  };
};