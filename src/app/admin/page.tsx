'use client';

import { useState, useEffect } from 'react';
import { getRouteByPostcode } from '@/config/mobileRoutes';

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

interface DayGroup {
  dayName: string;
  date: string;
  orders: Order[];
  isToday: boolean;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

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

  const getWeekDays = (): DayGroup[] => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    const weekDays = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      
      const dayGroup: DayGroup = {
        dayName: dayNames[i],
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        orders: [],
        isToday: date.toDateString() === today.toDateString()
      };
      
      weekDays.push(dayGroup);
    }
    
    return weekDays;
  };

  const groupOrdersByDay = (): DayGroup[] => {
    const weekDays = getWeekDays();
    
    // Group orders by their pickup date
    orders.forEach(order => {
      const orderDate = new Date(order.pickup_date).toISOString().split('T')[0];
      const dayGroup = weekDays.find(day => day.date === orderDate);
      
      if (dayGroup) {
        dayGroup.orders.push(order);
      }
    });
    
    return weekDays;
  };

  const getRouteInfo = (order: Order): string => {
    const postcode = order.postal_code;
    const route = postcode ? getRouteByPostcode(postcode) : null;
    return route?.areaName || 'Unknown Area';
  };

  const toggleDay = (dayName: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayName)) {
      newExpanded.delete(dayName);
    } else {
      newExpanded.add(dayName);
    }
    setExpandedDays(newExpanded);
  };

  const toggleOrderSelection = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrdersForDay = (dayGroup: DayGroup) => {
    const newSelected = new Set(selectedOrders);
    const dayOrderIds = dayGroup.orders.map(order => order.id);
    const allSelected = dayOrderIds.every(id => newSelected.has(id));
    
    if (allSelected) {
      dayOrderIds.forEach(id => newSelected.delete(id));
    } else {
      dayOrderIds.forEach(id => newSelected.add(id));
    }
    setSelectedOrders(newSelected);
  };

  const bulkUpdateOrderStatus = async (newStatus: string) => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to update');
      return;
    }

    const orderCount = selectedOrders.size;
    const confirmMessage = `Are you sure you want to update ${orderCount} orders to "${newStatus.replace('_', ' ')}" status?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setBulkUpdating(true);
      const selectedOrderIds = Array.from(selectedOrders);
      
      const updatePromises = selectedOrderIds.map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      const results = await Promise.all(updatePromises);
      const successful = results.filter(r => r.ok).length;
      const failed = results.length - successful;

      if (failed > 0) {
        alert(`Updated ${successful} orders successfully. ${failed} orders failed to update.`);
      } else {
        alert(`Successfully updated ${successful} orders to "${newStatus.replace('_', ' ')}" status`);
      }

      // Clear selections and refresh orders
      setSelectedOrders(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      alert('Error updating orders. Please try again.');
    } finally {
      setBulkUpdating(false);
    }
  };

  const getSelectedOrdersForDay = (dayGroup: DayGroup): number => {
    return dayGroup.orders.filter(order => selectedOrders.has(order.id)).length;
  };

  const canProgressStatus = (fromStatus: string, toStatus: string): boolean => {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['paid'],
      'paid': ['picked_up'],
      'picked_up': ['sharpening'],
      'sharpening': ['ready'],
      'ready': ['delivered'],
      'delivered': ['completed']
    };
    return validTransitions[fromStatus]?.includes(toStatus) || false;
  };

  const formatPhoneForCall = (phone: string): string => {
    // Remove any non-digit characters and format for tel: link
    const digitsOnly = phone.replace(/\D/g, '');
    return `tel:+61${digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly}`;
  };

  const formatPhoneForSMS = (phone: string): string => {
    // Remove any non-digit characters and format for SMS link
    const digitsOnly = phone.replace(/\D/g, '');
    return `sms:+61${digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly}`;
  };

  const handleCallCustomer = (phone: string, customerName: string) => {
    const phoneUrl = formatPhoneForCall(phone);
    window.open(phoneUrl, '_self');
  };

  const handleSMSCustomer = (phone: string, customerName: string, orderId: number) => {
    const phoneUrl = formatPhoneForSMS(phone);
    const defaultMessage = `Hi ${customerName.split(' ')[0]}, this is Northern Rivers Knife Sharpening regarding your order #${orderId}. `;
    const smsUrl = `${phoneUrl}?body=${encodeURIComponent(defaultMessage)}`;
    window.open(smsUrl, '_self');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`${type} copied to clipboard!`);
    }
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const getFullAddress = (order: Order): string => {
    const address = order.street_address || order.pickup_address;
    const suburb = order.suburb ? `, ${order.suburb}` : '';
    const state = order.state ? `, ${order.state}` : '';
    const postcode = order.postal_code ? ` ${order.postal_code}` : '';
    return `${address}${suburb}${state}${postcode}`;
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

          {selectedOrders.size > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedOrders.size} orders selected
                  </span>
                  <button
                    onClick={() => setSelectedOrders(new Set())}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => bulkUpdateOrderStatus('picked_up')}
                    disabled={bulkUpdating}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {bulkUpdating ? 'Updating...' : 'Mark as Picked Up'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('sharpening')}
                    disabled={bulkUpdating}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {bulkUpdating ? 'Updating...' : 'Mark as Sharpening'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('ready')}
                    disabled={bulkUpdating}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {bulkUpdating ? 'Updating...' : 'Mark as Ready'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('delivered')}
                    disabled={bulkUpdating}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {bulkUpdating ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('completed')}
                    disabled={bulkUpdating}
                    className="px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 disabled:opacity-50"
                  >
                    {bulkUpdating ? 'Updating...' : 'Mark as Completed'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-6">
              {groupOrdersByDay().map((dayGroup) => (
                <div key={dayGroup.dayName} className={`bg-white border rounded-lg shadow-sm ${
                  dayGroup.isToday ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}>
                  <div 
                    className={`px-6 py-4 border-b border-gray-200 cursor-pointer ${
                      dayGroup.isToday ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                    onClick={() => toggleDay(dayGroup.dayName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className={`text-lg font-semibold ${
                          dayGroup.isToday ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {dayGroup.dayName}
                        </h3>
                        {dayGroup.isToday && (
                          <span className="bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                            TODAY
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(dayGroup.date).toLocaleDateString()}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          dayGroup.orders.length > 0 
                            ? dayGroup.isToday 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {dayGroup.orders.length} orders
                        </span>
                        {getSelectedOrdersForDay(dayGroup) > 0 && (
                          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {getSelectedOrdersForDay(dayGroup)} selected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {dayGroup.orders.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllOrdersForDay(dayGroup);
                            }}
                            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            {dayGroup.orders.every(order => selectedOrders.has(order.id)) ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                        <svg 
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${
                            expandedDays.has(dayGroup.dayName) ? 'rotate-180' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {expandedDays.has(dayGroup.dayName) && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={dayGroup.orders.length > 0 && dayGroup.orders.every(order => selectedOrders.has(order.id))}
                                onChange={() => selectAllOrdersForDay(dayGroup)}
                                className="rounded border-gray-300"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {dayGroup.orders.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                No orders scheduled for {dayGroup.dayName}
                              </td>
                            </tr>
                          ) : (
                            dayGroup.orders.map((order) => (
                              <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.has(order.id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedOrders.has(order.id)}
                                    onChange={() => toggleOrderSelection(order.id)}
                                    className="rounded border-gray-300"
                                  />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  #{order.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {order.first_name} {order.last_name}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm text-gray-500">{order.email}</span>
                                    <button
                                      onClick={() => copyToClipboard(order.email, 'Email')}
                                      className="text-gray-400 hover:text-gray-600"
                                      title="Copy email"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                    <a
                                      href={`mailto:${order.email}?subject=Northern Rivers Knife Sharpening - Order #${order.id}`}
                                      className="text-blue-500 hover:text-blue-700"
                                      title="Send email"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </a>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm text-gray-500">{order.phone}</span>
                                    <button
                                      onClick={() => copyToClipboard(order.phone, 'Phone number')}
                                      className="text-gray-400 hover:text-gray-600"
                                      title="Copy phone number"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleCallCustomer(order.phone, `${order.first_name} ${order.last_name}`)}
                                      className="text-green-500 hover:text-green-700"
                                      title="Call customer"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleSMSCustomer(order.phone, `${order.first_name} ${order.last_name}`, order.id)}
                                      className="text-blue-500 hover:text-blue-700"
                                      title="Send SMS"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                                  <div className="flex items-start space-x-2">
                                    <div className="flex-1">
                                      <div className="truncate">
                                        {order.street_address || order.pickup_address}
                                      </div>
                                      {order.suburb && (
                                        <div className="text-xs text-gray-500">
                                          {order.suburb} {order.postal_code}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <button
                                        onClick={() => openGoogleMaps(getFullAddress(order))}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Open in Google Maps"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => copyToClipboard(getFullAddress(order), 'Address')}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Copy address"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    {getRouteInfo(order)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {order.total_items} items
                                  <div className="text-xs text-gray-500">{order.service_level}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ${order.total_amount.toFixed(2)}
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
