'use client';

import { useState, useEffect } from 'react';

interface SmsLog {
  id: number;
  sent_at: string;
  orders: { first_name: string; last_name: string } | null;
  phone_number: string;
  sms_type: string;
  status: string;
  message_content: string;
}

export default function SmsLogsTab() {
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);

  const fetchSmsLogs = async () => {
    try {
      const response = await fetch('/api/sms/logs');
      if (!response.ok) throw new Error('Failed to fetch SMS logs');
      const result = await response.json();
      if (result.success) {
        setSmsLogs(result.logs);
      }
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">SMS Sending History</h2>
        <button
          onClick={fetchSmsLogs}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SMS Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {smsLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(log.sent_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.orders ? `${log.orders.first_name} ${log.orders.last_name}` : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.phone_number}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.sms_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.status === 'sent' || log.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : log.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {log.message_content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {smsLogs.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-gray-600">No SMS logs found</div>
          </div>
        )}
      </div>
    </div>
  );
}
