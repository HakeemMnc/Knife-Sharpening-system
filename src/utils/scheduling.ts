/**
 * Scheduling Utilities for Mobile Route Management
 * Handles date calculations and availability for mobile sharpening service
 */

import { getRouteByPostcode, RouteArea } from '@/config/mobileRoutes';
import { BookingLimitsService, DailyLimit, AvailabilityStatus } from '@/lib/booking-limits';

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
  
  // Look ahead up to 4 weeks to find available slots
  const maxDaysToCheck = 28;
  let daysChecked = 0;
  
  while (slots.length < maxSlots && daysChecked < maxDaysToCheck) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + daysChecked);
    
    if (isServiceDay(postcode, checkDate)) {
      const dateString = checkDate.toISOString().split('T')[0];
      
      try {
        // Check if bookings are available for this date
        const canBook = await BookingLimitsService.canBookForDate(dateString, 1, 1);
        if (canBook) {
          slots.push(new Date(checkDate));
        }
      } catch (error) {
        console.error('Error checking booking availability for', dateString, error);
        // On error, skip this date for safety
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
 * Returns actual spots remaining from booking limits
 */
export async function getSpotsRemaining(date: Date): Promise<number> {
  const dateString = date.toISOString().split('T')[0];
  
  try {
    const dailyLimit = await BookingLimitsService.getDailyLimit(dateString);
    return dailyLimit?.spots_remaining || 0;
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
    return await BookingLimitsService.canBookForDate(dateString, customerCount, itemCount);
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
 */
export async function getServiceDatesForCarousel(
  postcode: string,
  maxDates: number = 5
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
  const currentHour = now.getHours();
  
  // Determine starting point based on 5pm cutoff rule
  let startDate = new Date(now);
  if (currentHour >= 17) { // After 5pm
    startDate.setDate(now.getDate() + 2);
  } else {
    startDate.setDate(now.getDate() + 1);
  }
  
  // Look ahead up to 6 weeks to find enough dates for carousel
  const maxDaysToCheck = 42;
  let daysChecked = 0;
  
  while (dates.length < maxDates && daysChecked < maxDaysToCheck) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + daysChecked);
    
    if (isServiceDay(postcode, checkDate)) {
      const dateString = checkDate.toISOString().split('T')[0];
      
      try {
        const dailyLimit = await BookingLimitsService.getDailyLimit(dateString);
        
        if (dailyLimit) {
          dates.push({
            date: new Date(checkDate),
            dateString,
            isAvailable: dailyLimit.availability_status === 'available',
            spotsRemaining: dailyLimit.spots_remaining,
            availabilityStatus: dailyLimit.availability_status
          });
        }
      } catch (error) {
        console.error('Error getting carousel date info for', dateString, error);
        // On error, show date as unavailable
        dates.push({
          date: new Date(checkDate),
          dateString,
          isAvailable: false,
          spotsRemaining: 0,
          availabilityStatus: 'closed'
        });
      }
    }
    
    daysChecked++;
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