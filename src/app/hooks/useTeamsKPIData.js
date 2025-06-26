import { useState, useEffect, useCallback } from 'react';
import { teamsService } from '../services/teamsService';

export const useTeamsKPIData = () => {
  const [kpiData, setKpiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all KPI data from Supabase
  const fetchKPIData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teamsService.getAllKPIData();
      setKpiData(data);
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError(err);
      // Set empty data structure on error
      setKpiData({
        team_productivity_attendance: [],
        operator_efficiency: [],
        safety_incidents: []
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  // Update KPI value - saves to Supabase and refreshes data
  const updateKPIValue = useCallback(async (departmentId, kpiId, dataObject, notes = '') => {
    try {
      setError(null);
      
      // Save to Supabase
      await teamsService.saveKPIData(departmentId, kpiId, dataObject, notes);
      
      // Refresh data after successful save
      await fetchKPIData();
      
      return true;
    } catch (err) {
      console.error('Error updating KPI value:', err);
      setError(err);
      throw err;
    }
  }, [fetchKPIData]);

  // NEW: Get attendance data for a specific date
  const getAttendanceByDate = useCallback(async (date) => {
    try {
      setError(null);
      return await teamsService.getTeamProductivityAttendanceByDate(date);
    } catch (err) {
      console.error('Error fetching attendance by date:', err);
      setError(err);
      return null;
    }
  }, []);

  // NEW: Get operator efficiency data for a specific date
  const getOperatorEfficiencyByDate = useCallback(async (date) => {
    try {
      setError(null);
      return await teamsService.getOperatorEfficiencyByDate(date);
    } catch (err) {
      console.error('Error fetching operator efficiency by date:', err);
      setError(err);
      return null;
    }
  }, []);

  // NEW: Get safety incidents data for a specific date
  const getSafetyIncidentsByDate = useCallback(async (date) => {
    try {
      setError(null);
      return await teamsService.getSafetyIncidentsByDate(date);
    } catch (err) {
      console.error('Error fetching safety incidents by date:', err);
      setError(err);
      return null;
    }
  }, []);

  // Get department summary
  const getDepartmentSummary = useCallback((departmentId) => {
    return teamsService.getDepartmentSummary(kpiData, departmentId);
  }, [kpiData]);

  // Get team analytics
  const getTeamAnalytics = useCallback((departmentId) => {
    return teamsService.getTeamAnalytics(kpiData, departmentId);
  }, [kpiData]);

  // Get latest KPI value
  const getLatestKPIValue = useCallback((kpiId) => {
    return teamsService.getLatestKPIValue(kpiData, kpiId);
  }, [kpiData]);

  // Refresh data manually
  const refreshData = useCallback(() => {
    return fetchKPIData();
  }, [fetchKPIData]);

  return {
    kpiData,
    isLoading,
    error,
    updateKPIValue,
    getDepartmentSummary,
    getTeamAnalytics,
    getLatestKPIValue,
    refreshData,
    // NEW: Date-specific queries
    getAttendanceByDate,
    getOperatorEfficiencyByDate,
    getSafetyIncidentsByDate
  };
};