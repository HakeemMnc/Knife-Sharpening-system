import { createClient } from '@supabase/supabase-js';

// Database types for TypeScript support
export interface Order {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_address: string;
  street_address?: string;
  suburb?: string;
  state?: string;
  postal_code?: string;
  special_instructions?: string;
  total_items: number;
  service_level: 'standard' | 'premium';
  base_amount: number;
  upgrade_amount: number;
  delivery_fee: number;
  total_amount: number;
  service_date: string;
  pickup_date: string; // Legacy compatibility
  pickup_time_slot: 'morning' | 'afternoon' | 'evening';
  status: 'pending' | 'paid' | 'picked_up' | 'sharpening' | 'ready' | 'delivered' | 'completed';
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  confirmation_sms_sent: boolean;
  reminder_24h_sent: boolean;
  morning_reminder_sent: boolean;
  pickup_sms_sent: boolean;
  delivery_sms_sent: boolean;
  followup_sms_sent: boolean;
  
  // SMS Status Tracking
  confirmation_sms_status: 'pending' | 'sent' | 'delivered' | 'failed';
  reminder_24h_status: 'pending' | 'sent' | 'delivered' | 'failed';
  morning_reminder_status: 'pending' | 'sent' | 'delivered' | 'failed';
  pickup_sms_status: 'pending' | 'sent' | 'delivered' | 'failed';
  delivery_sms_status: 'pending' | 'sent' | 'delivered' | 'failed';
  followup_sms_status: 'pending' | 'sent' | 'delivered' | 'failed';
  
  // SMS Timestamps
  confirmation_sms_sent_at?: string;
  reminder_24h_sent_at?: string;
  morning_reminder_sent_at?: string;
  pickup_sms_sent_at?: string;
  delivery_sms_sent_at?: string;
  followup_sms_sent_at?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SMSLog {
  id: number;
  order_id: number;
  sms_type: 'confirmation' | 'reminder_24h' | 'morning_reminder' | 'pickup' | 'delivery' | 'followup';
  phone_number: string;
  message_content: string;
  status: 'sent' | 'failed' | 'delivered' | 'undelivered';
  twilio_sid?: string;
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
  direction: 'outbound' | 'inbound';
}

export interface SMSConversation {
  id: number;
  order_id: number;
  phone_number: string;
  message_content: string;
  direction: 'inbound' | 'outbound';
  twilio_sid?: string;
  admin_user?: string;
  created_at: string;
  read_at?: string;
}

export interface SMSTemplate {
  id: number;
  template_name: string;
  template_content: string;
  description?: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  default_address?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

// Database client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for client-side operations (limited permissions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (full permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database utility functions
export class DatabaseService {
  // Order operations
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getOrder(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getOrdersByIds(ids: number[]): Promise<Order[]> {
    if (ids.length === 0) return [];
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  }

  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getOrdersByServiceDate(date: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('service_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getOrdersByPickupDate(date: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('pickup_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async deleteOrder(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // SMS operations
  static async createSMSLog(smsData: Omit<SMSLog, 'id' | 'sent_at'>): Promise<SMSLog> {
    const { data, error } = await supabaseAdmin
      .from('sms_logs')
      .insert(smsData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSMSLog(id: number, updates: Partial<SMSLog>): Promise<SMSLog> {
    const { data, error } = await supabaseAdmin
      .from('sms_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getPendingSMSReminders(): Promise<Order[]> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`pickup_date.eq.${tomorrow},pickup_date.eq.${today}`)
      .eq('status', 'paid')
      .order('pickup_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // SMS Conversation operations
  static async saveConversationMessage(conversationData: {
    order_id?: number;
    phone_number: string;
    message_content: string;
    direction: 'inbound' | 'outbound';
    twilio_sid?: string;
    admin_user?: string;
  }): Promise<SMSConversation> {
    const { data, error } = await supabaseAdmin
      .from('sms_conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getConversationsByOrder(orderId: number): Promise<SMSConversation[]> {
    const { data, error } = await supabase
      .from('sms_conversations')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getAllConversations(): Promise<SMSConversation[]> {
    const { data, error } = await supabase
      .from('sms_conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // SMS Template operations
  static async getSMSTemplates(): Promise<SMSTemplate[]> {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    
    // Custom order for templates
    const templateOrder = ['confirmation', 'reminder_24h', 'morning_reminder', 'pickup', 'delivery', 'followup'];
    const templates = data || [];
    
    return templates.sort((a, b) => {
      const aIndex = templateOrder.indexOf(a.template_name);
      const bIndex = templateOrder.indexOf(b.template_name);
      return aIndex - bIndex;
    });
  }

  static async updateSMSTemplate(id: number, template_content: string): Promise<SMSTemplate> {
    const { data, error } = await supabaseAdmin
      .from('sms_templates')
      .update({ 
        template_content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSMSTemplateFields(id: number, updates: any): Promise<SMSTemplate> {
    const { data, error } = await supabaseAdmin
      .from('sms_templates')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Customer operations
  static async findOrCreateCustomer(customerData: {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    default_address?: string;
  }): Promise<Customer> {
    // Try to find existing customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .or(`email.eq.${customerData.email},phone.eq.${customerData.phone}`)
      .single();

    if (existingCustomer) {
      return existingCustomer;
    }

    // Create new customer
    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Raw SQL query method for complex operations
  // For now, we'll implement the booking limits using Supabase ORM methods
  // This is a placeholder that maintains API compatibility
  static async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    console.warn('Raw SQL query not yet implemented in Supabase setup:', sql);
    
    // For booking limits system, we'll need to implement these specific queries
    // using Supabase's built-in methods rather than raw SQL
    
    return { rows: [] };
  }

  // Analytics and reporting
  static async getOrderStats(): Promise<{
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    today_pickups: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const { data: totalOrders } = await supabase
      .from('orders')
      .select('total_amount', { count: 'exact' });

    const { data: revenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid');

    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    const { data: todayPickups } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('pickup_date', today);

    return {
      total_orders: totalOrders?.length || 0,
      total_revenue: revenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
      pending_orders: pendingOrders?.length || 0,
      today_pickups: todayPickups?.length || 0,
    };
  }
}

// Helper functions for common operations
export const dbHelpers = {
  // Calculate next Monday pickup date
  getNextMonday: (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  },

  // Calculate order totals (mobile service - no delivery fees)
  calculateOrderTotals: (totalItems: number, serviceLevel: 'standard' | 'premium'): {
    base_amount: number;
    upgrade_amount: number;
    delivery_fee: number;
    total_amount: number;
  } => {
    const baseAmount = totalItems * 17;
    const upgradeAmount = serviceLevel === 'premium' ? totalItems * 5 : 0;
    const totalAmount = baseAmount + upgradeAmount;

    return {
      base_amount: baseAmount,
      upgrade_amount: upgradeAmount,
      delivery_fee: 0, // Mobile service - no delivery fees
      total_amount: totalAmount,
    };
  },

  // Format phone number for SMS
  formatPhoneForSMS: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('61') ? `+${cleaned}` : `+61${cleaned}`;
  },
};
