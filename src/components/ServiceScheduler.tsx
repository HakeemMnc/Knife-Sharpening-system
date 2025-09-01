'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import { getServiceDatesForCarousel, formatServiceDate } from '@/utils/scheduling';
import { AvailabilityStatus } from '@/lib/booking-limits';

interface ServiceDate {
  date: Date;
  dateString: string;
  isAvailable: boolean;
  spotsRemaining: number;
  availabilityStatus: AvailabilityStatus;
}

interface ServiceSchedulerProps {
  postcode: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  isVisible?: boolean;
}

export default function ServiceScheduler({ postcode, selectedDate, onDateSelect, isVisible = true }: ServiceSchedulerProps) {
  const [serviceDates, setServiceDates] = useState<ServiceDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (!postcode) {
      setLoading(false);
      setError(null);
      setServiceDates([]);
      setCurrentIndex(0);
      hasAutoSelected.current = false;
      return;
    }

    const loadServiceDates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get service dates for carousel (both available and full)
        const dates = await getServiceDatesForCarousel(postcode, 7); // Get up to 7 dates for carousel
        setServiceDates(dates);
        
        // Auto-select first available date if none is currently selected
        if (!selectedDate && dates.length > 0 && !hasAutoSelected.current) {
          const firstAvailable = dates.find(d => d.isAvailable);
          if (firstAvailable) {
            hasAutoSelected.current = true;
            onDateSelect(firstAvailable.date);
          }
        }
        
      } catch (err) {
        console.error('ServiceScheduler: Error loading dates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service dates');
        setServiceDates([]);
      } finally {
        setLoading(false);
      }
    };

    loadServiceDates();
  }, [postcode]);

  // Reset auto-selection flag when postcode changes
  useEffect(() => {
    hasAutoSelected.current = false;
  }, [postcode]);

  // Auto-select first available date when component becomes visible (for step 2)
  useEffect(() => {
    if (isVisible && !selectedDate && serviceDates.length > 0 && !hasAutoSelected.current) {
      const firstAvailable = serviceDates.find(d => d.isAvailable);
      if (firstAvailable) {
        hasAutoSelected.current = true;
        onDateSelect(firstAvailable.date);
      }
    }
  }, [isVisible, selectedDate, serviceDates, onDateSelect]);

  if (!postcode) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
          Select Your Service Date
        </h3>
        <Card className="text-center py-8">
          <div className="text-gray-600 mb-2">📍 Enter your postcode first</div>
          <div className="text-sm text-gray-500">We'll show available service dates for your area</div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
          Select Your Service Date
        </h3>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading available dates...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
          Select Your Service Date
        </h3>
        <Card className="text-center py-8">
          <div className="text-red-600 mb-2">⚠️ Service Not Available</div>
          <div className="text-sm text-gray-600">{error}</div>
        </Card>
      </div>
    );
  }

  if (serviceDates.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
          Select Your Service Date
        </h3>
        <Card className="text-center py-8">
          <div className="text-gray-600 mb-2">📅 No dates available</div>
          <div className="text-sm text-gray-500">Please check back later or contact us directly</div>
        </Card>
      </div>
    );
  }

  // Helper function to get visible dates for carousel
  const getVisibleDates = () => {
    const visibleCount = 3; // Show 3 dates at a time
    const availableDates = serviceDates.filter(d => d.isAvailable);
    
    // If we have enough available dates, show those
    if (availableDates.length >= visibleCount) {
      return availableDates.slice(currentIndex, currentIndex + visibleCount);
    } else {
      // Mix available and unavailable to show demand
      return serviceDates.slice(currentIndex, currentIndex + visibleCount);
    }
  };

  const visibleDates = getVisibleDates();
  const availableCount = serviceDates.filter(d => d.isAvailable).length;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
        Select Your Service Date
      </h3>
      
      {/* Carousel Navigation */}
      {serviceDates.length > 3 && (
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-sm text-gray-600">
            {availableCount === 0 
              ? 'All upcoming dates are fully booked' 
              : availableCount === 1 
                ? '1 date available'
                : `${availableCount} dates available`
            }
          </div>
          
          <button
            onClick={() => setCurrentIndex(Math.min(serviceDates.length - 3, currentIndex + 1))}
            disabled={currentIndex >= serviceDates.length - 3}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleDates.map((serviceDate, index) => {
          const isSelected = selectedDate && serviceDate.date.getTime() === selectedDate.getTime();
          const isFullyBooked = serviceDate.availabilityStatus === 'full';
          const isClosed = serviceDate.availabilityStatus === 'closed';
          
          // Format date for display
          const dayName = serviceDate.date.toLocaleDateString('en-AU', { weekday: 'long' });
          const dateString = serviceDate.date.toLocaleDateString('en-AU', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          return (
            <Card
              key={serviceDate.dateString}
              onClick={() => {
                if (serviceDate.isAvailable) {
                  onDateSelect(serviceDate.date);
                }
              }}
              hover={serviceDate.isAvailable}
              className={`relative transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : serviceDate.isAvailable
                    ? 'hover:ring-1 hover:ring-gray-300 cursor-pointer'
                    : 'opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Fully booked indicator */}
              {isFullyBooked && (
                <div className="absolute top-3 left-3">
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    FULL
                  </div>
                </div>
              )}
              
              {/* Closed indicator */}
              {isClosed && (
                <div className="absolute top-3 left-3">
                  <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    CLOSED
                  </div>
                </div>
              )}
              
              <div className="text-center">
                {/* Day and Date */}
                <div className={`font-semibold text-lg mb-1 ${
                  serviceDate.isAvailable ? '' : 'text-gray-400'
                }`} style={serviceDate.isAvailable ? { color: '#1B1B1B' } : {}}>
                  {dayName}
                </div>
                <div className={`text-base mb-3 ${
                  serviceDate.isAvailable ? '' : 'text-gray-400'
                }`} style={serviceDate.isAvailable ? { color: '#4a5568' } : {}}>
                  {dateString}
                </div>
                
                {/* Availability status */}
                <div className="text-sm">
                  {isClosed ? (
                    <span className="text-gray-500">Not available</span>
                  ) : isFullyBooked ? (
                    <span className="text-red-500 font-medium">Fully booked</span>
                  ) : serviceDate.spotsRemaining === 1 ? (
                    <span className="text-orange-600 font-medium">1 spot left</span>
                  ) : (
                    <span className="text-green-600">
                      {serviceDate.spotsRemaining} spots left
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
}