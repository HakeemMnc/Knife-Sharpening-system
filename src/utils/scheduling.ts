/**
 * Scheduling Utilities for Mobile Route Management
 * Handles date calculations and availability for mobile sharpening service
 */

import { getRouteByPostcode, RouteArea } from '@/config/mobileRoutes';

/**
 * Get the next available service slots for a given postcode
 * Returns the next 3 available service dates
 * Implements 5pm cutoff rule: after 5pm, tomorrow's service is not available
 */
export function getNextAvailableSlots(postcode: string): Date[] {
  const route = getRouteByPostcode(postcode);
  if (!route) {
    throw new Error(`Postcode ${postcode} is not supported by mobile service`);
  }

  const slots: Date[] = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  // Determine starting point based on 5pm cutoff rule
  let startDate = new Date(now);
  if (currentHour >= 17) { // After 5pm
    // Start checking from day after tomorrow
    startDate.setDate(now.getDate() + 2);
  } else {
    // Before 5pm, start checking from tomorrow  
    startDate.setDate(now.getDate() + 1);
  }
  
  // Look ahead up to 4 weeks to find 3 available slots
  const maxDaysToCheck = 28;
  let daysChecked = 0;
  
  while (slots.length < 3 && daysChecked < maxDaysToCheck) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + daysChecked);
    
    if (isServiceDay(postcode, checkDate)) {
      // Check if there are spots remaining (mock data for now)
      const spotsRemaining = getSpotsRemaining(checkDate);
      if (spotsRemaining > 0) {
        slots.push(new Date(checkDate));
      }
    }
    
    daysChecked++;
  }
  
  return slots;
}

/**
 * Check if a specific date is a service day for the given postcode
 */
export function isServiceDay(postcode: string, date: Date): boolean {
  const route = getRouteByPostcode(postcode);
  if (!route) return false;
  
  const dayName = getDayName(date);
  return route.serviceDays.includes(dayName);
}

/**
 * Get the number of spots remaining for a specific date
 * Mock implementation - returns random number between 1-4
 * In production, this would query the database for actual bookings
 */
export function getSpotsRemaining(date: Date): number {
  // Mock implementation - simulate varying availability
  const dateString = date.toISOString().split('T')[0];
  
  // Use date as seed for consistent "random" results
  const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const mockSpots = (seed % 4) + 1; // Returns 1-4
  
  return mockSpots;
}

/**
 * Get day name from Date object
 */
function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Get the next occurrence of a specific service day
 */
export function getNextServiceDay(postcode: string, targetDay: string): Date | null {
  const route = getRouteByPostcode(postcode);
  if (!route || !route.serviceDays.includes(targetDay)) return null;
  
  const today = new Date();
  const targetDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(targetDay);
  
  let daysUntilTarget = targetDayIndex - today.getDay();
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Next week
  }
  
  const nextServiceDay = new Date(today);
  nextServiceDay.setDate(today.getDate() + daysUntilTarget);
  
  return nextServiceDay;
}

/**
 * Check if booking is possible for a specific date and postcode
 */
export function canBookForDate(postcode: string, date: Date): boolean {
  if (!isServiceDay(postcode, date)) return false;
  if (date <= new Date()) return false; // Can't book for past dates
  
  const spotsRemaining = getSpotsRemaining(date);
  return spotsRemaining > 0;
}

/**
 * Format date for display in booking interface
 */
export function formatServiceDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-AU', options);
}

/**
 * Get service summary for a postcode
 */
export function getServiceSummary(postcode: string): {
  supported: boolean;
  serviceDays: string[];
  areaName?: string;
  nextAvailable: Date[];
} {
  const route = getRouteByPostcode(postcode);
  
  if (!route) {
    return {
      supported: false,
      serviceDays: [],
      nextAvailable: []
    };
  }
  
  return {
    supported: true,
    serviceDays: route.serviceDays,
    areaName: route.areaName,
    nextAvailable: getNextAvailableSlots(postcode)
  };
}