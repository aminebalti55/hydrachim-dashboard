import { useState, useEffect, useCallback } from 'react'
import { WarehouseService } from '../services/warehouseService'

export const useWarehouseData = () => {
  const [data, setData] = useState({
    cost_per_formulation: [],
    stock_issues_rate: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [costHistory, stockHistory] = await Promise.all([
        WarehouseService.getCostTrackingHistory(),
        WarehouseService.getStockIssuesHistory()
      ])

      setData({
        cost_per_formulation: costHistory,
        stock_issues_rate: stockHistory
      })
    } catch (err) {
      console.error('Error loading warehouse data:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Update KPI Value
  const updateKPIValue = useCallback(async (departmentId, kpiId, value, notes, additionalData) => {
    try {
      setError(null)
      
      // Save to Supabase
      await WarehouseService.saveKPIValue(kpiId, value, notes, additionalData)
      
      // Reload data to get fresh state
      await loadData()
      
      return { success: true }
    } catch (err) {
      console.error('Error updating KPI value:', err)
      setError(err.message)
      throw err
    }
  }, [loadData])

  // Get KPI History
  const getKPIHistory = useCallback((departmentId, kpiId, limit = 50) => {
    if (kpiId === 'cost_per_formulation') {
      return data.cost_per_formulation.slice(0, limit)
    } else if (kpiId === 'stock_issues_rate') {
      return data.stock_issues_rate.slice(0, limit)
    }
    return []
  }, [data])

  // Get Latest KPI Value
  const getLatestKPIValue = useCallback((departmentId, kpiId) => {
    const history = getKPIHistory(departmentId, kpiId, 1)
    return history.length > 0 ? history[0] : null
  }, [getKPIHistory])

  // Get KPI Trend (last N entries)
  const getKPITrend = useCallback((departmentId, kpiId, count = 10) => {
    const history = getKPIHistory(departmentId, kpiId, count)
    return history.map(entry => ({
      date: entry.date,
      value: entry.value,
      kpi: kpiId
    })).reverse() // Return in chronological order for trends
  }, [getKPIHistory])

  // Get Department Summary
  const getDepartmentSummary = useCallback((departmentId) => {
    const costLatest = getLatestKPIValue(departmentId, 'cost_per_formulation')
    const stockLatest = getLatestKPIValue(departmentId, 'stock_issues_rate')
    
    let overallScore = 0
    let count = 0

    if (costLatest) {
      overallScore += costLatest.value
      count++
    }
    
    if (stockLatest) {
      overallScore += stockLatest.value
      count++
    }

    return {
      departmentId,
      overallScore: count > 0 ? Math.round(overallScore / count) : 0,
      kpiCount: count,
      lastUpdated: costLatest?.date || stockLatest?.date || null,
      kpis: {
        cost_per_formulation: costLatest,
        stock_issues_rate: stockLatest
      }
    }
  }, [getLatestKPIValue])

  // Get Analytics Data for Reports
  const getAnalyticsData = useCallback(async (months = 12) => {
    try {
      return await WarehouseService.getAnalyticsData(months)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError(err.message)
      return {
        cost_per_formulation: [],
        stock_issues_rate: []
      }
    }
  }, [])

  // Get Dashboard Summary
  const getDashboardSummary = useCallback(async () => {
    try {
      return await WarehouseService.getDashboardSummary()
    } catch (err) {
      console.error('Error fetching dashboard summary:', err)
      setError(err.message)
      return null
    }
  }, [])

  // Refresh data manually
  const refreshData = useCallback(() => {
    return loadData()
  }, [loadData])

  return {
    // Data
    kpiData: data,
    isLoading,
    error,

    // Core functions (compatible with existing useKPIData interface)
    updateKPIValue,
    getKPIHistory,
    getLatestKPIValue,
    getKPITrend,
    getDepartmentSummary,

    // Extended functions
    getAnalyticsData,
    getDashboardSummary,
    refreshData,

    // Service access (for advanced use cases)
    service: WarehouseService
  }
}