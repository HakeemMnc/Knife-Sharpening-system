'use client';

import { Order } from '@/lib/database';

interface SMSStatusIndicatorProps {
  order: Order;
  compact?: boolean;
}

export function SMSStatusIndicator({ order, compact = false }: SMSStatusIndicatorProps) {
  // Temporary: Show placeholder dots while we fix the data issue
  if (!compact) {
    return (
      <div className="text-xs space-y-1 flex flex-col">
        <div className="flex items-center gap-1">
          <span>🟢</span><span>Conf</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🟢</span><span>D-1</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🟢</span><span>Morning</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚪</span><span>Pickup</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚪</span><span>Delivery</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚪</span><span>Follow-up</span>
        </div>
      </div>
    );
  }
  const getSMSStatusIcon = (status: 'pending' | 'sent' | 'delivered' | 'failed', sentAt?: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return { 
          icon: '🟢', 
          title: `Sent ${sentAt ? new Date(sentAt).toLocaleString() : ''}`,
          color: 'text-green-600' 
        };
      case 'failed':
        return { 
          icon: '🔴', 
          title: 'Failed - Click to retry',
          color: 'text-red-600' 
        };
      case 'pending':
      default:
        return { 
          icon: '⚪', 
          title: 'Not sent',
          color: 'text-gray-400' 
        };
    }
  };

  const smsStatuses = [
    {
      name: 'Confirmation',
      status: order.confirmation_sms_status || 'pending',
      sentAt: order.confirmation_sms_sent_at,
    },
    {
      name: 'D-1',
      status: order.reminder_24h_status || 'pending',
      sentAt: order.reminder_24h_sent_at,
    },
    {
      name: 'Morning',
      status: order.morning_reminder_status || 'pending',
      sentAt: order.morning_reminder_sent_at,
    },
    {
      name: 'Pickup',
      status: order.pickup_sms_status || 'pending',
      sentAt: order.pickup_sms_sent_at,
    },
    {
      name: 'Delivery',
      status: order.delivery_sms_status || 'pending',
      sentAt: order.delivery_sms_sent_at,
    },
    {
      name: 'Follow-up',
      status: order.followup_sms_status || 'pending',
      sentAt: order.followup_sms_sent_at,
    },
  ];

  if (compact) {
    // Compact version for mobile
    return (
      <div className="flex flex-wrap gap-1">
        {smsStatuses.map((sms) => {
          const statusInfo = getSMSStatusIcon(sms.status, sms.sentAt);
          return (
            <div key={sms.name} className="flex flex-col items-center" title={`${sms.name}: ${statusInfo.title}`}>
              <span className="text-xs">{statusInfo.icon}</span>
              <span className="text-[8px] text-gray-500 leading-none">{sms.name.substring(0, 3)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className="space-y-1">
      {smsStatuses.map((sms) => {
        const statusInfo = getSMSStatusIcon(sms.status, sms.sentAt);
        return (
          <div key={sms.name} className="flex items-center space-x-2 text-xs">
            <span title={statusInfo.title}>{statusInfo.icon}</span>
            <span className={`${statusInfo.color} min-w-0`}>
              {sms.name}
              {sms.sentAt && (
                <span className="text-gray-400 ml-1">
                  {new Date(sms.sentAt).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}