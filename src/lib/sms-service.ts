import { DatabaseService, SMSLog, Order, supabase } from './database';
import { dbHelpers } from './database';

// SMS Service for automated communications
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

  // Send SMS message
  static async sendSMS(to: string, message: string, orderId?: number, smsType?: SMSLog['sms_type']): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        console.warn('Twilio client not initialized');
        return false;
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
        });
      }

      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      
      // Log failed SMS
      if (orderId && smsType) {
        await DatabaseService.createSMSLog({
          order_id: orderId,
          sms_type: smsType,
          phone_number: to,
          message_content: message,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      return false;
    }
  }

  // Order confirmation SMS
  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    const message = `Hi ${order.first_name}! Your knife sharpening order #${order.id} has been confirmed for pickup on ${order.pickup_date}. Total: $${order.total_amount.toFixed(2)}. Please leave your items on your porch by 9am. Questions? Reply to this message.`;
    
    const success = await this.sendSMS(order.phone, message, order.id, 'confirmation');
    
    if (success) {
      await DatabaseService.updateOrder(order.id, { confirmation_sms_sent: true });
    }
    
    return success;
  }

  // 24-hour reminder SMS
  static async send24HourReminder(order: Order): Promise<boolean> {
    const message = `Reminder: Your knife sharpening pickup is tomorrow (${order.pickup_date}). Please leave your ${order.total_items} items on your porch by 9am. Order #${order.id}`;
    
    const success = await this.sendSMS(order.phone, message, order.id, 'reminder_24h');
    
    if (success) {
      await DatabaseService.updateOrder(order.id, { reminder_24h_sent: true });
    }
    
    return success;
  }

  // 1-hour reminder SMS
  static async send1HourReminder(order: Order): Promise<boolean> {
    const message = `Your knife sharpening pickup is in 1 hour! Please ensure your ${order.total_items} items are on your porch. Order #${order.id}`;
    
    const success = await this.sendSMS(order.phone, message, order.id, 'reminder_1h');
    
    if (success) {
      await DatabaseService.updateOrder(order.id, { reminder_1h_sent: true });
    }
    
    return success;
  }

  // Pickup confirmation SMS
  static async sendPickupConfirmation(order: Order): Promise<boolean> {
    const message = `Great news! Your ${order.total_items} items have been picked up and are now being sharpened. You'll receive a message when they're ready for delivery. Order #${order.id}`;
    
    const success = await this.sendSMS(order.phone, message, order.id, 'pickup_confirmation');
    
    if (success) {
      await DatabaseService.updateOrder(order.id, { pickup_confirmation_sent: true });
    }
    
    return success;
  }

  // Delivery confirmation SMS
  static async sendDeliveryConfirmation(order: Order): Promise<boolean> {
    const message = `Your sharpened items have been delivered! Please check your porch. We hope you love the results. Order #${order.id}. Thank you for choosing Northern Rivers Knife Sharpening!`;
    
    const success = await this.sendSMS(order.phone, message, order.id, 'delivery_confirmation');
    
    if (success) {
      await DatabaseService.updateOrder(order.id, { delivery_confirmation_sent: true });
    }
    
    return success;
  }

  // Follow-up SMS (sent 2 days after delivery)
  static async sendFollowUpSMS(order: Order): Promise<boolean> {
    const message = `Hi ${order.first_name}! How are your newly sharpened items performing? We'd love to hear your feedback. Order #${order.id}`;
    
    const success = await this.sendSMS(order.phone, message, order.id, 'followup');
    
    if (success) {
      await DatabaseService.updateOrder(order.id, { followup_sms_sent: true });
    }
    
    return success;
  }

  // Bulk SMS for reminders
  static async sendBulkReminders(): Promise<{ success: number; failed: number }> {
    const pendingReminders = await DatabaseService.getPendingSMSReminders();
    let successCount = 0;
    let failedCount = 0;

    for (const order of pendingReminders) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (order.pickup_date === tomorrow && !order.reminder_24h_sent) {
        const success = await this.send24HourReminder(order);
        success ? successCount++ : failedCount++;
      } else if (order.pickup_date === today && !order.reminder_1h_sent) {
        const success = await this.send1HourReminder(order);
        success ? successCount++ : failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  }

  // Custom SMS for special notifications
  static async sendCustomSMS(order: Order, customMessage: string): Promise<boolean> {
    return await this.sendSMS(order.phone, customMessage, order.id, 'confirmation');
  }

  // Update SMS delivery status (webhook handler)
  static async updateDeliveryStatus(twilioSid: string, status: 'delivered' | 'undelivered'): Promise<void> {
    try {
      const { data: smsLogs } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('twilio_sid', twilioSid);

      if (smsLogs && smsLogs.length > 0) {
        const smsLog = smsLogs[0];
        await DatabaseService.updateSMSLog(smsLog.id, {
          status,
          delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to update SMS delivery status:', error);
    }
  }
}

// SMS Templates for different scenarios
export const smsTemplates = {
  orderConfirmation: (order: Order) => 
    `Hi ${order.first_name}! Your knife sharpening order #${order.id} has been confirmed for pickup on ${order.pickup_date}. Total: $${order.total_amount.toFixed(2)}. Please leave your items on your porch by 9am. Questions? Reply to this message.`,

  reminder24h: (order: Order) => 
    `Reminder: Your knife sharpening pickup is tomorrow (${order.pickup_date}). Please leave your ${order.total_items} items on your porch by 9am. Order #${order.id}`,

  reminder1h: (order: Order) => 
    `Your knife sharpening pickup is in 1 hour! Please ensure your ${order.total_items} items are on your porch. Order #${order.id}`,

  pickupConfirmation: (order: Order) => 
    `Great news! Your ${order.total_items} items have been picked up and are now being sharpened. You'll receive a message when they're ready for delivery. Order #${order.id}`,

  deliveryConfirmation: (order: Order) => 
    `Your sharpened items have been delivered! Please check your porch. We hope you love the results. Order #${order.id}. Thank you for choosing Northern Rivers Knife Sharpening!`,

  followUp: (order: Order) => 
    `Hi ${order.first_name}! How are your newly sharpened items performing? We'd love to hear your feedback. Order #${order.id}`,

  orderUpdate: (order: Order, update: string) => 
    `Order #${order.id} Update: ${update}. Questions? Reply to this message.`,

  paymentReminder: (order: Order) => 
    `Hi ${order.first_name}! Your knife sharpening order #${order.id} is ready to process. Please complete payment to confirm your pickup on ${order.pickup_date}. Total: $${order.total_amount.toFixed(2)}`,

  cancellation: (order: Order) => 
    `Hi ${order.first_name}! Your knife sharpening order #${order.id} has been cancelled as requested. If you have any questions, please contact us.`,
};

// Initialize SMS service
SMSService.initialize();
