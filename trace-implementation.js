// Trace the exact implementation logic step by step
require('dotenv').config({ path: '.env.local' });

function getRouteByPostcode(postcode) {
  const MOBILE_ROUTES = [
    { postcode: '2481', serviceDays: ['Monday', 'Thursday'], maxSlotsPerDay: 5, areaName: 'Byron Bay' },
    { postcode: '2482', serviceDays: ['Tuesday', 'Friday'], maxSlotsPerDay: 5, areaName: 'Mullumbimby' },
    { postcode: '2478', serviceDays: ['Wednesday', 'Saturday'], maxSlotsPerDay: 5, areaName: 'Ballina' }
  ];
  return MOBILE_ROUTES.find(route => route.postcode === postcode);
}

async function traceImplementation(postcode) {
  console.log(`\n🔍 TRACING IMPLEMENTATION FOR ${postcode}`);
  console.log('=' .repeat(50));
  
  const route = getRouteByPostcode(postcode);
  console.log(`Route: ${route.areaName} (${route.serviceDays.join(', ')})`);
  
  const dates = [];
  const maxDates = 6;
  const now = new Date();
  
  // Step 1: Start date
  let searchStartDate = new Date(now);
  searchStartDate.setDate(now.getDate() + 1);
  console.log(`\n📅 Step 1 - Start Date: ${searchStartDate.toLocaleDateString()} (${searchStartDate.toLocaleDateString('en-US', {weekday: 'long'})})`);
  
  // Step 2: Service day detection
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const serviceDayIndices = route.serviceDays.map(day => dayNames.indexOf(day));
  
  const tomorrowDayIndex = searchStartDate.getDay();
  let alternatingIndex = 0;
  
  if (serviceDayIndices.includes(tomorrowDayIndex)) {
    alternatingIndex = serviceDayIndices.indexOf(tomorrowDayIndex);
    console.log(`\n🎯 Step 2 - Tomorrow IS a service day! Starting with ${dayNames[tomorrowDayIndex]} (index ${alternatingIndex})`);
  } else {
    alternatingIndex = 0;
    console.log(`\n🎯 Step 2 - Tomorrow (${dayNames[tomorrowDayIndex]}) is NOT a service day. Starting with ${route.serviceDays[0]} (index ${alternatingIndex})`);
  }
  
  // Step 3: Date generation loop
  console.log(`\n🔄 Step 3 - Starting date generation loop:`);
  console.log(`   Service day indices: [${serviceDayIndices.join(', ')}] = [${serviceDayIndices.map(i => dayNames[i]).join(', ')}]`);
  
  let currentDate = new Date(searchStartDate);
  let loopCounter = 0;
  
  for (let week = 0; week < 10 && dates.length < maxDates; week++) {
    console.log(`\n   📆 WEEK ${week}:`);
    
    for (let dayInWeek = 0; dayInWeek < 2 && dates.length < maxDates; dayInWeek++) {
      loopCounter++;
      const targetDayIndex = serviceDayIndices[alternatingIndex];
      const targetDayName = dayNames[targetDayIndex];
      
      console.log(`\n      🎯 Loop ${loopCounter} - Looking for ${targetDayName} (index ${targetDayIndex})`);
      console.log(`         Starting search from: ${currentDate.toLocaleDateString()}`);
      
      // Find next occurrence
      let searchDate = new Date(currentDate);
      let daysToAdd = 0;
      let foundDate = null;
      
      while (daysToAdd < 14) {
        const testDate = new Date(searchDate);
        testDate.setDate(searchDate.getDate() + daysToAdd);
        
        if (testDate.getDay() === targetDayIndex && testDate >= searchStartDate) {
          foundDate = testDate;
          console.log(`         ✅ Found ${targetDayName} ${foundDate.toLocaleDateString()} (after ${daysToAdd} days)`);
          break;
        }
        daysToAdd++;
      }
      
      if (foundDate) {
        dates.push({
          date: foundDate,
          dayName: targetDayName,
          dateString: foundDate.toLocaleDateString()
        });
        
        // Update currentDate
        currentDate = new Date(foundDate);
        currentDate.setDate(foundDate.getDate() + 1);
        console.log(`         📍 Next search will start from: ${currentDate.toLocaleDateString()}`);
      } else {
        console.log(`         ❌ Could not find ${targetDayName} within 14 days!`);
      }
      
      // Alternate
      alternatingIndex = (alternatingIndex + 1) % 2;
      console.log(`         🔄 Next target: ${dayNames[serviceDayIndices[alternatingIndex]]}`);
    }
    
    if (dates.length >= maxDates) {
      console.log(`\n   ✅ Reached target of ${maxDates} dates, stopping loop`);
      break;
    }
  }
  
  console.log(`\n📋 FINAL RESULT - Found ${dates.length} dates:`);
  dates.forEach((date, index) => {
    console.log(`   ${index + 1}. ${date.dayName} ${date.dateString}`);
  });
  
  return dates;
}

async function main() {
  const today = new Date();
  console.log('📅 Current Context:');
  console.log(`Today: ${today.toLocaleDateString()} (${today.toLocaleDateString('en-US', {weekday: 'long'})})`);
  console.log(`Tomorrow: ${new Date(today.getTime() + 24*60*60*1000).toLocaleDateString()} (${new Date(today.getTime() + 24*60*60*1000).toLocaleDateString('en-US', {weekday: 'long'})})`);
  
  // Test the most problematic postcodes
  await traceImplementation('2481'); // Mon/Thu - missing Thu 11th
  await traceImplementation('2482'); // Tue/Fri - starting late  
  await traceImplementation('2478'); // Wed/Sat - starting late
}

main().catch(console.error);