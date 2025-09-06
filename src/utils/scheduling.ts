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
  
  // Simple rule: No same-day booking, start from tomorrow
  let startDate = new Date(now);
  startDate.setDate(now.getDate() + 1); // Always start from tomorrow
  
  // Use same alternating logic as carousel for consistency
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  // Check if tomorrow is a service day - if so, start with it
  const tomorrowDayIndex = startDate.getDay();
  let alternatingIndex = 0;
  
  if (serviceDayIndices.includes(tomorrowDayIndex)) {
    alternatingIndex = serviceDayIndices.indexOf(tomorrowDayIndex);
  } else {
    alternatingIndex = 0;
  }
  
  let currentDate = new Date(startDate);
  
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
        
        if (testDate.getDay() === targetDayIndex && testDate >= startDate) {
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

  const dates: Array<{
    date: Date;
    dateString: string;
    isAvailable: boolean;
    spotsRemaining: number;
    availabilityStatus: AvailabilityStatus;
  }> = [];
  
  const now = new Date();
  
  // Simple rule: No same-day booking, start from tomorrow
  let searchStartDate = new Date(now);
  searchStartDate.setDate(now.getDate() + 1); // Always start from tomorrow
  
  // Generate service dates with proper alternation
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  // Check if tomorrow is a service day - if so, start with it
  const tomorrowDayIndex = searchStartDate.getDay();
  let alternatingIndex = 0;
  
  // Determine which service day to start with
  if (serviceDayIndices.includes(tomorrowDayIndex)) {
    // Tomorrow is a service day! Find which one it is
    alternatingIndex = serviceDayIndices.indexOf(tomorrowDayIndex);
  } else {
    // Tomorrow is not a service day, start with first service day
    alternatingIndex = 0;
  }
  
  // Generate dates by alternating between the two service days
  let currentDate = new Date(searchStartDate);
  
  // Look up to 10 weeks in the future
  for (let week = 0; week < 10 && dates.length < maxDates; week++) {
    for (let dayInWeek = 0; dayInWeek < 2 && dates.length < maxDates; dayInWeek++) {
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      
      // Find the next occurrence of this service day
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      
      while (daysToAdd < 14) { // Max 2 weeks to find the day
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= searchStartDate) {
          const serviceDate = new Date(testDate);
          const dateString = serviceDate.toISOString().split('T')[0];
          
          try {
            const response = await fetch(`/api/admin/booking-limits?startDate=${dateString}&endDate=${dateString}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
              const dailyLimit = result.data[0];
              dates.push({
                date: new Date(serviceDate),
                dateString,
                isAvailable: dailyLimit.availability_status === 'available',
                spotsRemaining: dailyLimit.spots_remaining,
                availabilityStatus: dailyLimit.availability_status
              });
            } else {
              // Default to available if no limit exists yet
              dates.push({
                date: new Date(serviceDate),
                dateString,
                isAvailable: true,
                spotsRemaining: 7,
                availabilityStatus: 'available'
              });
            }
          } catch (error) {
            console.error('Error getting carousel date info for', dateString, error);
            // On error, show date as unavailable
            dates.push({
              date: new Date(serviceDate),
              dateString,
              isAvailable: false,
              spotsRemaining: 0,
              availabilityStatus: 'closed'
            });
          }
          
          // Move currentDate to the day after this service date for next search
          currentDate = new Date(serviceDate);
          currentDate.setDate(serviceDate.getDate() + 1);
          break;
        }
        daysToAdd++;
      }
      
      // Alternate between the two service days
      alternatingIndex = (alternatingIndex + 1) % 2;
    }
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