'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  orderData: any; // Order data to be created after payment
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

// Card element styling with Australian configuration
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  // Configure for Australian addresses
  hidePostalCode: true, // We'll handle postal code separately
};

// Payment form component
function PaymentFormContent({ orderData, amount, onSuccess, onError, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate postal code (4 digits, 2000-9999 range)
    const postalCodeRegex = /^[2-9]\d{3}$/;
    if (!postalCode.trim() || !postalCodeRegex.test(postalCode.trim())) {
      setError('Please enter a valid 4-digit postal code (e.g., 2000, 2481, 3000)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent with order data (no order exists yet)
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount,
          orderData, // Pass the order data for payment intent creation
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      // Confirm payment with Australian billing details
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        result.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              address: {
                country: 'AU',
                postal_code: postalCode.trim(),
              },
            },
          },
        }
      );

      if (confirmError) {
        console.error('Stripe confirmation error:', confirmError);
        throw new Error(confirmError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('💳 Payment succeeded! Order will be created by parent component.');
        
        // Call success handler - parent will create the order
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto bg-white/95 backdrop-blur-sm border border-white/30 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">
          Total Amount: <span className="font-semibold">${amount.toFixed(2)} AUD</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => {
              // Only allow digits and limit to 4 characters
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPostalCode(value);
            }}
            placeholder="e.g., 2000, 2481, 3000"
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>💳 We accept Visa, Mastercard, and American Express</p>
      </div>
    </Card>
  );
}

// Wrapper component with Stripe Elements
export function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
