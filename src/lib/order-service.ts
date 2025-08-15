// Order service for handling form submissions and database operations

export interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  specialInstructions?: string;
  totalItems: number;
  serviceLevel: 'standard' | 'premium';
  finalTotal: number;
}

export interface OrderResponse {
  success: boolean;
  order?: {
    id: number;
    total: number;
    pickupDate: string;
    status: string;
  };
  error?: string;
}

export class OrderService {
  // Submit order to database
  static async submitOrder(formData: OrderFormData): Promise<OrderResponse> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to submit order'
        };
      }

      return {
        success: true,
        order: result.order
      };

    } catch (error) {
      console.error('Error submitting order:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get order by ID
  static async getOrder(orderId: number): Promise<OrderResponse> {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to fetch order'
        };
      }

      return {
        success: true,
        order: result.order
      };

    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Validate form data
  static validateFormData(data: OrderFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation
    if (!data.firstName?.trim()) errors.push('First name is required');
    if (!data.lastName?.trim()) errors.push('Last name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.phone?.trim()) errors.push('Phone number is required');
    if (!data.address?.trim()) errors.push('Address is required');
    if (!data.totalItems || data.totalItems < 1) errors.push('At least one item is required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\(\)]{10,}$/;
    if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format phone number
  static formatPhone(phone: string): string {
    return phone.replace(/[\s\-\(\)]/g, '');
  }

  // Calculate pickup date (next Monday)
  static getNextMonday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
}
