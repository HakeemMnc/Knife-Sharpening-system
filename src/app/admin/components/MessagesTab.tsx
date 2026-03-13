'use client';

import { useState, useEffect, useRef } from 'react';
import { Order } from '@/lib/database';

interface ConversationMessage {
  direction: 'inbound' | 'outbound';
  message_content: string;
  created_at: string;
}

interface OrderDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_address: string;
  service_date: string;
  pickup_time_slot: string;
  total_items: number;
  service_level: string;
  total_amount: number;
  status: string;
  payment_status: string;
  special_instructions: string | null;
  confirmation_sms_status: string | null;
  pickup_sms_status: string | null;
  delivery_sms_status: string | null;
  followup_sms_status: string | null;
  internal_notes: string | null;
}

interface Conversation {
  phone_number: string;
  order_id: number;
  customer_name: string;
  order_details: OrderDetails | null;
  messages: ConversationMessage[];
  latestMessage: ConversationMessage;
}

interface MessagesTabProps {
  orders: Order[];
}

export default function MessagesTab({ orders }: MessagesTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [sendingReply, setSendingReply] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showOrderContext, setShowOrderContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notesModal, setNotesModal] = useState<{orderId: number, notes: string, customerName: string} | null>(null);
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const formatPhoneForCall = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    return `tel:+61${digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly}`;
  };

  const formatPhoneForSMS = (phone: string): string => {
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

  // Fetch conversations on mount + 30-second auto-refresh
  useEffect(() => {
    fetchConversations();

    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.phone_number.includes(searchQuery) ||
        conv.order_id.toString().includes(searchQuery) ||
        conv.messages.some((msg: ConversationMessage) =>
          msg.message_content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

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
          (c: Conversation) => c.phone_number === phoneNumber && c.order_id === orderId
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

  const updateOrderNotes = async (orderId: number, notes: string) => {
    setUpdatingNotes(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: notes })
      });

      if (!response.ok) throw new Error('Failed to update notes');

      // Refresh conversations to show updated notes
      await fetchConversations();
      // Update selected conversation with new notes if it matches
      if (selectedConversation?.order_details?.id === orderId) {
        const updatedConversations = await fetch('/api/sms/conversations').then(r => r.json());
        const updatedConversation = updatedConversations.conversations.find(
          (c: Conversation) => c.order_details?.id === orderId
        );
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
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

  return (
    <>
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
                  {selectedConversation.messages.map((msg: ConversationMessage, idx: number) => {
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
                  {selectedConversation.order_details && (
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Internal Notes</h4>
                      <button
                        onClick={() => setNotesModal({
                          orderId: selectedConversation.order_details!.id,
                          notes: selectedConversation.order_details!.internal_notes || '',
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
                  )}

                  {/* Quick Actions */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCallCustomer(selectedConversation.order_details?.phone ?? '', selectedConversation.customer_name)}
                        className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        📞 Call Customer
                      </button>
                      <button
                        onClick={() => handleSMSCustomer(selectedConversation.order_details?.phone ?? '', selectedConversation.customer_name, selectedConversation.order_details?.id ?? 0)}
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
    </>
  );
}
