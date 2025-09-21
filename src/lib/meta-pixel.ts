/**
 * Meta Pixel tracking utilities for conversion tracking
 * Optimized for 2025 Facebook Ads performance
 */

declare global {
  interface Window {
    fbq: (action: string, event: string, data?: Record<string, unknown>, options?: Record<string, unknown>) => void;
  }
}

export const trackMetaPixelEvent = (eventName: string, data?: Record<string, unknown>, options?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      // Generate unique event ID for deduplication (2025 best practice)
      const eventID = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const enhancedOptions = {
        eventID,
        ...options
      };

      window.fbq('track', eventName, data, enhancedOptions);
      console.log('🔍 Meta Pixel tracked:', eventName, data, 'EventID:', eventID);
    } catch (error) {
      console.error('Meta Pixel tracking error:', error);
    }
  } else {
    console.warn('Meta Pixel not available');
  }
};

// Standard Meta Pixel events for knife sharpening business (2025 optimized)
export const MetaPixelEvents = {
  // When user initiates checkout (shows payment form)
  initiateCheckout: (value: number, currency: string = 'AUD', customerData?: Record<string, unknown>) => {
    trackMetaPixelEvent('InitiateCheckout', {
      value: value,
      currency: currency,
      content_type: 'service',
      content_category: 'knife_sharpening',
      content_name: 'Mobile Knife Sharpening Service',
      num_items: 1,
      predicted_ltv: value * 3, // Estimate lifetime value
      ...customerData
    });
  },

  // When user adds payment info (submits payment form)
  addPaymentInfo: (value: number, currency: string = 'AUD', customerData?: Record<string, unknown>) => {
    trackMetaPixelEvent('AddPaymentInfo', {
      value: value,
      currency: currency,
      content_type: 'service',
      content_category: 'knife_sharpening',
      ...customerData
    });
  },

  // When purchase is completed successfully
  purchase: (value: number, orderId: string, currency: string = 'AUD', customerData?: Record<string, unknown>) => {
    trackMetaPixelEvent('Purchase', {
      value: value,
      currency: currency,
      content_type: 'service',
      content_category: 'knife_sharpening',
      content_name: 'Mobile Knife Sharpening Service',
      order_id: orderId,
      num_items: 1,
      contents: [
        {
          id: 'knife_sharpening_service',
          quantity: 1,
          item_price: value
        }
      ],
      ...customerData
    });
  },

  // Lead generation (when user starts booking process)
  lead: (value?: number, currency: string = 'AUD', leadSource?: string) => {
    trackMetaPixelEvent('Lead', {
      value: value || 20, // Default service price
      currency: currency,
      content_category: 'knife_sharpening',
      content_name: 'Knife Sharpening Lead',
      lead_source: leadSource || 'website_form'
    });
  },

  // Custom event for service booking - 2025 enhanced
  completeRegistration: (customerData?: Record<string, unknown>) => {
    trackMetaPixelEvent('CompleteRegistration', {
      content_category: 'knife_sharpening',
      content_name: 'Service Registration Complete',
      status: 'completed',
      ...customerData
    });
  },

  // New 2025 event: ViewContent for service page views
  viewContent: (contentName: string, value?: number) => {
    trackMetaPixelEvent('ViewContent', {
      content_type: 'service',
      content_category: 'knife_sharpening',
      content_name: contentName,
      value: value,
      currency: 'AUD'
    });
  },

  // New 2025 event: Contact form submission
  contact: (method: string = 'form') => {
    trackMetaPixelEvent('Contact', {
      content_category: 'knife_sharpening',
      contact_method: method
    });
  }
};