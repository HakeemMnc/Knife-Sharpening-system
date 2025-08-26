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
  special_instructions?: string;
  total_items: number;
  service_level: string;
  total_amount: number;
  service_date: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [optimizedRoutes, setOptimizedRoutes] = useState<{[key: string]: Order[]}>({});
  const [routeOptimizing, setRouteOptimizing] = useState<{[key: string]: boolean}>({});
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<{[key: number]: boolean}>({});
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(new Set());
  const [modalInstructions, setModalInstructions] = useState<{orderId: number, instructions: string, customerName: string} | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalInstructions) {
        closeInstructionsModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalInstructions]);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      // Clear previous errors when retrying
      if (error) setError('');
      
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.success && Array.isArray(result.orders)) {
        // Validate and sanitize all orders
        const validatedOrders = result.orders
          .map(validateAndSanitizeOrder)
          .filter((order): order is Order => order !== null);
        
        const skippedCount = result.orders.length - validatedOrders.length;
        if (skippedCount > 0) {
          console.warn(`Skipped ${skippedCount} invalid orders out of ${result.orders.length}`);
        }
        
        setOrders(validatedOrders);
        console.log(`Fetched ${validatedOrders.length} valid orders (${skippedCount} skipped)`);
        
        // Clear any previous errors on successful fetch
        if (error) setError('');
      } else {
        setError(result.error || 'Invalid response format from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
      setError(`Failed to load orders: ${errorMessage}`);
      console.error('Error fetching orders:', error);
      
      // Keep existing orders if this was a refresh (don't clear the UI)
      // Only clear orders if this was the initial load
      if (orders.length === 0) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    // Set loading state for this specific order
    setUpdatingOrderStatus(prev => ({ ...prev, [orderId]: true }));
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update order`);
      }

      // Refresh orders on success
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update order #${orderId}: ${errorMessage}`);
    } finally {
      // Clear loading state for this order
      setUpdatingOrderStatus(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  const getWeekDays = (): DayGroup[] => {
    // Use local timezone consistently for business operations
    const today = new Date();
    const currentWeekStart = new Date(today);
    
    // Handle Sunday edge case: getDay() returns 0 for Sunday, but we want Monday-based weeks
    // For Sunday (0), we want to go back 6 days to get the previous Monday
    // For Monday (1), we want to stay on the same day (go back 0 days)
    // For Tuesday (2), we want to go back 1 day, etc.
    const dayOfWeek = today.getDay();
    const daysToGoBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentWeekStart.setDate(today.getDate() - daysToGoBack);
    
    // Log for debugging week boundary calculations
    if (process.env.NODE_ENV === 'development') {
      console.log('Week calculation:', {
        today: today.toDateString(),
        dayOfWeek,
        daysToGoBack,
        currentWeekStart: currentWeekStart.toDateString()
      });
    }
    
    // Helper function to get YYYY-MM-DD in local timezone (not UTC)
    const getLocalDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayDateString = getLocalDateString(today);
    
    const weekDays = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Generate 2 weeks (14 days)
    for (let i = 0; i < 14; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      
      // Validate that the date was created successfully
      if (isNaN(date.getTime())) {
        console.error('Invalid date generated for day', i, 'from base date', currentWeekStart);
        continue; // Skip invalid dates
      }
      
      const dateString = getLocalDateString(date);
      
      const dayGroup: DayGroup = {
        dayName: dayNames[i % 7],
        date: dateString,
        orders: [],
        isToday: dateString === todayDateString
      };
      
      weekDays.push(dayGroup);
    }
    
    return weekDays;
  };

  // Helper function to validate and sanitize order data
  const validateAndSanitizeOrder = (order: any): Order | null => {
    try {
      // Check required fields
      if (!order || typeof order.id !== 'number' || order.id <= 0) {
        console.warn('Invalid order: missing or invalid ID', order);
        return null;
      }

      // Sanitize strings and provide defaults
      const sanitizeString = (value: any, fallback: string = 'N/A'): string => {
        if (typeof value !== 'string') return fallback;
        return value.trim() || fallback;
      };

      const sanitizeOptionalString = (value: any): string | undefined => {
        if (typeof value !== 'string') return undefined;
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
      };

      const sanitizeNumber = (value: any, fallback: number = 0): number => {
        const num = Number(value);
        return isNaN(num) || num < 0 ? fallback : num;
      };

      return {
        id: order.id,
        first_name: sanitizeString(order.first_name, 'Unknown'),
        last_name: sanitizeString(order.last_name, 'Customer'),
        email: sanitizeString(order.email, 'no-email@example.com'),
        phone: sanitizeString(order.phone, 'No phone'),
        pickup_address: sanitizeString(order.pickup_address, 'No address provided'),
        street_address: sanitizeOptionalString(order.street_address),
        suburb: sanitizeOptionalString(order.suburb),
        state: sanitizeOptionalString(order.state),
        postal_code: sanitizeOptionalString(order.postal_code),
        special_instructions: sanitizeOptionalString(order.special_instructions),
        total_items: sanitizeNumber(order.total_items, 1),
        service_level: sanitizeString(order.service_level, 'standard'),
        total_amount: sanitizeNumber(order.total_amount, 0),
        service_date: sanitizeString(order.service_date, new Date().toISOString().split('T')[0]),
        pickup_date: sanitizeString(order.pickup_date, new Date().toISOString().split('T')[0]),
        status: sanitizeString(order.status, 'pending'),
        payment_status: sanitizeString(order.payment_status, 'unpaid'),
        created_at: sanitizeString(order.created_at, new Date().toISOString())
      };
    } catch (error) {
      console.error('Error validating order:', order, error);
      return null;
    }
  };

  // Helper function to safely convert date to local YYYY-MM-DD format
  const safeGetLocalDateString = (dateInput: string | Date | null | undefined): string | null => {
    if (!dateInput) return null;
    
    try {
      const date = new Date(dateInput);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Invalid date format:', dateInput, error);
      return null;
    }
  };

  const groupOrdersByDay = (): DayGroup[] => {
    const weekDays = getWeekDays();
    const filteredOrders = filterOrders(orders);
    
    // Group filtered orders by their service date
    filteredOrders.forEach(order => {
      const orderDateString = safeGetLocalDateString(order.service_date);
      
      // Skip orders with invalid dates
      if (!orderDateString) {
        console.warn('Skipping order with invalid service_date:', order.id, order.service_date);
        return;
      }
      
      const dayGroup = weekDays.find(day => day.date === orderDateString);
      
      // Only add orders to non-Sunday days (customers can't book on Sunday)
      if (dayGroup && dayGroup.dayName !== 'Sunday') {
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

  const bulkDeleteOrders = async () => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to delete');
      return;
    }

    const orderCount = selectedOrders.size;
    const confirmMessage = `⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE ${orderCount} orders?\n\nThis action cannot be undone and will completely remove the orders from the database.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setBulkUpdating(true);
      const selectedOrderIds = Array.from(selectedOrders);
      
      const deletePromises = selectedOrderIds.map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);
      const successful = results.filter(r => r.ok).length;
      const failed = results.length - successful;

      if (failed > 0) {
        alert(`Deleted ${successful} orders successfully. ${failed} orders failed to delete.`);
      } else {
        alert(`Successfully deleted ${successful} orders permanently`);
      }

      // Clear selections and refresh orders
      setSelectedOrders(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      alert('Error deleting orders. Please try again.');
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

  const filterOrders = (orders: Order[]): Order[] => {
    return orders.filter(order => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          order.first_name.toLowerCase().includes(query) ||
          order.last_name.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.phone.includes(query) ||
          order.id.toString().includes(query) ||
          getFullAddress(order).toLowerCase().includes(query) ||
          getRouteInfo(order).toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Payment status filter
      if (paymentStatusFilter !== 'all' && order.payment_status !== paymentStatusFilter) {
        return false;
      }

      // Area filter
      if (areaFilter !== 'all') {
        const orderArea = getRouteInfo(order);
        if (orderArea !== areaFilter) {
          return false;
        }
      }

      return true;
    });
  };

  const getUniqueAreas = (): string[] => {
    const areas = new Set<string>();
    orders.forEach(order => {
      areas.add(getRouteInfo(order));
    });
    return Array.from(areas).filter(area => area !== 'Unknown Area').sort();
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setAreaFilter('all');
  };

  const getFilteredOrdersCount = (): number => {
    return filterOrders(orders).length;
  };

  const hasSpecialInstructions = (ordersList: Order[]): boolean => {
    return ordersList.some(order => order.special_instructions && order.special_instructions.trim() !== '');
  };

  const toggleInstructionExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedInstructions);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedInstructions(newExpanded);
  };

  const shouldTruncateInstructions = (text: string): boolean => {
    return text.length > 50; // Truncate if longer than 50 characters
  };

  const getTruncatedText = (text: string): string => {
    return text.length > 50 ? text.substring(0, 47) + '...' : text;
  };

  const openInstructionsModal = (orderId: number, instructions: string, customerName: string) => {
    setModalInstructions({ orderId, instructions, customerName });
  };

  const closeInstructionsModal = () => {
    setModalInstructions(null);
  };

  const MobileOrderCard = ({ order }: { order: Order }) => (
    <div className={`relative p-4 bg-white border rounded-lg ${
      selectedOrders.has(order.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    } ${updatingOrderStatus[order.id] ? 'opacity-75' : ''}`}>
      {/* Loading overlay */}
      {updatingOrderStatus[order.id] && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={selectedOrders.has(order.id)}
            onChange={() => toggleOrderSelection(order.id)}
            className="mt-1 rounded border-gray-300 touch-manipulation"
          />
          <div>
            <h3 className="font-medium text-gray-900">
              {order.first_name} {order.last_name}
            </h3>
            <p className="text-sm text-gray-500">#{order.id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">${order.total_amount.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{order.total_items} items</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
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
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
            order.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.payment_status}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 flex-1">
            <span className="text-gray-600 truncate">
              {order.street_address || order.pickup_address}
            </span>
            {/* Show route order number if optimized */}
            {(() => {
              const orderNum = getOptimizedOrderNumber(groupOrdersByDay().find(dg => 
                dg.orders.some(o => o.id === order.id)
              )!, order);
              return orderNum ? (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                  #{orderNum}
                </span>
              ) : null;
            })()}
          </div>
          <button
            onClick={() => openGoogleMaps(getFullAddress(order))}
            className="ml-2 p-1 text-blue-500 hover:text-blue-700 touch-manipulation"
            title="Navigate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {order.special_instructions && order.special_instructions.trim() !== '' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-800">Special Instructions:</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {expandedInstructions.has(order.id) 
                    ? order.special_instructions
                    : getTruncatedText(order.special_instructions)
                  }
                </p>
                {shouldTruncateInstructions(order.special_instructions) && (
                  <button
                    onClick={() => toggleInstructionExpansion(order.id)}
                    className="text-yellow-600 hover:text-yellow-800 text-xs mt-1 underline font-medium touch-manipulation"
                  >
                    {expandedInstructions.has(order.id) ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleCallCustomer(order.phone, `${order.first_name} ${order.last_name}`)}
              className="p-2 text-green-500 hover:text-green-700 bg-green-50 rounded-lg touch-manipulation"
              title="Call"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button
              onClick={() => handleSMSCustomer(order.phone, `${order.first_name} ${order.last_name}`, order.id)}
              className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-lg touch-manipulation"
              title="SMS"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            disabled={updatingOrderStatus[order.id]}
            className={`text-xs border border-gray-300 rounded-lg px-2 py-1 touch-manipulation ${
              updatingOrderStatus[order.id] ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="picked_up">Picked Up</option>
            <option value="sharpening">Sharpening</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Route Optimization Functions
  const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const getApproximateCoordinates = async (address: string): Promise<{lat: number, lng: number} | null> => {
    // This is a simplified geocoding for the Northern Rivers area
    // In production, use Google Geocoding API with your API key
    const addressLower = address.toLowerCase();
    
    // Northern Rivers approximate coordinates
    if (addressLower.includes('byron bay') || addressLower.includes('2481')) {
      return { lat: -28.6474, lng: 153.6020 };
    } else if (addressLower.includes('bangalow') || addressLower.includes('2479')) {
      return { lat: -28.6877, lng: 153.5367 };
    } else if (addressLower.includes('mullumbimby') || addressLower.includes('2482')) {
      return { lat: -28.5543, lng: 153.4951 };
    } else if (addressLower.includes('brunswick heads') || addressLower.includes('2483')) {
      return { lat: -28.5414, lng: 153.5526 };
    } else if (addressLower.includes('pottsville') || addressLower.includes('2489')) {
      return { lat: -28.3906, lng: 153.5632 };
    } else if (addressLower.includes('ballina') || addressLower.includes('2478')) {
      return { lat: -28.8669, lng: 153.5634 };
    } else if (addressLower.includes('alstonville') || addressLower.includes('2477')) {
      return { lat: -28.8433, lng: 153.4370 };
    }
    
    // Default to Byron Bay area center if no match
    return { lat: -28.6474, lng: 153.6020 };
  };

  const optimizeRoute = (
    startLocation: {lat: number, lng: number}, 
    destinations: {order: Order, coords: {lat: number, lng: number}}[]
  ): Order[] => {
    if (destinations.length === 0) return [];
    if (destinations.length === 1) return [destinations[0].order];

    // Nearest neighbor algorithm for route optimization
    const optimizedOrder: Order[] = [];
    const remaining = [...destinations];
    let currentLocation = startLocation;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        remaining[0].coords.lat,
        remaining[0].coords.lng
      );

      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          remaining[i].coords.lat,
          remaining[i].coords.lng
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = remaining.splice(nearestIndex, 1)[0];
      optimizedOrder.push(nearest.order);
      currentLocation = nearest.coords;
    }

    return optimizedOrder;
  };

  const optimizeRouteForDay = async (dayGroup: DayGroup) => {
    // Early validation before setting state
    if (dayGroup.orders.length === 0) {
      alert('No orders to optimize for this day');
      return;
    }

    // Set optimizing state
    setRouteOptimizing(prev => ({ ...prev, [dayGroup.dayName]: true }));

    try {
      // Get current location
      const currentLocation = await getCurrentLocation();

      // Get coordinates for all addresses
      const destinations: {order: Order, coords: {lat: number, lng: number}}[] = [];
      
      for (const order of dayGroup.orders) {
        const address = getFullAddress(order);
        const coords = await getApproximateCoordinates(address);
        if (coords) {
          destinations.push({ order, coords });
        }
      }

      if (destinations.length === 0) {
        throw new Error('Could not geocode any addresses. Please check the addresses and try again.');
      }

      // Optimize the route
      const optimizedOrders = optimizeRoute(currentLocation, destinations);
      
      if (optimizedOrders.length === 0) {
        throw new Error('Route optimization failed to return any results.');
      }
      
      // Store optimized route
      setOptimizedRoutes(prev => ({ ...prev, [dayGroup.dayName]: optimizedOrders }));

      alert(`Route optimized! ${optimizedOrders.length} stops in optimal order.`);

    } catch (error) {
      console.error('Route optimization error:', error);
      
      let errorMessage = 'Error optimizing route. Please try again.';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Please check your GPS and try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Could not get your location. Please enable location services and try again.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Route Optimization Failed: ${errorMessage}`);
    } finally {
      // Always clear the optimizing state, even if there were early returns or errors
      setRouteOptimizing(prev => ({ ...prev, [dayGroup.dayName]: false }));
    }
  };

  const openFullRoute = (dayGroup: DayGroup) => {
    const optimizedOrders = optimizedRoutes[dayGroup.dayName] || dayGroup.orders;
    
    if (optimizedOrders.length === 0) {
      alert('No orders to navigate to');
      return;
    }

    // Create Google Maps URL with multiple waypoints
    const firstAddress = encodeURIComponent(getFullAddress(optimizedOrders[0]));
    
    if (optimizedOrders.length === 1) {
      // Single destination
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${firstAddress}`;
      window.open(mapsUrl, '_blank');
      return;
    }

    // Multiple destinations with waypoints
    const waypoints = optimizedOrders.slice(1).map(order => 
      encodeURIComponent(getFullAddress(order))
    ).join('|');
    
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${firstAddress}&waypoints=${waypoints}&travelmode=driving&dir_action=navigate`;
    window.open(mapsUrl, '_blank');
  };

  const getOptimizedOrderNumber = (dayGroup: DayGroup, order: Order): number | null => {
    const optimizedOrdersForDay = optimizedRoutes[dayGroup.dayName];
    if (!optimizedOrdersForDay) return null;
    
    const index = optimizedOrdersForDay.findIndex(o => o.id === order.id);
    return index !== -1 ? index + 1 : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-900 mb-2">Loading Admin Dashboard</div>
          <div className="text-sm text-gray-500">Fetching orders and preparing your 2-week view...</div>
        </div>
      </div>
    );
  }

  // Show error as a banner instead of blocking the entire UI (if we have existing orders)
  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-600 text-lg font-medium mb-2">Unable to Load Orders</div>
            <div className="text-gray-600 text-sm mb-4">{error}</div>
            <div className="space-y-3">
              <button 
                onClick={fetchOrders}
                disabled={refreshing}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? 'Retrying...' : 'Try Again'}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 flex-1 mr-3">
              {isMobileView ? 'NRKS Admin' : 'Northern Rivers Knife Sharpening - Admin Dashboard'}
            </h1>
            {isMobileView && (
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="p-2 bg-blue-600 text-white rounded-lg flex-shrink-0"
                title="Toggle filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </button>
            )}
          </div>

          {/* Error Banner - show if there's an error but we have existing orders */}
          {error && orders.length > 0 && (
            <div className="mb-4 md:mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Sync Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <p className="text-xs text-red-600 mt-1">Showing cached data. Some information may be outdated.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchOrders}
                    disabled={refreshing}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {refreshing ? 'Retrying...' : 'Retry'}
                  </button>
                  <button
                    onClick={() => setError('')}
                    className="text-red-500 hover:text-red-700"
                    title="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">
                Orders ({getFilteredOrdersCount()}{!isMobileView && ` of ${orders.length}`})
              </h2>
              <button 
                onClick={fetchOrders}
                disabled={refreshing}
                className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {refreshing ? (isMobileView ? '⟳' : 'Refreshing...') : (isMobileView ? '⟳' : 'Refresh')}
              </button>
            </div>
            {!isMobileView && (
              <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 30 seconds</p>
            )}
          </div>

          {/* Search and Filters */}
          <div className={`mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg ${
            isMobileView && !showMobileFilters ? 'hidden' : ''
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              {/* Search Bar */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search Orders
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, order ID, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="sharpening">Sharpening</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment
                </label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Payments</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Area
                </label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Areas</option>
                  {getUniqueAreas().map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display & Clear Button */}
            {(searchQuery || statusFilter !== 'all' || paymentStatusFilter !== 'all' || areaFilter !== 'all') && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Search: &quot;{searchQuery}&quot;
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Status: {statusFilter.replace('_', ' ')}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {paymentStatusFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Payment: {paymentStatusFilter}
                      <button
                        onClick={() => setPaymentStatusFilter('all')}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {areaFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      Area: {areaFilter}
                      <button
                        onClick={() => setAreaFilter('all')}
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {selectedOrders.size > 0 && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 md:gap-4">
                <div className="flex items-center justify-between md:justify-start md:space-x-2">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedOrders.size} selected
                  </span>
                  <button
                    onClick={() => setSelectedOrders(new Set())}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                  <button
                    onClick={() => bulkUpdateOrderStatus('picked_up')}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 touch-manipulation"
                  >
                    {bulkUpdating ? 'Updating...' : isMobileView ? 'Picked Up' : 'Mark as Picked Up'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('sharpening')}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 touch-manipulation"
                  >
                    {bulkUpdating ? 'Updating...' : isMobileView ? 'Sharpening' : 'Mark as Sharpening'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('ready')}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 touch-manipulation"
                  >
                    {bulkUpdating ? 'Updating...' : isMobileView ? 'Ready' : 'Mark as Ready'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('delivered')}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 disabled:opacity-50 touch-manipulation"
                  >
                    {bulkUpdating ? 'Updating...' : isMobileView ? 'Delivered' : 'Mark as Delivered'}
                  </button>
                  <button
                    onClick={() => bulkUpdateOrderStatus('completed')}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 disabled:opacity-50 touch-manipulation col-span-2 md:col-span-1"
                  >
                    {bulkUpdating ? 'Updating...' : isMobileView ? 'Completed' : 'Mark as Completed'}
                  </button>
                  <button
                    onClick={bulkDeleteOrders}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 touch-manipulation col-span-2 md:col-span-1"
                  >
                    {bulkUpdating ? 'Deleting...' : isMobileView ? '🗑️ Delete' : '🗑️ Permanent Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : getFilteredOrdersCount() === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.94-6.02 2.47M3 17.5l9-9 9 9" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No orders match your filters</p>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your search criteria or clearing some filters
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {groupOrdersByDay().map((dayGroup, index) => (
                <div key={`${dayGroup.dayName}-${dayGroup.date}`}>
                  {/* Add divider before next week */}
                  {index === 7 && (
                    <div className="flex items-center my-4 md:my-6">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="px-2 md:px-4 text-xs md:text-sm text-gray-500 font-medium">Next Week</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                  )}
                  
                  <div className={`bg-white border rounded-lg shadow-sm ${
                    dayGroup.isToday ? 'border-blue-500 ring-2 ring-blue-200' : 
                    dayGroup.dayName === 'Sunday' ? 'border-gray-100 bg-gray-50' : 'border-gray-200'
                  }`}>
                  <div 
                    className={`px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 ${
                      dayGroup.dayName === 'Sunday' ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      dayGroup.isToday ? 'bg-blue-50' : 
                      dayGroup.dayName === 'Sunday' ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
                    onClick={dayGroup.dayName === 'Sunday' ? undefined : () => toggleDay(dayGroup.dayName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-base md:text-lg font-semibold ${
                            dayGroup.isToday ? 'text-blue-900' : 
                            dayGroup.dayName === 'Sunday' ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {dayGroup.dayName}
                            {dayGroup.dayName === 'Sunday' && (
                              <span className="ml-2 text-xs font-normal text-gray-400">(Off Day)</span>
                            )}
                          </h3>
                          {dayGroup.isToday && (
                            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              TODAY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          {!isMobileView && (
                            <span className="text-gray-500">
                              {new Date(dayGroup.date).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            dayGroup.orders.length > 0 
                              ? dayGroup.isToday 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dayGroup.orders.length} orders
                          </span>
                          {getSelectedOrdersForDay(dayGroup) > 0 && (
                            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {getSelectedOrdersForDay(dayGroup)} selected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {dayGroup.orders.length > 0 && dayGroup.dayName !== 'Sunday' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectAllOrdersForDay(dayGroup);
                              }}
                              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded touch-manipulation"
                            >
                              {dayGroup.orders.every(order => selectedOrders.has(order.id)) 
                                ? (isMobileView ? 'Clear' : 'Deselect All') 
                                : (isMobileView ? 'All' : 'Select All')
                              }
                            </button>
                            
                            {/* Route Optimization Buttons */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                optimizeRouteForDay(dayGroup);
                              }}
                              disabled={routeOptimizing[dayGroup.dayName]}
                              className="text-xs px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded touch-manipulation disabled:opacity-50"
                              title="Optimize route from your current location"
                            >
                              {routeOptimizing[dayGroup.dayName] 
                                ? (isMobileView ? '⟳' : 'Optimizing...') 
                                : (isMobileView ? '🗺️' : 'Optimize Route')
                              }
                            </button>
                            
                            {optimizedRoutes[dayGroup.dayName] && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFullRoute(dayGroup);
                                }}
                                className="text-xs px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded touch-manipulation"
                                title="Open full route in Google Maps"
                              >
                                {isMobileView ? '📍' : 'Open Route'}
                              </button>
                            )}
                          </>
                        )}
                        {dayGroup.dayName !== 'Sunday' && (
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
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedDays.has(dayGroup.dayName) && dayGroup.dayName !== 'Sunday' && (
                    <div className="p-3 md:p-0">
                      {dayGroup.orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No orders scheduled for {dayGroup.dayName}
                        </div>
                      ) : (
                        <>
                          {/* Mobile Card View */}
                          <div className="md:hidden space-y-3">
                            {dayGroup.orders.map((order) => (
                              <MobileOrderCard key={order.id} order={order} />
                            ))}
                          </div>
                          
                          {/* Desktop Table View */}
                          <div className="hidden md:block overflow-x-auto">
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
                                  {hasSpecialInstructions(dayGroup.orders) && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Instructions</th>
                                  )}
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {dayGroup.orders.map((order) => (
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
                                          <div className="flex items-center space-x-2">
                                            <div className="truncate">
                                              {order.street_address || order.pickup_address}
                                            </div>
                                            {/* Show route order number if optimized */}
                                            {(() => {
                                              const orderNum = getOptimizedOrderNumber(dayGroup, order);
                                              return orderNum ? (
                                                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                                  #{orderNum}
                                                </span>
                                              ) : null;
                                            })()}
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
                                    {hasSpecialInstructions(dayGroup.orders) && (
                                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                                        {order.special_instructions && order.special_instructions.trim() !== '' ? (
                                          <div>
                                            <div className="truncate">
                                              {getTruncatedText(order.special_instructions)}
                                            </div>
                                            {shouldTruncateInstructions(order.special_instructions) && (
                                              <button
                                                onClick={() => openInstructionsModal(
                                                  order.id, 
                                                  order.special_instructions, 
                                                  `${order.first_name} ${order.last_name}`
                                                )}
                                                className="text-blue-500 hover:text-blue-700 text-xs mt-1 underline"
                                              >
                                                Read more
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-gray-400 italic">None</span>
                                        )}
                                      </td>
                                    )}
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
                                        disabled={updatingOrderStatus[order.id]}
                                        className={`border border-gray-300 rounded px-2 py-1 text-xs ${
                                          updatingOrderStatus[order.id] ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
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
                        </>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Instructions Modal */}
        {modalInstructions && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
            onClick={closeInstructionsModal}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Special Instructions</h3>
                  <button
                    onClick={closeInstructionsModal}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Order #{modalInstructions.orderId} - {modalInstructions.customerName}
                </p>
              </div>
              <div className="p-4 overflow-y-auto max-h-60">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {modalInstructions.instructions}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <button
                  onClick={closeInstructionsModal}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
