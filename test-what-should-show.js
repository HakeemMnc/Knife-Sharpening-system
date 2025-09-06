// Test what should show for each postcode starting from tomorrow
require('dotenv').config({ path: '.env.local' });

function getRouteByPostcode(postcode) {
  const MOBILE_ROUTES = [
    { postcode: '2481', serviceDays: ['Monday', 'Thursday'], maxSlotsPerDay: 5, areaName: 'Byron Bay' },
    { postcode: '2482', serviceDays: ['Tuesday', 'Friday'], maxSlotsPerDay: 5, areaName: 'Mullumbimby' },
    { postcode: '2478', serviceDays: ['Wednesday', 'Saturday'], maxSlotsPerDay: 5, areaName: 'Ballina' }
  ];
  return MOBILE_ROUTES.find(route => route.postcode === postcode);
}

function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function main() {
  const today = new Date(); // Thursday Sept 4th
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Friday Sept 5th
  
  console.log('🗓️  Today:', today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }));
  console.log('🗓️  Tomorrow:', tomorrow.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }));
  console.log('');
  
  const postcodes = ['2481', '2482', '2478'];
  
  postcodes.forEach(postcode => {
    const route = getRouteByPostcode(postcode);
    const tomorrowDay = getDayName(tomorrow);
    const isServiceDayTomorrow = route.serviceDays.includes(tomorrowDay);
    
    console.log(`📍 ${postcode} (${route.areaName}): ${route.serviceDays.join(' & ')}`);
    console.log(`   Tomorrow (${tomorrowDay}) is service day: ${isServiceDayTomorrow ? '✅ YES' : '❌ NO'}`);
    
    if (isServiceDayTomorrow) {
      console.log(`   🎯 Should START with: ${tomorrowDay} ${tomorrow.toLocaleDateString('en-AU')}`);
    } else {
      // Find next service day after tomorrow
      let nextDate = new Date(tomorrow);
      let found = false;
      
      for (let i = 1; i <= 7; i++) {
        nextDate.setDate(tomorrow.getDate() + i);
        const dayName = getDayName(nextDate);
        
        if (route.serviceDays.includes(dayName)) {
          console.log(`   🎯 Should START with: ${dayName} ${nextDate.toLocaleDateString('en-AU')}`);
          found = true;
          break;
        }
      }
    }
    console.log('');
  });
}

main();