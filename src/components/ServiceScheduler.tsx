'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import { getServiceDatesForCarousel, formatServiceDate, AvailabilityStatus } from '@/utils/scheduling';

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

// Helper function for new threshold-based availability display
function getAvailabilityDisplay(spotsRemaining: number, isClosed: boolean, isFullyBooked: boolean) {
  if (isClosed) {
    return { message: "Not available", className: "text-gray-500" };
  }
  
  if (isFullyBooked || spotsRemaining === 0) {
    return { message: "Fully booked", className: "text-gray-500" };
  }
  
  // New threshold logic: only show message when 3 or fewer spots
  if (spotsRemaining <= 3) {
    return { 
      message: `${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} left`, 
      className: "text-red-500 font-medium" 
    };
  }
  
  // 4+ spots: show nothing
  return { message: "", className: "" };
}

export default function ServiceScheduler({ postcode, selectedDate, onDateSelect, isVisible = true }: ServiceSchedulerProps) {
  const [serviceDates, setServiceDates] = useState<ServiceDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  const hasAutoSelected = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

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
        const dates = await getServiceDatesForCarousel(postcode, 6); // Get exactly 6 dates for carousel
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

  // Additional effect to ensure auto-selection happens when dates finish loading
  useEffect(() => {
    if (serviceDates.length > 0 && !selectedDate && !hasAutoSelected.current && isVisible) {
      const firstAvailable = serviceDates.find(d => d.isAvailable);
      if (firstAvailable) {
        hasAutoSelected.current = true;
        onDateSelect(firstAvailable.date);
      }
    }
  }, [serviceDates]);

  // Swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    touchEndRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = Math.abs(touchStartRef.current.y - touchEndRef.current.y);

    // Only register horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      // Show all dates, not just available ones
      
      if (deltaX > 0 && mobileCurrentIndex < allDates.length - 1) {
        // Swipe left - next date
        setMobileCurrentIndex(prev => prev + 1);
      } else if (deltaX < 0 && mobileCurrentIndex > 0) {
        // Swipe right - previous date
        setMobileCurrentIndex(prev => prev - 1);
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  // Mobile navigation handlers
  const handleMobilePrev = () => {
    if (mobileCurrentIndex > 0) {
      setMobileCurrentIndex(prev => prev - 1);
    }
  };

  const handleMobileNext = () => {
    // Show all dates, not just available ones
    if (mobileCurrentIndex < allDates.length - 1) {
      setMobileCurrentIndex(prev => prev + 1);
    }
  };

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
    // Show all dates (available and unavailable) to display complete service schedule
    return serviceDates.slice(currentIndex, currentIndex + visibleCount);
  };

  const visibleDates = getVisibleDates();
  const availableCount = serviceDates.filter(d => d.isAvailable).length;
  const allDates = serviceDates; // All dates including closed ones

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
        Select Your Service Date
      </h3>
      
      {/* Desktop Carousel Navigation - Hidden on Mobile */}
      {serviceDates.length > 3 && (
        <div className="hidden md:flex justify-between items-center mb-4">
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
      
      {/* Mobile Layout - Single Card Carousel */}
      <div className="md:hidden">
        {(() => {
          // Show all dates (available and unavailable) to display complete service schedule
          if (allDates.length === 0) return null;
          
          const currentMobileDate = allDates[mobileCurrentIndex];
          if (!currentMobileDate) return null;
          
          const isSelected = selectedDate && currentMobileDate.date.toDateString() === selectedDate.toDateString();
          const isFullyBooked = currentMobileDate.availabilityStatus === 'full';
          const isClosed = currentMobileDate.availabilityStatus === 'closed';
          
          const dayName = currentMobileDate.date.toLocaleDateString('en-AU', { weekday: 'long' });
          const dateString = currentMobileDate.date.toLocaleDateString('en-AU', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          return (
            <>
              {/* Mobile Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleMobilePrev}
                  disabled={mobileCurrentIndex === 0}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-sm text-gray-600">
                  {allDates.length === 1 
                    ? '1 date available'
                    : `${allDates.length} dates available`
                  }
                </div>
                
                <button
                  onClick={handleMobileNext}
                  disabled={mobileCurrentIndex >= allDates.length - 1}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Single Card with Swipe */}
              <div 
                className="relative px-3 py-3"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="transition-transform duration-300 ease-out"
                  style={{ 
                    transform: `translateX(0%)` // Single card, no sliding needed
                  }}
                >
                  <Card
                    onClick={() => {
                      if (currentMobileDate.isAvailable) {
                        onDateSelect(currentMobileDate.date);
                      }
                    }}
                    hover={currentMobileDate.isAvailable}
                    className={`relative transition-all duration-200 shadow-md border-2 ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 shadow-xl border-blue-200 bg-blue-50' 
                        : currentMobileDate.isAvailable
                          ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer border-gray-200 bg-white'
                          : 'opacity-75 cursor-not-allowed border-gray-200 bg-gray-50'
                    }`}
                    style={{
                      minHeight: '140px',
                      borderRadius: '12px'
                    }}
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
                    
                    <div className="text-center py-4">
                      {/* Day and Date */}
                      <div className={`font-bold text-xl mb-2 ${
                        currentMobileDate.isAvailable ? '' : 'text-gray-400'
                      }`} style={currentMobileDate.isAvailable ? { color: '#1B1B1B' } : {}}>
                        {dayName}
                      </div>
                      <div className={`text-lg mb-4 font-medium ${
                        currentMobileDate.isAvailable ? '' : 'text-gray-400'
                      }`} style={currentMobileDate.isAvailable ? { color: '#4a5568' } : {}}>
                        {dateString}
                      </div>
                      
                      {/* Availability status */}
                      <div className="text-sm">
                        {(() => {
                          const display = getAvailabilityDisplay(
                            currentMobileDate.spotsRemaining,
                            isClosed,
                            isFullyBooked
                          );
                          return display.message ? (
                            <span className={display.className}>{display.message}</span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              
              {/* Dots Indicator */}
              {allDates.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {allDates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setMobileCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === mobileCurrentIndex 
                          ? 'bg-blue-500 w-4' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Desktop Layout - 3 Column Grid (Unchanged) */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {visibleDates.map((serviceDate, index) => {
          const isSelected = selectedDate && serviceDate.date.toDateString() === selectedDate.toDateString();
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
                  {(() => {
                    const display = getAvailabilityDisplay(
                      serviceDate.spotsRemaining,
                      isClosed,
                      isFullyBooked
                    );
                    return display.message ? (
                      <span className={display.className}>{display.message}</span>
                    ) : null;
                  })()}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
}