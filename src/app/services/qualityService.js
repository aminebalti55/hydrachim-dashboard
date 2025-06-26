import { supabase } from '../lib/supabase';

export const qualityService = {
  // ============================================================================
  // DEPARTMENT MANAGEMENT
  // ============================================================================
  
  async ensureQualityDepartment() {
    try {
      const { data, error } = await supabase
        .from('quality_departments')
        .select('*')
        .eq('id', 'quality')
        .single();

      if (error && error.code === 'PGRST116') {
        // Department doesn't exist, create it
        const { data: newDept, error: insertError } = await supabase
          .from('quality_departments')
          .insert([{ id: 'quality', name: 'Contrôle Qualité' }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newDept;
      }
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error ensuring quality department:', error);
      throw error;
    }
  },

  // ============================================================================
  // MATERIAL BATCH ACCEPTANCE RATE
  // ============================================================================
  
  async saveMaterialBatchAcceptance(kpiData) {
    try {
      await this.ensureQualityDepartment();
      
      const reportingMonth = new Date(kpiData.date);
      reportingMonth.setDate(1); // First day of month
      
      // Prepare main summary record
      const summaryData = {
        quality_id: 'quality',
        reporting_month: reportingMonth.toISOString().split('T')[0],
        value_pct: kpiData.value,
        monthly_target: kpiData.monthlyTarget,
        stats_json: kpiData.stats,
        receptions_json: kpiData.receptions
      };

      // Insert or update summary
      const { data: summary, error: summaryError } = await supabase
        .from('quality_material_batch_acceptance')
        .upsert(summaryData, {
          onConflict: 'quality_id,reporting_month',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (summaryError) throw summaryError;

      // Delete existing detail records for this month
      await supabase
        .from('quality_raw_material_receptions')
        .delete()
        .eq('acceptance_summary_id', summary.id);

      // Insert detail records
      if (kpiData.receptions && kpiData.receptions.length > 0) {
        const detailRecords = kpiData.receptions.map(reception => ({
          acceptance_summary_id: summary.id,
          reception_date: reception.date,
          reception_time: reception.time,
          product_name: reception.productName,
          product_type: reception.productType,
          quantity: reception.quantity,
          is_conforme: reception.isConforme
        }));

        const { error: detailError } = await supabase
          .from('quality_raw_material_receptions')
          .insert(detailRecords);

        if (detailError) throw detailError;
      }

      return summary;
    } catch (error) {
      console.error('Error saving material batch acceptance:', error);
      throw error;
    }
  },

  async getMaterialBatchAcceptanceHistory() {
    try {
      const { data, error } = await supabase
        .from('quality_material_batch_acceptance')
        .select(`
          *,
          quality_raw_material_receptions(*)
        `)
        .eq('quality_id', 'quality')
        .order('reporting_month', { ascending: false });

      if (error) throw error;
      
      return data.map(record => ({
        id: record.id,
        date: record.reporting_month,
        value: record.value_pct,
        monthlyTarget: record.monthly_target,
        stats: record.stats_json,
        receptions: record.receptions_json || [],
        detailReceptions: record.quality_raw_material_receptions || [],
        created_at: record.created_at
      }));
    } catch (error) {
      console.error('Error fetching material batch acceptance history:', error);
      throw error;
    }
  },

  // ============================================================================
  // PRODUCTION WASTE RATE
  // ============================================================================
  
  async saveProductionWaste(kpiData) {
    try {
      await this.ensureQualityDepartment();
      
      const reportingMonth = new Date(kpiData.date);
      reportingMonth.setDate(1); // First day of month
      
      // Prepare main summary record
      const summaryData = {
        quality_id: 'quality',
        reporting_month: reportingMonth.toISOString().split('T')[0],
        value_pct: kpiData.value,
        monthly_target: kpiData.monthlyTarget,
        stats_json: kpiData.stats,
        wasted_products_json: kpiData.wastedProducts
      };

      // Insert or update summary
      const { data: summary, error: summaryError } = await supabase
        .from('quality_production_waste')
        .upsert(summaryData, {
          onConflict: 'quality_id,reporting_month',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (summaryError) throw summaryError;

      // Delete existing detail records for this month
      await supabase
        .from('quality_wasted_products')
        .delete()
        .eq('waste_summary_id', summary.id);

      // Insert detail records
      if (kpiData.wastedProducts && kpiData.wastedProducts.length > 0) {
        const detailRecords = kpiData.wastedProducts.map(product => ({
          waste_summary_id: summary.id,
          product_name: product.product,
          waste_date: product.date,
          waste_time: product.time
        }));

        const { error: detailError } = await supabase
          .from('quality_wasted_products')
          .insert(detailRecords);

        if (detailError) throw detailError;
      }

      return summary;
    } catch (error) {
      console.error('Error saving production waste:', error);
      throw error;
    }
  },

  async getProductionWasteHistory() {
    try {
      const { data, error } = await supabase
        .from('quality_production_waste')
        .select(`
          *,
          quality_wasted_products(*)
        `)
        .eq('quality_id', 'quality')
        .order('reporting_month', { ascending: false });

      if (error) throw error;
      
      return data.map(record => ({
        id: record.id,
        date: record.reporting_month,
        value: record.value_pct,
        monthlyTarget: record.monthly_target,
        stats: record.stats_json,
        wastedProducts: record.wasted_products_json || [],
        detailWastedProducts: record.quality_wasted_products || [],
        created_at: record.created_at
      }));
    } catch (error) {
      console.error('Error fetching production waste history:', error);
      throw error;
    }
  },

  // ============================================================================
  // INVENTORY QUALITY
  // ============================================================================
  
  async saveInventoryQuality(kpiData) {
    try {
      await this.ensureQualityDepartment();
      
      // Prepare main summary record
      const summaryData = {
        quality_id: 'quality',
        reporting_date: kpiData.date,
        value_pct: kpiData.value,
        kpi_threshold: kpiData.kpiThreshold,
        stats_json: kpiData.stats,
        product_tests_json: kpiData.productTests
      };

      // Insert or update summary
      const { data: summary, error: summaryError } = await supabase
        .from('quality_inventory_quality')
        .upsert(summaryData, {
          onConflict: 'quality_id,reporting_date',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (summaryError) throw summaryError;

      // Delete existing detail records for this date
      await supabase
        .from('quality_inventory_product_tests')
        .delete()
        .eq('inventory_summary_id', summary.id);

      // Insert detail records
      if (kpiData.productTests && Object.keys(kpiData.productTests).length > 0) {
        const detailRecords = Object.entries(kpiData.productTests).map(([key, productTest]) => ({
          inventory_summary_id: summary.id,
          product_name: productTest.nomProduit,
          category: productTest.categorie,
          global_pass: productTest.reussiteGlobale,
          last_test_at: productTest.dernierTest ? new Date(productTest.dernierTest).toISOString() : null,
          tests_json: productTest.tests
        }));

        const { error: detailError } = await supabase
          .from('quality_inventory_product_tests')
          .insert(detailRecords);

        if (detailError) throw detailError;
      }

      return summary;
    } catch (error) {
      console.error('Error saving inventory quality:', error);
      throw error;
    }
  },

  async getInventoryQualityHistory() {
    try {
      const { data, error } = await supabase
        .from('quality_inventory_quality')
        .select(`
          *,
          quality_inventory_product_tests(*)
        `)
        .eq('quality_id', 'quality')
        .order('reporting_date', { ascending: false });

      if (error) throw error;
      
      return data.map(record => ({
        id: record.id,
        date: record.reporting_date,
        value: record.value_pct,
        kpiThreshold: record.kpi_threshold,
        stats: record.stats_json,
        productTests: record.product_tests_json || {},
        detailProductTests: record.quality_inventory_product_tests || [],
        created_at: record.created_at
      }));
    } catch (error) {
      console.error('Error fetching inventory quality history:', error);
      throw error;
    }
  },

  // ============================================================================
  // COMBINED ANALYTICS FOR REPORTS
  // ============================================================================
  
  async getQualityAnalytics() {
    try {
      const [materialData, wasteData, inventoryData] = await Promise.all([
        this.getMaterialBatchAcceptanceHistory(),
        this.getProductionWasteHistory(),
        this.getInventoryQualityHistory()
      ]);

      return {
        material_batch_acceptance_rate: materialData,
        production_waste_rate: wasteData,
        raw_materials_inventory_list: inventoryData
      };
    } catch (error) {
      console.error('Error fetching quality analytics:', error);
      throw error;
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  async getLatestKPIValue(kpiId) {
    try {
      let data = null;
      
      switch (kpiId) {
        case 'material_batch_acceptance_rate':
          const materialData = await this.getMaterialBatchAcceptanceHistory();
          data = materialData[0] || null;
          break;
        case 'production_waste_rate':
          const wasteData = await this.getProductionWasteHistory();
          data = wasteData[0] || null;
          break;
        case 'raw_materials_inventory_list':
          const inventoryData = await this.getInventoryQualityHistory();
          data = inventoryData[0] || null;
          break;
        default:
          return null;
      }

      return data ? {
        value: data.value,
        date: data.date,
        data: data
      } : null;
    } catch (error) {
      console.error('Error fetching latest KPI value:', error);
      return null;
    }
  },

  async getKPIHistory(kpiId) {
    try {
      switch (kpiId) {
        case 'material_batch_acceptance_rate':
          return await this.getMaterialBatchAcceptanceHistory();
        case 'production_waste_rate':
          return await this.getProductionWasteHistory();
        case 'raw_materials_inventory_list':
          return await this.getInventoryQualityHistory();
        default:
          return [];
      }
    } catch (error) {
      console.error('Error fetching KPI history:', error);
      return [];
    }
  }
};