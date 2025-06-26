import { supabase } from '../lib/supabase';

/**
 * Production Service - handles all production KPI database operations
 */
class ProductionService {
  
  /**
   * Energy Consumption Operations
   */
  
  // Save energy consumption data
  async saveEnergyConsumption(energyData) {
    try {
      const { stats, monthlyElectricityTarget, monthlyWaterTarget, monthlyBudget, consumptionEntries } = energyData.data || {};
      // Format date as YYYY-MM-01 for monthly data (matching warehouse service pattern)
      const reportingMonth = new Date(energyData.date).toISOString().split('T')[0].slice(0, 7) + '-01';
      
      // Ensure stats is never null (database requires NOT NULL)
      const safeStats = stats || {
        overallKPI: energyData.value,
        monthlyElectricityTarget: monthlyElectricityTarget || 0,
        monthlyWaterTarget: monthlyWaterTarget || 0,
        monthlyBudget: monthlyBudget || 0,
        consumptionEntries: consumptionEntries || [],
        createdAt: new Date().toISOString()
      };
      
      // Check if record exists for this month
      const { data: existingRecord, error: checkError } = await supabase
        .from('production_energy_consumption')
        .select('id')
        .eq('reporting_month', reportingMonth)
        .single();

      let energyRecord;
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { data: updatedRecord, error: updateError } = await supabase
          .from('production_energy_consumption')
          .update({
            overall_kpi: energyData.value,
            monthly_electricity_target: monthlyElectricityTarget || null,
            monthly_water_target: monthlyWaterTarget || null,
            monthly_budget: monthlyBudget || null,
            stats: safeStats,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        energyRecord = updatedRecord;
      } else {
        // Insert new record
        const { data: newRecord, error: insertError } = await supabase
          .from('production_energy_consumption')
          .insert({
            reporting_month: reportingMonth,
            overall_kpi: energyData.value,
            monthly_electricity_target: monthlyElectricityTarget || null,
            monthly_water_target: monthlyWaterTarget || null,
            monthly_budget: monthlyBudget || null,
            stats: safeStats
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        energyRecord = newRecord;
      }

      // Delete existing entries for this month
      await supabase
        .from('production_energy_entries')
        .delete()
        .eq('energy_id', energyRecord.id);

      // Insert new consumption entries
      if (consumptionEntries && consumptionEntries.length > 0) {
        const entriesData = consumptionEntries.map(entry => ({
          energy_id: energyRecord.id,
          entry_date: entry.date,
          entry_time: entry.time,
          entry_type: entry.type,
          consumption: entry.consumption,
          bill_amount: entry.billAmount,
          notes: entry.notes,
          bill_period_start: entry.billPeriodStart || null,
          bill_period_end: entry.billPeriodEnd || null
        }));

        const { error: entriesError } = await supabase
          .from('production_energy_entries')
          .insert(entriesData);

        if (entriesError) throw entriesError;
      }

      return energyRecord;
    } catch (error) {
      console.error('Error saving energy consumption:', error);
      throw error;
    }
  }

  // Get energy consumption data
  async getEnergyConsumption() {
    try {
      const { data, error } = await supabase
        .from('production_energy_consumption')
        .select(`
          *,
          production_energy_entries (*)
        `)
        .order('reporting_month', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      return data.map(record => ({
        id: 'energy_consumption',
        value: record.overall_kpi,
        date: record.reporting_month,
        data: {
          monthlyElectricityTarget: record.monthly_electricity_target,
          monthlyWaterTarget: record.monthly_water_target,
          monthlyBudget: record.monthly_budget,
          consumptionEntries: record.production_energy_entries.map(entry => ({
            id: entry.id,
            date: entry.entry_date,
            time: entry.entry_time,
            type: entry.entry_type,
            consumption: entry.consumption,
            billAmount: entry.bill_amount,
            notes: entry.notes,
            billPeriodStart: entry.bill_period_start,
            billPeriodEnd: entry.bill_period_end,
            createdAt: entry.created_at
          })),
          stats: record.stats
        },
        createdAt: record.created_at
      }));
    } catch (error) {
      if (error.code === 'PGRST116') {
        // No data found, return empty array
        return [];
      }
      console.error('Error fetching energy consumption:', error);
      throw error;
    }
  }

  /**
   * Mixing Time Operations
   */

  // Save mixing time data
  async saveMixingTime(mixingData) {
    try {
      const reportingDate = mixingData.date;
      
      // Ensure stats is never null (database requires NOT NULL)
      const safeStats = mixingData.data || {
        value: mixingData.value,
        stats: {
          averageTime: null,
          totalBatches: 0,
          optimalBatches: 0,
          efficiency: null
        },
        createdAt: new Date().toISOString()
      };
      
      // Check if record exists for this date
      const { data: existingRecord, error: checkError } = await supabase
        .from('production_mixing_time')
        .select('id')
        .eq('reporting_date', reportingDate)
        .single();

      let mixingRecord;
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { data: updatedRecord, error: updateError } = await supabase
          .from('production_mixing_time')
          .update({
            performance_kpi: mixingData.value,
            avg_time_minutes: mixingData.data?.stats?.averageTime || null,
            total_batches: mixingData.data?.stats?.totalBatches || 0,
            optimal_batches: mixingData.data?.stats?.optimalBatches || 0,
            efficiency_percent: mixingData.data?.stats?.efficiency || null,
            stats: safeStats,
            notes: mixingData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        mixingRecord = updatedRecord;
      } else {
        // Insert new record
        const { data: newRecord, error: insertError } = await supabase
          .from('production_mixing_time')
          .insert({
            reporting_date: reportingDate,
            performance_kpi: mixingData.value,
            avg_time_minutes: mixingData.data?.stats?.averageTime || null,
            total_batches: mixingData.data?.stats?.totalBatches || 0,
            optimal_batches: mixingData.data?.stats?.optimalBatches || 0,
            efficiency_percent: mixingData.data?.stats?.efficiency || null,
            stats: safeStats,
            notes: mixingData.notes || null
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        mixingRecord = newRecord;
      }

      return mixingRecord;
    } catch (error) {
      console.error('Error saving mixing time:', error);
      throw error;
    }
  }

  // Get mixing time data
  async getMixingTime() {
    try {
      const { data, error } = await supabase
        .from('production_mixing_time')
        .select('*')
        .order('reporting_date', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      return data.map(record => ({
        id: 'mixing_time',
        value: record.performance_kpi,
        date: record.reporting_date,
        data: {
          stats: {
            averageTime: record.avg_time_minutes,
            totalBatches: record.total_batches,
            optimalBatches: record.optimal_batches,
            efficiency: record.efficiency_percent,
            ...record.stats
          }
        },
        notes: record.notes,
        createdAt: record.created_at
      }));
    } catch (error) {
      if (error.code === 'PGRST116') {
        // No data found, return empty array
        return [];
      }
      console.error('Error fetching mixing time:', error);
      throw error;
    }
  }

  /**
   * General Operations
   */

  // Get all production data
  async getAllProductionData() {
    try {
      const [energyData, mixingData] = await Promise.all([
        this.getEnergyConsumption(),
        this.getMixingTime()
      ]);

      return {
        energy_consumption: energyData,
        mixing_time: mixingData
      };
    } catch (error) {
      console.error('Error fetching all production data:', error);
      throw error;
    }
  }

  // Delete energy consumption record
  async deleteEnergyConsumption(id) {
    try {
      const { error } = await supabase
        .from('production_energy_consumption')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting energy consumption:', error);
      throw error;
    }
  }

  // Delete mixing time record
  async deleteMixingTime(id) {
    try {
      const { error } = await supabase
        .from('production_mixing_time')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting mixing time:', error);
      throw error;
    }
  }

  /**
   * Analytics and Reporting
   */

  // Get production analytics for reports
  async getProductionAnalytics(startDate = null, endDate = null) {
    try {
      const analytics = await this.getAllProductionData();
      
      if (startDate && endDate) {
        // Filter data by date range if provided
        analytics.energy_consumption = analytics.energy_consumption.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
        
        analytics.mixing_time = analytics.mixing_time.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
      }

      return analytics;
    } catch (error) {
      console.error('Error fetching production analytics:', error);
      throw error;
    }
  }

  // Get KPI trends for charting
  async getKPITrends(kpiType, limit = 10) {
    try {
      let data;
      if (kpiType === 'energy_consumption') {
        data = await this.getEnergyConsumption();
      } else if (kpiType === 'mixing_time') {
        data = await this.getMixingTime();
      } else {
        throw new Error('Invalid KPI type');
      }

      return data
        .slice(0, limit)
        .map(entry => ({
          date: entry.date,
          value: entry.value,
          kpi: kpiType
        }))
        .reverse(); // Show oldest to newest for trends
    } catch (error) {
      console.error('Error fetching KPI trends:', error);
      throw error;
    }
  }
}

export default new ProductionService();