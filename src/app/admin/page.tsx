'use client';

import { useState } from 'react';
import AnalyticsTab from './components/AnalyticsTab';
import MessagesTab from './components/MessagesTab';
import TemplatesTab from './components/TemplatesTab';
import SmsLogsTab from './components/SmsLogsTab';
import CouponsTab from './components/CouponsTab';
import OrdersTab from './components/OrdersTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'messages' | 'templates' | 'sms-logs' | 'coupons'>('analytics');

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              Northern Rivers Knife Sharpening - Admin Dashboard
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'messages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  SMS Conversations
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'templates'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  SMS Templates
                </button>
                <button
                  onClick={() => setActiveTab('sms-logs')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sms-logs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  SMS Logs
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'coupons'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Coupons
                </button>
              </nav>
            </div>
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' && <AnalyticsTab />}

          {/* Orders Tab */}
          {activeTab === 'orders' && <OrdersTab />}

          {/* SMS Conversations Tab */}
          {activeTab === 'messages' && <MessagesTab />}

          {/* SMS Templates Tab */}
          {activeTab === 'templates' && <TemplatesTab />}

          {/* SMS Logs Tab */}
          {activeTab === 'sms-logs' && <SmsLogsTab />}

          {/* Coupons Tab */}
          {activeTab === 'coupons' && <CouponsTab />}
        </div>
      </div>
    </div>
  );
}
