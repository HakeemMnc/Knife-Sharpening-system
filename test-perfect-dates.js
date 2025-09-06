// Test the PERFECT final service date generation
require('dotenv').config({ path: '.env.local' });

function getRouteByPostcode(postcode) {
  const MOBILE_ROUTES = [
    { postcode: '2481', serviceDays: ['Monday', 'Thursday'], maxSlotsPerDay: 5, areaName: 'Byron Bay' },
    { postcode: '2482', serviceDays: ['Tuesday', 'Friday'], maxSlotsPerDay: 5, areaName: 'Mullumbimby' },
    { postcode: '2478', serviceDays: ['Wednesday', 'Saturday'], maxSlotsPerDay: 5, areaName: 'Ballina' }
  ];
  return MOBILE_ROUTES.find(route => route.postcode === postcode);
}

function testPerfectServiceDates(postcode, maxDates = 6) {
  const route = getRouteByPostcode(postcode);
  if (!route) return;
  
  console.log(`\n🎯 ${postcode} (${route.areaName}): ${route.serviceDays.join(' & ')}`);
  
  const dates = [];
  const now = new Date();
  
  // Start from tomorrow
  let searchStartDate = new Date(now);
  searchStartDate.setDate(now.getDate() + 1);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  // NEW LOGIC: Check if tomorrow is a service day
  const tomorrowDayIndex = searchStartDate.getDay();
  let alternatingIndex = 0;
  
  if (serviceDayIndices.includes(tomorrowDayIndex)) {
    // Tomorrow IS a service day! Start with it
    alternatingIndex = serviceDayIndices.indexOf(tomorrowDayIndex);
    console.log(`   🔥 Tomorrow (${dayNames[tomorrowDayIndex]}) IS a service day - starting with it!`);
  } else {
    // Tomorrow is not a service day, start with first service day
    alternatingIndex = 0;
    console.log(`   ⏭️  Tomorrow (${dayNames[tomorrowDayIndex]}) not a service day - starting with ${route.serviceDays[0]}`);
  }
  
  let currentDate = new Date(searchStartDate);
  
  // Generate dates
  for (let week = 0; week < 10 && dates.length < maxDates; week++) {
    for (let dayInWeek = 0; dayInWeek < 2 && dates.length < maxDates; dayInWeek++) {
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      const targetDayName = dayNames[targetDayIndex];
      
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      
      while (daysToAdd < 14) {
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= searchStartDate) {
          dates.push({
            date: testDate,
            dayName: targetDayName,
            dateString: testDate.toLocaleDateString('en-AU')
          });
          
          currentDate = new Date(testDate);
          currentDate.setDate(testDate.getDate() + 1);
          break;
        }
        daysToAdd++;
      }
      
      alternatingIndex = (alternatingIndex + 1) % 2;
    }
  }
  
  console.log(`   📅 ${dates.length} dates: ${dates.map(d => `${d.dayName} ${d.dateString}`).join(' → ')}`);
  
  return dates;
}

function main() {
  console.log('🚀 Testing PERFECT Service Dates');
  console.log('================================');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  console.log(`Today: ${today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`);
  console.log(`Tomorrow: ${tomorrow.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`);
  
  // Test key postcodes
  testPerfectServiceDates('2481'); // Should start Monday 8th
  testPerfectServiceDates('2482'); // Should start Friday 5th (tomorrow!)
  testPerfectServiceDates('2478'); // Should start Saturday 6th
}

main();