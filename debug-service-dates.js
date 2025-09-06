// Debug service date generation for all postcodes
require('dotenv').config({ path: '.env.local' });

// Mock the scheduling utility functions
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

function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function isServiceDay(postcode, date) {
  const route = getRouteByPostcode(postcode);
  if (!route) return false;
  
  const dayName = getDayName(date);
  return route.serviceDays.includes(dayName);
}

function debugServiceDates(postcode, maxDates = 7) {
  const route = getRouteByPostcode(postcode);
  if (!route) {
    console.log(`❌ Postcode ${postcode} not supported`);
    return;
  }
  
  console.log(`\n🔍 Testing ${postcode} (${route.areaName}): ${route.serviceDays.join(' & ')}`);
  
  const dates = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  // Same logic as your code
  let startDate = new Date(now);
  if (currentHour >= 17) { // After 5pm
    startDate.setDate(now.getDate() + 2);
  } else {
    startDate.setDate(now.getDate() + 1);
  }
  
  console.log(`   Starting from: ${startDate.toLocaleDateString()} (current hour: ${currentHour})`);
  
  const maxDaysToCheck = 42;
  let daysChecked = 0;
  
  while (dates.length < maxDates && daysChecked < maxDaysToCheck) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + daysChecked);
    
    if (isServiceDay(postcode, checkDate)) {
      const dayName = getDayName(checkDate);
      dates.push({
        date: checkDate,
        dayName,
        dateString: checkDate.toLocaleDateString('en-AU')
      });
    }
    
    daysChecked++;
  }
  
  console.log(`   Found ${dates.length} service dates:`);
  dates.forEach((date, index) => {
    console.log(`   ${index + 1}. ${date.dayName} ${date.dateString}`);
  });
  
  // Check for alternation issues
  const dayNames = dates.map(d => d.dayName);
  const expectedPattern = route.serviceDays;
  
  console.log(`   Day pattern: [${dayNames.join(', ')}]`);
  console.log(`   Expected alternation: ${expectedPattern[0]} → ${expectedPattern[1]} → ${expectedPattern[0]} → ${expectedPattern[1]}...`);
  
  // Check if it's alternating properly
  let isAlternating = true;
  for (let i = 0; i < dayNames.length; i++) {
    const expectedDay = expectedPattern[i % 2];
    if (dayNames[i] !== expectedDay) {
      isAlternating = false;
      console.log(`   ❌ Pattern break at position ${i + 1}: Expected ${expectedDay}, got ${dayNames[i]}`);
    }
  }
  
  if (isAlternating) {
    console.log(`   ✅ Alternation is correct`);
  }
  
  return dates;
}

async function main() {
  console.log('🚀 Debugging Service Date Generation');
  console.log('=====================================');
  
  const today = new Date();
  console.log(`Today: ${today.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  console.log(`Current time: ${today.toLocaleTimeString('en-AU')}`);
  
  // Test all postcodes
  const postcodes = ['2481', '2482', '2478', '2479', '2483', '2489', '2477'];
  
  for (const postcode of postcodes) {
    debugServiceDates(postcode, 7);
  }
  
  console.log('\n🔍 Summary of Issues Found:');
  console.log('- Check if dates are starting too far in the future');
  console.log('- Check if alternation pattern is being followed');
  console.log('- Check if consistent number of dates are shown');
}

main();