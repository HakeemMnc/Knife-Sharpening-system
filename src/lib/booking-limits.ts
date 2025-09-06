/**
 * Booking Limits Service
 * Handles daily booking limits and availability checking
 * Adapted for Supabase ORM
 */

import { supabaseAdmin } from './database';

export type LimitType = 'customers' | 'items';
export type AvailabilityStatus = 'available' | 'full' | 'closed';

export interface DailyLimit {
  id: number;
  limit_date: string; // YYYY-MM-DD format
  limit_type: LimitType;
  max_customers: number;
  max_items: number;
  current_customers: number;
  current_items: number;
  is_active: boolean;
  notes?: string;
  spots_remaining: number;
  availability_status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'integer' | 'boolean' | 'json';
  description?: string;
}

export class BookingLimitsService {
  /**
   * Check if booking is allowed for a specific date
   */
  static async canBookForDate(
    serviceDate: string, 
    customerCount: number = 1, 
    itemCount: number = 1
  ): Promise<boolean> {
    try {
      // Get or create daily limit for this date
      const dailyLimit = await this.getDailyLimit(serviceDate);
      if (!dailyLimit) return false;
      
      // Check if limit is active
      if (!dailyLimit.is_active) return false;
      
      // Check limits based on type
      if (dailyLimit.limit_type === 'customers') {
        return (dailyLimit.current_customers + customerCount) <= dailyLimit.max_customers;
      } else if (dailyLimit.limit_type === 'items') {
        return (dailyLimit.current_items + itemCount) <= dailyLimit.max_items;
      } else {
        // Check both limits if type is mixed/unknown
        return (dailyLimit.current_customers + customerCount) <= dailyLimit.max_customers 
            && (dailyLimit.current_items + itemCount) <= dailyLimit.max_items;
      }
    } catch (error) {
      console.error('Error checking booking availability:', error);
      return false; // Fail safe - deny booking if there's an error
    }
  }

  /**
   * Get daily limit information for a specific date
   */
  static async getDailyLimit(serviceDate: string): Promise<DailyLimit | null> {
    try {
      // First, try to get existing limit
      const { data: existingLimit } = await supabaseAdmin
        .from('daily_limits')
        .select('*')
        .eq('limit_date', serviceDate)
        .single();
      
      if (existingLimit) {
        // Calculate spots remaining and availability status
        return this.calculateAvailabilityStatus(existingLimit);
      }
      
      // If no limit exists, create one with default settings
      const defaultSettings = await this.getDefaultSettings();
      
      const { data: newLimit, error } = await supabaseAdmin
        .from('daily_limits')
        .insert({
          limit_date: serviceDate,
          limit_type: defaultSettings.limit_type || 'customers',
          max_customers: defaultSettings.max_customers || 7,
          max_items: defaultSettings.max_items || 100,
          current_customers: 0,
          current_items: 0,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating daily limit:', error);
        return null;
      }
      
      return this.calculateAvailabilityStatus(newLimit);
    } catch (error) {
      console.error('Error getting daily limit:', error);
      return null;
    }
  }

  /**
   * Helper method to calculate availability status and spots remaining
   */
  private static calculateAvailabilityStatus(limit: any): DailyLimit {
    let spotsRemaining = 0;
    let availabilityStatus: AvailabilityStatus = 'available';

    if (!limit.is_active) {
      availabilityStatus = 'closed';
    } else if (limit.limit_type === 'customers') {
      spotsRemaining = limit.max_customers - limit.current_customers;
      if (spotsRemaining <= 0) availabilityStatus = 'full';
    } else if (limit.limit_type === 'items') {
      spotsRemaining = limit.max_items - limit.current_items;
      if (spotsRemaining <= 0) availabilityStatus = 'full';
    } else {
      // Mixed mode - use the more restrictive limit
      const customerSpots = limit.max_customers - limit.current_customers;
      const itemSpots = limit.max_items - limit.current_items;
      spotsRemaining = Math.min(customerSpots, itemSpots);
      if (spotsRemaining <= 0) availabilityStatus = 'full';
    }

    return {
      ...limit,
      spots_remaining: Math.max(0, spotsRemaining),
      availability_status: availabilityStatus
    };
  }

  /**
   * Get default settings for creating new limits
   */
  private static async getDefaultSettings(): Promise<{
    limit_type: LimitType;
    max_customers: number;
    max_items: number;
  }> {
    try {
      const settings = await this.getAllSystemSettings();
      return {
        limit_type: settings.default_limit_type || 'customers',
        max_customers: settings.default_daily_customer_limit || 7,
        max_items: settings.default_daily_item_limit || 100
      };
    } catch (error) {
      console.error('Error getting default settings:', error);
      return {
        limit_type: 'customers',
        max_customers: 7,
        max_items: 100
      };
    }
  }

  /**
   * Get daily limits for a date range
   */
  static async getDailyLimits(
    startDate: string, 
    endDate: string
  ): Promise<DailyLimit[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('daily_limits')
        .select('*')
        .gte('limit_date', startDate)
        .lte('limit_date', endDate)
        .order('limit_date');
      
      if (error) throw error;
      
      return (data || []).map(limit => this.calculateAvailabilityStatus(limit));
    } catch (error) {
      console.error('Error getting daily limits range:', error);
      return [];
    }
  }

  /**
   * Get available dates for booking within a date range
   * Returns dates where bookings are still available
   */
  static async getAvailableDates(
    startDate: string,
    endDate: string,
    customerCount: number = 1,
    itemCount: number = 1
  ): Promise<string[]> {
    try {
      // First ensure all dates in range have limit records
      await this.ensureLimitsExist(startDate, endDate);
      
      // Get available dates
      const result = await DatabaseService.query(
        `SELECT limit_date 
         FROM daily_booking_status 
         WHERE limit_date >= $1 
           AND limit_date <= $2 
           AND is_active = true
           AND (
             (limit_type = 'customers' AND (current_customers + $3) <= max_customers)
             OR (limit_type = 'items' AND (current_items + $4) <= max_items)
             OR (limit_type NOT IN ('customers', 'items') 
                 AND (current_customers + $3) <= max_customers 
                 AND (current_items + $4) <= max_items)
           )
         ORDER BY limit_date`,
        [startDate, endDate, customerCount, itemCount]
      );
      
      return result.rows.map(row => row.limit_date);
    } catch (error) {
      console.error('Error getting available dates:', error);
      return [];
    }
  }

  /**
   * Increment booking count when an order is created
   */
  static async incrementBookingCount(
    serviceDate: string,
    customerCount: number = 1,
    itemCount: number = 1
  ): Promise<void> {
    try {
      // Get or create daily limit first
      await this.getDailyLimit(serviceDate);
      
      // Get current limit to increment
      const currentLimit = await this.getDailyLimit(serviceDate);
      if (!currentLimit) throw new Error('Could not create daily limit');
      
      // Update with incremented values
      const { error } = await supabaseAdmin
        .from('daily_limits')
        .update({
          current_customers: currentLimit.current_customers + customerCount,
          current_items: currentLimit.current_items + itemCount
        })
        .eq('limit_date', serviceDate);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing booking count:', error);
      throw error;
    }
  }

  /**
   * Decrement booking count when an order is cancelled
   */
  static async decrementBookingCount(
    serviceDate: string,
    customerCount: number = 1,
    itemCount: number = 1
  ): Promise<void> {
    try {
      await DatabaseService.query(
        'SELECT decrement_daily_booking_count($1, $2, $3)',
        [serviceDate, customerCount, itemCount]
      );
    } catch (error) {
      console.error('Error decrementing booking count:', error);
      throw error;
    }
  }

  /**
   * Update daily limit settings for a specific date
   */
  static async updateDailyLimit(
    serviceDate: string,
    updates: {
      limit_type?: LimitType;
      max_customers?: number;
      max_items?: number;
      is_active?: boolean;
      notes?: string;
    }
  ): Promise<DailyLimit | null> {
    try {
      // Ensure limit exists first
      await DatabaseService.query(
        'SELECT get_or_create_daily_limit($1)',
        [serviceDate]
      );

      // Build update query
      const updateFields = [];
      const values = [];
      let paramIndex = 2;

      if (updates.limit_type !== undefined) {
        updateFields.push(`limit_type = $${paramIndex}`);
        values.push(updates.limit_type);
        paramIndex++;
      }
      if (updates.max_customers !== undefined) {
        updateFields.push(`max_customers = $${paramIndex}`);
        values.push(updates.max_customers);
        paramIndex++;
      }
      if (updates.max_items !== undefined) {
        updateFields.push(`max_items = $${paramIndex}`);
        values.push(updates.max_items);
        paramIndex++;
      }
      if (updates.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex}`);
        values.push(updates.is_active);
        paramIndex++;
      }
      if (updates.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex}`);
        values.push(updates.notes);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return await this.getDailyLimit(serviceDate);
      }

      updateFields.push(`updated_at = NOW()`);

      await DatabaseService.query(
        `UPDATE daily_limits SET ${updateFields.join(', ')} WHERE limit_date = $1`,
        [serviceDate, ...values]
      );

      return await this.getDailyLimit(serviceDate);
    } catch (error) {
      console.error('Error updating daily limit:', error);
      return null;
    }
  }

  /**
   * Get system settings
   */
  static async getSystemSetting(key: string): Promise<SystemSetting | null> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM system_settings WHERE setting_key = $1',
        [key]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting system setting:', error);
      return null;
    }
  }

  /**
   * Update system setting
   */
  static async updateSystemSetting(
    key: string, 
    value: string, 
    type: 'string' | 'integer' | 'boolean' | 'json' = 'string'
  ): Promise<void> {
    try {
      await DatabaseService.query(
        `INSERT INTO system_settings (setting_key, setting_value, setting_type, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (setting_key) 
         DO UPDATE SET 
           setting_value = EXCLUDED.setting_value,
           setting_type = EXCLUDED.setting_type,
           updated_at = NOW()`,
        [key, value, type]
      );
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  /**
   * Get system settings for the API
   */
  static async getSystemSettings(): Promise<{
    defaultDailyCustomerLimit: number;
    defaultDailyItemLimit: number;
    enableBookingLimits: boolean;
  }> {
    try {
      const allSettings = await this.getAllSystemSettings();
      return {
        defaultDailyCustomerLimit: allSettings.default_daily_customer_limit || 7,
        defaultDailyItemLimit: allSettings.default_daily_item_limit || 100,
        enableBookingLimits: allSettings.enable_booking_limits !== false
      };
    } catch (error) {
      console.error('Error getting system settings:', error);
      return {
        defaultDailyCustomerLimit: 7,
        defaultDailyItemLimit: 100,
        enableBookingLimits: true
      };
    }
  }

  /**
   * Get all system settings as a key-value object
   */
  static async getAllSystemSettings(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('setting_key, setting_value, setting_type');
      
      if (error) throw error;
      
      const settings: Record<string, any> = {};
      
      for (const row of data || []) {
        let value: any = row.setting_value;
        
        // Convert value based on type
        switch (row.setting_type) {
          case 'integer':
            value = parseInt(value, 10);
            break;
          case 'boolean':
            value = value === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch {
              value = row.setting_value;
            }
            break;
          // string is default, no conversion needed
        }
        
        settings[row.setting_key] = value;
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting all system settings:', error);
      return {
        // Return default settings if table doesn't exist yet
        default_daily_customer_limit: 7,
        default_daily_item_limit: 100,
        default_limit_type: 'customers',
        enable_booking_limits: true
      };
    }
  }

  /**
   * Recalculate booking counts from actual orders
   * Useful for data consistency after migrations or manual changes
   */
  static async recalculateBookingCounts(serviceDate?: string): Promise<void> {
    try {
      // Simplified version - recalculate from actual orders
      // This method will manually count orders and update daily_limits
      if (serviceDate) {
        await this.recalculateForDate(serviceDate);
      } else {
        // Get all dates that have limits and recalculate each
        const { data: limits } = await supabaseAdmin
          .from('daily_limits')
          .select('limit_date');
        
        for (const limit of limits || []) {
          await this.recalculateForDate(limit.limit_date);
        }
      }
    } catch (error) {
      console.error('Error recalculating booking counts:', error);
      throw error;
    }
  }

  /**
   * Recalculate counts for a specific date
   */
  private static async recalculateForDate(serviceDate: string): Promise<void> {
    // Count orders for this service date
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_items')
      .eq('service_date', serviceDate)
      .not('status', 'in', '(cancelled,refunded)');
    
    const customerCount = orders?.length || 0;
    const itemCount = orders?.reduce((sum, order) => sum + order.total_items, 0) || 0;
    
    // Update the daily limit
    await supabaseAdmin
      .from('daily_limits')
      .update({
        current_customers: customerCount,
        current_items: itemCount
      })
      .eq('limit_date', serviceDate);
  }

  /**
   * Ensure daily limit records exist for a date range
   * Creates records with default settings if they don't exist
   */
  private static async ensureLimitsExist(startDate: string, endDate: string): Promise<void> {
    try {
      // Create daily limits for each date in the range if they don't exist
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // This will create the limit if it doesn't exist
        await this.getDailyLimit(dateStr);
      }
    } catch (error) {
      console.error('Error ensuring limits exist:', error);
      throw error;
    }
  }

  /**
   * Get booking summary for admin dashboard
   * Shows overview of limits and current bookings
   */
  static async getBookingSummary(days: number = 7): Promise<{
    totalAvailableSpots: number;
    totalBookedSpots: number;
    upcomingDates: DailyLimit[];
    settings: Record<string, any>;
  }> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days - 1);
      
      const startDate = new Date().toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const limits = await this.getDailyLimits(startDate, endDateStr);
      const settings = await this.getAllSystemSettings();
      
      const totalAvailableSpots = limits.reduce((sum, limit) => {
        if (limit.availability_status === 'available') {
          return sum + limit.spots_remaining;
        }
        return sum;
      }, 0);
      
      const totalBookedSpots = limits.reduce((sum, limit) => {
        return sum + (limit.limit_type === 'customers' 
          ? limit.current_customers 
          : limit.current_items);
      }, 0);
      
      return {
        totalAvailableSpots,
        totalBookedSpots,
        upcomingDates: limits,
        settings
      };
    } catch (error) {
      console.error('Error getting booking summary:', error);
      return {
        totalAvailableSpots: 0,
        totalBookedSpots: 0,
        upcomingDates: [],
        settings: {}
      };
    }
  }

  /**
   * Update a system setting using Supabase
   */
  static async updateSystemSetting(key: string, value: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  /**
   * Update future daily limits that haven't been customized
   */
  static async updateFutureDailyLimits(newLimit: number): Promise<{ updatedCount: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update all future limits to the new default
      const { data, error } = await supabaseAdmin
        .from('daily_limits')
        .update({ 
          max_customers: newLimit,
          updated_at: new Date().toISOString()
        })
        .gte('limit_date', today)
        .select('id');
        
      if (error) throw error;
      
      return { updatedCount: data?.length || 0 };
    } catch (error) {
      console.error('Error updating future daily limits:', error);
      throw error;
    }
  }

  /**
   * Set vacation dates (make them unavailable)
   */
  static async setVacationDates(startDate: string, endDate: string): Promise<{ affectedDates: number }> {
    try {
      // First ensure all dates in the range have limit records
      await this.ensureLimitsExist(startDate, endDate);
      
      // Update all dates in range to be inactive (vacation/closure)
      const { data, error } = await supabaseAdmin
        .from('daily_limits')
        .update({ 
          is_active: false,
          notes: 'Vacation/Closure period',
          updated_at: new Date().toISOString()
        })
        .gte('limit_date', startDate)
        .lte('limit_date', endDate)
        .select('limit_date');
        
      if (error) throw error;
      
      return { affectedDates: data?.length || 0 };
    } catch (error) {
      console.error('Error setting vacation dates:', error);
      throw error;
    }
  }

  /**
   * Remove vacation dates (make them available again)
   */
  static async removeVacationDates(startDate: string, endDate: string): Promise<{ affectedDates: number }> {
    try {
      // Update all dates in range to be active again
      const { data, error } = await supabaseAdmin
        .from('daily_limits')
        .update({ 
          is_active: true,
          notes: null,
          updated_at: new Date().toISOString()
        })
        .gte('limit_date', startDate)
        .lte('limit_date', endDate)
        .eq('is_active', false)
        .select('limit_date');
        
      if (error) throw error;
      
      return { affectedDates: data?.length || 0 };
    } catch (error) {
      console.error('Error removing vacation dates:', error);
      throw error;
    }
  }

  /**
   * Get current vacation periods
   */
  static async getVacationDates(): Promise<Array<{ startDate: string; endDate: string; notes?: string }>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all inactive dates (vacation periods)
      const { data: inactiveDates, error } = await supabaseAdmin
        .from('daily_limits')
        .select('limit_date, notes')
        .eq('is_active', false)
        .gte('limit_date', today)
        .order('limit_date');
        
      if (error) throw error;
      
      if (!inactiveDates || inactiveDates.length === 0) {
        return [];
      }
      
      // Group consecutive dates into periods
      const periods: Array<{ startDate: string; endDate: string; notes?: string }> = [];
      let currentPeriod: { startDate: string; endDate: string; notes?: string } | null = null;
      
      for (const dateRecord of inactiveDates) {
        const date = dateRecord.limit_date;
        
        if (!currentPeriod) {
          currentPeriod = { 
            startDate: date, 
            endDate: date, 
            notes: dateRecord.notes 
          };
        } else {
          // Check if this date is consecutive to the current period
          const lastDate = new Date(currentPeriod.endDate);
          lastDate.setDate(lastDate.getDate() + 1);
          const expectedNextDate = lastDate.toISOString().split('T')[0];
          
          if (date === expectedNextDate) {
            // Extend current period
            currentPeriod.endDate = date;
          } else {
            // Start new period
            periods.push(currentPeriod);
            currentPeriod = { 
              startDate: date, 
              endDate: date, 
              notes: dateRecord.notes 
            };
          }
        }
      }
      
      if (currentPeriod) {
        periods.push(currentPeriod);
      }
      
      return periods;
    } catch (error) {
      console.error('Error getting vacation dates:', error);
      return [];
    }
  }

  /**
   * Ensure limit records exist for a date range
   */
  private static async ensureLimitsExist(startDate: string, endDate: string): Promise<void> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates: string[] = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }
      
      // Get system settings for defaults
      const settings = await this.getAllSystemSettings();
      const defaultLimit = settings.defaultDailyCustomerLimit || 7;
      
      // Check which dates already have limits
      const { data: existingLimits } = await supabaseAdmin
        .from('daily_limits')
        .select('limit_date')
        .in('limit_date', dates);
        
      const existingDates = new Set(existingLimits?.map(l => l.limit_date) || []);
      const missingDates = dates.filter(date => !existingDates.has(date));
      
      // Create missing limit records
      if (missingDates.length > 0) {
        const newLimits = missingDates.map(date => ({
          limit_date: date,
          limit_type: 'customers' as LimitType,
          max_customers: defaultLimit,
          max_items: 100,
          current_customers: 0,
          current_items: 0,
          is_active: true
        }));
        
        const { error } = await supabaseAdmin
          .from('daily_limits')
          .insert(newLimits);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error ensuring limits exist:', error);
      throw error;
    }
  }
}