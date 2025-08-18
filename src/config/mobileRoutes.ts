/**
 * Mobile Route Schedule Configuration
 * 6-day weekly mobile sharpening service where technician visits customers
 * Each area is serviced twice per week for optimal coverage
 */

export interface RouteArea {
  postcode: string;
  serviceDays: string[]; // ['Monday', 'Thursday']
  maxSlotsPerDay: number;
  areaName?: string; // Optional friendly name
}

export const MOBILE_ROUTES: RouteArea[] = [
  // Monday & Thursday Route - Byron Bay Area
  {
    postcode: '2481',
    serviceDays: ['Monday', 'Thursday'],
    maxSlotsPerDay: 5,
    areaName: 'Byron Bay'
  },
  {
    postcode: '2479',
    serviceDays: ['Monday', 'Thursday'], 
    maxSlotsPerDay: 5,
    areaName: 'Bangalow'
  },
  
  // Tuesday & Friday Route - South Coast
  {
    postcode: '2482',
    serviceDays: ['Tuesday', 'Friday'],
    maxSlotsPerDay: 5,
    areaName: 'Mullumbimby'
  },
  {
    postcode: '2483',
    serviceDays: ['Tuesday', 'Friday'],
    maxSlotsPerDay: 5,
    areaName: 'Brunswick Heads'
  },
  {
    postcode: '2489',
    serviceDays: ['Tuesday', 'Friday'],
    maxSlotsPerDay: 5,
    areaName: 'Pottsville'
  },
  
  // Wednesday & Saturday Route - North Coast
  {
    postcode: '2478',
    serviceDays: ['Wednesday', 'Saturday'],
    maxSlotsPerDay: 5,
    areaName: 'Ballina'
  },
  {
    postcode: '2477',
    serviceDays: ['Wednesday', 'Saturday'],
    maxSlotsPerDay: 5,
    areaName: 'Alstonville'
  }
];

/**
 * Service day mapping for quick lookups
 */
export const SERVICE_DAYS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday', 
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday'
} as const;

/**
 * Get route configuration for a specific postcode
 */
export function getRouteByPostcode(postcode: string): RouteArea | undefined {
  return MOBILE_ROUTES.find(route => route.postcode === postcode);
}

/**
 * Get all postcodes serviced on a specific day
 */
export function getPostcodesByDay(day: string): RouteArea[] {
  return MOBILE_ROUTES.filter(route => route.serviceDays.includes(day));
}

/**
 * Get all available service days across all routes
 */
export function getAllServiceDays(): string[] {
  const days = new Set<string>();
  MOBILE_ROUTES.forEach(route => {
    route.serviceDays.forEach(day => days.add(day));
  });
  return Array.from(days).sort();
}

/**
 * Check if a postcode is supported by mobile service
 */
export function isPostcodeSupported(postcode: string): boolean {
  return MOBILE_ROUTES.some(route => route.postcode === postcode);
}