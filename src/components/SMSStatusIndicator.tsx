'use client';

import { Order } from '@/lib/database';

interface SMSStatusIndicatorProps {
  order: Order;
  compact?: boolean;
}

export function SMSStatusIndicator({ order, compact = false }: SMSStatusIndicatorProps) {
  const getSMSStatusIcon = (status: 'pending' | 'sent' | 'delivered' | 'failed') => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return '🟢';
      case 'failed':
        return '🔴';
      case 'pending':
      default:
        return '⚪';
    }
  };

  const smsStatuses = [
    {
      name: 'Conf',
      fullName: 'Confirmation',
      status: order.confirmation_sms_status || 'pending',
    },
    {
      name: 'D-1',
      fullName: 'D-1 Reminder', 
      status: order.reminder_24h_status || 'pending',
    },
    {
      name: 'Morning',
      fullName: 'Morning Reminder',
      status: order.morning_reminder_status || 'pending',
    },
    {
      name: 'Pickup',
      fullName: 'Pickup Confirmation',
      status: order.pickup_sms_status || 'pending',
    },
    {
      name: 'Delivery',
      fullName: 'Delivery Confirmation', 
      status: order.delivery_sms_status || 'pending',
    },
    {
      name: 'Follow',
      fullName: 'Follow-up',
      status: order.followup_sms_status || 'pending',
    },
  ];

  // Compact grid for desktop: 2x3 layout
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] leading-tight">
      {smsStatuses.map((sms) => (
        <div 
          key={sms.name} 
          className="flex items-center gap-1"
          title={`${sms.fullName}: ${sms.status}`}
        >
          <span>{getSMSStatusIcon(sms.status)}</span>
          <span className="truncate">{sms.name}</span>
        </div>
      ))}
    </div>
  );
}