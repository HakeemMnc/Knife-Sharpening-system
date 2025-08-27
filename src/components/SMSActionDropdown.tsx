'use client';

import { Order } from '@/lib/database';

interface SMSActionDropdownProps {
  order: Order;
  onSMSAction: (orderId: number, action: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function SMSActionDropdown({ order, onSMSAction, disabled = false, compact = false }: SMSActionDropdownProps) {
  const handleSMSAction = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value;
    if (action && action !== 'select') {
      onSMSAction(order.id, action);
      // Reset dropdown to "select" state
      e.target.value = 'select';
    }
  };

  const getSMSActionOptions = () => {
    const options = [
      { value: 'select', label: compact ? 'SMS' : 'Send SMS...', disabled: false },
      { 
        value: 'confirmation', 
        label: 'Confirmation', 
        disabled: order.confirmation_sms_status === 'sent' || order.confirmation_sms_status === 'delivered'
      },
      { 
        value: 'reminder_24h', 
        label: 'D-1 Reminder', 
        disabled: order.reminder_24h_status === 'sent' || order.reminder_24h_status === 'delivered'
      },
      { 
        value: 'morning_reminder', 
        label: 'Morning', 
        disabled: order.morning_reminder_status === 'sent' || order.morning_reminder_status === 'delivered'
      },
      { 
        value: 'pickup', 
        label: 'Picked Up', 
        disabled: order.pickup_sms_status === 'sent' || order.pickup_sms_status === 'delivered'
      },
      { 
        value: 'delivery', 
        label: 'Delivered', 
        disabled: order.delivery_sms_status === 'sent' || order.delivery_sms_status === 'delivered'
      },
      { 
        value: 'followup', 
        label: 'Follow-up', 
        disabled: order.followup_sms_status === 'sent' || order.followup_sms_status === 'delivered'
      },
    ];

    return options;
  };

  return (
    <select
      onChange={handleSMSAction}
      disabled={disabled}
      defaultValue="select"
      className={`
        border border-gray-300 rounded px-2 py-1 bg-white
        ${compact ? 'text-xs' : 'text-sm'} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        ${compact ? 'touch-manipulation' : ''}
      `}
      title="Send SMS message"
    >
      {getSMSActionOptions().map((option) => (
        <option 
          key={option.value} 
          value={option.value} 
          disabled={option.disabled}
          className={option.disabled ? 'text-gray-400' : ''}
        >
          {option.label}
          {option.disabled && option.value !== 'select' ? ' ✓' : ''}
        </option>
      ))}
    </select>
  );
}