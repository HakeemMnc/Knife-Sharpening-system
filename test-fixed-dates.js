// Test the fixed service date generation
require('dotenv').config({ path: '.env.local' });

function getRouteByPostcode(postcode) {
  const MOBILE_ROUTES = [
    { postcode: '2481', serviceDays: ['Monday', 'Thursday'], maxSlotsPerDay: 5, areaName: 'Byron Bay' },
    { postcode: '2479', serviceDays: ['Monday', 'Thursday'], maxSlotsPerDay: 5, areaName: 'Bangalow' },
    { postcode: '2482', serviceDays: ['Tuesday', 'Friday'], maxSlotsPerDay: 5, areaName: 'Mullumbimby' },
    { postcode: '2483', serviceDays: ['Tuesday', 'Friday'], maxSlotsPerDay: 5, areaName: 'Brunswick Heads' },
    { postcode: '2489', serviceDays: ['Tuesday', 'Friday'], maxSlotsPerDay: 5, areaName: 'Pottsville' },
    { postcode: '2478', serviceDays: ['Wednesday', 'Saturday'], maxSlotsPerDay: 5, areaName: 'Ballina' },
    { postcode: '2477', serviceDays: ['Wednesday', 'Saturday'], maxSlotsPerDay: 5, areaName: 'Alstonville' }
  ];
  return MOBILE_ROUTES.find(route => route.postcode === postcode);
}

function testFixedServiceDates(postcode, maxDates = 7) {
  const route = getRouteByPostcode(postcode);
  if (!route) {
    console.log(`❌ Postcode ${postcode} not supported`);
    return;
  }
  
  console.log(`\n🔍 Testing FIXED ${postcode} (${route.areaName}): ${route.serviceDays.join(' & ')}`);
  
  const dates = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  let searchStartDate = new Date(now);
  if (currentHour >= 17) { // After 5pm
    searchStartDate.setDate(now.getDate() + 2);
  } else {
    searchStartDate.setDate(now.getDate() + 1);
  }
  
  console.log(`   Starting from: ${searchStartDate.toLocaleDateString()} (current hour: ${currentHour})`);
  
  // NEW FIXED LOGIC
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  let currentDate = new Date(searchStartDate);
  let alternatingIndex = 0; // Always start with first service day
  
  // Look up to 10 weeks in the future
  for (let week = 0; week < 10 && dates.length < maxDates; week++) {
    for (let dayInWeek = 0; dayInWeek < 2 && dates.length < maxDates; dayInWeek++) {
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      const targetDayName = dayNames[targetDayIndex];
      
      // Find the next occurrence of this service day
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      
      while (daysToAdd < 14) { // Max 2 weeks to find the day
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= searchStartDate) {
          dates.push({
            date: testDate,
            dayName: targetDayName,
            dateString: testDate.toLocaleDateString('en-AU')
          });
          
          // Move currentDate to the day after this service date for next search
          currentDate = new Date(testDate);
          currentDate.setDate(testDate.getDate() + 1);
          break;
        }
        daysToAdd++;
      }
      
      // Alternate between the two service days
      alternatingIndex = (alternatingIndex + 1) % 2;
    }
  }
  
  console.log(`   Found ${dates.length} service dates:`);
  dates.forEach((date, index) => {
    console.log(`   ${index + 1}. ${date.dayName} ${date.dateString}`);
  });
  
  // Check for alternation
  const dayNames2 = dates.map(d => d.dayName);
  const expectedPattern = route.serviceDays;
  
  console.log(`   Day pattern: [${dayNames2.join(', ')}]`);
  console.log(`   Expected alternation: ${expectedPattern[0]} → ${expectedPattern[1]} → ${expectedPattern[0]} → ${expectedPattern[1]}...`);
  
  // Check if it's alternating properly
  let isAlternating = true;
  for (let i = 0; i < dayNames2.length; i++) {
    const expectedDay = expectedPattern[i % 2];
    if (dayNames2[i] !== expectedDay) {
      isAlternating = false;
      console.log(`   ❌ Pattern break at position ${i + 1}: Expected ${expectedDay}, got ${dayNames2[i]}`);
    }
  }
  
  if (isAlternating) {
    console.log(`   ✅ Alternation is FIXED!`);
  }
  
  return dates;
}

async function main() {
  console.log('🚀 Testing FIXED Service Date Generation');
  console.log('=======================================');
  
  const today = new Date();
  console.log(`Today: ${today.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  console.log(`Current time: ${today.toLocaleTimeString('en-AU')}`);
  
  // Test problematic postcodes first
  const postcodes = ['2478', '2477', '2482', '2481'];
  
  for (const postcode of postcodes) {
    testFixedServiceDates(postcode, 7);
  }
}

main();