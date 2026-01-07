'use client';

import { useState, useEffect, useRef } from 'react';
import { getRouteByPostcode } from '@/config/mobileRoutes';
import { Order } from '@/lib/database';
import { SMSStatusIndicator } from '@/components/SMSStatusIndicator';
import { SMSActionDropdown } from '@/components/SMSActionDropdown';
import BookingLimitsWidget from '@/components/BookingLimitsWidget';

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
  const [sendingSMS, setSendingSMS] = useState<{[key: number]: boolean}>({});
  const [bulkSMSAction, setBulkSMSAction] = useState<string>('');
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(new Set());
  const [modalInstructions, setModalInstructions] = useState<{orderId: number, instructions: string, customerName: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'messages' | 'templates' | 'sms-logs' | 'coupons'>('analytics');
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateContent, setTemplateContent] = useState('');
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('');
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [vacationDates, setVacationDates] = useState<Array<{ startDate: string; endDate: string; notes?: string }>>([]);
  const [loadingVacations, setLoadingVacations] = useState(false);
  const [notesModal, setNotesModal] = useState<{orderId: number, notes: string, customerName: string} | null>(null);
  const [bookingLimitsWidgetOpen, setBookingLimitsWidgetOpen] = useState(false);
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [sendingReply, setSendingReply] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showOrderContext, setShowOrderContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply templates
  const quickReplies = [
    { label: 'Thank you', text: 'Thank you for your message!' },
    { label: 'On the way', text: 'Hi! I\'m on my way to collect your knives. I\'ll be there within the next 30 minutes.' },
    { label: 'Ready for pickup', text: 'Good news! Your knives are sharpened and ready for pickup. When would be a good time for you?' },
    { label: 'Delayed', text: 'Hi, I\'m running a bit behind schedule today. I should be there within the next hour. Sorry for the inconvenience!' },
    { label: 'Quality check', text: 'Your knives have been sharpened to a professional standard. Please let me know if you have any questions when I deliver them.' },
    { label: 'Follow up', text: 'Hi! Just checking in - how are you finding the knife sharpening service? Any feedback is greatly appreciated!' },
    { label: 'Reschedule', text: 'Hi! I need to reschedule your service. When would be a better time for you?' },
    { label: 'Payment reminder', text: 'Hi! Just a friendly reminder that payment is due for your knife sharpening service. You can pay via cash or card when I deliver your knives.' }
  ];

  // Helper function for relative timestamps
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  // Helper function for avatar colors
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current+next week, -1 = previous 2 weeks, +1 = next 2 weeks after next
  const [navigatingWeeks, setNavigatingWeeks] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'sms-logs') {
      fetchSmsLogs();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
      fetchVacationDates();
    } else if (activeTab === 'messages') {
      fetchConversations();

      // Auto-refresh conversations every 30 seconds when on messages tab
      const interval = setInterval(fetchConversations, 30000);
      return () => clearInterval(interval);
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  // Refresh orders when week offset changes
  useEffect(() => {
    if (weekOffset !== 0) {
      fetchOrders();
    }
  }, [weekOffset]);

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

  // Auto-scroll to bottom when selecting a new conversation (only within messages container)
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        if (messagesEndRef.current) {
          // Find the messages container and scroll within it only
          const messagesContainer = messagesEndRef.current.closest('.overflow-y-auto');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }, 100);
    }
  }, [selectedConversation?.order_id, selectedConversation?.phone_number]); // Only trigger when conversation changes

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      // Clear previous errors when retrying
      if (error) setError('');
      
      const response = await fetch('/api/orders', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
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
        console.log('First order SMS fields:', {
          confirmation_sms_status: validatedOrders[0]?.confirmation_sms_status,
          reminder_24h_status: validatedOrders[0]?.reminder_24h_status,
          morning_reminder_status: validatedOrders[0]?.morning_reminder_status
        });
        
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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/sms/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const updateTemplate = async (id: number, content: string) => {
    try {
      const response = await fetch('/api/sms/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, template_content: content })
      });
      
      if (!response.ok) throw new Error('Failed to update template');
      
      await fetchTemplates();
      setEditingTemplate(null);
      setTemplateContent('');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  };

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

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const result = await response.json();
      if (result.success) {
        setCoupons(result.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const createCoupon = async () => {
    if (!newCouponCode || !newCouponPercent) {
      alert('Please enter a coupon code and discount percentage');
      return;
    }

    const percent = parseInt(newCouponPercent, 10);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      alert('Discount percentage must be between 1 and 100');
      return;
    }

    setSavingCoupon(true);
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discount_percent: percent,
          description: newCouponDescription || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create coupon');
      }

      await fetchCoupons();
      setNewCouponCode('');
      setNewCouponPercent('');
      setNewCouponDescription('');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert(error instanceof Error ? error.message : 'Failed to create coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const updateCoupon = async (id: number, updates: { code?: string; discount_percent?: number; description?: string; is_active?: boolean }) => {
    setSavingCoupon(true);
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update coupon');
      }

      await fetchCoupons();
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert(error instanceof Error ? error.message : 'Failed to update coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      await fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const toggleCouponActive = async (coupon: any) => {
    await updateCoupon(coupon.id, { is_active: !coupon.is_active });
  };

  const fetchAnalytics = async () => {
    try {
      let url = '/api/analytics';
      if (analyticsDateRange === 'custom' && customStartDate && customEndDate) {
        url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchVacationDates = async () => {
    setLoadingVacations(true);
    try {
      const response = await fetch('/api/admin/booking-limits/vacation');
      if (!response.ok) throw new Error('Failed to fetch vacation dates');
      const result = await response.json();
      if (result.success) {
        setVacationDates(result.data);
      }
    } catch (error) {
      console.error('Error fetching vacation dates:', error);
    } finally {
      setLoadingVacations(false);
    }
  };

  const deleteVacationPeriod = async (startDate: string, endDate: string) => {
    if (!confirm(`Are you sure you want to delete the vacation period from ${startDate} to ${endDate}?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/booking-limits/vacation', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) throw new Error('Failed to delete vacation period');
      
      const result = await response.json();
      if (result.success) {
        fetchVacationDates();
        alert(`Successfully deleted vacation period (${result.data.affectedDates} dates restored)`);
      }
    } catch (error) {
      console.error('Error deleting vacation period:', error);
      alert('Failed to delete vacation period');
    }
  };

  const updateOrderNotes = async (orderId: number, notes: string) => {
    setUpdatingNotes(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: notes })
      });

      if (!response.ok) throw new Error('Failed to update notes');

      fetchOrders(); // Refresh to show updated notes
      
      // Also refresh conversations if we're on the messages tab
      if (activeTab === 'messages') {
        await fetchConversations();
        // Update selected conversation with new notes if it matches
        if (selectedConversation?.order_details?.id === orderId) {
          const updatedConversations = await fetch('/api/sms/conversations').then(r => r.json());
          const updatedConversation = updatedConversations.conversations.find(
            (c: any) => c.order_details?.id === orderId
          );
          if (updatedConversation) {
            setSelectedConversation(updatedConversation);
          }
        }
      }
      
      setNotesModal(null);
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/sms/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const result = await response.json();
      if (result.success) {
        setConversations(result.conversations);
        setFilteredConversations(result.conversations);
        
        // Don't auto-select conversations - let user choose
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => 
        conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.phone_number.includes(searchQuery) ||
        conv.order_id.toString().includes(searchQuery) ||
        conv.messages.some((msg: any) => 
          msg.message_content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const insertQuickReply = (text: string) => {
    if (!selectedConversation) return;
    const conversationKey = `${selectedConversation.phone_number}-${selectedConversation.order_id}`;
    setReplyTexts(prev => ({ ...prev, [conversationKey]: text }));
    setShowQuickReplies(false);
  };

  const sendReply = async (phoneNumber: string, orderId?: number) => {
    const conversationKey = `${phoneNumber}-${orderId}`;
    const replyText = replyTexts[conversationKey];
    if (!replyText?.trim()) return;
    
    setSendingReply(true);
    try {
      const response = await fetch('/api/sms/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: replyText,
          orderId
        })
      });

      if (!response.ok) throw new Error('Failed to send reply');
      
      setReplyTexts(prev => ({ ...prev, [conversationKey]: '' }));
      await fetchConversations(); // Refresh to show new reply
      
      // Update selected conversation if it matches
      if (selectedConversation?.phone_number === phoneNumber && selectedConversation?.order_id === orderId) {
        const updatedConversations = await fetch('/api/sms/conversations').then(r => r.json());
        const updatedConversation = updatedConversations.conversations.find(
          (c: any) => c.phone_number === phoneNumber && c.order_id === orderId
        );
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
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

      // Auto-trigger SMS based on status change
      await handleAutoSMS(orderId, newStatus);

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

  const getWeekDays = (offset: number = 0): DayGroup[] => {
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
    
    // Apply the offset (each offset represents 2 weeks = 14 days)
    currentWeekStart.setDate(currentWeekStart.getDate() + (offset * 14));
    
    // Log for debugging week boundary calculations
    if (process.env.NODE_ENV === 'development') {
      console.log('Week calculation:', {
        today: today.toDateString(),
        dayOfWeek,
        daysToGoBack,
        offset,
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
        service_level: sanitizeString(order.service_level, 'standard') as 'standard' | 'premium' | 'traditional_japanese',
        total_amount: sanitizeNumber(order.total_amount, 0),
        service_date: sanitizeString(order.service_date, new Date().toISOString().split('T')[0]),
        pickup_date: sanitizeString(order.pickup_date, new Date().toISOString().split('T')[0]),
        status: sanitizeString(order.status, 'pending') as Order['status'],
        payment_status: sanitizeString(order.payment_status, 'unpaid') as Order['payment_status'],
        
        // SMS Status fields
        confirmation_sms_status: sanitizeString(order.confirmation_sms_status, 'pending') as Order['confirmation_sms_status'],
        reminder_24h_status: sanitizeString(order.reminder_24h_status, 'pending') as Order['reminder_24h_status'],
        morning_reminder_status: sanitizeString(order.morning_reminder_status, 'pending') as Order['morning_reminder_status'],
        pickup_sms_status: sanitizeString(order.pickup_sms_status, 'pending') as Order['pickup_sms_status'],
        delivery_sms_status: sanitizeString(order.delivery_sms_status, 'pending') as Order['delivery_sms_status'],
        followup_sms_status: sanitizeString(order.followup_sms_status, 'pending') as Order['followup_sms_status'],
        
        // SMS Timestamps
        confirmation_sms_sent_at: sanitizeOptionalString(order.confirmation_sms_sent_at),
        reminder_24h_sent_at: sanitizeOptionalString(order.reminder_24h_sent_at),
        morning_reminder_sent_at: sanitizeOptionalString(order.morning_reminder_sent_at),
        pickup_sms_sent_at: sanitizeOptionalString(order.pickup_sms_sent_at),
        delivery_sms_sent_at: sanitizeOptionalString(order.delivery_sms_sent_at),
        followup_sms_sent_at: sanitizeOptionalString(order.followup_sms_sent_at),
        
        internal_notes: sanitizeOptionalString(order.internal_notes),
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
    const weekDays = getWeekDays(weekOffset);
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

  const getDateRangeDisplay = (): string => {
    const weekDays = getWeekDays(weekOffset);
    if (weekDays.length === 0) return '';
    
    const startDate = new Date(weekDays[0].date + 'T00:00:00');
    const endDate = new Date(weekDays[weekDays.length - 1].date + 'T00:00:00');
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'short',
        year: startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
      });
    };
    
    if (weekOffset === 0) {
      return 'Current + Next Week';
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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

  // SMS Action Handlers
  const handleSMSAction = async (orderId: number, action: string) => {
    setSendingSMS(prev => ({ ...prev, [orderId]: true }));
    
    try {
      const response = await fetch(`/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          smsType: action,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS');
      }

      if (result.success) {
        alert(`SMS sent successfully!`);
        fetchOrders(); // Refresh to show updated SMS status
      } else {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to send SMS: ${errorMessage}`);
    } finally {
      setSendingSMS(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  const handleBulkSMS = async (smsType: string) => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to send SMS');
      return;
    }

    const orderCount = selectedOrders.size;
    const smsTypeLabel = getSMSTypeLabel(smsType);
    const confirmMessage = `Send "${smsTypeLabel}" SMS to ${orderCount} customers?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setBulkUpdating(true);
      const selectedOrderIds = Array.from(selectedOrders);
      
      const response = await fetch(`/api/sms/bulk-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          smsType,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send bulk SMS');
      }

      const { success, failed, results } = result;
      
      if (failed > 0) {
        alert(`Sent SMS to ${success} customers successfully. ${failed} failed.`);
      } else {
        alert(`Successfully sent "${smsTypeLabel}" SMS to ${success} customers`);
      }

      // Clear selections and refresh orders
      setSelectedOrders(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to send bulk SMS: ${errorMessage}`);
    } finally {
      setBulkUpdating(false);
    }
  };

  const getSMSTypeLabel = (smsType: string): string => {
    const labels: { [key: string]: string } = {
      'confirmation': 'Confirmation',
      'reminder_24h': 'D-1 Reminder',
      'morning_reminder': 'Morning Reminder',
      'pickup': 'Pickup Confirmation',
      'delivery': 'Delivery Confirmation',
      'followup': 'Follow-up',
    };
    return labels[smsType] || smsType;
  };

  // Auto-trigger SMS based on order status changes
  const handleAutoSMS = async (orderId: number, newStatus: string) => {
    const statusSMSMapping: { [key: string]: string } = {
      'reminder_24h': 'reminder_24h',
      'morning_reminder': 'morning_reminder', 
      'picked_up': 'pickup',
      'delivered': 'delivery'
    };

    const smsType = statusSMSMapping[newStatus];
    if (!smsType) return; // No SMS needed for this status

    try {
      console.log(`Auto-triggering ${smsType} SMS for order ${orderId} (status: ${newStatus})`);
      
      const response = await fetch(`/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          smsType,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Auto-SMS sent successfully: ${smsType} for order ${orderId}`);
      } else {
        console.error(`❌ Auto-SMS failed: ${result.message}`);
        // Don't show alert for auto-SMS failures to avoid interrupting the user
      }

      // Special case: Schedule follow-up SMS 24 hours after delivery
      if (newStatus === 'delivered') {
        console.log(`📅 Delivery status detected - scheduling follow-up SMS for 24 hours from now`);
        
        // Schedule follow-up SMS for 24 hours later
        // Note: In production, use a proper job queue. This is a demo implementation.
        setTimeout(async () => {
          try {
            console.log(`⏰ 24 hours elapsed - sending follow-up SMS for order ${orderId}`);
            
            const followUpResponse = await fetch(`/api/sms/follow-up`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId }),
            });

            const followUpResult = await followUpResponse.json();
            
            if (followUpResult.success) {
              console.log(`✅ Follow-up SMS sent successfully for order ${orderId} - Order marked as completed`);
            } else {
              console.error(`❌ Follow-up SMS failed for order ${orderId}:`, followUpResult.message);
            }
          } catch (error) {
            console.error(`Error sending scheduled follow-up SMS for order ${orderId}:`, error);
          }
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
        
        // For testing purposes, also schedule a shorter demo version (5 minutes)
        console.log(`🧪 DEMO: Also scheduling a test follow-up in 5 minutes for testing`);
        setTimeout(async () => {
          console.log(`🧪 DEMO: 5 minutes elapsed - this would be the 24h follow-up for order ${orderId}`);
          // Uncomment below to test the follow-up immediately
          // You can manually trigger this by uncommenting these lines
          /*
          try {
            const followUpResponse = await fetch(`/api/sms/follow-up`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId }),
            });
            const followUpResult = await followUpResponse.json();
            console.log('Demo follow-up result:', followUpResult);
          } catch (error) {
            console.error('Demo follow-up error:', error);
          }
          */
        }, 5 * 60 * 1000); // 5 minutes for demo
      }

    } catch (error) {
      console.error(`Error sending auto-SMS for order ${orderId}:`, error);
      // Silent failure for auto-SMS to not interrupt user workflow
    }
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

  // Simple SMS test function
  const handleTestSMS = async (orderId: number) => {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          smsType: 'confirmation'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ SMS sent successfully!');
        fetchOrders(); // Refresh to see updated status
      } else {
        alert('❌ SMS failed: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error);
      console.error('SMS test error:', error);
    }
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
      
      {/* Header: Name, Order#, Price */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={selectedOrders.has(order.id)}
            onChange={() => toggleOrderSelection(order.id)}
            className="mt-1 rounded border-gray-300 touch-manipulation"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-base">
              {order.first_name} {order.last_name}
            </h3>
            <p className="text-sm text-gray-500">#{order.id}</p>
          </div>
        </div>
        <div className="text-right ml-3">
          <p className="font-semibold text-gray-900 text-base">${order.total_amount.toFixed(2)}</p>
          <div className="flex items-center justify-end space-x-1">
            <p className="text-xs text-gray-500">{order.total_items} items</p>
            <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
              order.service_level === 'premium' 
                ? 'bg-purple-100 text-purple-700' 
                : order.service_level === 'traditional_japanese'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {order.service_level === 'premium' ? '⭐' : order.service_level === 'traditional_japanese' ? '💎' : '📋'}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-3"></div>

      {/* Status Row: Order Status + Payment Status */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
          order.status === 'paid' ? 'bg-green-100 text-green-800' :
          order.status === 'sharpening' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
          order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
          order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
          order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status.replace('_', ' ')}
        </span>
        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
          order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
          order.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.payment_status}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-3"></div>

      {/* SMS Status Section */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-2 font-medium">SMS Status</div>
        <SMSStatusIndicator order={order} compact={true} />
      </div>

      {/* Address Section */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-700 truncate flex-1">
            {order.street_address || order.pickup_address}
          </span>
          {/* Show route order number if optimized */}
          {(() => {
            const orderNum = getOptimizedOrderNumber(groupOrdersByDay().find(dg => 
              dg.orders.some(o => o.id === order.id)
            )!, order);
            return orderNum ? (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                #{orderNum}
              </span>
            ) : null;
          })()}
        </div>
        <button
          onClick={() => openGoogleMaps(getFullAddress(order))}
          className="ml-2 p-1.5 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-lg touch-manipulation flex-shrink-0"
          title="Navigate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Special Instructions */}
      {order.special_instructions && order.special_instructions.trim() !== '' && (
        <>
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-800">Special Instructions</p>
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
        </>
      )}

      {/* Internal Notes */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg mb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-800">Internal Notes</p>
              <p className="text-xs text-blue-700 mt-1">
                {order.internal_notes && order.internal_notes.trim() !== '' 
                  ? order.internal_notes 
                  : 'No internal notes'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotesModal({
              orderId: order.id,
              notes: order.internal_notes || '',
              customerName: `${order.first_name} ${order.last_name}`
            })}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-white px-2 py-1 rounded border border-blue-200 touch-manipulation flex-shrink-0"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleCallCustomer(order.phone, `${order.first_name} ${order.last_name}`)}
            className="flex items-center px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 touch-manipulation"
            title="Call Customer"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </button>
          <button
            onClick={() => handleSMSCustomer(order.phone, `${order.first_name} ${order.last_name}`, order.id)}
            className="flex items-center px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 touch-manipulation"
            title="Send SMS"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            SMS
          </button>
        </div>
        <select
          value={order.status}
          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          disabled={updatingOrderStatus[order.id]}
          className={`text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white touch-manipulation min-w-[100px] ${
            updatingOrderStatus[order.id] ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <option value="paid">💳 Paid</option>
          <option value="reminder_24h">📅 24H Reminder</option>
          <option value="morning_reminder">🌅 Morning</option>
          <option value="picked_up">📦 Picked Up</option>
          <option value="delivered">🚚 Delivered</option>
          <option value="completed">✨ Completed</option>
        </select>
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
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold">Business Analytics</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setBookingLimitsWidgetOpen(true)}
                    className="bg-purple-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-purple-700 text-sm md:text-base"
                  >
                    Booking Limits
                  </button>
                  <button 
                    onClick={fetchAnalytics}
                    className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {analytics ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600">This Week</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${analytics.revenue.currentWeek.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600">This Month</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${analytics.revenue.currentMonth.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600">Total Orders</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.orders.totalOrders}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600">Items Sharpened</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.orders.totalItemsSharpened}
                      </div>
                    </div>
                  </div>

                  {/* Time Period Selector */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium text-gray-700">View Period:</span>
                      <button
                        onClick={() => setAnalyticsDateRange('week')}
                        className={`px-3 py-1 rounded text-sm ${
                          analyticsDateRange === 'week' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setAnalyticsDateRange('month')}
                        className={`px-3 py-1 rounded text-sm ${
                          analyticsDateRange === 'month' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setAnalyticsDateRange('custom')}
                        className={`px-3 py-1 rounded text-sm ${
                          analyticsDateRange === 'custom' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Custom Range
                      </button>
                      
                      {analyticsDateRange === 'custom' && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={fetchAnalytics}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revenue and Service Breakdown */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium mb-3">Service Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Standard ({analytics.serviceBreakdown.standard.count} orders)</span>
                          <span className="font-medium">${analytics.serviceBreakdown.standard.revenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Premium ({analytics.serviceBreakdown.premium.count} orders)</span>
                          <span className="font-medium">${analytics.serviceBreakdown.premium.revenue.toFixed(2)}</span>
                        </div>
                        {analytics.serviceBreakdown.traditional_japanese && (
                          <div className="flex justify-between">
                            <span>Traditional Japanese ({analytics.serviceBreakdown.traditional_japanese.count} orders)</span>
                            <span className="font-medium">${analytics.serviceBreakdown.traditional_japanese.revenue.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium mb-3">Top Areas (by orders)</h3>
                      <div className="space-y-2">
                        {analytics.geoInsights.slice(0, 5).map((area: any) => (
                          <div key={area.postcode} className="flex justify-between text-sm">
                            <span>{area.postcode}</span>
                            <span className="font-medium">{area.count} orders</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Simple Trends */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-3">Daily Trends</h3>
                    <div className="text-sm text-gray-600 mb-2">Revenue and order count by day</div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {analytics.dailyTrends.map((day: any) => (
                        <div key={day.date} className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="flex gap-4 text-sm">
                            <span>${day.revenue.toFixed(2)}</span>
                            <span className="text-gray-500">{day.orders} orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Vacation Dates Management */}
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-orange-800">Vacation Periods</h3>
                      <button 
                        onClick={fetchVacationDates}
                        disabled={loadingVacations}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                      >
                        {loadingVacations ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>
                    {vacationDates.length > 0 ? (
                      <div className="space-y-3">
                        {vacationDates.map((period, index) => {
                          const startDate = new Date(period.startDate);
                          const endDate = new Date(period.endDate);
                          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-100">
                              <div>
                                <div className="font-medium text-orange-800">
                                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                </div>
                                <div className="text-sm text-orange-600">
                                  {diffDays} day{diffDays !== 1 ? 's' : ''}
                                  {period.notes && ` • ${period.notes}`}
                                </div>
                              </div>
                              <button
                                onClick={() => deleteVacationPeriod(period.startDate, period.endDate)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        {loadingVacations ? 'Loading vacation periods...' : 'No vacation periods scheduled'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-600">Loading analytics...</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
          <>
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
                  <option value="paid">💳 Paid</option>
                  <option value="reminder_24h">📅 24H Reminder</option>
                  <option value="morning_reminder">🌅 Morning Reminder</option>
                  <option value="picked_up">📦 Picked Up</option>
                  <option value="delivered">🚚 Delivered</option>
                  <option value="completed">✨ Completed</option>
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

          {/* Week Navigation Controls */}
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white border border-gray-200 rounded-lg">
            {/* Mobile Layout */}
            <div className="block md:hidden space-y-3">
              {/* Date Range Display */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {navigatingWeeks ? 'Loading...' : getDateRangeDisplay()}
                </div>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => {
                      setNavigatingWeeks(true);
                      setWeekOffset(0);
                      setTimeout(() => setNavigatingWeeks(false), 500);
                    }}
                    disabled={navigatingWeeks}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    Back to Current Week
                  </button>
                )}
              </div>
              
              {/* Navigation Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setNavigatingWeeks(true);
                    setWeekOffset(weekOffset - 1);
                    setTimeout(() => setNavigatingWeeks(false), 500);
                  }}
                  disabled={navigatingWeeks}
                  className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    navigatingWeeks
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-xs">Previous</span>
                </button>

                <button
                  onClick={() => {
                    setNavigatingWeeks(true);
                    setWeekOffset(weekOffset + 1);
                    setTimeout(() => setNavigatingWeeks(false), 500);
                  }}
                  disabled={navigatingWeeks}
                  className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    navigatingWeeks
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <span className="text-xs">Next</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <button
                onClick={() => {
                  setNavigatingWeeks(true);
                  setWeekOffset(weekOffset - 1);
                  setTimeout(() => setNavigatingWeeks(false), 500);
                }}
                disabled={navigatingWeeks}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  navigatingWeeks
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous 2 Weeks
              </button>

              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  {navigatingWeeks ? 'Loading...' : getDateRangeDisplay()}
                </div>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => {
                      setNavigatingWeeks(true);
                      setWeekOffset(0);
                      setTimeout(() => setNavigatingWeeks(false), 500);
                    }}
                    disabled={navigatingWeeks}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    Today
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setNavigatingWeeks(true);
                  setWeekOffset(weekOffset + 1);
                  setTimeout(() => setNavigatingWeeks(false), 500);
                }}
                disabled={navigatingWeeks}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  navigatingWeeks
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                Next 2 Weeks
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
                <div className="flex flex-wrap gap-2">
                  {/* Bulk SMS Actions - Most Used */}
                  <button
                    onClick={() => handleBulkSMS('reminder_24h')}
                    disabled={bulkUpdating}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-manipulation flex items-center gap-2"
                  >
                    <span>📅</span>
                    {bulkUpdating ? 'Sending...' : 'Send D-1 Reminder'}
                  </button>
                  
                  <button
                    onClick={() => handleBulkSMS('morning_reminder')}
                    disabled={bulkUpdating}
                    className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 touch-manipulation flex items-center gap-2"
                  >
                    <span>🌅</span>
                    {bulkUpdating ? 'Sending...' : 'Send Morning Reminder'}
                  </button>

                  {/* Delete Action */}
                  <button
                    onClick={bulkDeleteOrders}
                    disabled={bulkUpdating}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 touch-manipulation flex items-center gap-2 ml-4"
                  >
                    <span>🗑️</span>
                    {bulkUpdating ? 'Deleting...' : 'Delete Selected'}
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
                                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conf</th>
                                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">D-1</th>
                                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morn</th>
                                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick</th>
                                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Del</th>
                                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
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
                                        <button
                                          onClick={() => handleTestSMS(order.id)}
                                          className="text-green-500 hover:text-green-700"
                                          title="Test SMS (Confirmation)"
                                        >
                                          <span className="text-xs font-bold">📧</span>
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
                                                  order.special_instructions || '', 
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
                                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        order.status === 'sharpening' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                                        order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                                        order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
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
                                    <td className="px-1 py-4 whitespace-nowrap text-xs">
                                      <span className={`px-1 py-1 rounded text-xs ${
                                        order.confirmation_sms_status === 'sent' || order.confirmation_sms_status === 'delivered' 
                                          ? 'bg-green-100 text-green-800' 
                                          : order.confirmation_sms_status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
{order.confirmation_sms_status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="px-1 py-4 whitespace-nowrap text-xs">
                                      <span className={`px-1 py-1 rounded text-xs ${
                                        order.reminder_24h_status === 'sent' || order.reminder_24h_status === 'delivered' 
                                          ? 'bg-green-100 text-green-800' 
                                          : order.reminder_24h_status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {order.reminder_24h_status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="px-1 py-4 whitespace-nowrap text-xs">
                                      <span className={`px-1 py-1 rounded text-xs ${
                                        order.morning_reminder_status === 'sent' || order.morning_reminder_status === 'delivered' 
                                          ? 'bg-green-100 text-green-800' 
                                          : order.morning_reminder_status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {order.morning_reminder_status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="px-1 py-4 whitespace-nowrap text-xs">
                                      <span className={`px-1 py-1 rounded text-xs ${
                                        order.pickup_sms_status === 'sent' || order.pickup_sms_status === 'delivered' 
                                          ? 'bg-green-100 text-green-800' 
                                          : order.pickup_sms_status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {order.pickup_sms_status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="px-1 py-4 whitespace-nowrap text-xs">
                                      <span className={`px-1 py-1 rounded text-xs ${
                                        order.delivery_sms_status === 'sent' || order.delivery_sms_status === 'delivered' 
                                          ? 'bg-green-100 text-green-800' 
                                          : order.delivery_sms_status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {order.delivery_sms_status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="px-1 py-4 whitespace-nowrap text-xs">
                                      <span className={`px-1 py-1 rounded text-xs ${
                                        order.followup_sms_status === 'sent' || order.followup_sms_status === 'delivered' 
                                          ? 'bg-green-100 text-green-800' 
                                          : order.followup_sms_status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {order.followup_sms_status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className="max-w-xs truncate text-gray-600 text-xs">
                                          {order.internal_notes || 'No notes'}
                                        </div>
                                        <button
                                          onClick={() => setNotesModal({
                                            orderId: order.id,
                                            notes: order.internal_notes || '',
                                            customerName: `${order.first_name} ${order.last_name}`
                                          })}
                                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                                        >
                                          Edit
                                        </button>
                                      </div>
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
                                        <option value="paid">💳 Paid (Confirmation sent)</option>
                                        <option value="reminder_24h">📅 24H Reminder (→ SMS)</option>
                                        <option value="morning_reminder">🌅 Morning Reminder (→ SMS)</option>
                                        <option value="picked_up">📦 Picked Up (→ SMS)</option>
                                        <option value="delivered">🚚 Delivered (→ SMS + Follow-up)</option>
                                        <option value="completed">✨ Completed</option>
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
        </>
        )}

        {/* SMS Conversations Tab */}
        {activeTab === 'messages' && (
          <div className="flex h-[80vh] bg-white rounded-lg border border-gray-200 overflow-hidden relative">
            {/* Mobile Back Button */}
            {selectedConversation && (
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Left Sidebar - Conversations List */}
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 flex-col`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                  <button 
                    onClick={fetchConversations}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Refresh
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const conversationKey = `${conversation.phone_number}-${conversation.order_id}`;
                    const isSelected = selectedConversation?.phone_number === conversation.phone_number && 
                                     selectedConversation?.order_id === conversation.order_id;
                    
                    return (
                      <div 
                        key={conversationKey}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          setShowOrderContext(false); // Reset context panel when switching conversations
                        }}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        {/* Customer Info */}
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className={`w-10 h-10 ${getAvatarColor(conversation.customer_name || 'Unknown')} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                            {conversation.customer_name ? 
                              conversation.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                              '?'
                            }
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">
                                {conversation.customer_name || 'Unknown Customer'}
                              </h4>
                              <span className="text-xs text-gray-500 ml-2">
                                {getRelativeTime(conversation.latestMessage.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.phone_number} • Order #{conversation.order_id}
                            </p>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {conversation.latestMessage.direction === 'inbound' ? '' : 'You: '}
                              {conversation.latestMessage.message_content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Main Chat Area */}
            <div className="flex-1 flex">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-1.003l-3.935.925.925-3.935A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Select a conversation</p>
                    <p className="text-sm text-gray-500">Choose a conversation from the sidebar to view messages</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Section */}
                  <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${getAvatarColor(selectedConversation.customer_name || 'Unknown')} rounded-full flex items-center justify-center text-white font-semibold`}>
                            {selectedConversation.customer_name ? 
                              selectedConversation.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                              '?'
                            }
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {selectedConversation.customer_name || 'Unknown Customer'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedConversation.phone_number} • Order #{selectedConversation.order_id}
                            </p>
                          </div>
                        </div>
                        {/* Toggle Order Context Button */}
                        <button
                          onClick={() => setShowOrderContext(!showOrderContext)}
                          className={`p-2 rounded-lg transition-colors ${
                            showOrderContext 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title="Toggle order details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-1">
                      {selectedConversation.messages.map((msg: any, idx: number) => {
                        const isConsecutive = idx > 0 && 
                          selectedConversation.messages[idx - 1].direction === msg.direction &&
                          (new Date(msg.created_at).getTime() - new Date(selectedConversation.messages[idx - 1].created_at).getTime()) < 300000; // 5 minutes
                        
                        return (
                          <div key={idx}>
                            {/* Show timestamp for first message or when switching direction */}
                            {!isConsecutive && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                  {getRelativeTime(msg.created_at)}
                                </span>
                              </div>
                            )}
                            
                            <div className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mb-1' : 'mb-3'}`}>
                              <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
                                msg.direction === 'inbound' 
                                  ? 'bg-white border border-gray-200 text-gray-900' 
                                  : 'bg-blue-600 text-white'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.message_content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={replyTexts[`${selectedConversation.phone_number}-${selectedConversation.order_id}`] || ''}
                        onChange={(e) => setReplyTexts(prev => ({ 
                          ...prev, 
                          [`${selectedConversation.phone_number}-${selectedConversation.order_id}`]: e.target.value 
                        }))}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !sendingReply) {
                            sendReply(selectedConversation.phone_number, selectedConversation.order_id);
                          }
                        }}
                      />
                      <button
                        onClick={() => sendReply(selectedConversation.phone_number, selectedConversation.order_id)}
                        disabled={sendingReply || !replyTexts[`${selectedConversation.phone_number}-${selectedConversation.order_id}`]?.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
                      >
                        {sendingReply ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* Order Context Panel */}
                  {selectedConversation?.order_details && showOrderContext && (
                    <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order #:</span>
                            <span className="font-medium">{selectedConversation.order_details.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              selectedConversation.order_details.status === 'paid' ? 'bg-green-100 text-green-800' :
                              selectedConversation.order_details.status === 'sharpening' ? 'bg-yellow-100 text-yellow-800' :
                              selectedConversation.order_details.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                              selectedConversation.order_details.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                              selectedConversation.order_details.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                              selectedConversation.order_details.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedConversation.order_details.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment:</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              selectedConversation.order_details.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              selectedConversation.order_details.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedConversation.order_details.payment_status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Date:</span>
                            <span className="font-medium">{new Date(selectedConversation.order_details.service_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time Slot:</span>
                            <span className="font-medium capitalize">{selectedConversation.order_details.pickup_time_slot}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-medium">{selectedConversation.order_details.total_items}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service:</span>
                            <span className="font-medium capitalize">{selectedConversation.order_details.service_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium">${selectedConversation.order_details.total_amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* SMS Status Section */}
                      <div className="p-4 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">SMS Status</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Confirmation:</span>
                            <span className={`px-2 py-1 rounded-full ${
                              selectedConversation.order_details.confirmation_sms_status === 'sent' || selectedConversation.order_details.confirmation_sms_status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : selectedConversation.order_details.confirmation_sms_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedConversation.order_details.confirmation_sms_status || 'pending'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pickup:</span>
                            <span className={`px-2 py-1 rounded-full ${
                              selectedConversation.order_details.pickup_sms_status === 'sent' || selectedConversation.order_details.pickup_sms_status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : selectedConversation.order_details.pickup_sms_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedConversation.order_details.pickup_sms_status || 'pending'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Delivery:</span>
                            <span className={`px-2 py-1 rounded-full ${
                              selectedConversation.order_details.delivery_sms_status === 'sent' || selectedConversation.order_details.delivery_sms_status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : selectedConversation.order_details.delivery_sms_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedConversation.order_details.delivery_sms_status || 'pending'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Follow-up:</span>
                            <span className={`px-2 py-1 rounded-full ${
                              selectedConversation.order_details.followup_sms_status === 'sent' || selectedConversation.order_details.followup_sms_status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : selectedConversation.order_details.followup_sms_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedConversation.order_details.followup_sms_status || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Contact Info */}
                      <div className="p-4 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Contact Info</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium break-all">{selectedConversation.order_details.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Address:</span>
                            <p className="font-medium">{selectedConversation.order_details.pickup_address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {selectedConversation.order_details.special_instructions && (
                        <div className="p-4 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Instructions</h4>
                          <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                            {selectedConversation.order_details.special_instructions}
                          </p>
                        </div>
                      )}

                      {/* Internal Notes */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Internal Notes</h4>
                          <button
                            onClick={() => setNotesModal({
                              orderId: selectedConversation.order_details.id,
                              notes: selectedConversation.order_details.internal_notes || '',
                              customerName: selectedConversation.customer_name
                            })}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                          >
                            {selectedConversation.order_details.internal_notes ? 'Edit' : 'Add'}
                          </button>
                        </div>
                        {selectedConversation.order_details.internal_notes ? (
                          <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="whitespace-pre-wrap">{selectedConversation.order_details.internal_notes}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No internal notes yet</p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                          <button 
                            onClick={() => handleCallCustomer(selectedConversation.order_details.phone, selectedConversation.customer_name)}
                            className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            📞 Call Customer
                          </button>
                          <button 
                            onClick={() => handleSMSCustomer(selectedConversation.order_details.phone, selectedConversation.customer_name, selectedConversation.order_details.id)}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            💬 Open SMS
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* SMS Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">SMS Templates</h2>
              <button 
                onClick={fetchTemplates}
                className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
              >
                Refresh
              </button>
            </div>
            
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {template.template_name.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                      {template.placeholders && template.placeholders.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Placeholders: {template.placeholders.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setTemplateContent(template.template_content);
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  
                  {editingTemplate?.id === template.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={templateContent}
                        onChange={(e) => setTemplateContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[120px]"
                        placeholder="Enter SMS template content..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateTemplate(template.id, templateContent)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTemplate(null);
                            setTemplateContent('');
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border text-sm">
                      {template.template_content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-gray-600">No SMS templates found</div>
              </div>
            )}
          </div>
        )}

        {/* SMS Logs Tab */}
        {activeTab === 'sms-logs' && (
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
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Coupon Management</h2>
              <button
                onClick={fetchCoupons}
                className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
              >
                Refresh
              </button>
            </div>

            {/* Add New Coupon Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
              <h3 className="text-md font-medium mb-4">Create New Coupon</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME25"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    placeholder="25"
                    min="1"
                    max="100"
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 25% off first order"
                    value={newCouponDescription}
                    onChange={(e) => setNewCouponDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={createCoupon}
                    disabled={savingCoupon || !newCouponCode || !newCouponPercent}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingCoupon ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Coupons List */}
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                  {editingCoupon?.id === coupon.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                          <input
                            type="text"
                            value={editingCoupon.code}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editingCoupon.discount_percent}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_percent: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={editingCoupon.description || ''}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingCoupon(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateCoupon(coupon.id, {
                            code: editingCoupon.code,
                            discount_percent: editingCoupon.discount_percent,
                            description: editingCoupon.description,
                          })}
                          disabled={savingCoupon}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {savingCoupon ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-mono font-bold text-gray-900">{coupon.code}</span>
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                            {coupon.discount_percent}% off
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            coupon.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(coupon.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCouponActive(coupon)}
                          className={`px-3 py-1.5 text-sm rounded-lg ${
                            coupon.is_active
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {coupon.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => setEditingCoupon({ ...coupon })}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {coupons.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-600">No coupons found. Create your first coupon above!</div>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Internal Notes Modal */}
        {notesModal && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setNotesModal(null);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Internal Notes - {notesModal.customerName}
                </h3>
                <button
                  onClick={() => setNotesModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <textarea
                value={notesModal.notes}
                onChange={(e) => setNotesModal({...notesModal, notes: e.target.value})}
                placeholder="Add internal notes here... (e.g., gate code, item conditions, customer preferences, delivery instructions)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setNotesModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateOrderNotes(notesModal.orderId, notesModal.notes)}
                  disabled={updatingNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Booking Limits Widget */}
    <BookingLimitsWidget
      isOpen={bookingLimitsWidgetOpen}
      onClose={() => setBookingLimitsWidgetOpen(false)}
    />
  </div>
  );
}
