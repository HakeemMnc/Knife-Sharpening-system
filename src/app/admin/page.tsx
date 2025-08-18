'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/database';

interface Order {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_address: string;
  street_address?: string;
  suburb?: string;
  state?: string;
  postal_code?: string;
  total_items: number;
  service_level: string;
  total_amount: number;
  pickup_date: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/orders');
      const result = await response.json();

      if (result.success) {
        setOrders(result.orders);
        console.log(`Fetched ${result.orders.length} orders`);
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Network error');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Northern Rivers Knife Sharpening - Admin Dashboard</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Orders ({orders.length})</h2>
            <button 
              onClick={fetchOrders}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 30 seconds</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total_items} items
                        <div className="text-xs text-gray-500">{order.service_level}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.pickup_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'sharpening' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'ready' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="sharpening">Sharpening</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
