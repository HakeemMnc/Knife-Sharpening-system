'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/database';
import BookingLimitsWidget from '@/components/BookingLimitsWidget';

interface GeoInsight {
  postcode: string;
  count: number;
}

interface DailyTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface ServiceBreakdownEntry {
  count: number;
  revenue: number;
}

interface AnalyticsData {
  revenue: {
    currentWeek: number;
    currentMonth: number;
  };
  orders: {
    totalOrders: number;
    totalItemsSharpened: number;
  };
  serviceBreakdown: {
    standard: ServiceBreakdownEntry;
    premium: ServiceBreakdownEntry;
    traditional_japanese?: ServiceBreakdownEntry;
  };
  geoInsights: GeoInsight[];
  dailyTrends: DailyTrend[];
}

interface AnalyticsTabProps {
  orders: Order[];
}

export default function AnalyticsTab({ orders }: AnalyticsTabProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [vacationDates, setVacationDates] = useState<Array<{ startDate: string; endDate: string; notes?: string }>>([]);
  const [loadingVacations, setLoadingVacations] = useState(false);
  const [bookingLimitsWidgetOpen, setBookingLimitsWidgetOpen] = useState(false);

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

  useEffect(() => {
    fetchAnalytics();
    fetchVacationDates();
  }, []);

  return (
    <>
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
                  {analytics.geoInsights.slice(0, 5).map((area: GeoInsight) => (
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
                {analytics.dailyTrends.map((day: DailyTrend) => (
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

      {/* Booking Limits Widget */}
      <BookingLimitsWidget
        isOpen={bookingLimitsWidgetOpen}
        onClose={() => setBookingLimitsWidgetOpen(false)}
      />
    </>
  );
}
