import { useState, useEffect, useCallback } from 'react';
import productionService from '../services/productionService';

/**
 * Custom hook for managing production KPI data with Supabase integration
 */
export const useProductionData = () => {
  const [productionData, setProductionData] = useState({
    energy_consumption: [],
    mixing_time: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  const loadProductionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productionService.getAllProductionData();
      setProductionData(data);
    } catch (err) {
      console.error('Error loading production data:', err);
      setError(err.message || 'Failed to load production data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadProductionData();
  }, [loadProductionData]);

  // Update KPI value (compatible with existing interface)
  const updateKPIValue = useCallback(async (departmentId, kpiId, value, notes = '') => {
    if (departmentId !== 'production') {
      throw new Error('This hook only handles production department');
    }

    try {
      setIsUpdating(true);
      setError(null);

      let result;
      if (kpiId === 'energy_consumption') {
        result = await productionService.saveEnergyConsumption({
          value: value.value || value,
          date: value.date || new Date().toISOString().split('T')[0],
          data: value,
          notes
        });
      } else if (kpiId === 'mixing_time') {
        result = await productionService.saveMixingTime({
          value: value.value || value,
          date: value.date || new Date().toISOString().split('T')[0],
          data: value,
          notes
        });
      } else {
        throw new Error(`Unsupported KPI type: ${kpiId}`);
      }

      // Reload data to get fresh state
      await loadProductionData();
      return result;
    } catch (err) {
      console.error('Error updating KPI value:', err);
      setError(err.message || 'Failed to update KPI');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [loadProductionData]);

  // Get KPI history (compatible with existing interface)
  const getKPIHistory = useCallback((departmentId, kpiId) => {
    if (departmentId !== 'production') {
      return [];
    }

    const data = productionData[kpiId] || [];
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productionData]);

  // Get KPI trend (compatible with existing interface)
  const getKPITrend = useCallback((departmentId, kpiId, limit = 10) => {
    if (departmentId !== 'production') {
      return [];
    }

    const history = getKPIHistory(departmentId, kpiId);
    return history
      .slice(0, limit)
      .map(entry => ({
        date: entry.date,
        value: entry.value,
        kpi: kpiId
      }))
      .reverse(); // Show oldest to newest for trends
  }, [getKPIHistory]);

  // Get latest KPI value (compatible with existing interface)
  const getLatestKPIValue = useCallback((departmentId, kpiId) => {
    if (departmentId !== 'production') {
      return null;
    }

    const history = getKPIHistory(departmentId, kpiId);
    return history.length > 0 ? history[0] : null;
  }, [getKPIHistory]);

  // Get department summary (compatible with existing interface)
  const getDepartmentSummary = useCallback((departmentId) => {
    if (departmentId !== 'production') {
      return {
        totalKPIs: 0,
        activeKPIs: 0,
        averagePerformance: 0,
        lastUpdated: null
      };
    }

    const energyData = productionData.energy_consumption || [];
    const mixingData = productionData.mixing_time || [];
    
    const allData = [...energyData, ...mixingData];
    const totalKPIs = 2; // energy_consumption and mixing_time
    const activeKPIs = (energyData.length > 0 ? 1 : 0) + (mixingData.length > 0 ? 1 : 0);
    
    const averagePerformance = allData.length > 0 
      ? allData.reduce((sum, entry) => sum + entry.value, 0) / allData.length 
      : 0;
    
    const lastUpdated = allData.length > 0 
      ? allData.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0].createdAt || allData[0].date
      : null;

    return {
      totalKPIs,
      activeKPIs,
      averagePerformance: Math.round(averagePerformance),
      lastUpdated
    };
  }, [productionData]);

  // Get production analytics for reports
  const getProductionAnalytics = useCallback(async (startDate = null, endDate = null) => {
    try {
      setError(null);
      return await productionService.getProductionAnalytics(startDate, endDate);
    } catch (err) {
      console.error('Error fetching production analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
      throw err;
    }
  }, []);

  // Delete KPI entry
  const deleteKPIEntry = useCallback(async (kpiId, entryId) => {
    try {
      setIsUpdating(true);
      setError(null);

      if (kpiId === 'energy_consumption') {
        await productionService.deleteEnergyConsumption(entryId);
      } else if (kpiId === 'mixing_time') {
        await productionService.deleteMixingTime(entryId);
      } else {
        throw new Error(`Unsupported KPI type: ${kpiId}`);
      }

      // Reload data
      await loadProductionData();
    } catch (err) {
      console.error('Error deleting KPI entry:', err);
      setError(err.message || 'Failed to delete entry');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [loadProductionData]);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await loadProductionData();
  }, [loadProductionData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    kpiData: productionData,
    productionData,
    
    // States
    isLoading,
    isUpdating,
    error,
    
    // Methods (compatible with existing useKPIData interface)
    updateKPIValue,
    getKPIHistory,
    getKPITrend,
    getLatestKPIValue,
    getDepartmentSummary,
    
    // Additional production-specific methods
    getProductionAnalytics,
    deleteKPIEntry,
    refreshData,
    clearError,
    
    // Utility methods
    hasData: () => {
      const energyData = productionData.energy_consumption || [];
      const mixingData = productionData.mixing_time || [];
      return energyData.length > 0 || mixingData.length > 0;
    },
    
    getLastUpdateTime: () => {
      const energyData = productionData.energy_consumption || [];
      const mixingData = productionData.mixing_time || [];
      const allData = [...energyData, ...mixingData];
      
      if (allData.length === 0) return null;
      
      return allData
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0]
        .createdAt || allData[0].date;
    }
  };
};