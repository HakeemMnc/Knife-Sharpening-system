import { DatabaseService, SMSLog, Order, SMSTemplate, SMSConversation, supabase } from './database';
import { dbHelpers } from './database';

// SMS Service for automated communications with template support
export class SMSService {
  private static twilioClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private static fromNumber: string;

  // Initialize Twilio client
  static initialize() {
    if (typeof window !== 'undefined') return; // Only run on server

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER!;

    if (!accountSid || !authToken || !this.fromNumber) {
      console.warn('Twilio credentials not configured');
      return;
    }

    // Dynamic import for server-side only
    import('twilio').then((twilio) => {
      this.twilioClient = twilio.default(accountSid, authToken);
    });
  }

  // Get SMS template from database
  static async getSMSTemplate(templateName: string): Promise<SMSTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('template_name', templateName)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error(`SMS template '${templateName}' not found:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching SMS template:', error);
      return null;
    }
  }

  // Replace placeholders in template content
  static replacePlaceholders(template: string, order: Order): string {
    const serviceDate = new Date(order.service_date);
    const formattedDate = serviceDate.toLocaleDateString('en-AU', { 
      day: '2-digit', 
      month: '2-digit' 
    });

    const placeholders: { [key: string]: string } = {
      '{Name}': order.first_name,
      '{DD/MM}': formattedDate,
      '{ItemCount}': order.total_items === 1 ? `${order.total_items} item` : `${order.total_items} items`,
      '{OrderId}': order.id.toString(),
      '{TotalAmount}': `$${order.total_amount.toFixed(2)}`
    };

    let message = template;
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      message = message.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return message;
  }

  // Send SMS message with enhanced logging and status tracking
  static async sendSMS(
    to: string, 
    message: string, 
    orderId?: number, 
    smsType?: SMSLog['sms_type']
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        console.warn('Twilio client not initialized');
        return { success: false, error: 'Twilio client not initialized' };
      }

      const formattedPhone = dbHelpers.formatPhoneForSMS(to);

      const twilioMessage = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      // Log SMS in database
      if (orderId && smsType) {
        await DatabaseService.createSMSLog({
          order_id: orderId,
          sms_type: smsType,
          phone_number: formattedPhone,
          message_content: message,
          status: 'sent',
          twilio_sid: twilioMessage.sid,
          direction: 'outbound'
        });

        // Update order SMS status and timestamp
        await this.updateOrderSMSStatus(orderId, smsType, 'sent');
      }

      return { success: true, sid: twilioMessage.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed SMS
      if (orderId && smsType) {
        await DatabaseService.createSMSLog({
          order_id: orderId,
          sms_type: smsType,
          phone_number: to,
          message_content: message,
          status: 'failed',
          error_message: errorMessage,
          direction: 'outbound'
        });

        // Update order SMS status to failed
        await this.updateOrderSMSStatus(orderId, smsType, 'failed');
      }

      return { success: false, error: errorMessage };
    }
  }

  // Update order SMS status and timestamp
  static async updateOrderSMSStatus(
    orderId: number, 
    smsType: SMSLog['sms_type'], 
    status: 'sent' | 'delivered' | 'failed'
  ): Promise<void> {
    try {
      const updates: Record<string, string | boolean> = {};
      const timestamp = new Date().toISOString();

      // Map smsType to corresponding boolean and status fields
      const fieldMapping: { [key: string]: { sent: string; status: string; timestamp: string } } = {
        'confirmation': {
          sent: 'confirmation_sms_sent',
          status: 'confirmation_sms_status',
          timestamp: 'confirmation_sms_sent_at'
        },
        'reminder_24h': {
          sent: 'reminder_24h_sent',
          status: 'reminder_24h_status',
          timestamp: 'reminder_24h_sent_at'
        },
        'morning_reminder': {
          sent: 'morning_reminder_sent',
          status: 'morning_reminder_status',
          timestamp: 'morning_reminder_sent_at'
        },
        'pickup': {
          sent: 'pickup_sms_sent',
          status: 'pickup_sms_status',
          timestamp: 'pickup_sms_sent_at'
        },
        'delivery': {
          sent: 'delivery_sms_sent',
          status: 'delivery_sms_status',
          timestamp: 'delivery_sms_sent_at'
        },
        'followup': {
          sent: 'followup_sms_sent',
          status: 'followup_sms_status',
          timestamp: 'followup_sms_sent_at'
        }
      };

      const fields = fieldMapping[smsType];
      if (fields) {
        updates[fields.sent] = status === 'sent' || status === 'delivered';
        updates[fields.status] = status;
        if (status === 'sent' || status === 'delivered') {
          updates[fields.timestamp] = timestamp;
        }
      }

      await DatabaseService.updateOrder(orderId, updates);
    } catch (error) {
      console.error('Error updating order SMS status:', error);
    }
  }

  // Send SMS using template
  static async sendTemplatedSMS(
    order: Order, 
    templateName: string
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    const template = await this.getSMSTemplate(templateName);
    if (!template) {
      return { success: false, error: `Template '${templateName}' not found` };
    }

    const message = this.replacePlaceholders(template.template_content, order);
    return await this.sendSMS(
      order.phone, 
      message, 
      order.id, 
      templateName as SMSLog['sms_type']
    );
  }

  // Confirmation SMS (triggered automatically when payment received)
  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    const result = await this.sendTemplatedSMS(order, 'confirmation');
    return result.success;
  }

  // 24-hour reminder SMS
  static async send24HourReminder(order: Order): Promise<boolean> {
    const result = await this.sendTemplatedSMS(order, 'reminder_24h');
    return result.success;
  }

  // Morning reminder SMS
  static async sendMorningReminder(order: Order): Promise<boolean> {
    const result = await this.sendTemplatedSMS(order, 'morning_reminder');
    return result.success;
  }

  // Pickup confirmation SMS
  static async sendPickupConfirmation(order: Order): Promise<boolean> {
    const result = await this.sendTemplatedSMS(order, 'pickup');
    return result.success;
  }

  // Delivery confirmation SMS
  static async sendDeliveryConfirmation(order: Order): Promise<boolean> {
    const result = await this.sendTemplatedSMS(order, 'delivery');
    return result.success;
  }

  // Follow-up SMS (sent 48 hours after delivery)
  static async sendFollowUpSMS(order: Order): Promise<boolean> {
    const result = await this.sendTemplatedSMS(order, 'followup');
    return result.success;
  }

  // Send custom SMS (for admin replies)
  static async sendCustomSMS(
    phone: string, 
    message: string, 
    orderId?: number
  ): Promise<boolean> {
    const result = await this.sendSMS(phone, message, orderId);
    
    // Also log in conversations table if order-related
    if (orderId) {
      try {
        await supabase.from('sms_conversations').insert({
          order_id: orderId,
          phone_number: phone,
          message_content: message,
          direction: 'outbound',
          twilio_sid: result.sid,
          admin_user: 'admin' // TODO: Replace with actual admin user when auth is implemented
        });
      } catch (error) {
        console.error('Error logging conversation:', error);
      }
    }
    
    return result.success;
  }

  // Send admin reply (wrapper for sendCustomSMS)
  static async sendAdminReply(phone: string, message: string, orderId?: number): Promise<{success: boolean, messageSid?: string, error?: string}> {
    try {
      const result = await this.sendSMS(phone, message, orderId);
      return {
        success: result.success,
        messageSid: result.sid,
        error: result.success ? undefined : 'SMS sending failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Handle incoming SMS (webhook)
  static async handleIncomingSMS(
    from: string, 
    message: string, 
    twilioSid: string
  ): Promise<void> {
    try {
      // Find the order associated with this phone number
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('phone', from)
        .order('created_at', { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        const order = orders[0];
        
        // Log in conversations table
        await supabase.from('sms_conversations').insert({
          order_id: order.id,
          phone_number: from,
          message_content: message,
          direction: 'inbound',
          twilio_sid: twilioSid
        });

        // Also log in sms_logs for record keeping
        await DatabaseService.createSMSLog({
          order_id: order.id,
          sms_type: 'confirmation', // Generic type for customer replies
          phone_number: from,
          message_content: message,
          status: 'sent',
          twilio_sid: twilioSid,
          direction: 'inbound'
        });

        // TODO: Forward SMS to admin's personal phone
        await this.forwardSMSToAdmin(from, message, order.id);
      }
    } catch (error) {
      console.error('Error handling incoming SMS:', error);
    }
  }

  // Forward customer reply to admin's personal phone
  static async forwardSMSToAdmin(
    customerPhone: string, 
    message: string, 
    orderId: number
  ): Promise<void> {
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
    if (!adminPhone) {
      console.warn('Admin phone number not configured for SMS forwarding');
      return;
    }

    const forwardMessage = `Customer Reply (Order #${orderId}): ${message}\n\nFrom: ${customerPhone}`;
    
    try {
      await this.sendSMS(adminPhone, forwardMessage);
    } catch (error) {
      console.error('Error forwarding SMS to admin:', error);
    }
  }

  // Send notification SMS to admin (used by webhook)
  static async sendAdminNotification(message: string): Promise<boolean> {
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
    if (!adminPhone) {
      console.warn('Admin phone number not configured for notifications');
      return false;
    }

    try {
      const result = await this.sendSMS(adminPhone, message);
      return result.success;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }
  }

  // Update SMS delivery status (webhook handler)
  static async updateDeliveryStatus(twilioSid: string, status: 'delivered' | 'undelivered'): Promise<void> {
    try {
      // Update sms_logs table
      const { data: smsLogs } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('twilio_sid', twilioSid);

      if (smsLogs && smsLogs.length > 0) {
        const smsLog = smsLogs[0];
        await DatabaseService.updateSMSLog(smsLog.id, {
          status: status === 'delivered' ? 'delivered' : 'undelivered',
          delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
        });

        // Update order status if delivered
        if (status === 'delivered' && smsLog.order_id) {
          await this.updateOrderSMSStatus(
            smsLog.order_id, 
            smsLog.sms_type, 
            'delivered'
          );
        }
      }
    } catch (error) {
      console.error('Failed to update SMS delivery status:', error);
    }
  }

  // Get SMS status for order (for UI display)
  static getSMSStatus(order: Order): {
    confirmation: { status: string; sent_at?: string };
    reminder_24h: { status: string; sent_at?: string };
    morning_reminder: { status: string; sent_at?: string };
    pickup: { status: string; sent_at?: string };
    delivery: { status: string; sent_at?: string };
    followup: { status: string; sent_at?: string };
  } {
    return {
      confirmation: {
        status: order.confirmation_sms_status,
        sent_at: order.confirmation_sms_sent_at
      },
      reminder_24h: {
        status: order.reminder_24h_status,
        sent_at: order.reminder_24h_sent_at
      },
      morning_reminder: {
        status: order.morning_reminder_status,
        sent_at: order.morning_reminder_sent_at
      },
      pickup: {
        status: order.pickup_sms_status,
        sent_at: order.pickup_sms_sent_at
      },
      delivery: {
        status: order.delivery_sms_status,
        sent_at: order.delivery_sms_sent_at
      },
      followup: {
        status: order.followup_sms_status,
        sent_at: order.followup_sms_sent_at
      }
    };
  }

  // Bulk SMS operations
  static async sendBulkSMS(
    orders: Order[], 
    templateName: string
  ): Promise<{ success: number; failed: number; results: { orderId: number; customerName: string; success: boolean; error?: string }[] }> {
    let successCount = 0;
    let failedCount = 0;
    const results: { orderId: number; customerName: string; success: boolean; error?: string }[] = [];

    for (const order of orders) {
      const result = await this.sendTemplatedSMS(order, templateName);
      results.push({
        orderId: order.id,
        customerName: `${order.first_name} ${order.last_name}`,
        success: result.success,
        error: result.error
      });

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount, results };
  }
}

// Initialize SMS service
SMSService.initialize();

export default SMSService;