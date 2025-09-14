/**
 * Test Service Date Fix
 * Verify that the correct first service dates are shown for all three service areas
 * Run: node test-service-date-fix.js
 */

// Mock the mobile routes configuration
const MOBILE_ROUTES = [
  // Service Area 1: Byron Bay Area (Monday & Thursday)
  { postcode: '2481', serviceDays: ['Monday', 'Thursday'], areaName: 'Byron Bay' },
  { postcode: '2479', serviceDays: ['Monday', 'Thursday'], areaName: 'Bangalow' },
  
  // Service Area 2: South Coast (Tuesday & Friday)  
  { postcode: '2482', serviceDays: ['Tuesday', 'Friday'], areaName: 'Mullumbimby' },
  { postcode: '2483', serviceDays: ['Tuesday', 'Friday'], areaName: 'Brunswick Heads' },
  { postcode: '2489', serviceDays: ['Tuesday', 'Friday'], areaName: 'Pottsville' },
  
  // Service Area 3: North Coast (Wednesday & Saturday)
  { postcode: '2478', serviceDays: ['Wednesday', 'Saturday'], areaName: 'Ballina' },
  { postcode: '2477', serviceDays: ['Wednesday', 'Saturday'], areaName: 'Alstonville' }
];

function getRouteByPostcode(postcode) {
  return MOBILE_ROUTES.find(route => route.postcode === postcode);
}

function findNextServiceDay(route) {
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  // Find the next service day from today
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + daysAhead);
    const checkDayIndex = checkDate.getDay();
    
    if (serviceDayIndices.includes(checkDayIndex)) {
      return {
        date: checkDate,
        dayName: dayNames[checkDayIndex],
        alternatingIndex: serviceDayIndices.indexOf(checkDayIndex)
      };
    }
  }
  
  return null;
}

function generateServiceDates(postcode, maxDates = 6) {
  const route = getRouteByPostcode(postcode);
  if (!route) return [];
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  const firstService = findNextServiceDay(route);
  if (!firstService) return [];
  
  const serviceDates = [firstService.date];
  let alternatingIndex = firstService.alternatingIndex;
  let currentDate = new Date(firstService.date);
  currentDate.setDate(firstService.date.getDate() + 1);
  
  // Generate remaining dates
  for (let i = 0; i < 10 && serviceDates.length < maxDates; i++) {
    for (let dayInWeek = 0; dayInWeek < 2 && serviceDates.length < maxDates; dayInWeek++) {
      alternatingIndex = (alternatingIndex + 1) % 2;
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      
      while (daysToAdd < 14) {
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= currentDate) {
          serviceDates.push(new Date(testDate));
          
          currentDate = new Date(testDate);
          currentDate.setDate(testDate.getDate() + 1);
          break;
        }
        daysToAdd++;
      }
    }
  }
  
  return serviceDates;
}

// Test function
function testServiceDates() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-AU', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  console.log(`\n🗓️  Testing Service Date Fix - Today: ${todayStr}\n`);
  
  // Group postcodes by service area
  const serviceAreas = [
    { name: 'Service Area 1 (Monday & Thursday)', postcodes: ['2481', '2479'] },
    { name: 'Service Area 2 (Tuesday & Friday)', postcodes: ['2482', '2483', '2489'] },  
    { name: 'Service Area 3 (Wednesday & Saturday)', postcodes: ['2478', '2477'] }
  ];
  
  serviceAreas.forEach((area, areaIndex) => {
    console.log(`\n${area.name}:`);
    console.log('='.repeat(50));
    
    area.postcodes.forEach((postcode, postcodeIndex) => {
      const route = getRouteByPostcode(postcode);
      const dates = generateServiceDates(postcode, 6);
      
      console.log(`\n📍 ${postcode} (${route.areaName}):`);
      
      if (dates.length > 0) {
        dates.forEach((date, i) => {
          const dateStr = date.toLocaleDateString('en-AU', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          });
          const isFirst = i === 0;
          console.log(`   ${i + 1}. ${dateStr}${isFirst ? ' ⭐ (FIRST)' : ''}`);
        });
      } else {
        console.log('   ❌ No service dates found');
      }
    });
  });
  
  console.log(`\n✅ Test completed at ${new Date().toLocaleTimeString()}\n`);
}

// Run the test
testServiceDates();