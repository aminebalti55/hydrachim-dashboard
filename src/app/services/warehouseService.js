import { supabase } from '../lib/supabase'

export class WarehouseService {
  // Initialize warehouse if it doesn't exist
  static async initializeWarehouse() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('id')
      .eq('id', 'warehouses')
      .single()

    if (error && error.code === 'PGRST116') {
      // Warehouse doesn't exist, create it
      const { error: insertError } = await supabase
        .from('warehouses')
        .insert({
          id: 'warehouses',
          name: 'Entrepôts & Logistique'
        })
      
      if (insertError) {
        console.error('Error creating warehouse:', insertError)
        throw insertError
      }
    } else if (error) {
      console.error('Error checking warehouse:', error)
      throw error
    }
  }

  // Cost Tracking Operations
  static async saveCostTracking(costData) {
    try {
      await this.initializeWarehouse()

      // Prepare the main cost tracking record
      const costTrackingData = {
        warehouse_id: 'warehouses',
        reporting_month: new Date(costData.date).toISOString().split('T')[0].slice(0, 7) + '-01',
        value_pct: costData.value,
        monthly_budget: costData.monthlyBudget,
        monthly_total: costData.monthlyTotal,
        stats_json: costData.stats,
        product_costs_json: costData.productCosts
      }

      // Insert main cost tracking record
      const { data: trackingData, error: trackingError } = await supabase
        .from('warehouse_cost_tracking')
        .insert(costTrackingData)
        .select('id')
        .single()

      if (trackingError) throw trackingError

      // Prepare product costs for insertion
      if (costData.productCosts && Object.keys(costData.productCosts).length > 0) {
        const productCostRecords = Object.entries(costData.productCosts).map(([key, productData]) => ({
          cost_tracking_id: trackingData.id,
          product_name: productData.productName,
          category: productData.category,
          cost: productData.cost || 0,
          quantity: productData.quantity || 1,
          unit: productData.unit || 'kg',
          last_updated: productData.lastUpdated
        }))

        const { error: productError } = await supabase
          .from('warehouse_product_costs')
          .insert(productCostRecords)

        if (productError) throw productError
      }

      return { success: true, data: trackingData }
    } catch (error) {
      console.error('Error saving cost tracking:', error)
      throw error
    }
  }

  static async getCostTrackingHistory(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('warehouse_cost_tracking')
        .select(`
          *,
          warehouse_product_costs (*)
        `)
        .eq('warehouse_id', 'warehouses')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map(record => ({
        id: record.id,
        date: record.created_at,
        value: record.value_pct,
        data: {
          monthlyBudget: record.monthly_budget,
          monthlyTotal: record.monthly_total,
          totalCost: record.monthly_total,
          budgetedCost: record.monthly_budget,
          budgetVariance: record.monthly_total - record.monthly_budget,
          stats: record.stats_json,
          productCosts: record.product_costs_json,
          type: 'cost_tracking'
        },
        notes: `Budget: ${record.monthly_budget?.toLocaleString()} DT - Total: ${record.monthly_total?.toLocaleString()} DT`,
        productCosts: record.warehouse_product_costs || []
      }))
    } catch (error) {
      console.error('Error fetching cost tracking history:', error)
      throw error
    }
  }

  static async getLatestCostTracking() {
    try {
      const { data, error } = await supabase
        .from('warehouse_cost_tracking')
        .select(`
          *,
          warehouse_product_costs (*)
        `)
        .eq('warehouse_id', 'warehouses')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (!data) return null

      return {
        id: data.id,
        date: data.created_at,
        value: data.value_pct,
        data: {
          monthlyBudget: data.monthly_budget,
          monthlyTotal: data.monthly_total,
          stats: data.stats_json,
          productCosts: data.product_costs_json,
          type: 'cost_tracking'
        },
        notes: `Budget: ${data.monthly_budget?.toLocaleString()} DT - Total: ${data.monthly_total?.toLocaleString()} DT`,
        productCosts: data.warehouse_product_costs || []
      }
    } catch (error) {
      console.error('Error fetching latest cost tracking:', error)
      throw error
    }
  }

  // Stock Issues Operations
  static async saveStockIssues(issuesData) {
    try {
      await this.initializeWarehouse()

      // Prepare the main stock issues summary record
      const summaryData = {
        warehouse_id: 'warehouses',
        reporting_month: new Date(issuesData.date).toISOString().split('T')[0].slice(0, 7) + '-01',
        value_pct: issuesData.value,
        monthly_goal: issuesData.monthlyGoal,
        current_month_count: issuesData.currentMonthCount,
        stock_issues_json: issuesData.stockIssues
      }

      // Insert main summary record
      const { data: summaryRecord, error: summaryError } = await supabase
        .from('warehouse_stock_issues_summary')
        .insert(summaryData)
        .select('id')
        .single()

      if (summaryError) throw summaryError

      // Prepare individual issue details for insertion
      if (issuesData.stockIssues && issuesData.stockIssues.length > 0) {
        const issueDetailRecords = issuesData.stockIssues.map(issue => ({
          stock_summary_id: summaryRecord.id,
          issue_date: issue.date,
          issue_time: issue.time,
          notes: issue.notes
        }))

        const { error: detailsError } = await supabase
          .from('warehouse_stock_issue_details')
          .insert(issueDetailRecords)

        if (detailsError) throw detailsError
      }

      return { success: true, data: summaryRecord }
    } catch (error) {
      console.error('Error saving stock issues:', error)
      throw error
    }
  }

  static async getStockIssuesHistory(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('warehouse_stock_issues_summary')
        .select(`
          *,
          warehouse_stock_issue_details (*)
        `)
        .eq('warehouse_id', 'warehouses')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map(record => ({
        id: record.id,
        date: record.created_at,
        value: record.value_pct,
        data: {
          monthlyGoal: record.monthly_goal,
          stockIssues: record.stock_issues_json,
          currentMonthCount: record.current_month_count,
          type: 'stock_issues'
        },
        notes: `${record.current_month_count} problèmes ce mois (objectif: ≤${record.monthly_goal})`,
        issueDetails: record.warehouse_stock_issue_details || []
      }))
    } catch (error) {
      console.error('Error fetching stock issues history:', error)
      throw error
    }
  }

  static async getLatestStockIssues() {
    try {
      const { data, error } = await supabase
        .from('warehouse_stock_issues_summary')
        .select(`
          *,
          warehouse_stock_issue_details (*)
        `)
        .eq('warehouse_id', 'warehouses')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (!data) return null

      return {
        id: data.id,
        date: data.created_at,
        value: data.value_pct,
        data: {
          monthlyGoal: data.monthly_goal,
          stockIssues: data.stock_issues_json,
          currentMonthCount: data.current_month_count,
          type: 'stock_issues'
        },
        notes: `${data.current_month_count} problèmes ce mois (objectif: ≤${data.monthly_goal})`,
        issueDetails: data.warehouse_stock_issue_details || []
      }
    } catch (error) {
      console.error('Error fetching latest stock issues:', error)
      throw error
    }
  }

  // Analytics and Reporting
  static async getAnalyticsData(months = 12) {
    try {
      const monthsAgo = new Date()
      monthsAgo.setMonth(monthsAgo.getMonth() - months)
      const startDate = monthsAgo.toISOString().split('T')[0]

      // Get cost tracking data
      const { data: costData, error: costError } = await supabase
        .from('warehouse_cost_tracking')
        .select('*')
        .eq('warehouse_id', 'warehouses')
        .gte('reporting_month', startDate)
        .order('reporting_month', { ascending: false })

      if (costError) throw costError

      // Get stock issues data
      const { data: stockData, error: stockError } = await supabase
        .from('warehouse_stock_issues_summary')
        .select('*')
        .eq('warehouse_id', 'warehouses')
        .gte('reporting_month', startDate)
        .order('reporting_month', { ascending: false })

      if (stockError) throw stockError

      return {
        cost_per_formulation: costData.map(record => ({
          date: record.reporting_month,
          value: record.value_pct,
          data: {
            totalCost: record.monthly_total,
            budgetedCost: record.monthly_budget,
            budgetVariance: record.monthly_total - record.monthly_budget,
            stats: record.stats_json
          }
        })),
        stock_issues_rate: stockData.map(record => ({
          date: record.reporting_month,
          value: record.value_pct,
          data: {
            currentMonthCount: record.current_month_count,
            monthlyGoal: record.monthly_goal,
            stockIssues: record.stock_issues_json
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      throw error
    }
  }

  // General KPI Operations
  static async getKPIHistory(kpiType, limit = 50) {
    try {
      if (kpiType === 'cost_per_formulation') {
        return await this.getCostTrackingHistory(limit)
      } else if (kpiType === 'stock_issues_rate') {
        return await this.getStockIssuesHistory(limit)
      }
      return []
    } catch (error) {
      console.error(`Error fetching KPI history for ${kpiType}:`, error)
      throw error
    }
  }

  static async getLatestKPIValue(kpiType) {
    try {
      if (kpiType === 'cost_per_formulation') {
        return await this.getLatestCostTracking()
      } else if (kpiType === 'stock_issues_rate') {
        return await this.getLatestStockIssues()
      }
      return null
    } catch (error) {
      console.error(`Error fetching latest KPI value for ${kpiType}:`, error)
      throw error
    }
  }

  static async saveKPIValue(kpiType, value, notes, additionalData) {
    try {
      if (kpiType === 'cost_per_formulation') {
        return await this.saveCostTracking(additionalData)
      } else if (kpiType === 'stock_issues_rate') {
        return await this.saveStockIssues(additionalData)
      }
      throw new Error(`Unsupported KPI type: ${kpiType}`)
    } catch (error) {
      console.error(`Error saving KPI value for ${kpiType}:`, error)
      throw error
    }
  }

  // Dashboard Summary
  static async getDashboardSummary() {
    try {
      const [latestCost, latestStock] = await Promise.all([
        this.getLatestCostTracking(),
        this.getLatestStockIssues()
      ])

      return {
        cost_per_formulation: latestCost,
        stock_issues_rate: latestStock,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  }
}