import { supabase } from '../lib/supabase';

// R&D Service for handling all R&D module operations
export class RnDService {
  
  // Save product development time KPI data
  static async saveProductDevelopmentTime(departmentId, kpiData, notes = '') {
    try {
      const reportingMonth = new Date(kpiData.date);
      reportingMonth.setDate(1); // Set to first day of month
      
      // First, check if entry already exists for this month
      const { data: existing } = await supabase
        .from('rnd_product_development_time')
        .select('id')
        .eq('rnd_id', departmentId)
        .eq('reporting_month', reportingMonth.toISOString().split('T')[0])
        .single();

      let summaryData;
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('rnd_product_development_time')
          .update({
            value_pct: kpiData.value,
            monthly_target: kpiData.monthlyTarget,
            stats_json: kpiData.stats,
            products_json: kpiData.products
          })
          .eq('id', existing.id)
          .select()
          .single();
          
        if (error) throw error;
        summaryData = data;
        
        // Delete existing project records for this summary
        await supabase
          .from('rnd_product_projects')
          .delete()
          .eq('pdt_summary_id', existing.id);
          
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('rnd_product_development_time')
          .insert({
            rnd_id: departmentId,
            reporting_month: reportingMonth.toISOString().split('T')[0],
            value_pct: kpiData.value,
            monthly_target: kpiData.monthlyTarget,
            stats_json: kpiData.stats,
            products_json: kpiData.products
          })
          .select()
          .single();
          
        if (error) throw error;
        summaryData = data;
      }
      
      // Insert individual project records
      if (kpiData.products && kpiData.products.length > 0) {
        const projectRecords = kpiData.products.map(product => ({
          pdt_summary_id: summaryData.id,
          product_name: product.nom,
          project_type: product.type,
          start_date: product.dateDebut,
          end_date: product.dateFin,
          dev_weeks: product.semainesDeveloppement || 0,
          is_completed: product.estTermine || false,
          completion_date: product.dateTerminaison ? product.dateTerminaison.split('T')[0] : null
        }));
        
        const { error: projectsError } = await supabase
          .from('rnd_product_projects')
          .insert(projectRecords);
          
        if (projectsError) {
          console.warn('Failed to insert project records:', projectsError);
        }
      }
      
      return summaryData;
      
    } catch (error) {
      console.error('Error saving product development time:', error);
      throw error;
    }
  }
  
  // Get latest KPI value for a specific metric
  static async getLatestKPIValue(departmentId, kpiId) {
    try {
      if (kpiId === 'product_development_time') {
        const { data, error } = await supabase
          .from('rnd_product_development_time')
          .select('*')
          .eq('rnd_id', departmentId)
          .order('reporting_month', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (!data) return null;
        
        return {
          value: data.value_pct,
          date: data.reporting_month,
          data: {
            monthlyTarget: data.monthly_target,
            stats: data.stats_json,
            products: data.products_json
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting latest KPI value:', error);
      throw error;
    }
  }
  
  // NEW: Get KPI value for a specific month
  static async getKPIValueForMonth(departmentId, kpiId, targetDate) {
    try {
      if (kpiId === 'product_development_time') {
        // Convert target date to first day of month
        const targetMonth = new Date(targetDate);
        targetMonth.setDate(1);
        const monthKey = targetMonth.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('rnd_product_development_time')
          .select('*')
          .eq('rnd_id', departmentId)
          .eq('reporting_month', monthKey)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (!data) return null;
        
        return {
          value: data.value_pct,
          date: data.reporting_month,
          data: {
            monthlyTarget: data.monthly_target,
            stats: data.stats_json,
            products: data.products_json
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting KPI value for month:', error);
      return null;
    }
  }
  
  // Get KPI history for a specific metric
  static async getKPIHistory(departmentId, kpiId, limit = 50) {
    try {
      if (kpiId === 'product_development_time') {
        const { data, error } = await supabase
          .from('rnd_product_development_time')
          .select('*')
          .eq('rnd_id', departmentId)
          .order('reporting_month', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        return data.map(record => ({
          value: record.value_pct,
          date: record.reporting_month,
          data: {
            monthlyTarget: record.monthly_target,
            stats: record.stats_json,
            products: record.products_json
          },
          notes: '' // Notes not stored in this version
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting KPI history:', error);
      return [];
    }
  }
  
  // Get KPI status based on latest value and target
  static async getKPIStatus(departmentId, kpiId) {
    try {
      const latest = await this.getLatestKPIValue(departmentId, kpiId);
      if (!latest) return 'no-data';
      
      const value = latest.value;
      const target = latest.data?.monthlyTarget || 80;
      
      if (value >= 95) return 'excellent';
      if (value >= target) return 'good';
      if (value >= target * 0.8) return 'fair';
      return 'needs-attention';
      
    } catch (error) {
      console.error('Error getting KPI status:', error);
      return 'no-data';
    }
  }
  
  // Get KPI trend (last N entries)
  static async getKPITrend(departmentId, kpiId, limit = 10) {
    try {
      const history = await this.getKPIHistory(departmentId, kpiId, limit);
      return history.reverse(); // Return chronological order for trend
    } catch (error) {
      console.error('Error getting KPI trend:', error);
      return [];
    }
  }
  
  // Get department summary
  static async getDepartmentSummary(departmentId) {
    try {
      const kpis = ['product_development_time'];
      const summary = {
        totalKPIs: kpis.length,
        withData: 0,
        excellent: 0,
        good: 0,
        fair: 0,
        needsAttention: 0,
        noData: 0,
        averageScore: 0
      };
      
      let totalScore = 0;
      let scoredKPIs = 0;
      
      for (const kpiId of kpis) {
        const latest = await this.getLatestKPIValue(departmentId, kpiId);
        const status = await this.getKPIStatus(departmentId, kpiId);
        
        if (latest) {
          summary.withData++;
          totalScore += latest.value;
          scoredKPIs++;
        }
        
        switch (status) {
          case 'excellent':
            summary.excellent++;
            break;
          case 'good':
            summary.good++;
            break;
          case 'fair':
            summary.fair++;
            break;
          case 'needs-attention':
            summary.needsAttention++;
            break;
          default:
            summary.noData++;
        }
      }
      
      summary.averageScore = scoredKPIs > 0 ? Math.round(totalScore / scoredKPIs) : 0;
      
      return summary;
    } catch (error) {
      console.error('Error getting department summary:', error);
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
  }
  
  // Get R&D analytics data
  static async getRnDAnalytics() {
    try {
      const history = await this.getKPIHistory('rnd', 'product_development_time');
      return {
        product_development_time: history
      };
    } catch (error) {
      console.error('Error getting R&D analytics:', error);
      return {
        product_development_time: []
      };
    }
  }
  
  // Get all projects for analysis
  static async getAllProjects(departmentId) {
    try {
      const { data, error } = await supabase
        .from('rnd_product_projects')
        .select(`
          *,
          rnd_product_development_time!inner(rnd_id)
        `)
        .eq('rnd_product_development_time.rnd_id', departmentId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all projects:', error);
      return [];
    }
  }
  
  // NEW: Get projects for a specific month
  static async getProjectsForMonth(departmentId, targetDate) {
    try {
      // Convert target date to first day of month
      const targetMonth = new Date(targetDate);
      targetMonth.setDate(1);
      const monthKey = targetMonth.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('rnd_product_projects')
        .select(`
          *,
          rnd_product_development_time!inner(rnd_id, reporting_month)
        `)
        .eq('rnd_product_development_time.rnd_id', departmentId)
        .eq('rnd_product_development_time.reporting_month', monthKey)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting projects for month:', error);
      return [];
    }
  }
  
  // NEW: Check if data exists for a specific month
  static async hasDataForMonth(departmentId, kpiId, targetDate) {
    try {
      if (kpiId === 'product_development_time') {
        const targetMonth = new Date(targetDate);
        targetMonth.setDate(1);
        const monthKey = targetMonth.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('rnd_product_development_time')
          .select('id')
          .eq('rnd_id', departmentId)
          .eq('reporting_month', monthKey)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        return data !== null;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking data for month:', error);
      return false;
    }
  }
  
  // General update KPI value method (wrapper for backwards compatibility)
  static async updateKPIValue(departmentId, kpiId, dataObject, notes = '') {
    try {
      if (kpiId === 'product_development_time') {
        return await this.saveProductDevelopmentTime(departmentId, dataObject, notes);
      }
      
      throw new Error(`Unknown KPI ID: ${kpiId}`);
    } catch (error) {
      console.error('Error updating KPI value:', error);
      throw error;
    }
  }
}