import { useState, useEffect, useCallback } from 'react';
import { qualityService } from '../services/qualityService';

export const useQualityData = () => {
  const [qualityData, setQualityData] = useState({
    material_batch_acceptance_rate: [],
    production_waste_rate: [],
    raw_materials_inventory_list: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const loadQualityData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analytics = await qualityService.getQualityAnalytics();
      setQualityData(analytics);
    } catch (err) {
      console.error('Error loading quality data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadQualityData();
  }, [loadQualityData]);

  // ============================================================================
  // KPI UPDATE METHODS
  // ============================================================================

  const updateKPIValue = useCallback(async (departmentId, kpiId, kpiData, notes) => {
    try {
      setError(null);
      
      // Add notes to the data if provided
      const dataWithNotes = { ...kpiData };
      if (notes) {
        dataWithNotes.notes = notes;
      }

      let result = null;
      
      switch (kpiId) {
        case 'material_batch_acceptance_rate':
          result = await qualityService.saveMaterialBatchAcceptance(dataWithNotes);
          break;
        case 'production_waste_rate':
          result = await qualityService.saveProductionWaste(dataWithNotes);
          break;
        case 'raw_materials_inventory_list':
          result = await qualityService.saveInventoryQuality(dataWithNotes);
          break;
        default:
          throw new Error(`Unknown KPI ID: ${kpiId}`);
      }

      // Reload data to get fresh state
      await loadQualityData();
      
      return result;
    } catch (err) {
      console.error('Error updating KPI value:', err);
      setError(err.message);
      throw err;
    }
  }, [loadQualityData]);

  // ============================================================================
  // DATA ACCESS METHODS
  // ============================================================================

  const getKPIHistory = useCallback((departmentId, kpiId) => {
    if (departmentId !== 'quality') return [];
    
    return qualityData[kpiId] || [];
  }, [qualityData]);

  const getLatestKPIValue = useCallback((departmentId, kpiId) => {
    if (departmentId !== 'quality') return null;
    
    const history = qualityData[kpiId] || [];
    const latest = history[0]; // Data is already sorted by date desc
    
    return latest ? {
      value: latest.value,
      date: latest.date,
      data: latest,
      notes: latest.notes
    } : null;
  }, [qualityData]);

  const getKPIStatus = useCallback((departmentId, kpiId) => {
    const latestValue = getLatestKPIValue(departmentId, kpiId);
    if (!latestValue) return 'no-data';

    // Define targets for each KPI
    const targets = {
      'material_batch_acceptance_rate': 90,
      'production_waste_rate': 80,
      'raw_materials_inventory_list': 95
    };

    const target = targets[kpiId] || 80;
    const value = latestValue.value;

    if (value >= target) return 'excellent';
    if (value >= target * 0.9) return 'good';
    if (value >= target * 0.7) return 'needs-attention';
    return 'critical';
  }, [getLatestKPIValue]);

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  const getQualityAnalytics = useCallback(() => {
    return qualityData;
  }, [qualityData]);

  const getQualityStats = useCallback(() => {
    const allKPIs = ['material_batch_acceptance_rate', 'production_waste_rate', 'raw_materials_inventory_list'];
    
    const kpisWithData = allKPIs.filter(kpiId => {
      const history = qualityData[kpiId] || [];
      return history.length > 0;
    });

    const excellentKPIs = allKPIs.filter(kpiId => {
      const status = getKPIStatus('quality', kpiId);
      return status === 'excellent';
    });

    const needsAttentionKPIs = allKPIs.filter(kpiId => {
      const status = getKPIStatus('quality', kpiId);
      return status === 'needs-attention' || status === 'critical';
    });

    // Calculate overall efficiency
    let efficiency = 0;
    if (kpisWithData.length > 0) {
      const scores = kpisWithData.map(kpiId => {
        const status = getKPIStatus('quality', kpiId);
        switch (status) {
          case 'excellent': return 100;
          case 'good': return 80;
          case 'needs-attention': return 60;
          case 'critical': return 40;
          default: return 0;
        }
      });
      efficiency = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    return {
      totalKPIs: allKPIs.length,
      kpisWithData: kpisWithData.length,
      excellentKPIs: excellentKPIs.length,
      needsAttentionKPIs: needsAttentionKPIs.length,
      efficiency,
      lastUpdated: kpisWithData.length > 0 ? Math.max(
        ...kpisWithData.map(kpiId => {
          const latest = getLatestKPIValue('quality', kpiId);
          return latest ? new Date(latest.date).getTime() : 0;
        })
      ) : null
    };
  }, [qualityData, getKPIStatus, getLatestKPIValue]);

  // ============================================================================
  // REFRESH METHODS
  // ============================================================================

  const refreshData = useCallback(async () => {
    await loadQualityData();
  }, [loadQualityData]);

  const refreshKPIData = useCallback(async (kpiId) => {
    try {
      setError(null);
      const history = await qualityService.getKPIHistory(kpiId);
      
      setQualityData(prev => ({
        ...prev,
        [kpiId]: history
      }));
    } catch (err) {
      console.error(`Error refreshing KPI data for ${kpiId}:`, err);
      setError(err.message);
    }
  }, []);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Data
    qualityData,
    isLoading,
    error,
    
    // Core KPI methods
    updateKPIValue,
    getKPIHistory,
    getLatestKPIValue,
    getKPIStatus,
    
    // Analytics
    getQualityAnalytics,
    getQualityStats,
    
    // Refresh methods
    refreshData,
    refreshKPIData,
    
    // Utility
    hasData: Object.values(qualityData).some(arr => arr.length > 0)
  };
};