'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Settings, X, Save } from 'lucide-react';

interface BookingLimitsWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingLimitsWidget({ isOpen, onClose }: BookingLimitsWidgetProps) {
  const [dailyLimit, setDailyLimit] = useState<number>(7);
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load current settings when widget opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrentSettings();
    }
  }, [isOpen]);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch('/api/admin/booking-limits/settings');
      const result = await response.json();
      if (result.success) {
        setDailyLimit(result.data.defaultDailyCustomerLimit || 7);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateDailyLimit = async () => {
    if (dailyLimit < 1 || dailyLimit > 50) {
      setErrorMessage('Daily limit must be between 1 and 50 customers');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/booking-limits/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateGlobalLimit',
          dailyLimit: dailyLimit
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage(`Daily limit updated to ${dailyLimit} customers for all future dates`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to update daily limit');
      }
    } catch (error) {
      setErrorMessage('Network error updating daily limit');
    } finally {
      setIsLoading(false);
    }
  };

  const setVacationDates = async () => {
    if (!vacationStartDate || !vacationEndDate) {
      setErrorMessage('Please select both start and end dates for vacation');
      return;
    }

    if (new Date(vacationStartDate) >= new Date(vacationEndDate)) {
      setErrorMessage('End date must be after start date');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/booking-limits/vacation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: vacationStartDate,
          endDate: vacationEndDate
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage(`Vacation dates set: ${vacationStartDate} to ${vacationEndDate}`);
        setVacationStartDate('');
        setVacationEndDate('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to set vacation dates');
      }
    } catch (error) {
      setErrorMessage('Network error setting vacation dates');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Booking Limits</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Daily Limit Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h4 className="font-medium text-gray-900">Daily Customer Limit</h4>
          </div>
          <p className="text-sm text-gray-600">
            Set the maximum number of customers that can book each day
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="50"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value) || 7)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600">customers per day</span>
            <button
              onClick={updateDailyLimit}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <Save size={14} />
              {isLoading ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Vacation Dates Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-orange-600" />
            <h4 className="font-medium text-gray-900">Vacation Dates</h4>
          </div>
          <p className="text-sm text-gray-600">
            Hide date ranges from booking form during vacation/closure
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={vacationStartDate}
                  onChange={(e) => setVacationStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={vacationEndDate}
                  onChange={(e) => setVacationEndDate(e.target.value)}
                  min={vacationStartDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
            <button
              onClick={setVacationDates}
              disabled={isLoading || !vacationStartDate || !vacationEndDate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
            >
              <Calendar size={14} />
              {isLoading ? 'Setting...' : 'Set Vacation Dates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}