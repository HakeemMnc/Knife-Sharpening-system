'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import { getNextAvailableSlots, formatServiceDate, getSpotsRemaining } from '@/utils/scheduling';

interface ServiceSchedulerProps {
  postcode: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function ServiceScheduler({ postcode, selectedDate, onDateSelect }: ServiceSchedulerProps) {
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (!postcode) {
      setLoading(false);
      setError(null);
      setAvailableSlots([]);
      hasAutoSelected.current = false;
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get next 3 available service dates for this postcode
      const slots = getNextAvailableSlots(postcode);
      setAvailableSlots(slots);
      
      // Auto-select first available date only if none selected and we haven't auto-selected before
      if (!selectedDate && slots.length > 0 && !hasAutoSelected.current) {
        hasAutoSelected.current = true;
        onDateSelect(slots[0]);
      }
      
    } catch (err) {
      console.error('ServiceScheduler: Error loading dates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load service dates');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [postcode]);

  // Reset auto-selection flag when postcode changes
  useEffect(() => {
    hasAutoSelected.current = false;
  }, [postcode]);

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

  if (availableSlots.length === 0) {
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

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B1B1B' }}>
        Select Your Service Date
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availableSlots.map((date, index) => {
          const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
          const spotsRemaining = getSpotsRemaining(date);
          
          // Format date for display
          const dayName = date.toLocaleDateString('en-AU', { weekday: 'long' });
          const dateString = date.toLocaleDateString('en-AU', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          return (
            <Card
              key={index}
              onClick={() => onDateSelect(date)}
              hover={true}
              className={`relative transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:ring-1 hover:ring-gray-300'
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
              
              <div className="text-center">
                {/* Day and Date */}
                <div className="font-semibold text-lg mb-1" style={{ color: '#1B1B1B' }}>
                  {dayName}
                </div>
                <div className="text-base mb-3" style={{ color: '#4a5568' }}>
                  {dateString}
                </div>
                
                {/* Spots remaining */}
                <div className="text-sm" style={{ 
                  color: spotsRemaining <= 1 ? '#ef4444' : '#6b7280' 
                }}>
                  {spotsRemaining === 1 
                    ? '1 spot left' 
                    : `${spotsRemaining} spots left`
                  }
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Helper text */}
      <div className="mt-4 text-sm text-center" style={{ color: '#6b7280' }}>
        📍 Mobile service available in your area • 🚐 We come to you
      </div>
    </div>
  );
}