// Test the final simplified service date generation
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

function testSimpleServiceDates(postcode, maxDates = 6) {
  const route = getRouteByPostcode(postcode);
  if (!route) {
    console.log(`❌ Postcode ${postcode} not supported`);
    return;
  }
  
  console.log(`\n🔍 Testing SIMPLE ${postcode} (${route.areaName}): ${route.serviceDays.join(' & ')}`);
  
  const dates = [];
  const now = new Date();
  
  // NEW SIMPLE RULE: Start from tomorrow (no time checks)
  let searchStartDate = new Date(now);
  searchStartDate.setDate(now.getDate() + 1); // Always start from tomorrow
  
  console.log(`   Starting from tomorrow: ${searchStartDate.toLocaleDateString()}`);
  
  // Same alternating logic
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  let currentDate = new Date(searchStartDate);
  let alternatingIndex = 0;
  
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
  
  console.log(`   Found ${dates.length} service dates:`);
  dates.forEach((date, index) => {
    console.log(`   ${index + 1}. ${date.dayName} ${date.dateString}`);
  });
  
  // Check alternation
  const dayNames2 = dates.map(d => d.dayName);
  const expectedPattern = route.serviceDays;
  
  console.log(`   Pattern: [${dayNames2.join(' → ')}]`);
  
  let isAlternating = true;
  for (let i = 0; i < dayNames2.length; i++) {
    const expectedDay = expectedPattern[i % 2];
    if (dayNames2[i] !== expectedDay) {
      isAlternating = false;
      console.log(`   ❌ Pattern break at position ${i + 1}`);
    }
  }
  
  if (isAlternating && dates.length === 6) {
    console.log(`   ✅ Perfect: 6 dates with proper alternation!`);
  }
  
  return dates;
}

function main() {
  console.log('🚀 Testing FINAL Simple Service Dates');
  console.log('====================================');
  
  const today = new Date();
  console.log(`Today: ${today.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  console.log(`Tomorrow: ${new Date(today.getTime() + 24*60*60*1000).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  
  // Test all service areas
  console.log('\n🔧 Service Area 1 (Mon/Thu):');
  testSimpleServiceDates('2481', 6);
  testSimpleServiceDates('2479', 6);
  
  console.log('\n🔧 Service Area 2 (Tue/Fri):');
  testSimpleServiceDates('2482', 6);
  testSimpleServiceDates('2483', 6);
  testSimpleServiceDates('2489', 6);
  
  console.log('\n🔧 Service Area 3 (Wed/Sat):');
  testSimpleServiceDates('2478', 6);
  testSimpleServiceDates('2477', 6);
}

main();