import Stripe from 'stripe';
import { DatabaseService, Order } from './database';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Create a payment intent for an order
  static async createPaymentIntent(order: Order): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convert to cents
        currency: 'aud',
        metadata: {
          orderId: order.id.toString(),
          customerEmail: order.email,
          customerName: `${order.first_name} ${order.last_name}`,
          pickupDate: order.pickup_date,
          totalItems: order.total_items.toString(),
          serviceLevel: order.service_level,
        },
        description: `Knife Sharpening Order #${order.id} - ${order.total_items} items`,
        receipt_email: order.email,
        automatic_payment_methods: {
          enabled: true,
        },
        // Configure for Australian payments
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
      });

      // Update order with payment intent ID
      await DatabaseService.updateOrder(order.id, {
        stripe_payment_id: paymentIntent.id,
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create a payment intent with amount (before order exists)
  static async createPaymentIntentWithAmount(
    amount: number, 
    customerId: string, 
    orderData: any
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'aud',
        customer: customerId,
        metadata: {
          customerEmail: orderData.email,
          customerName: `${orderData.firstName} ${orderData.lastName}`,
          serviceDate: orderData.serviceDate,
          totalItems: orderData.totalItems?.toString() || '0',
          serviceLevel: orderData.serviceLevel || 'standard',
          // Store order data for webhook processing
          orderDataJSON: JSON.stringify(orderData),
        },
        description: `Knife Sharpening Service - ${orderData.totalItems} items`,
        receipt_email: orderData.email,
        automatic_payment_methods: {
          enabled: true,
        },
        // Configure for Australian payments
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent with amount:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create or retrieve a Stripe customer from order data (before order exists)
  static async createOrRetrieveCustomerFromData(orderData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
  }): Promise<string> {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: orderData.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        
        // Update customer with latest info
        await stripe.customers.update(customer.id, {
          name: `${orderData.firstName} ${orderData.lastName}`,
          phone: orderData.phone,
          metadata: {
            address: orderData.address || 'Unknown',
          },
        });

        return customer.id;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: orderData.email,
        name: `${orderData.firstName} ${orderData.lastName}`,
        phone: orderData.phone,
        metadata: {
          address: orderData.address || 'Unknown',
        },
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating/retrieving Stripe customer from data:', error);
      throw new Error('Failed to create/retrieve customer');
    }
  }

  // Create or retrieve a Stripe customer
  static async createOrRetrieveCustomer(order: Order): Promise<string> {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: order.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        
        // Update customer with latest info
        await stripe.customers.update(customer.id, {
          name: `${order.first_name} ${order.last_name}`,
          phone: order.phone,
          metadata: {
            address: order.pickup_address,
            lastOrderId: order.id.toString(),
          },
        });

        return customer.id;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: order.email,
        name: `${order.first_name} ${order.last_name}`,
        phone: order.phone,
        metadata: {
          address: order.pickup_address,
          firstOrderId: order.id.toString(),
        },
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Retrieve payment intent details
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new Error('Failed to confirm payment intent');
    }
  }

  // Cancel payment intent
  static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      console.error('Error cancelling payment intent:', error);
      throw new Error('Failed to cancel payment intent');
    }
  }

  // Refund payment
  static async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      return await stripe.refunds.create(refundData);
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  // Get customer's payment methods
  static async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  // Create a setup intent for saving payment methods
  static async createSetupIntent(customerId: string): Promise<{
    clientSecret: string;
    setupIntentId: string;
  }> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });

      return {
        clientSecret: setupIntent.client_secret!,
        setupIntentId: setupIntent.id,
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  // Process webhook events
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log(`Processing webhook event: ${event.type}`);
    
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded event received');
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          console.log('Payment failed event received');
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          console.log('Refund event received');
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  // Handle successful payment
  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('🎉 WEBHOOK: Processing payment success for payment intent:', paymentIntent.id);
    console.log('🔍 WEBHOOK: Payment intent metadata:', paymentIntent.metadata);
    
    const orderId = paymentIntent.metadata.orderId ? parseInt(paymentIntent.metadata.orderId) : null;
    
    if (orderId) {
      // Case 1: Order already exists, just update it to paid
      console.log('Updating existing order:', orderId, 'to paid status');
      
      try {
        // Update order status to paid
        const updatedOrder = await DatabaseService.updateOrder(orderId, {
          payment_status: 'paid',
          status: 'paid',
          stripe_payment_id: paymentIntent.id,
          updated_at: new Date().toISOString(),
        });

        console.log('Order updated successfully:', updatedOrder);

        // Get the order to send confirmation SMS
        const order = await DatabaseService.getOrder(orderId);
        if (order) {
          console.log('Sending SMS confirmation for order:', orderId);
          try {
            // Import SMS service dynamically to avoid circular dependencies
            const { SMSService } = await import('./sms-service');
            await SMSService.sendOrderConfirmation(order);
            console.log('SMS confirmation sent successfully');
          } catch (smsError) {
            console.error('Failed to send SMS confirmation:', smsError);
            // Don't throw error - SMS failure shouldn't fail the webhook
          }
        } else {
          console.error('Order not found after update:', orderId);
        }
      } catch (error) {
        console.error('Failed to update order status:', error);
        throw error;
      }
    } else if (paymentIntent.metadata.orderDataJSON) {
      // Case 2: No order exists yet, create it from the stored order data
      console.log('No orderId found, but orderDataJSON exists. Creating order from webhook.');
      
      try {
        const orderData = JSON.parse(paymentIntent.metadata.orderDataJSON);
        console.log('Parsed order data:', orderData);
        
        // Import dbHelpers to calculate totals properly
        const { dbHelpers } = await import('./database');
        
        // Calculate proper totals based on items and service level
        const finalTotals = dbHelpers.calculateOrderTotals(orderData.totalItems, orderData.serviceLevel);
        
        // Create the order with paid status - matching the structure from orders API
        const newOrder = {
          first_name: orderData.firstName,
          last_name: orderData.lastName,
          email: orderData.email.toLowerCase(),
          phone: orderData.phone.replace(/\s/g, ''), // Remove spaces
          pickup_address: orderData.address,
          street_address: orderData.streetAddress || null,
          suburb: orderData.suburb || null,
          state: orderData.state ? orderData.state.substring(0, 10) : null, // Truncate to 10 chars
          postal_code: orderData.postalCode || null,
          special_instructions: orderData.specialInstructions || null,
          total_items: orderData.totalItems,
          service_level: orderData.serviceLevel,
          base_amount: finalTotals.base_amount,
          upgrade_amount: finalTotals.upgrade_amount,
          delivery_fee: finalTotals.delivery_fee,
          total_amount: finalTotals.total_amount,
          service_date: orderData.serviceDate,
          pickup_date: dbHelpers.getNextMonday(), // Legacy compatibility
          status: 'paid' as const,
          payment_status: 'paid' as const,
          stripe_payment_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string || undefined,
          confirmation_sms_sent: false,
          reminder_24h_sent: false,
          morning_reminder_sent: false,
          pickup_sms_sent: false,
          delivery_sms_sent: false,
          followup_sms_sent: false,
          confirmation_sms_status: 'pending' as const,
          reminder_24h_status: 'pending' as const,
          morning_reminder_status: 'pending' as const,
          pickup_sms_status: 'pending' as const,
          delivery_sms_status: 'pending' as const,
          followup_sms_status: 'pending' as const,
          confirmation_sms_sent_at: undefined,
          reminder_24h_sent_at: undefined,
          morning_reminder_sent_at: undefined,
          pickup_sms_sent_at: undefined,
          delivery_sms_sent_at: undefined,
          followup_sms_sent_at: undefined,
          internal_notes: undefined,
        };
        
        console.log('Creating new order from webhook:', newOrder);
        const createdOrder = await DatabaseService.createOrder(newOrder);
        console.log('Order created successfully from webhook:', createdOrder);
        
        // Send SMS confirmation
        try {
          const { SMSService } = await import('./sms-service');
          await SMSService.sendOrderConfirmation(createdOrder);
          console.log('SMS confirmation sent successfully');
        } catch (smsError) {
          console.error('Failed to send SMS confirmation:', smsError);
          // Don't throw error - SMS failure shouldn't fail the webhook
        }
        
      } catch (error) {
        console.error('Failed to create order from webhook:', error);
        throw error;
      }
    } else {
      console.error('No order ID or order data found in payment intent metadata');
      return;
    }
  }

  // Handle failed payment
  private static async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Processing payment failure for payment intent:', paymentIntent.id);
    
    const orderId = paymentIntent.metadata.orderId ? parseInt(paymentIntent.metadata.orderId) : null;
    
    if (!orderId) {
      console.error('No order ID found in payment intent metadata');
      return;
    }

    console.log('Updating order:', orderId, 'to failed status');
    
    try {
      await DatabaseService.updateOrder(orderId, {
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      });
      console.log('Order updated to failed status successfully');
    } catch (error) {
      console.error('Failed to update order to failed status:', error);
      throw error;
    }
  }

  // Handle refund
  private static async handleRefund(charge: Stripe.Charge): Promise<void> {
    if (charge.payment_intent) {
      const paymentIntent = await this.getPaymentIntent(charge.payment_intent as string);
      const orderId = parseInt(paymentIntent.metadata.orderId);
      
      if (orderId) {
        await DatabaseService.updateOrder(orderId, {
          payment_status: 'refunded',
        });
      }
    }
  }

  // Get payment analytics
  static async getPaymentAnalytics(): Promise<{
    totalRevenue: number;
    successfulPayments: number;
    failedPayments: number;
    averageOrderValue: number;
  }> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const charges = await stripe.charges.list({
        created: {
          gte: Math.floor(startOfMonth.getTime() / 1000),
        },
        limit: 100,
      });

      const successfulCharges = charges.data.filter(charge => charge.status === 'succeeded');
      const failedCharges = charges.data.filter(charge => charge.status === 'failed');

      const totalRevenue = successfulCharges.reduce((sum, charge) => sum + charge.amount, 0) / 100;
      const averageOrderValue = successfulCharges.length > 0 ? totalRevenue / successfulCharges.length : 0;

      return {
        totalRevenue,
        successfulPayments: successfulCharges.length,
        failedPayments: failedCharges.length,
        averageOrderValue,
      };
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw new Error('Failed to get payment analytics');
    }
  }
}

// Stripe configuration helpers
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  currency: 'aud',
  supportedPaymentMethods: ['card'],
};

// Payment form validation
export const paymentValidation = {
  validateCardNumber: (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  },

  validateExpiryDate: (expiryDate: string): boolean => {
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    return expMonth >= 1 && expMonth <= 12;
  },

  validateCVC: (cvc: string): boolean => {
    return /^\d{3,4}$/.test(cvc);
  },
};
