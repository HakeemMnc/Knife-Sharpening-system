/**
 * Scheduling Utilities for Mobile Route Management
 * Handles date calculations and availability for mobile sharpening service
 */

import { getRouteByPostcode, RouteArea } from '@/config/mobileRoutes';

export type AvailabilityStatus = 'available' | 'full' | 'closed';

/**
 * Get the next available service slots for a given postcode
 * Returns up to maxSlots available service dates (default 3)
 * Implements 5pm cutoff rule: after 5pm, tomorrow's service is not available
 */
export async function getNextAvailableSlots(
  postcode: string, 
  maxSlots: number = 3
): Promise<Date[]> {
  const route = getRouteByPostcode(postcode);
  if (!route) {
    throw new Error(`Postcode ${postcode} is not supported by mobile service`);
  }

  const slots: Date[] = [];
  const now = new Date();
  
  // Find the very next service day from today
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  // Find the next service day from today
  let nextServiceDay: Date | null = null;
  let alternatingIndex = 0;
  
  // Check each day starting from tomorrow
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + daysAhead);
    const checkDayIndex = checkDate.getDay();
    
    if (serviceDayIndices.includes(checkDayIndex)) {
      nextServiceDay = checkDate;
      alternatingIndex = serviceDayIndices.indexOf(checkDayIndex);
      break;
    }
  }
  
  if (!nextServiceDay) {
    throw new Error('Could not find next service day');
  }
  
  let currentDate = new Date(nextServiceDay);
  
  // Look up to 6 weeks in the future
  for (let week = 0; week < 6 && slots.length < maxSlots; week++) {
    for (let dayInWeek = 0; dayInWeek < 2 && slots.length < maxSlots; dayInWeek++) {
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      
      // Find the next occurrence of this service day
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      
      while (daysToAdd < 14) {
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= currentDate) {
          const dateString = testDate.toISOString().split('T')[0];
          
          try {
            const response = await fetch(`/api/admin/booking-limits?startDate=${dateString}&endDate=${dateString}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
              const dayLimit = result.data[0];
              if (dayLimit.availability_status === 'available' && dayLimit.spots_remaining > 0) {
                slots.push(new Date(testDate));
              }
            }
          } catch (error) {
            console.error('Error checking booking availability for', dateString, error);
          }
          
          currentDate = new Date(testDate);
          currentDate.setDate(testDate.getDate() + 1);
          break;
        }
        daysToAdd++;
      }
      
      alternatingIndex = (alternatingIndex + 1) % 2;
    }
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
 * Returns actual spots remaining from booking limits
 */
export async function getSpotsRemaining(date: Date): Promise<number> {
  const dateString = date.toISOString().split('T')[0];
  
  try {
    const response = await fetch(`/api/admin/booking-limits?startDate=${dateString}&endDate=${dateString}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      return result.data[0].spots_remaining || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting spots remaining for', dateString, error);
    return 0; // Fail safe - show no spots available
  }
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
export async function canBookForDate(
  postcode: string, 
  date: Date, 
  customerCount: number = 1,
  itemCount: number = 1
): Promise<boolean> {
  if (!isServiceDay(postcode, date)) return false;
  if (date <= new Date()) return false; // Can't book for past dates
  
  const dateString = date.toISOString().split('T')[0];
  
  try {
    const response = await fetch(`/api/admin/booking-limits?startDate=${dateString}&endDate=${dateString}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const dayLimit = result.data[0];
      if (dayLimit.limit_type === 'customers') {
        return (dayLimit.current_customers + customerCount) <= dayLimit.max_customers;
      } else if (dayLimit.limit_type === 'items') {
        return (dayLimit.current_items + itemCount) <= dayLimit.max_items;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking booking availability for', dateString, error);
    return false; // Fail safe - deny booking
  }
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
 * Get service dates with availability status for carousel display
 * Returns both available and full dates to show demand
 * Ensures proper alternation between the two service days
 */
export async function getServiceDatesForCarousel(
  postcode: string,
  maxDates: number = 6
): Promise<Array<{
  date: Date;
  dateString: string;
  isAvailable: boolean;
  spotsRemaining: number;
  availabilityStatus: AvailabilityStatus;
}>> {
  const route = getRouteByPostcode(postcode);
  if (!route) {
    throw new Error(`Postcode ${postcode} is not supported by mobile service`);
  }

  // Phase 1: Generate all service dates first (without API calls)
  const serviceDates: Date[] = [];
  const now = new Date();
  
  // Find the very next service day from today
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  const todayIndex = now.getDay();
  
  // Find the next service day from today
  let nextServiceDay: Date | null = null;
  let alternatingIndex = 0;
  
  // Check each day starting from tomorrow
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + daysAhead);
    const checkDayIndex = checkDate.getDay();
    
    if (serviceDayIndices.includes(checkDayIndex)) {
      nextServiceDay = checkDate;
      alternatingIndex = serviceDayIndices.indexOf(checkDayIndex);
      break;
    }
  }
  
  if (!nextServiceDay) {
    throw new Error('Could not find next service day');
  }
  
  // Start with the first service date we found
  serviceDates.push(new Date(nextServiceDay));
  
  // Generate remaining dates by alternating between the two service days
  let currentDate = new Date(nextServiceDay);
  currentDate.setDate(nextServiceDay.getDate() + 1); // Start searching from day after first service date
  
  // Look up to 10 weeks in the future to ensure we get maxDates
  for (let week = 0; week < 10 && serviceDates.length < maxDates; week++) {
    for (let dayInWeek = 0; dayInWeek < 2 && serviceDates.length < maxDates; dayInWeek++) {
      // Alternate to the next service day
      alternatingIndex = (alternatingIndex + 1) % 2;
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      
      // Find the next occurrence of this service day
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      
      while (daysToAdd < 14) { // Max 2 weeks to find the day
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= currentDate) {
          serviceDates.push(new Date(testDate));
          
          // Move currentDate to the day after this service date for next search
          currentDate = new Date(testDate);
          currentDate.setDate(testDate.getDate() + 1);
          break;
        }
        daysToAdd++;
      }
    }
  }
  
  // Phase 2: Convert to full date objects with availability info
  const dates: Array<{
    date: Date;
    dateString: string;
    isAvailable: boolean;
    spotsRemaining: number;
    availabilityStatus: AvailabilityStatus;
  }> = [];
  
  for (const serviceDate of serviceDates) {
    const dateString = serviceDate.toISOString().split('T')[0];
    
    // Default to available - only change if we successfully get limit data
    let dateInfo = {
      date: new Date(serviceDate),
      dateString,
      isAvailable: true,
      spotsRemaining: 7,
      availabilityStatus: 'available' as AvailabilityStatus
    };
    
    try {
      // Only try API call in browser context
      if (typeof window !== 'undefined') {
        const response = await fetch(`/api/admin/booking-limits?startDate=${dateString}&endDate=${dateString}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          const dailyLimit = result.data[0];
          dateInfo.isAvailable = dailyLimit.availability_status === 'available';
          dateInfo.spotsRemaining = dailyLimit.spots_remaining;
          dateInfo.availabilityStatus = dailyLimit.availability_status;
        }
      }
    } catch (error) {
      // Silently fail - keep default available status
      console.log('Booking limits check failed for', dateString, '- using default available status');
    }
    
    dates.push(dateInfo);
  }
  
  return dates;
}

/**
 * Get service summary for a postcode
 */
export async function getServiceSummary(postcode: string): Promise<{
  supported: boolean;
  serviceDays: string[];
  areaName?: string;
  nextAvailable: Date[];
}> {
  const route = getRouteByPostcode(postcode);
  
  if (!route) {
    return {
      supported: false,
      serviceDays: [],
      nextAvailable: []
    };
  }
  
  try {
    const nextAvailable = await getNextAvailableSlots(postcode);
    
    return {
      supported: true,
      serviceDays: route.serviceDays,
      areaName: route.areaName,
      nextAvailable
    };
  } catch (error) {
    console.error('Error getting service summary for postcode', postcode, error);
    return {
      supported: true,
      serviceDays: route.serviceDays,
      areaName: route.areaName,
      nextAvailable: []
    };
  }
}